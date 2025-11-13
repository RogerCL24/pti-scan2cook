# Backend – API REST de Scan2Cook
El backend es el núcleo del proyecto.
Se encarga de manejar las peticiones de la app (frontend), conectarse a la base de datos y procesar la información de productos, recetas y usuarios.

## 📁 Estructura del directorio
```
backend/
│
├── Dockerfile              → Configuración para crear el contenedor Docker
├── package.json            → Lista de dependencias Node.js
├── server.js               → Punto de entrada del servidor
├── app.js                  → Configura Express, rutas, middlewares y logs
├── .env.example            → Plantilla de variables de entorno
├── README_API.md           → Documentación de la API (endpoints, JWT, ejemplos)
├── README.md               → Este archivo
│
├── routes/                 → Contiene todas las rutas HTTP (endpoints)
│   ├── auth.js             → Registro, login y tokens JWT
│   ├── products.js         → Gestión de inventario del usuario
│   ├── recipes.js          → Búsqueda de recetas vía Spoonacular API
│   └── ocr.js              → Procesa tickets mediante Google Vision + Gemini
│
├── middlewares/            → Funciones que se ejecutan antes de las rutas
│   └── authGuard.js        → Verifica token JWT
│
├── lib/                    → Funciones auxiliares y utilidades
│   ├── db.js               → Pool de conexión a PostgreSQL
│   ├── validate.js         → Esquemas de validación con Zod
│   └── parseTicketText.js  → Limpia texto OCR y genera lista de productos
│
└── services/               → Servicios externos y lógica de negocio
    ├── spoonacularService.js → Cliente para consumir Spoonacular API
    └── ocr/                → Servicios de procesamiento OCR
        ├── googleVision.js → Integración con Google Vision API
        ├── cleaner.js      → Normaliza y limpia texto OCR
        ├── parserRegex.js  → Parser basado en regex
        └── parserGemini.js → Parser usando Gemini AI

```

---

## 📡 API REST - Endpoints disponibles

### 🔐 Autenticación (`/auth`)

#### POST `/auth/register`
Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "mi_password_seguro"
}
```

**Validaciones:**
- `email`: formato válido de email
- `password`: mínimo 6 caracteres

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  }
}
```

**Errores comunes:**
- `400` - Email inválido o password demasiado corto
- `409` - Email ya registrado

---

#### POST `/auth/login`
Inicia sesión con credenciales existentes.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "mi_password_seguro"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com"
  }
}
```

**Errores comunes:**
- `400` - Credenciales inválidas
- `401` - Usuario no encontrado o contraseña incorrecta

---

### 📦 Productos (`/products`)

#### GET `/products`
Obtiene todos los productos del usuario autenticado.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "ticket_id": 3,
    "name": "Leche entera",
    "quantity": 2,
    "category": "Lácteos",
    "expiration_date": "2025-11-20",
    "created_at": "2025-11-13T10:30:00.000Z"
  }
]
```

---

#### POST `/products`
Crea un nuevo producto manualmente.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Arroz integral",
  "quantity": 1,
  "category": "Cereales",
  "expiration_date": "2026-01-15"
}
```

**Response (201):**
```json
{
  "id": 42,
  "user_id": 1,
  "ticket_id": null,
  "name": "Arroz integral",
  "quantity": 1,
  "category": "Cereales",
  "expiration_date": "2026-01-15",
  "created_at": "2025-11-13T11:00:00.000Z"
}
```

---

#### POST `/products/import`
Importa múltiples productos de una vez (típicamente después de escanear un ticket).

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "products": [
    {
      "name": "Tomate",
      "quantity": 3,
      "category": "Verduras",
      "expiration_date": "2025-11-18",
      "ticket_id": 5
    },
    {
      "name": "Pan integral",
      "quantity": 1,
      "category": "Panadería"
    }
  ]
}
```

**Response (201):**
```json
{
  "inserted": [
    {
      "id": 43,
      "user_id": 1,
      "ticket_id": 5,
      "name": "Tomate",
      "quantity": 3,
      "category": "Verduras",
      "expiration_date": "2025-11-18",
      "created_at": "2025-11-13T11:05:00.000Z"
    },
    {
      "id": 44,
      "user_id": 1,
      "ticket_id": null,
      "name": "Pan integral",
      "quantity": 1,
      "category": "Panadería",
      "expiration_date": null,
      "created_at": "2025-11-13T11:05:00.000Z"
    }
  ]
}
```

**Errores comunes:**
- `400` - Payload inválido (no es un array o falta campo `name`)
- `401` - Token inválido o ausente
- `500` - Error en transacción de BD

---

#### DELETE `/products/:id`
Elimina un producto por su ID.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Response (204):**
Sin contenido (éxito)

**Errores comunes:**
- `401` - No autenticado
- `404` - Producto no encontrado

---

### 📸 OCR - Procesamiento de tickets (`/ocr`)

#### POST `/ocr/gemini`
Analiza una imagen de ticket usando Google Vision + Gemini AI y devuelve productos estructurados.

**Content-Type:** `multipart/form-data`

**Form Data:**
```
image: <archivo jpg/png>
```

**Response (200):**
```json
{
  "products": [
    {
      "name": "Leche desnatada",
      "quantity": 2,
      "category": "Lácteos"
    },
    {
      "name": "Huevos",
      "quantity": 12,
      "category": "Proteínas"
    }
  ],
  "ticket": {
    "id": 8
  }
}
```

**Uso desde frontend (ejemplo con fetch):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/ocr/gemini', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.products); // Array de productos detectados
console.log(data.ticket.id); // ID del ticket guardado en BD
```

**Notas:**
- El endpoint guarda automáticamente el ticket en la tabla `tickets` y devuelve su ID.
- Los productos parseados están listos para enviar a `/products/import` (añadiendo `ticket_id` si se desea vincular).

---

#### POST `/ocr/regex`
Similar a `/ocr/gemini` pero usa parser basado en regex (más rápido, menos preciso).

**Content-Type:** `multipart/form-data`

**Form Data:**
```
image: <archivo jpg/png>
```

**Response (200):**
```json
{
  "products": [
    {
      "name": "ARROZ",
      "quantity": 1
    }
  ],
  "ticket": {
    "id": 9
  }
}
```

---

### 🍽️ Recetas - Integración con Spoonacular (`/recipes`)

> **Nota importante para frontend:** Todos los endpoints de `/recipes` requieren que la API key de Spoonacular esté configurada en el backend. Los resultados provienen directamente de la API de Spoonacular.

---

#### GET `/recipes/suggest`
Busca recetas basadas en ingredientes disponibles (ideal para "qué puedo cocinar con lo que tengo").

**Query Parameters:**
- `ingredients` (requerido): ingredientes separados por coma (ej: `chicken,rice,tomato`)
- `number` (opcional): cantidad de resultados (default: 10, máx recomendado: 100)

**Ejemplo de llamada:**
```
GET /recipes/suggest?ingredients=chicken,rice,onion&number=5
```

**Response (200):**
```json
{
  "success": true,
  "recipes": [
    {
      "id": 649985,
      "title": "Light and Chunky Chicken Soup",
      "image": "https://spoonacular.com/recipeImages/649985-312x231.jpg",
      "imageType": "jpg",
      "usedIngredientCount": 2,
      "missedIngredientCount": 8,
      "missedIngredients": [
        {
          "id": 11215,
          "amount": 2.0,
          "unit": "cloves",
          "name": "garlic",
          "original": "2 cloves garlic, minced",
          "image": "garlic.png"
        }
      ],
      "usedIngredients": [
        {
          "id": 5006,
          "amount": 1.5,
          "unit": "lb",
          "name": "chicken",
          "original": "1 1/2 lb chicken breast",
          "image": "chicken-breast.png"
        }
      ],
      "likes": 42
    }
  ]
}
```

**Uso en frontend (ejemplo React):**
```javascript
const ingredients = ['chicken', 'rice', 'tomato'];
const response = await fetch(
  `/api/recipes/suggest?ingredients=${ingredients.join(',')}&number=10`
);
const data = await response.json();

data.recipes.forEach(recipe => {
  console.log(recipe.title, recipe.usedIngredientCount, recipe.missedIngredientCount);
});
```

**Errores comunes:**
- `400` - Falta el parámetro `ingredients`
- `500` - Error de Spoonacular (cuota excedida, API key inválida)

**Ideas para frontend:**
- 📱 Pantalla "¿Qué puedo cocinar?" donde el usuario selecciona ingredientes disponibles y ve recetas sugeridas ordenadas por menor cantidad de ingredientes faltantes.
- 🛒 Botón "Añadir ingredientes faltantes" que crea una lista de compra automática.
- ⭐ Mostrar `usedIngredientCount` vs `missedIngredientCount` con barras de progreso o iconos.

---

#### GET `/recipes/search`
Búsqueda avanzada de recetas con múltiples filtros (query, tipo de cocina, dieta, intolerancias, etc.).

**Query Parameters:**
- `query` (opcional): texto de búsqueda libre (ej: "pasta carbonara")
- `cuisine` (opcional): tipo de cocina (`italian`, `mexican`, `chinese`, `indian`, `french`, etc.)
- `diet` (opcional): restricción dietética (`vegetarian`, `vegan`, `gluten free`, `ketogenic`, `paleo`, etc.)
- `intolerances` (opcional): intolerancias separadas por coma (`dairy`, `egg`, `peanut`, `seafood`, `soy`, etc.)
- `type` (opcional): tipo de plato (`main course`, `dessert`, `breakfast`, `appetizer`, `salad`, `soup`, etc.)
- `maxReadyTime` (opcional): tiempo máximo de preparación en minutos (ej: `30`)
- `number` (opcional): cantidad de resultados (default: 10)
- `offset` (opcional): offset para paginación (default: 0)
- `addRecipeInformation` (opcional): incluir info completa de cada receta (`true`/`false`)
- `fillIngredients` (opcional): incluir lista de ingredientes (`true`/`false`)

**Ejemplo de llamada:**
```
GET /recipes/search?query=pasta&cuisine=italian&diet=vegetarian&maxReadyTime=30&number=20
```

**Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "id": 654959,
      "title": "Pasta With Tuna",
      "image": "https://spoonacular.com/recipeImages/654959-312x231.jpg",
      "imageType": "jpg"
    }
  ],
  "offset": 0,
  "number": 20,
  "totalResults": 127
}
```

**Uso en frontend con filtros:**
```javascript
const params = new URLSearchParams({
  query: 'soup',
  cuisine: 'mexican',
  diet: 'vegan',
  maxReadyTime: 45,
  number: 15
});

const response = await fetch(`/api/recipes/search?${params}`);
const data = await response.json();

console.log(`Total encontradas: ${data.totalResults}`);
data.results.forEach(recipe => console.log(recipe.title));
```

**Errores comunes:**
- `500` - Error de Spoonacular

**Ideas para frontend:**
- 🔍 Buscador avanzado con filtros desplegables (cocina, dieta, tiempo máximo, intolerancias).
- 📊 Paginación de resultados usando `offset` y `number` (cargar más recetas con scroll infinito).
- 🏷️ Tags visuales para mostrar dietas y restricciones de cada receta (badges: "Vegetariano", "Sin gluten", etc.).

---

#### GET `/recipes/random`
Obtiene recetas aleatorias (útil para sugerencias diarias o "descubre algo nuevo").

**Query Parameters:**
- `number` (opcional): cantidad de recetas (default: 1, máx: 100)
- `tags` (opcional): tags separados por coma para filtrar (`vegetarian`, `dessert`, `breakfast`, etc.)

**Ejemplo de llamada:**
```
GET /recipes/random?number=3&tags=vegetarian,dessert
```

**Response (200):**
```json
{
  "success": true,
  "recipes": [
    {
      "id": 659887,
      "title": "Shortbread Lemon Cookies",
      "image": "https://spoonacular.com/recipeImages/659887-556x370.jpg",
      "servings": 24,
      "readyInMinutes": 45,
      "sourceUrl": "https://www.foodista.com/recipe/...",
      "summary": "Shortbread Lemon Cookies might be just the dessert...",
      "vegetarian": true,
      "vegan": false,
      "glutenFree": false
    }
  ]
}
```

**Ideas para frontend:**
- 🎲 Botón "Sorpréndeme" que muestra una receta aleatoria al usuario cada día.
- 🌱 Filtro de tags para usuarios con preferencias (ej: solo mostrar recetas vegetarianas o postres).
- 📌 Sección "Descubre" con recetas aleatorias renovadas diariamente.

---

#### GET `/recipes/:id`
Obtiene información completa de una receta específica por su ID.

**Path Parameters:**
- `id`: ID numérico de la receta en Spoonacular

**Query Parameters:**
- `includeNutrition` (opcional): incluir valores nutricionales (`true`/`false`, default: `false`)

**Ejemplo de llamada:**
```
GET /recipes/649985?includeNutrition=true
```

**Response (200):**
```json
{
  "success": true,
  "recipe": {
    "id": 649985,
    "title": "Light and Chunky Chicken Soup",
    "image": "https://spoonacular.com/recipeImages/649985-556x370.jpg",
    "servings": 6,
    "readyInMinutes": 45,
    "pricePerServing": 169.87,
    "sourceUrl": "https://www.foodista.com/recipe/...",
    "summary": "Light and Chunky Chicken Soup might be just the soup you are searching for...",
    "cuisines": ["American"],
    "dishTypes": ["lunch", "soup", "main course"],
    "diets": [],
    "vegetarian": false,
    "vegan": false,
    "glutenFree": false,
    "dairyFree": false,
    "extendedIngredients": [
      {
        "id": 11124,
        "name": "carrot",
        "amount": 2.0,
        "unit": "medium",
        "original": "2 medium carrots, diced"
      }
    ],
    "instructions": "Combine chicken, water, and onion...",
    "nutrition": {
      "nutrients": [
        {
          "name": "Calories",
          "amount": 245.3,
          "unit": "kcal"
        }
      ]
    }
  }
}
```

**Uso en frontend:**
```javascript
const recipeId = 649985;
const response = await fetch(`/api/recipes/${recipeId}?includeNutrition=true`);
const data = await response.json();

console.log(data.recipe.title);
console.log(`Tiempo: ${data.recipe.readyInMinutes} min`);
console.log(`Porciones: ${data.recipe.servings}`);
```

**Ideas para frontend:**
- 📄 Página de detalle de receta con imagen grande, resumen, ingredientes y botón "Ver pasos".
- 🍽️ Mostrar información nutricional en gráficos (calorías, proteínas, grasas) si `includeNutrition=true`.
- 🔗 Enlace a la fuente original (`sourceUrl`) para ver la receta completa en el sitio externo.
- 💾 Botón "Guardar receta" para añadirla a favoritos del usuario (requiere nueva tabla en BD).

---

#### GET `/recipes/:id/instructions`
Obtiene los pasos de preparación estructurados de una receta.

**Path Parameters:**
- `id`: ID numérico de la receta

**Ejemplo de llamada:**
```
GET /recipes/649985/instructions
```

**Response (200):**
```json
{
  "success": true,
  "instructions": [
    {
      "name": "",
      "steps": [
        {
          "number": 1,
          "step": "Combine chicken, water, and onion in a large pot over medium-high heat.",
          "ingredients": [
            {
              "id": 5006,
              "name": "chicken",
              "image": "chicken-breast.png"
            }
          ],
          "equipment": [
            {
              "id": 404752,
              "name": "pot",
              "image": "stock-pot.jpg"
            }
          ]
        },
        {
          "number": 2,
          "step": "Bring to a boil, reduce heat, and simmer for 20 minutes."
        }
      ]
    }
  ]
}
```

**Uso en frontend:**
```javascript
const response = await fetch(`/api/recipes/${recipeId}/instructions`);
const data = await response.json();

data.instructions[0].steps.forEach(step => {
  console.log(`Paso ${step.number}: ${step.step}`);
});
```

**Ideas para frontend:**
- 📝 Vista paso a paso con botones "Anterior" / "Siguiente" para cocinar siguiendo la receta.
- 🖼️ Mostrar imágenes de ingredientes y equipo necesario en cada paso.
- ✅ Checkbox en cada paso para marcar como completado (guardado en localStorage o estado).
- 🔊 Modo "manos libres" con lectura de voz de los pasos (Web Speech API).

---

#### GET `/recipes/:id/similar`
Obtiene recetas similares a una dada (útil para "si te gustó esto, prueba...").

**Path Parameters:**
- `id`: ID numérico de la receta

**Query Parameters:**
- `number` (opcional): cantidad de recetas similares (default: 10)

**Ejemplo de llamada:**
```
GET /recipes/649985/similar?number=5
```

**Response (200):**
```json
{
  "success": true,
  "recipes": [
    {
      "id": 715495,
      "title": "Turkey Tomato Cheese Pizza",
      "imageType": "jpg",
      "readyInMinutes": 45,
      "servings": 2,
      "sourceUrl": "https://spoonacular.com/..."
    }
  ]
}
```

**Ideas para frontend:**
- 💡 Sección "Te puede gustar" al final de la página de detalle de receta.
- 🔄 Carrusel horizontal de recetas similares con imágenes.
- 🎯 Usar similitud para sugerir variaciones de una receta (ej: si el usuario vio "Pizza Margarita", mostrar otras pizzas).

---

#### POST `/recipes/nutrition`
Estima valores nutricionales de un plato basándose solo en su título o descripción (útil para análisis rápido).

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "Spaghetti Carbonara"
}
```

**Response (200):**
```json
{
  "success": true,
  "nutrition": {
    "calories": {
      "value": 450,
      "unit": "kcal",
      "confidenceRange95Percent": {
        "min": 380,
        "max": 520
      }
    },
    "fat": {
      "value": 18,
      "unit": "g"
    },
    "protein": {
      "value": 22,
      "unit": "g"
    },
    "carbs": {
      "value": 48,
      "unit": "g"
    }
  }
}
```

**Uso en frontend:**
```javascript
const response = await fetch('/api/recipes/nutrition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Grilled Salmon with Vegetables' })
});

const data = await response.json();
console.log(`Calorías estimadas: ${data.nutrition.calories.value} kcal`);
```

**Ideas para frontend:**
- 📊 Input de texto donde el usuario escribe un plato y ve su información nutricional estimada al instante.
- 🥗 Comparador de platos: permite ingresar varios títulos y comparar sus valores nutricionales lado a lado.
- 🎯 Calcular si un plato se ajusta a objetivos nutricionales del usuario (ej: dieta baja en carbohidratos).

---

