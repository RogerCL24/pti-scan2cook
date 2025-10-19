# Instrucciones para desplegar Scan2Cook (desarrollo)

Este documento explica cómo levantar el entorno completo con Docker Compose para desarrollo y pruebas.

Requisitos:
- Docker y Docker Compose instalados
- Git

Pasos:
1. Clonar el repositorio
```bash
git clone <repo-url>
cd pti-scan2cook
```

2. Construir y levantar los servicios (base de datos, backend, frontend)
```bash
docker compose up --build
```

3. Acceder a la aplicación
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

Notas importantes:
- El frontend está servido por nginx y proxia `/api` hacia el backend dentro del mismo docker-compose. No es necesario establecer variables de entorno para la API al ejecutar localmente.
- Si quieres probar desde otro dispositivo en la red, abre `http://<IP_DEL_HOST>:5173`.
- Si tienes problemas con el tamaño de las imágenes OCR, revisa `frontend/nginx.conf` (client_max_body_size).

Logs y depuración:
- Logs del backend:
```bash
docker compose logs -f backend
```
- Logs del frontend (nginx):
```bash
docker compose logs -f frontend
```

Si tu equipo tiene preguntas o necesita variables secretas (p. ej. credenciales de Google Vision), añade un fichero `.env` en el directorio `backend/` con las variables necesarias y actualiza `docker-compose.yml` para montar ese fichero como volumen o pasar las variables.
