// Utility functions — formatting and helpers

/**
 * Format time in minutes to human-readable string
 */
export function formatTime(minutes: number): string {
  if (!minutes || minutes === 0) return '-';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/**
 * Format ISO date string to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string | undefined, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Generate a unique recipe ID
 */
export function generateId(): string {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce a function call
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get unique categories from recipe array
 */
export function getCategories(recipes: { category: string }[]): string[] {
  const categories = new Set<string>(['All']);
  recipes.forEach((recipe) => {
    if (recipe.category) categories.add(recipe.category);
  });
  return Array.from(categories);
}

/**
 * Validate recipe form data
 */
export function validateRecipe(recipe: {
  title: string;
  category: string;
  ingredients: { name: string }[];
  instructions: string[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!recipe.title?.trim()) errors.push('Recipe title is required');
  if (!recipe.category) errors.push('Category is required');
  if (!recipe.ingredients?.length) errors.push('At least one ingredient is required');
  if (!recipe.instructions?.length) errors.push('At least one instruction is required');

  recipe.ingredients?.forEach((ing, i) => {
    if (!ing.name?.trim()) errors.push(`Ingredient ${i + 1} name is required`);
  });

  recipe.instructions?.forEach((inst, i) => {
    if (!inst?.trim()) errors.push(`Instruction ${i + 1} cannot be empty`);
  });

  return { valid: errors.length === 0, errors };
}
