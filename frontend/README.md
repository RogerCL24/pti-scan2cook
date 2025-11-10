# Frontend Scan2Cook (PWA) — Documentación

Este directorio contiene la interfaz web (PWA) construida con Vite + React + Tailwind.

Resumen rápido
- Carpeta: `frontend/`
- Servido en producción por `nginx` (container) y proxia `/api` hacia el backend.
- Desarrollo: `vite` con proxy configurado para `/api`.

Estructura y archivos importantes

- `package.json` — dependencias y scripts (dev/build/preview).
- `vite.config.js` — configuración de desarrollo (proxy para `/api`).
- `postcss.config.cjs`, `tailwind.config.cjs` — configuración Tailwind.
- `index.html`, `manifest.json` — entry y metadata PWA.
- `nginx.conf` — configuración para producción (proxy `/api` → `backend:3000`) y `client_max_body_size`.
- `Dockerfile` — construcción multi-stage: build con node, servir con nginx.

`src/` (código fuente)
- `main.jsx` — punto de entrada y router.
- `App.jsx` — rutas principales y proveedor de autenticación.
- `index.css` — estilos Tailwind y variables.

`src/pages/`
- `LoginPage.jsx` — página de inicio de sesión (valida email y muestra errores).
- `RegisterPage.jsx` — página de registro (validación password mínima, muestra errores y modal con detalles).
- `ScanPage.jsx` — captura/subida de imagen para OCR (validación de tamaño, muestra errores y modal con detalles).
- `ReviewPage.jsx` — lista editable de productos detectados lista para importar.

`src/components/`
- `Header.jsx` — cabecera mínima y navegación.
- `ErrorModal.jsx` — modal reutilizable que muestra el response completo para depuración.

`src/api/`
- `client.js` — wrapper de axios (usa base `/api` y normaliza errores).
- `auth.js`, `ocr.js`, `products.js` — clientes API para endpoints del backend.

`src/hooks/`
- `useAuth.jsx` — contexto de autenticación, guarda token en `localStorage`.

Notas de funcionamiento
- En producción el frontend se sirve en `http://<host>:5173` (nginx) y todas las llamadas a `/api/*` son proxied al servicio `backend` dentro del docker-compose.
- Validaciones realizadas:
	- Registro: email válido; password mínimo 6 caracteres.
	- Escaneo: tamaño de imagen máximo 8MB en cliente; nginx permite hasta 10MB.

Cómo ejecutar (local)
1. En desarrollo (hot-reload):
```bash
cd frontend
npm install
npm run dev
```

2. En producción (Docker):
```bash
docker compose up --build
```

Problemas comunes
- Si ves `413 Request Entity Too Large`, reduce el tamaño de la imagen en cliente o ajusta `client_max_body_size` en `nginx.conf`.

# Interfaz React
