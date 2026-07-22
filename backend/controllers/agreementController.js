import Agreement from "../models/Agreement.js";
import { extractTextFromFile } from "../services/ocrService.js";
import {
  extractStructuredClauses,
  generatePlainLanguageSummary,
} from "../services/llmExtractionService.js";
import { runRuleChecks } from "../services/rulesEngine.js";
import { matchClauseAgainstPatterns } from "../services/vectorMatchService.js";
import fs from "fs";
import { generateAgreementPDF } from "../services/pdfReportService.js";
import { answerAgreementQuestion } from "../services/llmExtractionService.js";

const RISK_WEIGHTS = { high: 30, medium: 15, low: 5 };

function calculateOverallRiskScore(flags) {
  const raw = flags.reduce((sum, f) => sum + (RISK_WEIGHTS[f.riskLevel] || 0), 0);
  return Math.min(100, raw); 
}

export const analyzeAgreement = async (req, res) => {
  let agreement;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file(s) uploaded" });
    }

    // Creating initial record — store all page filenames
    agreement = await Agreement.create({
      user: req.user._id,
      originalFileName: req.files.map((f) => f.originalname).join(", "),
      status: "processing",
    });

    // 1. OCR extraction — run on each uploaded page in order, then combine into one continuous text block. 
    // Page order matters for a multi-page agreement, so relying on the order the files were uploaded/selected in.
    let rawText = "";
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const pageText = await extractTextFromFile(file.path, file.mimetype);
      rawText += `\n\n--- Page ${i + 1} (${file.originalname}) ---\n${pageText}`;
    }

    // 2. LLM structured extraction (pulls clause fields out of raw text)
    const structured = await extractStructuredClauses(rawText);
    const monthlyRent = parseFloat(structured.monthlyRent) || null;

    // 3. Deterministic rule checks (objective numeric facts)
    const ruleFlags = runRuleChecks(structured, monthlyRent);

    // 4. Vector similarity matching for each extracted clause against the curated risky-clause database
    const clauseFieldsToCheck = [
      "securityDeposit",
      "noticePeriodTenant",
      "noticePeriodLandlord",
      "maintenanceResponsibility",
      "rentIncreaseClause",
      "renewalTerms",
    ];
    const vectorFlags = [];
    for (const field of clauseFieldsToCheck) {
      const text = structured[field];
      if (!text || text === "null") continue;
      const match = await matchClauseAgainstPatterns(text, field);
      if (match.matched) {
        vectorFlags.push({
          extractedText: text,
          category: match.category,
          riskLevel: match.riskLevel,
          matchedPatternId: match.matchedPatternId,
          similarityScore: match.similarityScore,
          plainLanguageExplanation: match.plainLanguageExplanation,
          source: "vector_match",
        });
      }
    }

    const allFlags = [...ruleFlags, ...vectorFlags];
    const overallRiskScore = calculateOverallRiskScore(allFlags);
    const summary = await generatePlainLanguageSummary(allFlags);

    agreement.rawExtractedText = rawText;
    agreement.structuredClauses = structured;
    agreement.flaggedClauses = allFlags;
    agreement.overallRiskScore = overallRiskScore;
    agreement.status = "completed";
    await agreement.save();

    res.json({ agreement, summary });
  } catch (error) {
    console.error("Analysis error:", error);
    if (agreement) {
      agreement.status = "failed";
      await agreement.save();
    }
    res.status(500).json({ error: error.message });
  }finally {
    if (req.files) {
      req.files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (cleanupErr) {
          console.error("Failed to delete file:", cleanupErr);
        }
      });
    }
  }
};

export const getAgreementHistory = async (req, res) => {
  const agreements = await Agreement.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(agreements);
};

export const getAgreementById = async (req, res) => {
  const agreement = await Agreement.findOne({ _id: req.params.id, user: req.user._id });
  if (!agreement) return res.status(404).json({ error: "Not found" });
  res.json(agreement);
};

export const downloadReport = async (req, res) => {
  const agreement = await Agreement.findOne({ _id: req.params.id, user: req.user._id });
  if (!agreement) return res.status(404).json({ error: "Not found" });
  generateAgreementPDF(agreement, res);
};

export const submitFeedback = async (req, res) => {
  const { feedback } = req.body; 
  const agreement = await Agreement.findOne({ _id: req.params.id, user: req.user._id });
  if (!agreement) return res.status(404).json({ error: "Not found" });

  const idx = parseInt(req.params.clauseIndex, 10);
  if (!agreement.flaggedClauses[idx]) return res.status(400).json({ error: "Invalid clause index" });

  agreement.flaggedClauses[idx].feedback = feedback;
  await agreement.save();
  res.json({ success: true });
};

export const chatAboutAgreement = async (req, res) => {
  try {
    const { message, history } = req.body; // history = [{role, content}, ...] previous turns
    const agreement = await Agreement.findOne({ _id: req.params.id, user: req.user._id });
    if (!agreement) return res.status(404).json({ error: "Agreement not found" });

    const answer = await answerAgreementQuestion(agreement, message, history || []);
    res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to answer question" });
  }
};

export const deleteAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, //this ensures user can only delete their own agreements
    });
    if (!agreement) return res.status(404).json({ error: "Agreement not found" });
    res.json({ success: true, message: "Agreement deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete agreement" });
  }
};

