import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

const say = (text, end = false, attrs = {}) => {
  const res = {
    version: "1.0",
    response: {
      outputSpeech: { type: "PlainText", text },
      shouldEndSession: end
    }
  };

  // Guardar estado de sesión (por ejemplo, offset de la lista)
  if (attrs && Object.keys(attrs).length > 0) {
    res.sessionAttributes = attrs;
  }

  return res;
};


const guessCategory = (name = "") => {
  const n = name.toLowerCase();

  // ❄️ FREEZER
  if (
    /(frozen|congelado|congelados|ice cream|helado|helados|peas|frozen pizza|nuggets|fish sticks|verduras congeladas)/.test(
      n
    )
  ) {
    return "freezer";
  }

  // 🧊 FRIDGE
  if (
    /(milk|leche|yogur|yogurt|cheese|queso|jamón|ham|turkey|pavo|butter|mantequilla|eggs|huevo|huevos|fresh juice|zumo fresco)/.test(
      n
    )
  ) {
    return "fridge";
  }

  // 🥫 PANTRY (por defecto casi todo lo demás no frío)
  if (
    /(rice|arroz|pasta|flour|harina|oil|aceite|salt|sal|sugar|azúcar|azucar|cereal|beans|lentejas|lentils|garbanzos|chickpeas|tomato sauce|salsa de tomate|canned|enlatado|galletas|cookies|crackers|bread|pan)/.test(
      n
    )
  ) {
    return "pantry";
  }

  // Si no sabemos, mejor pantry como fallback
  return "pantry";
};



const PAGE_SIZE = 5;

async function getProductsForAlexa() {
  const r = await fetch(`http://localhost:3000/products?skipAuth=alexa`);
  if (!r.ok) return null;
  const items = await r.json();
  if (!Array.isArray(items) || items.length === 0) return [];
  return items;
}

function formatItemForList(p) {
  const q = p.quantity || 0;
  const name = p.name || "";

  // Si el nombre ya tiene cantidad + unidad dentro (ej: "3kg de patatas", "5 bolsas de palomitas")
  const hasEmbeddedUnit = /(\d+)\s*(kg|kilo|kilos|g|gramos?|l|litros?|ml|mililitros?|bolsa|bolsas|pack)/i.test(name);

  if (hasEmbeddedUnit) {
    // Confiamos en el nombre tal cual
    return name;
  }

  if (q <= 0) return name;
  if (q === 1) return `1 unit of ${name}`;
  return `${q} units of ${name}`;
}

// Extrae cantidad y nombre limpio de un string tipo "3 cocacolas" o "cocacolas"
function extractQtyAndName(raw, defaultQty = 1) {
  if (!raw) return { qty: defaultQty, name: "" };

  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d+)\s+(.+)$/);  // ej: "3 cocacolas" -> ["3 cocacolas","3","cocacolas"]

  if (m) {
    return { qty: Number(m[1]), name: m[2].trim() };
  }
  return { qty: defaultQty, name: trimmed };
}

// Divide una frase tipo "3 tomatoes, pasta and milk" en ["3 tomatoes", "pasta", "milk"]
function splitProducts(raw) {
  if (!raw) return [];

  return raw
    .replace(/\s+(y|and)\s+/gi, ",") // "tomatoes and pasta" / "tomates y pasta" -> con coma
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}


function buildListSpeech(items, offset) {
  const start = offset || 0;
  const end = Math.min(start + PAGE_SIZE, items.length);
  const slice = items.slice(start, end);

  const lista = slice.map(formatItemForList).join(", ");
  const hasMore = end < items.length;

  return {
    text: hasMore
      ? `You have: ${lista}. Do you want me to continue?`
      : `You have: ${lista}. That's everything in your pantry.`,
    nextOffset: end,
    hasMore
  };
}

function buildIngredientsFromProducts(items = []) {
  // Coge el nombre del producto
  const names = items
    .map((p) => p.name)
    .filter(Boolean)
    .map((n) =>
      n
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .trim()
    );

  return Array.from(new Set(names));
}


// lee slots en minúscula o mayúscula
const getSlotValue = (slots, key) =>
  slots?.[key]?.value ??
  slots?.[key.charAt(0).toUpperCase() + key.slice(1)]?.value ??
  null;

const normalize = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")                 // quita acentos
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function summarizeRecipe(recipe) {
  const title = recipe.title || "a recipe";

  const used = (recipe.usedIngredients || [])
    .map((i) => i.name)
    .filter(Boolean)
    .join(", ");

  const missing = (recipe.missedIngredients || [])
    .map((i) => i.name)
    .filter(Boolean)
    .join(", ");

  return {
    id: recipe.id,
    title,
    used,
    missing,
  };
}

function recipeSummaryToSpeech(summary) {
  let speech = `With the ingredients in your pantry, I suggest the recipe: ${summary.title}. `;

  if (summary.used) {
    speech += `It uses ingredients like: ${summary.used}. `;
  }

  if (summary.missing) {
    speech += `You would still need: ${summary.missing}. `;
  }

  speech +=
    "If you like this recipe, you can say: read me the instructions. Or you can say: suggest another recipe.";

  return speech;
}


router.post("/", async (req, res) => {
  try {
    const type   = req.body?.request?.type;
    const intent = req.body?.request?.intent?.name;
    const slots  = req.body?.request?.intent?.slots || {};
    const sessionAttrs = req.body?.session?.attributes || {};


    if (type === "LaunchRequest") {
      return res.json(
        say(
          "Hi, I'm your Scan2Cook assistant. How can I help you? " +
            "You can say for example: add three tomatoes, what do I have in my pantry, remove two cucumbers, clear the pantry, or suggest a recipe."
        )
      );
    }

    if (type === "IntentRequest" && intent === "AddProductIntent") {
      console.log("SLOTS AddProduct:", JSON.stringify(slots, null, 2));

      const rawProduct = (getSlotValue(slots, "producto") || "").trim();
      const quantitySlot = getSlotValue(slots, "cantidad");

      // Separar en varios productos si el usuario dice "milk, eggs and pasta"
      const parts = splitProducts(rawProduct);

      if (parts.length === 0) {
        return res.json(
          say(
            "I didn't understand which product you want to add. For example, say: add 3 cucumbers."
          )
        );
      }

      //SOLO UN producto
      if (parts.length === 1) {
        let quantity = Number(quantitySlot);
        let name = parts[0];

        if (!Number.isFinite(quantity) || quantity < 1) {
          const { qty, name: cleaned } = extractQtyAndName(name, 1);
          quantity = qty;
          name = cleaned;
        } else {
          const { name: cleaned } = extractQtyAndName(name, quantity);
          name = cleaned;
        }

        if (!name) {
          return res.json(
            say(
              "I didn't understand which product you want to add. For example, say: add 3 cucumbers."
            )
          );
        }

        const category = guessCategory(name);

        const resp = await fetch(
          "http://localhost:3000/products?skipAuth=alexa",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              quantity,
              category,
            }),
          }
        );

        if (!resp.ok) {
          const msg = await resp.text().catch(() => "");
          console.error("POST /products error:", resp.status, msg);
          return res.json(
            say(
              "I couldn't save the product right now. Please try again later."
            )
          );
        }

        const texto =
          quantity === 1
            ? `I've added 1 ${name} to your pantry.`
            : `I've added ${quantity} ${name} to your pantry.`;

        return res.json(
          say(`${texto} Would you like to do anything else with your pantry?`)
        );
      }

      //VARIOS productos en la misma frase
      let addedCount = 0;
      const addedNames = [];

      for (const part of parts) {
        const { qty, name } = extractQtyAndName(part, 1);
        if (!name) continue;

        const category = guessCategory(name);

        const resp = await fetch(
          "http://localhost:3000/products?skipAuth=alexa",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              quantity: qty,
              category,
            }),
          }
        );

        if (resp.ok) {
          addedCount += 1;
          addedNames.push(`${qty} ${name}`);
        } else {
          const msg = await resp.text().catch(() => "");
          console.error("POST /products error (multi):", resp.status, msg);
        }
      }

      if (addedCount === 0) {
        return res.json(
          say(
            "I couldn't save any of the products you mentioned. Please try again."
          )
        );
      }

      const listForSpeech = addedNames.join(", ");
      const textoMulti = `I've added ${listForSpeech} to your pantry.`;

      return res.json(
        say(`${textoMulti} Would you like to do anything else with your pantry?`)
      );
    }


    // 2) Listar productos: "qué tengo", "qué hay en la despensa"
    if (type === "IntentRequest" && intent === "ListProductsIntent") {
      const items = await getProductsForAlexa();
      if (items === null) {
        return res.json(say("I couldn't access your pantry right now."));
      }
      if (items.length === 0) {
        return res.json(say("Your pantry is empty."));
      }
      const { text, nextOffset, hasMore } = buildListSpeech(items, 0);
      const attrs = hasMore ? { offset: nextOffset } : {};
      // Siempre mantenemos la sesión abierta para que pueda decir "sí", "no", "añade..." etc.
      return res.json(say(text, false, attrs));
    }

    // 3) Seguir listando: "sí, sigue"/"siguiente"
    if (type === "IntentRequest" && intent === "NextProductsIntent") {
      const currentOffset = Number(sessionAttrs.offset || 0);
      const items = await getProductsForAlexa();

      if (items === null) {
        return res.json(say("I couldn't access your pantry right now."));
      }
      if (items.length === 0) {
        return res.json(say("Your pantry is empty."));
      }

      const { text, nextOffset, hasMore } = buildListSpeech(items, currentOffset);
      const attrs = hasMore ? { offset: nextOffset } : {};
      return res.json(say(text, false, attrs));
    }


    
    // Eliminar producto(s) por cantidad: "elimina pepinos", "elimina dos tomates"
    if (type === "IntentRequest" && intent === "RemoveProductIntent") {
      let rawName = (getSlotValue(slots, "producto") || "").trim();
      let qtyRequested = Number(getSlotValue(slots, "cantidad"));

      // Si la cantidad no es válida, intentamos extraerla del propio nombre ("3 cocacolas")
      if (!Number.isFinite(qtyRequested) || qtyRequested < 1) {
        const { qty, name: cleaned } = extractQtyAndName(rawName, 1);
        qtyRequested = qty;
        rawName = cleaned;
      } else {
        // Tenemos cantidad en slot, limpiamos posibles números en el nombre
        const { name: cleaned } = extractQtyAndName(rawName, qtyRequested);
        rawName = cleaned;
      }

      if (!rawName) {
        return res.json(
          say("I didn't understand which product you want to remove. For example, say: remove the cucumbers.")
        );
      }

      const searchTerm = normalize(rawName);
      console.log("Remove slots:", JSON.stringify(slots, null, 2));
      console.log("Remove searchTerm:", searchTerm, "qtyRequested:", qtyRequested);

      const items = await getProductsForAlexa();
      if (!items || items.length === 0) {
        return res.json(say("Your pantry is empty."));
      }

      const matches = items.filter((p) => {
        const n = normalize(p.name);
        return n.includes(searchTerm) || searchTerm.includes(n);
      });

      if (matches.length === 0) {
        return res.json(say(`I couldn't find ${rawName} in your pantry.`));
      }

      // Por simplicidad: cogemos el más reciente (por ejemplo, id más alto)
      const target = matches.sort((a, b) => b.id - a.id)[0];

      const currentQty = target.quantity || 0;

      if (currentQty <= qtyRequested) {
        // Si pide borrar igual o más de lo que hay -> eliminamos el producto entero
        console.log(`Deleting product id=${target.id} (qty ${currentQty} <= requested ${qtyRequested})`);
        await fetch(`http://localhost:3000/products/${target.id}?skipAuth=alexa`, {
          method: "DELETE",
        });

        return res.json(
          say(`I've removed all units of ${target.name} from your pantry.`)
        );
      } else {
        // Todavía quedará algo: actualizamos cantidad
        const newQty = currentQty - qtyRequested;
        console.log(`Updating product id=${target.id} from ${currentQty} to ${newQty}`);

        const respUpdate = await fetch(`http://localhost:3000/products/${target.id}?skipAuth=alexa`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQty }),
        });

        if (!respUpdate.ok) {
          const txt = await respUpdate.text().catch(() => "");
          console.error("PUT /products error", respUpdate.status, txt);
          return res.json(say("I couldn't update that product right now."));
        }

        const texto =
          qtyRequested === 1
            ? `I've removed 1 ${target.name}. You still have ${newQty} left.`
            : `I've removed ${qtyRequested} ${target.name}. You still have ${newQty} left.`;

        return res.json(say(texto));
      }
    }


        // Vaciar toda la despensa: "vacía la despensa", "borra todo"
    if (type === "IntentRequest" && intent === "ClearDespensaIntent") {
      const items = await getProductsForAlexa();
      if (!items || items.length === 0) {
        return res.json(say("Your pantry is already empty."));
      }

      // Borramos todos los productos de este usuario
      await Promise.allSettled(
        items.map(p =>
          fetch(`http://localhost:3000/products/${p.id}?skipAuth=alexa`, { method: "DELETE" })
        )
      );

      return res.json(say("I have completely cleared your pantry."));
    }

        // Comprobar si tengo un producto: "¿tengo leche?", "me queda arroz?"
    if (type === "IntentRequest" && intent === "CheckProductIntent") {
      const rawName = (getSlotValue(slots, "producto") || "").trim();
      const nameSearch = normalize(rawName);

      if (!nameSearch) {
        return res.json(
          say("I didn't understand which product you want to check. For example, say: do I have milk?")
        );
      }

      const items = await getProductsForAlexa();
      if (!items || items.length === 0) {
        return res.json(say("Your pantry is empty, you don't have anything yet."));
      }

      const matches = items.filter(p => normalize(p.name).includes(nameSearch));
      if (matches.length === 0) {
        return res.json(say(`No, you don't have any ${rawName} in your pantry.`));
      }

      const totalQty = matches.reduce((acc, p) => acc + (p.quantity || 0), 0);

      if (totalQty <= 0) {
        return res.json(say(`No, you don't have any ${rawName} left.`));
      }

      // Cogemos el nombre del primer match para contestar algo amigable
      const refName = matches[0].name;
      return res.json(
        say(`Yes, you have ${totalQty} ${refName} in your pantry.`)
      );
    }

    if (type === "IntentRequest" && intent === "SuggestRecipeIntent") {
      const items = await getProductsForAlexa();

      if (items === null) {
        return res.json(say("I couldn't access your pantry right now."));
      }

      if (!items || items.length === 0) {
        return res.json(
          say("Your pantry is empty. Add some products and try again.")
        );
      }

      const ingredients = buildIngredientsFromProducts(items);

      if (ingredients.length === 0) {
        return res.json(
          say("I couldn't recognize any usable ingredients in your pantry.")
        );
      }

      const ingredientsParam = encodeURIComponent(ingredients.join(","));
      const response = await fetch(
        `http://localhost:3000/recipes/suggest?ingredients=${ingredientsParam}&number=3`
      );

      if (!response.ok) {
        return res.json(say("I couldn't search for recipes right now."));
      }

      const data = await response.json();
      const recipes = data.recipes || data || [];

      if (!Array.isArray(recipes) || recipes.length === 0) {
        return res.json(
          say("I couldn't find any recipes with your current ingredients.")
        );
      }

      // 🔥 NUEVO: Guardamos TODA la lista resumida
      const summaries = recipes.map(summarizeRecipe);

      // Primera receta (index = 0)
      const currentIndex = 0;
      const current = summaries[currentIndex];

      const speech = recipeSummaryToSpeech(current);

      const attrs = {
        ...sessionAttrs,
        recipeList: summaries,
        recipeIndex: currentIndex,
        lastRecipeId: current.id,
        lastRecipeTitle: current.title,
      };

      return res.json(say(speech, false, attrs));
    }

    if (type === "IntentRequest" && intent === "NextRecipeIntent") {
      const recipeList = sessionAttrs.recipeList;
      let recipeIndex = sessionAttrs.recipeIndex;

      if (!Array.isArray(recipeList) || recipeList.length === 0) {
        return res.json(
          say("I don't have more recipes stored. Ask me to suggest a recipe first.")
        );
      }

      if (typeof recipeIndex !== "number") {
        recipeIndex = 0;
      }

      const nextIndex = recipeIndex + 1;

      if (nextIndex >= recipeList.length) {
        return res.json(
          say(
            "There are no more recipe options. Ask me again to suggest new recipes!"
          )
        );
      }

      const nextRecipe = recipeList[nextIndex];
      const speech = recipeSummaryToSpeech(nextRecipe);

      const attrs = {
        ...sessionAttrs,
        recipeList,
        recipeIndex: nextIndex,
        lastRecipeId: nextRecipe.id,
        lastRecipeTitle: nextRecipe.title,
      };

      return res.json(say(speech, false, attrs));
    }

    if (type === "IntentRequest" && intent === "ReadRecipeInstructionsIntent") {
      const recipeId = sessionAttrs.lastRecipeId;
      const recipeTitle = sessionAttrs.lastRecipeTitle;

      if (!recipeId) {
        return res.json(
          say("I don't know which recipe you want. First ask me to suggest a recipe.")
        );
      }

      // Llamamos a Spoonacular (o tu backend si lo encapsulas)
      const r = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=${process.env.SPOONACULAR_API_KEY}`
      );

      if (!r.ok) {
        return res.json(
          say("I couldn't fetch the instructions for that recipe right now.")
        );
      }

      const data = await r.json();

      if (!Array.isArray(data) || data.length === 0 || !data[0].steps) {
        return res.json(
          say(`I couldn't find step-by-step instructions for ${recipeTitle}.`)
        );
      }

      const steps = data[0].steps;
      const text = steps.map((s) => `Step ${s.number}: ${s.step}`).join(" ");

      return res.json(
        say(`Here are the instructions for ${recipeTitle}. ${text}`)
      );
    }


        // Usuario dice "no" -> cerrar sesión
    if (type === "IntentRequest" && intent === "AMAZON.NoIntent") {
      return res.json(say("Alright, see you later.", true)); // shouldEndSession = true
    }

    // Usuario dice "sí" después de "¿Algo más?"
    if (type === "IntentRequest" && intent === "AMAZON.YesIntent") {
      // Podemos redirigir a una especie de menú
      return res.json(
        say(
          "Okay. You can say, for example: add three tomatoes; what do I have in my pantry; or suggest a recipe."
        )
      );
    }

    if (
      type === "IntentRequest" &&
      (intent === "AMAZON.StopIntent" || intent === "AMAZON.CancelIntent")
    ) {
      return res.json(say("Goodbye!", true));
    }

    return res.json(
      say(
        "Sorry, I didn't understand that. You can ask me for a recipe or to manage your pantry."
      )
    );
  } catch (e) {
    console.error("Alexa error:", e);
    return res
      .status(200)
      .json(say("Something went wrong while handling your request. Please try again."));
  }
});

export default router;
