// mobile/src/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/constants';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error reading token:', error);
    return Promise.reject(error);
  }
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error for UI: attach status and data
    const customError = new Error(
      error.response?.data?.message || error.message
    );
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    // Debug logging in development
    if (__DEV__) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(customError);
  }
);

export default client;