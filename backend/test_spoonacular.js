// ==========================================
// test_spoonacular.js
// Script de prueba para verificar la integración con Spoonacular
// Uso: node backend/test_spoonacular.js
// ==========================================

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  findRecipesByIngredients,
  getRecipeInformation,
  getRandomRecipes,
} from "./services/spoonacularService.js";

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto (un nivel arriba de backend/)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("🧪 Iniciando pruebas de Spoonacular...\n");

// Test 1: Verificar que la API key está configurada
if (!process.env.SPOONACULAR_API_KEY) {
  console.error("❌ ERROR: SPOONACULAR_API_KEY no está configurada en .env");
  process.exit(1);
}
console.log("✅ API Key detectada:", process.env.SPOONACULAR_API_KEY.slice(0, 8) + "...");

// Test 2: Buscar recetas por ingredientes
async function testFindByIngredients() {
  console.log("\n🔍 Test 1: Buscar recetas por ingredientes ['chicken', 'rice']...");
  try {
    const recipes = await findRecipesByIngredients(["chicken", "rice"], 3);
    console.log(`✅ Encontradas ${recipes.length} recetas:`);
    recipes.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (ID: ${r.id})`);
      console.log(`     - Ingredientes usados: ${r.usedIngredientCount}`);
      console.log(`     - Ingredientes faltantes: ${r.missedIngredientCount}`);
    });
    return recipes[0]?.id; // Devolver el primer ID para siguiente test
  } catch (err) {
    console.error("❌ Error:", err.message);
    return null;
  }
}

// Test 3: Obtener información completa de una receta
async function testGetRecipeInfo(recipeId) {
  if (!recipeId) {
    console.log("\n⚠️  Test 2: Saltado (no hay recipeId del test anterior)");
    return;
  }

  console.log(`\n📖 Test 2: Obtener información de receta ${recipeId}...`);
  try {
    const recipe = await getRecipeInformation(recipeId, false);
    console.log(`✅ Receta obtenida:`);
    console.log(`  - Título: ${recipe.title}`);
    console.log(`  - Tiempo de preparación: ${recipe.readyInMinutes} min`);
    console.log(`  - Porciones: ${recipe.servings}`);
    console.log(`  - Precio por porción: $${recipe.pricePerServing / 100}`);
    console.log(`  - URL: ${recipe.sourceUrl}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Test 4: Obtener recetas aleatorias
async function testRandomRecipes() {
  console.log("\n🎲 Test 3: Obtener 2 recetas aleatorias vegetarianas...");
  try {
    const result = await getRandomRecipes(2, "vegetarian");
    console.log(`✅ Recetas aleatorias obtenidas:`);
    result.recipes.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title} (ID: ${r.id})`);
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Ejecutar todos los tests
(async function runTests() {
  const recipeId = await testFindByIngredients();
  await testGetRecipeInfo(recipeId);
  await testRandomRecipes();

  console.log("\n✅ Pruebas completadas. Si todos los tests pasaron, la integración funciona correctamente.");
  console.log("📌 Ahora puedes usar los endpoints REST en http://localhost:3000/recipes/");
})();
