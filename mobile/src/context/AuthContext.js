import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/auth';
import { saveToken, getToken, removeToken } from '../utils/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Verificar si hay sesión guardada al iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        // Aquí podrías hacer una llamada para obtener datos del usuario
        // Por ahora solo marcamos que hay sesión
        setUser({ token: savedToken });
      }
    } catch (error) {
      console.error('Error verificando auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const { token, user: userData } = response;

      await saveToken(token);
      setToken(token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.data?.error || error.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await registerUser(name, email, password);
      const { token, user: userData } = response;

      await saveToken(token);
      setToken(token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.data?.error || error.message || 'Error al registrarse',
      };
    }
  };

  const logout = async () => {
    await removeToken();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
