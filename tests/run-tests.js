/**
 * Main Test Runner
 * Runs all test suites in sequence
 */

const crudTests = require('./recipe-crud.test');
const searchTests = require('./search-filter.test');
const validationTests = require('./form-validation.test');
const imageTests = require('./image-upload.test');

async function runAllTestSuites() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║                                           ║');
    console.log('║   Recipe App - Selenium Test Suite       ║');
    console.log('║                                           ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('\n');

    const startTime = Date.now();
    let allPassed = true;

    try {
        console.log('📋 Running all test suites...\n');

        // Run each test suite
        // Note: Each suite manages its own driver lifecycle
        await runSuite('CRUD Operations', crudTests.runAllTests);
        await runSuite('Search & Filter', searchTests.runAllTests);
        await runSuite('Form Validation', validationTests.runAllTests);
        await runSuite('Image Upload', imageTests.runAllTests);

    } catch (error) {
        console.error('\n❌ Test suite execution failed:', error);
        allPassed = false;
    }

    const duration = Date.now() - startTime;

    console.log('\n');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║                                           ║');
    console.log('║   All Test Suites Complete                ║');
    console.log('║                                           ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`\n⏱️  Total time: ${(duration / 1000).toFixed(2)}s\n`);

    process.exit(allPassed ? 0 : 1);
}

async function runSuite(name, testFunction) {
    console.log(`\n🎯 Starting: ${name}`);
    console.log('─'.repeat(45));

    try {
        await testFunction();
    } catch (error) {
        // Test suites handle their own errors and exit codes
        // We just log if there's an unexpected error
        if (error.code !== 0 && error.code !== 1) {
            console.error(`Unexpected error in ${name}:`, error);
        }
    }
}

// Run all tests
runAllTestSuites();
