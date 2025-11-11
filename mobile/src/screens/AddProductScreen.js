import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { createProduct } from '../services/products';

export default function AddProductScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    quantity: '1',
    category: '',
    expiration_date: '',
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const name = form.name.trim();
    const quantity = parseInt(form.quantity, 10) || 1;
    if (!name)
      return Alert.alert('Campos requeridos', 'El nombre es obligatorio.');
    if (quantity <= 0)
      return Alert.alert('Cantidad inválida', 'Debe ser mayor a 0.');

    setSaving(true);
    try {
      await createProduct({
        name,
        quantity,
        category: form.category?.trim() || undefined,
        expiration_date: form.expiration_date?.trim() || undefined,
      });
      Alert.alert('Guardado', 'Producto añadido.');
      navigation.goBack(); // Pantry se recarga al enfocar
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Añadir producto</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
        placeholder="Ej: Leche entera"
        autoCapitalize="sentences"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Cantidad</Text>
          <TextInput
            style={styles.input}
            value={form.quantity}
            onChangeText={(t) =>
              setForm((f) => ({ ...f, quantity: t.replace(/[^0-9]/g, '') }))
            }
            placeholder="1"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Categoría</Text>
          <TextInput
            style={styles.input}
            value={form.category}
            onChangeText={(t) => setForm((f) => ({ ...f, category: t }))}
            placeholder="Lácteos, Granos..."
            autoCapitalize="words"
          />
        </View>
      </View>

      <Text style={styles.label}>Caducidad (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.expiration_date}
        onChangeText={(t) => setForm((f) => ({ ...f, expiration_date: t }))}
        placeholder="2025-12-31"
      />

      <View style={styles.actions}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.btnOutline,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.btnOutlineText}>Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.btnPrimary,
            saving && styles.btnDisabled,
            pressed && !saving && styles.pressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Guardar</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: Colors.backgroundPrimary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
  },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  btnPrimary: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnOutline: {
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  btnOutlineText: { color: Colors.textPrimary, fontWeight: '600' },
  btnDisabled: { opacity: 0.7 },
  pressed: { opacity: 0.85 },
});
