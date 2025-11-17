// ==========================================
// Archivo: spoonacularService.js
// Propósito: Cliente para consumir la API de Spoonacular
// Documentación: https://spoonacular.com/food-api/docs
// ==========================================

const BASE_URL = "https://api.spoonacular.com";
const API_KEY = process.env.SPOONACULAR_API_KEY;

if (!API_KEY) {
  console.warn("⚠️  SPOONACULAR_API_KEY no está configurada. Las peticiones a Spoonacular fallarán.");
}

/**
 * Wrapper interno para hacer peticiones a Spoonacular
 * @param {string} endpoint - Ruta del endpoint (ej: "/recipes/findByIngredients")
 * @param {Object} params - Parámetros de query (se añade apiKey automáticamente)
 * @returns {Promise<any>} - Respuesta parseada a JSON
 */
async function makeRequest(endpoint, params = {}) {
  const url = new URL(BASE_URL + endpoint);
  
  // Agregar apiKey y otros parámetros
  url.searchParams.append("apiKey", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Spoonacular API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  } catch (err) {
    console.error("❌ Error en makeRequest:", err.message);
    throw err;
  }
}

// ==========================================
// ENDPOINTS OBLIGATORIOS
// ==========================================

/**
 * Busca recetas por ingredientes disponibles
 * Endpoint: GET /recipes/findByIngredients
 * @param {string[]} ingredients - Array de ingredientes (ej: ["eggs", "milk", "flour"])
 * @param {number} number - Número de resultados (default: 10)
 * @param {boolean} ranking - Si ordenar por "max used ingredients" o "min missing" (1 o 2)
 * @param {boolean} ignorePantry - Ignorar ingredientes básicos como agua, sal (default: false)
 * @returns {Promise<Array>} - Lista de recetas con ingredientes usados/faltantes
 */
export async function findRecipesByIngredients(ingredients, number = 10, ranking = 1, ignorePantry = false) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Se requiere un array de ingredientes no vacío");
  }

  const params = {
    ingredients: ingredients.join(","),
    number,
    ranking,
    ignorePantry,
  };

  return makeRequest("/recipes/findByIngredients", params);
}

/**
 * Obtiene información completa de una receta por su ID
 * Endpoint: GET /recipes/{id}/information
 * @param {number} recipeId - ID de la receta en Spoonacular
 * @param {boolean} includeNutrition - Si incluir información nutricional (default: false)
 * @returns {Promise<Object>} - Información completa de la receta
 */
export async function getRecipeInformation(recipeId, includeNutrition = false) {
  if (!recipeId) {
    throw new Error("Se requiere un recipeId válido");
  }

  const params = { includeNutrition };
  return makeRequest(`/recipes/${recipeId}/information`, params);
}

/**
 * Obtiene los pasos de preparación estructurados de una receta
 * Endpoint: GET /recipes/{id}/analyzedInstructions
 * @param {number} recipeId - ID de la receta
 * @returns {Promise<Array>} - Lista de instrucciones paso a paso
 */
export async function getAnalyzedInstructions(recipeId) {
  if (!recipeId) {
    throw new Error("Se requiere un recipeId válido");
  }

  return makeRequest(`/recipes/${recipeId}/analyzedInstructions`, {});
}

// ==========================================
// ENDPOINTS OPCIONALES
// ==========================================

/**
 * Búsqueda avanzada de recetas con múltiples filtros
 * Endpoint: GET /recipes/complexSearch
 * @param {Object} options - Opciones de búsqueda
 * @param {string} options.query - Texto de búsqueda (ej: "pasta")
 * @param {string} options.cuisine - Tipo de cocina (ej: "italian", "mexican")
 * @param {string} options.diet - Dieta (ej: "vegetarian", "vegan", "gluten free")
 * @param {string} options.intolerances - Intolerancias separadas por coma (ej: "dairy,egg")
 * @param {number} options.number - Número de resultados (default: 10)
 * @param {number} options.offset - Offset para paginación (default: 0)
 * @param {string} options.type - Tipo de plato (ej: "main course", "dessert", "breakfast")
 * @param {number} options.maxReadyTime - Tiempo máximo de preparación en minutos
 * @param {boolean} options.addRecipeInformation - Incluir información completa de cada receta
 * @param {boolean} options.fillIngredients - Incluir lista de ingredientes
 * @returns {Promise<Object>} - Objeto con results[] y metadatos (offset, number, totalResults)
 */
export async function complexSearch(options = {}) {
  const {
    query,
    cuisine,
    diet,
    intolerances,
    number = 10,
    offset = 0,
    type,
    maxReadyTime,
    addRecipeInformation = false,
    fillIngredients = false,
  } = options;

  const params = {
    query,
    cuisine,
    diet,
    intolerances,
    number,
    offset,
    type,
    maxReadyTime,
    addRecipeInformation,
    fillIngredients,
  };

  return makeRequest("/recipes/complexSearch", params);
}

/**
 * Estima valores nutricionales a partir del título de una receta
 * Endpoint: GET /recipes/guessNutrition
 * @param {string} title - Título o descripción de la receta (ej: "Spaghetti Aglio et Olio")
 * @returns {Promise<Object>} - Valores nutricionales estimados
 */
export async function guessNutrition(title) {
  if (!title || typeof title !== "string") {
    throw new Error("Se requiere un título de receta válido");
  }

  const params = { title };
  return makeRequest("/recipes/guessNutrition", params);
}

// ==========================================
// FUNCIONES AUXILIARES (ÚTILES)
// ==========================================

/**
 * Obtiene recetas aleatorias
 * Endpoint: GET /recipes/random
 * @param {number} number - Cantidad de recetas (default: 1, máx: 100)
 * @param {string} tags - Tags separados por coma (ej: "vegetarian,dessert")
 * @returns {Promise<Object>} - Objeto con array "recipes"
 */
export async function getRandomRecipes(number = 1, tags = "") {
  const params = { number, tags };
  return makeRequest("/recipes/random", params);
}

/**
 * Busca recetas similares a una dada
 * Endpoint: GET /recipes/{id}/similar
 * @param {number} recipeId - ID de la receta
 * @param {number} number - Número de resultados (default: 10)
 * @returns {Promise<Array>} - Lista de recetas similares
 */
export async function getSimilarRecipes(recipeId, number = 10) {
  if (!recipeId) {
    throw new Error("Se requiere un recipeId válido");
  }

  const params = { number };
  return makeRequest(`/recipes/${recipeId}/similar`, params);
}

// ==========================================
// EJEMPLOS DE USO
// ==========================================

/*
IMPORTANTE: Antes de usar este módulo, asegúrate de tener la API key en tu .env:
SPOONACULAR_API_KEY=tu_api_key_aqui

---

Example 1: Buscar recetas por ingredientes disponibles
```js
import { findRecipesByIngredients } from './services/spoonacularService.js';

const recipes = await findRecipesByIngredients(["chicken", "rice", "tomato"], 5);
console.log(recipes);
// Output: Array de recetas con { id, title, image, usedIngredients[], missedIngredients[] }
```

---

Example 2: Obtener información completa de una receta
```js
import { getRecipeInformation } from './services/spoonacularService.js';

const recipe = await getRecipeInformation(716429, true); // includeNutrition = true
console.log(recipe.title, recipe.readyInMinutes, recipe.servings);
```

---

Example 3: Obtener pasos de preparación
```js
import { getAnalyzedInstructions } from './services/spoonacularService.js';

const instructions = await getAnalyzedInstructions(716429);
instructions[0].steps.forEach(step => {
  console.log(`${step.number}. ${step.step}`);
});
```

---

Example 4: Búsqueda avanzada con filtros
```js
import { complexSearch } from './services/spoonacularService.js';

const results = await complexSearch({
  query: "pasta",
  cuisine: "italian",
  diet: "vegetarian",
  number: 20,
  addRecipeInformation: true,
});
console.log(results.results); // Array de recetas
console.log(results.totalResults); // Total disponible
```

---

Example 5: Estimar nutrición de un plato
```js
import { guessNutrition } from './services/spoonacularService.js';

const nutrition = await guessNutrition("Spaghetti Carbonara");
console.log(nutrition.calories, nutrition.fat, nutrition.protein);
```

---

Example 6: Obtener recetas aleatorias vegetarianas
```js
import { getRandomRecipes } from './services/spoonacularService.js';

const random = await getRandomRecipes(3, "vegetarian,dessert");
console.log(random.recipes);
```

---

Example 7: Uso en ruta Express
```js
import express from 'express';
import { findRecipesByIngredients } from './services/spoonacularService.js';

const router = express.Router();

router.get('/recipes/suggest', async (req, res) => {
  try {
    const ingredients = req.query.ingredients?.split(',') || [];
    const recipes = await findRecipesByIngredients(ingredients, 10);
    res.json({ success: true, recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'SPOONACULAR_ERROR', details: err.message });
  }
});

export default router;
```
*/
