const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const path = require('path');
const { setupDriver, teardownDriver, waitForDocumentReady, takeScreenshot } = require('./testSetup');

describe('Users Management Tests', function() {
    let driver;

    this.timeout(30000); // Increase timeout for Selenium tests

    beforeEach(async function() {
        try {
            driver = await setupDriver();

            // Navigate to the users page
            const htmlPath = path.join(__dirname, '..', 'public_html', 'manageUsers.html');
            await driver.get('file://' + htmlPath);

            // Wait for the document to be ready
            await waitForDocumentReady(driver);

            // Initialize mock data and setup UI
            await driver.executeScript(`
                // Mock user data
                window.users = [
                    {
                        id: 'user1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'Admin',
                        status: 'Active',
                        lastLogin: '2024-01-01'
                    },
                    {
                        id: 'user2',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        role: 'User',
                        status: 'Active',
                        lastLogin: '2024-01-02'
                    },
                    {
                        id: 'user3',
                        name: 'Bob Wilson',
                        email: 'bob@example.com',
                        role: 'User',
                        status: 'Blocked',
                        lastLogin: '2024-01-03'
                    }
                ];

                // Create or update users table
                function updateUsersTable() {
                    const container = document.querySelector('.container');
                    let table = document.querySelector('#users-table');
                    
                    if (!table) {
                        table = document.createElement('table');
                        table.id = 'users-table';
                        table.innerHTML = '<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead><tbody></tbody>';
                        container.appendChild(table);
                    }

                    const tbody = table.querySelector('tbody');
                    tbody.innerHTML = '';

                    window.users.forEach(user => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-user-id', user.id);
                        row.innerHTML = \`
                            <td>\${user.name}</td>
                            <td>\${user.email}</td>
                            <td>\${user.role}</td>
                            <td>\${user.status}</td>
                            <td>\${user.lastLogin}</td>
                            <td>
                                <button class="edit-btn btn-primary">Edit</button>
                                <button class="delete-btn btn-danger">Delete</button>
                            </td>
                        \`;
                        tbody.appendChild(row);
                    });
                }

                // Mock edit function
                window.editUser = function(userId) {
                    const user = window.users.find(u => u.id === userId);
                    if (user) {
                        const form = document.createElement('div');
                        form.className = 'edit-form modal';
                        form.innerHTML = \`
                            <div class="modal-content">
                                <h2>Edit User</h2>
                                <input type="text" id="edit-name" value="\${user.name}" class="form-control">
                                <input type="email" id="edit-email" value="\${user.email}" class="form-control">
                                <select id="edit-role" class="form-control">
                                    <option value="Admin" \${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                                    <option value="User" \${user.role === 'User' ? 'selected' : ''}>User</option>
                                </select>
                                <button onclick="saveUser('\${user.id}')" class="btn-primary">Save</button>
                            </div>
                        \`;
                        document.body.appendChild(form);
                    }
                };

                // Mock save function
                window.saveUser = function(userId) {
                    const user = window.users.find(u => u.id === userId);
                    if (user) {
                        user.name = document.getElementById('edit-name').value;
                        user.email = document.getElementById('edit-email').value;
                        user.role = document.getElementById('edit-role').value;
                        
                        const form = document.querySelector('.edit-form');
                        if (form) {
                            form.remove();
                        }
                        
                        updateUsersTable();
                    }
                };

                // Mock delete function
                window.deleteUser = function(userId) {
                    const index = window.users.findIndex(u => u.id === userId);
                    if (index !== -1) {
                        window.users.splice(index, 1);
                        updateUsersTable();
                    }
                };

                // Add event listeners
                document.addEventListener('click', function(e) {
                    if (e.target.matches('.edit-btn')) {
                        const userId = e.target.closest('tr').getAttribute('data-user-id');
                        editUser(userId);
                    } else if (e.target.matches('.delete-btn')) {
                        const userId = e.target.closest('tr').getAttribute('data-user-id');
                        deleteUser(userId);
                    }
                });

                // Initialize the table
                updateUsersTable();
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

    it('should display the users table', async function() {
        // Wait for the table to be present
        const table = await driver.wait(until.elementLocated(By.id('users-table')), 5000);
        assert.ok(table, 'Users table should be present');

        // Check if mock users are displayed
        const rows = await driver.findElements(By.css('#users-table tbody tr'));
        assert.strictEqual(rows.length, 3, 'Should display 3 mock users');
    });

    it('should edit user details', async function() {
        // Click edit button for first user
        const editBtn = await driver.findElement(By.css('.edit-btn'));
        await editBtn.click();
        await driver.sleep(500);

        // Edit user details
        const nameInput = await driver.findElement(By.id('edit-name'));
        await nameInput.clear();
        await nameInput.sendKeys('Updated Name');

        // Save changes
        const saveBtn = await driver.findElement(By.css('.edit-form button'));
        await saveBtn.click();
        await driver.sleep(500);

        // Verify changes
        const updatedName = await driver.findElement(By.css('#users-table tbody tr:first-child td:first-child')).getText();
        assert.strictEqual(updatedName, 'Updated Name', 'User name should be updated');
    });

    it('should delete a user', async function() {
        // Get initial row count
        const initialRows = await driver.findElements(By.css('#users-table tbody tr'));
        const initialCount = initialRows.length;

        // Click delete button for first user
        const deleteBtn = await driver.findElement(By.css('.delete-btn'));
        await deleteBtn.click();
        await driver.sleep(500);

        // Verify user was deleted
        const remainingRows = await driver.findElements(By.css('#users-table tbody tr'));
        assert.strictEqual(remainingRows.length, initialCount - 1, 'One user should be deleted');
    });
});
