import express from "express";
import pool from "../lib/db.js";
import { authGuard } from "../middlewares/authGuard.js";

const router = express.Router();

/**
 * GET /products
 * Devuelve todos los productos del usuario autenticado
 */
router.get("/", authGuard, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener productos:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * GET /products/random
 * Devuelve 4 productos aleatorios del usuario autenticado
 */
router.get("/random", authGuard, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT name FROM products WHERE user_id = $1 ORDER BY RANDOM() LIMIT 4",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener productos aleatorios:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * POST /products
 * Crea un nuevo producto asociado al usuario autenticado
 */
router.post("/", authGuard, async (req, res) => {
  const { name, quantity, category } = req.body;

  if (!name) {
    return res.status(400).json({ error: "MISSING_NAME" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (user_id, name, quantity, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, name, quantity || 1, category || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al insertar producto:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * PUT /products/:id
 * Actualiza la cantidad (y opcionalmente otros campos) de un producto
 * Body: { quantity, name?, category?, expiration_date? }
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity, name, category, expiration_date } = req.body;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: "INVALID_QUANTITY" });
  }

  try {
    const result = await pool.query(
      `UPDATE products
         SET quantity       = $1,
             name           = COALESCE($2, name),
             category       = COALESCE($3, category),
             expiration_date= COALESCE($4, expiration_date)
       WHERE id = $5
       RETURNING *`,
      [quantity, name || null, category || null, expiration_date || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar producto:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * DELETE /products/:id
 * Elimina un producto del usuario autenticado
 */
router.delete("/:id", authGuard, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 AND user_id = $2",
      [id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

/**
 * POST /products/import
 * Inserta múltiples productos asociados al usuario autenticado
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
      const quantity =
        p.quantity && Number.isInteger(p.quantity) ? p.quantity : 1;
      const category = p.category || null;
      const ticket_id = p.ticket_id || null;

      const result = await client.query(
        `INSERT INTO products (user_id, ticket_id, name, quantity, category)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, ticket_id, name, quantity, category]
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
