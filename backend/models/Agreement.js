import mongoose from "mongoose";

const flaggedClauseSchema = new mongoose.Schema(
  {
    extractedText: String,
    category: String,
    riskLevel: { type: String, enum: ["low", "medium", "high"] },
    matchedPatternId: { type: mongoose.Schema.Types.ObjectId, ref: "ClausePattern" },
    similarityScore: Number, // cosine similarity score from vector search
    plainLanguageExplanation: String,
    source: { type: String, enum: ["vector_match", "rule_engine", "llm_only"] },
    feedback: { type: String, enum: ["helpful", "not_helpful", null], default: null },
  },
  { _id: false }
  
);

const agreementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalFileName: String,
    rawExtractedText: String, // full OCR output
    structuredClauses: {
      securityDeposit: String,
      noticePeriodTenant: String,
      noticePeriodLandlord: String,
      lockInPeriod: String,
      earlyTerminationPenalty: String,
      maintenanceResponsibility: String,
      rentIncreaseClause: String,
      renewalTerms: String,
    },
    flaggedClauses: [flaggedClauseSchema],
    overallRiskScore: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Agreement", agreementSchema);