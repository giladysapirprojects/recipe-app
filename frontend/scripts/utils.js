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
        const timeA = (a.prepTime || 0) + (a.cookTime || 0) + (a.additionalTime || 0);
        const timeB = (b.prepTime || 0) + (b.cookTime || 0) + (b.additionalTime || 0);
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

/* ============================================
   Unit Conversion System
   ============================================ */

/**
 * Volume conversion factors to milliliters (ml)
 * Using North American measurements
 */
const VOLUME_CONVERSIONS = {
  // Volume - Metric
  'ml': 1,
  'l': 1000,

  // Volume - Imperial/US (North American)
  'cups': 250,      // North American cup
  'cup': 250,
  'tbsp': 15,       // North American tablespoon
  'tablespoon': 15,
  'tablespoons': 15,
  'tsp': 5,         // North American teaspoon
  'teaspoon': 5,
  'teaspoons': 5,
  'fl oz': 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
  'pint': 473.176,
  'pints': 473.176,
  'quart': 946.353,
  'quarts': 946.353,
  'gallon': 3785.41,
  'gallons': 3785.41
};

/**
 * Weight conversion factors to grams (g)
 */
const WEIGHT_CONVERSIONS = {
  // Weight - Metric
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
  'mg': 0.001,
  'milligram': 0.001,
  'milligrams': 0.001,

  // Weight - Imperial
  'oz': 28.3495,
  'ounce': 28.3495,
  'ounces': 28.3495,
  'lb': 453.592,
  'lbs': 453.592,
  'pound': 453.592,
  'pounds': 453.592
};

/**
 * Determine the type of unit (volume, weight, or neutral)
 * @param {string} unit - Unit to check
 * @returns {string} 'volume', 'weight', or 'neutral'
 */
function getUnitType(unit) {
  if (!unit) return 'neutral';

  const normalizedUnit = unit.toLowerCase().trim();

  if (VOLUME_CONVERSIONS[normalizedUnit]) return 'volume';
  if (WEIGHT_CONVERSIONS[normalizedUnit]) return 'weight';

  return 'neutral';
}

/**
 * Determine if a unit is metric, imperial, or neutral
 * @param {string} unit - Unit to check
 * @returns {string} 'metric', 'imperial', or 'neutral'
 */
export function getUnitSystem(unit) {
  if (!unit) return 'neutral';

  const normalizedUnit = unit.toLowerCase().trim();

  // Metric units
  const metricUnits = ['ml', 'l', 'g', 'kg', 'mg', 'gram', 'grams', 'kilogram', 'kilograms', 'milligram', 'milligrams'];
  if (metricUnits.includes(normalizedUnit)) return 'metric';

  // Imperial units
  const imperialUnits = ['cups', 'cup', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
    'fl oz', 'fluid ounce', 'fluid ounces', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds',
    'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons'];
  if (imperialUnits.includes(normalizedUnit)) return 'imperial';

  return 'neutral';
}

/**
 * Parse quantity string that may contain fractions
 * Examples: "1/2", "1 1/2", "2.5", "2"
 * @param {string|number} quantity - Quantity to parse
 * @returns {number|null} Parsed number or null if invalid
 */
function parseQuantity(quantity) {
  if (typeof quantity === 'number') return quantity;
  if (!quantity || typeof quantity !== 'string') return null;

  const str = quantity.trim();

  // Check for empty or non-numeric strings
  if (str === '' || str.toLowerCase() === 'to taste' || str.toLowerCase() === 'a pinch') {
    return null;
  }

  // Handle simple decimals (e.g., "2.5")
  if (/^\d+\.?\d*$/.test(str)) {
    return parseFloat(str);
  }

  // Handle fractions (e.g., "1/2")
  if (/^\d+\/\d+$/.test(str)) {
    const [num, den] = str.split('/').map(Number);
    return num / den;
  }

  // Handle mixed fractions (e.g., "1 1/2")
  if (/^\d+\s+\d+\/\d+$/.test(str)) {
    const parts = str.split(/\s+/);
    const whole = parseInt(parts[0]);
    const [num, den] = parts[1].split('/').map(Number);
    return whole + (num / den);
  }

  return null;
}

/**
 * Convert quantity from any unit to metric base (ml for volume, g for weight)
 * @param {string|number} quantity - Quantity value
 * @param {string} unit - Unit to convert from
 * @returns {Object|null} { value: number, baseUnit: 'ml'|'g' } or null if unconvertible
 */
export function convertToMetric(quantity, unit) {
  const parsedQty = parseQuantity(quantity);
  if (parsedQty === null) return null;

  const normalizedUnit = unit ? unit.toLowerCase().trim() : '';
  const unitType = getUnitType(normalizedUnit);

  if (unitType === 'volume') {
    const conversionFactor = VOLUME_CONVERSIONS[normalizedUnit];
    return {
      value: parsedQty * conversionFactor,
      baseUnit: 'ml'
    };
  }

  if (unitType === 'weight') {
    const conversionFactor = WEIGHT_CONVERSIONS[normalizedUnit];
    return {
      value: parsedQty * conversionFactor,
      baseUnit: 'g'
    };
  }

  return null;
}

/**
 * Find the best metric unit for display
 * @param {number} value - Value in base metric unit (ml or g)
 * @param {string} baseUnit - Base unit ('ml' or 'g')
 * @returns {Object} { quantity: number, unit: string }
 */
function findBestMetricUnit(value, baseUnit) {
  if (baseUnit === 'ml') {
    // Convert to liters if >= 1000ml
    if (value >= 1000) {
      return { quantity: value / 1000, unit: 'l' };
    }
    return { quantity: value, unit: 'ml' };
  }

  if (baseUnit === 'g') {
    // Convert to kg if >= 1000g
    if (value >= 1000) {
      return { quantity: value / 1000, unit: 'kg' };
    }
    return { quantity: value, unit: 'g' };
  }

  return { quantity: value, unit: baseUnit };
}

/**
 * Find the best imperial unit for display
 * @param {number} value - Value in base metric unit (ml or g)
 * @param {string} baseUnit - Base unit ('ml' or 'g')
 * @returns {Object} { quantity: number, unit: string }
 */
function findBestImperialUnit(value, baseUnit) {
  if (baseUnit === 'ml') {
    // Volume conversions from ml to imperial
    if (value >= VOLUME_CONVERSIONS['cups']) {
      return { quantity: value / VOLUME_CONVERSIONS['cups'], unit: 'cups' };
    }
    if (value >= VOLUME_CONVERSIONS['tbsp']) {
      return { quantity: value / VOLUME_CONVERSIONS['tbsp'], unit: 'tbsp' };
    }
    if (value >= VOLUME_CONVERSIONS['tsp']) {
      return { quantity: value / VOLUME_CONVERSIONS['tsp'], unit: 'tsp' };
    }
    // Default to fl oz for small volumes
    return { quantity: value / VOLUME_CONVERSIONS['fl oz'], unit: 'fl oz' };
  }

  if (baseUnit === 'g') {
    // Weight conversions from g to imperial
    if (value >= WEIGHT_CONVERSIONS['lb']) {
      return { quantity: value / WEIGHT_CONVERSIONS['lb'], unit: 'lbs' };
    }
    return { quantity: value / WEIGHT_CONVERSIONS['oz'], unit: 'oz' };
  }

  return { quantity: value, unit: baseUnit };
}

/**
 * Round to sensible precision for display
 * @param {number} value - Value to round
 * @returns {number} Rounded value
 */
function roundToPrecision(value) {
  // Round to 2 decimal places, but remove trailing zeros
  const rounded = Math.round(value * 100) / 100;

  // For very small values, use more precision
  if (rounded < 1 && rounded > 0) {
    return Math.round(value * 10) / 10;
  }

  // For whole numbers or close to whole, round to integer
  if (Math.abs(rounded - Math.round(rounded)) < 0.01) {
    return Math.round(rounded);
  }

  return rounded;
}

/**
 * Convert an ingredient to the target unit system
 * @param {Object} ingredient - Ingredient object { quantity, unit, name }
 * @param {string} targetSystem - Target system ('metric' or 'imperial')
 * @returns {Object|null} { quantity: string, unit: string } or null if unconvertible
 */
export function convertIngredient(ingredient, targetSystem) {
  if (!ingredient || !ingredient.unit) return null;

  const currentSystem = getUnitSystem(ingredient.unit);

  // If already in target system or neutral, return as-is
  if (currentSystem === targetSystem || currentSystem === 'neutral') {
    return null;
  }

  // Convert to metric base first
  const metricBase = convertToMetric(ingredient.quantity, ingredient.unit);
  if (!metricBase) return null;

  // If target is metric, find best metric unit
  if (targetSystem === 'metric') {
    const result = findBestMetricUnit(metricBase.value, metricBase.baseUnit);
    return {
      quantity: roundToPrecision(result.quantity).toString(),
      unit: result.unit
    };
  }

  // If target is imperial, find best imperial unit
  if (targetSystem === 'imperial') {
    const result = findBestImperialUnit(metricBase.value, metricBase.baseUnit);
    return {
      quantity: roundToPrecision(result.quantity).toString(),
      unit: result.unit
    };
  }

  return null;
}
