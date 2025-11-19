import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/auth';
import { getToken, saveToken, removeToken } from '../utils/storage';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await getToken();
        const u = await AsyncStorage.getItem('user');
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const resp = await loginUser(email, password);
      await saveToken(resp.token);
      await AsyncStorage.setItem('user', JSON.stringify(resp.user));
      setToken(resp.token);
      setUser(resp.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.data?.error || error.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const resp = await registerUser(name, email, password);
      const token = resp?.token;
      const userData = resp?.user;

      if (!token || !userData) {
        return { success: false, error: 'Respuesta inválida del servidor' };
      }

      await saveToken(token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.data?.error || error.message || 'Error al registrarse',
      };
    }
  };

  const logout = async () => {
    await removeToken();
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
