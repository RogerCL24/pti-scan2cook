import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../lib/db.js";
import { analyzeReceipt } from "../services/ocr/googleVision.js";
import { parseWithRegex } from "../services/ocr/parserRegex.js";
import { parseWithGemini } from "../services/ocr/parserGemini.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * 1️⃣ Endpoint OCR base con Google Vision (guarda ticket en BD)
 */
router.post("/vision", upload.single("image"), async (req, res) => {
  try {
    const imagePath = path.join(uploadDir, req.file.filename);
    const text = await analyzeReceipt(imagePath);
    const userId = 1; // temporal

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

/**
 * 2️⃣ OCR + Parser Regex
 */
router.post("/regex", upload.single("image"), async (req, res) => {
  try {
    const text = await analyzeReceipt(req.file.path);
    // Persist ticket so products can be linked
    const userId = 1; // temporal
    const insertQuery = `
      INSERT INTO tickets (user_id, image_path, raw_text, processed)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;
    const ticketResult = await pool.query(insertQuery, [userId, req.file.path, text, true]);
    const ticketId = ticketResult.rows[0].id;

    const products = parseWithRegex(text);
    res.json({ products, ticket: { id: ticketId } });
  } catch (err) {
    console.error("❌ Error OCR Regex:", err);
    res.status(500).json({ error: "OCR_REGEX_FAILED" });
  }
});

/**
 * 3️⃣ OCR + Parser Gemini
 */
router.post("/gemini", upload.single("image"), async (req, res) => {
  try {
    const text = await analyzeReceipt(req.file.path);
    // Persist ticket so products can be linked
    const userId = 1; // temporal
    const insertQuery = `
      INSERT INTO tickets (user_id, image_path, raw_text, processed)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;
    const ticketResult = await pool.query(insertQuery, [userId, req.file.path, text, true]);
    const ticketId = ticketResult.rows[0].id;

    const products = await parseWithGemini(text);
    res.json({ products, ticket: { id: ticketId } });
  } catch (err) {
    console.error("❌ Error OCR Gemini:", err);
    res.status(500).json({ error: "OCR_GEMINI_FAILED" });
  }
});

export default router;
