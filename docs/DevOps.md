# Kubadu Admin Dashboard - DevOps Documentation

## Table of Contents
1. [Overview](#overview)
2. [Development](#development)
3. [Testing](#testing)
4. [Continuous Integration](#continuous-integration)
5. [Continuous Deployment](#continuous-deployment)
6. [Monitoring](#monitoring)
7. [Infrastructure](#infrastructure)

## Overview

The Kubadu Admin Dashboard follows a comprehensive DevOps lifecycle that includes automated testing, continuous integration, and deployment to both GitHub Pages and Azure DevOps artifacts.

### Technology Stack
- **Frontend**: HTML, JavaScript, CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Testing**: Selenium WebDriver, Mocha
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages
- **Artifact Storage**: Azure DevOps Artifacts

## Development

### Local Development Setup
1. Clone the repository:
```bash
git clone https://github.com/ST10208656/Kubadu-Services-Web.git
cd Kubadu-Services-Web
```

2. Install dependencies:
```bash
npm install
```

3. Install global dependencies:
```bash
npm install -g mocha chromedriver
```

### Branch Strategy
- Main development branch: `webAdminBranch`
- Feature branches: Create from `webAdminBranch` with format `feature/[feature-name]`
- Bug fixes: Create from `webAdminBranch` with format `fix/[bug-name]`

## Testing

### Test Framework
The project uses a comprehensive testing setup with:
- Selenium WebDriver for UI automation
- Mocha as the test runner
- Chrome WebDriver for browser automation

### Test Structure
Located in `/test` directory:
- `manageUsers.selenium.test.js`: User management interface tests
- `testSetup.js`: Test environment configuration

### Running Tests Locally
1. Start ChromeDriver:
```bash
chromedriver --port=4444
```

2. Run tests:
```bash
npx mocha --timeout 60000 test/*.selenium.test.js
```

### Test Coverage
Current test suite covers:
1. Customer Management:
   - Table display verification
   - Modal interactions
   - Form submissions
   - Adding new customers

2. Employee Management:
   - Table display verification
   - Modal interactions
   - Form submissions
   - Adding new employees

## Continuous Integration

### GitHub Actions Workflow
Located in `.github/workflows/web-admin-ci-cd.yml`

#### Trigger Events
- Push to `webAdminBranch`
- Manual trigger via workflow_dispatch

#### CI Steps
1. **Setup**:
   - Checkout code
   - Cache Node modules
   - Set up Node.js environment

2. **Test Environment**:
   - Install dependencies
   - Configure ChromeDriver
   - Set up Xvfb for headless testing

3. **Testing**:
   - Run Selenium tests
   - Capture screenshots
   - Generate test reports

4. **Artifact Collection**:
   - Upload test results
   - Capture failure logs
   - Store Chrome debug logs

## Continuous Deployment

### GitHub Pages Deployment
Automatically deploys the `public_html` directory to GitHub Pages.

#### Deployment Process
1. Triggered after successful tests
2. Configures GitHub Pages environment
3. Uploads static content
4. Deploys to GitHub Pages URL

### Azure DevOps Integration

#### Artifact Publishing
1. Downloads test artifacts
2. Prepares artifact directory
3. Publishes to Azure DevOps feed:
   - Feed: WebAdminTests
   - Name: selenium-test-results
   - Version: Dynamic based on GitHub run number

#### Authentication
- Uses Azure DevOps PAT stored in GitHub Secrets
- Configures Azure CLI with organization and project settings

## Monitoring

### Test Results Monitoring
- Test results available in GitHub Actions runs
- Screenshots captured for failed tests
- Chrome debug logs for troubleshooting

### Deployment Monitoring
- GitHub Pages deployment status in Actions
- Azure DevOps artifact publishing status
- Concurrent deployment protection

## Infrastructure

### Required Secrets
Configure these in GitHub repository settings:
- `AZURE_DEVOPS_PAT`: Personal Access Token for Azure DevOps
- `AZURE_DEVOPS_ORG`: Azure DevOps organization URL
- `AZURE_DEVOPS_PROJECT`: Azure DevOps project name

### Environment Variables
Set in workflow:
- `CI`: true for CI environment
- `NODE_ENV`: test for test environment
- `DISPLAY`: :99 for Xvfb
- `SELENIUM_REMOTE_URL`: http://localhost:4444

### Dependencies
Key dependencies and versions:
- Node.js: v20
- Mocha: Latest
- ChromeDriver: Latest
- Selenium WebDriver: Latest compatible version

## Best Practices

### Security
1. Secrets Management:
   - Use GitHub Secrets for sensitive data
   - No hardcoded credentials
   - Regular PAT rotation

2. Access Control:
   - Limited repository access
   - Protected branches
   - Required reviews

### Code Quality
1. Testing Requirements:
   - All new features require tests
   - Maintain test coverage
   - Regular test maintenance

2. Review Process:
   - Code review required
   - Test results verification
   - Documentation updates

### Deployment
1. Staging Process:
   - Automated tests must pass
   - Manual review of test results
   - Concurrent deployment protection

2. Rollback Strategy:
   - Previous versions preserved
   - Quick rollback process
   - Artifact versioning
