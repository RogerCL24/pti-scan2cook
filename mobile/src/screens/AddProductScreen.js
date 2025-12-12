import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { createProduct, getUserProducts } from '../services/products';

export default function AddProductScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    quantity: '1',
    category: '',
  });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const products = await getUserProducts();
        const unique = [
          ...new Set(products.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(unique);
      } catch (e) {
        console.log('Could not load categories', e);
      }
    })();
  }, []);

  const disableSave = useMemo(
    () => saving || !form.name.trim() || Number(form.quantity || 0) <= 0,
    [saving, form]
  );

  const onSave = async () => {
    const name = form.name.trim();
    const quantity = parseInt(form.quantity, 10) || 1;
    if (!name) return Alert.alert('Required fields', 'Name is required.');
    if (quantity <= 0)
      return Alert.alert('Invalid quantity', 'Must be greater than 0.');

    setSaving(true);
    try {
      await createProduct({
        name,
        quantity,
        category: form.category?.trim() || undefined,
      });
      Alert.alert('Success', 'Product added to your pantry');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not create product');
    } finally {
      setSaving(false);
    }
  };

  const selectCategory = (cat) => {
    setForm((f) => ({ ...f, category: cat }));
    setPickerOpen(false);
    setAddingNew(false);
    setNewCategory('');
  };

  const createCategory = () => {
    const name = newCategory.trim();
    if (!name) return Alert.alert('Error', 'Category name cannot be empty.');
    if (categories.includes(name)) {
      setAddingNew(false);
      setNewCategory('');
      return selectCategory(name);
    }
    setCategories((prev) => [...prev, name]);
    selectCategory(name);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Add Product</Text>
            <Text style={styles.headerSubtitle}>
              Add a new product to your pantry
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* FORM CARD */}
        <View style={styles.formCard}>
          {/* NAME INPUT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
              placeholder="e.g. Whole milk"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="sentences"
            />
          </View>

          {/* QUANTITY INPUT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.quantityControl}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => {
                  const current = parseInt(form.quantity) || 1;
                  if (current > 1) {
                    setForm((f) => ({
                      ...f,
                      quantity: (current - 1).toString(),
                    }));
                  }
                }}
              >
                <Ionicons name="remove" size={20} color={Colors.brandPrimary} />
              </Pressable>
              <TextInput
                style={styles.quantityInput}
                value={form.quantity}
                onChangeText={(t) =>
                  setForm((f) => ({ ...f, quantity: t.replace(/[^0-9]/g, '') }))
                }
                placeholder="1"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="number-pad"
              />
              <Pressable
                style={styles.quantityButton}
                onPress={() => {
                  const current = parseInt(form.quantity) || 0;
                  setForm((f) => ({
                    ...f,
                    quantity: (current + 1).toString(),
                  }));
                }}
              >
                <Ionicons name="add" size={20} color={Colors.brandPrimary} />
              </Pressable>
            </View>
          </View>

          {/* CATEGORY SELECTOR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category (optional)</Text>
            <Pressable
              style={styles.selector}
              onPress={() => setPickerOpen((v) => !v)}
            >
              <Text
                style={[
                  styles.selectorText,
                  !form.category && styles.selectorPlaceholder,
                ]}
              >
                {form.category || 'Select category'}
              </Text>
              <Ionicons
                name={pickerOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textSecondary}
              />
            </Pressable>

            {pickerOpen && (
              <View style={styles.dropdown}>
                <ScrollView
                  style={styles.dropdownScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {categories.length === 0 && (
                    <Text style={styles.emptyOption}>No categories yet</Text>
                  )}

                  {categories.map((cat) => (
                    <Pressable
                      key={cat}
                      style={styles.option}
                      onPress={() => selectCategory(cat)}
                    >
                      <Text style={styles.optionText}>{cat}</Text>
                      {form.category === cat && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={Colors.brandPrimary}
                        />
                      )}
                    </Pressable>
                  ))}

                  {addingNew ? (
                    <View style={styles.newRow}>
                      <TextInput
                        style={styles.newInput}
                        placeholder="New category name"
                        placeholderTextColor={Colors.textSecondary}
                        value={newCategory}
                        onChangeText={setNewCategory}
                        autoFocus
                      />
                      <Pressable
                        style={styles.createBtn}
                        onPress={createCategory}
                      >
                        <Text style={styles.createBtnText}>Create</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.addOption}
                      onPress={() => setAddingNew(true)}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={Colors.brandPrimary}
                      />
                      <Text style={styles.addOptionText}>Add new category</Text>
                    </Pressable>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* SAVE BUTTON */}
        <Pressable
          style={[styles.saveButton, disableSave && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={disableSave}
        >
          {saving ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Add to Pantry</Text>
            </>
          )}
        </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    padding: 20,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.brandPrimary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selectorPlaceholder: {
    color: Colors.textSecondary,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    maxHeight: 240,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  emptyOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundPrimary,
  },
  addOptionText: {
    fontSize: 16,
    color: Colors.brandPrimary,
    fontWeight: '600',
  },
  newRow: {
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundPrimary,
  },
  newInput: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  createBtn: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
