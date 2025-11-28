import express from "express";
import pool from "../lib/db.js";
import { authGuard } from "../middlewares/authGuard.js";
import {
  findRecipesByIngredients,
  getRecipeInformation,
  getAnalyzedInstructions,
  complexSearch,
  guessNutrition,
  getRandomRecipes,
  getSimilarRecipes,
} from "../services/spoonacularService.js";

const router = express.Router();

// ==========================================
// GET /recipes/suggest
// Busca recetas por ingredientes disponibles
// Query params: ingredients (comma-separated), number
// ==========================================
router.get("/suggest", async (req, res) => {
  try {
    const ingredientsParam = req.query.ingredients;
    if (!ingredientsParam) {
      return res.status(400).json({ error: "MISSING_INGREDIENTS", message: "Se requiere el parámetro 'ingredients'" });
    }

    const ingredients = ingredientsParam.split(",").map(i => i.trim());
    const number = parseInt(req.query.number) || 10;

    const recipes = await findRecipesByIngredients(ingredients, number);
    res.json({ success: true, recipes });
  } catch (err) {
    console.error("❌ Error en /recipes/suggest:", err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// GET /recipes/suggest/random
// Sugiere 3 recetas escogiendo 4 productos aleatorios del usuario
// Requiere autenticación (token)
// ==========================================
router.get("/suggest/random", authGuard, async (req, res) => {
  try {
    // Obtener 4 productos aleatorios llamando al endpoint /products/random
    const host = req.get("host");
    const url = `${req.protocol}://${host}/products/random`;

    const productsRes = await fetch(url, {
      headers: { Authorization: req.headers.authorization },
    });

    if (!productsRes.ok) {
      throw new Error("No se pudieron obtener productos aleatorios");
    }

    const products = await productsRes.json();
    const ingredients = products.map(p => (p.name || "").trim()).filter(n => n.length > 0);

    if (ingredients.length === 0) {
      return res.json({ success: true, recipes: [] });
    }

    // Llamar a Spoonacular con los ingredientes para obtener 3 recetas
    const recipes = await findRecipesByIngredients(ingredients, 3);
    res.json({ success: true, recipes });
  } catch (err) {
    console.error("❌ Error en /recipes/suggest/random:", err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// GET /recipes/search
// Búsqueda avanzada de recetas con filtros
// Query params: query, cuisine, diet, intolerances, type, maxReadyTime, number, offset
// ==========================================
router.get("/search", async (req, res) => {
  try {
    const options = {
      query: req.query.query,
      cuisine: req.query.cuisine,
      diet: req.query.diet,
      intolerances: req.query.intolerances,
      type: req.query.type,
      maxReadyTime: req.query.maxReadyTime ? parseInt(req.query.maxReadyTime) : undefined,
      number: parseInt(req.query.number) || 10,
      offset: parseInt(req.query.offset) || 0,
      addRecipeInformation: req.query.addRecipeInformation === "true",
      fillIngredients: req.query.fillIngredients === "true",
    };

    const results = await complexSearch(options);
    res.json({ success: true, ...results });
  } catch (err) {
    console.error("❌ Error en /recipes/search:", err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// GET /recipes/random
// Obtiene recetas aleatorias
// Query params: number, tags
// ==========================================
router.get("/random", async (req, res) => {
  try {
    const number = parseInt(req.query.number) || 1;
    const tags = req.query.tags || "";

    const result = await getRandomRecipes(number, tags);
    res.json({ success: true, recipes: result.recipes });
  } catch (err) {
    console.error("❌ Error en /recipes/random:", err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// GET /recipes/:id
// Obtiene información completa de una receta
// Params: id (recipeId)
// Query params: includeNutrition (boolean)
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    if (!recipeId) {
      return res.status(400).json({ error: "INVALID_ID", message: "Se requiere un ID de receta válido" });
    }

    const includeNutrition = req.query.includeNutrition === "true";
    const recipe = await getRecipeInformation(recipeId, includeNutrition);

    res.json({ success: true, recipe });
  } catch (err) {
    console.error(`❌ Error en /recipes/${req.params.id}:`, err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// GET /recipes/:id/instructions
// Obtiene los pasos de preparación de una receta
// Params: id (recipeId)
// ==========================================
router.get("/:id/instructions", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    if (!recipeId) {
      return res.status(400).json({ error: "INVALID_ID", message: "Se requiere un ID de receta válido" });
    }

    const instructions = await getAnalyzedInstructions(recipeId);
    res.json({ success: true, instructions });
  } catch (err) {
    console.error(`❌ Error en /recipes/${req.params.id}/instructions:`, err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// GET /recipes/:id/similar
// Obtiene recetas similares a una dada
// Params: id (recipeId)
// Query params: number
// ==========================================
router.get("/:id/similar", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    if (!recipeId) {
      return res.status(400).json({ error: "INVALID_ID", message: "Se requiere un ID de receta válido" });
    }

    const number = parseInt(req.query.number) || 10;
    const similar = await getSimilarRecipes(recipeId, number);

    res.json({ success: true, recipes: similar });
  } catch (err) {
    console.error(`❌ Error en /recipes/${req.params.id}/similar:`, err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

// ==========================================
// POST /recipes/nutrition
// Estima valores nutricionales de un plato
// Body: { title: "Spaghetti Carbonara" }
// ==========================================
router.post("/nutrition", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "MISSING_TITLE", message: "Se requiere el campo 'title'" });
    }

    const nutrition = await guessNutrition(title);
    res.json({ success: true, nutrition });
  } catch (err) {
    console.error("❌ Error en /recipes/nutrition:", err);
    res.status(500).json({ error: "SPOONACULAR_ERROR", details: err.message });
  }
});

export default router;
