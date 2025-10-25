import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const inventoryRoutes = require('./routes/inventory'); // ajusta la ruta según tu estructura


const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Scan2Cook API funcionando ✅');
});

// Montar las rutas del inventario
app.use('/inventory', inventoryRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
