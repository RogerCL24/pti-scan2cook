import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadImageToOcr } from '../api/ocr';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState('gemini');
  const [loading, setLoading] = useState(false);

  // Tomar foto con la cámara
  const takePhoto = async () => {
    try {
      // Pedir permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a la cámara para escanear tickets'
        );
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8, // Comprimir para no exceder 8MB
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    try {
      // Pedir permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a la galería para seleccionar imágenes'
        );
        return;
      }

      // Abrir galería
      const result = await ImagePicker.launchImagePickerAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled) {
        const imageAsset = result.assets[0];
        
        // Verificar tamaño (aproximado, no exacto)
        if (imageAsset.fileSize && imageAsset.fileSize > MAX_BYTES) {
          Alert.alert(
            'Imagen muy grande',
            'La imagen excede 8MB. Por favor selecciona una imagen más pequeña o toma una foto nueva.'
          );
          return;
        }
        
        setImage(imageAsset);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  // Escanear ticket
  const onScan = async () => {
    if (!image) {
      Alert.alert('Sin imagen', 'Sube una imagen primero');
      return;
    }

    setLoading(true);
    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'ticket.jpg',
      });

      console.log('>> Uploading image with mode:', mode);
      
      // Llamar a la API OCR
      const res = await uploadImageToOcr(formData, mode);
      console.log('>> OCR response:', res);

      const products = res.products || [];
      
      if (products.length === 0) {
        Alert.alert(
          'Sin productos',
          'No se detectaron productos en la imagen. Intenta con otra foto más clara.'
        );
        return;
      }

      // Guardar productos en AsyncStorage temporalmente
      await AsyncStorage.setItem('ocr_products', JSON.stringify(products));
      
      // Navegar a pantalla de revisión
      navigation.navigate('Review');
    } catch (err) {
      console.error('OCR error:', err);
      
      let errorMessage = 'Error procesando OCR';
      
      if (err.status) {
        errorMessage = err.data?.error || `HTTP ${err.status}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Escanear ticket de compra</Text>
      <Text style={styles.subtitle}>
        Toma una foto clara del ticket o selecciona una imagen de tu galería
      </Text>

      {/* Previsualización de imagen */}
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones para capturar/seleccionar imagen */}
      {!image && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
            <Text style={styles.primaryButtonText}>📷 Tomar foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryButtonText}>🖼️ Desde galería</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selector de modo OCR */}
      {image && (
        <>
          <Text style={styles.label}>Método de detección:</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'gemini' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('gemini')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'gemini' && styles.modeButtonTextActive,
                ]}
              >
                Gemini (IA)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'regex' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('regex')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'regex' && styles.modeButtonTextActive,
                ]}
              >
                Regex
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón de escanear */}
          <TouchableOpacity
            style={[styles.scanButton, loading && styles.scanButtonDisabled]}
            onPress={onScan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.scanButtonText}>🔍 Escanear ticket</Text>
            )}
          </TouchableOpacity>

          {/* Botón para cambiar imagen */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.changeButtonText}>Cambiar imagen</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b45309',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 24,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#f59e0b',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f59e0b',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44403c',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d6d3d1',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#f59e0b',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716c',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  scanButton: {
    backgroundColor: '#15803d',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonDisabled: {
    backgroundColor: '#86efac',
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changeButton: {
    padding: 12,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#78716c',
    fontSize: 14,
  },
});