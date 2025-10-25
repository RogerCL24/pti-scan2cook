# 📱 Scan2Cook Mobile - Documentación

Aplicación móvil nativa construida con React Native + Expo para el proyecto Scan2Cook.

---

## 📋 Índice

- [Descripción general](#-descripción-general)
- [Tecnologías](#-tecnologías)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Arquitectura](#-arquitectura)
- [Pantallas](#-pantallas)
- [API Client](#-api-client)
- [Autenticación](#-autenticación)
- [Problemas comunes](#-problemas-comunes)

---

## 🎯 Descripción general

Aplicación móvil que permite a los usuarios:
- ✅ Registrarse e iniciar sesión
- 📸 Escanear tickets de compra con la cámara
- 🤖 Detectar productos usando OCR (Gemini AI o Regex)
- ✏️ Revisar y editar productos detectados
- 💾 Guardar productos en su despensa virtual

---

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React Native** | ^0.72.0 | Framework móvil |
| **Expo** | ~49.0.0 | Toolchain y desarrollo |
| **React Navigation** | ^6.x | Navegación entre pantallas |
| **Axios** | ^1.5.0 | Cliente HTTP |
| **AsyncStorage** | ^1.x | Almacenamiento local |
| **Expo Image Picker** | ~14.x | Cámara y galería |

---

## 📂 Estructura del proyecto

```
mobile/
├── src/
│   ├── api/                    # Clientes API
│   │   ├── client.js           # Configuración Axios + interceptors
│   │   ├── auth.js             # Login / Register
│   │   ├── ocr.js              # Upload imagen para OCR
│   │   └── products.js         # Importar productos
│   │
│   ├── hooks/                  # React Hooks personalizados
│   │   └── useAuth.js          # Context de autenticación
│   │
│   ├── navigation/             # Configuración de rutas
│   │   └── AppNavigator.js     # Stack Navigator principal
│   │
│   ├── screens/                # Pantallas de la app
│   │   ├── LoginScreen.js      # Inicio de sesión
│   │   ├── RegisterScreen.js   # Registro de usuario
│   │   ├── ScanScreen.js       # Captura/sube imagen ticket
│   │   └── ReviewScreen.js     # Revisa productos detectados
│   │
│   ├── components/             # Componentes reutilizables (futuro)
│   └── utils/                  # Utilidades y constantes
│       └── constants.js        # Constants
│
├── assets/                     # Imágenes, iconos, fonts
├── .expo/                      # Caché de Expo (ignorado en Git)
├── node_modules/               # Dependencias (ignorado en Git)
│
├── App.js                      # Entry point de la app
├── app.json                    # Configuración Expo
├── package.json                # Dependencias y scripts
├── babel.config.js             # Configuración Babel
└── README.md                   # Esta documentación
```

---

## ✅ Requisitos previos

### En tu ordenador:
- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **npm** o **yarn**
- **Git**

### En tu móvil:
- **Expo Go** app instalada:
  - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

### Backend corriendo:
- El backend debe estar levantado en Docker:
  ```bash
  cd ~/Proyecto/pti-scan2cook
  docker compose up
  ```

---

## 📦 Instalación

```bash
# 1. Navegar al directorio mobile
cd mobile

# 2. Instalar dependencias
npm install

# 3. Verificar instalación
npx expo --version
```

---

## ⚙️ Configuración

### 1️⃣ Configurar URL del backend

Edita `src/utils/constants.js` y cambia la IP por la de tu ordenador:

```javascript
// src/utils/constants.js
const LOCAL_IP = '192.168.1.130'; // 🔴 CAMBIAR POR TU IP
```

**Obtener tu IP local:**

```bash
# Linux/Mac
hostname -I | awk '{print $1}'

# Windows (PowerShell)
ipconfig | findstr IPv4
```

### 2️⃣ Verificar conexión al backend

```bash
# Desde tu ordenador
curl http://localhost:3000/health

# Desde tu móvil (en el navegador)
http://192.168.1.100:3000/health
```

Ambos deberían responder: `{"status":"ok"}`

---

## 🚀 Ejecución

### Desarrollo normal

```bash
# En el directorio mobile/
npm start
# o
npx expo start
```

Verás un QR en la terminal:

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

### Opciones de ejecución

```bash
# Abrir en Android emulator
npm start -- --android

# Abrir en iOS simulator (solo Mac)
npm start -- --ios

# Limpiar caché
npm start -- --clear

# Modo tunnel (si WiFi no funciona)
npm start -- --tunnel
```

### Hot Reload automático ✨

Cada vez que guardes un archivo `.js`, la app se actualiza automáticamente en tu móvil. **No necesitas recargar manualmente**.

---

## 🏗️ Arquitectura

### Flujo de autenticación

```
LoginScreen
    │
    ├─> useAuth.login(email, password)
    │       │
    │       └─> authApi.login() → POST /auth/login
    │               │
    │               └─> client.post (interceptor añade token)
    │
    └─> AsyncStorage.setItem('token', ...)
    
    └─> navigation.replace('Scan')
```

### Flujo de escaneo

```
ScanScreen
    │
    ├─> ImagePicker.launchCameraAsync()
    │       │
    │       └─> Usuario toma foto
    │
    ├─> uploadImageToOcr(formData, 'gemini')
    │       │
    │       └─> POST /ocr/gemini (con imagen)
    │               │
    │               └─> Backend procesa con Gemini AI
    │                       │
    │                       └─> { products: [...] }
    │
    └─> AsyncStorage.setItem('ocr_products', JSON.stringify(products))
    
    └─> navigation.navigate('Review')
```

### Flujo de revisión

```
ReviewScreen
    │
    ├─> AsyncStorage.getItem('ocr_products')
    │       │
    │       └─> Cargar productos temporales
    │
    ├─> Usuario edita (nombre, cantidad, categoría)
    │
    ├─> importProducts(products)
    │       │
    │       └─> POST /products/import (con token JWT)
    │               │
    │               └─> Backend guarda en PostgreSQL
    │
    └─> AsyncStorage.removeItem('ocr_products')
    
    └─> navigation.navigate('Scan')
```

---

## 📱 Pantallas

### 1. LoginScreen

**Ruta:** `Login`  
**Archivo:** `src/screens/LoginScreen.js`

**Funcionalidad:**
- Validación de email y contraseña
- Guarda token JWT en AsyncStorage
- Navega a ScanScreen tras login exitoso

**Validaciones:**
- Email formato válido
- Campos no vacíos

---

### 2. RegisterScreen

**Ruta:** `Register`  
**Archivo:** `src/screens/RegisterScreen.js`

**Funcionalidad:**
- Registro de nuevo usuario
- Login automático tras registro exitoso
- Manejo de errores (email duplicado, etc.)

**Validaciones:**
- Nombre no vacío
- Email formato válido
- Contraseña mínimo 6 caracteres

---

### 3. ScanScreen

**Ruta:** `Scan`  
**Archivo:** `src/screens/ScanScreen.js`

**Funcionalidad:**
- Tomar foto con cámara
- Seleccionar imagen de galería
- Elegir modo OCR (Gemini o Regex)
- Previsualizar imagen antes de escanear
- Enviar al backend para procesamiento
- Log out
**Permisos necesarios:**
- Cámara
- Galería de fotos

---

### 4. ReviewScreen

**Ruta:** `Review`  
**Archivo:** `src/screens/ReviewScreen.js`

**Funcionalidad:**
- Mostrar productos detectados por OCR
- Editar nombre, cantidad, categoría
- Eliminar productos individuales
- Confirmar e importar a la despensa

**Categorías disponibles:**
- 🧊 Congelador
- ❄️ Nevera
- 🏠 Despensa

---

## 🔌 API Client

### Configuración base

**Archivo:** `src/api/client.js`

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.1.100:3000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Interceptor: añadir token JWT a todas las peticiones
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: normalizar errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = new Error(error.message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default client;
```

### Módulos API

#### `src/api/auth.js`
```javascript
export const login = (email, password) => { ... }
export const register = (name, email, password) => { ... }
```

#### `src/api/ocr.js`
```javascript
export const uploadImageToOcr = (formData, mode) => { ... }
```

#### `src/api/products.js`
```javascript
export const importProducts = (products) => { ... }
export const getProducts = () => { ... }
```

---

## 🔐 Autenticación

### Sistema de autenticación

**Hook:** `src/hooks/useAuth.js`

```javascript
// Uso en cualquier componente:
import { useAuth } from '../hooks/useAuth';

function MyScreen() {
  const { token, user, login, register, logout } = useAuth();
  
  // token: JWT string o null
  // user: { id, name, email } o null
  // login: función async
  // register: función async
  // logout: función async
}
```

### Persistencia del token

- Se guarda en **AsyncStorage** al hacer login/register
- Se carga automáticamente al iniciar la app
- Se elimina al hacer logout
- Se envía automáticamente en todas las peticiones API (interceptor)

### Rutas protegidas

Solo accesibles si hay token válido:
- `ScanScreen`
- `ReviewScreen`

Si no hay token, redirige a `LoginScreen`.

---

## 🐛 Problemas comunes

### 1. "Unable to connect to backend"

**Problema:** El móvil no puede conectarse al backend.

**Solución:**
```bash
# 1. Verificar que backend está corriendo
docker compose ps

# 2. Verificar tu IP
hostname -I

# 3. Actualizar IP en src/utils/constants.js
const LOCAL_IP = '192.168.1.X'; #Reemplazar por tu IP

# 4. Verificar que móvil y ordenador están en la misma WiFi

# 5. Probar conexión desde móvil (navegador)
http://TU_IP:3000/health
```

---

### 2. "CORS blocked"

**Problema:** Backend rechaza peticiones del móvil.

**Solución en backend:**
```javascript
// backend/app.js
app.use(cors({
  origin: /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
  credentials: true,
}));
```

---

### 3. "Permission denied" (cámara/galería)

**Problema:** No se concedieron permisos.

**Solución:**
- Android: Ajustes → Apps → Expo Go → Permisos → Activar cámara y archivos
- iOS: Ajustes → Expo Go → Activar acceso a cámara y fotos

---

### 4. "Image too large"

**Problema:** La imagen excede 8MB.

**Solución:**
- La app comprime automáticamente con `quality: 0.8`
- Si persiste, toma la foto más lejos o con menos luz
- O comprime manualmente antes de subir

---

### 5. "Token expired" o "401 Unauthorized"

**Problema:** El token JWT ha expirado (duración: 7 días).

**Solución:**
```javascript
// Hacer logout y volver a iniciar sesión
const { logout } = useAuth();
logout();
```

---

### 6. Cambios no se reflejan en el móvil

**Solución:**
```bash
# Opción 1: Reload desde el móvil
# Sacude el dispositivo → "Reload"

# Opción 2: Desde la terminal
# Presiona 'r'

# Opción 3: Limpiar caché
npm start -- --clear
```

---

## 📚 Scripts disponibles

```bash
# Desarrollo
npm start                # Iniciar Expo Dev Server
npm run android          # Abrir en Android emulator
npm run ios              # Abrir en iOS simulator (solo Mac)

# Utilidades
npx expo start --clear   # Limpiar caché
npx expo doctor          # Diagnosticar problemas
npx expo install         # Actualizar dependencias Expo

# Producción (futuro)
npx eas build --platform android   # Build APK
npx eas build --platform ios       # Build IPA
```

---

## 🔗 Enlaces útiles

- [Documentación Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## 📝 Notas de desarrollo

### Diferencias con la versión web

| Web (Vite) | Mobile (React Native) |
|------------|----------------------|
| `<div>`, `<button>` | `<View>`, `<TouchableOpacity>` |
| CSS / Tailwind | `StyleSheet` |
| `localStorage` | `AsyncStorage` |
| `<input type="file">` | `ImagePicker` |
| `sessionStorage` | `AsyncStorage` (temporal) |
| React Router | React Navigation |

### Próximas funcionalidades

- [ ] Pantalla de listado de productos guardados
- [ ] Búsqueda y filtrado de productos
- [ ] Notificaciones push (productos próximos a caducar)
- [ ] Compartir despensa con familia
- [ ] Recomendaciones de recetas según productos disponibles

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa esta documentación** primero
2. **Verifica logs** en la terminal de Expo
3. **Consulta con el equipo** en el canal de Slack/Discord
4. **Revisa issues** en el repositorio GitHub

---

**Última actualización:** Octubre 2025  
**Versión:** 0.1.0 (MVP)