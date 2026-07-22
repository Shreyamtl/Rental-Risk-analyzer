// Generates vector embeddings for clause text using a small local
// sentence-transformer model (via @xenova/transformers, runs on CPU,
// no external API calls or cost). This is what powers our semantic
// similarity search against the curated risky-clause database.

import { pipeline } from "@xenova/transformers";

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    // all-MiniLM-L6-v2: 384-dim embeddings, small & fast, good for short clause-level text matching.
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

export async function generateEmbedding(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data); // 384-length float array
}

export function cosineSimilarity(vecA, vecB) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
