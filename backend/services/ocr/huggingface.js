import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

/**
 * Analiza la imagen del ticket con Hugging Face API
 * @param {Buffer} imageBuffer - imagen en formato binario (desde multer)
 * @returns {Promise<Object>} resultado estructurado o texto OCR
 */
export async function analyzeReceipt(imageBuffer) {
  try {
    const response = await fetch(`https://huggingface.co/naver-clova-ix/donut-base-finetuned-cord-v1`, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      method: "POST",
      body: imageBuffer,
    });

    if (!response.ok) {
      throw new Error(`Error de HuggingFace: ${response.statusText}`);
    }

    const result = await response.json();

    // Algunos modelos devuelven texto plano dentro de un campo 'generated_text'
    if (result[0]?.generated_text) {
      return { text: result[0].generated_text };
    }

    return result;
  } catch (err) {
    console.error("Error llamando a HuggingFace:", err);
    throw err;
  }
}
