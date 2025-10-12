# Configuración inicial de Docker para el proyecto Scan2Cook
Este documento explica cómo levantar el entorno completo de Scan2Cook desde el primer día utilizando Docker y Docker Compose.

Así todos los miembros del equipo trabajan con el mismo entorno, sin necesidad de instalar manualmente bases de datos ni dependencias globales.

## 1. Requisitos previos
Asegúrate de tener instalado:
- Docker Engine (verifica con `docker --version`)
- Docker Compose (verifica con `docker compose version`)
- Node.js (opcional) → solo necesario si quieres probar el backend sin Docker.

## 2. Estructura esperada del proyecto
Aseguraos de que teneis estos files (los dockers) asi distribuidos.
```
Scan2Cook/
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── ...
├── database/
│   ├── init.sql
│   ├── seed.sql
│   └── README.md
└── docker-compose.yml
```
## 3. Primer arranque con Docker Compose
Desde la raíz del proyecto, ejecuta:

```
docker compose up --build
```

Esto hará lo siguiente:
1. Construirá la imagen del backend usando el `Dockerfile` en `/backend/`.
2. Creará un contenedor para PostgreSQL con la base de datos `scan2cook`.
3. Conectará ambos contenedores dentro de la misma red interna de Docker.

## 4. Contenido del archivo [docker-compose.yml](../docker-compose.yml) (explicación de cómo funciona)

- db → es el contenedor con PostgreSQL. Al iniciarse, ejecuta automáticamente los scripts init.sql y seed.sql.
- backend → se construye desde el Dockerfile, instala dependencias y levanta el servidor Express.
- depends_on → asegura que el backend no arranque hasta que la base de datos esté lista.


## 5. Verificar que todo funciona
1. Comprobar que puedes acceder al backend desde tu navegador:

- Acceded a http://localhost:3000

- Deberiais ver el mensaje “Scan2Cook API funcionando ✅”

2. Verificar que la base de datos se ha creado:

Abrid otra terminaly acceded al contenedor de la base de datos.
```bash
docker exec -it scan2cook_db bash
```
Dentro del contenedor podeis acceder a PostgreSQL.
```bash
psql -U postgres -d scan2cook
```
Comprobar las tablas.
```pgsql
\dt
```
Podeis hacer alguna consulta:
```pgsql
SELECT * FROM productos;
```

Para salir `exit`.

 <p align="center">
      
<img width="1920" height="1080" alt="Captura de pantalla de 2025-10-12 12-35-07" src="https://github.com/user-attachments/assets/2f073c43-49b8-4fa9-a8c1-d85066f9d39e" />

Output esperado
 </p>

 

## 6. Comandos útiles
| Acción                     | Comando                                                      |
| -------------------------- | ------------------------------------------------------------ |
| Iniciar todo               | `docker compose up --build`                                  |
| Parar todo                 | `docker compose down`                                        |
| Ver contenedores activos   | `docker ps`                                                  |
| Entrar en la base de datos | `docker exec -it scan2cook_db psql -U postgres -d scan2cook` |
| Ver logs del backend       | `docker logs scan2cook_backend`                              |
| Reconstruir imágenes       | `docker compose build --no-cache`                            |

