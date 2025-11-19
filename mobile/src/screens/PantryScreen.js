import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getUserProducts, deleteProduct } from '../services/products';

export default function PantryScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastLoadRef = useRef(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getUserProducts();
      setProducts(data);
      lastLoadRef.current = Date.now();
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
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

      if (shouldLoad) {
        console.log('🔄 Cargando productos (cache expirado)');
        loadProducts();
      } else {
        console.log(
          '✅ Cache vigente (hace',
          Math.floor((now - lastLoad) / 1000),
          's)'
        );
      }
    }, [loadProducts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    lastLoadRef.current = null; // Fuerza recarga
    loadProducts();
  }, [loadProducts]);

  const handleDelete = useCallback((product) => {
    Alert.alert('Eliminar producto', `¿Eliminar "${product.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            Alert.alert('Eliminado', 'Producto eliminado de la despensa');
          } catch (error) {
            console.error('Error eliminando producto:', error);
            Alert.alert('Error', 'No se pudo eliminar el producto');
          }
        },
      },
    ]);
  }, []);

  const renderProduct = useCallback(
    ({ item }) => (
      <View style={styles.productCard}>
        <View style={styles.productIcon}>
          <Ionicons
            name="nutrition-outline"
            size={28}
            color={Colors.brandSecondary}
          />
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

        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={22} color={Colors.systemError} />
        </Pressable>
      </View>
    ),
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="basket-outline"
            size={32}
            color={Colors.brandPrimary}
          />
          <View>
            <Text style={styles.title}>Mi Despensa</Text>
            <Text style={styles.subtitle}>
              {products.length} producto{products.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* LISTA DE PRODUCTOS */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="basket-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>Tu despensa está vacía</Text>
            <Text style={styles.emptySubtext}>
              Escanea un ticket para añadir productos
            </Text>
          </View>
        }
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundPrimary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
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
    alignItems: 'center',
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  quantityBadge: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  categoryBadge: {
    backgroundColor: Colors.brandSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.backgroundPrimary,
  },
  deleteButton: {
    padding: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.7,
  },
});
