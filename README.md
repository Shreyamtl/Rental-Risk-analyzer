# Rental Agreement Risk Analyzer

This is an AI assisted tool that analyzes rental agreements (image or PDF) and flags risky or unusual clauses in plain language, using a hybrid of deterministic rules, semantic vector search, and LLM based extraction.

## Overview

Most "AI contract review" tools work by feeding a document to an LLM and trusting whatever it returns. This project deliberately doesn't do that. Risk detection is split across three independent layers so that no single point of failure ,including LLM hallucination , determines the final risk verdict:

1. **LLM (Groq / Llama 3.3)** - handles extraction and language tasks only: pulling structured fields out of raw OCR text, and generating plain-language summaries. It never decides what counts as risky.
2. **Deterministic rules engine** - checks objective, numeric facts (deposit-to-rent ratio, notice period asymmetry, lock-in duration, early termination penalties) with plain logic. No hallucination risk.
3. **Vector similarity search** - extracted clauses are embedded locally and compared against a curated database of known risky clause patterns using cosine similarity, catching risky language even when it's phrased differently than the hard-coded rules expect.

## Features

- OCR pipeline supporting scanned images, text based PDFs, and scanned/image PDFs, with multi page upload
- Structured clause extraction (security deposit, notice periods, lock in, maintenance responsibility, rent escalation, early termination penalties)
- Hybrid risk scoring: rules engine + category restricted vector matching against a curated pattern database
- Interactive chat scoped to the uploaded agreement (RAG-style, answers are grounded only in that document's content)
- Downloadable PDF risk report
- Per clause user feedback (helpful / not helpful) for future accuracy tuning
- JWT authentication, analysis history, dark/light mode

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| OCR | Tesseract.js, pdf-parse, pdf-to-img |
| Embeddings | `@xenova/transformers` (local inference, no per-request API cost) |
| LLM | Groq API (Llama 3.3) — extraction and summarization only |
| Auth | JWT, bcrypt |
| PDF generation | pdfkit |

## Engineering notes

A few non obvious issues surfaced during testing against some agreements , documenting them here because they were more instructive than the initial build:

- **Unit mismatch in deposit calculation** : an extracted value like "6 months' rent" was initially parsed as a raw currency figure and divided by monthly rent, producing an incorrect ratio. Fixed by having the rules engine distinguish relative phrasing ("X months' rent") from absolute currency amounts.
- **Threshold brittleness** — a hard-coded lock-in threshold (`>= 12` months) missed a real agreement with an 11 month lock-in paired with a separate early-termination forfeiture clause, which wasn't being extracted as its own field at all initially.
- **Cross-category false matches in vector search** : clauses were initially compared against the entire pattern database regardless of category, so a notice period clause could weakly match an unrelated rent increase pattern purely because it scored marginally above threshold. Fixed by restricting each extracted field to only search within its corresponding pattern category, and raising the similarity threshold.

## Setup

# Backend
```
cd backend
npm install
# add MongoDB URI, Groq API key, JWT secret in .env
npm run seed    # seeds the curated clause pattern database
npm run dev
```

# Frontend
```
cd frontend
npm install
npm run dev
```
### Environment variables (`backend/.env`)

```
PORT=5000
MONGODB_URI=
GROQ_API_KEY=
JWT_SECRET=
```

## Disclaimer

This tool provides informational analysis only and is not a substitute for professional legal advice.
