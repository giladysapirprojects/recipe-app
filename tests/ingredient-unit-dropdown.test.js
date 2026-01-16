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
    countElements,
    getText
} = require('./utils');
const { By } = require('selenium-webdriver');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Ingredient Unit Dropdown Test Suite');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Unit field is a dropdown (not text input)', testUnitIsDropdown));
        results.push(await runTest('Default unit value is "unit"', testDefaultUnitValue));
        results.push(await runTest('All unit options are present', testAllUnitOptions));
        results.push(await runTest('Unit optgroups are organized correctly', testOptgroupStructure));
        results.push(await runTest('Can select different units', testSelectDifferentUnits));
        results.push(await runTest('Units persist when saving recipe', testUnitPersistence));
        results.push(await runTest('Units pre-selected when editing recipe', testUnitPreselection));

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
 * Test: Unit field is a dropdown (not text input)
 */
async function testUnitIsDropdown() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Add an ingredient field
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    // Find the unit field
    const unitFields = await driver.findElements(By.css('.ingredient-unit'));
    assert(unitFields.length > 0, 'At least one ingredient unit field exists');

    // Check that it's a select element
    const unitField = unitFields[0];
    const tagName = await unitField.getTagName();
    assert(tagName === 'select', `Unit field is a <select> element (found: ${tagName})`);

    // Verify it's required
    const isRequired = await unitField.getAttribute('required');
    assert(isRequired !== null, 'Unit field has required attribute');

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Default unit value is "unit"
 */
async function testDefaultUnitValue() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Add first ingredient field
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    // Check first ingredient's unit default value
    const unitFields = await driver.findElements(By.css('.ingredient-unit'));
    const firstUnitValue = await unitFields[0].getAttribute('value');
    assert(firstUnitValue === 'unit', `First ingredient defaults to "unit" (found: "${firstUnitValue}")`);

    // Add second ingredient field
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    // Check second ingredient's unit default value
    const allUnitFields = await driver.findElements(By.css('.ingredient-unit'));
    const secondUnitValue = await allUnitFields[1].getAttribute('value');
    assert(secondUnitValue === 'unit', `Second ingredient also defaults to "unit" (found: "${secondUnitValue}")`);

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: All unit options are present
 */
async function testAllUnitOptions() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Add an ingredient field
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    // Get all options from the first unit dropdown
    const unitField = await driver.findElement(By.css('.ingredient-unit'));
    const options = await unitField.findElements(By.css('option'));

    // Expected units
    const expectedUnits = ['cups', 'tbsp', 'tsp', 'fl oz', 'ml', 'g', 'kg', 'oz', 'lbs', 'unit'];

    // Get all option values
    const optionValues = [];
    for (const option of options) {
        const value = await option.getAttribute('value');
        if (value) { // Skip empty values if any
            optionValues.push(value);
        }
    }

    assert(optionValues.length === expectedUnits.length,
        `Has ${expectedUnits.length} unit options (found: ${optionValues.length})`);

    // Check each expected unit is present
    for (const unit of expectedUnits) {
        assert(optionValues.includes(unit), `Unit "${unit}" is available`);
    }

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Unit optgroups are organized correctly
 */
async function testOptgroupStructure() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Add an ingredient field
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    // Get unit dropdown
    const unitField = await driver.findElement(By.css('.ingredient-unit'));

    // Get all optgroups
    const optgroups = await unitField.findElements(By.css('optgroup'));
    assert(optgroups.length === 4, `Has 4 optgroups (found: ${optgroups.length})`);

    // Verify optgroup labels
    const expectedLabels = ['Volume/Liquid', 'Weight - Metric', 'Weight - Imperial', 'Count'];
    for (let i = 0; i < optgroups.length; i++) {
        const label = await optgroups[i].getAttribute('label');
        assert(label === expectedLabels[i],
            `Optgroup ${i + 1} is labeled "${expectedLabels[i]}" (found: "${label}")`);
    }

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Can select different units
 */
async function testSelectDifferentUnits() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Add three ingredient fields
    await clickElement(driver, '#addIngredientBtn');
    await sleep(200);
    await clickElement(driver, '#addIngredientBtn');
    await sleep(200);
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    const unitFields = await driver.findElements(By.css('.ingredient-unit'));
    assert(unitFields.length >= 3, 'Has at least 3 ingredient fields');

    // Select different units for each using direct sendKeys on the element
    await unitFields[0].sendKeys('cups');
    await sleep(200);
    await unitFields[1].sendKeys('g');
    await sleep(200);

    // Verify selections
    const allUnitFields = await driver.findElements(By.css('.ingredient-unit'));
    const unit1 = await allUnitFields[0].getAttribute('value');
    const unit2 = await allUnitFields[1].getAttribute('value');
    const unit3 = await allUnitFields[2].getAttribute('value');

    assert(unit1 === 'cups', `First unit is "cups" (found: "${unit1}")`);
    assert(unit2 === 'g', `Second unit is "g" (found: "${unit2}")`);
    assert(unit3 === 'unit', `Third unit remains "unit" (found: "${unit3}")`);

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Units persist when saving recipe
 */
async function testUnitPersistence() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Fill in recipe details
    const timestamp = Date.now();
    await typeText(driver, '#recipeTitle', `Unit Test Recipe ${timestamp}`);
    await selectOption(driver, '#recipeCategory', 'Dinner');

    // Add ingredients with different units
    await clickElement(driver, '#addIngredientBtn');
    await sleep(200);

    let quantityInputs = await driver.findElements(By.css('.ingredient-quantity'));
    let nameInputs = await driver.findElements(By.css('.ingredient-name'));
    let unitSelects = await driver.findElements(By.css('.ingredient-unit'));

    // Check if elements exist before accessing
    if (quantityInputs.length > 0 && nameInputs.length > 0 && unitSelects.length > 0) {
        // Ingredient 1: 2 cups flour
        await quantityInputs[0].clear();
        await quantityInputs[0].sendKeys('2');
        await unitSelects[0].sendKeys('cups');
        await nameInputs[0].sendKeys('flour');
    }

    // Add another ingredient
    await clickElement(driver, '#addIngredientBtn');
    await sleep(300);

    // Re-fetch elements after adding new ingredient
    const allQuantityInputs = await driver.findElements(By.css('.ingredient-quantity'));
    const allNameInputs = await driver.findElements(By.css('.ingredient-name'));
    const allUnitSelects = await driver.findElements(By.css('.ingredient-unit'));

    // Ingredient 2: 250 g sugar
    if (allQuantityInputs.length > 1 && allNameInputs.length > 1 && allUnitSelects.length > 1) {
        await allQuantityInputs[1].clear();
        await allQuantityInputs[1].sendKeys('250');
        await allUnitSelects[1].sendKeys('g');
        await allNameInputs[1].sendKeys('sugar');
    }

    // Add instruction
    await clickElement(driver, '#addInstructionBtn');
    await sleep(200);
    const instructionInputs = await driver.findElements(By.css('.instruction-input'));
    await instructionInputs[0].sendKeys('Mix ingredients together');

    // Save recipe
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');
    await sleep(2000);

    // Find and open the recipe we just created
    const recipeCards = await driver.findElements(By.css('.recipe-card'));
    assert(recipeCards.length > 0, 'Recipe was created');

    // Click the first card (should be our new recipe)
    await recipeCards[0].click();
    await sleep(1000);

    // Verify ingredients display with correct units
    const modalBody = await driver.findElement(By.css('#recipeDetailModal .modal-body'));
    const bodyText = await modalBody.getText();

    assert(bodyText.includes('2 cups flour') || bodyText.includes('2cups flour'),
        'Recipe displays "2 cups flour"');
    assert(bodyText.includes('250 g sugar') || bodyText.includes('250g sugar'),
        'Recipe displays "250 g sugar"');

    // Close modal and delete recipe
    await clickElement(driver, '#recipeDetailModal .modal-close');
    await sleep(500);
}

/**
 * Test: Units are pre-selected when editing recipe
 */
async function testUnitPreselection() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Create a recipe with specific units
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    const timestamp = Date.now();
    await typeText(driver, '#recipeTitle', `Edit Test Recipe ${timestamp}`);
    await selectOption(driver, '#recipeCategory', 'Dessert');

    // Add ingredient: 3 tbsp butter
    await clickElement(driver, '#addIngredientBtn');
    await sleep(200);

    let quantityInputs = await driver.findElements(By.css('.ingredient-quantity'));
    let nameInputs = await driver.findElements(By.css('.ingredient-name'));
    let unitSelects = await driver.findElements(By.css('.ingredient-unit'));

    if (quantityInputs.length > 0 && nameInputs.length > 0 && unitSelects.length > 0) {
        await quantityInputs[0].clear();
        await quantityInputs[0].sendKeys('3');
        await unitSelects[0].sendKeys('tbsp');
        await nameInputs[0].sendKeys('butter');
    }

    // Add instruction
    await clickElement(driver, '#addInstructionBtn');
    await sleep(200);
    const instructionInputs = await driver.findElements(By.css('.instruction-input'));
    await instructionInputs[0].sendKeys('Melt butter');

    // Save recipe
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');
    await sleep(2000);

    // Open the recipe detail
    const recipeCards = await driver.findElements(By.css('.recipe-card'));
    await recipeCards[0].click();
    await sleep(1000);

    // Click edit button
    const editBtn = await driver.findElement(By.css('button[onclick*="showEditRecipeForm"]'));
    await editBtn.click();
    await sleep(1000);

    // Verify the unit dropdown has "tbsp" selected
    const editUnitSelects = await driver.findElements(By.css('.ingredient-unit'));
    const selectedUnit = await editUnitSelects[0].getAttribute('value');
    assert(selectedUnit === 'tbsp',
        `Unit dropdown pre-selected to "tbsp" when editing (found: "${selectedUnit}")`);

    // Close modals
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
