const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Common setup function for all Selenium tests
async function setupDriver() {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    return driver;
}

// Common teardown function
async function teardownDriver(driver) {
    if (driver) {
        try {
            await driver.quit();
        } catch (error) {
            console.error('Error during driver teardown:', error);
        }
    }
}

// Common wait function
async function waitForDocumentReady(driver, timeout = 5000) {
    await driver.wait(async function() {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
    }, timeout);
}

// Take screenshot helper
async function takeScreenshot(driver, name) {
    try {
        const screenshot = await driver.takeScreenshot();
        const fs = require('fs');
        const path = require('path');
        const screenshotPath = path.join(__dirname, 'screenshots', `${name}_${new Date().toISOString().replace(/:/g, '-')}.png`);
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
}

module.exports = {
    setupDriver,
    teardownDriver,
    waitForDocumentReady,
    takeScreenshot
};
