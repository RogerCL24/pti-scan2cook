import { API_BASE_URL } from '../constants/config';
import { getToken } from './auth';

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

export const getRecipeById = async (id) => {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw { status: response.status, data: error };
  }

  return response.json();
};
