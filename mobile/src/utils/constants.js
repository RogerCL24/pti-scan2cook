import { Platform } from 'react-native';
import Constants from 'expo-constants';

// reemplaza con la IP de tu máquina en la LAN si hace falta
const LOCAL_IP = '192.168.1.130';

const getApiBase = () => {
  if (__DEV__) {
    // Expo puede exponer hostUri (ej. "192.168.1.130:8081")
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:3000`;
    }
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
    // iOS simulator => localhost funciona; físico usa LOCAL_IP
    return `http://${LOCAL_IP}:3000`;
  }
  return 'https://your-production-api.com';
};

export const API_BASE = getApiBase();
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const CATEGORIES = ['nevera', 'despensa', 'congelador'];