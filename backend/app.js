import express from "express";
import cors from "cors";
import morgan from "morgan";

import ocrRouter from "./routes/ocr.js";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import alexaRouter from "./routes/alexa.js";
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
app.use("/alexa", alexaRouter);
app.use("/recipes", recipesRouter);

// Endpoint de prueba
app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;
