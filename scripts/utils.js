/* ============================================
   Recipe App - Utility Functions
   ============================================ */

/**
 * Generate a unique ID for recipes
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format time in minutes to human-readable string
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export function formatTime(minutes) {
  if (!minutes || minutes === 0) return '-';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${mins} min`;
  }
}

/**
 * Search recipes by title, description, ingredients, or tags
 * @param {Array} recipes - Array of recipe objects
 * @param {string} query - Search query
 * @returns {Array} Filtered recipes
 */
export function searchRecipes(recipes, query) {
  if (!query || query.trim() === '') {
    return recipes;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return recipes.filter(recipe => {
    // Search in title
    if (recipe.title.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in description
    if (recipe.description && recipe.description.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in ingredients
    if (recipe.ingredients && recipe.ingredients.some(ing => 
      ing.name.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    // Search in tags
    if (recipe.tags && recipe.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    )) {
      return true;
    }
    
    return false;
  });
}

/**
 * Filter recipes by category
 * @param {Array} recipes - Array of recipe objects
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered recipes
 */
export function filterByCategory(recipes, category) {
  if (!category || category === 'All') {
    return recipes;
  }
  
  return recipes.filter(recipe => recipe.category === category);
}

/**
 * Sort recipes by specified field
 * @param {Array} recipes - Array of recipe objects
 * @param {string} sortBy - Field to sort by (title, date, time)
 * @returns {Array} Sorted recipes
 */
export function sortRecipes(recipes, sortBy) {
  const sorted = [...recipes];
  
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    
    case 'date':
      return sorted.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    
    case 'time':
      return sorted.sort((a, b) => {
        const timeA = (a.prepTime || 0) + (a.cookTime || 0);
        const timeB = (b.prepTime || 0) + (b.cookTime || 0);
        return timeA - timeB;
      });
    
    default:
      return sorted;
  }
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Validate recipe data
 * @param {Object} recipe - Recipe object to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
export function validateRecipe(recipe) {
  const errors = [];
  
  if (!recipe.title || recipe.title.trim() === '') {
    errors.push('Recipe title is required');
  }
  
  if (!recipe.category) {
    errors.push('Category is required');
  }
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }
  
  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('At least one instruction is required');
  }
  
  // Validate ingredients
  if (recipe.ingredients) {
    recipe.ingredients.forEach((ing, index) => {
      if (!ing.name || ing.name.trim() === '') {
        errors.push(`Ingredient ${index + 1} name is required`);
      }
    });
  }
  
  // Validate instructions
  if (recipe.instructions) {
    recipe.instructions.forEach((inst, index) => {
      if (!inst || inst.trim() === '') {
        errors.push(`Instruction ${index + 1} cannot be empty`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get unique categories from recipes
 * @param {Array} recipes - Array of recipe objects
 * @returns {Array} Unique categories
 */
export function getCategories(recipes) {
  const categories = new Set(['All']);
  
  recipes.forEach(recipe => {
    if (recipe.category) {
      categories.add(recipe.category);
    }
  });
  
  return Array.from(categories);
}

/**
 * Get unique tags from recipes
 * @param {Array} recipes - Array of recipe objects
 * @returns {Array} Unique tags
 */
export function getTags(recipes) {
  const tags = new Set();
  
  recipes.forEach(recipe => {
    if (recipe.tags && Array.isArray(recipe.tags)) {
      recipe.tags.forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags);
}
