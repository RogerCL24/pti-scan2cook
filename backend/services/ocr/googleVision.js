import vision from "@google-cloud/vision";

// Crea el cliente con las credenciales del JSON
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Analiza una imagen de ticket local y devuelve el texto reconocido
 */
export async function analyzeReceipt(localPath) {
  try {
    const [result] = await client.textDetection(localPath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      console.log("🧾 Vision API: no text detected");
      return "";
    }

    // El primer elemento es el texto completo reconocido
    const fullText = detections[0].description || "";

    console.log("🧾 Texto detectado por Vision API:", fullText.substring(0, 120));

    return fullText;
  } catch (err) {
    console.error("❌ Error en Google Vision API:", err);
    throw err;
  }
}
