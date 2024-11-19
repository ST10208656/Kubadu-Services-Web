const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');
const path = require('path');
const fs = require('fs');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function setupDriver(testName = 'unnamed_test') {
    const options = new chrome.Options();
    
    // Add Chrome options for CI environment
    if (process.env.CI) {
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
        options.addArguments('--remote-debugging-port=9222');
    }

    // Add general Chrome options
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-popup-blocking');
    options.addArguments('--disable-infobars');
    options.addArguments('--start-maximized');

    let retries = 0;
    let driver;

    while (retries < MAX_RETRIES) {
        try {
            let builder = new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(options);

            // Use remote WebDriver if SELENIUM_REMOTE_URL is set
            if (process.env.SELENIUM_REMOTE_URL) {
                builder = builder.usingServer(process.env.SELENIUM_REMOTE_URL);
            }

            driver = await builder.build();
            await driver.manage().setTimeouts({ 
                implicit: 10000,
                pageLoad: 30000,
                script: 30000
            });
            
            // Attach test name to driver for screenshot naming
            driver.testName = testName;
            return driver;
        } catch (error) {
            retries++;
            if (retries === MAX_RETRIES) {
                console.error(`Failed to setup WebDriver after ${MAX_RETRIES} attempts:`, error);
                throw error;
            }
            console.warn(`Retry ${retries}/${MAX_RETRIES} setting up WebDriver`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

async function takeScreenshot(driver, name) {
    if (!driver) return;

    try {
        const screenshotDir = path.join(process.cwd(), 'test', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${driver.testName}_${name}_${timestamp}.png`;
        const filePath = path.join(screenshotDir, fileName);

        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(filePath, screenshot, 'base64');
        console.log(`Screenshot saved: ${fileName}`);
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
}

async function quitDriver(driver) {
    if (driver) {
        try {
            await takeScreenshot(driver, 'test_end');
            await driver.quit();
        } catch (error) {
            console.error('Error quitting driver:', error);
            // Force quit if normal quit fails
            try {
                driver.quit();
            } catch (e) {
                console.error('Force quit also failed:', e);
            }
        }
    }
}

function getTestFilePath(htmlFile) {
    return `file://${path.join(process.cwd(), 'public_html', htmlFile)}`;
}

module.exports = {
    setupDriver,
    quitDriver,
    getTestFilePath,
    takeScreenshot
};
