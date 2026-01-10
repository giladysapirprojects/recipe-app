/**
 * Database Migration Script
 * Initializes database schema and optionally seeds with sample data
 */

const fs = require('fs');
const path = require('path');
const db = require('./connection');

console.log('🔄 Running database migration...\n');

// Read schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Run migration
(async function migrate() {
    try {
        // Execute schema (creates tables and indexes)
        await db.execAsync(schema);
        console.log('✅ Database schema created successfully');

        // Check if we should seed sample data
        const shouldSeed = process.argv.includes('--seed');

        if (shouldSeed) {
            await seedSampleData();
        }

        // Display table information
        const tables = await db.allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);

        console.log('\n📊 Database tables:');
        tables.forEach(table => {
            console.log(`  - ${table.name}`);
        });

        console.log('\n✨ Migration completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
})();

/**
 * Seed database with sample recipes
 */
async function seedSampleData() {
    console.log('\n🌱 Seeding sample data...');

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
            ]
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
            ]
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
            ]
        }
    ];

    // Insert sample recipes (using async API)
    for (const recipe of sampleRecipes) {
        const now = new Date().toISOString();

        // Insert recipe
        await db.runAsync(`
      INSERT INTO recipes (id, title, description, category, prep_time, cook_time, servings, image_url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, '', '', ?, ?)
    `, [recipe.id, recipe.title, recipe.description, recipe.category, recipe.prepTime, recipe.cookTime, recipe.servings, now, now]);

        // Insert ingredients
        for (let i = 0; i < recipe.ingredients.length; i++) {
            const ing = recipe.ingredients[i];
            await db.runAsync(`
        INSERT INTO ingredients (recipe_id, quantity, unit, name, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, [recipe.id, ing.quantity, ing.unit, ing.name, i]);
        }

        // Insert instructions
        for (let i = 0; i < recipe.instructions.length; i++) {
            await db.runAsync(`
        INSERT INTO instructions (recipe_id, step_number, instruction)
        VALUES (?, ?, ?)
      `, [recipe.id, i + 1, recipe.instructions[i]]);
        }

        // Insert tags
        for (const tag of recipe.tags) {
            await db.runAsync('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tag]);
            await db.runAsync(`
        INSERT INTO recipe_tags (recipe_id, tag_id)
        SELECT ?, id FROM tags WHERE name = ?
      `, [recipe.id, tag]);
        }
    }

    console.log(`✅ Seeded ${sampleRecipes.length} sample recipes`);
}
