// Typed API service — all backend communication in one place

import type { Recipe, RecipeFormData, ApiResponse, RecipeFilters } from '@/types/recipe';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all recipes with optional filters
 */
export async function fetchRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);

  const url = params.toString() ? `${API_URL}/recipes?${params}` : `${API_URL}/recipes`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<Recipe[]> = await response.json();
  return result.data || [];
}

/**
 * Fetch a single recipe by ID
 */
export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const response = await fetch(`${API_URL}/recipes/${id}`);

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const result: ApiResponse<Recipe> = await response.json();
  return result.data;
}

/**
 * Create a new recipe
 */
export async function createRecipe(recipe: RecipeFormData & { id: string }): Promise<Recipe> {
  const response = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const result: ApiResponse<Recipe> = await response.json();
  return result.data;
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(id: string, recipe: RecipeFormData): Promise<Recipe | null> {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const result: ApiResponse<Recipe> = await response.json();
  return result.data;
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(id: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/recipes/${id}`, { method: 'DELETE' });

  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  return true;
}

/**
 * Import recipe data from a URL (returns parsed data, does not save)
 */
export async function importFromUrl(url: string): Promise<RecipeFormData> {
  const response = await fetch(`${API_URL}/recipes/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to import recipe');
  }

  return result.data;
}

/**
 * Import recipe data from an image/PDF via OCR (returns parsed data, does not save)
 */
export async function importFromOcr(file: File): Promise<RecipeFormData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/recipes/import/ocr`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to process file');
  }

  return result.data;
}

/**
 * Upload a recipe image
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.data.imageUrl;
}

/**
 * Check if the backend API server is running
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
