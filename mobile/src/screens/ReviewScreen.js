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

  const updateQuantity = (index, newQuantity) => {
    const updated = [...products];
    const qty = parseInt(newQuantity) || 0;
    updated[index].quantity = qty > 0 ? qty : 1;
    setProducts(updated);
  };

  const updateName = (index, newName) => {
    const updated = [...products];
    updated[index].name = newName;
    setProducts(updated);
  };

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
        'Success!',
        `${products.length} product${
          products.length !== 1 ? 's' : ''
        } added to your pantry`,
        [
          {
            text: 'View Pantry',
            onPress: () => {
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
      <View style={styles.headerContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'MainTabs',
                  state: {
                    routes: [{ name: 'Scan' }],
                    index: 2,
                  },
                },
              ],
            });
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Review Products</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} product{products.length !== 1 ? 's' : ''} detected
          </Text>
        </View>
      </View>

      {/* LISTA DE PRODUCTOS */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            {/* HEADER DEL PRODUCTO */}
            <View style={styles.productHeader}>
              <View style={styles.productIcon}>
                <Ionicons
                  name="basket-outline"
                  size={20}
                  color={Colors.brandPrimary}
                />
              </View>
              <TextInput
                style={styles.productNameInput}
                value={product.name}
                onChangeText={(text) => updateName(index, text)}
                placeholder="Product name"
                placeholderTextColor={Colors.textSecondary}
              />
              <Pressable
                style={styles.deleteButton}
                onPress={() => removeProduct(index)}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={Colors.systemError}
                />
              </Pressable>
            </View>

            {/* CONTROLES DE CANTIDAD */}
            <View style={styles.productFooter}>
              <Text style={styles.quantityLabel}>Quantity</Text>
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
                    color={Colors.brandPrimary}
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
                  <Ionicons name="add" size={20} color={Colors.brandPrimary} />
                </Pressable>
              </View>
            </View>

            {product.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* BOTONES DE ACCIÓN */}
      <View style={styles.bottomActions}>
        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveProducts}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                Save {products.length} Product{products.length !== 1 ? 's' : ''}
              </Text>
            </>
          )}
        </Pressable>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingBottom: 120,
  },
  productCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${Colors.brandPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${Colors.systemError}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.brandPrimary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingVertical: 8,
  },
  categoryBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.brandSecondary}20`,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brandSecondary,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButton: {
    backgroundColor: Colors.brandSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.brandSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
