// TypeScript interfaces for the Recipe App

export interface Ingredient {
  quantity: string;
  unit: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  prepTime: number;
  cookTime: number;
  additionalTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string;
  sourceUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  prepTime: number;
  cookTime: number;
  additionalTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl: string;
  sourceUrl: string;
  notes: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface RecipeFilters {
  search?: string;
  category?: string;
}
