import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getUserProducts } from '../services/products';
import { getRandomSuggestions, refreshSuggestions } from '../services/recipes';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, low: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const loadStats = async () => {
    try {
      const products = await getUserProducts();
      setStats({
        total: products.length,
        low: products.filter((p) => p.quantity <= 2).length,
      });
    } catch (e) {
      console.warn('Stats load error:', e.message);
    }
  };

  const loadSuggestions = async (forceRefresh = false) => {
    setLoadingSuggestions(true);
    try {
      const recipes = forceRefresh
        ? await refreshSuggestions()
        : await getRandomSuggestions();
      setSuggestions(recipes);
    } catch (e) {
      console.warn('Suggestions load error:', e.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadSuggestions(); // Uses cache if available
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadSuggestions(true); // Force refresh on pull-down
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hello, {firstName}!</Text>
        </View>
        <Pressable
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons
            name="person-circle-outline"
            size={40}
            color={Colors.brandPrimary}
          />
        </Pressable>
      </View>

      {/* STATS CARDS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={32} color={Colors.brandPrimary} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Products in pantry</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={Colors.systemWarning}
          />
          <Text style={styles.statValue}>{stats.low}</Text>
          <Text style={styles.statLabel}>Low stock items</Text>
        </View>
      </View>

      {/* SUGGESTED RECIPES */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested for You</Text>
          <Pressable onPress={() => loadSuggestions(true)}>
            <Ionicons name="refresh" size={22} color={Colors.brandPrimary} />
          </Pressable>
        </View>

        {loadingSuggestions ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={Colors.brandPrimary} />
          </View>
        ) : suggestions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestions.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() =>
                  navigation.navigate('RecipeDetail', { recipeId: recipe.id })
                }
              >
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No suggestions available</Text>
        )}
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('Scan')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="scan-outline"
                size={28}
                color={Colors.brandPrimary}
              />
            </View>
            <Text style={styles.actionTitle}>Scan Receipt</Text>
            <Text style={styles.actionSubtitle}>Add items quickly</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('Pantry')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="list-outline"
                size={28}
                color={Colors.brandPrimary}
              />
            </View>
            <Text style={styles.actionTitle}>View Pantry</Text>
            <Text style={styles.actionSubtitle}>Manage products</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('Recipes')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="restaurant-outline"
                size={28}
                color={Colors.brandPrimary}
              />
            </View>
            <Text style={styles.actionTitle}>Find Recipes</Text>
            <Text style={styles.actionSubtitle}>Cook something</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={Colors.brandPrimary}
              />
            </View>
            <Text style={styles.actionTitle}>Add Product</Text>
            <Text style={styles.actionSubtitle}>Manual entry</Text>
          </Pressable>
        </View>
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
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  loadingSection: {
    padding: 40,
    alignItems: 'center',
  },
  recipeCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
