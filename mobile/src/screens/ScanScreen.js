import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const HISTORY_KEY = 'scan_history_v1';

const readHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHistoryEntry = async (entry) => {
  try {
    const current = await readHistory();
    const next = [entry, ...current].slice(0, 10);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('History save error', e.message);
  }
};

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const h = await readHistory();
      setHistory(h);
    })();
  }, []);

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
      const response = await uploadImageToOcr(image.uri, 'gemini');
      const products = response.products || [];
      if (products.length === 0) {
        Alert.alert(
          'No products',
          'No products detected. Try with a clearer photo.'
        );
        setLoading(false);
        return;
      }

      // Guardar en historial antes de navegar
      await saveHistoryEntry({
        id: Date.now(),
        ts: new Date().toISOString(),
        image: image.uri,
        count: products.length,
        names: products
          .slice(0, 4)
          .map((p) => p.name)
          .join(', '),
      });
      const updated = await readHistory();
      setHistory(updated);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Review', params: { products } }],
      });
    } catch (error) {
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

      {/* HISTORIAL */}
      {history.length > 0 && !image && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent scans</Text>
            <Pressable
              onPress={async () => {
                await AsyncStorage.removeItem(HISTORY_KEY);
                setHistory([]);
              }}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.systemError}
              />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {history.map((item) => (
              <Pressable
                key={item.id}
                style={styles.historyItem}
                onPress={() => setImage({ uri: item.image })}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.historyImage}
                />
                <Text style={styles.historyCount}>{item.count} items</Text>
                <Text numberOfLines={1} style={styles.historyNames}>
                  {item.names}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

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
      <View style={styles.buttonsContainer}>
        {!image ? (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonPrimary,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={takePhoto}
            >
              <View style={[styles.iconWrapper, styles.iconWrapperPrimary]}>
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Take Photo</Text>
              <Text style={styles.actionSubText}>Use device camera</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonSecondary,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={pickImage}
            >
              <View style={[styles.iconWrapper, styles.iconWrapperSecondary]}>
                <Ionicons name="images-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>From Gallery</Text>
              <Text style={styles.actionSubText}>Choose an existing image</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              style={[
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={onScan}
              disabled={loading}
            >
              <Ionicons
                name={loading ? 'hourglass-outline' : 'scan-outline'}
                size={22}
                color="#fff"
              />
              <Text style={styles.primaryButtonText}>
                {loading ? 'Scanning...' : 'Scan Receipt'}
              </Text>
            </Pressable>
            <View style={styles.secondaryRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.secondaryButtonAlt,
                  pressed && styles.secondaryButtonPressed,
                ]}
                onPress={() => setImage(null)}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={Colors.brandSecondary}
                />
                <Text style={styles.secondaryButtonText}>Change image</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.secondaryButtonDanger,
                  pressed && styles.secondaryButtonPressed,
                ]}
                onPress={() => {
                  setImage(null);
                  Alert.alert('Reset', 'Image cleared.');
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={Colors.systemError}
                />
                <Text style={styles.secondaryButtonText}>Remove</Text>
              </Pressable>
            </View>
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
  historySection: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
  },
  historyImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: Colors.backgroundSecondary,
  },
  historyCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brandPrimary,
  },
  historyNames: {
    fontSize: 11,
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
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 32,
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#fff',
    borderColor: Colors.brandPrimary,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderColor: Colors.brandSecondary,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapperPrimary: {
    backgroundColor: Colors.brandPrimary,
  },
  iconWrapperSecondary: {
    backgroundColor: Colors.brandSecondary,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.brandPrimary,
    paddingVertical: 16,
    borderRadius: 48,
    alignItems: 'center',
    elevation: 2,
  },
  primaryButtonDisabled: { opacity: 0.75 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryRow: { flexDirection: 'row', gap: 14 },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  secondaryButtonAlt: {
    borderColor: Colors.brandSecondary,
  },
  secondaryButtonDanger: {
    borderColor: Colors.systemError,
  },
  secondaryButtonPressed: { opacity: 0.85 },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
