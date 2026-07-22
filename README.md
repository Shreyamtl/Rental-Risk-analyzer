# Rental Agreement Risk Analyzer

This is an AI assisted tool that analyzes rental agreements (image or PDF) and flags risky or unusual clauses in plain language, using a hybrid of deterministic rules, semantic vector search, and LLM based extraction.

## Overview

Most "AI contract review" tools work by feeding a document to an LLM and trusting whatever it returns. This project deliberately doesn't do that. Risk detection is split across three independent layers so that no single point of failure ,including LLM hallucination , determines the final risk verdict:

1. **LLM (Groq / Llama 3.3)** — handles extraction and language tasks only: pulling structured fields out of raw OCR text, and generating plain-language summaries. It never decides what counts as risky.
2. **Deterministic rules engine** — checks objective, numeric facts (deposit-to-rent ratio, notice period asymmetry, lock-in duration, early termination penalties) with plain logic. No hallucination risk.
3. **Vector similarity search** — extracted clauses are embedded locally and compared against a curated database of known risky clause patterns using cosine similarity, catching risky language even when it's phrased differently than the hard-coded rules expect.

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


## Setup

# Backend
```
cd backend
npm install
# add MongoDB URI, Groq API key, JWT secretin .env
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
