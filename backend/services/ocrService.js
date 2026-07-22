import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";
import fs from "fs";

export async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    if (data.text && data.text.trim().length > 50) {
      return data.text; // text-based PDF, no OCR needed
    }
    // Fall through to OCR if PDF has little/no extractable text
    // (i.e. it's a scanned image PDF) — not handled in this basic
    // version, would need pdf-to-image conversion first.
    throw new Error(
      "PDF appears to be scanned/image-based. Please upload as image (JPG/PNG) instead."
    );
  }

  // Image file — run OCR
  const {
    data: { text },
  } = await Tesseract.recognize(filePath, "eng", {
    logger: () => {}, // suppress verbose progress logs
  });

  return text;
}
