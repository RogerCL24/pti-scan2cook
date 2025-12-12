import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getCategoryIcon } from '../constants/categoryIcons';
import {
  getUserProducts,
  deleteProduct,
  updateProduct,
} from '../services/products';

export default function PantryScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '' });

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const lastLoadRef = useRef(null);

  const categories = [
    'All',
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm({ name: '', category: '' });
    setShowNewCategoryInput(false);
    setNewCategory('');
  };

  const loadProducts = useCallback(async () => {
    try {
      const data = await getUserProducts();
      setProducts(data);
      lastLoadRef.current = Date.now();
    } catch (error) {
      console.error('❌ Error loading products:', error);
      Alert.alert('Error', 'Could not load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const lastLoad = lastLoadRef.current;
      const shouldLoad = !lastLoad || now - lastLoad > 30000;
      if (shouldLoad) loadProducts();
    }, [loadProducts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    lastLoadRef.current = null;
    loadProducts();
  }, [loadProducts]);

  const handleDelete = useCallback((product) => {
    Alert.alert('Delete Product', `Delete "${product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Could not delete product');
          }
        },
      },
    ]);
  }, []);

  const handleEditPress = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Product name cannot be empty');
      return;
    }

    try {
      const updatedProduct = {
        ...editingProduct,
        name: editForm.name.trim(),
        category: editForm.category,
        quantity: editingProduct.quantity, // keep amount
      };

      await updateProduct(editingProduct.id, updatedProduct);

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );

      closeEditModal();
      Alert.alert('Success', 'Product updated');
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Could not update product');
    }
  };

  const handleSelectCategory = (categoryName) => {
    setEditForm({ ...editForm, category: categoryName });
    setCategoryPickerOpen(false);
  };

  const handleCreateCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    if (categories.includes(newCategory.trim())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }
    setEditForm({ ...editForm, category: newCategory.trim() });
    setNewCategory('');
    setShowNewCategoryInput(false);
    setCategoryPickerOpen(false);
  };

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const renderProduct = useCallback(
    ({ item }) => {
      const iconName = getCategoryIcon(item.category);
      return (
        <Pressable style={styles.productCard}>
          <View style={styles.productIcon}>
            <Ionicons name={iconName} size={28} color={Colors.brandSecondary} />
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.productMeta}>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>x{item.quantity || 1}</Text>
              </View>
              {item.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.productActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleEditPress(item)}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={Colors.brandPrimary}
              />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.systemError}
              />
            </Pressable>
          </View>
        </Pressable>
      );
    },
    [handleDelete]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Pantry</Text>
            <Text style={styles.headerSubtitle}>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* CATEGORY CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="basket-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {selectedCategory === 'All'
                ? 'Your pantry is empty'
                : `No ${selectedCategory} products`}
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory === 'All'
                ? 'Scan a receipt or add products manually'
                : 'Try selecting a different category'}
            </Text>
          </View>
        }
      />

      {/* EDIT PRODUCT MODAL */}
      <Modal
        visible={!!editingProduct}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.backdrop} onPress={closeEditModal} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <Pressable onPress={closeEditModal}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  value={editForm.name}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, name: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <Pressable
                  style={styles.categorySelector}
                  onPress={() => setCategoryPickerOpen((v) => !v)}
                >
                  <Text
                    style={[
                      styles.categorySelectorText,
                      !editForm.category && styles.categorySelectorPlaceholder,
                    ]}
                  >
                    {editForm.category || 'Select category'}
                  </Text>
                  <Ionicons
                    name={categoryPickerOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </Pressable>

                {categoryPickerOpen && (
                  <View style={styles.categoryDropdown}>
                    <ScrollView
                      style={styles.categoryList}
                      keyboardShouldPersistTaps="handled"
                    >
                      {categories
                        .filter((cat) => cat !== 'All')
                        .map((category) => (
                          <Pressable
                            key={category}
                            style={styles.categoryOption}
                            onPress={() => handleSelectCategory(category)}
                          >
                            <Text style={styles.categoryOptionText}>
                              {category}
                            </Text>
                            {editForm.category === category && (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color={Colors.brandPrimary}
                              />
                            )}
                          </Pressable>
                        ))}

                      {showNewCategoryInput ? (
                        <View style={styles.newCategoryContainer}>
                          <TextInput
                            style={styles.newCategoryInput}
                            placeholder="New category name"
                            value={newCategory}
                            onChangeText={setNewCategory}
                            autoFocus
                          />
                          <Pressable
                            style={styles.createCategoryButton}
                            onPress={handleCreateCategory}
                          >
                            <Text style={styles.createCategoryButtonText}>
                              Create
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          style={styles.addCategoryButton}
                          onPress={() => setShowNewCategoryInput(true)}
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color={Colors.brandPrimary}
                          />
                          <Text style={styles.addCategoryButtonText}>
                            Add new category
                          </Text>
                        </Pressable>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CATEGORY SELECT (inline, no second Modal) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.backgroundPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: Colors.textSecondary },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: { transform: [{ scale: 0.95 }] },
  categoryScrollView: { marginHorizontal: -20 },
  categoryContainer: { paddingHorizontal: 20, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: Colors.brandPrimary },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: { color: '#fff' },
  list: { padding: 20 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.brandSecondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  productMeta: { flexDirection: 'row', gap: 8 },
  quantityBadge: {
    backgroundColor: `${Colors.brandPrimary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: { fontSize: 12, fontWeight: '600', color: Colors.brandPrimary },
  categoryBadge: {
    backgroundColor: Colors.brandSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  productActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary },
  formContainer: { marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categorySelectorText: { fontSize: 16, color: Colors.textPrimary },
  categorySelectorPlaceholder: { color: Colors.textSecondary },
  saveButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  categoryList: { maxHeight: 400 },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: `${Colors.brandPrimary}15`,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addCategoryButtonText: {
    fontSize: 16,
    color: Colors.brandPrimary,
    fontWeight: '600',
  },
  newCategoryContainer: { flexDirection: 'row', gap: 8, marginTop: 8 },
  newCategoryInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  createCategoryButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  createCategoryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  categoryDropdown: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    maxHeight: 260,
    overflow: 'hidden',
  },
});
