import { Router } from "express";
import fetch from "node-fetch";

const router = Router();
const ALEXA_USER_ID = Number(process.env.ALEXA_USER_ID || 1);

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


const guessCategory = (name="") => {
  const n = name.toLowerCase();
  if (/(leche|yogur|queso)/.test(n)) return "lacteos";
  if (/(manzana|plátano|platano|tomate|lechuga|zanahoria)/.test(n)) return "fruta_verdura";
  if (/(arroz|pasta|harina|aceite|sal|azúcar|azucar)/.test(n)) return "despensa";
  if (/(agua|coca|cerveza|zumo)/.test(n)) return "bebidas";
  return null;
};


const PAGE_SIZE = 5;

async function getProductsForAlexa() {
  const r = await fetch(`http://localhost:3000/products?user_id=${ALEXA_USER_ID}`);
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
  if (q === 1) return `1 unidad de ${name}`;
  return `${q} unidades de ${name}`;
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



function buildListSpeech(items, offset) {
  const start = offset || 0;
  const end = Math.min(start + PAGE_SIZE, items.length);
  const slice = items.slice(start, end);

  const lista = slice.map(formatItemForList).join(", ");
  const hasMore = end < items.length;

  return {
    text: hasMore
      ? `Tienes: ${lista}. ¿Quieres que siga?`
      : `Tienes: ${lista}. Eso es todo lo que hay en tu despensa.`,
    nextOffset: end,
    hasMore
  };
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


router.post("/", async (req, res) => {
  try {
    const type   = req.body?.request?.type;
    const intent = req.body?.request?.intent?.name;
    const slots  = req.body?.request?.intent?.slots || {};
    const sessionAttrs = req.body?.session?.attributes || {};


    if (type === "LaunchRequest") {
      return res.json(say("Hola, soy Scan2Cook Assistant.En qué te puedo ayudar? " +
      "Puedes decir: añade tres tomates, qué tengo en la despensa, elimina dos pepinos, vacía la despensa o dime una receta."));
    }

    if (type === "IntentRequest" && intent === "AddProductIntent") {
      console.log("SLOTS AddProduct:", JSON.stringify(slots, null, 2));

      const rawProduct = (getSlotValue(slots, "producto") || "").trim();
      let quantitySlot = getSlotValue(slots, "cantidad");

      let quantity = Number(quantitySlot);
      let name = rawProduct;

      // Si la cantidad del slot no es un número válido, intentamos sacarla del propio "producto"
      if (!Number.isFinite(quantity) || quantity < 1) {
        const { qty, name: cleaned } = extractQtyAndName(rawProduct, 1);
        quantity = qty;
        name = cleaned;
      } else {
        // Tenemos cantidad en su slot; por si acaso el nombre también viene con número delante, lo limpiamos
        const { name: cleaned } = extractQtyAndName(rawProduct, quantity);
        name = cleaned;
      }

      if (!name) {
        return res.json(
          say("No entendí qué producto quieres añadir. Di, por ejemplo: añade 3 pepinos.")
        );
      }

      const category = guessCategory(name);
      const expiration_date = null;

      const resp = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: ALEXA_USER_ID,
          name,          // <<-- ya sin números delante
          quantity,      // <<-- número correcto
          category,
          expiration_date
        })
      });

      if (!resp.ok) {
        const msg = await resp.text().catch(() => "");
        console.error("POST /products fallo:", resp.status, msg);
        return res.json(
          say("No he podido guardar el producto ahora mismo. Inténtalo más tarde.")
        );
      }

      const texto =
        quantity === 1
          ? `He añadido 1 ${name} a tu despensa.`
          : `He añadido ${quantity} ${name} a tu despensa.`;

      return res.json(say(`${texto} ¿Quieres hacer algo más con tu despensa?`));
    } 

    // 2) Listar productos: "qué tengo", "qué hay en la despensa"
    if (type === "IntentRequest" && intent === "ListProductsIntent") {
      const items = await getProductsForAlexa();
      if (items === null) {
        return res.json(say("No pude consultar tu despensa ahora mismo."));
      }
      if (items.length === 0) {
        return res.json(say("Tu despensa está vacía."));
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
        return res.json(say("No pude consultar tu despensa ahora mismo."));
      }
      if (items.length === 0) {
        return res.json(say("Tu despensa está vacía."));
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
          say("No entendí qué producto quieres borrar. Di, por ejemplo: elimina los pepinos.")
        );
      }

      const searchTerm = normalize(rawName);
      console.log("Remove slots:", JSON.stringify(slots, null, 2));
      console.log("Remove searchTerm:", searchTerm, "qtyRequested:", qtyRequested);

      const items = await getProductsForAlexa();
      if (!items || items.length === 0) {
        return res.json(say("Tu despensa está vacía."));
      }

      const matches = items.filter((p) => {
        const n = normalize(p.name);
        return n.includes(searchTerm) || searchTerm.includes(n);
      });

      if (matches.length === 0) {
        return res.json(say(`No he encontrado ${rawName} en tu despensa.`));
      }

      // Por simplicidad: cogemos el más reciente (por ejemplo, id más alto)
      const target = matches.sort((a, b) => b.id - a.id)[0];

      const currentQty = target.quantity || 0;

      if (currentQty <= qtyRequested) {
        // Si pide borrar igual o más de lo que hay → eliminamos el producto entero
        console.log(`Deleting product id=${target.id} (qty ${currentQty} <= requested ${qtyRequested})`);
        await fetch(`http://localhost:3000/products/${target.id}`, {
          method: "DELETE",
        });

        return res.json(
          say(`He borrado todas las unidades de ${target.name} de tu despensa.`)
        );
      } else {
        // Todavía quedará algo: actualizamos cantidad
        const newQty = currentQty - qtyRequested;
        console.log(`Updating product id=${target.id} from ${currentQty} to ${newQty}`);

        const respUpdate = await fetch(`http://localhost:3000/products/${target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQty }),
        });

        if (!respUpdate.ok) {
          const txt = await respUpdate.text().catch(() => "");
          console.error("PUT /products error", respUpdate.status, txt);
          return res.json(say("No he podido actualizar ese producto ahora mismo."));
        }

        const texto =
          qtyRequested === 1
            ? `He borrado 1 ${target.name}. Te quedan ${newQty}.`
            : `He borrado ${qtyRequested} ${target.name}. Te quedan ${newQty}.`;

        return res.json(say(texto));
      }
    }


        // Vaciar toda la despensa: "vacía la despensa", "borra todo"
    if (type === "IntentRequest" && intent === "ClearDespensaIntent") {
      const items = await getProductsForAlexa();
      if (!items || items.length === 0) {
        return res.json(say("Tu despensa ya está vacía."));
      }

      // Borramos todos los productos de este usuario
      await Promise.allSettled(
        items.map(p =>
          fetch(`http://localhost:3000/products/${p.id}`, { method: "DELETE" })
        )
      );

      return res.json(say("He vaciado tu despensa por completo."));
    }

        // Comprobar si tengo un producto: "¿tengo leche?", "me queda arroz?"
    if (type === "IntentRequest" && intent === "CheckProductIntent") {
      const rawName = (getSlotValue(slots, "producto") || "").trim();
      const nameSearch = normalize(rawName);

      if (!nameSearch) {
        return res.json(say("No entendí qué producto quieres comprobar. Di, por ejemplo: ¿tengo leche?"));
      }

      const items = await getProductsForAlexa();
      if (!items || items.length === 0) {
        return res.json(say("Tu despensa está vacía, no tienes nada aún."));
      }

      const matches = items.filter(p => normalize(p.name).includes(nameSearch));
      if (matches.length === 0) {
        return res.json(say(`No, no tienes ${rawName} en la despensa.`));
      }

      const totalQty = matches.reduce((acc, p) => acc + (p.quantity || 0), 0);

      if (totalQty <= 0) {
        return res.json(say(`No, no te queda ${rawName}.`));
      }

      // Cogemos el nombre del primer match para contestar algo amigable
      const refName = matches[0].name;
      return res.json(
        say(`Sí, tienes ${totalQty} de ${refName} en tu despensa.`)
      );
    }

        // Usuario dice "no" -> cerrar sesión
    if (type === "IntentRequest" && intent === "AMAZON.NoIntent") {
      return res.json(say("De acuerdo, hasta luego.", true)); // shouldEndSession = true
    }

    // Usuario dice "sí" después de "¿Algo más?"
    if (type === "IntentRequest" && intent === "AMAZON.YesIntent") {
      // Podemos redirigir a una especie de menú
      return res.json(
        say(
          "Vale. Puedes decir, por ejemplo: añade tres tomates; qué tengo en la despensa; o dime una receta."
        )
      );
    }

    if (
      type === "IntentRequest" &&
      (intent === "AMAZON.StopIntent" || intent === "AMAZON.CancelIntent")
    ) {
      return res.json(say("¡Hasta luego!", true));
    }

    return res.json(say("No te he entendido. Prueba a decir: añade 2 manzanas."));
  } catch (e) {
    console.error("Alexa error:", e);
    return res.status(200).json(say("Hubo un problema. Intenta de nuevo."));
  }
});

export default router;
