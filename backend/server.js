import dotenv from "dotenv";
import app from "./app.js";
import pool from "./lib/db.js";

dotenv.config();

const inventoryRoutes = require('./routes/inventory'); // ajusta la ruta según tu estructura


const app = express();
app.use(express.json());
app.use('/ocr', ocrRouter);  

// Crear pool de conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'scan2cook',
  port: process.env.DB_PORT || 5432,
});

//para probar OCR podemos comentar este pool.connect

// Probar la conexión
// Probar conexión a PostgreSQL
pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL correctamente"))
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err));

// Arrancar servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
