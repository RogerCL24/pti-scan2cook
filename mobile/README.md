# Scan2Cook Mobile

Aplicación móvil (React Native + Expo) para:

- Registro e inicio de sesión
- Navegación por pestañas (Home, Pantry, Scan, Recipes, Profile)
- Escaneo de tickets con cámara o galería
- OCR con dos modos (gemini / regex)
- Revisión y guardado de productos en despensa

## Índice

1. Requisitos
2. Configuración
3. Estructura
4. Navegación
5. Flujo OCR
6. Problemas comunes
7. Hecho / Pendiente
8. Checklist

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

Configurar IP del backend:

```javascript
// src/constants/config.js
export const API_BASE_URL = 'http://192.168.1.130:3000'; // 🔴 reemplaza por tu IP
```

**Cómo obtener tu IP local:**

- Linux: `hostname -I | awk '{print $1}'`
- macOS: `ipconfig getifaddr en0`
- Windows: `ipconfig` (buscar IPv4)

**Ejemplos según entorno:**

- Dispositivo físico: tu IP LAN (ej. 192.168.1.X)
- Android Emulator: http://10.0.2.2:3000
- Genymotion: http://10.0.3.2:3000
- iOS Simulator: http://localhost:3000

Iniciar Expo:

```bash
npx expo start
```

Abrir en Expo Go y escanear QR.

## 3. Estructura

```
mobile/
  App.js
  src/
    navigation/
      AppNavigator.js    (Stack: Login, Register, MainTabs, Review)
      BottomTabs.js      (Tabs: Home, Pantry, Scan, Recipes, Profile)
    screens/
      HomeScreen.js
      LoginScreen.js
      RegisterScreen.js
      PantryScreen.js
      ScanScreen.js
      ReviewScreen.js
      RecipesScreen.js   (placeholder)
      ProfileScreen.js   (placeholder)
    services/
      api.js             (Axios con token)
      auth.js            (login/register)
      ocr.js             (subida imagen OCR)
      products.js
    context/
      AuthContext.js     (sesión)
    constants/
      colors.js
      config.js          (API_BASE_URL)
    components/
      Button.js
      Input.js
    utils/
      storage.js
```

## 4. Navegación

**Stack:**

- Login
- Register
- MainTabs (contiene los tabs)
- Review (modal para revisar productos)

**Tabs:**

- Home
- Pantry
- Scan
- Recipes (pendiente)
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

## 6. Problemas comunes

**404 en peticiones:**

- Verifica que API_BASE_URL tiene tu IP correcta
- Asegúrate que el backend está corriendo (`docker compose up -d`)

**No navega a Tabs tras login:**

- Usa `navigation.replace('MainTabs')`

**No va a Pantry desde Review:**

- Usa `navigation.navigate('MainTabs', { screen: 'Pantry' })`

**Dispositivo no conecta:**

- PC y móvil en la misma Wi‑Fi
- Sin VPN/firewall bloqueando
- Usa tu IP LAN, no localhost

**Permisos:**

- Acepta los permisos de cámara/galería cuando se soliciten

**Imagen muy grande:**

- Selecciona imágenes menores a 8MB

**Error 401:**

- Token expirado, vuelve a hacer login

## 7. Hecho

✅ Autenticación (login/register con token en AsyncStorage)  
✅ Navegación Stack + Bottom Tabs  
✅ OCR con cámara y galería (modos gemini/regex)  
✅ Revisión de productos escaneados  
✅ Pantry básico  
✅ Botones con iconos  
✅ Cliente API con interceptores

## 8. Pendiente

⏳ Recipes (listado, detalle, integración con despensa)  
⏳ Profile (datos de usuario, logout)  
⏳ Pantry CRUD completo (editar cantidades, eliminar)  
⏳ Manejo automático de sesión expirada  
⏳ Estados vacíos y mejores mensajes de error  
⏳ Notificaciones y sugerencias de recetas

## 9. Checklist

Antes de probar:

- [ ] Backend corriendo (`docker compose up -d`)
- [ ] API_BASE_URL con tu IP configurada en `config.js`
- [ ] `npm install` ejecutado
- [ ] `npx expo start` sin errores
- [ ] Expo Go instalado en el dispositivo

Flujo de prueba:

- [ ] Registrar/Login funciona
- [ ] Ves las 5 pestañas (Home, Pantry, Scan, Recipes, Profile)
- [ ] Puedes escanear un ticket (cámara o galería)
- [ ] Ves los productos en Review
- [ ] Puedes guardar en Pantry
- [ ] No hay errores 404 en la consola

**Nota:** Cada desarrollador debe configurar su propia IP en `config.js` según su entorno.
