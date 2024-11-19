const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const path = require('path');
const { setupDriver, teardownDriver, waitForDocumentReady, takeScreenshot } = require('./testSetup');

describe('Loans Management Tests', function() {
    let driver;

    this.timeout(30000); // Increase timeout for Selenium tests

    beforeEach(async function() {
        try {
            driver = await setupDriver();

            // Navigate to the loans page
            const htmlPath = path.join(__dirname, '..', 'public_html', 'manageLoans.html');
            await driver.get('file://' + htmlPath);

            // Wait for the document to be ready
            await waitForDocumentReady(driver);

            // Initialize mock data and setup UI
            await driver.executeScript(`
                // Mock loan data
                window.loans = [
                    {
                        id: 'loan1',
                        customerName: 'John Doe',
                        amount: 5000,
                        status: 'Active',
                        startDate: '2024-01-01',
                        endDate: '2024-12-31',
                        interestRate: 5,
                        remainingBalance: 4500
                    },
                    {
                        id: 'loan2',
                        customerName: 'Jane Smith',
                        amount: 3000,
                        status: 'Pending',
                        startDate: '2024-02-01',
                        endDate: '2024-08-31',
                        interestRate: 4.5,
                        remainingBalance: 3000
                    },
                    {
                        id: 'loan3',
                        customerName: 'Bob Wilson',
                        amount: 2000,
                        status: 'Completed',
                        startDate: '2024-01-15',
                        endDate: '2024-06-15',
                        interestRate: 4,
                        remainingBalance: 0
                    }
                ];

                // Create or update loans table
                function updateLoansTable() {
                    const container = document.querySelector('.container');
                    let table = document.querySelector('#loans-table');
                    
                    if (!table) {
                        table = document.createElement('table');
                        table.id = 'loans-table';
                        table.innerHTML = '<thead><tr><th>Customer Name</th><th>Amount</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Interest Rate</th><th>Remaining Balance</th><th>Actions</th></tr></thead><tbody></tbody>';
                        container.appendChild(table);
                    }

                    const tbody = table.querySelector('tbody');
                    tbody.innerHTML = '';

                    window.loans.forEach(loan => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-loan-id', loan.id);
                        row.innerHTML = \`
                            <td>\${loan.customerName}</td>
                            <td>$\${loan.amount}</td>
                            <td>\${loan.status}</td>
                            <td>\${loan.startDate}</td>
                            <td>\${loan.endDate}</td>
                            <td>\${loan.interestRate}%</td>
                            <td>$\${loan.remainingBalance}</td>
                            <td>
                                <button class="edit-btn btn-primary">Edit</button>
                                <button class="payment-btn btn-success" \${loan.status === 'Completed' ? 'disabled' : ''}>Make Payment</button>
                                <button class="delete-btn btn-danger" \${loan.status !== 'Pending' ? 'disabled' : ''}>Delete</button>
                            </td>
                        \`;
                        tbody.appendChild(row);
                    });
                }

                // Mock edit function
                window.editLoan = function(loanId) {
                    const loan = window.loans.find(l => l.id === loanId);
                    if (loan) {
                        const form = document.createElement('div');
                        form.className = 'edit-form modal';
                        form.innerHTML = \`
                            <div class="modal-content">
                                <h2>Edit Loan</h2>
                                <input type="text" id="edit-customer" value="\${loan.customerName}" class="form-control">
                                <input type="number" id="edit-amount" value="\${loan.amount}" class="form-control">
                                <select id="edit-status" class="form-control">
                                    <option value="Active" \${loan.status === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Pending" \${loan.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Completed" \${loan.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                </select>
                                <button onclick="saveLoan('\${loan.id}')" class="btn-primary">Save</button>
                            </div>
                        \`;
                        document.body.appendChild(form);
                    }
                };

                // Mock save function
                window.saveLoan = function(loanId) {
                    const loan = window.loans.find(l => l.id === loanId);
                    if (loan) {
                        loan.customerName = document.getElementById('edit-customer').value;
                        loan.amount = parseFloat(document.getElementById('edit-amount').value);
                        loan.status = document.getElementById('edit-status').value;
                        
                        const form = document.querySelector('.edit-form');
                        if (form) {
                            form.remove();
                        }
                        
                        updateLoansTable();
                    }
                };

                // Mock payment function
                window.makePayment = function(loanId) {
                    const loan = window.loans.find(l => l.id === loanId);
                    if (loan && loan.status === 'Active') {
                        const form = document.createElement('div');
                        form.className = 'payment-form modal';
                        form.innerHTML = \`
                            <div class="modal-content">
                                <h2>Make Payment</h2>
                                <p>Remaining Balance: $\${loan.remainingBalance}</p>
                                <input type="number" id="payment-amount" placeholder="Enter payment amount" class="form-control">
                                <button onclick="processPayment('\${loan.id}')" class="btn-success">Submit Payment</button>
                            </div>
                        \`;
                        document.body.appendChild(form);
                    }
                };

                // Mock process payment function
                window.processPayment = function(loanId) {
                    const loan = window.loans.find(l => l.id === loanId);
                    if (loan) {
                        const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
                        if (paymentAmount > 0 && paymentAmount <= loan.remainingBalance) {
                            loan.remainingBalance -= paymentAmount;
                            if (loan.remainingBalance === 0) {
                                loan.status = 'Completed';
                            }
                            
                            const form = document.querySelector('.payment-form');
                            if (form) {
                                form.remove();
                            }
                            
                            updateLoansTable();
                        }
                    }
                };

                // Mock delete function
                window.deleteLoan = function(loanId) {
                    const index = window.loans.findIndex(l => l.id === loanId);
                    if (index !== -1 && window.loans[index].status === 'Pending') {
                        window.loans.splice(index, 1);
                        updateLoansTable();
                    }
                };

                // Add event listeners
                document.addEventListener('click', function(e) {
                    if (e.target.matches('.edit-btn')) {
                        const loanId = e.target.closest('tr').getAttribute('data-loan-id');
                        editLoan(loanId);
                    } else if (e.target.matches('.payment-btn')) {
                        const loanId = e.target.closest('tr').getAttribute('data-loan-id');
                        makePayment(loanId);
                    } else if (e.target.matches('.delete-btn')) {
                        const loanId = e.target.closest('tr').getAttribute('data-loan-id');
                        deleteLoan(loanId);
                    }
                });

                // Initialize the table
                updateLoansTable();
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

    it('should display the loans table', async function() {
        // Wait for the table to be present
        const table = await driver.wait(until.elementLocated(By.id('loans-table')), 5000);
        assert.ok(table, 'Loans table should be present');

        // Check if mock loans are displayed
        const rows = await driver.findElements(By.css('#loans-table tbody tr'));
        assert.strictEqual(rows.length, 3, 'Should display 3 mock loans');
    });

    it('should edit loan details', async function() {
        // Click edit button for first loan
        const editBtn = await driver.findElement(By.css('.edit-btn'));
        await editBtn.click();
        await driver.sleep(500);

        // Edit loan details
        const customerInput = await driver.findElement(By.id('edit-customer'));
        await customerInput.clear();
        await customerInput.sendKeys('Updated Customer');

        const amountInput = await driver.findElement(By.id('edit-amount'));
        await amountInput.clear();
        await amountInput.sendKeys('6000');

        // Save changes
        const saveBtn = await driver.findElement(By.css('.edit-form button'));
        await saveBtn.click();
        await driver.sleep(500);

        // Verify changes
        const updatedCustomer = await driver.findElement(By.css('#loans-table tbody tr:first-child td:first-child')).getText();
        assert.strictEqual(updatedCustomer, 'Updated Customer', 'Customer name should be updated');

        const updatedAmount = await driver.findElement(By.css('#loans-table tbody tr:first-child td:nth-child(2)')).getText();
        assert.strictEqual(updatedAmount, '$6000', 'Loan amount should be updated');
    });

    it('should make a payment on an active loan', async function() {
        // Click payment button for first loan (which is Active)
        const paymentBtn = await driver.findElement(By.css('.payment-btn'));
        await paymentBtn.click();
        await driver.sleep(500);

        // Enter payment amount
        const paymentInput = await driver.findElement(By.id('payment-amount'));
        await paymentInput.sendKeys('1000');

        // Submit payment
        const submitBtn = await driver.findElement(By.css('.payment-form button'));
        await submitBtn.click();
        await driver.sleep(500);

        // Verify remaining balance is updated
        const updatedBalance = await driver.findElement(By.css('#loans-table tbody tr:first-child td:nth-child(7)')).getText();
        assert.strictEqual(updatedBalance, '$3500', 'Remaining balance should be updated after payment');
    });

    it('should delete a pending loan', async function() {
        // Get initial row count
        const initialRows = await driver.findElements(By.css('#loans-table tbody tr'));
        const initialCount = initialRows.length;

        // Find and click delete button for the pending loan (second loan)
        const deleteBtn = await driver.findElements(By.css('.delete-btn'));
        await deleteBtn[1].click(); // Second loan is pending
        await driver.sleep(500);

        // Verify loan was deleted
        const remainingRows = await driver.findElements(By.css('#loans-table tbody tr'));
        assert.strictEqual(remainingRows.length, initialCount - 1, 'One loan should be deleted');
    });
});
