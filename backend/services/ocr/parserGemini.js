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
Eres un asistente que lee tickets de supermercado escritos en ESPAÑOL
y devuelve la lista de productos en un JSON válido.

MUY IMPORTANTE:
- Debes TRADUCIR el nombre del producto al INGLÉS en el campo "name".
- Si quieres, puedes mantener el nombre original en español en "original_name".
- Para cada producto, asigna una categoría según dónde se guarda en casa:
  - "nevera"  → productos que van al frigorífico (lácteos, embutidos, frescos…)
  - "despensa" → productos de armario (arroz, pasta, conservas, snacks…)
  - "congelados" → productos que van al congelador.

Devuelve **EXCLUSIVAMENTE** un JSON válido (sin texto adicional, sin explicaciones).
El formato del JSON debe ser EXACTAMENTE el siguiente:

{
  "products": [
    {
      "name": "whole milk",
      "original_name": "LECHE ENTERA",
      "quantity": 1,
      "category": "nevera"
    }
  ]
}

Reglas:
- "name" SIEMPRE en inglés, pensado como ingrediente de receta (ej: "tomato sauce", "chicken breast").
- "original_name" es opcional, pero si puedes inferirlo del ticket, ponlo (en español tal como viene o ligeramente limpio).
- "quantity": número entero aproximado de unidades de cada producto (si no está claro, usa 1).
- "category": SOLO uno de estos valores: "nevera", "despensa" o "congelados".
- Ignora líneas que sean totales, formas de pago, IVA, descuentos, etc.

A continuación tienes el texto bruto del ticket, entre las marcas <<<TICKET>>> y <<<END>>>:

<<<TICKET>>>
${rawText}
<<<END>>>
`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const candidates = result.response?.candidates || [];
    if (!candidates.length) {
      throw new Error("No candidates returned from Gemini");
    }

    // Unimos todos los trozos de texto de la primera candidata
    let text =
      candidates[0].content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() || "";

    // Limpiar posibles ```json ... ``` del modelo
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    if (!text) {
      throw new Error("Empty or invalid response from Gemini");
    }

    const parsed = JSON.parse(text);

    // Por comodidad, devolvemos siempre un array de productos
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (Array.isArray(parsed.products)) {
      return parsed.products;
    }

    throw new Error("JSON sin campo 'products' válido");
  } catch (err) {
    console.error("❌ Error en Gemini parser:", err);
    return { error: "GEMINI_PARSE_FAILED", details: err.message };
  }
}