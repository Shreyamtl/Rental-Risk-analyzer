import PDFDocument from "pdfkit";

export function generateAgreementPDF(agreement, res) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="risk-report-${agreement._id}.pdf"`
  );
  doc.pipe(res); //Send the PDF data directly to the response stream
  doc.font('Times-Roman')
  const mutedRed = "#b91c1c";
  const mutedOrange = "#b47509";
  const mutedGreen = "#15803d";

  doc.fontSize(18).text("Rental Agreement Risk Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).fillColor("gray").text(`File: ${agreement.originalFileName}`);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  function getRiskLevel(score) {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MODERATE";
    return "LOW";
  }

  function getRiskColor(level) {
    if (level === "HIGH") return mutedRed;
    if (level === "MODERATE") return mutedOrange;
    return mutedGreen;
  }
  const overallLevel = getRiskLevel(agreement.overallRiskScore);
  const overallColor = getRiskColor(overallLevel);
  
   doc.fillColor(overallColor).fontSize(14).text(
    `Overall Risk Score: ${agreement.overallRiskScore}/100 - ${overallLevel}`,
    { bold: true }
  );
  doc.moveDown();

  doc.fontSize(12).fillColor("black").text("Extracted Details", { underline: true });
  doc.fontSize(10);
  const details = agreement.structuredClauses || {};
  doc.text(`Security Deposit: ${details.securityDeposit || "Not found"}`);
  doc.text(`Notice Period (Tenant): ${details.noticePeriodTenant || "Not found"}`);
  doc.text(`Notice Period (Landlord): ${details.noticePeriodLandlord || "Not found"}`);
  doc.text(`Lock-in Period: ${details.lockInPeriod || "Not found"}`);
  doc.moveDown();

  doc.fontSize(12).text(`Flagged Clauses (${agreement.flaggedClauses?.length || 0})`, { underline: true });
  doc.moveDown(0.5);

  agreement.flaggedClauses?.forEach((clause, i) => {
    doc.fontSize(10).fillColor("black").text(
      `${i + 1}. [${clause.riskLevel.toUpperCase()}] ${clause.category.replace(/_/g, " ")}`
    );
    doc.fontSize(9).fillColor("gray").text(clause.plainLanguageExplanation, { indent: 15 });
    doc.moveDown(0.5);
  });

  doc.moveDown();
  doc.fontSize(8).fillColor("gray").text(
    "This report is informational only and not a substitute for professional legal advice.",
    { align: "center" }
  );

  doc.end();
}