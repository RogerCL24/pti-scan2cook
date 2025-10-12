# Metodología de trabajo con Git y ramas
Este documento explica cómo deberiamos trabajar con GitHub: cómo crear ramas, subir cambios, actualizarlas, fusionarlas y mantener el repositorio limpio y estable.

## Estructura de ramas del proyecto
``main`` → Rama principal (solo código funcional y probado).

``Ramas individuales`` → Cada miembro del grupo trabaja en su propia rama.


Ejemplo:

- ``roger-backend``
- ``zineb-ocr``
- ``irene-frontend``
- ``glaira-database``
- ``salma-docker``

---

## Instalaos la extension `GitHub Pull Requests` 
1. En VSCode id a extensiones > Buscad 'GitHub Pull Requests' > Instalar
2. En la a barra lateral de la izquierda darle al gatito de github y hacer el Sign In.

> [!NOTE]
> Para push (subir cambios), GitHub siempre requiere autenticación, incluso en repos públicos, porque debes probar que eres el propietario o un colaborador autorizado. No puedes push anónimamente. 
> Tenéis esta opción con la extensión o con SSH (o HTTPS, pero es un engorro).

## Flujo de trabajo recomendado (Git Flow simplificado)

### 1️⃣ Clonar el repositorio (solo una vez, ya lo habréis hecho maybe):
```bash
git clone https://github.com/RogerCL24/scan2cook.git
cd pti-scan2cook
```

### 2️⃣ Actualizar el repositorio local (cada día antes de trabajar):
```bash
git pull origin main
```

### 3️⃣ Crear tu rama personal (solo la primera vez):
```bash
git checkout -b nombre-rama 
```
Ejemplo:
```bash
git checkout -b irene-frontend
```

### 4️⃣ Trabajar en tu código y guardar los cambios:
- Edita tus archivos.
- Comprueba que funciona en local.

### 5️⃣ Subir los cambios a tu rama personal:
```bash
git push origin nombre-rama
```
Ejemplo:
```bash
git push origin irene-frontend
```
---
## Actualizar tu rama con los últimos cambios de main
Antes de seguir trabajando (**cada 2-3 días o antes de hacer un merge**), actualiza tu rama para evitar conflictos:

```bash
git checkout main
git pull origin main
git checkout nombre-rama
git merge main
```
> [!NOTE]
> Si hay conflictos, Git te los mostrará y deberás resolverlos manualmente (VS Code lo facilita mucho).

## 🤝 Fusionar (merge) tu rama a main
Cuando hayas terminado una funcionalidad y esté probada:
1. Asegúrate de que estás actualizado:
```bash
git checkout main
git pull origin main
git checkout nombre-rama
git merge main
```

2. Haz un pull request (PR) en GitHub desde la rama ``nombre-rama`` hacia ``main``.

3. Los coordinadores/as revisan el código, y si todo está correcto, fusiona (merge) el PR en ``main``.

> [!WARNING]
> Nunca hagas ``git push origin main`` directamente si tu trabajo no ha sido revisado.


## 💡 Comandos útiles del día a día
| Acción                                      | Comando                       | Descripción                    |
| ------------------------------------------- | ----------------------------- | ------------------------------ |
| Ver ramas                                   | `git branch`                  | Lista las ramas locales        |
| Cambiar de rama                             | `git checkout nombre-rama`    | Moverte entre ramas            |
| Crear rama nueva                            | `git checkout -b nombre-rama` | Crea y cambia a esa rama       |
| Borrar rama local                           | `git branch -d nombre-rama`   | Borra una rama ya fusionada    |
| Ver estado                                  | `git status`                  | Muestra archivos modificados   |
| Ver historial                               | `git log --oneline`           | Lista commits breves           |
| Deshacer último commit (sin borrar cambios) | `git reset --soft HEAD~1`     | Revierte un commit             |
| Guardar cambios temporales                  | `git stash`                   | Guarda sin hacer commit        |
| Recuperar cambios guardados                 | `git stash pop`               | Recupera los cambios guardados |


## Flujo de trabajo ideal (resumen)
1.  Haces ``git pull origin main`` para tener la última versión.

2. Trabajas en tu rama (``irene-frontend``, por ejemplo).

3. Haces commits pequeños y claros.

4. Haces ``git push origin tu-rama``.

5. Cuando todo funciona, abres un Pull Request a main.

6. El coordinador/a revisa y aprueba el merge.