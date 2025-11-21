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

  // Escanear ticket con backend (siempre usando Gemini AI)
  const onScan = async () => {
    if (!image) {
      Alert.alert('No image', 'Upload an image first');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Starting scan with Gemini AI');

      const response = await uploadImageToOcr(image.uri, 'gemini');
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

      // Reset navigation stack - can't swipe back
      navigation.reset({
        index: 0,
        routes: [{ name: 'Review', params: { products } }],
      });
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
