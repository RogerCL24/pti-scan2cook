import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors } from '../constants/colors';

export default function RegisterScreen({ navigation }) {
  // Estados para los inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hook de autenticación
  const { register } = useAuth();

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar password
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar registro
  const handleRegister = async () => {
    // Limpiar errores previos
    setErrors({});

    // Validar
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register(name.trim(), email.trim(), password);

      if (result.success) {
        console.log('🎉 Registro exitoso, navegando a MainTabs...');
        Alert.alert('¡Bienvenido!', 'Cuenta creada', [
          {
            text: 'Continuar',
            onPress: () => {
              console.log('👉 Navegando a MainTabs');
              navigation.replace('MainTabs');
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Error al registrarse');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* HEADER */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/scan2cook-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a Scan2Cook y gestiona tu despensa
            </Text>
          </View>

          {/* FORMULARIO */}
          <View style={styles.form}>
            <Input
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              autoCapitalize="words"
              error={errors.name}
              icon="person-outline"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon="mail-outline"
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              error={errors.password}
              icon="lock-closed-outline"
            />

            <Input
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite tu contraseña"
              secureTextEntry
              error={errors.confirmPassword}
              icon="lock-closed-outline"
            />

            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  linkText: {
    fontSize: 14,
    color: Colors.brandPrimary,
    fontWeight: '600',
  },
});
