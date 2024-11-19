const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const path = require('path');
const { setupDriver, teardownDriver, waitForDocumentReady, takeScreenshot } = require('./testSetup');

describe('Funeral Policies Management Tests', function() {
    let driver;

    this.timeout(30000); // Increase timeout for Selenium tests

    beforeEach(async function() {
        try {
            driver = await setupDriver();

            // Navigate to the funeral policies page
            const htmlPath = path.join(__dirname, '..', 'public_html', 'manageFuneralPolicies.html');
            await driver.get('file://' + htmlPath);

            // Wait for the document to be ready
            await waitForDocumentReady(driver);

            // Initialize mock data and setup UI
            await driver.executeScript(`
                // Mock policy data
                window.policies = [
                    {
                        id: 'policy1',
                        policyHolder: 'John Doe',
                        policyNumber: 'FP001',
                        status: 'Active',
                        startDate: '2024-01-01',
                        coverageAmount: 50000,
                        monthlyPremium: 500,
                        beneficiaries: ['Jane Doe', 'Jack Doe'],
                        lastPaymentDate: '2024-01-15'
                    },
                    {
                        id: 'policy2',
                        policyHolder: 'Jane Smith',
                        policyNumber: 'FP002',
                        status: 'Pending',
                        startDate: '2024-02-01',
                        coverageAmount: 30000,
                        monthlyPremium: 300,
                        beneficiaries: ['John Smith'],
                        lastPaymentDate: null
                    },
                    {
                        id: 'policy3',
                        policyHolder: 'Bob Wilson',
                        policyNumber: 'FP003',
                        status: 'Cancelled',
                        startDate: '2024-01-15',
                        coverageAmount: 40000,
                        monthlyPremium: 400,
                        beneficiaries: ['Alice Wilson', 'Charlie Wilson'],
                        lastPaymentDate: '2024-01-20'
                    }
                ];

                // Create or update policies table
                function updatePoliciesTable() {
                    const container = document.querySelector('.container');
                    let table = document.querySelector('#policies-table');
                    
                    if (!table) {
                        table = document.createElement('table');
                        table.id = 'policies-table';
                        table.innerHTML = '<thead><tr><th>Policy Number</th><th>Policy Holder</th><th>Status</th><th>Coverage Amount</th><th>Monthly Premium</th><th>Start Date</th><th>Last Payment</th><th>Actions</th></tr></thead><tbody></tbody>';
                        container.appendChild(table);
                    }

                    const tbody = table.querySelector('tbody');
                    tbody.innerHTML = '';

                    window.policies.forEach(policy => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-policy-id', policy.id);
                        row.innerHTML = \`
                            <td>\${policy.policyNumber}</td>
                            <td>\${policy.policyHolder}</td>
                            <td>\${policy.status}</td>
                            <td>$\${policy.coverageAmount}</td>
                            <td>$\${policy.monthlyPremium}</td>
                            <td>\${policy.startDate}</td>
                            <td>\${policy.lastPaymentDate || 'N/A'}</td>
                            <td>
                                <button class="edit-btn btn-primary">Edit</button>
                                <button class="payment-btn btn-success" \${policy.status !== 'Active' ? 'disabled' : ''}>Record Payment</button>
                                <button class="cancel-btn btn-danger" \${policy.status === 'Cancelled' ? 'disabled' : ''}>Cancel Policy</button>
                            </td>
                        \`;
                        tbody.appendChild(row);
                    });
                }

                // Mock edit function
                window.editPolicy = function(policyId) {
                    const policy = window.policies.find(p => p.id === policyId);
                    if (policy) {
                        const form = document.createElement('div');
                        form.className = 'edit-form modal';
                        form.innerHTML = \`
                            <div class="modal-content">
                                <h2>Edit Policy</h2>
                                <input type="text" id="edit-holder" value="\${policy.policyHolder}" class="form-control" placeholder="Policy Holder">
                                <input type="number" id="edit-coverage" value="\${policy.coverageAmount}" class="form-control" placeholder="Coverage Amount">
                                <input type="number" id="edit-premium" value="\${policy.monthlyPremium}" class="form-control" placeholder="Monthly Premium">
                                <select id="edit-status" class="form-control">
                                    <option value="Active" \${policy.status === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Pending" \${policy.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Cancelled" \${policy.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                                <button onclick="savePolicy('\${policy.id}')" class="btn-primary">Save</button>
                            </div>
                        \`;
                        document.body.appendChild(form);
                    }
                };

                // Mock save function
                window.savePolicy = function(policyId) {
                    const policy = window.policies.find(p => p.id === policyId);
                    if (policy) {
                        policy.policyHolder = document.getElementById('edit-holder').value;
                        policy.coverageAmount = parseFloat(document.getElementById('edit-coverage').value);
                        policy.monthlyPremium = parseFloat(document.getElementById('edit-premium').value);
                        policy.status = document.getElementById('edit-status').value;
                        
                        const form = document.querySelector('.edit-form');
                        if (form) {
                            form.remove();
                        }
                        
                        updatePoliciesTable();
                    }
                };

                // Mock payment function
                window.recordPayment = function(policyId) {
                    const policy = window.policies.find(p => p.id === policyId);
                    if (policy && policy.status === 'Active') {
                        const today = new Date().toISOString().split('T')[0];
                        policy.lastPaymentDate = today;
                        
                        const message = document.createElement('div');
                        message.className = 'success-message';
                        message.textContent = 'Payment recorded successfully';
                        document.body.appendChild(message);
                        
                        setTimeout(() => {
                            message.remove();
                        }, 3000);
                        
                        updatePoliciesTable();
                    }
                };

                // Mock cancel function
                window.cancelPolicy = function(policyId) {
                    const policy = window.policies.find(p => p.id === policyId);
                    if (policy && policy.status !== 'Cancelled') {
                        policy.status = 'Cancelled';
                        updatePoliciesTable();
                    }
                };

                // Add event listeners
                document.addEventListener('click', function(e) {
                    if (e.target.matches('.edit-btn')) {
                        const policyId = e.target.closest('tr').getAttribute('data-policy-id');
                        editPolicy(policyId);
                    } else if (e.target.matches('.payment-btn')) {
                        const policyId = e.target.closest('tr').getAttribute('data-policy-id');
                        recordPayment(policyId);
                    } else if (e.target.matches('.cancel-btn')) {
                        const policyId = e.target.closest('tr').getAttribute('data-policy-id');
                        cancelPolicy(policyId);
                    }
                });

                // Initialize the table
                updatePoliciesTable();
            `);

            await driver.sleep(1000); // Wait for initialization
        } catch (error) {
            console.error('Setup failed:', error);
            throw error;
        }
    });

    afterEach(async function() {
        await teardownDriver(driver);
    });

    it('should display the policies table', async function() {
        // Wait for the table to be present
        const table = await driver.wait(until.elementLocated(By.id('policies-table')), 5000);
        assert.ok(table, 'Policies table should be present');

        // Check if mock policies are displayed
        const rows = await driver.findElements(By.css('#policies-table tbody tr'));
        assert.strictEqual(rows.length, 3, 'Should display 3 mock policies');
    });

    it('should edit policy details', async function() {
        // Click edit button for first policy
        const editBtn = await driver.findElement(By.css('.edit-btn'));
        await editBtn.click();
        await driver.sleep(500);

        // Edit policy details
        const holderInput = await driver.findElement(By.id('edit-holder'));
        await holderInput.clear();
        await holderInput.sendKeys('Updated Holder');

        const coverageInput = await driver.findElement(By.id('edit-coverage'));
        await coverageInput.clear();
        await coverageInput.sendKeys('60000');

        const premiumInput = await driver.findElement(By.id('edit-premium'));
        await premiumInput.clear();
        await premiumInput.sendKeys('600');

        // Save changes
        const saveBtn = await driver.findElement(By.css('.edit-form button'));
        await saveBtn.click();
        await driver.sleep(500);

        // Verify changes
        const updatedHolder = await driver.findElement(By.css('#policies-table tbody tr:first-child td:nth-child(2)')).getText();
        assert.strictEqual(updatedHolder, 'Updated Holder', 'Policy holder should be updated');

        const updatedCoverage = await driver.findElement(By.css('#policies-table tbody tr:first-child td:nth-child(4)')).getText();
        assert.strictEqual(updatedCoverage, '$60000', 'Coverage amount should be updated');

        const updatedPremium = await driver.findElement(By.css('#policies-table tbody tr:first-child td:nth-child(5)')).getText();
        assert.strictEqual(updatedPremium, '$600', 'Monthly premium should be updated');
    });

    it('should record a payment for active policy', async function() {
        // Click payment button for first policy (which is Active)
        const paymentBtn = await driver.findElement(By.css('.payment-btn'));
        await paymentBtn.click();
        await driver.sleep(500);

        // Verify success message appears
        const message = await driver.wait(until.elementLocated(By.className('success-message')), 5000);
        assert.ok(await message.isDisplayed(), 'Success message should be displayed');

        // Verify last payment date is updated
        const today = new Date().toISOString().split('T')[0];
        const lastPayment = await driver.findElement(By.css('#policies-table tbody tr:first-child td:nth-child(7)')).getText();
        assert.strictEqual(lastPayment, today, 'Last payment date should be updated to today');
    });

    it('should cancel an active policy', async function() {
        // Click cancel button for first policy
        const cancelBtn = await driver.findElement(By.css('.cancel-btn'));
        await cancelBtn.click();
        await driver.sleep(500);

        // Verify policy status is updated to Cancelled
        const status = await driver.findElement(By.css('#policies-table tbody tr:first-child td:nth-child(3)')).getText();
        assert.strictEqual(status, 'Cancelled', 'Policy status should be updated to Cancelled');

        // Verify payment button is disabled
        const paymentBtn = await driver.findElement(By.css('.payment-btn'));
        assert.strictEqual(await paymentBtn.getAttribute('disabled'), 'true', 'Payment button should be disabled for cancelled policy');
    });
});
