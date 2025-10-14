import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- RUTA DE PRUEBA ---
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Aquí más adelante añadiremos las rutas de /auth, /products, etc.
export default app;
