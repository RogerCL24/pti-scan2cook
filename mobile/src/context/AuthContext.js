import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      const savedUserRaw = await AsyncStorage.getItem('user');
      if (savedToken) {
        setToken(savedToken);
        if (savedUserRaw) {
          setUser(JSON.parse(savedUserRaw));
        } else {
          setUser({ token: savedToken });
        }
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
      await AsyncStorage.setItem('user', JSON.stringify(userData));

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
      console.log('>> REGISTER response:', response);

      // Backend NO devuelve token, solo user
      // Hacer login automático para obtener token
      console.log('>> Haciendo login automático tras registro...');
      let loginResp;
      try {
        loginResp = await loginUser(email, password);
        console.log('>> LOGIN automático response:', loginResp);
      } catch (loginError) {
        console.error('>> Error en login automático:', loginError);
        return {
          success: false,
          error:
            'Registro exitoso pero no se pudo iniciar sesión automáticamente. Intenta hacer login.',
        };
      }

      const token = loginResp?.token;
      const userData = loginResp?.user || response;

      if (!token) {
        return {
          success: false,
          error: 'No se recibió token tras registro',
        };
      }

      // Si backend devuelve name genérico "Usuario", usar el introducido
      const effectiveName =
        userData?.name && userData.name !== 'Usuario' ? userData.name : name;

      const normalizedUser = {
        id: userData.id,
        email: userData.email || email,
        name: effectiveName,
        created_at: userData.created_at,
      };

      console.log('>> Guardando token y usuario:', {
        token: token.substring(0, 20) + '...',
        user: normalizedUser,
      });

      await saveToken(token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));

      setToken(token);
      setUser(normalizedUser);

      console.log('✅ Registro y login completados');
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export { AuthContext };
