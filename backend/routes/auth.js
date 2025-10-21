import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../lib/validate.js";
import pool from "../lib/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * Registro de usuario
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // ¿Ya existe el usuario?
    const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    // Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name || "Usuario", email, hashed]
    );

    const user = result.rows[0];
    res.status(201).json(user);
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

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    // Generar token JWT
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ error: "LOGIN_FAILED" });
  }
});

export default router;
