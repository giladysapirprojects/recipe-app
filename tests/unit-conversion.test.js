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
    getText
} = require('./utils');
const { By } = require('selenium-webdriver');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Unit Conversion - Utility Tests');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Conversion functions exist', testConversionFunctionsExist));
        results.push(await runTest('Convert 2 cups to metric', testCupsToMetric));
        results.push(await runTest('Convert 1 tbsp to metric', testTbspToMetric));
        results.push(await runTest('Convert 1 tsp to metric', testTspToMetric));
        results.push(await runTest('Convert250g to imperial', testGramsToImperial));
        results.push(await runTest('Convert 500ml to imperial', testMlToImperial));
        results.push(await runTest('Handle un convertible units (unit)', testUnconvertibleUnit));
        results.push(await runTest('Handle non-numeric quantities', testNonNumericQuantity));
        results.push(await runTest('Handle fractional quantities', testFractionalQuantity));

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
 * Test: Conversion functions exist in utils.js
 */
async function testConversionFunctionsExist() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Execute JavaScript to check if functions exist
    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            resolve({
                hasConvertIngredient: typeof module.convertIngredient === 'function',
                hasConvertToMetric: typeof module.convertToMetric === 'function',
                hasGetUnitSystem: typeof module.getUnitSystem === 'function'
            });
        });
    `);

    assert(result.hasConvertIngredient, 'convertIngredient function exists');
    assert(result.hasConvertToMetric, 'convertToMetric function exists');
    assert(result.hasGetUnitSystem, 'getUnitSystem function exists');
}

/**
 * Test: Convert 2 cups to metric (should be 500ml)
 */
async function testCupsToMetric() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '2', unit: 'cups', name: 'flour' };
            const converted = module.convertIngredient(ingredient, 'metric');
            resolve(converted);
        });
    `);

    assert(result !== null, 'Conversion result is not null');
    assert(result.quantity === '500', `Quantity is 500 (got: ${result.quantity})`);
    assert(result.unit === 'ml', `Unit is ml (got: ${result.unit})`);
}

/**
 * Test: Convert 1 tbsp to metric (should be 15ml)
 */
async function testTbspToMetric() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '1', unit: 'tbsp', name: 'sugar' };
            const converted = module.convertIngredient(ingredient, 'metric');
            resolve(converted);
        });
    `);

    assert(result !== null, 'Conversion result is not null');
    assert(result.quantity === '15', `Quantity is 15 (got: ${result.quantity})`);
    assert(result.unit === 'ml', `Unit is ml (got: ${result.unit})`);
}

/**
 * Test: Convert 1 tsp to metric (should be 5ml)
 */
async function testTspToMetric() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '1', unit: 'tsp', name: 'vanilla' };
            const converted = module.convertIngredient(ingredient, 'metric');
            resolve(converted);
        });
    `);

    assert(result !== null, 'Conversion result is not null');
    assert(result.quantity === '5', `Quantity is 5 (got: ${result.quantity})`);
    assert(result.unit === 'ml', `Unit is ml (got: ${result.unit})`);
}

/**
 * Test: Convert 250g to imperial (should be ~9 oz)
 */
async function testGramsToImperial() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '250', unit: 'g', name: 'sugar' };
            const converted = module.convertIngredient(ingredient, 'imperial');
            resolve(converted);
        });
    `);

    assert(result !== null, 'Conversion result is not null');
    // 250g = 8.8 oz (roughly)
    const qty = parseFloat(result.quantity);
    assert(qty >= 8 && qty <= 9, `Quantity is approximately 8-9 oz (got: ${result.quantity})`);
    assert(result.unit === 'oz', `Unit is oz (got: ${result.unit})`);
}

/**
 * Test: Convert 500ml to imperial (should be 2 cups)
 */
async function testMlToImperial() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '500', unit: 'ml', name: 'water' };
            const converted = module.convertIngredient(ingredient, 'imperial');
            resolve(converted);
        });
    `);

    assert(result !== null, 'Conversion result is not null');
    assert(result.quantity === '2', `Quantity is 2 (got: ${result.quantity})`);
    assert(result.unit === 'cups', `Unit is cups (got: ${result.unit})`);
}

/**
 * Test: Handle unconvertible units (should return null)
 */
async function testUnconvertibleUnit() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '2', unit: 'unit', name: 'eggs' };
            const converted = module.convertIngredient(ingredient, 'metric');
            resolve(converted);
        });
    `);

    assert(result === null, 'Unconvertible unit returns null');
}

/**
 * Test: Handle non-numeric quantities
 */
async function testNonNumericQuantity() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: 'to taste', unit: 'cups', name: 'salt' };
            const converted = module.convertIngredient(ingredient, 'metric');
            resolve(converted);
        });
    `);

    assert(result === null, 'Non-numeric quantity returns null');
}

/**
 * Test: Handle fractional quantities (1/2)
 */
async function testFractionalQuantity() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    const result = await driver.executeScript(`
        return new Promise(async (resolve) => {
            const module = await import('./scripts/utils.js');
            const ingredient = { quantity: '1/2', unit: 'cups', name: 'milk' };
            const converted = module.convertIngredient(ingredient, 'metric');
            resolve(converted);
        });
    `);

    assert(result !== null, 'Fractional conversion result is not null');
    assert(result.quantity === '125', `Quantity is 125ml (got: ${result.quantity})`);
    assert(result.unit === 'ml', `Unit is ml (got: ${result.unit})`);
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
