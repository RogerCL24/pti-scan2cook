# Backend – API REST de Scan2Cook
El backend es el núcleo del proyecto.
Se encarga de manejar las peticiones de la app (frontend), conectarse a la base de datos y procesar la información de productos, recetas y usuarios.

## 📁 Estructura del directorio
```
backend/
│
├── Dockerfile          → Configuración para crear el contenedor Docker
├── package.json        → Lista de dependencias Node.js
├── server.js           → Punto de entrada del servidor (Express)
└── README.md           → Este archivo
```

## 1. Requisitos previos
- Node.js v20 o superior

## 2. Instalación del entorno
Antes de ejecutar el backend por primera vez, asegúrate de instalar las dependencias indicadas en el archivo ``package.json``.

En la terminal, estando dentro de la carpeta ``backend/``, ejecuta:
```bash
npm install
```
Esto instalará automáticamente todos los módulos que el backend necesita para funcionar.

## 3. Añadir nuevas dependencias
Cuando la desarrolladora de backend necesite instalar una nueva librería, debe hacerlo así:

1️⃣ Instalar la librería:
```bash
npm install nombre-paquete
```
2️⃣ Verificar que funciona en local.


## 4. Ejecución del servidor
Una vez instaladas las dependencias, puedes ejecutar el servidor en modo desarrollo:
```bash
node server.js
```
Deberías ver el mensaje:
```
✅ “Scan2Cook API funcionando en puerto 3000”
```

## 5. Uso del Dockerfile (más adelante)
El archivo Dockerfile sirve para empaquetar el backend dentro de un contenedor Docker.

Por ahora, no es necesario usarlo, ya que Docker se configurará al final del proyecto (cuando todo funcione localmente).

Cuando llegue ese momento, el comando será:
```bash
docker build -t scan2cook-backend .
docker run -p 3000:3000 scan2cook-backend
```
