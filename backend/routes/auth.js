import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";
import { registerSchema, loginSchema } from "../lib/validate.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * Registro de usuario
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const check = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email, hashed]
    );

    const user = result.rows[0];

    // CRÍTICO: Generar y devolver token
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log(
      "✅ Registro exitoso, devolviendo token:",
      token.substring(0, 20) + "..."
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("❌ Error en /register:", err);
    res.status(400).json({ error: "REGISTRATION_FAILED" });
  }
});

/**
 * Login
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "LOGIN_FAILED" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "LOGIN_FAILED" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ error: "LOGIN_FAILED" });
  }
});

export default router;
