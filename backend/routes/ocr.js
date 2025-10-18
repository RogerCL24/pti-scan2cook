import express from "express";
import multer from "multer";
import { analyzeReceipt } from "../services/ocr/huggingface.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/receipt", upload.single("image"), async (req, res) => {
  try {
    const result = await analyzeReceipt(req.file.buffer);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR_FAILED" });
  }
});

export default router;
