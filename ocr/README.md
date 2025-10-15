🧠 Módulo OCR – Scan2Cook

Reconocimiento automático de tickets de compra mediante Tesseract.js

📄 Descripción general

El módulo OCR (Optical Character Recognition) permite leer tickets de compra a partir de una imagen o fotografía.
Extrae el texto con Tesseract.js, procesa las líneas para obtener los productos y precios, y clasifica cada ítem según su tipo (alimento, cosmética, limpieza, etc.).

Este módulo forma parte del backend de Scan2Cook, y se integra con el sistema de inventario para actualizar automáticamente los productos que el usuario tiene en su despensa.

🧩 Estructura del módulo

backend/
└── src/
    ├── routes/
    │   ├── ocr.js                ← Endpoint /ocr/receipt
    ├── services/
    │   ├── ocr/
    │   │   ├── tesseract.js      ← Reconocimiento de texto
    │   │   ├── parser.js         ← Limpieza y extracción de productos
    │   │   └── classifier.js     ← Clasificación (alimentación, cosmética, etc.)

⚙️ Dependencias principales

| Librería         | Uso                                                  |
| ---------------- | ---------------------------------------------------- |
| **express**      | Servidor web y gestión de rutas                      |
| **multer**       | Subida de imágenes (form-data)                       |
| **tesseract.js** | OCR (reconocimiento de texto en español)             |
| **sharp**        | Preprocesado de imágenes (rotar, escalar, binarizar) |

Instalación:

cd backend
npm install express multer tesseract.js sharp

🚀 Flujo previsto

1️⃣ El usuario envía una imagen (ticket o factura) a /ocr/receipt.
2️⃣ El servidor procesa la imagen con Sharp (ajuste de tamaño, escala de grises, etc.).
3️⃣ Tesseract.js reconoce el texto del ticket.
4️⃣ Se ejecuta un parser que detecta líneas con nombre y precio.
5️⃣ Cada producto se clasifica según su tipo.
6️⃣ El resultado se devuelve en formato JSON.

🧠 Ejemplo esperado (MVP)

Entrada:
Imagen con texto:

LECHE SEMI 1L       0,95 €
GEL DUCHA ALOE      1,25 €
ARROZ 1KG           1,10 €

Salida JSON:

{
  "items": [
    { "name": "LECHE SEMI 1L", "price": 0.95, "category": "alimento" },
    { "name": "GEL DUCHA ALOE", "price": 1.25, "category": "cosmetica" },
    { "name": "ARROZ 1KG", "price": 1.10, "category": "alimento" }
  ],
  "totalLines": 3
}

🧪 Testing previsto

    Pruebas con distintos tipos de tickets (Mercadona, Lidl, Carrefour…).

    Evaluación de precisión de lectura y parsing.

    Ajuste de parámetros de preprocesado (threshold, resize, etc.).

🧭 Próximos pasos

Implementar tesseract.js para OCR básico.
Crear parser.js para extraer nombre y precio.
Añadir classifier.js con reglas simples.
Integrar endpoint /ocr/receipt en Express.
Probar con tickets reales (jpg/png).
Evaluar versión IA (clasificación inteligente).

👩‍💻 Autora del módulo

Zineb Bensaid Janah– OCR & IA Integration
Universitat Politècnica de Catalunya – PTI 2025