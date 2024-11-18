const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path');

describe('Document Verification E2E Tests', function() {
    let driver;
    const htmlPath = `file://${path.resolve(__dirname, '../public_html/verifyDocuments.html')}`;

    beforeEach(async function() {
        const options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
        await driver.get(htmlPath);
        await driver.wait(until.elementLocated(By.id('documents-list')), 10000);
        
        await driver.executeScript(`
            // Mock Firebase functions
            window.verifyDocument = async function(docId) {
                alert("Document verified successfully.");
            };
            
            window.rejectDocument = async function(docId) {
                alert("Document rejected successfully.");
            };
            
            window.downloadDocument = async function(docId) {
                alert("Document download started.");
            };
            
            // Mock document data
            const mockDocuments = [
                {
                    type: 'Death Certificate',
                    submittedBy: 'John Doe',
                    submissionDate: '2024-02-20',
                    status: 'Pending',
                    docId: 'doc123',
                    fileUrl: '#'
                },
                {
                    type: 'Medical Report',
                    submittedBy: 'Jane Smith',
                    submissionDate: '2024-02-19',
                    status: 'Verified',
                    docId: 'doc456',
                    fileUrl: '#'
                }
            ];
            
            const tbody = document.getElementById('documents-list');
            tbody.innerHTML = '';
            
            mockDocuments.forEach(doc => {
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${doc.type}</td>
                    <td>\${doc.submittedBy}</td>
                    <td>\${doc.submissionDate}</td>
                    <td>\${doc.status}</td>
                    <td>
                        <button onclick="downloadDocument('\${doc.docId}')">Download</button>
                        <button onclick="verifyDocument('\${doc.docId}')" \${doc.status !== 'Pending' ? 'disabled' : ''}>Verify</button>
                        <button onclick="rejectDocument('\${doc.docId}')" \${doc.status !== 'Pending' ? 'disabled' : ''}>Reject</button>
                    </td>
                \`;
                tbody.appendChild(row);
            });
            
            // Mock search and filter functionality
            function updateVisibility() {
                const searchInput = document.getElementById('search-input');
                const typeFilter = document.getElementById('type-filter');
                const statusFilter = document.getElementById('status-filter');
                
                const searchText = searchInput.value.toLowerCase();
                const typeValue = typeFilter.value;
                const statusValue = statusFilter.value;
                
                const rows = Array.from(document.querySelectorAll('#documents-list tr'));
                let visibleCount = 0;
                
                rows.forEach(row => {
                    const type = row.cells[0].textContent;
                    const submittedBy = row.cells[1].textContent.toLowerCase();
                    const status = row.cells[3].textContent;
                    
                    const matchesSearch = searchText === '' || submittedBy.includes(searchText);
                    const matchesType = typeValue === 'all' || type === typeValue;
                    const matchesStatus = statusValue === 'all' || status === statusValue;
                    
                    if (matchesSearch && matchesType && matchesStatus) {
                        row.style.display = '';
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                return visibleCount;
            }
            
            const searchInput = document.getElementById('search-input');
            const typeFilter = document.getElementById('type-filter');
            const statusFilter = document.getElementById('status-filter');
            
            searchInput.addEventListener('input', updateVisibility);
            typeFilter.addEventListener('change', updateVisibility);
            statusFilter.addEventListener('change', updateVisibility);
            
            window.updateVisibility = updateVisibility;
        `);
    });

    afterEach(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    // Test loading documents
    it('should load documents successfully', async function() {
        const documentsTable = await driver.findElement(By.id('documents-list'));
        const rows = await documentsTable.findElements(By.css('tr'));
        assert(rows.length === 2, 'Documents table should have two rows');
    });

    // Test viewing document details
    it('should display document details correctly', async function() {
        const firstRow = await driver.findElement(By.css('#documents-list tr'));
        const cells = await firstRow.findElements(By.css('td'));
        
        const type = await cells[0].getText();
        const submittedBy = await cells[1].getText();
        const status = await cells[3].getText();
        
        assert(type === 'Death Certificate', 'Document type should match');
        assert(submittedBy === 'John Doe', 'Submitted by should match');
        assert(status === 'Pending', 'Status should be Pending');
    });

    // Test document verification
    it('should verify document successfully', async function() {
        const verifyButton = await driver.findElement(By.css('button[onclick*="verifyDocument"]'));
        await verifyButton.click();

        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert(alertText.includes('verified successfully'), 'Should show success message');
        await alert.accept();
    });

    // Test document rejection
    it('should reject document successfully', async function() {
        const rejectButton = await driver.findElement(By.css('button[onclick*="rejectDocument"]'));
        await rejectButton.click();

        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert(alertText.includes('rejected successfully'), 'Should show success message');
        await alert.accept();
    });

    // Test document download
    it('should initiate document download successfully', async function() {
        const downloadButton = await driver.findElement(By.css('button[onclick*="downloadDocument"]'));
        await downloadButton.click();

        await driver.wait(until.alertIsPresent(), 5000);
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();
        assert(alertText.includes('download started'), 'Should show download message');
        await alert.accept();
    });

    // Test verification button state
    it('should disable verification buttons for non-pending documents', async function() {
        const rows = await driver.findElements(By.css('#documents-list tr'));
        
        for (const row of rows) {
            const status = await row.findElement(By.css('td:nth-child(4)')).getText();
            const verifyButton = await row.findElement(By.css('button[onclick*="verifyDocument"]'));
            const rejectButton = await row.findElement(By.css('button[onclick*="rejectDocument"]'));
            
            if (status !== 'Pending') {
                const verifyEnabled = await verifyButton.isEnabled();
                const rejectEnabled = await rejectButton.isEnabled();
                
                assert(!verifyEnabled, 'Verify button should be disabled for non-pending documents');
                assert(!rejectEnabled, 'Reject button should be disabled for non-pending documents');
            }
        }
    });
});
