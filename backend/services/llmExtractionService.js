import Groq from "groq-sdk";

// creating the client lazily (inside a function) instead of at the top of the file.
// Building it lazily ensures dotenv has already loaded .env by the time this function actually runs.
let groq = null;
function getGroqClient() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

// The LLM's work here is pulling clause text out of messy OCR output and separately, generating plain language explanations. 
// It is NOT used to decide risk levels ,it was handled by rules engine + vector search.

export async function extractStructuredClauses(rawText) {
  const prompt = `You are extracting structured information from a rental agreement's raw OCR text. The text may contain OCR errors/typos - use context to interpret correctly.

Extract the following fields as JSON only, no markdown, no preamble:
{
  "securityDeposit": "amount and terms as stated, or null if not found",
  "noticePeriodTenant": "notice period the TENANT must give specifically to END/TERMINATE the tenancy early (not payment default notices, not any other kind of notice), or null if not explicitly stated",
  "noticePeriodLandlord": "notice period the LANDLORD must give specifically to END/TERMINATE the tenancy or evict the tenant for non-default reasons (not payment default notices, not rent revision notices, not inspection notices), or null if not explicitly stated",
  "lockInPeriod": "lock-in duration, or null",
  "earlyTerminationPenalty": "any penalty, forfeiture, or financial consequence for terminating before the lock-in/minimum period ends, or null if none stated",
  "maintenanceResponsibility": "who handles maintenance, or null",
  "rentIncreaseClause": "rent increase terms, or null",
  "renewalTerms": "renewal terms, or null",
  "monthlyRent": "numeric monthly rent amount only, or null"
}

Be strict: only fill noticePeriodTenant/noticePeriodLandlord if the agreement explicitly ties that notice period to ENDING the tenancy. Do not use notice periods related to rent payment defaults, rent revisions, or property inspections for these fields — leave them null instead.

Raw agreement text:
"""
${rawText}
"""

Respond with ONLY the JSON object.`;

  const completion = await getGroqClient().chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1, // low temperature for consistent structured extraction
  });

  const responseText = completion.choices[0].message.content.trim();
  const cleaned = responseText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Failed to parse LLM extraction response as JSON");
  }
}

export async function generatePlainLanguageSummary(flaggedClauses) {
  if (flaggedClauses.length === 0) {
    return "No significant risk flags were found in this agreement based on our analysis.";
  }
  const clauseList = flaggedClauses
    .map((c) => `- [${c.riskLevel.toUpperCase()}] ${c.category}: ${c.plainLanguageExplanation}`)
    .join("\n");

  const prompt = `You are explaining rental agreement risks to someone with no legal background. Given these flagged issues, write a short, friendly 4-5 sentence overall summary (not a list, prose) of the main concerns and what the tenant should pay attention to before signing. Do not repeat the raw list format, synthesize it.

Flagged issues:
${clauseList}

Respond with only the summary text, no preamble.`;

  const completion = await getGroqClient().chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
  });
  return completion.choices[0].message.content.trim();
}

export async function answerAgreementQuestion(agreement, userMessage, history) {
  const contextSummary = `
RAW AGREEMENT TEXT: ${agreement.rawExtractedText?.slice(0, 6000) || "Not available"}

EXTRACTED KEY DETAILS: ${JSON.stringify(agreement.structuredClauses, null, 2)}

FLAGGED RISKS FOUND:
${agreement.flaggedClauses?.map((f) => `- [${f.riskLevel}] ${f.category}: ${f.plainLanguageExplanation}`).join("\n") || "None"}
`;

  const systemPrompt = `You are a helpful assistant answering questions ONLY about the specific rental agreement provided below. 

Rules:
- Only answer based on the document content and analysis given. Do not give general legal advice beyond what's in this document.
- If the answer isn't in the document, say so clearly — don't guess or make up clauses.
- Keep answers concise and in plain language, 2-4 sentences unless the user asks for more detail.
- If asked something totally unrelated to this agreement, politely redirect to agreement-related questions.

${contextSummary}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6), // keep last 6 turns for context, avoid token bloat
    { role: "user", content: userMessage },
  ];
  const completion = await getGroqClient().chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
  });

  return completion.choices[0].message.content.trim();
}