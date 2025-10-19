import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
dotenv.config();

const vertex = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID,
  location: "us-central1"
});

const model = vertex.getGenerativeModel({
  model: "gemini-2.0-flash-lite"
});

export async function parseWithGemini(rawText) {
  const prompt = `
Analiza este ticket de supermercado y devuelve **solo** un JSON válido, sin ningún formato adicional como Markdown (sin \`\`\`json o \`\`\`). El JSON debe tener la siguiente estructura:
[
  { "name": string, "quantity": number|null, "category": string|null }
]
Incluye solo nombres de productos, sin precios, totales ni líneas de pago. Asegúrate de que el resultado sea un JSON puro y válido que pueda ser procesado por JSON.parse().
Texto:
${rawText}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Log the raw response for debugging
    console.log("Raw Gemini response:", text);
    
    // Clean the response to remove Markdown or other non-JSON content
    text = text
      .replace(/```(?:json)?/g, "")    // Remove ``` or ```json fences
      .replace(/^\s+|\s+$/g, "") // Trim whitespace at start and end
      .trim();
    
    // Validate that we have a non-empty string
    if (!text) {
      throw new Error("Empty or invalid response from Gemini");
    }

    // Parse the cleaned text as JSON
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error("❌ Error en Gemini parser:", err);
    return { error: "GEMINI_PARSE_FAILED", details: err.message };
  }
}