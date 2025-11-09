import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s para OCR (puede tardar)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const customError = {
      message: error.message || 'Error de red',
      status: error.response?.status,
      data: error.response?.data,
    };

    // Log para debugging
    console.error('API Error:', customError);

    // Si el token expiró (401), limpiar sesión
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // Aquí podrías emitir un evento o usar navigation para ir a Login
        console.log('Token expirado - sesión limpiada');
      } catch (e) {
        console.error('Error limpiando sesión:', e);
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
