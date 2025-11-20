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
          'Permissions required',
          'We need camera access to scan receipts'
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
      Alert.alert('Error', 'Could not open camera');
    }
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissions required',
          'We need gallery access to select images'
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
            'Image too large',
            'Image exceeds 8MB. Please select a smaller image.'
          );
          return;
        }

        setImage(imageAsset);
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert('Error', 'Could not open gallery');
    }
  };

  // Escanear ticket con backend REAL
  const onScan = async () => {
    if (!image) {
      Alert.alert('No image', 'Upload an image first');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Starting scan with real backend');

      const response = await uploadImageToOcr(image.uri, mode);
      console.log('RAW OCR RESPONSE:', response);
      console.log('PRODUCTS:', response.products);

      const products = response.products || [];

      if (products.length === 0) {
        Alert.alert(
          'No products',
          'No products detected. Try with a clearer photo.'
        );
        setLoading(false);
        return;
      }

      // Navegar a ReviewScreen con los productos
      navigation.navigate('Review', { products });
    } catch (error) {
      console.error('❌ OCR error:', error);

      let errorMessage = 'Error processing OCR';

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
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Scan Receipt</Text>
        <Text style={styles.headerSubtitle}>
          Take a clear photo or select from gallery
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
          <Text style={styles.label}>Detection method:</Text>
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
                Gemini AI
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
              title="Take Photo"
              onPress={takePhoto}
              icon="camera-outline"
            />
            <Button
              title="From Gallery"
              onPress={pickImage}
              variant="secondary"
              icon="images-outline"
            />
          </>
        ) : (
          <>
            <Button
              title="Scan Receipt"
              onPress={onScan}
              loading={loading}
              icon="scan-outline"
            />
            <Pressable
              style={styles.changeButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.changeButtonText}>Change image</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
