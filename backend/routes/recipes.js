import express from 'express';
import axios from 'axios';
import pool from '../lib/db.js';
import { authGuard } from '../middlewares/authGuard.js';

// backend/routes/recipes.js
// Ruta para sugerir recetas usando la API de Spoonacular según los productos del usuario
// Ahora adaptada para usar Postgres (tabla `products`) y el middleware `authGuard` del proyecto.

const router = express.Router();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

if (!SPOONACULAR_API_KEY) {
    console.warn('Warning: SPOONACULAR_API_KEY no está definido en las variables de entorno.');
}

// GET /recipes/suggestions
// Devuelve recetas sugeridas basadas en los productos/ingredientes del usuario autenticado
router.get('/suggestions', authGuard, async (req, res) => {
    try {
        if (!SPOONACULAR_API_KEY) {
            return res.status(500).json({ error: 'Spoonacular API key no configurada' });
        }

        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Usuario no autenticado' });

        // Obtener nombres de productos asociados al usuario desde Postgres
        const { rows } = await pool.query('SELECT name FROM products WHERE user_id = $1', [userId]);
        const ingredientNames = (rows || []).map(r => (r.name || '').trim()).filter(Boolean);

        if (!ingredientNames.length) {
            return res.status(400).json({ error: 'No se encontraron productos/ingredientes para el usuario' });
        }

        // Construir lista de ingredientes para la API (comma separated)
        const ingredientsParam = ingredientNames.join(',');

        // Llamar a Spoonacular: recipes/findByIngredients
        const params = {
            apiKey: SPOONACULAR_API_KEY,
            ingredients: ingredientsParam,
            number: 20,
            ranking: 1,
            ignorePantry: true
        };

        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', { params, timeout: 10000 });
        const results = Array.isArray(response.data) ? response.data : [];

        // Mapear a forma más útil para el frontend
        const recipes = results.map(r => ({
            id: r.id,
            title: r.title,
            image: r.image,
            usedIngredientCount: r.usedIngredientCount,
            missedIngredientCount: r.missedIngredientCount,
            usedIngredients: (r.usedIngredients || []).map(ui => ui.name),
            missedIngredients: (r.missedIngredients || []).map(mi => mi.name)
        }));

        // Intentar devolver al menos 4 recetas: tomar hasta 8 para dar opciones
        const output = recipes.slice(0, Math.max(4, Math.min(recipes.length, 8)));

        return res.json({
            countAvailable: recipes.length,
            returned: output.length,
            recipes: output
        });
    } catch (err) {
        console.error('Error en /recipes/suggestions:', err.message || err);
        return res.status(500).json({ error: 'Error al obtener sugerencias de recetas' });
    }
});

export default router;