import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { searchRecipes } from '../services/recipes';

export default function RecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      console.log('🔍 Searching for:', query);
      const data = await searchRecipes(query.trim());
      console.log('📦 Received data:', data);
      console.log('📦 Data type:', typeof data);
      console.log('📦 Is array:', Array.isArray(data));
      console.log('📦 Data length:', data?.length);

      // Handle different response formats
      const recipesList = Array.isArray(data) ? data : data?.results || [];
      console.log('📋 Recipes list:', recipesList);

      setRecipes(recipesList);
    } catch (error) {
      console.error('❌ Error searching recipes:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Could not search recipes');
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons
            name="restaurant-outline"
            size={40}
            color={Colors.textSecondary}
          />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.readyInMinutes && (
          <View style={styles.meta}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.metaText}>{item.readyInMinutes} min</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Recipes</Text>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes..."
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.searchButton,
                pressed && styles.searchButtonPressed,
              ]}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </Pressable>
          </View>

          {/* LOADING */}
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.brandPrimary} />
            </View>
          )}

          {/* EMPTY STATE */}
          {!loading && recipes.length === 0 && (
            <View style={styles.empty}>
              <Ionicons
                name={searched ? 'restaurant-outline' : 'search-outline'}
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                {searched ? 'No recipes found' : 'Search for recipes'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searched
                  ? 'Try a different search term'
                  : 'Enter ingredients or dish name'}
              </Text>
            </View>
          )}

          {/* RECIPE LIST */}
          {!loading && recipes.length > 0 && (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRecipe}
              contentContainerStyle={styles.list}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 10,
  },
  searchButton: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonPressed: { opacity: 0.8 },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  list: { paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPressed: { opacity: 0.7 },
  image: { width: 80, height: 80, borderRadius: 8 },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 12 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
