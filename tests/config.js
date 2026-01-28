// Test Configuration
module.exports = {
    // URLs
    FRONTEND_URL: 'http://localhost:8000',
    BACKEND_URL: 'http://localhost:3000',

    // Browser Settings
    BROWSER: 'chrome',
    HEADLESS: process.env.HEADLESS !== 'false', // Default to headless

    // Timeouts (milliseconds)
    DEFAULT_TIMEOUT: 10000,
    LONG_TIMEOUT: 30000,
    IMPLICIT_WAIT: 5000,

    // Test Data
    TEST_RECIPE: {
        title: 'Automated Test Recipe',
        description: 'A recipe created by automated tests',
        category: 'Dessert',
        tags: 'test, automated, selenium',
        prepTime: '15',
        cookTime: '30',
        additionalTime: '10',
        servings: '4',
        ingredients: [
            '2 cups flour',
            '1 cup sugar',
            '1/2 cup butter'
        ],
        instructions: [
            'Mix dry ingredients',
            'Add wet ingredients',
            'Bake at 350°F for 30 minutes'
        ]
    },

    // Import Test URLs
    IMPORT_TEST_URLS: {
        // Reliable URL with JSON-LD structured data
        validJsonLd: 'https://altonbrown.com/recipes/best-burger-ever/',
        // Invalid format (no protocol)
        invalidFormat: 'not-a-valid-url-format',
        // Unreachable domain
        unreachable: 'https://this-domain-definitely-does-not-exist-12345.com/recipe'
    },

    // Screenshot settings
    SCREENSHOT_DIR: './screenshots',
    SAVE_SCREENSHOTS_ON_FAILURE: true,

    // Database
    CLEAR_DB_BEFORE_TESTS: false // Set to true if you want to reset DB
};
