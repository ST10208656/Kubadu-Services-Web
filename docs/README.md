# Kubadu Admin Dashboard Documentation

## Documentation Structure

### 1. DevOps Documentation
[DevOps.md](DevOps.md) - Complete DevOps lifecycle documentation including:
- Development workflow
- Testing strategy
- CI/CD pipeline
- Deployment process
- Infrastructure setup
- Best practices

### 2. Testing Documentation
[Testing.md](Testing.md) - Comprehensive testing documentation covering:
- Test architecture
- Test suites
- Test execution
- Reports and artifacts
- Troubleshooting guide
- Best practices

## Quick Start

### Setting Up Development Environment
1. Clone the repository
2. Install dependencies
3. Configure test environment
4. Run local tests

### Running Tests
```bash
# Install dependencies
npm install

# Start ChromeDriver
chromedriver --port=4444

# Run tests
npx mocha --timeout 60000 test/*.selenium.test.js
```

### Deployment
The project uses GitHub Actions for automated deployment:
1. Push to `webAdminBranch`
2. Tests run automatically
3. On success, deploys to GitHub Pages
4. Test artifacts published to Azure DevOps

## Contributing
1. Create feature branch from `webAdminBranch`
2. Add tests for new features
3. Submit pull request
4. Ensure CI passes

## Support
For issues or questions:
1. Check troubleshooting guides in [Testing.md](Testing.md)
2. Review GitHub Actions logs
3. Check Azure DevOps artifacts
