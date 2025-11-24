import { API_BASE_URL } from '../constants/config';
import { getToken } from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const searchRecipes = async (query) => {
  const token = await getToken();

  const response = await fetch(
    `${API_BASE_URL}/recipes/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw { status: response.status, data: error };
  }

  return response.json();
};

export const getRecipeById = async (recipeId) => {
  try {
    // Check cache first
    const cacheKey = `recipe_cache_${recipeId}`;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        console.log('📦 Using cached recipe:', recipeId);
        return data;
      }
    }

    // If not cached or expired, fetch from API
    console.log('🌐 Fetching recipe from API:', recipeId);
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, data: error };
    }

    const data = await response.json();

    // Cache the result
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: { recipe: data, success: true },
        timestamp: Date.now(),
      })
    );

    return { recipe: data, success: true };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};
