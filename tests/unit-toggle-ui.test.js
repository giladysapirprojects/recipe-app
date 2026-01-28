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
    getText,
    countElements
} = require('./utils');
const { By } = require('selenium-webdriver');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Unit Toggle UI Test Suite');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Segmented control exists in header', testToggleExists));
        results.push(await runTest('Metric button is active by default', testDefaultMetric));
        results.push(await runTest('Can toggle to Imperial', testToggleToImperial));
        results.push(await runTest('Preference persists after page reload', testPreferencePersistence));
        results.push(await runTest('Recipe units convert when toggle switches', testRecipeConversion));

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
 * Test: Segmented control toggle exists in header
 */
async function testToggleExists() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1500);

    const toggleContainer = await driver.findElements(By.css('.unit-toggle-container'));
    assert(toggleContainer.length > 0, 'Unit toggle container exists');

    const segmentedControl = await driver.findElements(By.css('.segmented-control'));
    assert(segmentedControl.length > 0, 'Segmented control exists');

    const metricBtn = await driver.findElements(By.id('metricBtn'));
    assert(metricBtn.length > 0, 'Metric button exists');

    const imperialBtn = await driver.findElements(By.id('imperialBtn'));
    assert(imperialBtn.length > 0, 'Imperial button exists');
}

/**
 * Test: Metric button is active by default
 */
async function testDefaultMetric() {
    // Clear localStorage first
    await driver.get(config.FRONTEND_URL);
    await driver.executeScript('localStorage.clear()');
    await driver.navigate().refresh();
    await sleep(1500);

    const metricBtn = await driver.findElement(By.id('metricBtn'));
    const metricClass = await metricBtn.getAttribute('class');
    assert(metricClass.includes('active'), 'Metric button has active class');

    const imperialBtn = await driver.findElement(By.id('imperialBtn'));
    const imperialClass = await imperialBtn.getAttribute('class');
    assert(!imperialClass.includes('active'), 'Imperial button does not have active class');
}

/**
 * Test: Can toggle to Imperial
 */
async function testToggleToImperial() {
    await driver.get(config.FRONTEND_URL);
    await driver.executeScript('localStorage.clear()');
    await driver.navigate().refresh();
    await sleep(1500);

    // Click Imperial button
    await clickElement(driver, '#imperialBtn');
    await sleep(500);

    const metricBtn = await driver.findElement(By.id('metricBtn'));
    const metricClass = await metricBtn.getAttribute('class');
    assert(!metricClass.includes('active'), 'Metric button no longer active');

    const imperialBtn = await driver.findElement(By.id('imperialBtn'));
    const imperialClass = await imperialBtn.getAttribute('class');
    assert(imperialClass.includes('active'), 'Imperial button is now active');

    // Check localStorage
    const storedPreference = await driver.executeScript('return localStorage.getItem("preferredUnitSystem")');
    assert(storedPreference === 'imperial', `LocalStorage is set to imperial (got: ${storedPreference})`);
}

/**
 * Test: Preference persists after page reload
 */
async function testPreferencePersistence() {
    // Set to imperial
    await driver.get(config.FRONTEND_URL);
    await driver.executeScript('localStorage.setItem("preferredUnitSystem", "imperial")');
    await driver.navigate().refresh();
    await sleep(1500);

    const imperialBtn = await driver.findElement(By.id('imperialBtn'));
    const imperialClass = await imperialBtn.getAttribute('class');
    assert(imperialClass.includes('active'), 'Imperial button is active after reload');

    const metricBtn = await driver.findElement(By.id('metricBtn'));
    const metricClass = await metricBtn.getAttribute('class');
    assert(!metricClass.includes('active'), 'Metric button is not active after reload');
}

/**
 * Test: Recipe units convert when toggle switches
 */
async function testRecipeConversion() {
    // Clear localStorage and start fresh
    await driver.get(config.FRONTEND_URL);
    await driver.executeScript('localStorage.clear()');
    await driver.navigate().refresh();
    await sleep(1500);

    // Find and click first recipe card
    const recipeCards = await driver.findElements(By.css('.recipe-card'));
    if (recipeCards.length === 0) {
        console.log('⚠️  No recipes found, skipping conversion test');
        return;
    }

    await recipeCards[0].click();
    await sleep(1000);

    // Get initial ingredient text (should be in metric)
    const modalBody = await driver.findElement(By.css('#recipeDetailModal .modal-body'));
    const initialHTML = await modalBody.getAttribute('innerHTML');

    // Check if we have ml units (metric)
    const hasMetricUnits = initialHTML.includes(' ml') || initialHTML.includes(' g');
    assert(hasMetricUnits, 'Recipe initially shows metric units');

    // Close modal
    await clickElement(driver, '#recipeDetailModal .modal-close');
    await sleep(500);

    // Switch to imperial
    await clickElement(driver, '#imperialBtn');
    await sleep(500);

    // Reopen recipe
    await recipeCards[0].click();
    await sleep(1000);

    // Get converted ingredient text (should be in imperial)
    const convertedHTML = await modalBody.getAttribute('innerHTML');

    // Check if we have imperial units
    const hasImperialUnits = convertedHTML.includes(' cups') || convertedHTML.includes(' tbsp') || convertedHTML.includes(' oz');
    assert(hasImperialUnits, 'Recipe now shows imperial units after toggle');

    // Clean up - close modal
    await clickElement(driver, '#recipeDetailModal .modal-close');
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
