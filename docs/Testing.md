# Kubadu Admin Dashboard - Test Documentation

## Overview
This document details the testing infrastructure and practices for the Kubadu Admin Dashboard.

## Test Architecture

### Directory Structure
```
/test
├── manageUsers.selenium.test.js  # User management tests
├── testSetup.js                 # Test configuration
└── screenshots/                 # Test failure screenshots
```

## Test Setup

### Environment Configuration (testSetup.js)
```javascript
// Test environment setup
before(async function() {
    // Configure WebDriver
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    // Set implicit wait
    await driver.manage().setTimeouts({ implicit: 10000 });
});

// Cleanup after tests
after(async function() {
    await driver.quit();
});
```

## Test Suites

### User Management Tests (manageUsers.selenium.test.js)

#### Customer Management
1. Table Display Tests
   - Verify table headers
   - Check data loading
   - Validate row content

2. Modal Tests
   - Open/close behavior
   - Form field validation
   - Submit functionality

3. CRUD Operations
   - Add new customer
   - View customer details
   - Update customer information
   - Delete customer record

#### Employee Management
1. Table Display Tests
   - Verify table headers
   - Check data loading
   - Validate row content

2. Modal Tests
   - Open/close behavior
   - Form field validation
   - Submit functionality

3. CRUD Operations
   - Add new employee
   - View employee details
   - Update employee information
   - Delete employee record

## Test Execution

### Local Execution
```bash
# Start ChromeDriver
chromedriver --port=4444

# Run all tests
npx mocha --timeout 60000 test/*.selenium.test.js

# Run specific test file
npx mocha --timeout 60000 test/manageUsers.selenium.test.js
```

### CI Execution
Tests are automatically executed in GitHub Actions:
1. Setup test environment
2. Install dependencies
3. Configure headless Chrome
4. Run test suite
5. Collect results and artifacts

## Test Reports

### Artifacts Generated
1. Test Results
   - Test execution logs
   - Pass/fail statistics
   - Error details

2. Screenshots
   - Captured on test failure
   - Stored in test/screenshots
   - Named with test case and timestamp

3. Browser Logs
   - Chrome debug logs
   - Console output
   - Network requests

### Artifact Storage
- GitHub Actions artifacts
- Azure DevOps feed: WebAdminTests

## Best Practices

### Writing Tests
1. Follow AAA Pattern
   - Arrange: Set up test data
   - Act: Perform the test
   - Assert: Verify the results

2. Use Descriptive Names
```javascript
describe('Customer Management', function() {
    it('should display customer table with correct headers', async function() {
        // Test implementation
    });
});
```

3. Handle Asynchronous Operations
```javascript
// Use async/await for all Selenium operations
await driver.wait(until.elementLocated(By.id('customerTable')));
```

### Test Maintenance
1. Regular Updates
   - Keep dependencies current
   - Update selectors when UI changes
   - Review and update test data

2. Failure Analysis
   - Review screenshots
   - Check browser logs
   - Verify test environment

3. Performance Optimization
   - Use efficient selectors
   - Minimize wait times
   - Clean up test data

## Troubleshooting

### Common Issues
1. Element Not Found
   - Check element selectors
   - Verify element visibility
   - Adjust wait conditions

2. Timeout Errors
   - Increase timeout values
   - Check network conditions
   - Verify server responses

3. Browser Driver Issues
   - Update ChromeDriver
   - Check browser compatibility
   - Verify driver configuration

### Debug Tools
1. Screenshots
   - Captured automatically on failure
   - Used for visual verification
   - Stored in test/screenshots

2. Console Logs
   - Browser console output
   - Test execution logs
   - Error stack traces

3. Network Monitoring
   - API responses
   - Resource loading
   - Connection issues
