const config = require('./config');
const {
    setupDriver,
    clickElement,
    typeText,
    takeScreenshot,
    sleep,
    getText,
    assert,
    runTest,
    isVisible,
    waitForVisible
} = require('./utils');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Recipe Import from URL Test Suite');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Import Recipe - Valid JSON-LD URL', testImportValidJsonLd));
        results.push(await runTest('Import Recipe - Invalid URL Format', testImportInvalidUrl));
        results.push(await runTest('Import Recipe - Unreachable URL', testImportUnreachableUrl));
        results.push(await runTest('Import Recipe - Form Population', testFormPopulation));
        results.push(await runTest('Import Recipe - Save Imported Recipe', testSaveImportedRecipe));

    } catch (error) {
        console.error('❌ Test suite error:', error);
        if (driver && config.SAVE_SCREENSHOTS_ON_FAILURE) {
            await takeScreenshot(driver, 'test-suite-error');
        }
    } finally {
        if (driver) {
            await driver.quit();
        }
    }

    // Print summary
    printSummary(results);

    // Exit with appropriate code
    const allPassed = results.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
}

/**
 * Test: Import Recipe from Valid JSON-LD URL
 */
async function testImportValidJsonLd() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Click "Import from URL" button
    await clickElement(driver, '#importRecipeBtn');
    await sleep(500);

    // Verify import modal is visible
    const modalVisible = await isVisible(driver, '#importUrlModal');
    assert(modalVisible, 'Import URL modal should be visible');

    // Enter a test recipe URL (using a reliable test URL from config)
    const testUrl = config.IMPORT_TEST_URLS.validJsonLd;
    await typeText(driver, '#recipeUrl', testUrl);

    // Click import button
    await clickElement(driver, '#importUrlBtn');
    await sleep(1000); // Wait for API call

    // Wait for loading state to appear
    let importStatus = await driver.findElement({ css: '#importStatus' });
    let hasLoadingClass = await importStatus.getAttribute('class');

    // The modal might close quickly if successful, so we need to check both scenarios
    await sleep(8000); // Wait for import to complete (can take several seconds)

    // Verify import modal closed (successful import closes the modal)
    const importModalHidden = !(await isVisible(driver, '#importUrlModal'));
    assert(importModalHidden, 'Import modal should close after successful import');

    // Verify recipe form modal opened
    const formModalVisible = await isVisible(driver, '#recipeFormModal');
    assert(formModalVisible, 'Recipe form modal should open after successful import');

    // Verify form title shows "Add New Recipe" (import always creates new)
    const formTitle = await getText(driver, '#formTitle');
    assert(formTitle === 'Add New Recipe', 'Form title should be "Add New Recipe"');
}

/**
 * Test: Import Recipe - Invalid URL Format
 */
async function testImportInvalidUrl() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open import modal
    await clickElement(driver, '#importRecipeBtn');
    await sleep(500);

    // Try with invalid URL (no protocol)
    await typeText(driver, '#recipeUrl', config.IMPORT_TEST_URLS.invalidFormat);
    await clickElement(driver, '#importUrlBtn');
    await sleep(500);

    // Verify error message appears
    const importStatus = await driver.findElement({ css: '#importStatus' });
    const statusClass = await importStatus.getAttribute('class');
    assert(statusClass.includes('status-error'), 'Should show error status for invalid URL');

    const statusText = await importStatus.getText();
    assert(statusText.includes('valid URL') || statusText.includes('http'), 'Error message should mention URL format');

    // Modal should still be open
    const modalVisible = await isVisible(driver, '#importUrlModal');
    assert(modalVisible, 'Import modal should remain open after error');
}

/**
 * Test: Import Recipe - Unreachable URL
 */
async function testImportUnreachableUrl() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open import modal
    await clickElement(driver, '#importRecipeBtn');
    await sleep(500);

    // Try with unreachable URL
    await typeText(driver, '#recipeUrl', config.IMPORT_TEST_URLS.unreachable);
    await clickElement(driver, '#importUrlBtn');

    // Wait for request to timeout/fail (should be quick for non-existent domain)
    await sleep(3000);

    // Verify error message appears
    const importStatus = await driver.findElement({ css: '#importStatus' });
    const statusClass = await importStatus.getAttribute('class');
    assert(statusClass.includes('status-error'), 'Should show error status for unreachable URL');

    const statusText = await importStatus.getText();
    assert(
        statusText.toLowerCase().includes('fail') ||
        statusText.toLowerCase().includes('error'),
        'Error message should indicate failure'
    );
}

/**
 * Test: Form Population After Import
 */
async function testFormPopulation() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Import a recipe
    await clickElement(driver, '#importRecipeBtn');
    await sleep(500);

    const testUrl = config.IMPORT_TEST_URLS.validJsonLd;
    await typeText(driver, '#recipeUrl', testUrl);
    await clickElement(driver, '#importUrlBtn');
    await sleep(8000); // Wait for import

    // Verify form fields are populated
    const titleValue = await driver.findElement({ css: '#recipeTitle' }).getAttribute('value');
    assert(titleValue.length > 0, 'Recipe title should be populated');

    const categoryValue = await driver.findElement({ css: '#recipeCategory' }).getAttribute('value');
    console.log(`  ℹ️  Category value: "${categoryValue}"`);
    // Category should be populated (even if it's the default 'Other')
    // Some recipe sites don't provide category, so we accept 'Other' as valid
    assert(
        categoryValue && categoryValue.trim() !== '',
        `Recipe category should be populated (got: "${categoryValue}")`
    );

    // Check ingredients were added
    const ingredientRows = await driver.findElements({ css: '.ingredient-row' });
    assert(ingredientRows.length > 0, 'Should have at least one ingredient row');

    // Check if ingredients have data (check first row)
    const firstIngredientName = await ingredientRows[0].findElement({ css: '.ingredient-name' }).getAttribute('value');
    assert(firstIngredientName.length > 0, 'First ingredient should have a name');

    // Check instructions were added
    const instructionRows = await driver.findElements({ css: '.instruction-row' });
    assert(instructionRows.length > 0, 'Should have at least one instruction row');

    const firstInstructionText = await instructionRows[0].findElement({ css: 'textarea' }).getAttribute('value');
    assert(firstInstructionText.length > 0, 'First instruction should have text');

    // Verify source URL was populated
    const sourceUrlValue = await driver.findElement({ css: '#recipeSourceUrl' }).getAttribute('value');
    assert(sourceUrlValue === testUrl, `Source URL should be ${testUrl}`);
}

/**
 * Test: Save Imported Recipe
 */
async function testSaveImportedRecipe() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Get initial recipe count
    const initialCount = await driver.findElements({ css: '.recipe-card' }).then(cards => cards.length);

    // Import a recipe
    await clickElement(driver, '#importRecipeBtn');
    await sleep(500);

    const testUrl = config.IMPORT_TEST_URLS.validJsonLd;
    await typeText(driver, '#recipeUrl', testUrl);
    await clickElement(driver, '#importUrlBtn');
    await sleep(8000); // Wait for import

    // Modify the title to make it unique
    const titleInput = await driver.findElement({ css: '#recipeTitle' });
    const originalTitle = await titleInput.getAttribute('value');
    const uniqueTitle = originalTitle + ' - IMPORTED TEST';
    await titleInput.clear();
    await titleInput.sendKeys(uniqueTitle);

    // Submit the form
    await clickElement(driver, 'button[type="submit"][form="recipeForm"]');

    // Wait a moment to see if validation alert appears
    await sleep(1000);

    // Check if an alert is present (validation error)
    try {
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        console.log(`  ⚠️  Validation alert: ${alertText}`);
        await alert.accept();
        // If there was a validation error, the test should fail
        assert(false, `Form validation failed: ${alertText}`);
    } catch (e) {
        // No alert = good, form submitted successfully
    }

    await sleep(2000); // Wait for save to complete

    // Verify modal closed
    const modalHidden = !(await isVisible(driver, '#recipeFormModal'));
    assert(modalHidden, 'Recipe form modal should close after saving');

    // Verify recipe was added to grid
    const newCount = await driver.findElements({ css: '.recipe-card' }).then(cards => cards.length);
    assert(newCount === initialCount + 1, `Recipe count should increase by 1 (was ${initialCount}, now ${newCount})`);

    // Find and verify the imported recipe card
    const recipeCards = await driver.findElements({ css: '.recipe-card' });
    let foundImported = false;

    for (const card of recipeCards) {
        const titleElement = await card.findElement({ css: '.recipe-card-title' });
        const title = await titleElement.getText();
        if (title === uniqueTitle) {
            foundImported = true;

            // Click to view details
            await card.click();
            await sleep(1000);

            // Verify detail modal shows source URL
            const detailModal = await driver.findElement({ css: '#recipeDetailModal' });
            const modalBody = await detailModal.findElement({ css: '.modal-body' });
            const bodyText = await modalBody.getText();

            // Should contain the source URL somewhere in the detail view
            assert(
                bodyText.includes('altonbrown.com') || bodyText.includes(testUrl),
                'Recipe details should include source URL'
            );

            // Close detail modal
            await clickElement(driver, '#recipeDetailModal .modal-close');
            await sleep(500);

            break;
        }
    }

    assert(foundImported, `Should find imported recipe with title "${uniqueTitle}"`);
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
