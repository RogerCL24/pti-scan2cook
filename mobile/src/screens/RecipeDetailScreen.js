import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getRecipeById } from '../services/recipes';

export default function RecipeDetailScreen({ route }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await getRecipeById(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Could not load recipe details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.brandPrimary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={Colors.systemError}
        />
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* IMAGE */}
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons
            name="restaurant-outline"
            size={80}
            color={Colors.textSecondary}
          />
        </View>
      )}

      {/* TITLE */}
      <Text style={styles.title}>{recipe.title}</Text>

      {/* META INFO */}
      <View style={styles.metaContainer}>
        {recipe.readyInMinutes && (
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.brandPrimary}
            />
            <Text style={styles.metaLabel}>Ready in</Text>
            <Text style={styles.metaValue}>{recipe.readyInMinutes} min</Text>
          </View>
        )}
        {recipe.servings && (
          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={24}
              color={Colors.brandPrimary}
            />
            <Text style={styles.metaLabel}>Servings</Text>
            <Text style={styles.metaValue}>{recipe.servings}</Text>
          </View>
        )}
        {recipe.healthScore && (
          <View style={styles.metaItem}>
            <Ionicons
              name="fitness-outline"
              size={24}
              color={Colors.brandPrimary}
            />
            <Text style={styles.metaLabel}>Health</Text>
            <Text style={styles.metaValue}>{recipe.healthScore}/100</Text>
          </View>
        )}
      </View>

      {/* INGREDIENTS */}
      {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.extendedIngredients.map((item, index) => (
            <View key={index} style={styles.ingredient}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors.brandSecondary}
              />
              <Text style={styles.ingredientText}>{item.original}</Text>
            </View>
          ))}
        </View>
      )}

      {/* INSTRUCTIONS */}
      {recipe.analyzedInstructions &&
        recipe.analyzedInstructions.length > 0 &&
        recipe.analyzedInstructions[0].steps && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.analyzedInstructions[0].steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepText}>{step.step}</Text>
              </View>
            ))}
          </View>
        )}

      {/* SUMMARY (HTML removed) */}
      {recipe.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.summaryText}>
            {recipe.summary.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    margin: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  metaItem: { alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  metaValue: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  section: { padding: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  step: { flexDirection: 'row', marginBottom: 16 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
