/**
 * Recipe Parser Service
 * Extracts recipe data from URLs using JSON-LD structured data or HTML parsing
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Parse recipe from URL
 * @param {string} url - Recipe URL to parse
 * @returns {Promise<Object>} Parsed recipe data
 */
async function parseRecipeFromUrl(url) {
    try {
        // Validate URL format
        if (!isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }

        // Fetch HTML content with timeout
        const html = await fetchUrl(url);

        // Try JSON-LD parsing first (most reliable)
        let recipeData = parseJsonLd(html);

        // Fall back to HTML parsing if JSON-LD not found
        if (!recipeData) {
            recipeData = parseHtml(html, url);
        }

        if (!recipeData || !recipeData.title) {
            throw new Error('Could not extract recipe data from this URL');
        }

        return recipeData;
    } catch (error) {
        console.error('Recipe parsing error:', error);
        throw error;
    }
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

/**
 * Fetch URL content with timeout
 */
async function fetchUrl(url) {
    try {
        const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RecipeApp/1.0; +http://example.com)'
            }
        });
        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - the website took too long to respond');
        }
        if (error.response) {
            throw new Error(`Failed to fetch URL: ${error.response.status} ${error.response.statusText}`);
        }
        throw new Error('Failed to fetch URL - please check the URL and try again');
    }
}

/**
 * Parse JSON-LD structured data
 */
function parseJsonLd(html) {
    const $ = cheerio.load(html);
    let recipeData = null;

    // Find all JSON-LD script tags
    $('script[type="application/ld+json"]').each((i, elem) => {
        try {
            const jsonContent = $(elem).html();
            const data = JSON.parse(jsonContent);

            // Handle both single objects and @graph arrays
            const recipes = extractRecipeFromJsonLd(data);
            if (recipes) {
                recipeData = recipes;
                return false; // Break the loop
            }
        } catch (e) {
            // Invalid JSON, skip this script tag
        }
    });

    return recipeData;
}

/**
 * Extract recipe from JSON-LD data structure
 */
function extractRecipeFromJsonLd(data) {
    let recipe = null;

    // Handle @graph structure
    if (data['@graph'] && Array.isArray(data['@graph'])) {
        recipe = data['@graph'].find(item => item['@type'] === 'Recipe');
    }
    // Handle array of items
    else if (Array.isArray(data)) {
        recipe = data.find(item => item['@type'] === 'Recipe');
    }
    // Handle direct Recipe object
    else if (data['@type'] === 'Recipe') {
        recipe = data;
    }

    if (!recipe) return null;


    return {
        title: recipe.name || '',
        description: recipe.description || '',
        category: mapCategory(recipe.recipeCategory),
        prepTime: parseTime(recipe.prepTime),
        cookTime: parseTime(recipe.cookTime),
        additionalTime: parseTime(recipe.totalTime) - parseTime(recipe.prepTime) - parseTime(recipe.cookTime),
        servings: parseServings(recipe.recipeYield),
        imageUrl: parseImage(recipe.image),
        sourceUrl: recipe.url || '',
        ingredients: parseIngredients(recipe.recipeIngredient),
        instructions: parseInstructions(recipe.recipeInstructions),
        tags: parseTags(recipe.keywords)
    };
}

/**
 * Map external category names to app categories
 * Maps common variations to standard names, preserves unknown categories
 */
function mapCategory(category) {
    if (!category) return 'Other';

    // Handle array format (some sites return arrays)
    let categoryStr = Array.isArray(category) ? category[0] : category;
    if (!categoryStr) return 'Other';

    // Normalize to lowercase for comparison
    const normalized = categoryStr.toString().toLowerCase().trim();

    // Map common variations to standard categories
    const categoryMap = {
        // Breakfast
        'breakfast': 'Breakfast',
        'brunch': 'Breakfast',

        // Lunch
        'lunch': 'Lunch',
        'luncheon': 'Lunch',

        // Dinner
        'dinner': 'Dinner',
        'mains': 'Main Course',
        'main': 'Main Course',
        'main course': 'Main Course',
        'main dish': 'Main Course',
        'entree': 'Main Course',
        'entrée': 'Main Course',
        'supper': 'Dinner',

        // Dessert
        'dessert': 'Dessert',
        'desserts': 'Dessert',
        'sweet': 'Dessert',
        'sweets': 'Dessert',
        'baking': 'Dessert',

        // Snack
        'snack': 'Snack',
        'snacks': 'Snack',

        // Appetizer
        'appetizer': 'Appetizer',
        'appetizers': 'Appetizer',
        'starter': 'Appetizer',
        'starters': 'Appetizer',
        'hors d\'oeuvre': 'Appetizer',
        'finger food': 'Appetizer',

        // Beverage
        'beverage': 'Beverage',
        'beverages': 'Beverage',
        'drink': 'Beverage',
        'drinks': 'Beverage',
        'cocktail': 'Beverage',
        'cocktails': 'Beverage',

        // Common recipe site categories (preserve as custom)
        'soup': 'Soups',
        'soups': 'Soups',
        'salad': 'Salads',
        'salads': 'Salads',
        'side': 'Sides',
        'sides': 'Sides',
        'side dish': 'Sides',
        'bread': 'Breads',
        'breads': 'Breads',
        'pasta': 'Pasta',
        'seafood': 'Seafood',
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan'
    };

    // Return mapped value OR original string converted to Title Case
    if (categoryMap[normalized]) {
        return categoryMap[normalized];
    }

    // Convert unknown category to Title Case for consistency
    return categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);
}

/**
 * Parse HTML using Cheerio (fallback method)
 */
function parseHtml(html, sourceUrl) {
    const $ = cheerio.load(html);

    // Try multiple common selectors for each field
    const title =
        $('h1[itemprop="name"]').first().text().trim() ||
        $('.recipe-title').first().text().trim() ||
        $('h1.recipe__title').first().text().trim() ||
        $('h1').first().text().trim() ||
        '';

    const description =
        $('[itemprop="description"]').first().text().trim() ||
        $('.recipe-description').first().text().trim() ||
        $('meta[name="description"]').attr('content') ||
        '';

    const imageUrl =
        $('[itemprop="image"]').first().attr('src') ||
        $('[itemprop="image"]').first().attr('content') ||
        $('.recipe-image img').first().attr('src') ||
        $('meta[property="og:image"]').attr('content') ||
        '';

    // Extract ingredients
    const ingredients = [];
    $('[itemprop="recipeIngredient"], .ingredient, #ingredients li, .recipe__ingredients li').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && text.length > 0) {
            ingredients.push(parseIngredientText(text));
        }
    });

    // Extract instructions
    const instructions = [];
    $('[itemprop="recipeInstructions"] li, .instruction, #instructions li, .recipe__steps li').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && text.length > 0) {
            instructions.push(text);
        }
    });

    // If no list items found, try for paragraphs or divs
    if (instructions.length === 0) {
        $('[itemprop="recipeInstructions"] p, [itemprop="recipeInstructions"] div').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.length > 0) {
                instructions.push(text);
            }
        });
    }

    return {
        title,
        description,
        category: 'Other',
        prepTime: 0,
        cookTime: 0,
        additionalTime: 0,
        servings: 0,
        imageUrl: imageUrl.startsWith('http') ? imageUrl : '',
        sourceUrl,
        ingredients,
        instructions,
        tags: []
    };
}

/**
 * Parse ISO 8601 duration to minutes (e.g., PT15M -> 15, PT1H30M -> 90)
 */
function parseTime(duration) {
    if (!duration || typeof duration !== 'string') return 0;

    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    return hours * 60 + minutes;
}

/**
 * Parse servings from various formats
 */
function parseServings(yield_) {
    if (!yield_) return 0;
    if (typeof yield_ === 'number') return yield_;

    // Extract number from string like "4 servings" or "Makes 6"
    const match = yield_.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

/**
 * Parse image from various formats
 */
function parseImage(image) {
    if (!image) return '';
    if (typeof image === 'string') return image;
    if (image.url) return image.url;
    if (Array.isArray(image) && image.length > 0) {
        return typeof image[0] === 'string' ? image[0] : image[0].url || '';
    }
    return '';
}

/**
 * Parse ingredients array
 */
function parseIngredients(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) return [];

    return ingredients.map(ing => {
        if (typeof ing === 'string') {
            return parseIngredientText(ing);
        }
        return { quantity: '', unit: '', name: ing.toString() };
    });
}

/**
 * Normalize unit names to match frontend dropdown options
 */
function normalizeUnit(unit) {
    if (!unit) return '';

    const normalized = unit.toLowerCase().trim();

    // Map common variations to standard abbreviations
    const unitMap = {
        // Volume/Liquid
        'cup': 'cups',
        'cups': 'cups',
        'tablespoon': 'tbsp',
        'tablespoons': 'tbsp',
        'teaspoon': 'tsp',
        'teaspoons': 'tsp',
        'fluid ounce': 'fl oz',
        'fluid ounces': 'fl oz',
        'milliliter': 'ml',
        'milliliters': 'ml',
        'millilitre': 'ml',
        'millilitres': 'ml',

        // Weight - Metric
        'gram': 'g',
        'grams': 'g',
        'kilogram': 'kg',
        'kilograms': 'kg',

        // Weight - Imperial
        'ounce': 'oz',
        'ounces': 'oz',
        'pound': 'lbs',
        'pounds': 'lbs',
        'lb': 'lbs'
    };

    return unitMap[normalized] || normalized;
}

/**
 * Parse individual ingredient text into quantity, unit, and name
 */
function parseIngredientText(text) {
    // Parse format: "QUANTITY UNIT INGREDIENT_NAME"
    // Examples: "2 cups flour", "1/2 teaspoon salt", "8 ounces sirloin steak"  
    // Note: Unit is limited to single word to avoid greedy matching
    // Multi-word units like "fluid ounces" should use abbreviation "fl oz" in source data
    const match = text.match(/^([\d\s\/\.]+?)\s+([a-zA-Z]+)\s+(.+)$/);

    if (match) {
        const rawUnit = match[2] ? match[2].trim() : '';
        return {
            quantity: match[1].trim(),
            unit: normalizeUnit(rawUnit),
            name: match[3].trim()
        };
    }

    // If no match, treat entire text as ingredient name
    return {
        quantity: '',
        unit: '',
        name: text
    };
}

/**
 * Parse instructions from various formats
 */
function parseInstructions(instructions) {
    if (!instructions) return [];
    if (typeof instructions === 'string') return [instructions];
    if (Array.isArray(instructions)) {
        return instructions.map((inst, index) => {
            if (typeof inst === 'string') return inst;
            if (inst.text) return inst.text;
            if (inst.itemListElement) {
                // Handle HowToSection with nested steps
                return inst.itemListElement.map(step => step.text || '').join(' ');
            }
            return '';
        }).filter(text => text.length > 0);
    }
    return [];
}

/**
 * Parse tags/keywords
 */
function parseTags(keywords) {
    if (!keywords) return [];
    if (typeof keywords === 'string') {
        return keywords.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    if (Array.isArray(keywords)) return keywords;
    return [];
}

module.exports = {
    parseRecipeFromUrl
};
