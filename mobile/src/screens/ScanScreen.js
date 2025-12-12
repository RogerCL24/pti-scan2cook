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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Scan Receipt</Text>
          <Text style={styles.headerSubtitle}>
            Take a clear photo or select from gallery
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HISTORIAL */}
        {history.length > 0 && !image && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Scans</Text>
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
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyCount}>{item.count} items</Text>
                    <Text numberOfLines={1} style={styles.historyNames}>
                      {item.names}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PREVISUALIZACIÓN DE IMAGEN */}
        {image ? (
          <View style={styles.imageCard}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <Pressable
              style={styles.removeButton}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="scan-outline"
                size={64}
                color={Colors.brandPrimary}
              />
            </View>
            <Text style={styles.emptyTitle}>No Image Selected</Text>
            <Text style={styles.emptySubtitle}>
              Take a photo or choose from your gallery to get started
            </Text>
          </View>
        )}

        {/* BOTONES */}
        {!image ? (
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.actionCardPrimary,
                pressed && styles.actionCardPressed,
              ]}
              onPress={takePhoto}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="camera" size={28} color={Colors.brandPrimary} />
              </View>
              <Text style={styles.actionTitle}>Take Photo</Text>
              <Text style={styles.actionSubtitle}>Use device camera</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                styles.actionCardSecondary,
                pressed && styles.actionCardPressed,
              ]}
              onPress={pickImage}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="images"
                  size={28}
                  color={Colors.brandSecondary}
                />
              </View>
              <Text style={styles.actionTitle}>From Gallery</Text>
              <Text style={styles.actionSubtitle}>Choose existing image</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.scanActions}>
            <Pressable
              style={[styles.scanButton, loading && styles.scanButtonDisabled]}
              onPress={onScan}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.scanButtonText}>Scanning...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="scan" size={20} color="#fff" />
                  <Text style={styles.scanButtonText}>Scan Receipt</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.changeButton}
              onPress={() => setImage(null)}
            >
              <Ionicons name="refresh" size={18} color={Colors.brandPrimary} />
              <Text style={styles.changeButtonText}>Change Image</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.backgroundPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  historyItem: {
    width: 140,
    marginRight: 12,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyImage: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.backgroundSecondary,
  },
  historyInfo: {
    padding: 10,
  },
  historyCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brandPrimary,
    marginBottom: 2,
  },
  historyNames: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  imageCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    backgroundColor: Colors.backgroundSecondary,
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
  },
  emptyState: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.brandPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardPrimary: {
    borderWidth: 2,
    borderColor: `${Colors.brandPrimary}30`,
  },
  actionCardSecondary: {
    borderWidth: 2,
    borderColor: `${Colors.brandSecondary}30`,
  },
  actionCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scanActions: {
    gap: 12,
  },
  scanButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brandPrimary,
  },
});
