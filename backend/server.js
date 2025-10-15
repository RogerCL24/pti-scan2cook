import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg'; // importamos la librería PostgreSQL
import ocrRouter from './routes/ocr.js';
const { Pool } = pkg;

dotenv.config(); // carga las variables desde .env

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
pool.connect()
  .then(() => console.log('Conectado a PostgreSQL correctamente'))
  .catch(err => console.error('Error conectando a PostgreSQL:', err));

// Ejemplo de endpoint que consulta la base de datos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    res.status(500).send('Error al consultar la base de datos');
  }
});

app.get('/', (req, res) => {
  res.send('Scan2Cook API funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
