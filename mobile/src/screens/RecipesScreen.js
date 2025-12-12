import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import {
  searchRecipes,
  getRandomSuggestions,
  refreshSuggestions,
} from '../services/recipes';

const DIET_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten free', label: 'Gluten Free', icon: '🌾' },
  { id: 'ketogenic', label: 'Keto', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', icon: '🍖' },
  { id: 'lacto vegetarian', label: 'Lacto Vegetarian', icon: '🥛' },
];

export default function RecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState(null);

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
      console.log('🔍 Searching for:', query, 'with diet:', selectedDiet);
      const data = await searchRecipes(query.trim(), selectedDiet);
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

  const clearSearch = () => {
    setSearched(false);
    setQuery('');
    setRecipes([]);
  };

  const handleFilterSelect = (dietId) => {
    setSelectedDiet(dietId === selectedDiet ? null : dietId);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    if (searched && query.trim()) {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSelectedDiet(null);
    setShowFilterModal(false);
    if (searched && query.trim()) {
      handleSearch();
    }
  };

  const renderRecipe = ({ item }) => {
    const usedCount = item.usedIngredientCount || 0;
    const missedCount = item.missedIngredientCount || 0;
    const totalCount = usedCount + missedCount || 0;

    return (
      <Pressable
        style={styles.recipeCard}
        onPress={() =>
          navigation.navigate('RecipeDetail', { recipeId: item.id })
        }
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recipeImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={Colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.recipeMetaContainer}>
            <View style={styles.recipeMetaItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.recipeMetaText}>
                {item.readyInMinutes ? `${item.readyInMinutes}m` : '30m'}
              </Text>
            </View>

            <View style={styles.recipeMetaItem}>
              <Ionicons
                name="people-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.recipeMetaText}>
                {item.servings ? `${item.servings}` : '2'}
              </Text>
            </View>

            {totalCount > 0 && (
              <View style={styles.recipeMetaItem}>
                <Ionicons
                  name="basket-outline"
                  size={14}
                  color={Colors.brandSecondary}
                />
                <Text style={styles.recipeMetaText}>
                  {usedCount}/{totalCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const displayData = searched ? recipes : suggestions;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recipes</Text>
          <Text style={styles.headerSubtitle}>
            {searched
              ? `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} found`
              : 'Discover delicious recipes'}
          </Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={Colors.textSecondary}
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
          style={[
            styles.filterButton,
            selectedDiet && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={selectedDiet ? '#fff' : Colors.brandPrimary}
          />
          {selectedDiet && <View style={styles.filterDot} />}
        </Pressable>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ACTIVE FILTER CHIP */}
      {selectedDiet && (
        <View style={styles.activeFilterContainer}>
          <View style={styles.activeFilterChip}>
            <Text style={styles.activeFilterEmoji}>
              {DIET_FILTERS.find((f) => f.id === selectedDiet)?.icon}
            </Text>
            <Text style={styles.activeFilterText}>
              {DIET_FILTERS.find((f) => f.id === selectedDiet)?.label}
            </Text>
            <Pressable onPress={() => setSelectedDiet(null)}>
              <Ionicons name="close" size={16} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      )}

      {/* CONTENT */}
      {loading || loadingSuggestions ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.brandPrimary} />
          <Text style={styles.loadingText}>
            {loading ? 'Searching recipes...' : 'Loading suggestions...'}
          </Text>
        </View>
      ) : (
        <>
          {/* SECTION HEADER */}
          {!searched && suggestions.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggested for You</Text>
              <Pressable
                style={styles.refreshButton}
                onPress={() => loadSuggestions(true)}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={Colors.brandPrimary}
                />
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>
          )}

          {searched && recipes.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <Pressable style={styles.refreshButton} onPress={clearSearch}>
                <Ionicons name="close" size={20} color={Colors.systemError} />
                <Text
                  style={[styles.refreshText, { color: Colors.systemError }]}
                >
                  Clear
                </Text>
              </Pressable>
            </View>
          )}

          {/* RECIPE LIST */}
          {displayData.length > 0 ? (
            <FlatList
              data={displayData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRecipe}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.empty}>
              <Ionicons
                name="restaurant-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                {searched ? 'No recipes found' : 'No suggestions available'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searched
                  ? 'Try a different search term or filter'
                  : 'Add products to your pantry to get personalized suggestions'}
              </Text>
              {searched && (
                <Pressable style={styles.emptyButton} onPress={clearSearch}>
                  <Text style={styles.emptyButtonText}>
                    Back to suggestions
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </>
      )}

      {/* FILTER MODAL */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Diet Filters</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.filterList}
              showsVerticalScrollIndicator={false}
            >
              {DIET_FILTERS.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterOption,
                    selectedDiet === filter.id && styles.filterOptionActive,
                  ]}
                  onPress={() => handleFilterSelect(filter.id)}
                >
                  <View style={styles.filterOptionContent}>
                    <Text style={styles.filterEmoji}>{filter.icon}</Text>
                    <Text
                      style={[
                        styles.filterLabel,
                        selectedDiet === filter.id && styles.filterLabelActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </View>
                  {selectedDiet === filter.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.brandPrimary}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              {selectedDiet && (
                <Pressable style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Clear Filter</Text>
                </Pressable>
              )}
              <Pressable style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 12,
    backgroundColor: Colors.backgroundPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: Colors.backgroundPrimary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.brandPrimary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.brandPrimary,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activeFilterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.backgroundPrimary,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeFilterEmoji: {
    fontSize: 16,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${Colors.brandPrimary}15`,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brandPrimary,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  recipeCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.backgroundSecondary,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 12,
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterList: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 12,
  },
  filterOptionActive: {
    backgroundColor: `${Colors.brandPrimary}15`,
    borderWidth: 2,
    borderColor: Colors.brandPrimary,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterEmoji: {
    fontSize: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  filterLabelActive: {
    fontWeight: '600',
    color: Colors.brandPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
