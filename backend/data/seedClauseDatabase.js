// Run with: npm run seed
// This populates the ClausePattern collection with hand-curated
// examples of known problematic rental clauses. This curated dataset
// is the core "domain knowledge" of the project — the vector search
// matches new agreements against these patterns.

import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import ClausePattern from "../models/ClausePattern.js";
import { generateEmbedding } from "../services/embeddingService.js";

dotenv.config();

const curatedPatterns = [
  {
    category: "security_deposit",
    patternText:
      "Tenant must pay a security deposit equal to 10 months rent or more before moving in.",
    riskLevel: "high",
    explanation:
      "Deposits above 2-3 months' rent are unusually high and can trap a large amount of your money with the landlord for the tenancy duration.",
  },
  {
    category: "security_deposit",
    patternText:
      "Security deposit will be non-refundable under any circumstances at end of tenancy.",
    riskLevel: "high",
    explanation:
      "A blanket non-refundable deposit clause is a major red flag; deposits should be refundable minus legitimate deductions for damage.",
  },
  {
    category: "notice_period",
    patternText:
      "Landlord may terminate the agreement with 7 days written notice, while tenant must give 60 days notice to vacate.",
    riskLevel: "high",
    explanation:
      "This is a one-sided notice period that heavily favors the landlord, leaving the tenant little time to find alternate housing.",
  },
  {
    category: "notice_period",
    patternText:
      "Either party may terminate the lease with 30 days written notice.",
    riskLevel: "low",
    explanation:
      "Equal notice periods for both parties are standard and fair.",
  },
  {
    category: "lock_in_period",
    patternText:
      "Tenant is locked in for 24 months and must pay full remaining rent if vacating early, regardless of reason.",
    riskLevel: "high",
    explanation:
      "Long lock-in periods with no exit clause (e.g. job relocation, emergencies) can be financially punishing and are often negotiable.",
  },
  {
    category: "lock_in_period",
    patternText:
      "Lock-in period of 6 months, after which tenant may leave with standard notice.",
    riskLevel: "low",
    explanation:
      "A short, standard lock-in period is common and generally reasonable.",
  },
  {
    category: "maintenance",
    patternText:
      "Tenant is responsible for all repairs and maintenance including structural issues, plumbing, and electrical faults.",
    riskLevel: "high",
    explanation:
      "Structural and major repair costs are typically the landlord's responsibility; shifting this entirely to the tenant is unusual and costly.",
  },
  {
    category: "maintenance",
    patternText:
      "Landlord is responsible for major repairs; tenant handles minor day-to-day upkeep.",
    riskLevel: "low",
    explanation:
      "This is the standard, fair division of maintenance responsibility.",
  },
  {
    category: "rent_increase",
    patternText:
      "Landlord may increase rent at any time at their sole discretion without prior notice.",
    riskLevel: "high",
    explanation:
      "Rent increases should have defined limits (e.g. annual, capped percentage) and advance notice; unrestricted increases create financial uncertainty.",
  },
  {
    category: "rent_increase",
    patternText:
      "Rent will increase by 5% annually upon renewal, with 30 days advance notice.",
    riskLevel: "low",
    explanation:
      "A capped, predictable annual increase with notice is standard practice.",
  },
  {
    category: "termination",
    patternText:
      "Landlord may enter and inspect the property at any time without prior notice to the tenant.",
    riskLevel: "medium",
    explanation:
      "Landlords should generally provide reasonable advance notice (e.g. 24-48 hours) before entering, except emergencies.",
  },
  {
    category: "utilities",
    patternText:
      "Tenant must pay a fixed utility charge regardless of actual usage, with no metering.",
    riskLevel: "medium",
    explanation:
      "Flat unmetered utility charges can be unfair if usage varies; metered billing is more transparent.",
  },
  {
    category: "subletting",
    patternText:
      "Any violation of any clause results in immediate forfeiture of entire security deposit.",
    riskLevel: "high",
    explanation:
      "Broad forfeiture clauses covering any and all violations, however minor, are disproportionate and often unenforceable.",
  },
  {
    category: "lock_in_period",
    patternText:
      "If tenant terminates the lease before the minimum stay period, they forfeit the security deposit or pay a penalty equivalent to months of rent.",
    riskLevel: "high",
    explanation:
      "Forfeiting your deposit for leaving early is a significant financial penalty — consider whether your circumstances might require flexibility before agreeing to this.",
  },
  {
    category: "subletting",
    patternText: "Tenant may not keep any pets without landlord's prior written consent, and is fully liable for any pet damage.",
    riskLevel: "low",
    explanation: "Standard pet policy clause — reasonable as long as consent isn't unreasonably withheld.",
  },
  {
    category: "other",
    patternText: "Tenant must pay brokerage or agent fees in addition to rent and deposit, with no cap specified.",
    riskLevel: "medium",
    explanation: "Uncapped brokerage fees can add unexpected cost — clarify the exact amount before signing.",
  },
  {
    category: "security_deposit",
    patternText: "Security deposit does not earn any interest and landlord may commingle it with personal funds.",
    riskLevel: "medium",
    explanation: "Some jurisdictions require deposits to be held separately or earn interest — check local rent laws.",
  },
  {
    category: "termination",
    patternText: "Landlord reserves the right to unilaterally change any term of this agreement upon written notice.",
    riskLevel: "high",
    explanation: "A clause allowing unilateral changes to any term is highly one-sided and may not be enforceable — flag this for legal review.",
  },
  {
    category: "maintenance",
    patternText: "Tenant is responsible for painting and whitewashing the entire premises before vacating, at their own cost.",
    riskLevel: "medium",
    explanation: "Painting/whitewashing costs at move-out are common but should be reasonable and proportional, not a blanket full-property repaint.",
  },
  {
    category: "rent_increase",
    patternText: "Rent will automatically increase by an unspecified amount at landlord's discretion upon each renewal.",
    riskLevel: "high",
    explanation: "Renewal terms without a defined increase cap leave you exposed to unpredictable rent hikes.",
  },
  {
    category: "utilities",
    patternText: "Tenant must pay a share of society/building maintenance charges as determined solely by the landlord.",
    riskLevel: "medium",
    explanation: "Maintenance charges should ideally be tied to actual society bills, not an arbitrary landlord-set amount.",
  },
  {
    category: "other",
    patternText: "Tenant indemnifies landlord against all claims, damages, and liabilities arising from any cause during the tenancy.",
    riskLevel: "medium",
    explanation: "Broad indemnity clauses can expose tenants to liability beyond their control — worth having reviewed by a lawyer.",
  },
  {
    category: "termination",
    patternText: "Landlord may repossess the premises immediately without court process if rent is delayed by even one day.",
    riskLevel: "high",
    explanation: "Immediate repossession without due legal process is generally not enforceable and is a major red flag.",
  },
  {
    category: "notice_period",
    patternText: "Tenant must provide 90 days notice to vacate while landlord can ask tenant to leave with 15 days notice.",
    riskLevel: "high",
    explanation: "A large asymmetry in notice periods heavily favors the landlord and limits your ability to plan a move.",
  },
  {
    category: "maintenance",
    patternText: "Any damage found at move-out, however minor, results in forfeiture of the entire security deposit.",
    riskLevel: "high",
    explanation: "Deposit forfeiture should be proportional to actual damage cost, not an all-or-nothing clause for minor issues.",
  },
  {
    category: "lock_in_period",
    patternText: "No lock-in period; either party may terminate with standard notice at any time.",
    riskLevel: "low",
    explanation: "No lock-in gives both parties flexibility — this is tenant-friendly.",
  },
];

async function seed() {
  await connectDB();
  console.log("Clearing existing clause patterns...");
  await ClausePattern.deleteMany({});

  console.log("Generating embeddings and inserting patterns...");
  for (const pattern of curatedPatterns) {
    const embedding = await generateEmbedding(pattern.patternText);
    await ClausePattern.create({ ...pattern, embedding });
    console.log(`Inserted: ${pattern.category} (${pattern.riskLevel})`);
  }

  console.log(`Done. Seeded ${curatedPatterns.length} clause patterns.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});