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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getUserProducts } from '../services/products';
import { getRandomSuggestions, refreshSuggestions } from '../services/recipes';

const CATEGORIES = [
  {
    id: 'Pantry',
    label: 'Pantry',
    icon: 'file-tray-full-outline',
    color: Colors.brandPrimary,
  },
  {
    id: 'Fridge',
    label: 'Fridge',
    icon: 'thermometer-outline',
    color: '#4DABF7',
  },
  {
    id: 'Freezer',
    label: 'Freezer',
    icon: 'snow',
    color: '#748FFC',
  },
];

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
    loadSuggestions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadSuggestions(true);
    setRefreshing(false);
  };

  const handleAlexaPress = async () => {
    const skillId = 'amzn1.ask.skill.b2b75995-aaa3-4dfd-80c5-83416db4b1e6';
    const url = `https://alexa-skills.amazon.es/apis/custom/skills/${skillId}/launch`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Cannot open Alexa',
        'Install the Alexa app or try from a browser.'
      );
    }
  };

  const handleCategoryPress = (categoryId) => {
    navigation.navigate('Pantry', { filterCategory: categoryId });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hello, {firstName}!</Text>
          <Pressable
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons
              name="person-circle-outline"
              size={36}
              color={Colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* ALEXA PILL BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.alexaPill,
            pressed && styles.alexaPillPressed,
          ]}
          onPress={handleAlexaPress}
        >
          <Image
            source={require('../../assets/alexa-icon.png')}
            style={styles.alexaPillIcon}
            resizeMode="contain"
          />
          <Text style={styles.alexaPillText}>Ask Alexa</Text>
        </Pressable>

        {/* PANTRY SUMMARY CARD */}
        <Pressable
          style={styles.summaryCard}
          onPress={() => navigation.navigate('Pantry')}
        >
          <View style={styles.summaryIconContainer}>
            <Ionicons
              name="cube-outline"
              size={32}
              color={Colors.brandSecondary}
            />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Products in your pantry</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </Pressable>

        {/* STORAGE LOCATIONS */}
        <View style={styles.storageSection}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: `${category.color}15` },
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={28}
                  color={category.color}
                />
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* SCAN BANNER */}
        <Pressable
          style={styles.scanBanner}
          onPress={() => navigation.navigate('Scan')}
        >
          <View style={styles.scanIconCircle}>
            <Ionicons name="camera" size={28} color="#fff" />
          </View>
          <View style={styles.scanTextContainer}>
            <Text style={styles.scanTitle}>Scan Receipt</Text>
            <Text style={styles.scanSubtitle}>Add products from a ticket</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.brandPrimary}
          />
        </Pressable>

        {/* READY TO COOK */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ready to Cook</Text>
            <Pressable onPress={() => navigation.navigate('Recipes')}>
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>

          {loadingSuggestions ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color={Colors.brandPrimary} />
            </View>
          ) : stats.total === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                Add products to your pantry to get recipe suggestions
              </Text>
            </View>
          ) : suggestions.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((recipe) => {
                const usedCount = recipe.usedIngredientCount || 0;
                const missedCount = recipe.missedIngredientCount || 0;
                const totalCount = usedCount + missedCount || 0;

                const matchPercentage =
                  totalCount > 0
                    ? Math.round((usedCount / totalCount) * 100)
                    : 0;

                const isFullMatch = matchPercentage >= 80;

                return (
                  <Pressable
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() =>
                      navigation.navigate('RecipeDetail', {
                        recipeId: recipe.id,
                      })
                    }
                  >
                    {isFullMatch && (
                      <View style={styles.matchBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#fff"
                        />
                        <Text style={styles.matchBadgeText}>
                          {matchPercentage}% Match
                        </Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: recipe.image }}
                      style={styles.recipeImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeTitle} numberOfLines={2}>
                        {recipe.title}
                      </Text>

                      <View style={styles.recipeMetaContainer}>
                        <View style={styles.recipeMetaItem}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.recipeMetaText}>
                            {recipe.readyInMinutes
                              ? `${recipe.readyInMinutes}m`
                              : '30m'}
                          </Text>
                        </View>
                        <View style={styles.recipeMetaItem}>
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.recipeMetaText}>
                            {recipe.servings ? `${recipe.servings}` : '2'}
                          </Text>
                        </View>
                        {totalCount > 0 && (
                          <View style={styles.recipeMetaItem}>
                            <Ionicons
                              name="basket-outline"
                              size={14}
                              color={
                                isFullMatch
                                  ? Colors.systemSuccess
                                  : Colors.brandSecondary
                              }
                            />
                            <Text
                              style={[
                                styles.recipeMetaText,
                                isFullMatch && styles.recipeMetaTextSuccess,
                              ]}
                            >
                              {usedCount}/{totalCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                No recipes available. Try adding more products!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  profileButton: {
    padding: 4,
  },
  alexaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.brandSecondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    marginBottom: 24,
    shadowColor: Colors.brandSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  alexaPillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  alexaPillIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  alexaPillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.brandSecondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  storageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scanBanner: {
    backgroundColor: `${Colors.brandPrimary}10`,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  scanSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brandPrimary,
  },
  loadingSection: {
    padding: 40,
    alignItems: 'center',
  },
  recipeCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.systemSuccess,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: Colors.systemSuccess,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  recipeImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.backgroundSecondary,
  },
  recipeInfo: {
    padding: 14,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
    height: 40,
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
  recipeMetaTextSuccess: {
    color: Colors.systemSuccess,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
