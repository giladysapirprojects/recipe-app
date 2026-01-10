/**
 * Recipe Model
 * Handles all database operations for recipes using async sqlite3
 */

const db = require('../db/connection');

class Recipe {
    /**
     * Get all recipes with optional filters
     * @param {Object} filters - { search, category }
     * @returns {Promise<Array>} Array of recipe objects
     */
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM recipes';
        const params = [];
        const conditions = [];

        if (filters.category && filters.category !== 'All') {
            conditions.push('category = ?');
            params.push(filters.category);
        }

        if (filters.search) {
            conditions.push(`(
        title LIKE ? OR 
        description LIKE ? OR
        id IN (SELECT recipe_id FROM ingredients WHERE name LIKE ?) OR
        id IN (SELECT recipe_id FROM recipe_tags WHERE tag_id IN (SELECT id FROM tags WHERE name LIKE ?))
      )`);
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const recipes = await db.allAsync(query, params);

        // Attach related data (ingredients, instructions, tags) to each recipe
        return Promise.all(recipes.map(recipe => this._attachRelatedData(recipe)));
    }

    /**
     * Find single recipe by ID
     * @param {string} id - Recipe ID
     * @returns {Promise<Object|null>} Recipe object or null
     */
    static async findById(id) {
        const recipe = await db.getAsync('SELECT * FROM recipes WHERE id = ?', [id]);

        if (!recipe) {
            return null;
        }

        return this._attachRelatedData(recipe);
    }

    /**
     * Create a new recipe
     * @param {Object} recipeData - Recipe data
     * @returns {Promise<Object>} Created recipe
     */
    static async create(recipeData) {
        const {
            id,
            title,
            description = '',
            category,
            tags = [],
            prepTime = 0,
            cookTime = 0,
            servings = 0,
            ingredients = [],
            instructions = [],
            imageUrl = '',
            notes = ''
        } = recipeData;

        const now = new Date().toISOString();

        // Insert recipe
        await db.runAsync(`
      INSERT INTO recipes (id, title, description, category, prep_time, cook_time, servings, image_url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, description, category, prepTime, cookTime, servings, imageUrl, notes, now, now]);

        // Insert ingredients
        for (let i = 0; i < ingredients.length; i++) {
            const ing = ingredients[i];
            await db.runAsync(`
        INSERT INTO ingredients (recipe_id, quantity, unit, name, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, [id, ing.quantity || '', ing.unit || '', ing.name, i]);
        }

        // Insert instructions
        for (let i = 0; i < instructions.length; i++) {
            await db.runAsync(`
        INSERT INTO instructions (recipe_id, step_number, instruction)
        VALUES (?, ?, ?)
      `, [id, i + 1, instructions[i]]);
        }

        // Insert tags
        for (const tagName of tags) {
            await db.runAsync('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName]);
            await db.runAsync(`
        INSERT INTO recipe_tags (recipe_id, tag_id)
        SELECT ?, id FROM tags WHERE name = ?
      `, [id, tagName]);
        }

        return this.findById(id);
    }

    /**
     * Update existing recipe
     * @param {string} id - Recipe ID
     * @param {Object} recipeData - Updated recipe data
     * @returns {Promise<Object|null>} Updated recipe or null
     */
    static async update(id, recipeData) {
        const existing = await this.findById(id);

        if (!existing) {
            return null;
        }

        const {
            title,
            description = '',
            category,
            tags = [],
            prepTime = 0,
            cookTime = 0,
            servings = 0,
            ingredients = [],
            instructions = [],
            imageUrl = '',
            notes = ''
        } = recipeData;

        const now = new Date().toISOString();

        // Update recipe
        await db.runAsync(`
      UPDATE recipes 
      SET title = ?, description = ?, category = ?, prep_time = ?, cook_time = ?, 
          servings = ?, image_url = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [title, description, category, prepTime, cookTime, servings, imageUrl, notes, now, id]);

        // Delete old ingredients, instructions, and tags
        await db.runAsync('DELETE FROM ingredients WHERE recipe_id = ?', [id]);
        await db.runAsync('DELETE FROM instructions WHERE recipe_id = ?', [id]);
        await db.runAsync('DELETE FROM recipe_tags WHERE recipe_id = ?', [id]);

        // Insert new ingredients
        for (let i = 0; i < ingredients.length; i++) {
            const ing = ingredients[i];
            await db.runAsync(`
        INSERT INTO ingredients (recipe_id, quantity, unit, name, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, [id, ing.quantity || '', ing.unit || '', ing.name, i]);
        }

        // Insert new instructions
        for (let i = 0; i < instructions.length; i++) {
            await db.runAsync(`
        INSERT INTO instructions (recipe_id, step_number, instruction)
        VALUES (?, ?, ?)
      `, [id, i + 1, instructions[i]]);
        }

        // Insert new tags
        for (const tagName of tags) {
            await db.runAsync('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName]);
            await db.runAsync(`
        INSERT INTO recipe_tags (recipe_id, tag_id)
        SELECT ?, id FROM tags WHERE name = ?
      `, [id, tagName]);
        }

        return this.findById(id);
    }

    /**
     * Delete recipe
     * @param {string} id - Recipe ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id) {
        const result = await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
        return result && result.changes > 0;
    }

    /**
     * Attach related data (ingredients, instructions, tags) to recipe
     * @private
     */
    static async _attachRelatedData(recipe) {
        // Get ingredients
        const ingredients = await db.allAsync(`
      SELECT quantity, unit, name 
      FROM ingredients 
      WHERE recipe_id = ? 
      ORDER BY sort_order
    `, [recipe.id]);

        // Get instructions
        const instructions = await db.allAsync(`
      SELECT instruction 
      FROM instructions 
      WHERE recipe_id = ? 
      ORDER BY step_number
    `, [recipe.id]);

        // Get tags
        const tags = await db.allAsync(`
      SELECT t.name 
      FROM tags t
      JOIN recipe_tags rt ON t.id = rt.tag_id
      WHERE rt.recipe_id = ?
    `, [recipe.id]);

        return {
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            category: recipe.category,
            prepTime: recipe.prep_time,
            cookTime: recipe.cook_time,
            servings: recipe.servings,
            imageUrl: recipe.image_url,
            notes: recipe.notes,
            ingredients: ingredients,
            instructions: instructions.map(i => i.instruction),
            tags: tags.map(t => t.name),
            createdAt: recipe.created_at,
            updatedAt: recipe.updated_at
        };
    }
}

module.exports = Recipe;
