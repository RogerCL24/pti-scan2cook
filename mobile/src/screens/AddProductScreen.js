import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { createProduct } from '../services/products';
import Button from '../components/Button';

export default function AddProductScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    quantity: '1',
    category: '',
  });
  const [saving, setSaving] = useState(false);

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
      Alert.alert('Saved', 'Product added.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Add Product</Text>
        <Text style={styles.headerSubtitle}>
          Add a new product to your pantry
        </Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
            placeholder="e.g. Whole milk"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={form.quantity}
              onChangeText={(t) =>
                setForm((f) => ({ ...f, quantity: t.replace(/[^0-9]/g, '') }))
              }
              placeholder="1"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={form.category}
              onChangeText={(t) => setForm((f) => ({ ...f, category: t }))}
              placeholder="Dairy, Grains..."
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="words"
            />
          </View>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.buttonGroup}>
        <Button
          title="Save Product"
          onPress={onSave}
          loading={saving}
          icon="checkmark-circle-outline"
        />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="secondary"
          icon="close-outline"
        />
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
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
  form: {
    gap: 16,
    marginBottom: 24,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
    gap: 8,
  },
  buttonGroup: {
    gap: 12,
  },
});
