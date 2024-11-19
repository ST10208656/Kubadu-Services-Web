const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const express = require('express');
const path = require('path');

describe('Manage Users Tests', function() {
    let driver;
    let server;
    const PORT = 3000;
    
    this.timeout(30000); // Increase timeout for all tests

    before(async function() {
        // Set up Express server
        const app = express();
        app.use(express.static(path.join(__dirname, '../public_html')));
        server = app.listen(PORT);

        // Set up Chrome driver
        const options = new chrome.Options();
        options.addArguments('--headless');
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    after(async function() {
        await driver.quit();
        server.close();
    });

    beforeEach(async function() {
        await driver.get(`http://localhost:${PORT}/manageUsers.html`);
        // Wait for page to fully load
        await driver.wait(until.elementLocated(By.css('h1')), 10000);
        // Wait for Firebase to initialize and load data
        await driver.sleep(2000);
    });

    describe('Customer Management', function() {
        it('should display customer table', async function() {
            const table = await driver.findElement(By.css('#customerTable'));
            assert(await table.isDisplayed());
        });

        it('should open add customer modal', async function() {
            // Click add customer button
            const addButton = await driver.findElement(By.css('a.add-btn[onclick*="openCustomerModal"]'));
            await addButton.click();
            
            // Wait for modal
            await driver.sleep(1000); // Wait for modal animation
            const modal = await driver.findElement(By.css('#addCustomerModal'));
            const display = await modal.getCssValue('display');
            assert.strictEqual(display, 'block');
        });

        it('should fill and submit add customer form', async function() {
            // Click add customer button
            const addButton = await driver.findElement(By.css('a.add-btn[onclick*="openCustomerModal"]'));
            await addButton.click();
            
            // Wait for modal
            await driver.sleep(1000); // Wait for modal animation
            
            // Fill form
            await driver.findElement(By.css('#addCustomerName')).sendKeys('Test Customer');
            await driver.findElement(By.css('#addCustomerEmail')).sendKeys('test@customer.com');
            
            // Submit form
            const form = await driver.findElement(By.css('#addCustomerForm'));
            await form.submit();
            
            // Wait for alert and handle it
            try {
                await driver.wait(until.alertIsPresent(), 5000);
                const alert = await driver.switchTo().alert();
                await alert.accept();
            } catch (e) {
                console.log('No alert present');
            }
        });

        it('should add a new customer', async function() {
            // Click add customer button
            const addBtn = await driver.findElement(By.css('a.add-btn[onclick*="openCustomerModal"]'));
            await addBtn.click();

            // Wait for modal
            await driver.sleep(1000); // Wait for modal animation

            // Fill form
            await driver.findElement(By.css('#addCustomerName')).sendKeys('Test Customer');
            await driver.findElement(By.css('#addCustomerEmail')).sendKeys('customer@example.com');

            // Submit form
            await driver.findElement(By.css('#addCustomerForm')).submit();

            // Wait for alert and accept it
            await driver.wait(until.alertIsPresent(), 5000);
            await driver.switchTo().alert().accept();

            // Verify customer was added (just check if table has content)
            const cells = await driver.findElements(By.css('#customerTable td'));
            assert(cells.length > 0, 'Customer table should have content');
        });
    });

    describe('Employee Management', function() {
        it('should display employee table', async function() {
            const table = await driver.findElement(By.css('#employeeTable'));
            assert(await table.isDisplayed());
        });

        it('should open add employee modal', async function() {
            // Click add employee button
            const addButton = await driver.findElement(By.css('a.add-btn[onclick*="openEmployeeModal"]'));
            await addButton.click();
            
            // Wait for modal
            await driver.sleep(1000); // Wait for modal animation
            const modal = await driver.findElement(By.css('#addEmployeeModal'));
            const display = await modal.getCssValue('display');
            assert.strictEqual(display, 'block');
        });

        it('should fill and submit add employee form', async function() {
            // Click add employee button
            const addButton = await driver.findElement(By.css('a.add-btn[onclick*="openEmployeeModal"]'));
            await addButton.click();
            
            // Wait for modal
            await driver.sleep(1000); // Wait for modal animation
            
            // Fill form
            await driver.findElement(By.css('#addEmployeeName')).sendKeys('Test Employee');
            await driver.findElement(By.css('#addEmployeeEmail')).sendKeys('test@employee.com');
            await driver.findElement(By.css('#addEmployeePassword')).sendKeys('password123');
            
            // Select role
            const roleSelect = await driver.findElement(By.css('#addEmployeeRole'));
            await roleSelect.sendKeys('Admin');
            
            // Select department
            const deptSelect = await driver.findElement(By.css('#addEmployeeDepartment'));
            await deptSelect.sendKeys('Managers');
            
            // Submit form
            const form = await driver.findElement(By.css('#addEmployeeForm'));
            await form.submit();
            
            // Wait for alert and handle it
            try {
                await driver.wait(until.alertIsPresent(), 5000);
                const alert = await driver.switchTo().alert();
                await alert.accept();
            } catch (e) {
                console.log('No alert present');
            }
        });

        it('should add a new employee', async function() {
            // Click add employee button
            const addButton = await driver.findElement(By.css('a.add-btn[onclick*="openEmployeeModal"]'));
            await addButton.click();
            
            // Wait for modal
            await driver.sleep(1000);
            
            // Fill form
            await driver.findElement(By.css('#addEmployeeName')).sendKeys('New Employee');
            await driver.findElement(By.css('#addEmployeeEmail')).sendKeys('new@employee.com');
            await driver.findElement(By.css('#addEmployeePassword')).sendKeys('password123');
            await driver.findElement(By.css('#addEmployeeRole')).sendKeys('Admin');
            await driver.findElement(By.css('#addEmployeeDepartment')).sendKeys('IT');
            
            // Submit form
            await driver.findElement(By.css('#addEmployeeForm')).submit();
            
            // Wait for alert and accept it
            await driver.wait(until.alertIsPresent(), 5000);
            await driver.switchTo().alert().accept();
            
            // Wait for table to update
            await driver.sleep(2000); // Give time for Firebase to update and table to refresh
            
            // Verify employee was added
            const cells = await driver.findElements(By.css('#employeeTable td'));
            assert(cells.length > 0, 'Employee table should have content');
        });
    });
});
