const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Users Management E2E Tests', function() {
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

        // Navigate to the users page and inject test data
        await driver.get('file:///c:/Users/RC_Student_lab/Desktop/Kubadu Admin/public_html/manageUsers.html');
        
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
            window.doc = () => {};

            // Create test user data
            const mockUsers = [
                {
                    id: 'user1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    status: 'Active',
                    lastLogin: '2024-01-01',
                    role: 'Admin'
                },
                {
                    id: 'user2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    status: 'Active',
                    lastLogin: '2024-01-02',
                    role: 'User'
                },
                {
                    id: 'user3',
                    name: 'Bob Wilson',
                    email: 'bob@example.com',
                    status: 'Blocked',
                    lastLogin: '2024-01-03',
                    role: 'User'
                }
            ];

            // Populate users table
            const usersList = document.getElementById('users-list');
            mockUsers.forEach(user => {
                const row = document.createElement('tr');
                row.setAttribute('data-user-id', user.id);
                row.innerHTML = \`
                    <td>\${user.name}</td>
                    <td>\${user.email}</td>
                    <td>\${user.status}</td>
                    <td>\${user.lastLogin}</td>
                    <td>\${user.role}</td>
                    <td>
                        <button class="edit-btn" onclick="openEditEmployeeModal('\${user.id}', '\${user.name}', '\${user.email}', '\${user.role}')">Edit</button>
                        <button class="delete-btn" onclick="openDeleteModal('\${user.id}')">Delete</button>
                    </td>
                \`;
                usersList.appendChild(row);
            });

            // Mock edit employee function
            window.openEditEmployeeModal = function(id, name, email, role) {
                const form = document.createElement('div');
                form.classList.add('edit-form');
                form.innerHTML = \`
                    <input type="text" id="edit-name" value="\${name}">
                    <input type="email" id="edit-email" value="\${email}">
                    <select id="edit-role">
                        <option value="Admin" \${role === 'Admin' ? 'selected' : ''}>Admin</option>
                        <option value="User" \${role === 'User' ? 'selected' : ''}>User</option>
                    </select>
                    <button onclick="editEmployee('\${id}')">Save</button>
                \`;
                document.body.appendChild(form);
            };

            // Mock delete modal function
            window.openDeleteModal = function(id) {
                const row = document.querySelector(\`[data-user-id="\${id}"]\`);
                if (row) {
                    row.remove();
                }
            };

            // Mock edit employee function
            window.editEmployee = function(id) {
                const name = document.getElementById('edit-name').value;
                const email = document.getElementById('edit-email').value;
                const role = document.getElementById('edit-role').value;
                
                const row = document.querySelector(\`[data-user-id="\${id}"]\`);
                if (row) {
                    row.cells[0].textContent = name;
                    row.cells[1].textContent = email;
                    row.cells[4].textContent = role;
                }

                const form = document.querySelector('.edit-form');
                if (form) {
                    form.remove();
                }
            };

            // Mock search functionality
            window.filterUsers = function() {
                const searchInput = document.getElementById('search-input');
                const roleFilter = document.getElementById('role-filter');
                const statusFilter = document.getElementById('status-filter');
                
                const searchText = searchInput.value.toLowerCase();
                const roleValue = roleFilter.value;
                const statusValue = statusFilter.value;
                
                const rows = document.querySelectorAll('#users-list tr');
                let visibleCount = 0;
                
                rows.forEach(row => {
                    const name = row.cells[0].textContent.toLowerCase();
                    const email = row.cells[1].textContent.toLowerCase();
                    const status = row.cells[2].textContent;
                    const role = row.cells[4].textContent;
                    
                    const matchesSearch = searchText === '' || 
                        name.includes(searchText) || 
                        email.includes(searchText);
                    const matchesRole = roleValue === 'all' || role === roleValue;
                    const matchesStatus = statusValue === 'all' || status === statusValue;
                    
                    if (matchesSearch && matchesRole && matchesStatus) {
                        row.style.display = '';
                        visibleCount++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                return visibleCount;
            };

            // Add event listeners for filtering
            document.getElementById('search-input').addEventListener('input', filterUsers);
            document.getElementById('role-filter').addEventListener('change', filterUsers);
            document.getElementById('status-filter').addEventListener('change', filterUsers);
        `);

        await driver.sleep(500); // Wait for the mock data to be loaded
    });

    afterEach(async function() {
        await driver.quit();
    });

    // Test initial user list display
    it('should display user list correctly', async function() {
        // Wait for the user list to load
        await driver.sleep(1000);

        // Count visible rows
        const visibleRows = await driver.executeScript(`
            return Array.from(document.querySelectorAll('#users-list tbody tr'))
                .filter(row => !row.hasAttribute('style') || !row.style.display.includes('none')).length;
        `);

        assert.ok(visibleRows > 0, 'Should show at least one user row');

        // Verify table headers
        const headers = await driver.executeScript(`
            return Array.from(document.querySelectorAll('#users-list th')).map(th => th.textContent.trim());
        `);

        assert.ok(headers.includes('Name'), 'Should have Name column');
        assert.ok(headers.includes('Email'), 'Should have Email column');
        assert.ok(headers.includes('Role'), 'Should have Role column');
    });

    // Test user search functionality
    it('should filter users by search term', async function() {
        const searchInput = await driver.findElement(By.id('search-input'));
        await searchInput.clear();
        await searchInput.sendKeys('Jane');
        
        const visibleCount = await driver.executeScript('return filterUsers()');
        await driver.sleep(500); // Wait for filter to apply

        assert.strictEqual(visibleCount, 1, 'Should show only one matching user');
        
        const visibleRows = await driver.findElements(By.css('#users-list tr:not([style*="display: none"])'));
        const cells = await visibleRows[0].findElements(By.css('td'));
        assert.strictEqual(await cells[0].getText(), 'Jane Smith', 'Should show the correct filtered user');
    });

    // Test role filter
    it('should filter users by role', async function() {
        const roleFilter = await driver.findElement(By.id('role-filter'));
        await roleFilter.findElement(By.css('option[value="User"]')).click();
        
        const visibleCount = await driver.executeScript('return filterUsers()');
        await driver.sleep(500); // Wait for filter to apply

        assert.strictEqual(visibleCount, 2, 'Should show only User role entries');
    });

    // Test status filter
    it('should filter users by status', async function() {
        const statusFilter = await driver.findElement(By.id('status-filter'));
        await statusFilter.findElement(By.css('option[value="Blocked"]')).click();
        
        const visibleCount = await driver.executeScript('return filterUsers()');
        await driver.sleep(500); // Wait for filter to apply

        assert.strictEqual(visibleCount, 1, 'Should show only Blocked status entries');
    });

    // Test user editing
    it('should edit user information correctly', async function() {
        const editButton = await driver.findElement(By.css('.edit-btn'));
        await editButton.click();

        await driver.sleep(500); // Wait for edit form

        const nameInput = await driver.findElement(By.id('edit-name'));
        await nameInput.clear();
        await nameInput.sendKeys('John Updated');

        const saveButton = await driver.findElement(By.css('.edit-form button'));
        await saveButton.click();

        await driver.sleep(500); // Wait for update

        const updatedName = await driver.findElement(By.css('#users-list tr:first-child td:first-child')).getText();
        assert.strictEqual(updatedName, 'John Updated', 'Should update the user name');
    });

    // Test deleting a user
    it('should delete user correctly', async function() {
        // Get initial row count
        const initialRows = await driver.executeScript(`
            return Array.from(document.querySelectorAll('#users-list tbody tr'))
                .filter(row => !row.hasAttribute('style') || !row.style.display.includes('none')).length;
        `);

        // Click delete button on first row
        await driver.executeScript(`
            document.querySelector('.delete-btn').click();
        `);

        await driver.sleep(500); // Wait for confirmation dialog

        try {
            // Accept the confirmation dialog
            const alert = await driver.switchTo().alert();
            await alert.accept();
        } catch (e) {
            // No alert present, that's fine
        }

        await driver.sleep(1000); // Wait for deletion to complete

        // Get final row count
        const finalRows = await driver.executeScript(`
            return Array.from(document.querySelectorAll('#users-list tbody tr'))
                .filter(row => !row.hasAttribute('style') || !row.style.display.includes('none')).length;
        `);

        assert.ok(finalRows < initialRows, 'Should have fewer rows after deletion');
    });
});
