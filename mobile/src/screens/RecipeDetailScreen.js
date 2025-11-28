import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getRecipeDetail } from '../services/recipes';
import {
  splitIntoSentences,
  parseInstructions,
  stripHtml,
} from '../utils/textUtils';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await getRecipeDetail(recipeId);
      const recipeData = data.recipe || data;
      setRecipe(recipeData);
    } catch (error) {
      console.error('❌ Error loading recipe:', error);
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

  // Determine which instructions to use
  const hasAnalyzedInstructions =
    recipe.analyzedInstructions &&
    recipe.analyzedInstructions.length > 0 &&
    recipe.analyzedInstructions.some(
      (section) => section.steps && section.steps.length > 0
    );

  const hasStringInstructions =
    recipe.instructions &&
    typeof recipe.instructions === 'string' &&
    recipe.instructions.trim() !== '';

  const useAnalyzedInstructions = hasAnalyzedInstructions;
  const useStringInstructions =
    !hasAnalyzedInstructions && hasStringInstructions;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.brandPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Recipe Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
          {recipe.healthScore !== undefined && recipe.healthScore !== null && (
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
        {recipe.extendedIngredients &&
          recipe.extendedIngredients.length > 0 && (
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
        {useAnalyzedInstructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.analyzedInstructions.map((section, sectionIndex) => {
              if (!section.steps || section.steps.length === 0) return null;

              const isValidHeader =
                section.name &&
                section.name.trim() !== '' &&
                section.name.length < 50;

              // Split combined steps using utility function
              const allSteps = [];
              let stepNumber = 1;

              section.steps.forEach((step) => {
                const sentences = splitIntoSentences(step.step);

                sentences.forEach((sentence) => {
                  allSteps.push({
                    number: stepNumber++,
                    text: sentence,
                  });
                });
              });

              return (
                <View key={sectionIndex}>
                  {isValidHeader && (
                    <Text style={styles.subsectionTitle}>
                      {section.name.replace(':', '')}
                    </Text>
                  )}
                  {allSteps.map((step, stepIndex) => (
                    <View key={stepIndex} style={styles.step}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{step.number}</Text>
                      </View>
                      <Text style={styles.stepText}>{step.text}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : useStringInstructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {parseInstructions(recipe.instructions).map((item, index) => {
              if (item.type === 'header') {
                return (
                  <Text key={`header-${index}`} style={styles.subsectionTitle}>
                    {item.text}
                  </Text>
                );
              }

              return (
                <View key={`step-${index}`} style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{item.number}</Text>
                  </View>
                  <Text style={styles.stepText}>{item.text}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* DESCRIPTION */}
        {recipe.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.summaryText}>{stripHtml(recipe.summary)}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.brandPrimary,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
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
  metaItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  metaValue: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  section: { padding: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brandPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginLeft: 8,
  },
  step: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
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
