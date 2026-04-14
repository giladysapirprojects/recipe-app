// Recipe state management hook — central CRUD + search/filter state

import { useState, useEffect, useCallback } from 'react';
import * as api from '@/services/api';
import type { Recipe, RecipeFormData } from '@/types/recipe';
import { getCategories, generateId } from '@/utils/formatters';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load recipes from API
  const loadAllRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search + filter combined
  const applyFilters = useCallback(async (search: string, category: string) => {
    try {
      const filters: { search?: string; category?: string } = {};
      if (search) filters.search = search;
      if (category && category !== 'All') filters.category = category;

      const data = await api.fetchRecipes(filters);
      setFilteredRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Filter failed');
    }
  }, []);

  // Search recipes
  const searchRecipes = useCallback(
    (query: string) => {
      setSearchQuery(query);
      applyFilters(query, currentCategory);
    },
    [currentCategory, applyFilters]
  );

  // Filter by category
  const filterByCategory = useCallback(
    (category: string) => {
      setCurrentCategory(category);
      applyFilters(searchQuery, category);
    },
    [searchQuery, applyFilters]
  );

  // Create recipe
  const addRecipe = useCallback(async (formData: RecipeFormData) => {
    const newRecipe = { ...formData, id: generateId() };
    await api.createRecipe(newRecipe);
    await loadAllRecipes();
  }, [loadAllRecipes]);

  // Update recipe
  const editRecipe = useCallback(async (id: string, formData: RecipeFormData) => {
    await api.updateRecipe(id, formData);
    await loadAllRecipes();
  }, [loadAllRecipes]);

  // Delete recipe
  const removeRecipe = useCallback(async (id: string) => {
    const success = await api.deleteRecipe(id);
    if (success) {
      await loadAllRecipes();
    }
    return success;
  }, [loadAllRecipes]);

  // Get categories from current recipe set
  const categories = getCategories(recipes);

  // Initial load
  useEffect(() => {
    loadAllRecipes();
  }, [loadAllRecipes]);

  return {
    recipes,
    filteredRecipes,
    loading,
    error,
    currentCategory,
    searchQuery,
    categories,
    searchRecipes,
    filterByCategory,
    addRecipe,
    editRecipe,
    removeRecipe,
    loadAllRecipes,
  };
}
