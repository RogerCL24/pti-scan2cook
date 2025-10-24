import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { importProducts } from '../api/products';

const DEFAULT_CATEGORY = (name) => {
  const low = name.toLowerCase();
  const nevera = ['leche', 'queso', 'yogur', 'tomate', 'huevos'];
  const despensa = ['pasta', 'arroz', 'harina', 'aceite', 'legumbres'];
  const congelador = ['pollo', 'carne', 'pescado', 'helado'];
  
  if (nevera.some((w) => low.includes(w))) return 'nevera';
  if (congelador.some((w) => low.includes(w))) return 'congelador';
  return 'despensa';
};

export default function ReviewScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem('ocr_products');
      const parsedProducts = JSON.parse(stored || '[]');

      // Normalizar productos
      const normalized = parsedProducts.map((item) => ({
        name: item.name || String(item),
        quantity: item.quantity || 1,
        category: item.category || DEFAULT_CATEGORY(item.name || String(item)),
      }));

      setProducts(normalized);
      
      if (normalized.length === 0) {
        Alert.alert(
          'Sin productos',
          'No hay productos para revisar',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    }
  };

  const updateProduct = (index, field, value) => {
    setProducts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeProduct = (index) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProducts((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const confirmImport = async () => {
    if (products.length === 0) {
      Alert.alert('Sin productos', 'No hay productos para guardar');
      return;
    }

    setLoading(true);
    try {
      console.log('>> Importing products:', products);
      await importProducts(products);
      
      // Limpiar productos temporales
      await AsyncStorage.removeItem('ocr_products');
      
      Alert.alert(
        '¡Éxito!',
        'Productos importados correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Scan'),
          },
        ]
      );
    } catch (error) {
      console.error('Import error:', error);
      
      let errorMessage = 'Error al guardar productos';
      if (error.data?.error) {
        errorMessage = error.data.error;
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Revisar productos detectados</Text>
        <Text style={styles.subtitle}>
          Verifica y edita los productos antes de guardarlos
        </Text>

        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            {/* Nombre del producto */}
            <View style={styles.productHeader}>
              <Text style={styles.productNumber}>#{index + 1}</Text>
              <TouchableOpacity
                onPress={() => removeProduct(index)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Input: Nombre */}
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={product.name}
              onChangeText={(text) => updateProduct(index, 'name', text)}
              placeholder="Nombre del producto"
            />

            {/* Selector: Categoría */}
            <Text style={styles.label}>Categoría:</Text>
            <View style={styles.categorySelector}>
              {['nevera', 'despensa', 'congelador'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    product.category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => updateProduct(index, 'category', cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      product.category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat === 'nevera' && '❄️'}
                    {cat === 'despensa' && '🏠'}
                    {cat === 'congelador' && '🧊'}
                    {' '}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input: Cantidad */}
            <Text style={styles.label}>Cantidad:</Text>
            <TextInput
              style={styles.quantityInput}
              value={String(product.quantity)}
              onChangeText={(text) => {
                const num = parseInt(text || '1');
                updateProduct(index, 'quantity', Math.max(1, num));
              }}
              keyboardType="number-pad"
            />
          </View>
        ))}

        {products.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay productos para revisar</Text>
          </View>
        )}
      </ScrollView>

      {/* Botón de confirmar (fixed en la parte inferior) */}
      {products.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={confirmImport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                ✓ Confirmar ({products.length} producto{products.length !== 1 ? 's' : ''})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Espacio para el botón fixed
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
    marginBottom: 20,
    lineHeight: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44403c',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d6d3d1',
    backgroundColor: '#fafaf9',
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716c',
  },
  categoryButtonTextActive: {
    color: '#b45309',
  },
  quantityInput: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 100,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#78716c',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmButton: {
    backgroundColor: '#15803d',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#86efac',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});