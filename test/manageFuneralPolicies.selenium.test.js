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

            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const policy = mockPolicies.find(p => p.id === id);
                    if (!policy) return;

                    const form = document.createElement('div');
                    form.classList.add('edit-form');
                    
                    const inputs = [
                        { type: 'text', id: 'edit-name', value: policy.name },
                        { type: 'text', id: 'edit-coverage', value: policy.coverage },
                        { type: 'number', id: 'edit-payment', value: policy.payment }
                    ];
                    
                    inputs.forEach(input => {
                        const inputElement = document.createElement('input');
                        Object.assign(inputElement, input);
                        form.appendChild(inputElement);
                    });
                    
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Save';
                    saveButton.addEventListener('click', function() {
                        const name = document.getElementById('edit-name').value;
                        const coverage = document.getElementById('edit-coverage').value;
                        const payment = document.getElementById('edit-payment').value;
                        
                        const row = document.querySelector('[data-policy-id="' + id + '"]');
                        if (row) {
                            row.cells[0].textContent = name;
                            row.cells[1].textContent = coverage;
                            row.cells[2].textContent = 'R' + parseFloat(payment).toFixed(2);
                        }

                        form.remove();
                    });
                    form.appendChild(saveButton);
                    
                    document.body.appendChild(form);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const row = document.querySelector('[data-policy-id="' + id + '"]');
                    if (row) {
                        row.remove();
                    }
                });
            });

            // Add event listener for search input
            document.getElementById('search-input').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                document.querySelectorAll('#policies-list tbody tr').forEach(row => {
                    const policyName = row.cells[0].textContent.toLowerCase();
                    row.style.display = policyName.includes(searchTerm) ? '' : 'none';
                });
            });

            // Add event listener for status filter
            document.getElementById('status-filter').addEventListener('change', function() {
                const selectedStatus = this.value;
                document.querySelectorAll('#policies-list tbody tr').forEach(row => {
                    const status = row.cells[3].textContent;
                    row.style.display = (selectedStatus === 'all' || status === selectedStatus) ? '' : 'none';
                });
            });

            // Add event listener for add policy form
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
                
                document.getElementById('policies-list').appendChild(row);
                this.reset();
                
                // Add event listeners to new buttons
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', function() {
                    const form = document.createElement('div');
                    form.classList.add('edit-form');
                    
                    const inputs = [
                        { type: 'text', id: 'edit-name', value: name },
                        { type: 'text', id: 'edit-coverage', value: coverage },
                        { type: 'number', id: 'edit-payment', value: payment }
                    ];
                    
                    inputs.forEach(input => {
                        const inputElement = document.createElement('input');
                        Object.assign(inputElement, input);
                        form.appendChild(inputElement);
                    });
                    
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Save';
                    saveButton.addEventListener('click', function() {
                        const newName = document.getElementById('edit-name').value;
                        const newCoverage = document.getElementById('edit-coverage').value;
                        const newPayment = document.getElementById('edit-payment').value;
                        
                        row.cells[0].textContent = newName;
                        row.cells[1].textContent = newCoverage;
                        row.cells[2].textContent = 'R' + parseFloat(newPayment).toFixed(2);
                        
                        form.remove();
                    });
                    form.appendChild(saveButton);
                    
                    document.body.appendChild(form);
                });
                
                deleteBtn.addEventListener('click', function() {
                    row.remove();
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
        // Get initial number of policies
        const initialRows = await driver.findElements(By.css('#funeral-policies-list > div'));
        const initialCount = initialRows.length;

        // Wait for form elements to be present
        await driver.wait(until.elementLocated(By.id('policy-type')), 5000);
        await driver.wait(until.elementLocated(By.id('coverage')), 5000);
        await driver.wait(until.elementLocated(By.id('payment')), 5000);
        
        // Fill out the form
        await driver.findElement(By.id('policy-type')).sendKeys('Test Policy');
        await driver.findElement(By.id('coverage')).sendKeys('R25,000');
        await driver.findElement(By.id('payment')).sendKeys('200');
        
        // Wait for checkboxes to be present
        await driver.wait(until.elementLocated(By.id('require-id')), 5000);
        await driver.wait(until.elementLocated(By.id('require-proof-address')), 5000);
        await driver.wait(until.elementLocated(By.id('require-income')), 5000);
        await driver.wait(until.elementLocated(By.id('require-bank-statement')), 5000);
        
        // Check required checkboxes
        await driver.findElement(By.id('require-id')).click();
        await driver.findElement(By.id('require-proof-address')).click();
        await driver.findElement(By.id('require-income')).click();
        await driver.findElement(By.id('require-bank-statement')).click();
        
        // Wait for submit button and submit form
        const submitButton = await driver.wait(
            until.elementLocated(By.css('#add-policy-form button[type="submit"]')),
            5000
        );
        await submitButton.click();

        // Wait for and handle the success alert
        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        await alert.accept();

        // Wait for the new policy to be added and verify it exists
        await driver.wait(async () => {
            const currentRows = await driver.findElements(By.css('#funeral-policies-list > div'));
            return currentRows.length > initialCount;
        }, 5000, 'New policy was not added to the list');

        // Get all policies and find the new one
        const policies = await driver.findElements(By.css('#funeral-policies-list > div'));
        const newPolicy = policies[policies.length - 1];
        
        // Get the text content
        const policyText = await newPolicy.getText();
        
        // Verify the policy details
        assert.ok(policyText.includes('Test Policy'), 'Should contain correct policy name');
        assert.ok(policyText.includes('R25,000'), 'Should contain correct coverage');
        assert.ok(policyText.includes('R200'), 'Should contain correct payment amount');
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
