import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../lib/validate.js";
import { UsersRepo } from "../repos/memoryUsers.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

router.post("/register", async (req, res) => {
  const { email, password } = registerSchema.parse(req.body);

  const exists = await UsersRepo.findByEmail(email);
  if (exists) return res.status(409).json({ error: "Email ya registrado" });

  const user = await UsersRepo.create({ email, password });
  // Por seguridad, no devuelvas el hash
  res.status(201).json({ id: user.id, email: user.email, createdAt: user.createdAt });
});

router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await UsersRepo.findByEmail(email);
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
