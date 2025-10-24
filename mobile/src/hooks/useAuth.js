import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token on mount
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) setToken(savedToken);
    } catch (error) {
      console.error('Failed to load token:', error);
    } finally {
      setLoading(false);
    }
  };

  // Persist token changes
  useEffect(() => {
    const updateStorage = async () => {
      try {
        if (token) {
          await AsyncStorage.setItem('token', token);
        } else {
          await AsyncStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to update token:', error);
      }
    };
    updateStorage();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('>> login called with:', { email, password: '***' });
      const res = await authApi.login(email, password);
      console.log('>> login response:', res);
      
      setToken(res.token);
      setUser(res.user || null);
      return res;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('>> register called with:', { name, email, password: '***' });
      
      // Paso 1: Registrar usuario (crea la cuenta)
      const registerRes = await authApi.register(name, email, password);
      console.log('>> register response:', registerRes);
      
      // Paso 2: Login automático para obtener token
      console.log('>> auto-login after registration...');
      const loginRes = await authApi.login(email, password);
      console.log('>> login response:', loginRes);
      
      // Paso 3: Guardar token y usuario
      setToken(loginRes.token);
      setUser(loginRes.user || null);
      
      return loginRes;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return null; // or a loading spinner component
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};