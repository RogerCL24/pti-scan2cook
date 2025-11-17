import express from "express";
import cors from "cors";
import morgan from "morgan";

import ocrRouter from "./routes/ocr.js";
import authRouter from "./routes/auth.js";   // lo añadirás después
import productsRouter from "./routes/products.js"; // lo añadirás después
import recipesRouter from "./routes/recipes.js";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rutas principales
app.use("/ocr", ocrRouter);
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/recipes", recipesRouter);

// Endpoint de prueba
app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;
