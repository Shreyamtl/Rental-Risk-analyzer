// Matches extracted agreement clauses against the curated
// ClausePattern database using cosine similarity. This is the
// semantic-search layer: instead of asking an LLM "is this bad?",
// we check how closely the clause resembles known risky (or known
// safe) patterns we've hand-curated and embedded ahead of time.

import ClausePattern from "../models/ClausePattern.js";
import { generateEmbedding, cosineSimilarity } from "./embeddingService.js";

const SIMILARITY_THRESHOLD = 0.6; // raised slightly to reduce weak/borderline matches

// Maps each structured field we extract to the pattern category it's
// allowed to match against. This prevents a low-confidence match
// leaking into a completely unrelated category (e.g. a notice-period
// clause being labeled as "rent_increase" just because it was the
// closest of all 14 patterns, even at low similarity).
const FIELD_TO_CATEGORY = {
  securityDeposit: "security_deposit",
  noticePeriodTenant: "notice_period",
  noticePeriodLandlord: "notice_period",
  earlyTerminationPenalty: "lock_in_period",
  maintenanceResponsibility: "maintenance",
  rentIncreaseClause: "rent_increase",
  renewalTerms: "other",
};

export async function matchClauseAgainstPatterns(clauseText, fieldName) {
  const clauseEmbedding = await generateEmbedding(clauseText);

  const restrictCategory = FIELD_TO_CATEGORY[fieldName];
  const query = restrictCategory ? { category: restrictCategory } : {};
  const allPatterns = await ClausePattern.find(query);

  let bestMatch = null;
  let bestScore = -1;

  for (const pattern of allPatterns) {
    const score = cosineSimilarity(clauseEmbedding, pattern.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (bestMatch && bestScore >= SIMILARITY_THRESHOLD) {
    return {
      matched: true,
      similarityScore: bestScore,
      category: bestMatch.category,
      riskLevel: bestMatch.riskLevel,
      plainLanguageExplanation: bestMatch.explanation,
      matchedPatternId: bestMatch._id,
      source: "vector_match",
    };
  }

  return { matched: false, similarityScore: bestScore };
}