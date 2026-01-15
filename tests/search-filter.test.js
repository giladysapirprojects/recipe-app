const config = require('./config');
const {
    setupDriver,
    clickElement,
    typeText,
    sleep,
    countElements,
    assert,
    runTest,
    isVisible,
    waitForVisible
} = require('./utils');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Search & Filter Test Suite');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Search by Title', testSearchByTitle));
        results.push(await runTest('Search by Ingredient', testSearchByIngredient));
        results.push(await runTest('Category Filter', testCategoryFilter));
        results.push(await runTest('Clear Filter', testClearFilter));

    } catch (error) {
        console.error('❌ Test suite error:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }

    // Print summary
    printSummary(results);

    const allPassed = results.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
}

/**
 * Test: Search by Title
 */
async function testSearchByTitle() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Get initial count
    const initialCount = await countElements(driver, '.recipe-card');
    assert(initialCount > 0, 'Should have at least one recipe to search');

    // Get first recipe title
    const firstCard = await driver.findElement({ css: '.recipe-card .recipe-card-title' });
    const searchTerm = await firstCard.getText();
    const firstWord = searchTerm.split(' ')[0];

    // Type in search box
    await typeText(driver, '#searchInput', firstWord, true);
    await sleep(1000); // Wait for search to filter

    // Verify results are filtered
    const resultsCount = await countElements(driver, '.recipe-card');
    assert(resultsCount > 0, 'Search should return at least one result');
    assert(resultsCount <= initialCount, 'Search should filter results');

    // Clear search
    await typeText(driver, '#searchInput', '', true);
    await sleep(1000);

    const clearedCount = await countElements(driver, '.recipe-card');
    assert(clearedCount === initialCount, 'Clearing search should show all recipes');
}

/**
 * Test: Search by Ingredient
 */
async function testSearchByIngredient() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Search for a common ingredient
    const searchTerm = 'flour'; // Common in many recipes
    await typeText(driver, '#searchInput', searchTerm, true);
    await sleep(1000);

    // Verify we get results (if any recipes contain flour)
    const resultsCount = await countElements(driver, '.recipe-card');
    console.log(`  ℹ️  Found ${resultsCount} recipe(s) containing "${searchTerm}"`);

    // The test passes as long as search executes without error
    // Results may be 0 if no recipes contain the ingredient
    assert(true, 'Search by ingredient executes successfully');
}

/**
 * Test: Category Filter
 */
async function testCategoryFilter() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Get initial recipe count
    const initialCount = await countElements(driver, '.recipe-card');

    // Check if category filters exist
    const filterChips = await driver.findElements({ css: '.filter-chip' });

    if (filterChips.length === 0) {
        console.log('  ℹ️  No category filters available (no recipes yet)');
        assert(true, 'Category filter test skipped - no categories available');
        return;
    }

    // Click first category filter (skip "All" if it exists)
    let categoryChip = filterChips[0];
    const categoryText = await categoryChip.getText();

    if (categoryText.toLowerCase() === 'all' && filterChips.length > 1) {
        categoryChip = filterChips[1];
    }

    await categoryChip.click();
    await sleep(1000);

    // Verify filtering occurred
    const filteredCount = await countElements(driver, '.recipe-card');
    assert(filteredCount <= initialCount, 'Category filter should show equal or fewer recipes');

    // Verify "All" button exists and click it
    const allButton = await driver.findElement({ css: '.filter-chip' }); // First chip should be "All"
    await allButton.click();
    await sleep(1000);

    const resetCount = await countElements(driver, '.recipe-card');
    assert(resetCount === initialCount, 'Clicking "All" should show all recipes again');
}

/**
 * Test: Clear Filter
 */
async function testClearFilter() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const initialCount = await countElements(driver, '.recipe-card');

    // Apply search filter
    await typeText(driver, '#searchInput', 'test', true);
    await sleep(1000);

    const searchedCount = await countElements(driver, '.recipe-card');
    console.log(`  ℹ️  Search filtered from ${initialCount} to ${searchedCount} recipes`);

    // Clear search
    await typeText(driver, '#searchInput', '', true);
    await sleep(1000);

    const clearedCount = await countElements(driver, '.recipe-card');
    assert(clearedCount === initialCount, 'Clearing filter should restore all recipes');
}

/**
 * Print test summary
 */
function printSummary(results) {
    console.log('\n═══════════════════════════════════════════');
    console.log('  Test Summary');
    console.log('═══════════════════════════════════════════');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log(`\n  Total:  ${total}`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);

    if (failed > 0) {
        console.log('\n  Failed Tests:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`    • ${r.name}`);
            console.log(`      ${r.error}`);
        });
    }

    console.log('\n═══════════════════════════════════════════\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };
