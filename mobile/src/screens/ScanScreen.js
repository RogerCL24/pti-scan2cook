import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Button from '../components/Button';
import { uploadImageToOcr } from '../services/ocr';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('gemini');

  // Tomar foto con la cámara
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a la cámara para escanear tickets'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a la galería para seleccionar imágenes'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled) {
        const imageAsset = result.assets[0];

        if (imageAsset.fileSize && imageAsset.fileSize > MAX_BYTES) {
          Alert.alert(
            'Imagen muy grande',
            'La imagen excede 8MB. Por favor selecciona una imagen más pequeña.'
          );
          return;
        }

        setImage(imageAsset);
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  // Escanear ticket con backend REAL
  const onScan = async () => {
    if (!image) {
      Alert.alert('Sin imagen', 'Sube una imagen primero');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Iniciando escaneo con backend real');

      const response = await uploadImageToOcr(image.uri, mode);
      console.log('RAW OCR RESPONSE:', response);
      console.log('PRODUCTS:', response.products);

      const products = response.products || [];

      if (products.length === 0) {
        Alert.alert(
          'Sin productos',
          'No se detectaron productos. Intenta con otra foto más clara.'
        );
        setLoading(false);
        return;
      }

      // Navegar a ReviewScreen con los productos
      navigation.navigate('Review', { products });
    } catch (error) {
      console.error('❌ OCR error:', error);

      let errorMessage = 'Error procesando OCR';

      if (error.status) {
        errorMessage = error.data?.error || `HTTP ${error.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="scan-outline" size={48} color={Colors.brandPrimary} />
        <Text style={styles.title}>Escanear Ticket</Text>
        <Text style={styles.subtitle}>
          Toma una foto clara del ticket o selecciona una imagen de tu galería
        </Text>
      </View>

      {/* PREVISUALIZACIÓN DE IMAGEN */}
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <Pressable style={styles.removeButton} onPress={() => setImage(null)}>
            <Ionicons
              name="close-circle"
              size={32}
              color={Colors.systemError}
            />
          </Pressable>
        </View>
      )}

      {/* SELECTOR DE MODO (cuando hay imagen) */}
      {image && (
        <View style={styles.modeContainer}>
          <Text style={styles.label}>Método de detección:</Text>
          <View style={styles.modeSelector}>
            <Pressable
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
                Gemini IA
              </Text>
            </Pressable>

            <Pressable
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
            </Pressable>
          </View>
        </View>
      )}

      {/* BOTONES */}
      <View style={styles.buttonGroup}>
        {!image ? (
          <>
            <Button
              title="Tomar Foto"
              onPress={takePhoto}
              icon="camera-outline"
            />
            <Button
              title="Desde Galería"
              onPress={pickImage}
              variant="secondary"
              icon="images-outline"
            />
          </>
        ) : (
          <>
            <Button
              title="Escanear Ticket"
              onPress={onScan}
              loading={loading}
              icon="scan-outline"
            />
            <Pressable
              style={styles.changeButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.changeButtonText}>Cambiar imagen</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
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
  },
  modeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.backgroundSecondary,
    backgroundColor: Colors.backgroundPrimary,
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: Colors.brandPrimary,
    backgroundColor: Colors.brandPrimary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: Colors.backgroundPrimary,
  },
  buttonGroup: {
    gap: 12,
  },
  changeButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
