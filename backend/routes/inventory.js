const express = require('express');

/**
 * Rutas para gestionar un inventario de productos en memoria.
 * Archivo: backend/routes/inventory.js
 *
 * Endpoints:
 *  - GET    /           -> listar todos los productos
 *  - GET    /:id        -> obtener producto por id
 *  - POST   /           -> crear producto { name, price, quantity }
 *  - PUT    /:id        -> actualizar completamente { name, price, quantity }
 *  - PATCH  /:id/stock  -> ajustar stock { delta } o establecer { quantity }
 *  - DELETE /:id        -> eliminar producto
 *
 * Nota: asume que la app principal ya usa express.json()
 */

const router = express.Router();

// Almacenamiento en memoria
let products = [];
let nextId = 1;

// Validadores simples
function isValidName(n) {
    return typeof n === 'string' && n.trim().length > 0;
}
function isValidPrice(p) {
    return typeof p === 'number' && Number.isFinite(p) && p >= 0;
}
function isValidQuantity(q) {
    return Number.isInteger(q) && q >= 0;
}

// Listar todos los productos
router.get('/', (req, res) => {
    res.json(products);
});

// Obtener un producto por id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
});

// Crear un nuevo producto
router.post('/', (req, res) => {
    const { name, price, quantity = 0 } = req.body;

    if (!isValidName(name)) return res.status(400).json({ error: 'Nombre inválido' });
    if (!isValidPrice(price)) return res.status(400).json({ error: 'Precio inválido' });
    if (!isValidQuantity(quantity)) return res.status(400).json({ error: 'Cantidad inválida' });

    const newProduct = {
        id: nextId++,
        name: name.trim(),
        price,
        quantity
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Reemplazar/actualizar completamente un producto
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const { name, price, quantity } = req.body;
    if (!isValidName(name)) return res.status(400).json({ error: 'Nombre inválido' });
    if (!isValidPrice(price)) return res.status(400).json({ error: 'Precio inválido' });
    if (!isValidQuantity(quantity)) return res.status(400).json({ error: 'Cantidad inválida' });

    products[idx] = { id, name: name.trim(), price, quantity };
    res.json(products[idx]);
});

// Ajustar stock: puede enviar { delta } para sumar/restar o { quantity } para establecer
router.patch('/:id/stock', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const { delta, quantity } = req.body;

    if (delta !== undefined) {
        if (typeof delta !== 'number' || !Number.isFinite(delta)) {
            return res.status(400).json({ error: 'Delta inválido' });
        }
        const newQty = product.quantity + Math.trunc(delta);
        if (newQty < 0) return res.status(400).json({ error: 'Resultado de stock negativo' });
        product.quantity = newQty;
        return res.json(product);
    }

    if (quantity !== undefined) {
        if (!isValidQuantity(quantity)) return res.status(400).json({ error: 'Cantidad inválida' });
        product.quantity = quantity;
        return res.json(product);
    }

    res.status(400).json({ error: 'Debe recibir delta o quantity' });
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    products.splice(idx, 1);
    res.status(204).send();
});

module.exports = router;