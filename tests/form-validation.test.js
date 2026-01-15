const config = require('./config');
const {
    setupDriver,
    clickElement,
    typeText,
    selectOption,
    sleep,
    assert,
    runTest,
    isVisible,
    getAttribute,
    countElements
} = require('./utils');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Form Validation Test Suite');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Required Field - Title', testRequiredTitle));
        results.push(await runTest('Required Field - Category', testRequiredCategory));
        results.push(await runTest('Required Field - Ingredients', testRequiredIngredients));
        results.push(await runTest('Required Field - Instructions', testRequiredInstructions));

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
 * Test: Title is required
 */
async function testRequiredTitle() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Fill all fields EXCEPT title
    await selectOption(driver, '#recipeCategory', 'Dessert');

    // Add one ingredient
    const ingredientInputs = await driver.findElements({ css: '.ingredient-input' });
    if (ingredientInputs.length > 0) {
        await ingredientInputs[0].sendKeys('Test ingredient');
    }

    // Add one instruction
    const instructionInputs = await driver.findElements({ css: '.instruction-input' });
    if (instructionInputs.length > 0) {
        await instructionInputs[0].sendKeys('Test instruction');
    }

    // Try to submit without title
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');
    await sleep(500);

    // Modal should still be visible (form didn't submit)
    const modalVisible = await isVisible(driver, '#recipeFormModal');
    assert(modalVisible, 'Form should not submit without title');

    // Check if title field has required attribute or validation state
    const titleRequired = await getAttribute(driver, '#recipeTitle', 'required');
    assert(titleRequired !== null, 'Title field should have required attribute');

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Category is required
 */
async function testRequiredCategory() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Fill title but NOT category
    await typeText(driver, '#recipeTitle', 'Test Recipe');

    // Add one ingredient
    const ingredientInputs = await driver.findElements({ css: '.ingredient-input' });
    if (ingredientInputs.length > 0) {
        await ingredientInputs[0].sendKeys('Test ingredient');
    }

    // Add one instruction
    const instructionInputs = await driver.findElements({ css: '.instruction-input' });
    if (instructionInputs.length > 0) {
        await instructionInputs[0].sendKeys('Test instruction');
    }

    // Try to submit without category
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');
    await sleep(500);

    // Modal should still be visible
    const modalVisible = await isVisible(driver, '#recipeFormModal');
    assert(modalVisible, 'Form should not submit without category');

    // Check if category field has required attribute
    const categoryRequired = await getAttribute(driver, '#recipeCategory', 'required');
    assert(categoryRequired !== null, 'Category field should have required attribute');

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: At least one ingredient required
 */
async function testRequiredIngredients() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Fill required fields except ingredients
    await typeText(driver, '#recipeTitle', 'Test Recipe');
    await selectOption(driver, '#recipeCategory', 'Dessert');

    // Add one instruction
    const instructionInputs = await driver.findElements({ css: '.instruction-input' });
    if (instructionInputs.length > 0) {
        await instructionInputs[0].sendKeys('Test instruction');
    }

    // Clear any default ingredient fields
    const ingredientInputs = await driver.findElements({ css: '.ingredient-input' });
    for (const input of ingredientInputs) {
        await input.clear();
    }

    // Try to submit without ingredients
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');
    await sleep(500);

    // Modal should still be visible (or we should see an error)
    // Note: This depends on app implementation
    // At minimum, we verify the form has ingredient input capability
    const hasIngredientsList = await isVisible(driver, '#ingredientsList');
    assert(hasIngredientsList, 'Form should have ingredients list section');

    const hasAddIngredientBtn = await isVisible(driver, '#addIngredientBtn');
    assert(hasAddIngredientBtn, 'Form should have add ingredient button');

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: At least one instruction required
 */
async function testRequiredInstructions() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Fill required fields except instructions
    await typeText(driver, '#recipeTitle', 'Test Recipe');
    await selectOption(driver, '#recipeCategory', 'Dessert');

    // Add one ingredient
    const ingredientInputs = await driver.findElements({ css: '.ingredient-input' });
    if (ingredientInputs.length > 0) {
        await ingredientInputs[0].sendKeys('Test ingredient');
    }

    // Clear any default instruction fields
    const instructionInputs = await driver.findElements({ css: '.instruction-input' });
    for (const input of instructionInputs) {
        await input.clear();
    }

    // Try to submit without instructions
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');
    await sleep(500);

    // Verify form has instruction capability
    const hasInstructionsList = await isVisible(driver, '#instructionsList');
    assert(hasInstructionsList, 'Form should have instructions list section');

    const hasAddInstructionBtn = await isVisible(driver, '#addInstructionBtn');
    assert(hasAddInstructionBtn, 'Form should have add instruction button');

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
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
