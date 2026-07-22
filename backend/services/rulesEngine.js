// Deterministic, hard-coded checks for Objective facts we can extract reliably (numbers, durations). These don't rely on LLM judgment at
// all, this is intentional. LLMs can misjudge or hallucinate risk levels, but "deposit = 12 months rent" is a fact we can check with
// simple logic. Vector search + LLM handle the more subjective /ambiguous language elsewhere.

export function runRuleChecks(structuredClauses, monthlyRent) {
  const flags = [];
  const depositText = structuredClauses.securityDeposit || "";

  // --- Security deposit check ---
  // LLM may return the deposit in two forms:
  //  a) a relative form like "6 months' rent" -> can read the
  //     multiplier directly, no need to divide by monthlyRent
  //  b) an absolute rupee amount like "Rs. 150000" -> need to
  //     divide by monthlyRent to get the months-equivalent
  const monthsPhraseMatch = depositText.match(/(\d+)\s*month/i);
  let monthsEquivalent = null;

  if (monthsPhraseMatch) {
    monthsEquivalent = parseInt(monthsPhraseMatch[1], 10);
  } else {
    const rupeeMatch = depositText.match(/(\d{3,})/); // 3+ digit number = likely a currency amount, not a small multiplier
    if (rupeeMatch && monthlyRent) {
      monthsEquivalent = parseInt(rupeeMatch[1], 10) / monthlyRent;
    }
  }

  if (monthsEquivalent !== null && monthsEquivalent > 3) {
    flags.push({
      category: "security_deposit",
      riskLevel: monthsEquivalent > 6 ? "high" : "medium",
      plainLanguageExplanation: `Security deposit is approximately ${monthsEquivalent.toFixed(
        1
      )}x your monthly rent, above the typical 2-3 month norm.`,
      source: "rule_engine",
    });
  }

  // Separately flag non-refundable deposits regardless of amount —
  // this is a distinct risk from the amount itself.
  if (/non-refundable|not refundable|no refund/i.test(depositText)) {
    flags.push({
      category: "security_deposit",
      riskLevel: "high",
      plainLanguageExplanation:
        "The security deposit is stated as non-refundable, which is unusual — deposits are typically refundable minus legitimate deductions for damage.",
      source: "rule_engine",
    });
  }

  // --- Notice period asymmetry / missing check ---
  const tenantNoticeRaw = structuredClauses.noticePeriodTenant;
  const landlordNoticeRaw = structuredClauses.noticePeriodLandlord;
  const tenantNotice = parseInt(tenantNoticeRaw?.match(/(\d+)/)?.[1] || "0", 10);
  const landlordNotice = parseInt(landlordNoticeRaw?.match(/(\d+)/)?.[1] || "0", 10);

  if (tenantNotice > 0 && (!landlordNoticeRaw || landlordNoticeRaw === "null" || landlordNotice === 0)) {
    flags.push({
      category: "notice_period",
      riskLevel: "medium",
      plainLanguageExplanation:
        "The landlord's notice period isn't clearly specified in the agreement, while the tenant's is. Make sure this is clarified before signing — an unspecified landlord notice period can be one-sided.",
      source: "rule_engine",
    });
  } else if (tenantNotice > 0 && landlordNotice > 0 && tenantNotice > landlordNotice * 2) {
    flags.push({
      category: "notice_period",
      riskLevel: "high",
      plainLanguageExplanation: `Notice period is one-sided: you must give ${tenantNoticeRaw} but landlord only needs to give ${landlordNoticeRaw}.`,
      source: "rule_engine",
    });
  }

  // --- Lock-in period check ---
  const lockInMonths = parseInt(
    structuredClauses.lockInPeriod?.match(/(\d+)/)?.[1] || "0",
    10
  );
  if (lockInMonths >= 9) {
    flags.push({
      category: "lock_in_period",
      riskLevel: lockInMonths > 18 ? "high" : lockInMonths >= 12 ? "medium" : "low",
      plainLanguageExplanation: `Lock-in / minimum stay period of ${lockInMonths} months — check if early exit is allowed and what it costs before signing.`,
      source: "rule_engine",
    });
  }

  // --- Early termination penalty / forfeiture check ---
  const penaltyText = structuredClauses.earlyTerminationPenalty || "";
  if (penaltyText && penaltyText !== "null") {
    const isForfeiture = /forfeit|lose|lost|penalty|deduct/i.test(penaltyText);
    flags.push({
      category: "lock_in_period",
      riskLevel: isForfeiture ? "high" : "medium",
      plainLanguageExplanation: `There's a financial penalty for leaving early: ${penaltyText}. Factor this into your decision if your plans might change before the lock-in period ends.`,
      source: "rule_engine",
    });
  }

  return flags;
}