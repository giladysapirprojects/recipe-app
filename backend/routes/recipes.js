/**
 * Recipe Routes
 * API endpoints for recipe CRUD operations
 */

const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

/**
 * GET /api/recipes
 * Get all recipes with optional filters
 * Query params: ?search=query&category=Dinner
 */
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        const recipes = await Recipe.findAll({ search, category });

        res.json({
            success: true,
            data: recipes,
            count: recipes.length
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recipes',
            message: error.message
        });
    }
});

/**
 * GET /api/recipes/:id
 * Get single recipe by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recipe',
            message: error.message
        });
    }
});

/**
 * POST /api/recipes
 * Create new recipe
 */
router.post('/', async (req, res) => {
    try {
        const recipe = await Recipe.create(req.body);

        res.status(201).json({
            success: true,
            data: recipe,
            message: 'Recipe created successfully'
        });
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create recipe',
            message: error.message
        });
    }
});

/**
 * PUT /api/recipes/:id
 * Update existing recipe
 */
router.put('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.update(req.params.id, req.body);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe,
            message: 'Recipe updated successfully'
        });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update recipe',
            message: error.message
        });
    }
});

/**
 * DELETE /api/recipes/:id
 * Delete recipe
 */
router.delete('/:id', async (req, res) => {
    try {
        // Get recipe first to check for image
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found'
            });
        }

        // Delete the recipe from database
        await Recipe.delete(req.params.id);

        // CLEANUP: Delete local image file if it exists
        // NOTE: For cloud storage migration, replace fs.unlink with cloud delete API
        if (recipe.imageUrl && recipe.imageUrl.startsWith('/assets/images/')) {
            const fs = require('fs');
            const path = require('path');

            // Extract filename from URL path
            const filename = path.basename(recipe.imageUrl);
            const filePath = path.join(__dirname, '../../frontend/assets/images/recipes', filename);

            // Delete file (async, don't block response)
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete image file:', err);
                    // Don't fail the request if image deletion fails
                }
            });
        }

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete recipe',
            message: error.message
        });
    }
});

module.exports = router;
