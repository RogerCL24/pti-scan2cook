import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon, // Nuevo: icono opcional al inicio
  ...props
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {/* Icono al inicio (opcional) */}
        {icon && (
          <View style={styles.iconLeft}>
            <Ionicons name={icon} size={20} color={Colors.textSecondary} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            icon && styles.inputWithIconLeft,
            secureTextEntry && styles.inputWithIconRight,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />

        {/* Icono de mostrar/ocultar contraseña */}
        {secureTextEntry && (
          <Pressable
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputWithIconLeft: {
    paddingLeft: 45,
  },
  inputWithIconRight: {
    paddingRight: 45,
  },
  inputError: {
    borderColor: Colors.systemError,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  errorText: {
    color: Colors.systemError,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
