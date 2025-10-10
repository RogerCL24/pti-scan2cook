# Base de Datos – Scan2Cook

Este módulo contiene los scripts SQL necesarios para crear y poblar la base de datos del proyecto Scan2Cook.
El objetivo es gestionar la información de usuarios, productos en la despensa y recetas disponibles.

## 📁 Archivos principales
| Archivo | Descripción |
| -------- | ---------- |
| ``init.sql`` | Crea las tablas principales: usuarios, productos, recetas e ingredientes. |
| ``seed.sql`` | Inserta datos iniciales de prueba para poder testear el backend. |

## Concepto general
El sistema parte de un modelo simple:
- **Usuarios** (users) → cada persona con su despensa.

- **Productos** (products) → los alimentos que el usuario tiene registrados.

- **Recetas** (recipes) → propuestas de platos que puede cocinar.

- **Ingredientes** (ingredients) → qué productos necesita cada receta.

Las relaciones se definen con claves foráneas y borrado en cascada para mantener la integridad referencial.

## Cómo ejecutar los scripts
Ejecutarlos manualmente desde el terminal de PostgreSQL:
```bash
psql -U postgres -d scan2cook -f init.sql
psql -U postgres -d scan2cook -f seed.sql
```
O desde DBeaver, PgAdmin, o cualquier cliente SQL conectado a la base de datos.

> [!NOTE] 
> Estos scripts se ejecutarán automáticamente más adelante mediante Docker Compose.
> En desarrollo se puede ejecutar manualmente cada vez que se quiera reiniciar los datos.
> Si se añaden nuevas tablas o relaciones, deben documentarse aquí y actualizar ``init.sql``.

## Autor
