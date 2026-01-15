const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const config = require('./config');

/**
 * Setup WebDriver with Chrome
 */
async function setupDriver() {
    const options = new chrome.Options();

    if (config.HEADLESS) {
        options.addArguments('--headless=new');
    }

    // Additional Chrome options
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    const driver = await new Builder()
        .forBrowser(config.BROWSER)
        .setChromeOptions(options)
        .build();

    // Set implicit wait
    await driver.manage().setTimeouts({ implicit: config.IMPLICIT_WAIT });

    return driver;
}

/**
 * Wait for element with custom timeout
 */
async function waitForElement(driver, selector, timeout = config.DEFAULT_TIMEOUT) {
    return await driver.wait(
        until.elementLocated(By.css(selector)),
        timeout,
        `Element ${selector} not found within ${timeout}ms`
    );
}

/**
 * Wait for element to be visible
 */
async function waitForVisible(driver, selector, timeout = config.DEFAULT_TIMEOUT) {
    const element = await waitForElement(driver, selector, timeout);
    await driver.wait(
        until.elementIsVisible(element),
        timeout,
        `Element ${selector} not visible within ${timeout}ms`
    );
    return element;
}

/**
 * Wait for element to be clickable and click it
 */
async function clickElement(driver, selector, timeout = config.DEFAULT_TIMEOUT) {
    const element = await waitForVisible(driver, selector, timeout);
    await driver.wait(
        until.elementIsEnabled(element),
        timeout,
        `Element ${selector} not clickable within ${timeout}ms`
    );
    await element.click();
    return element;
}

/**
 * Type text into an input field
 */
async function typeText(driver, selector, text, clear = true) {
    const element = await waitForVisible(driver, selector);
    if (clear) {
        await element.clear();
    }
    await element.sendKeys(text);
    return element;
}

/**
 * Select option from dropdown by value
 */
async function selectOption(driver, selector, value) {
    const select = await waitForVisible(driver, selector);
    await select.sendKeys(value);
    return select;
}

/**
 * Take screenshot and save to file
 */
async function takeScreenshot(driver, filename) {
    try {
        // Create screenshots directory if it doesn't exist
        if (!fs.existsSync(config.SCREENSHOT_DIR)) {
            fs.mkdirSync(config.SCREENSHOT_DIR, { recursive: true });
        }

        const screenshot = await driver.takeScreenshot();
        const filepath = path.join(config.SCREENSHOT_DIR, `${filename}.png`);
        fs.writeFileSync(filepath, screenshot, 'base64');
        console.log(`📸 Screenshot saved: ${filepath}`);
        return filepath;
    } catch (error) {
        console.error('Failed to take screenshot:', error);
    }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get text content of an element
 */
async function getText(driver, selector) {
    const element = await waitForElement(driver, selector);
    return await element.getText();
}

/**
 * Check if element exists
 */
async function elementExists(driver, selector) {
    try {
        await driver.findElement(By.css(selector));
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check if element is visible
 */
async function isVisible(driver, selector) {
    try {
        const element = await driver.findElement(By.css(selector));
        return await element.isDisplayed();
    } catch (error) {
        return false;
    }
}

/**
 * Get attribute value of an element
 */
async function getAttribute(driver, selector, attribute) {
    const element = await waitForElement(driver, selector);
    return await element.getAttribute(attribute);
}

/**
 * Count elements matching selector
 */
async function countElements(driver, selector) {
    const elements = await driver.findElements(By.css(selector));
    return elements.length;
}

/**
 * Test assertion helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ Assertion failed: ${message}`);
    }
    console.log(`  ✅ ${message}`);
}

/**
 * Test runner helper
 */
async function runTest(testName, testFn) {
    console.log(`\n🧪 Running: ${testName}`);
    const startTime = Date.now();

    try {
        await testFn();
        const duration = Date.now() - startTime;
        console.log(`✅ PASSED: ${testName} (${duration}ms)\n`);
        return { passed: true, name: testName, duration };
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ FAILED: ${testName} (${duration}ms)`);
        console.error(`   Error: ${error.message}\n`);
        return { passed: false, name: testName, duration, error: error.message };
    }
}

module.exports = {
    setupDriver,
    waitForElement,
    waitForVisible,
    clickElement,
    typeText,
    selectOption,
    takeScreenshot,
    sleep,
    getText,
    elementExists,
    isVisible,
    getAttribute,
    countElements,
    assert,
    runTest
};
