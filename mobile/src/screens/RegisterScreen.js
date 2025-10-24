import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Validación de email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    // ============================================
    // VALIDACIONES DEL CLIENTE (antes de enviar)
    // ============================================
    
    // 1. Campos vacíos
    if (!name.trim()) {
      Alert.alert('Error', 'Introduce tu nombre');
      return;
    }

    // 2. Email válido
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Introduce un email válido');
      return;
    }

    // 3. Contraseña mínima (según tu backend valida 6 caracteres)
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // ============================================
    // ENVIAR AL BACKEND
    // ============================================
    setLoading(true);
    try {
      await register(name, email, password);
      
      // Si llega aquí, el registro fue exitoso
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Scan'), // O donde quieras redirigir
          },
        ]
      );
    } catch (error) {
      // ============================================
      // MANEJO DE ERRORES DEL BACKEND
      // ============================================
      console.error('Registration error:', error);

      let errorMessage = 'Error al crear la cuenta';

      // Detectar errores específicos del backend
      if (error.status === 409) {
        // Código 409 = Conflict (email ya existe)
        errorMessage = 'Este email ya está registrado. ¿Quieres iniciar sesión?';
      } else if (error.data?.error) {
        // Mensaje específico del backend
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Mostrar error en un Alert nativo
      Alert.alert('Error de registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🥫</Text>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a Scan2Cook</Text>

        {/* Input: Nombre */}
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />

        {/* Input: Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {/* Input: Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />

        {/* Hint de validación */}
        <Text style={styles.hint}>
          La contraseña debe tener al menos 6 caracteres
        </Text>

        {/* Botón de registro */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        {/* Link a login */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? <Text style={styles.link}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb', // amber-50
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b45309', // amber-700
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#78716c',
    marginBottom: 20,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#f59e0b', // amber-500
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#fbbf24', // amber-400
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#78716c',
    fontSize: 14,
  },
  link: {
    color: '#f59e0b',
    fontWeight: '600',
  },
});