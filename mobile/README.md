# Scan2Cook Mobile

Aplicación móvil (React Native + Expo) para:

- Registro e inicio de sesión
- Navegación por pestañas (Home, Pantry, Scan, Recipes, Profile)
- Escaneo de tickets con cámara o galería
- OCR con dos modos (gemini / regex)
- Revisión y guardado de productos en despensa

## Índice

- [1. Requisitos](#1-requisitos)
- [2. Configuración](#2-configuración)
- [3. Estructura](#3-estructura)
- [4. Navegación](#4-navegación)
- [5. Flujo OCR](#5-flujo-ocr)
- [6. Problemas comunes](#6-problemas-comunes)
- [7. Hecho / Pendiente](#7-hecho)
- [8. Checklist](#9-checklist)

## 1. Requisitos

- Node.js 18+
- npm o yarn
- Expo (npx)
- Dispositivo físico (misma Wi‑Fi) o emulador
- Backend corriendo (Docker + Docker Compose)

**Levantar el backend:**

En la raíz del repositorio:

```bash
# Opción 1: en segundo plano (recomendado)
docker compose up -d

# Opción 2: ver logs en tiempo real (bloquea terminal)
docker compose up
```

Ver logs si usaste `-d`:

```bash
docker compose logs -f
```

Detener backend:

```bash
docker compose down
```

## 2. Configuración

Instalar dependencias:

```bash
cd mobile
npm install
```

### Configurar IP del backend

**⚠️ IMPORTANTE:** Cada desarrollador debe configurar su propia IP local.

#### Primera vez (setup inicial):

1. Copia el archivo de ejemplo:

```bash
cp src/constants/config.example.js src/constants/config.js
```

2. Obtén tu IP local:
   - **Linux:** `hostname -I | awk '{print $1}'` o `ip addr show | grep "inet " | grep -v 127.0.0.1`
   - **macOS:** `ipconfig getifaddr en0`
   - **Windows:** `ipconfig` (buscar IPv4)

3. Edita `src/constants/config.js` con tu IP:

```javascript
// src/constants/config.js
export const API_BASE_URL = 'http://TU_IP_AQUI:3000';
// Ejemplo: export const API_BASE_URL = 'http://10.192.167.149:3000';
```

**Nota:** El archivo `config.js` está en `.gitignore` para que cada persona tenga su propia configuración local.

**Ejemplos según entorno:**

- Dispositivo físico: tu IP LAN (ej. 192.168.1.X o 10.192.X.X)
- Android Emulator: http://10.0.2.2:3000
- Genymotion: http://10.0.3.2:3000
- iOS Simulator: http://localhost:3000

Iniciar Expo:

```bash
npx expo start
```

**Abrir en tu dispositivo:**

- **Android:**
  1. Instala [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) desde Play Store
  2. Abre Expo Go
  3. Toca "Scan QR code"
  4. Escanea el QR que aparece en la terminal

- **iOS:**
  1. Instala [Expo Go](https://apps.apple.com/app/expo-go/id982107779) desde App Store
  2. Abre la app Cámara nativa de iOS
  3. Apunta al QR que aparece en la terminal
  4. Toca la notificación que aparece para abrir en Expo Go

**Nota:** Si el QR no funciona, en Expo Go puedes introducir manualmente la URL que aparece en la terminal (ej: `exp://192.168.1.130:8081`).

## 3. Estructura

```
mobile/
  App.js
  src/
    navigation/
      AppNavigator.js    (Stack: Login, Register, MainTabs, Review, RecipeDetail)
      BottomTabs.js      (Tabs: Home, Pantry, Scan, Recipes, Profile)
    screens/
      HomeScreen.js
      LoginScreen.js
      RegisterScreen.js
      PantryScreen.js
      ScanScreen.js
      ReviewScreen.js
      RecipesScreen.js      (búsqueda con caché 24h)
      RecipeDetailScreen.js (detalle con instrucciones mejoradas)
      ProfileScreen.js      (placeholder)
    services/
      api.js             (Axios con token)
      auth.js            (login/register)
      ocr.js             (subida imagen OCR)
      products.js
      recipes.js         (búsqueda y detalle con caché)
    context/
      AuthContext.js     (sesión)
    constants/
      colors.js
      config.js          (API_BASE_URL - NO COMMITEAR)
      config.example.js  (plantilla para config.js)
      categoryIcons.js
    components/
      Button.js
      Input.js
    utils/
      storage.js
      textUtils.js       (parsing inteligente de instrucciones)
```

## 4. Navegación

**Stack:**

- Login
- Register
- MainTabs (contiene los tabs)
- Review (modal para revisar productos)
- RecipeDetail (detalle de receta)

**Tabs:**

- Home (acciones rápidas)
- Pantry (despensa)
- Scan (OCR)
- Recipes (búsqueda de recetas)
- Profile (pendiente)

Después de login/registro:

```js
navigation.replace('MainTabs');
```

Desde Review ir a Pantry:

```js
navigation.navigate('MainTabs', { screen: 'Pantry' });
```

## 5. Flujo OCR

1. Usuario abre Scan
2. Toma foto o selecciona de galería
3. Elige modo: gemini o regex
4. App envía imagen (FormData) a:
   - POST /ocr/gemini
   - POST /ocr/regex
5. Backend devuelve lista de productos
6. App navega a Review con los productos
7. Usuario confirma y guarda en despensa
8. Opcional: ir a Pantry

## 5.1 Flujo de Recetas

1. Usuario abre Recipes
2. Puede buscar por texto o ver sugerencias
3. Resultados se cachean por 24h (búsquedas) o 1h (sugerencias)
4. Al tocar una receta, navega a RecipeDetail
5. RecipeDetail muestra:
   - Imagen y título
   - Tiempo, porciones, health score
   - Ingredientes con checkmarks
   - **Instrucciones numeradas** (parseadas inteligentemente)
   - Descripción

### Parsing de Instrucciones

El sistema prioriza tres fuentes:

1. **analyzedInstructions** (formato estructurado de la API)
   - Detecta múltiples oraciones combinadas en un paso
   - Divide usando `textUtils.splitIntoSentences()`
   - Protege abreviaturas culinarias (F., oz., tbsp., tsp.)
   - Detecta verbos de acción (Preheat, Mix, Bake, etc.)
   - Renumera todos los pasos secuencialmente

2. **instructions HTML** (`<ol><li>`)
   - Parsea listas HTML
   - Detecta encabezados vs pasos
   - Asigna números incrementales

3. **instructions plain text** (con `\n`)
   - Divide por párrafos o líneas
   - Intenta detectar pasos numerados (1., 2., etc.)

**Ejemplo de mejora:**

Antes:

```
1. Preheat oven to 400F. Using a cookie cutter, cut dough. Use a fork to poke holes.
```

Después:

```
1. Preheat oven to 400F.
2. Using a cookie cutter, cut dough.
3. Use a fork to poke holes.
```

## 6. Problemas comunes

**404 en peticiones:**

- Verifica que API_BASE_URL tiene tu IP correcta en `config.js`
- Asegúrate que el backend está corriendo (`docker compose up -d`)
- Comprueba que tu dispositivo y PC están en la misma red Wi-Fi

**No navega a Tabs tras login:**

- Usa `navigation.replace('MainTabs')`

**No va a Pantry desde Review:**

- Usa `navigation.navigate('MainTabs', { screen: 'Pantry' })`

**Dispositivo no conecta:**

- PC y móvil en la misma Wi‑Fi
- Sin VPN/firewall bloqueando
- Usa tu IP LAN, no localhost ni IPs de Docker (172.x.x.x)
- Si usas VPN corporativa, desactívala temporalmente

**QR no funciona:**

- Introduce manualmente la URL en Expo Go (ej: `exp://192.168.1.130:8081`)
- Verifica que el puerto 8081 no esté bloqueado

**Permisos:**

- Acepta los permisos de cámara/galería cuando se soliciten

**Imagen muy grande:**

- Selecciona imágenes menores a 8MB

**Error 401:**

- Token expirado, vuelve a hacer login

**Instrucciones mal formateadas:**

- El sistema ahora divide automáticamente oraciones combinadas
- Si aún hay problemas, verifica que la receta tenga `analyzedInstructions` o `instructions` en la respuesta de la API

**Mi IP cambió:**

- Vuelve a ejecutar `hostname -I` (Linux) o el comando correspondiente
- Actualiza `src/constants/config.js` con la nueva IP
- Reinicia Expo (`npx expo start`)

## 7. Hecho

✅ Autenticación (login/register con token en AsyncStorage)  
✅ Navegación Stack + Bottom Tabs  
✅ OCR con cámara y galería (modos gemini/regex)  
✅ Revisión de productos escaneados  
✅ Pantry básico  
✅ Botones con iconos  
✅ Cliente API con interceptores  
✅ **Búsqueda de recetas con caché (24h por query)**  
✅ **Sugerencias de recetas con caché (1h)**  
✅ **Detalle de receta con instrucciones mejoradas**  
✅ **Parsing inteligente de instrucciones (textUtils.js)**  
✅ **Sistema de caché para recetas individuales (24h)**  
✅ **Protección de config.js (gitignored)**

## 8. Pendiente

⏳ Profile (datos de usuario, logout)  
⏳ Pantry CRUD completo (editar cantidades, eliminar)  
⏳ Manejo automático de sesión expirada  
⏳ Estados vacíos y mejores mensajes de error  
⏳ Notificaciones y sugerencias de recetas  
⏳ Filtros avanzados en búsqueda de recetas  
⏳ Favoritos y recetas guardadas  
⏳ Unit tests para textUtils.js

## 9. Checklist

Antes de probar:

- [ ] Backend corriendo (`docker compose up -d`)
- [ ] `config.js` creado desde `config.example.js`
- [ ] API_BASE_URL con tu IP configurada en `config.js`
- [ ] `npm install` ejecutado
- [ ] `npx expo start` sin errores
- [ ] Expo Go instalado en el dispositivo
- [ ] Dispositivo y PC en la misma red Wi-Fi

Flujo de prueba:

- [ ] Registrar/Login funciona
- [ ] Ves las 5 pestañas (Home, Pantry, Scan, Recipes, Profile)
- [ ] Puedes escanear un ticket (cámara o galería)
- [ ] Ves los productos en Review
- [ ] Puedes guardar en Pantry
- [ ] **Puedes buscar recetas**
- [ ] **Ves sugerencias en Recipes**
- [ ] **Al abrir una receta, ves instrucciones numeradas correctamente**
- [ ] **Las instrucciones no tienen múltiples oraciones en un solo paso**
- [ ] No hay errores 404 en la consola

**Nota importante sobre config.js:**

- ❌ **NO COMMITEAR** `src/constants/config.js` (contiene tu IP personal)
- ✅ **SÍ COMMITEAR** `src/constants/config.example.js` (plantilla para el equipo)
- Cada desarrollador crea su propio `config.js` con su IP local
- Si tu IP cambia (cambiaste de red Wi-Fi), actualiza `config.js` y reinicia Expo

**Comandos útiles para desarrollo:**

```bash
# Ver tu IP actual
hostname -I | awk '{print $1}'  # Linux
ipconfig getifaddr en0          # macOS

# Reiniciar Expo limpiando caché
npx expo start -c

# Ver logs del backend
docker compose logs -f

# Detener y limpiar todo
docker compose down -v
```
