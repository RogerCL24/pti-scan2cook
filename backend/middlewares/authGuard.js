import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export function authGuard(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Falta token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET); // { sub, iat, exp }
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
