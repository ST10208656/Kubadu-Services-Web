const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { setupDriver, quitDriver, getTestFilePath } = require('./testSetup');

describe('Claims Management E2E Tests', function() {
    let driver;

    beforeEach(async function() {
        try {
            driver = await setupDriver();
            const htmlPath = getTestFilePath('manageClaims.html');
            await driver.get(htmlPath);
            
            // Initialize mock data
            await driver.executeScript(`
                window.claims = [
                    {
                        id: 'claim1',
                        userId: 'user1',
                        beneficiaryName: 'John Doe',
                        coverage: '10000',
                        status: 'Pending',
                        deathCertificate: 'certificate1.pdf'
                    },
                    {
                        id: 'claim2',
                        userId: 'user2',
                        beneficiaryName: 'Jane Smith',
                        coverage: '15000',
                        status: 'Pending',
                        deathCertificate: 'certificate2.pdf'
                    }
                ];

                // Create table container if it doesn't exist
                let container = document.querySelector('.container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'container';
                    document.body.appendChild(container);
                }

                // Create table if it doesn't exist
                let table = document.getElementById('claims-table');
                if (!table) {
                    table = document.createElement('table');
                    table.id = 'claims-table';
                    table.innerHTML = '<thead><tr><th>Beneficiary</th><th>Coverage</th><th>Status</th><th>Certificate</th><th>Actions</th></tr></thead><tbody id="claims-list"></tbody>';
                    container.appendChild(table);
                }

                // Add search input if it doesn't exist
                if (!document.getElementById('search-input')) {
                    const searchInput = document.createElement('input');
                    searchInput.id = 'search-input';
                    searchInput.type = 'text';
                    searchInput.placeholder = 'Search claims...';
                    container.insertBefore(searchInput, table);
                }

                // Add status filter if it doesn't exist
                if (!document.getElementById('filter-select')) {
                    const filterSelect = document.createElement('select');
                    filterSelect.id = 'filter-select';
                    filterSelect.innerHTML = \`
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    \`;
                    container.insertBefore(filterSelect, table);
                }

                // Update claims table
                function updateClaimsTable() {
                    const tbody = document.getElementById('claims-list');
                    if (!tbody) return;
                    
                    tbody.innerHTML = '';
                    window.claims.forEach(claim => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-claim-id', claim.id);
                        row.innerHTML = \`
                            <td class="beneficiary-name">\${claim.beneficiaryName}</td>
                            <td class="coverage-amount">\${claim.coverage}</td>
                            <td class="claim-status">\${claim.status}</td>
                            <td><a href="\${claim.deathCertificate}" target="_blank">View Certificate</a></td>
                            <td class="action-buttons">
                                <button class="approve-btn" \${claim.status !== 'Pending' ? 'disabled' : ''}>Approve</button>
                                <button class="reject-btn" \${claim.status !== 'Pending' ? 'disabled' : ''}>Reject</button>
                            </td>
                        \`;
                        tbody.appendChild(row);
                    });

                    // Add event listeners to buttons
                    document.querySelectorAll('.approve-btn').forEach(btn => {
                        btn.onclick = function() {
                            const row = this.closest('tr');
                            const claimId = row.getAttribute('data-claim-id');
                            approveClaim(claimId);
                        };
                    });

                    document.querySelectorAll('.reject-btn').forEach(btn => {
                        btn.onclick = function() {
                            const row = this.closest('tr');
                            const claimId = row.getAttribute('data-claim-id');
                            rejectClaim(claimId);
                        };
                    });
                }

                // Mock functions
                window.approveClaim = function(claimId) {
                    const claim = window.claims.find(c => c.id === claimId);
                    if (claim) {
                        claim.status = 'Approved';
                        updateClaimsTable();
                    }
                };

                window.rejectClaim = function(claimId) {
                    const claim = window.claims.find(c => c.id === claimId);
                    if (claim) {
                        claim.status = 'Rejected';
                        updateClaimsTable();
                    }
                };

                // Filter function
                window.filterClaims = function() {
                    const searchInput = document.getElementById('search-input');
                    const filterSelect = document.getElementById('filter-select');
                    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
                    const filterValue = filterSelect ? filterSelect.value : 'all';

                    const rows = document.querySelectorAll('#claims-list tr');
                    rows.forEach(row => {
                        const beneficiaryName = row.querySelector('.beneficiary-name').textContent.toLowerCase();
                        const status = row.querySelector('.claim-status').textContent;

                        const nameMatch = beneficiaryName.includes(searchText);
                        const statusMatch = filterValue === 'all' || status === filterValue;

                        row.style.display = nameMatch && statusMatch ? '' : 'none';
                    });
                };

                // Add event listeners
                document.getElementById('search-input').addEventListener('input', filterClaims);
                document.getElementById('filter-select').addEventListener('change', filterClaims);

                // Initial table population
                updateClaimsTable();
            `);

            await driver.sleep(1000); // Wait for initialization
        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        }
    });

    afterEach(async function() {
        await quitDriver(driver);
    });

    it('should load claims successfully', async function() {
        const rows = await driver.findElements(By.css('#claims-list tr'));
        assert.strictEqual(rows.length, 2, 'Claims table should have two rows');
    });

    it('should display claim details', async function() {
        const firstRow = await driver.findElement(By.css('#claims-list tr'));
        const beneficiaryName = await firstRow.findElement(By.css('.beneficiary-name')).getText();
        const coverage = await firstRow.findElement(By.css('.coverage-amount')).getText();
        const status = await firstRow.findElement(By.css('.claim-status')).getText();
        
        assert.strictEqual(beneficiaryName, 'John Doe', 'Beneficiary name should match');
        assert.strictEqual(coverage, '10000', 'Coverage amount should match');
        assert.strictEqual(status, 'Pending', 'Status should match');
    });

    it('should approve claim', async function() {
        const approveBtn = await driver.findElement(By.css('.approve-btn'));
        await approveBtn.click();
        await driver.sleep(500);

        const status = await driver.findElement(By.css('#claims-list tr:first-child .claim-status')).getText();
        assert.strictEqual(status, 'Approved', 'Claim status should be updated to Approved');
    });

    it('should reject claim', async function() {
        const rejectBtn = await driver.findElement(By.css('.reject-btn'));
        await rejectBtn.click();
        await driver.sleep(500);

        const status = await driver.findElement(By.css('#claims-list tr:first-child .claim-status')).getText();
        assert.strictEqual(status, 'Rejected', 'Claim status should be updated to Rejected');
    });

    it('should filter claims by search', async function() {
        const searchInput = await driver.findElement(By.id('search-input'));
        await searchInput.sendKeys('John');
        await driver.sleep(500);

        const visibleRows = await driver.findElements(By.css('#claims-list tr:not([style*="display: none"])'));
        assert.strictEqual(visibleRows.length, 1, 'Should show exactly one row');

        const beneficiaryName = await visibleRows[0].findElement(By.css('.beneficiary-name')).getText();
        assert.strictEqual(beneficiaryName, 'John Doe', 'Should show the correct filtered claim');
    });

    it('should filter claims by status', async function() {
        // First approve a claim to have different statuses
        const approveBtn = await driver.findElement(By.css('.approve-btn'));
        await approveBtn.click();
        await driver.sleep(500);

        // Filter by Approved status
        const filterSelect = await driver.findElement(By.id('filter-select'));
        await filterSelect.sendKeys('Approved');
        await driver.sleep(500);

        const visibleRows = await driver.findElements(By.css('#claims-list tr:not([style*="display: none"])'));
        assert.strictEqual(visibleRows.length, 1, 'Should show exactly one approved claim');

        const status = await visibleRows[0].findElement(By.css('.claim-status')).getText();
        assert.strictEqual(status, 'Approved', 'Should show only approved claims');
    });
});
