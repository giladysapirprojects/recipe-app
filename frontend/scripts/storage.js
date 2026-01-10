/* ============================================
   Recipe App - API Storage Management
   Replaces localStorage with backend API calls
   ============================================ */

const API_URL = 'http://localhost:3000/api';

/**
 * Load all recipes from API
 * @param {Object} filters - Optional filters { search, category }
 * @returns {Promise<Array>} Array of recipe objects
 */
export async function loadRecipes(filters = {}) {
    try {
        let url = `${API_URL}/recipes`;

        // Add query parameters if filters provided
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error loading recipes from API:', error);
        throw error;
    }
}

/**
 * Get a single recipe by ID
 * @param {string} id - Recipe ID
 * @returns {Promise<Object|null>} Recipe object or null if not found
 */
export async function getRecipeById(id) {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching recipe:', error);
        throw error;
    }
}

/**
 * Add a new recipe
 * @param {Object} recipe - Recipe object
 * @returns {Promise<Object>} Created recipe
 */
export async function addRecipe(recipe) {
    try {
        const response = await fetch(`${API_URL}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error adding recipe:', error);
        throw error;
    }
}

/**
 * Update an existing recipe
 * @param {string} id - Recipe ID
 * @param {Object} updatedRecipe - Updated recipe object
 * @returns {Promise<Object|null>} Updated recipe or null
 */
export async function updateRecipe(id, updatedRecipe) {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedRecipe)
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw error;
    }
}

/**
 * Delete a recipe
 * @param {string} id - Recipe ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteRecipe(id) {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 404) {
            return false;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
}

/**
 * Check if API server is running
 * @returns {Promise<boolean>} Server status
 */
export async function checkServerHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Export recipes as JSON (for backup/migration)
 * @returns {Promise<string>} JSON string of all recipes
 */
export async function exportRecipes() {
    try {
        const recipes = await loadRecipes();
        return JSON.stringify(recipes, null, 2);
    } catch (error) {
        console.error('Error exporting recipes:', error);
        throw error;
    }
}
