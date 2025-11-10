# Scan2Cook Mobile

Aplicación móvil (React Native + Expo) para:

- Registro e inicio de sesión
- Navegación por pestañas (Home, Pantry, Scan, Recipes, Profile)
- Escaneo de tickets con cámara o galería
- OCR con dos modos (gemini / regex)
- Revisión y guardado de productos en despensa

## Índice

1. Requisitos
2. Backend (Docker)
3. Configuración frontend
4. Estructura
5. Navegación
6. Flujo OCR
7. Problemas comunes
8. Hecho / Pendiente
9. Checklist rápida

## 1. Requisitos

- Node.js 18+
- npm o yarn
- Expo (npx)
- Dispositivo físico (misma Wi‑Fi) o emulador
- Docker + Docker Compose (backend)

## 2. Backend (Docker)

En la raíz del repositorio:

```bash
docker compose up -d
```

Rutas expuestas (ver backend/app.js):

- POST http://TU_IP:3000/auth/login
- POST http://TU_IP:3000/auth/register
- POST http://TU_IP:3000/ocr/gemini
- POST http://TU_IP:3000/ocr/regex
- http://TU_IP:3000/products/... (según implementación)

Salud:

```bash
curl http://localhost:3000/health
```

Responde {"ok":true}.

## 3. Configuración frontend

Instalar dependencias:

```bash
cd mobile
npm install
```

Configurar IP local:

```javascript
// src/constants/config.js
export const API_BASE_URL = 'http://192.168.1.130:3000'; // reemplaza por tu IP
```

Ejemplos:

- Dispositivo físico: IP LAN (192.168.1.X)
- Android Emulator: http://10.0.2.2:3000
- Genymotion: http://10.0.3.2:3000
- iOS Simulator: http://localhost:3000

Iniciar Expo:

```bash
npx expo start
```

Modo LAN y abrir en Expo Go.

## 4. Estructura

```
mobile/
  App.js
  src/
    navigation/ (Stack + Tabs)
    screens/ (Home, Pantry, Scan, Review, Auth, placeholders)
    services/ (api, auth, ocr, products)
    context/ (AuthContext)
    constants/ (colors, config)
    components/ (Button, Input)
    utils/ (storage)
```

api.js: Axios con baseURL y token.

## 5. Navegación

Stack:

- Login
- Register
- MainTabs
- Review

Tabs:

- Home
- Pantry
- Scan
- Recipes (placeholder)
- Profile (placeholder)

Post login/registro:

```js
navigation.replace('MainTabs');
```

Desde Review a Pantry:

```js
navigation.navigate('MainTabs', { screen: 'Pantry' });
```

## 6. Flujo OCR

1. Foto o imagen de galería.
2. Selección modo: gemini o regex.
3. Envío FormData:
   - /ocr/gemini
   - /ocr/regex
     Campo: image.
4. Respuesta con products.
5. Navegación a Review.
6. Guardar y opcional ir a Pantry.

## 7. Problemas comunes

- 404: IP incorrecta o backend no levantado.
- No cambia a Tabs: usar navigation.replace('MainTabs').
- No navega a Pantry desde Review: usar navigation.navigate('MainTabs', { screen: 'Pantry' }).
- Dispositivo no conecta: misma Wi‑Fi, sin firewall/VPN.
- Permisos: aceptar cámara/galería.
- Imagen grande: usar <8MB.
- 401: sesión expirada → relogin.
- FormData:

```js
formData.append('image', { uri, type: 'image/jpeg', name: 'ticket.jpg' });
```

## 8. Hecho

- Autenticación con token (AsyncStorage)
- Stack + Tabs
- OCR gemini / regex (cámara / galería)
- Review de productos
- Pantry básico
- Botones con iconos
- Interceptor Axios

Pendiente

- Recipes (listado, detalle, integración despensa)
- Profile (datos, logout UI)
- Pantry CRUD completo (editar/eliminar)
- UX Scan (overlay, recorte)
- Manejo global de expiración
- Estados vacíos y mejores mensajes
- Notificaciones / sugerencias

## 9. Checklist rápida

- [ ] docker compose up
- [ ] API_BASE_URL correcto
- [ ] Expo start sin errores
- [ ] Login/Register ok
- [ ] Tabs visibles
- [ ] Scan obtiene productos
- [ ] Review → Pantry funciona
- [ ] Sin 404 en consola

Solo ajustar la IP en config.js para cada desarrollador.
