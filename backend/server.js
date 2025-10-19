import dotenv from "dotenv";
import app from "./app.js";
import pool from "./lib/db.js";

dotenv.config();

// Probar conexión a PostgreSQL
pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL correctamente"))
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
