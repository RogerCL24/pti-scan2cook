import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Button from '../components/Button';
import { saveProducts as saveProductsToBackend } from '../services/products';

export default function ReviewScreen({ route, navigation }) {
  const { products: initialProducts = [] } = route.params || {};
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      Alert.alert('No products', 'There are no products to review', [
        { text: 'Go back', onPress: () => navigation.goBack() },
      ]);
    }
  }, []);

  // Actualizar cantidad de un producto
  const updateQuantity = (index, newQuantity) => {
    const updated = [...products];
    const qty = parseInt(newQuantity) || 0;
    updated[index].quantity = qty > 0 ? qty : 1;
    setProducts(updated);
  };

  // Actualizar nombre de un producto
  const updateName = (index, newName) => {
    const updated = [...products];
    updated[index].name = newName;
    setProducts(updated);
  };

  // Eliminar producto
  const removeProduct = (index) => {
    Alert.alert(
      'Remove product',
      'Are you sure you want to remove this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = products.filter((_, i) => i !== index);
            setProducts(updated);

            if (updated.length === 0) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // Guardar productos en el backend
  const saveProducts = async () => {
    if (products.length === 0) {
      Alert.alert('No products', 'There are no products to save');
      return;
    }

    setLoading(true);

    try {
      console.log('💾 Saving products to backend:', products);

      await saveProductsToBackend(products);

      console.log('✅ Products saved successfully');

      Alert.alert(
        'Saved!',
        `${products.length} product${
          products.length !== 1 ? 's' : ''
        } added to your pantry`,
        [
          {
            text: 'View pantry',
            onPress: () => {
              // Reset navigation to Pantry tab - can't swipe back
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainTabs',
                    state: {
                      routes: [{ name: 'Pantry' }],
                      index: 0,
                    },
                  },
                ],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error saving products:', error);

      let errorMessage = 'Error saving products';

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
      <View style={styles.header}>
        <Ionicons
          name="checkbox-outline"
          size={32}
          color={Colors.brandPrimary}
        />
        <Text style={styles.title}>Review Products</Text>
        <Text style={styles.subtitle}>
          {products.length} product{products.length !== 1 ? 's' : ''} detected
        </Text>
      </View>

      {/* LISTA DE PRODUCTOS */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            {/* Icono y nombre */}
            <View style={styles.productHeader}>
              <Ionicons
                name="cart-outline"
                size={24}
                color={Colors.brandSecondary}
              />
              <TextInput
                style={styles.productNameInput}
                value={product.name}
                onChangeText={(text) => updateName(index, text)}
                placeholder="Product name"
                placeholderTextColor={Colors.textSecondary}
              />
              <Pressable onPress={() => removeProduct(index)}>
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={Colors.systemError}
                />
              </Pressable>
            </View>

            {/* Cantidad y categoría */}
            <View style={styles.productDetails}>
              <View style={styles.quantityContainer}>
                <Text style={styles.label}>Quantity:</Text>
                <View style={styles.quantityControls}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(index, (product.quantity || 1) - 1)
                    }
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={Colors.textPrimary}
                    />
                  </Pressable>
                  <TextInput
                    style={styles.quantityInput}
                    value={String(product.quantity || 1)}
                    onChangeText={(text) => updateQuantity(index, text)}
                    keyboardType="numeric"
                  />
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(index, (product.quantity || 1) + 1)
                    }
                  >
                    <Ionicons name="add" size={20} color={Colors.textPrimary} />
                  </Pressable>
                </View>
              </View>

              {product.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* BOTONES DE ACCIÓN */}
      <View style={styles.actions}>
        <Button
          title={`Save ${products.length} product${
            products.length !== 1 ? 's' : ''
          }`}
          onPress={saveProducts}
          loading={loading}
          icon="checkmark-circle-outline"
        />
        <Pressable
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: 60,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  productNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    paddingHorizontal: 12,
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryBadge: {
    backgroundColor: Colors.brandSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.backgroundPrimary,
    fontWeight: '600',
  },
  actions: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundSecondary,
    gap: 12,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
