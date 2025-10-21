// services/ocr/parserRegex.js
import { cleanText } from "./cleaner.js";

export function parseWithRegex(rawText) {
  const cleaned = cleanText(rawText);
  const lines = cleaned.split("\n");

  const products = [];

  for (const line of lines) {
    // quitar números, precios y símbolos
    const name = line.replace(/[0-9,.€]+/g, "").trim();
    if (name && name.length > 2 && name.split(" ").length < 6) {
      products.push({ name, quantity: 1, category: null });
    }
  }

  return products;
}
