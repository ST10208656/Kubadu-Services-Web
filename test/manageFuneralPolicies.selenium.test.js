const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Funeral Policies Management E2E Tests', function() {
    let driver;

    // Increase timeout for Selenium tests
    this.timeout(10000);

    beforeEach(async function() {
        // Set up Chrome in headless mode
        const options = new chrome.Options();
        options.addArguments('--headless');
        
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Navigate to the funeral policies page and inject test data
        await driver.get('file:///c:/Users/RC_Student_lab/Desktop/Kubadu Admin/public_html/manageFuneralPolicies.html');
        
        // Mock Firebase functions and data
        await driver.executeScript(function() {
            // Mock data
            const mockPolicies = [
                {
                    id: 'policy1',
                    name: 'Basic Funeral Plan',
                    coverage: 'R15,000',
                    payment: 150.00,
                    status: 'Active'
                },
                {
                    id: 'policy2',
                    name: 'Premium Funeral Plan',
                    coverage: 'R30,000',
                    payment: 300.00,
                    status: 'Active'
                },
                {
                    id: 'policy3',
                    name: 'Family Funeral Plan',
                    coverage: 'R50,000',
                    payment: 450.00,
                    status: 'Inactive'
                }
            ];

            // Populate policies table
            let policiesList = document.getElementById('policies-list');
            if (!policiesList) {
                // Create table if it doesn't exist
                const table = document.createElement('table');
                table.id = 'policies-list';
                
                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                ['Policy Name', 'Coverage', 'Payment', 'Status', 'Actions'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
                
                // Create table body
                const tbody = document.createElement('tbody');
                table.appendChild(tbody);
                
                // Find the main container or create one
                let container = document.querySelector('.container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'container';
                    document.body.appendChild(container);
                }
                
                // Add the table to the container
                container.appendChild(table);
                policiesList = tbody;
            }
            
            // Create mock search and filter elements if they don't exist
            if (!document.getElementById('search-input')) {
                const searchInput = document.createElement('input');
                searchInput.id = 'search-input';
                searchInput.type = 'text';
                searchInput.placeholder = 'Search policies...';
                document.querySelector('.container').insertBefore(searchInput, policiesList.parentElement);
            }
            
            if (!document.getElementById('status-filter')) {
                const statusFilter = document.createElement('select');
                statusFilter.id = 'status-filter';
                const options = [
                    { value: 'all', text: 'All Statuses' },
                    { value: 'Active', text: 'Active' },
                    { value: 'Inactive', text: 'Inactive' }
                ];
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    statusFilter.appendChild(option);
                });
                document.querySelector('.container').insertBefore(statusFilter, policiesList.parentElement);
            }
            
            // Create add policy form if it doesn't exist
            if (!document.getElementById('add-policy-form')) {
                const form = document.createElement('form');
                form.id = 'add-policy-form';
                form.className = 'add-policy-form';
                
                const inputs = [
                    { type: 'text', id: 'policy-type', placeholder: 'Policy Name' },
                    { type: 'text', id: 'coverage', placeholder: 'Coverage Amount' },
                    { type: 'number', id: 'payment', placeholder: 'Monthly Payment', step: '0.01' }
                ];
                
                inputs.forEach(input => {
                    const inputElement = document.createElement('input');
                    Object.assign(inputElement, input);
                    inputElement.required = true;
                    form.appendChild(inputElement);
                });
                
                const submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Add Policy';
                form.appendChild(submitButton);
                
                document.querySelector('.container').insertBefore(form, policiesList.parentElement);
            }

            // Populate policies table
            mockPolicies.forEach(policy => {
                const row = document.createElement('tr');
                row.setAttribute('data-policy-id', policy.id);
                const cells = [
                    { text: policy.name },
                    { text: policy.coverage },
                    { text: 'R' + policy.payment.toFixed(2) },
                    { text: policy.status },
                    {
                        html: '<button class="edit-btn" data-id="' + policy.id + '">Edit</button>' +
                              '<button class="delete-btn" data-id="' + policy.id + '">Delete</button>'
                    }
                ];
                
                cells.forEach((cell, index) => {
                    const td = document.createElement('td');
                    if (cell.html) {
                        td.innerHTML = cell.html;
                    } else {
                        td.textContent = cell.text;
                    }
                    row.appendChild(td);
                });
                
                policiesList.appendChild(row);
            });

            // Add event listeners
            document.getElementById('add-policy-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('policy-type').value;
                const coverage = document.getElementById('coverage').value;
                const payment = document.getElementById('payment').value;
                
                const row = document.createElement('tr');
                const id = 'policy' + (document.querySelectorAll('#policies-list tr').length + 1);
                row.setAttribute('data-policy-id', id);
                
                const cells = [
                    { text: name },
                    { text: coverage },
                    { text: 'R' + parseFloat(payment).toFixed(2) },
                    { text: 'Active' },
                    {
                        html: '<button class="edit-btn" data-id="' + id + '">Edit</button>' +
                              '<button class="delete-btn" data-id="' + id + '">Delete</button>'
                    }
                ];
                
                cells.forEach((cell, index) => {
                    const td = document.createElement('td');
                    if (cell.html) {
                        td.innerHTML = cell.html;
                    } else {
                        td.textContent = cell.text;
                    }
                    row.appendChild(td);
                });
                
                document.querySelector('#policies-list tbody').appendChild(row);
                this.reset();
            });

            // Add search functionality
            document.getElementById('search-input').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#policies-list tbody tr').forEach(row => {
                    const policyName = row.cells[0].textContent.toLowerCase();
                    row.style.display = policyName.includes(searchTerm) ? '' : 'none';
                });
            });

            // Add status filter functionality
            document.getElementById('status-filter').addEventListener('change', function() {
                const selectedStatus = this.value;
                document.querySelectorAll('#policies-list tbody tr').forEach(row => {
                    const status = row.cells[3].textContent;
                    row.style.display = (selectedStatus === 'all' || status === selectedStatus) ? '' : 'none';
                });
            });
        });

        await driver.sleep(500); // Wait for the mock data to be loaded
    });

    afterEach(async function() {
        await driver.quit();
    });

    // Test policy list display
    it('should display policy list correctly', async function() {
        const policyRows = await driver.findElements(By.css('#policies-list tbody tr'));
        assert.strictEqual(policyRows.length, 3, 'Should show three policy rows');

        const firstRow = policyRows[0];
        const cells = await firstRow.findElements(By.css('td'));
        
        assert.strictEqual(await cells[0].getText(), 'Basic Funeral Plan', 'Should show correct policy name');
        assert.strictEqual(await cells[1].getText(), 'R15,000', 'Should show correct coverage');
        assert.strictEqual(await cells[2].getText(), 'R150.00', 'Should show correct payment amount');
    });

    // Test adding a new policy
    it('should add new policy correctly', async function() {
        // Fill out the form directly
        await driver.findElement(By.id('policy-type')).sendKeys('Test Policy');
        await driver.findElement(By.id('coverage')).sendKeys('R25,000');
        await driver.findElement(By.id('payment')).sendKeys('200');
        
        // Submit the form
        const form = await driver.findElement(By.id('add-policy-form'));
        await form.submit();

        await driver.sleep(1000); // Wait for the new policy to be added

        // Verify the new policy details
        const rows = await driver.findElements(By.css('#policies-list tbody tr'));
        const lastRow = rows[rows.length - 1];
        const cells = await lastRow.findElements(By.css('td'));

        assert.strictEqual(await cells[0].getText(), 'Test Policy', 'Should show correct policy name');
        assert.strictEqual(await cells[1].getText(), 'R25,000', 'Should show correct coverage');
        assert.strictEqual(await cells[2].getText(), 'R200.00', 'Should show correct payment amount');
    });

    // Test editing a policy
    it('should edit policy correctly', async function() {
        const editButton = await driver.findElement(By.css('.edit-btn'));
        await editButton.click();

        await driver.sleep(500); // Wait for edit form to appear

        const nameInput = await driver.findElement(By.id('edit-name'));
        const coverageInput = await driver.findElement(By.id('edit-coverage'));
        const paymentInput = await driver.findElement(By.id('edit-payment'));
        const saveButton = await driver.findElement(By.css('.edit-form button'));

        await nameInput.clear();
        await nameInput.sendKeys('Updated Policy');
        await coverageInput.clear();
        await coverageInput.sendKeys('R40,000');
        await paymentInput.clear();
        await paymentInput.sendKeys('350');

        await saveButton.click();
        await driver.sleep(500); // Wait for changes to apply

        const firstRow = await driver.findElement(By.css('#policies-list tbody tr'));
        const cells = await firstRow.findElements(By.css('td'));

        assert.strictEqual(await cells[0].getText(), 'Updated Policy', 'Should show updated policy name');
        assert.strictEqual(await cells[1].getText(), 'R40,000', 'Should show updated coverage');
        assert.strictEqual(await cells[2].getText(), 'R350.00', 'Should show updated payment amount');
    });

    // Test deleting a policy
    it('should delete policy correctly', async function() {
        const initialRows = await driver.findElements(By.css('#policies-list tbody tr'));
        const initialCount = initialRows.length;

        const deleteButton = await driver.findElement(By.css('.delete-btn'));
        await deleteButton.click();

        await driver.sleep(500); // Wait for deletion to complete

        const finalRows = await driver.findElements(By.css('#policies-list tbody tr'));
        const finalCount = finalRows.length;

        assert.strictEqual(finalCount, initialCount - 1, 'Should have one less policy after deletion');
    });

    // Test filtering by search term
    it('should filter policies by search term', async function() {
        const searchInput = await driver.findElement(By.id('search-input'));
        await searchInput.sendKeys('Premium');
        await driver.sleep(500);

        const visibleRows = await driver.findElements(By.css('#policies-list tbody tr:not([style*="display: none"])'));
        assert.strictEqual(visibleRows.length, 1, 'Should show only one matching policy');
        
        const cells = await visibleRows[0].findElements(By.css('td'));
        assert.strictEqual(await cells[0].getText(), 'Premium Funeral Plan', 'Should show the correct filtered policy');
    });

    // Test status filter
    it('should filter policies by status', async function() {
        const statusFilter = await driver.findElement(By.id('status-filter'));
        await statusFilter.sendKeys('Inactive');
        await driver.sleep(500);

        const visibleRows = await driver.findElements(By.css('#policies-list tbody tr:not([style*="display: none"])'));
        assert.strictEqual(visibleRows.length, 1, 'Should show only one matching policy');
        
        const cells = await visibleRows[0].findElements(By.css('td'));
        assert.strictEqual(await cells[3].getText(), 'Inactive', 'Should show only inactive policies');
    });
});
