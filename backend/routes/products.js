import express from "express";
import pool from "../lib/db.js";
import { authGuard } from "../middlewares/authGuard.js";

const router = express.Router();

/**
 * GET /products
 * Devuelve todos los productos del usuario
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * POST /products
 * Crea un nuevo producto
 */
router.post("/", async (req, res) => {
  const { user_id, name, quantity, category, expiration_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (user_id, name, quantity, category, expiration_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, name, quantity, category, expiration_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al insertar producto:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * DELETE /products/:id
 * Elimina un producto por ID
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * POST /products/import
 * Inserta múltiples productos asociados al usuario autenticado
 * Body: { products: [ { name, quantity, category, expiration_date, ticket_id? } ] }
 */
router.post("/import", authGuard, async (req, res) => {
  const userId = req.userId;
  const { products } = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "INVALID_PAYLOAD" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = [];

    for (const p of products) {
      const name = p.name || "";
      const quantity = p.quantity && Number.isInteger(p.quantity) ? p.quantity : 1;
      const category = p.category || null;
      const expiration_date = p.expiration_date || null;
      const ticket_id = p.ticket_id || null;

      const result = await client.query(
        `INSERT INTO products (user_id, ticket_id, name, quantity, category, expiration_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, ticket_id, name, quantity, category, expiration_date]
      );
      inserted.push(result.rows[0]);
    }

    await client.query("COMMIT");
    res.status(201).json({ inserted });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error al importar productos:", err);
    res.status(500).json({ error: "DB_ERROR" });
  } finally {
    client.release();
  }
});

export default router;
