import mongoose from "mongoose";

// stores known problematic rental clause patterns with their vector embeddings. so that semantic similarity search will be done against clauses extracted from a
// user-uploaded agreement, instead of relying purely on LLM judgment.
const clausePatternSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "security_deposit",
        "notice_period",
        "lock_in_period",
        "maintenance",
        "rent_increase",
        "termination",
        "utilities",
        "subletting",
        "other",
      ],
    },
    patternText: {
      type: String,
      required: true, // e.g. "Landlord can terminate with 7 days notice, tenant must give 60 days"
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    explanation: {
      type: String,
      required: true, // plain language reason this is risky
    },
    embedding: {
      type: [Number], // vector embedding of patternText
      required: true,
    },
  },
  { timestamps: true }
);

// NOTE: For MongoDB Atlas Vector Search, create a search index named
// "clause_vector_index" on the `embedding` field via Atlas UI/CLI:
// {
//   "fields": [{
//     "type": "vector",
//     "path": "embedding",
//     "numDimensions": 384,
//     "similarity": "cosine"
//   }]
// }

export default mongoose.model("ClausePattern", clausePatternSchema);
