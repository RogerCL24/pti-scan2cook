# 🥫 Scan2Cook – Tu despensa inteligente

**Proyecto PTI – Curso 2025**  
Gestor de inventario doméstico con OCR, recetas y asistente de voz.

---

## 🚀 Descripción general

Scan2Cook es una aplicación que permite registrar los productos que el usuario tiene en su despensa o nevera, **leer tickets de compra con OCR** y **recomendar recetas** basadas en los ingredientes disponibles.  
El sistema está compuesto por varios módulos conectados mediante una arquitectura **cliente-servidor**, con componentes Dockerizados para facilitar el despliegue y el trabajo en equipo.

---

## 👥 Equipo

| Rol | Nombre |
|-----|--------|
| Backend (API REST) | Irene |
| Base de datos (PostgreSQL, modelo de datos) | Roger |
| OCR (Tesseract / Vision API) | Zineb |
| Integración API recetas (Spoonacular) | Salma |
| Frontend (React – login, inventario, recetas) | Glaira |
| IA Recetas / Algoritmo recomendación | Roger |
| Integración voz (Alexa / Google Assistant) | Zineb |
| Gamificación y módulo social | Irene |


---

## 🧩 Tecnologías principales

- **Frontend:** React  
- **Backend:** Node.js + Express  
- **Base de datos:** PostgreSQL  
- **OCR:** Tesseract.js / Google Vision API  
- **Recetas:** API externa (Spoonacular)  
- **Contenedores:** Docker y Docker Compose  
- **Autenticación:** JWT  
- **Seguridad:** HTTPS  

---

## 🛠️ Requisitos previos

Antes de empezar, asegúraos de tener instalado en vuestro equipo:

- [Git](https://git-scm.com/downloads)
- [Node.js 20+](https://nodejs.org/)
- [Docker](docs/instalacion_docker.md)
- Visual Studio Code (recomendado)

---

> [!TIP]
> Recomiendo hacerlo en **Linux**, docker es mucho más fácil de instalar ahí.

## 📦 Instrucciones de instalación

### 1️⃣ Clonar el repositorio
Abre tu terminal o Visual Studio Code y ejecuta:

```bash
# 1. Crear una carpeta para tus proyectos (solo la primera vez)
mkdir ~/Proyecto
cd ~/Proyecto

# 2. Clonar el repositorio
git clone https://github.com/RogerCL24/pti-scan2cook.git

# 3. Entrar en la carpeta del proyecto
cd pti-scan2cook
```

### 2️⃣ Estructura del proyecto

```mermaid
graph TD
  A[Scan2Cook] --> B[backend]
  A --> C[frontend]
  A --> D[database]
  A --> E[docker]
  A --> F[docs]
  A --> G[ocr]
  
  subgraph Backend
    B1[server.js]
    B2[Dockerfile]
    B3[package.json]
    B4[routes: auth, ocr, products]
  end

  subgraph Frontend
    C1[index.html]
    C2[Dockerfile]
    C3[nginx.conf]
    C4[src: App, pages, components, api, hooks]
  end

  D --> D1[init.sql]
  D --> D2[seed.sql]

  F --> F1[instalacion_docker.md]
  F --> F2[metodologia_git.md]
  F --> F3[DEPLOY.md]

  A --> H[docker-compose.yml]
  A --> I[README.md]
  A --> J[.gitignore]
```

## 🆕 Cambios recientes y archivos importantes

He agregado un frontend tipo PWA (Vite + React + Tailwind) y documentación de despliegue. Aquí un resumen breve para el equipo:

- frontend/
  - `Dockerfile` - Multi-stage build: genera la app con Vite y sirve los archivos estáticos con Nginx.
  - `nginx.conf` - Configuración de Nginx que sirve el build y proxya `/api` a `backend:3000`. Se incrementó `client_max_body_size` a 10M para soportar cargas de imágenes.
  - `src/` - Código fuente React con:
    - `pages/` - `LoginPage`, `RegisterPage`, `ScanPage`, `ReviewPage`.
    - `components/` - `Header`, `ErrorModal` (muestra errores completos para debugging), y componentes UI reutilizables.
    - `api/` - Wrappers Axios (`client.js`, `auth.js`, `ocr.js`, `products.js`) que usan rutas relativas `/api`.
    - `hooks/useAuth.js` - Manejo de token en localStorage y contexto de autenticación.

- docs/DEPLOY.md - Instrucciones para levantar la aplicación con Docker Compose (recomendado: `docker compose up --build`). Explica variables de entorno necesarias y notas sobre acceso desde la LAN.

Notas rápidas para el equipo:

- No incluir nombres internos de host (`backend:3000`) en el bundle cliente; usar rutas relativas `/api` y dejar que Nginx haga el proxy.
- Si las imágenes son grandes, comprimir o redimensionar en el cliente antes de enviar para evitar 413 y mejorar UX (no implementado automáticamente).
- Para desarrollo local, ejecutar `docker compose up --build` y acceder desde el móvil usando la IP del equipo en la LAN apuntando al puerto del frontend (por defecto 5173 en el host, mapeado a 80 en el contenedor en la configuración actual).


### 3️⃣ Cómo trabajar (guía)
1. Lee la guía dentro de /docs/ -> [metodologia_git.md](docs/metodologia_git.md)
2. Despues de haber instalado docker, probad la app -> [configuracion_docker_inicial.md](docs/configuracion_docker_inicial.md)

### 📚 Créditos
Proyecto desarrollado por el grupo Scan2Cook – PTI 2025.
[Universitat Politecnica de Catalunya](https://github.com/UPC), Departament de Tecnologies de la Informació.