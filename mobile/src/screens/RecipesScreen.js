import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import {
  searchRecipes,
  getRandomSuggestions,
  refreshSuggestions,
} from '../services/recipes';

export default function RecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async (forceRefresh = false) => {
    setLoadingSuggestions(true);
    try {
      const data = forceRefresh
        ? await refreshSuggestions()
        : await getRandomSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.warn('❌ Error loading suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      console.log('🔍 Searching for:', query);
      const data = await searchRecipes(query.trim());
      console.log('📦 Received data:', data);

      const recipesList = Array.isArray(data) ? data : data?.results || [];
      console.log('📋 Recipes list:', recipesList);

      setRecipes(recipesList);
    } catch (error) {
      console.error('❌ Error searching recipes:', error);
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

  // Memoize the header to prevent re-renders
  const ListHeader = useMemo(
    () => (
      <View>
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

        {/* SUGGESTIONS HEADER */}
        {!searched && !loading && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {suggestions.length > 0 ? 'Suggested for You' : 'No Suggestions'}
            </Text>
            {suggestions.length > 0 && (
              <Pressable onPress={() => loadSuggestions(true)}>
                <Ionicons
                  name="refresh"
                  size={22}
                  color={Colors.brandPrimary}
                />
              </Pressable>
            )}
          </View>
        )}

        {/* SEARCH RESULTS HEADER */}
        {searched && recipes.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
            </Text>
            <Pressable
              onPress={() => {
                setSearched(false);
                setQuery('');
                setRecipes([]);
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
        )}
      </View>
    ),
    [query, searched, loading, suggestions.length, recipes.length]
  );

  const renderEmpty = () => {
    if (loading || loadingSuggestions) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.brandPrimary} />
        </View>
      );
    }

    if (searched && recipes.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons
            name="restaurant-outline"
            size={64}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyText}>No recipes found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setSearched(false);
              setQuery('');
              setRecipes([]);
            }}
          >
            <Text style={styles.backButtonText}>Back to suggestions</Text>
          </Pressable>
        </View>
      );
    }

    if (!searched && suggestions.length === 0) {
      return (
        <View style={styles.empty}>
          <Ionicons
            name="restaurant-outline"
            size={64}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyText}>No suggestions available</Text>
          <Text style={styles.emptySubtext}>
            Add products to get recipe suggestions
          </Text>
        </View>
      );
    }

    return null;
  };

  // Show search results if searched, otherwise show suggestions
  const displayData = searched ? recipes : suggestions;

  return (
    <View style={styles.container}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    </View>
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
    paddingBottom: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 10,
    marginLeft: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: 14,
    color: Colors.brandPrimary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingVertical: 40,
  },
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
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
  backButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
