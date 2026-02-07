/**
 * Recipe Routes
 * API endpoints for recipe CRUD operations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Recipe = require('../models/Recipe');
const { parseRecipeFromUrl } = require('../services/parser');
const OCRService = require('../services/ocr/ocrService');
const { parseRecipeFromText } = require('../services/recipeTextParser');

// Configure multer for memory storage (OCR needs buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for OCR files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/bmp',
            'application/pdf'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, PNG, WebP, BMP) and PDF files are allowed'), false);
        }
    }
});


/**
 * POST /api/recipes/import
 * Import recipe data from URL (does not save - returns data for user review)
 * Request body: { url: string }
 */
router.post('/import', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        // Parse recipe from URL
        const recipeData = await parseRecipeFromUrl(url);

        res.json({
            success: true,
            data: recipeData,
            message: 'Recipe imported successfully'
        });
    } catch (error) {
        console.error('Error importing recipe:', error);
        res.status(400).json({
            success: false,
            error: 'Failed to import recipe',
            message: error.message
        });
    }
});

/**
 * POST /api/recipes/import/ocr
 * Import recipe data from image or PDF using OCR
 * Does not save - returns data for user review
 * Request: multipart/form-data with 'file' field
 */
router.post('/import/ocr', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log(`Processing OCR for file: ${req.file.originalname} (${req.file.mimetype})`);

        // Initialize OCR service (uses Tesseract by default, configurable via env)
        const ocrProvider = process.env.OCR_PROVIDER || 'tesseract';
        const ocrService = new OCRService(ocrProvider);

        // Extract text from file
        const extractedText = await ocrService.extractTextFromFile(
            req.file.buffer,
            req.file.mimetype
        );

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text could be extracted from the file',
                message: 'The file may be blank, corrupted, or not contain readable text'
            });
        }

        console.log(`Extracted ${extractedText.length} characters from file`);

        // Parse text into recipe structure
        const recipeData = parseRecipeFromText(extractedText);

        // Validate we got at least a title
        if (!recipeData.title || recipeData.title === 'Untitled Recipe') {
            return res.status(400).json({
                success: false,
                error: 'Could not extract recipe data from this file',
                message: 'The file does not appear to contain a valid recipe. Please check the image quality and try again.'
            });
        }

        res.json({
            success: true,
            data: recipeData,
            extractedText: extractedText.substring(0, 500), // Return first 500 chars for debugging
            message: 'Recipe extracted successfully from file'
        });
    } catch (error) {
        console.error('Error processing OCR:', error);
        res.status(400).json({
            success: false,
            error: 'Failed to process file',
            message: error.message
        });
    }
});


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
