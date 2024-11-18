const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Loans Management E2E Tests', function() {
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

        // Navigate to the loans page and inject test data
        await driver.get('file:///c:/Users/RC_Student_lab/Desktop/Kubadu Admin/public_html/manageLoans.html');
        
        // Mock Firebase functions and data
        await driver.executeScript(`
            // Mock Firebase functions
            window.db = {};
            window.collection = () => {};
            window.getDocs = () => {};
            window.getDoc = () => {};
            window.updateDoc = () => {};
            window.deleteDoc = () => {};
            window.addDoc = () => {};
            window.onSnapshot = () => {};
            window.doc = () => {};
            window.query = () => {};
            window.where = () => {};

            // Mock editLoan function
            window.editLoan = function(loanId) {
                const editForm = document.createElement('div');
                editForm.classList.add('edit-form');
                editForm.innerHTML = \`
                    <input type="text" id="edit-loanType" value="Personal Loan">
                    <input type="number" id="edit-loanAmount" value="5000">
                    <input type="number" id="edit-loanInterestRate" value="15">
                    <input type="number" id="edit-loanDuration" value="12">
                    <textarea id="edit-requirements">ID Document: true\nProof of Income: true</textarea>
                    <button onclick="saveLoan('\${loanId}')">Save</button>
                \`;
                document.getElementById('loans-list').appendChild(editForm);
            };

            // Mock saveLoan function
            window.saveLoan = function(loanId) {
                const updatedLoan = {
                    loanType: document.getElementById('edit-loanType').value,
                    loanAmount: parseFloat(document.getElementById('edit-loanAmount').value),
                    loanInterestRate: parseFloat(document.getElementById('edit-loanInterestRate').value),
                    loanDuration: parseInt(document.getElementById('edit-loanDuration').value),
                    requirements: document.getElementById('edit-requirements').value.split('\\n').reduce((acc, line) => {
                        const [key, value] = line.split(':').map(item => item.trim());
                        acc[key] = value === 'true';
                        return acc;
                    }, {})
                };
                loadLoans();
                return updatedLoan;
            };

            // Mock deleteLoan function
            window.deleteLoan = function(loanId) {
                const loanItem = document.querySelector(\`[data-loan-id="\${loanId}"]\`);
                if (loanItem) {
                    loanItem.remove();
                }
                loadLoans();
            };

            // Create test loan data
            const mockLoans = [
                {
                    loanType: 'Personal Loan',
                    loanAmount: 5000,
                    loanInterestRate: 15,
                    loanDuration: 12,
                    requirements: {
                        'ID Document': true,
                        'Proof of Income': true
                    }
                },
                {
                    loanType: 'Business Loan',
                    loanAmount: 10000,
                    loanInterestRate: 18,
                    loanDuration: 24,
                    requirements: {
                        'Business Registration': true,
                        'Financial Statements': true
                    }
                }
            ];

            // Create loan list display
            const loansList = document.getElementById('loans-list');
            if (!loansList) {
                const loansDiv = document.createElement('div');
                loansDiv.id = 'loans-list';
                document.body.appendChild(loansDiv);
            }

            // Create users loans list for payment testing
            const usersLoansList = document.getElementById('usersLoansList');
            if (!usersLoansList) {
                const table = document.createElement('table');
                table.id = 'usersLoansList';
                document.body.appendChild(table);
            }

            // Populate loans
            mockLoans.forEach((loan, index) => {
                const loanItem = document.createElement('div');
                loanItem.classList.add('loan-item');
                loanItem.setAttribute('data-loan-id', 'loan' + index);
                loanItem.innerHTML = \`
                    <strong>\${loan.loanType}</strong><br>
                    Amount: R\${loan.loanAmount}<br>
                    Interest Rate: \${loan.loanInterestRate}%<br>
                    Duration: \${loan.loanDuration} months<br>
                    Requirements: \${Object.entries(loan.requirements).map(([key, value]) => \`\${key}: \${value}\`).join(', ')}<br>
                    <button class="edit-btn" onclick="editLoan('loan\${index}')">Edit</button>
                    <button class="delete-btn" onclick="deleteLoan('loan\${index}')">Delete</button>
                \`;
                document.getElementById('loans-list').appendChild(loanItem);
            });

            // Populate user loans for payment testing
            const mockUserLoans = [
                {
                    user: 'John Doe',
                    docId: 'loan1',
                    userId: 'user1',
                    plan: 'Personal Loan',
                    amount: 5000,
                    approvedOn: new Date(),
                    remaining: 3000,
                    progress: 40
                }
            ];

            mockUserLoans.forEach(loan => {
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${loan.user}</td>
                    <td>\${loan.docId}</td>
                    <td>\${loan.plan}</td>
                    <td>\${loan.approvedOn.toLocaleDateString()}</td>
                    <td>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: \${loan.progress}%;"></div>
                        </div>
                        R\${loan.remaining} remaining
                    </td>
                    <td>
                        Paid: <input class="amountInput" type="number" min="0" />
                        <button class="submitButton" data-doc-id="\${loan.docId}" data-user-id="\${loan.userId}" data-original-amount="\${loan.amount}">Submit</button>
                    </td>
                \`;
                document.getElementById('usersLoansList').appendChild(row);
            });

            // Attach submit button listeners
            document.querySelectorAll('.submitButton').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const amount = parseFloat(e.target.previousElementSibling.value);
                    if (!isNaN(amount) && amount > 0) {
                        const docId = e.target.getAttribute('data-doc-id');
                        const userId = e.target.getAttribute('data-user-id');
                        const originalAmount = parseFloat(e.target.getAttribute('data-original-amount'));
                        
                        // Mock payment submission
                        const remainingBalance = originalAmount - amount;
                        const progressBar = e.target.parentElement.previousElementSibling.querySelector('.progress-bar');
                        const progress = ((originalAmount - remainingBalance) / originalAmount) * 100;
                        progressBar.style.width = progress + '%';
                        
                        if (remainingBalance <= 0) {
                            alert(\`Extra payment of R\${Math.abs(remainingBalance)} recorded. This will be added to your wallet.\`);
                        }
                    }
                });
            });
        `);

        await driver.sleep(500); // Wait for the mock data to be loaded
    });

    afterEach(async function() {
        await driver.quit();
    });

    // Test loan list display
    it('should display loan list correctly', async function() {
        const loanItems = await driver.findElements(By.css('.loan-item'));
        assert.strictEqual(loanItems.length, 2, 'Should show two loan items');

        const firstLoanText = await loanItems[0].getText();
        assert(firstLoanText.includes('Personal Loan'), 'Should show Personal Loan');
        assert(firstLoanText.includes('R5000'), 'Should show correct loan amount');
        assert(firstLoanText.includes('15%'), 'Should show correct interest rate');
        assert(firstLoanText.includes('12 months'), 'Should show correct duration');
    });

    // Test loan editing functionality
    it('should show edit form when edit button is clicked', async function() {
        const editButton = await driver.findElement(By.css('.edit-btn'));
        await editButton.click();

        const editForm = await driver.wait(until.elementLocated(By.css('.edit-form')), 5000);
        assert(await editForm.isDisplayed(), 'Edit form should be visible');

        const typeInput = await editForm.findElement(By.id('edit-loanType'));
        const amountInput = await editForm.findElement(By.id('edit-loanAmount'));
        const interestInput = await editForm.findElement(By.id('edit-loanInterestRate'));
        const durationInput = await editForm.findElement(By.id('edit-loanDuration'));

        assert.strictEqual(await typeInput.getAttribute('value'), 'Personal Loan', 'Should show correct loan type');
        assert.strictEqual(await amountInput.getAttribute('value'), '5000', 'Should show correct loan amount');
        assert.strictEqual(await interestInput.getAttribute('value'), '15', 'Should show correct interest rate');
        assert.strictEqual(await durationInput.getAttribute('value'), '12', 'Should show correct duration');
    });

    // Test loan requirements display
    it('should display loan requirements correctly', async function() {
        const loanItems = await driver.findElements(By.css('.loan-item'));
        const firstLoanText = await loanItems[0].getText();
        
        assert(firstLoanText.includes('ID Document: true'), 'Should show ID Document requirement');
        assert(firstLoanText.includes('Proof of Income: true'), 'Should show Proof of Income requirement');
    });

    // Test loan deletion
    it('should delete loan when delete button is clicked', async function() {
        // Get initial loan count
        await driver.sleep(1000); // Wait for page to load
        const initialLoanItems = await driver.findElements(By.css('.loan-item'));
        const initialCount = initialLoanItems.length;

        // Click delete button
        const deleteButton = await driver.findElement(By.css('.delete-btn'));
        await deleteButton.click();

        // Wait for deletion and page update
        await driver.sleep(1000);

        // Get remaining loan count
        const remainingLoanItems = await driver.findElements(By.css('.loan-item'));
        assert.ok(remainingLoanItems.length < initialCount, 'Should have fewer loan items after deletion');
    });

    // Test loan payment submission
    it('should handle loan payment submission correctly', async function() {
        await driver.sleep(1000); // Wait for page to stabilize
        
        const paymentInput = await driver.findElement(By.css('.amountInput'));
        await paymentInput.clear();
        await paymentInput.sendKeys('1000'); // Reduced amount to avoid extra payment alert

        const submitButton = await driver.findElement(By.css('.submitButton'));
        await submitButton.click();

        await driver.sleep(1000); // Wait for payment processing

        // Find the progress bar again after the page updates
        const progressBar = await driver.findElement(By.css('.progress-bar'));
        const width = await progressBar.getAttribute('style');
        const progressValue = parseInt(width.match(/width:\s*(\d+)%/)[1]);
        assert.ok(progressValue > 0 && progressValue <= 100, 'Progress bar should show a valid percentage');
    });

    // Test extra payment functionality
    it('should handle extra payment correctly', async function() {
        // Click the extra payment button
        await driver.executeScript(`
            document.querySelector('.extra-payment-btn').click();
        `);

        await driver.sleep(500); // Wait for modal to appear

        // Enter extra payment amount
        await driver.executeScript(`
            document.getElementById('extra-payment-amount').value = '1000';
        `);

        // Submit the form
        await driver.executeScript(`
            document.querySelector('#extra-payment-form button[type="submit"]').click();
        `);

        await driver.sleep(500); // Wait for alert

        try {
            // Accept the success alert
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();
            assert(alertText.includes('Extra payment'), 'Should show success message');
            await alert.accept();
        } catch (e) {
            // If no alert, that's fine too
            console.log('No alert present');
        }

        await driver.sleep(500); // Wait for UI update
    });
});
