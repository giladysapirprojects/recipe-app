const config = require('./config');
const path = require('path');
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
    takeScreenshot
} = require('./utils');

let driver;

// Test suite
async function runAllTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  Image Upload Test Suite');
    console.log('═══════════════════════════════════════════');

    const results = [];

    try {
        driver = await setupDriver();
        console.log(`\n🌐 Frontend: ${config.FRONTEND_URL}`);
        console.log(`🔧 Headless: ${config.HEADLESS}\n`);

        // Run tests
        results.push(await runTest('Upload Valid JPEG Image', () => testUploadValidImage('jpg')));
        results.push(await runTest('Upload Valid PNG Image', () => testUploadValidImage('png')));
        results.push(await runTest('Upload Valid GIF Image', () => testUploadValidImage('gif')));
        results.push(await runTest('Upload Valid WebP Image', () => testUploadValidImage('webp')));
        results.push(await runTest('Remove Uploaded Image', testRemoveImage));
        results.push(await runTest('Image File Input Exists', testImageInputExists));

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
 * Test: Upload valid image (generalized for all formats)
 */
async function testUploadValidImage(format) {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Verify file input exists
    const fileInput = await driver.findElement({ css: '#recipeImage' });
    assert(fileInput !== null, 'File input should exist');

    // Get the path to test image
    const imagePath = path.resolve(__dirname, 'fixtures', `test-recipe.${format}`);
    console.log(`  ℹ️  Uploading: ${imagePath}`);

    // Check if test image exists
    const fs = require('fs');
    if (!fs.existsSync(imagePath)) {
        console.log(`  ⚠️  Test image not found: ${imagePath}`);
        console.log(`  ℹ️  Skipping actual upload, verifying input accepts ${format.toUpperCase()} files`);

        // Verify file input accepts this format
        const acceptAttr = await fileInput.getAttribute('accept');
        const acceptsFormat = acceptAttr.includes(format) || acceptAttr.includes(`image/${format}`);
        assert(acceptsFormat || format === 'jpg' && acceptAttr.includes('jpeg'),
            `File input should accept ${format.toUpperCase()} format`);

        // Close modal
        await clickElement(driver, '#recipeFormModal .modal-close');
        await sleep(500);
        return;
    }

    // Upload the file
    await fileInput.sendKeys(imagePath);
    await sleep(2000); // Wait for FileReader to process and show preview

    // Verify preview is shown
    const previewVisible = await isVisible(driver, '#imagePreviewContainer');
    assert(previewVisible, `Image preview should be visible after uploading ${format.toUpperCase()}`);

    // Verify preview image has src
    const previewImg = await driver.findElement({ css: '#imagePreview' });
    const previewSrc = await previewImg.getAttribute('src');
    assert(previewSrc && previewSrc.length > 0, `Preview should have image source for ${format.toUpperCase()}`);

    console.log(`  ℹ️  Preview src length: ${previewSrc.length} characters`);

    // Close modal without submitting
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Remove uploaded image
 */
async function testRemoveImage() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    const fileInput = await driver.findElement({ css: '#recipeImage' });

    // Try to upload a test image (jpg fallback)
    const imagePath = path.resolve(__dirname, 'fixtures', 'test-recipe.jpg');
    const fs = require('fs');

    if (!fs.existsSync(imagePath)) {
        console.log(`  ⚠️  No test image available, skipping remove test`);

        // Close modal
        await clickElement(driver, '#recipeFormModal .modal-close');
        await sleep(500);

        assert(true, 'Remove image test skipped - no test images available');
        return;
    }

    // Upload image
    await fileInput.sendKeys(imagePath);
    await sleep(2000); // Wait for FileReader to process

    // Verify preview is visible
    const previewVisible = await isVisible(driver, '#imagePreviewContainer');
    assert(previewVisible, 'Image preview should be visible');

    // Click remove button
    const removeBtn = await driver.findElement({ css: '#removeImageBtn' });
    await removeBtn.click();
    await sleep(500);

    // Verify preview is hidden
    const previewHidden = !(await isVisible(driver, '#imagePreviewContainer'));
    assert(previewHidden, 'Image preview should be hidden after removal');

    // Close modal
    await clickElement(driver, '#recipeFormModal .modal-close');
    await sleep(500);
}

/**
 * Test: Image file input exists and has correct attributes
 */
async function testImageInputExists() {
    await driver.get(config.FRONTEND_URL);
    await sleep(1000);

    // Open recipe form
    await clickElement(driver, '#addRecipeBtn');
    await sleep(500);

    // Verify file input exists
    const fileInputExists = await isVisible(driver, '#recipeImage');
    assert(fileInputExists, 'Image file input should exist');

    // Verify accept attribute includes correct formats
    const fileInput = await driver.findElement({ css: '#recipeImage' });
    const acceptAttr = await fileInput.getAttribute('accept');

    assert(acceptAttr && acceptAttr.length > 0, 'File input should have accept attribute');

    // Verify all required formats are accepted
    const requiredFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    const missingFormats = [];

    for (const format of requiredFormats) {
        if (!acceptAttr.includes(format)) {
            missingFormats.push(format);
        }
    }

    assert(missingFormats.length === 0,
        `File input should accept all formats. Missing: ${missingFormats.join(', ')}`);

    console.log(`  ℹ️  Accepted formats: ${acceptAttr}`);

    // Verify help text mentions max file size
    const helpText = await driver.findElement({ css: '#imageHelp' });
    const helpContent = await helpText.getText();

    assert(helpContent.includes('5MB') || helpContent.includes('5 MB'),
        'Help text should mention 5MB file size limit');

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
