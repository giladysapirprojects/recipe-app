/* ============================================
   Recipe App - LocalStorage Management
   ============================================ */

const STORAGE_KEY = 'recipeAppData';

/**
 * Initialize storage with sample data if empty
 */
function initializeStorage() {
    const existing = loadRecipes();

    if (existing.length === 0) {
        // Add sample recipes for better UX
        const sampleRecipes = [
            {
                id: 'sample_1',
                title: 'Classic Chocolate Chip Cookies',
                description: 'Soft and chewy homemade cookies with plenty of chocolate chips',
                category: 'Dessert',
                tags: ['vegetarian', 'baking', 'sweet'],
                prepTime: 15,
                cookTime: 12,
                servings: 24,
                ingredients: [
                    { quantity: '2.25', unit: 'cups', name: 'all-purpose flour' },
                    { quantity: '1', unit: 'tsp', name: 'baking soda' },
                    { quantity: '1', unit: 'tsp', name: 'salt' },
                    { quantity: '1', unit: 'cup', name: 'butter, softened' },
                    { quantity: '0.75', unit: 'cup', name: 'granulated sugar' },
                    { quantity: '0.75', unit: 'cup', name: 'brown sugar' },
                    { quantity: '2', unit: '', name: 'eggs' },
                    { quantity: '2', unit: 'tsp', name: 'vanilla extract' },
                    { quantity: '2', unit: 'cups', name: 'chocolate chips' }
                ],
                instructions: [
                    'Preheat oven to 375°F (190°C).',
                    'In a small bowl, combine flour, baking soda, and salt.',
                    'In a large bowl, beat butter and both sugars until creamy.',
                    'Add eggs and vanilla extract to butter mixture and beat well.',
                    'Gradually blend in flour mixture.',
                    'Stir in chocolate chips.',
                    'Drop rounded tablespoons of dough onto ungreased cookie sheets.',
                    'Bake for 9-11 minutes or until golden brown.',
                    'Cool on baking sheets for 2 minutes, then remove to wire racks.'
                ],
                imageUrl: '',
                notes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'sample_2',
                title: 'Simple Garden Salad',
                description: 'Fresh and healthy salad with mixed greens and vegetables',
                category: 'Lunch',
                tags: ['vegetarian', 'healthy', 'quick'],
                prepTime: 10,
                cookTime: 0,
                servings: 4,
                ingredients: [
                    { quantity: '6', unit: 'cups', name: 'mixed salad greens' },
                    { quantity: '1', unit: 'cup', name: 'cherry tomatoes, halved' },
                    { quantity: '1', unit: '', name: 'cucumber, sliced' },
                    { quantity: '0.5', unit: 'cup', name: 'red onion, sliced' },
                    { quantity: '0.25', unit: 'cup', name: 'olive oil' },
                    { quantity: '2', unit: 'tbsp', name: 'balsamic vinegar' },
                    { quantity: '1', unit: 'tsp', name: 'Dijon mustard' },
                    { quantity: '', unit: '', name: 'salt and pepper to taste' }
                ],
                instructions: [
                    'Wash and dry all vegetables thoroughly.',
                    'In a large bowl, combine mixed greens, cherry tomatoes, cucumber, and red onion.',
                    'In a small bowl, whisk together olive oil, balsamic vinegar, Dijon mustard, salt, and pepper.',
                    'Drizzle dressing over salad just before serving.',
                    'Toss gently to combine and serve immediately.'
                ],
                imageUrl: '',
                notes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'sample_3',
                title: 'Spaghetti Carbonara',
                description: 'Classic Italian pasta with creamy egg sauce and pancetta',
                category: 'Dinner',
                tags: ['italian', 'pasta', 'quick'],
                prepTime: 10,
                cookTime: 15,
                servings: 4,
                ingredients: [
                    { quantity: '1', unit: 'lb', name: 'spaghetti' },
                    { quantity: '6', unit: 'oz', name: 'pancetta or bacon, diced' },
                    { quantity: '4', unit: '', name: 'large eggs' },
                    { quantity: '1', unit: 'cup', name: 'Parmesan cheese, grated' },
                    { quantity: '4', unit: 'cloves', name: 'garlic, minced' },
                    { quantity: '', unit: '', name: 'black pepper to taste' },
                    { quantity: '', unit: '', name: 'salt for pasta water' }
                ],
                instructions: [
                    'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
                    'While pasta cooks, fry pancetta in a large skillet until crispy.',
                    'Add minced garlic to the pancetta and cook for 1 minute.',
                    'In a bowl, whisk together eggs and Parmesan cheese.',
                    'Drain pasta, reserving 1 cup of pasta water.',
                    'Add hot pasta to the skillet with pancetta and remove from heat.',
                    'Quickly stir in the egg mixture, adding pasta water as needed to create a creamy sauce.',
                    'Season generously with black pepper and serve immediately with extra Parmesan.'
                ],
                imageUrl: '',
                notes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        saveRecipes(sampleRecipes);
    }
}

/**
 * Save recipes array to localStorage
 * @param {Array} recipes - Array of recipe objects
 * @returns {boolean} Success status
 */
export function saveRecipes(recipes) {
    try {
        const data = JSON.stringify(recipes);
        localStorage.setItem(STORAGE_KEY, data);
        return true;
    } catch (error) {
        console.error('Error saving recipes to localStorage:', error);
        return false;
    }
}

/**
 * Load recipes from localStorage
 * @returns {Array} Array of recipe objects
 */
export function loadRecipes() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading recipes from localStorage:', error);
        return [];
    }
}

/**
 * Get a single recipe by ID
 * @param {string} id - Recipe ID
 * @returns {Object|null} Recipe object or null if not found
 */
export function getRecipeById(id) {
    const recipes = loadRecipes();
    return recipes.find(recipe => recipe.id === id) || null;
}

/**
 * Add a new recipe
 * @param {Object} recipe - Recipe object
 * @returns {boolean} Success status
 */
export function addRecipe(recipe) {
    try {
        const recipes = loadRecipes();
        recipes.push(recipe);
        return saveRecipes(recipes);
    } catch (error) {
        console.error('Error adding recipe:', error);
        return false;
    }
}

/**
 * Update an existing recipe
 * @param {string} id - Recipe ID
 * @param {Object} updatedRecipe - Updated recipe object
 * @returns {boolean} Success status
 */
export function updateRecipe(id, updatedRecipe) {
    try {
        const recipes = loadRecipes();
        const index = recipes.findIndex(recipe => recipe.id === id);

        if (index === -1) {
            console.error('Recipe not found:', id);
            return false;
        }

        recipes[index] = {
            ...updatedRecipe,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };

        return saveRecipes(recipes);
    } catch (error) {
        console.error('Error updating recipe:', error);
        return false;
    }
}

/**
 * Delete a recipe
 * @param {string} id - Recipe ID
 * @returns {boolean} Success status
 */
export function deleteRecipe(id) {
    try {
        const recipes = loadRecipes();
        const filtered = recipes.filter(recipe => recipe.id !== id);

        if (filtered.length === recipes.length) {
            console.error('Recipe not found:', id);
            return false;
        }

        return saveRecipes(filtered);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return false;
    }
}

/**
 * Clear all recipes (use with caution)
 * @returns {boolean} Success status
 */
export function clearAllRecipes() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing recipes:', error);
        return false;
    }
}

/**
 * Export recipes as JSON file
 * @returns {string} JSON string of all recipes
 */
export function exportRecipes() {
    const recipes = loadRecipes();
    return JSON.stringify(recipes, null, 2);
}

/**
 * Import recipes from JSON string
 * @param {string} jsonString - JSON string of recipes
 * @returns {boolean} Success status
 */
export function importRecipes(jsonString) {
    try {
        const recipes = JSON.parse(jsonString);

        if (!Array.isArray(recipes)) {
            throw new Error('Invalid data format');
        }

        return saveRecipes(recipes);
    } catch (error) {
        console.error('Error importing recipes:', error);
        return false;
    }
}

// Initialize storage on module load
initializeStorage();
