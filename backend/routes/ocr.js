// backend/src/routes/ocr.js

import express from 'express';
import multer from 'multer';
//importa la función recognizeText() que creamos en tesseract.js 
//esa función se encarga de leer la imagen con Tesseract.js y devolver el texto detectado
import { recognizeText } from '../services/ocr/tesseract.js';

const router = express.Router();
//configura Multer para guardar las imágenes en memoria RAM, no en disco
const upload = multer({ storage: multer.memoryStorage() });

// endpoint POST /ocr/receipt
router.post('/receipt', upload.single('image'), async (req, res) => {
  try {
    const text = await recognizeText(req.file.buffer); //req.file.buffer contiene la imagen enviada por el usuario (gracias a Multer).
    res.json({ text }); //devuelve al cliente el texto reconocido dentro de un objeto JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OCR_FAILED' });
  }
});

export default router;
