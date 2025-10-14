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
│   ├── recipes.js          → Consultas y búsqueda de recetas
│   └── ocr.js              → Procesa tickets mediante el microservicio OCR
│
├── middlewares/            → Funciones que se ejecutan antes de las rutas
│   └── authGuard.js        → Verifica token JWT
│
├── lib/                    → Funciones auxiliares y utilidades
│   ├── validate.js         → Esquemas de validación con Zod
│   └── parseTicketText.js  → Limpia texto OCR y genera lista de productos
│
└── repos/                  → Capa de datos, abstracción sobre la BD
    ├── memoryUsers.js      → Simula tabla de usuarios en memoria
    ├── memoryProducts.js   → Simula inventario de productos
    └── recipes.repo.memory.js → Lista de recetas e ingredientes simulados

```

## Sin docker (por si quereis hacer testing)
### 1. Requisitos previos
- Node.js v20 o superior

### 2. Instalación del entorno
Antes de ejecutar el backend por primera vez, asegúrate de instalar las dependencias indicadas en el archivo ``package.json``.

En la terminal, estando dentro de la carpeta ``backend/``, ejecuta:
```bash
npm install
```
Esto instalará automáticamente todos los módulos que el backend necesita para funcionar.

### 3. Añadir nuevas dependencias
Cuando la desarrolladora de backend necesite instalar una nueva librería, debe hacerlo así:

1️⃣ Instalar la librería:
```bash
npm install nombre-paquete
```
2️⃣ Verificar que funciona en local.


### 4. Ejecución del servidor
Una vez instaladas las dependencias, puedes ejecutar el servidor en modo desarrollo:
```bash
node server.js
```
Deberías ver el mensaje:
```
✅ “Scan2Cook API funcionando en puerto 3000”
```

## Con Docker, uso del Dockerfile 
El archivo Dockerfile sirve para empaquetar el backend dentro de un contenedor Docker.

El comando será:
```bash
docker build -t scan2cook-backend .
docker run -p 3000:3000 scan2cook-backend
```

> [!NOTE]
> Estos comandos son informativos, para iniciar el backend junto con la base de datos, que es lo ideal para probarlo todo, es suficiente ejecutar el paso 3 de [configuracion_docker_inicial.md](../docs/configuracion_docker_inicial.md) :kissing_smiling_eyes: