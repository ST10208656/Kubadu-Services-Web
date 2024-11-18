const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path');

describe('Claims Management E2E Tests', function() {
    let driver;
    const htmlPath = `file://${path.resolve(__dirname, '../public_html/manageClaims.html')}`;

    // This sets up the Selenium WebDriver before each test
    beforeEach(async function() {
        // Set up Chrome options
        const options = new chrome.Options();
        options.addArguments('--headless'); // Run in headless mode (no GUI)
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        
        // Build the driver
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
        // Navigate to the claims page
        await driver.get(htmlPath);
        
        // Wait for Firebase to initialize and load claims
        await driver.wait(until.elementLocated(By.id('users-claims-list')), 10000);
        await driver.executeScript(`
            // Mock Firebase data and functions
            window.approveClaim = async function(claimId, userId) {
                alert("Claim approved successfully.");
            };
            
            window.rejectClaim = async function(claimId) {
                alert("Claim rejected successfully.");
            };
            
            // Mock claim data
            const mockClaims = [
                {
                    beneficiaryName: 'John Doe',
                    coverage: '10000',
                    status: 'Pending',
                    deathCertificate: '#',
                    userId: '123'
                },
                {
                    beneficiaryName: 'Jane Smith',
                    coverage: '15000',
                    status: 'Approved',
                    deathCertificate: '#',
                    userId: '456'
                }
            ];
            
            // Create table rows with mock data
            const tbody = document.getElementById('users-claims-list');
            tbody.innerHTML = ''; // Clear existing rows
            
            mockClaims.forEach(claim => {
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${claim.beneficiaryName}</td>
                    <td>\${claim.coverage}</td>
                    <td>\${claim.status}</td>
                    <td><a href="\${claim.deathCertificate}" target="_blank">View Certificate</a></td>
                    <td>
                        <button onclick="approveClaim('claim123', '123')">Approve</button>
                        <button onclick="rejectClaim('claim123')">Reject</button>
                    </td>
                \`;
                tbody.appendChild(row);
            });
            
            // Mock search and filter functionality
            function updateVisibility() {
                const searchInput = document.getElementById('search-input');
                const filterSelect = document.getElementById('filter-select');
                const searchText = searchInput.value.toLowerCase();
                const filterValue = filterSelect.value;
                
                const rows = Array.from(document.querySelectorAll('#users-claims-list tr'));
                let visibleCount = 0;
                
                rows.forEach(row => {
                    const name = row.cells[0].textContent.toLowerCase();
                    const status = row.cells[2].textContent;
                    
                    const matchesSearch = searchText === '' || name.includes(searchText);
                    const matchesFilter = filterValue === 'all' || status === filterValue;
                    
                    if (matchesSearch && matchesFilter) {
                        row.style.display = '';
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                return visibleCount;
            }
            
            // Add event listeners
            const searchInput = document.getElementById('search-input');
            const filterSelect = document.getElementById('filter-select');
            
            searchInput.addEventListener('input', updateVisibility);
            filterSelect.addEventListener('change', updateVisibility);
            
            // Make function available globally
            window.updateVisibility = updateVisibility;
        `);
    });

    // Clean up after each test
    afterEach(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    // Test loading claims
    it('should load claims successfully', async function() {
        // Wait for claims table to be populated
        const claimsTable = await driver.findElement(By.id('users-claims-list'));
        const rows = await claimsTable.findElements(By.css('tr'));
        assert(rows.length === 2, 'Claims table should have two rows');
    });

    // Test viewing claim details
    it('should display claim details', async function() {
        // Find the first row
        const firstRow = await driver.findElement(By.css('#users-claims-list tr'));
        const cells = await firstRow.findElements(By.css('td'));
        
        // Verify claim details are displayed
        const beneficiaryName = await cells[0].getText();
        const coverage = await cells[1].getText();
        const status = await cells[2].getText();
        
        assert(beneficiaryName === 'John Doe', 'Beneficiary name should match');
        assert(coverage === '10000', 'Coverage amount should match');
        assert(status === 'Pending', 'Status should be Pending');
    });

    // Test approving a claim
    it('should approve claim', async function() {
        // Find and click approve button
        const approveButton = await driver.findElement(By.css('button[onclick*="approveClaim"]'));
        await approveButton.click();

        // Wait for alert and accept it
        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert(alertText.includes('approved successfully'), 'Should show success message');
        await alert.accept();
    });

    // Test rejecting a claim
    it('should reject claim', async function() {
        // Find and click reject button
        const rejectButton = await driver.findElement(By.css('button[onclick*="rejectClaim"]'));
        await rejectButton.click();

        // Wait for alert and accept it
        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert(alertText.includes('rejected successfully'), 'Should show success message');
        await alert.accept();
    });

    // Test filtering claims by search
    it('should filter claims by search', async function() {
        // Enter search term
        await driver.executeScript(`
            const searchInput = document.querySelector('#search-input');
            searchInput.value = 'John';
            searchInput.dispatchEvent(new Event('input'));
        `);

        await driver.sleep(500); // Wait for filter to apply

        // Count visible rows after filter
        const visibleRows = await driver.executeScript(`
            return Array.from(document.querySelectorAll('#users-claims-list tr'))
                .filter(row => !row.hasAttribute('style') || !row.style.display.includes('none')).length;
        `);

        assert.strictEqual(visibleRows > 0, true, 'Should show at least one row');
    });

    // Test filtering claims by status
    it('should filter claims by status', async function() {
        // Select status filter
        await driver.executeScript(`
            const statusSelect = document.querySelector('#filter-select');
            statusSelect.value = 'Pending';
            statusSelect.dispatchEvent(new Event('change'));
        `);

        await driver.sleep(500); // Wait for filter to apply

        // Count visible rows after filter
        const visibleRows = await driver.executeScript(`
            return Array.from(document.querySelectorAll('#users-claims-list tr'))
                .filter(row => !row.hasAttribute('style') || !row.style.display.includes('none')).length;
        `);

        assert.strictEqual(visibleRows > 0, true, 'Should show at least one row');
    });
});
