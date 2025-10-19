// services/ocr/cleaner.js
export function cleanText(rawText) {
  // Normalize input to a string. Google Vision sometimes returns an object
  // like { text: '...' } so handle that and other unexpected types.
  if (rawText == null) return "";

  let text = rawText;
  if (typeof rawText !== "string") {
    if (typeof rawText === "object") {
      if (Array.isArray(rawText)) {
        text = rawText.join("\n");
      } else if (rawText.text && typeof rawText.text === "string") {
        text = rawText.text;
      } else if (rawText.description && typeof rawText.description === "string") {
        // some vision clients return description
        text = rawText.description;
      } else {
        // Fallback: try JSON stringify or toString
        try {
          text = JSON.stringify(rawText);
        } catch (e) {
          text = String(rawText);
        }
      }
    } else {
      text = String(rawText);
    }
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1)
    .filter((line) =>
      !line.match(/total|visa|eur|€|contactless|pagar|operacion|tarjeta|efectivo/i)
    )
    .join("\n");
}
