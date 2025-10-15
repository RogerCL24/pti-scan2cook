````markdown
# 🧠 Módulo OCR – Scan2Cook  
### Reconocimiento automático de tickets de compra con **Tesseract.js**

---

## 📄 Descripción general

El módulo **OCR (Optical Character Recognition)** permite leer **tickets de compra o facturas** a partir de una imagen.  
Utiliza **Tesseract.js** para extraer el texto, lo procesa para identificar **productos y precios**, y los clasifica por tipo (alimentación, cosmética, limpieza, etc.).

Forma parte del **backend de Scan2Cook**, integrándose con el **sistema de inventario** para actualizar automáticamente los productos que el usuario tiene en su despensa.

---

## 🧩 Estructura del módulo

```bash
backend/
├── routes/
│   └── ocr.js                 # Endpoint /ocr/receipt
└── services/
    └── ocr/
        ├── tesseract.js       # Reconocimiento de texto (OCR)
        ├── parser.js          # Limpieza y extracción de productos
        └── classifier.js      # Clasificación (alimentación, cosmética, etc.)
````

---

## ⚙️ Dependencias principales

| Librería         | Uso principal                                        |
| ---------------- | ---------------------------------------------------- |
| **express**      | Servidor web y gestión de rutas                      |
| **multer**       | Subida de imágenes (form-data)                       |
| **tesseract.js** | OCR (reconocimiento óptico de texto)                 |
| **sharp**        | Preprocesado de imágenes (rotar, escalar, binarizar) |

Instalación de dependencias:

```bash
cd backend
npm install express multer tesseract.js sharp
```

---

## 🚀 Flujo de funcionamiento

1️⃣ El usuario envía una **imagen del ticket** al endpoint `/ocr/receipt`.
2️⃣ El servidor procesa la imagen con **Sharp** (ajuste de tamaño, escala de grises, binarización).
3️⃣ **Tesseract.js** extrae el texto del ticket.
4️⃣ El **parser.js** limpia el texto y detecta líneas con nombre y precio.
5️⃣ El **classifier.js** clasifica cada producto según su tipo.
6️⃣ El resultado se devuelve en formato **JSON**.

---

## 🧠 Ejemplo de funcionamiento (MVP)

### 📥 Entrada: imagen con texto

```
LECHE SEMI 1L       0,95 €
GEL DUCHA ALOE      1,25 €
ARROZ 1KG           1,10 €
```

### 📤 Salida JSON esperada:

```json
{
  "items": [
    { "name": "LECHE SEMI 1L", "price": 0.95, "category": "alimento" },
    { "name": "GEL DUCHA ALOE", "price": 1.25, "category": "cosmética" },
    { "name": "ARROZ 1KG", "price": 1.10, "category": "alimento" }
  ],
  "totalLines": 3
}
```

---

## 🧪 Testing previsto

🧾 **Casos de prueba:**

* Tickets de diferentes supermercados (Mercadona, Lidl, Carrefour, Eroski)
* Tickets impresos vs. digitales
* Imágenes borrosas o con iluminación desigual

⚙️ **Ajustes a evaluar:**

* Precisión de lectura OCR
* Variaciones en preprocesado (threshold, resize, grises)
* Detección de errores en parsing

---

## 🧭 Próximos pasos

| Etapa                         | Descripción                           | Estado           |
| ----------------------------- | ------------------------------------- | ---------------- |
| 🧩 **Integración OCR básica** | Implementar `tesseract.js` con Multer | ✅ Hecho          |
| 🧠 **Parser**                 | Extraer nombre y precio por línea     | 🔜 En desarrollo |
| 🎯 **Classifier**             | Clasificar productos por tipo         | 🔜 Pendiente     |
| 🔌 **Integración Express**    | Endpoint `/ocr/receipt` operativo     | ✅ Hecho          |
| 🧪 **Testing real**           | Tickets reales (jpg/png)              | 🔜 Parcialmente  |
| 🤖 **Versión IA**             | Clasificación inteligente con ML      | 🧩 Futuro        |

---

## 💡 Tip

Para probar el OCR, ejecuta el backend y envía un `POST` con una imagen al endpoint `/ocr/receipt`.

Ejemplo:

```bash
curl -X POST http://localhost:3000/ocr/receipt \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/ruta/a/tu/ticket.jpg"
```

---

## 👩‍💻 Autora del módulo

**Zineb Bensaid Janah**
*OCR & IA Integration – Scan2Cook Project*
🎓 **Universitat Politècnica de Catalunya (UPC)**
📆 **PTI 2025**

