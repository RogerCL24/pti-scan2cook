import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../lib/db.js";
import { analyzeReceipt } from "../services/ocr/googleVision.js"; // nueva función OCR

const router = express.Router();

// Carpeta donde guardar temporalmente las imágenes
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurar multer para guardar en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Endpoint principal del OCR
router.post("/receipt", upload.single("image"), async (req, res) => {
  try {
    const imagePath = path.join(uploadDir, req.file.filename);
    const text = await analyzeReceipt(imagePath);

    // Simular usuario logueado (temporal)
    const userId = 1;

    // Guardar ticket en la base de datos
    const insertQuery = `
      INSERT INTO tickets (user_id, image_path, raw_text, processed)
      VALUES ($1, $2, $3, false)
      RETURNING id, created_at;
    `;
    const result = await pool.query(insertQuery, [userId, imagePath, text]);

    res.json({
      success: true,
      ticket: {
        id: result.rows[0].id,
        user_id: userId,
        image_path: imagePath,
        created_at: result.rows[0].created_at,
      },
      text,
    });
  } catch (err) {
    console.error("❌ Error procesando ticket:", err);
    res.status(500).json({ error: "OCR_FAILED", details: err.message });
  }
});

export default router;
