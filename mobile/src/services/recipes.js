import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  SUGGESTIONS: 'recipe_suggestions_cache',
  SUGGESTIONS_TS: 'recipe_suggestions_timestamp',
  SEARCH_PREFIX: 'recipe_search_', // search_query_cache
  SEARCH_TS_PREFIX: 'recipe_search_ts_', // search_query_timestamp
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const SEARCH_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for searches

// Helper: Check if cache is valid
const isCacheValid = async (timestampKey, duration = CACHE_DURATION) => {
  try {
    const timestamp = await AsyncStorage.getItem(timestampKey);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp);
    return age < duration;
  } catch {
    return false;
  }
};

// Helper: Get from cache
const getFromCache = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Helper: Save to cache
const saveToCache = async (key, timestampKey, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    await AsyncStorage.setItem(timestampKey, Date.now().toString());
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
};

// Helper: Create cache key from search query
const getSearchCacheKey = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  return `${CACHE_KEYS.SEARCH_PREFIX}${normalizedQuery}`;
};

const getSearchTimestampKey = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  return `${CACHE_KEYS.SEARCH_TS_PREFIX}${normalizedQuery}`;
};

/**
 * Get random recipe suggestions (with 1-hour cache)
 */
export const getRandomSuggestions = async () => {
  // Check cache first
  const cacheValid = await isCacheValid(CACHE_KEYS.SUGGESTIONS_TS);
  if (cacheValid) {
    const cached = await getFromCache(CACHE_KEYS.SUGGESTIONS);
    if (cached && cached.length > 0) {
      console.log('✅ Using cached suggestions');
      return cached;
    }
  }

  // Fetch from API
  console.log('🌐 Fetching fresh suggestions from API');
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No auth token');

  const res = await fetch(`${API_BASE_URL}/recipes/suggest/random`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error: ${res.status} - ${error}`);
  }

  const data = await res.json();
  const recipes = data.recipes || [];

  // Save to cache
  await saveToCache(CACHE_KEYS.SUGGESTIONS, CACHE_KEYS.SUGGESTIONS_TS, recipes);

  return recipes;
};

/**
 * Search recipes (with 24-hour cache per query)
 */
export const searchRecipes = async (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const cacheKey = getSearchCacheKey(normalizedQuery);
  const timestampKey = getSearchTimestampKey(normalizedQuery);

  // Check cache first (24h)
  const cacheValid = await isCacheValid(timestampKey, SEARCH_CACHE_DURATION);
  if (cacheValid) {
    const cached = await getFromCache(cacheKey);
    if (cached) {
      console.log(`✅ Using cached search results for: "${normalizedQuery}"`);
      return cached;
    }
  }

  // Fetch from API
  console.log(`🌐 Fetching search results for: "${normalizedQuery}"`);
  const res = await fetch(
    `${API_BASE_URL}/recipes/search?query=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const data = await res.json();
  const results = data.results || [];

  // Cache for 24h
  await saveToCache(cacheKey, timestampKey, results);

  return results;
};

/**
 * Get recipe detail (cache per recipe for 24h)
 */
export const getRecipeDetail = async (id) => {
  const cacheKey = `recipe_${id}`;
  const timestampKey = `recipe_${id}_ts`;

  // Check cache (24h)
  const timestamp = await AsyncStorage.getItem(timestampKey);
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < SEARCH_CACHE_DURATION) {
      const cached = await getFromCache(cacheKey);
      if (cached) {
        console.log(`✅ Using cached recipe ${id}`);
        return cached;
      }
    }
  }

  // Fetch from API
  console.log(`🌐 Fetching recipe ${id} from API`);
  const res = await fetch(`${API_BASE_URL}/recipes/${id}`);

  if (!res.ok) {
    throw new Error(`Recipe fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const recipe = data.recipe;

  // Cache for 24h
  await saveToCache(cacheKey, timestampKey, recipe);

  return recipe;
};

/**
 * Force refresh suggestions (ignores cache)
 */
export const refreshSuggestions = async () => {
  await AsyncStorage.removeItem(CACHE_KEYS.SUGGESTIONS);
  await AsyncStorage.removeItem(CACHE_KEYS.SUGGESTIONS_TS);
  return getRandomSuggestions();
};

/**
 * Clear all recipe caches (useful for logout/debugging)
 */
export const clearRecipeCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const recipeKeys = keys.filter(
      (key) =>
        key.startsWith('recipe_') || key.startsWith(CACHE_KEYS.SEARCH_PREFIX)
    );
    await AsyncStorage.multiRemove(recipeKeys);
    console.log('🗑️ Recipe cache cleared');
  } catch (e) {
    console.warn('Failed to clear recipe cache:', e);
  }
};
