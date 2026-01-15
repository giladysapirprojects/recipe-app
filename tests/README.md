# Selenium Automated Tests

Comprehensive automated testing suite for the Recipe Storage Application using Selenium WebDriver.

## Overview

This test suite provides automated browser testing for all major features of the recipe app **without requiring macOS screen capture permissions**. Tests run using Chrome WebDriver and can execute in headless or visible mode.

## Features

✅ Recipe CRUD operations (Create, Read, Update, Delete)  
✅ Search and filter functionality  
✅ Form validation  
✅ Image upload for all supported formats (JPEG, PNG, GIF, WebP)  
✅ Headless execution (no visible browser)  
✅ Screenshot capture on test failures  
✅ Detailed test reporting  

## Prerequisites

- Node.js 18+ and npm
- Chrome browser installed
- Recipe app backend running on `http://localhost:3000`
- Recipe app frontend running on `http://localhost:8000`

## Installation

```bash
cd tests
npm install
```

This will install:
- `selenium-webdriver` - Browser automation framework
- `chromedriver` - Chrome browser driver for macOS

## Running Tests

### Run All Tests (Headless)
```bash
npm test
```

### Run All Tests (Visible Browser)
```bash
npm run test:visible
```

### Run Individual Test Suites
```bash
# CRUD operations only
npm run test:crud

# Search and filter only
npm run test:search

# Form validation only
npm run test:validation

# Image upload only
npm run test:images
```

## Test Suites

### 1. Recipe CRUD Operations (`recipe-crud.test.js`)
- ✅ Create recipe with default emoji image (🍳)
- ✅ View recipe details
- ✅ Edit recipe
- ✅ Delete recipe

### 2. Search & Filter (`search-filter.test.js`)
- ✅ Search by recipe title
- ✅ Search by ingredient
- ✅ Filter by category
- ✅ Clear filters

### 3. Form Validation (`form-validation.test.js`)
- ✅ Required field: Title
- ✅ Required field: Category
- ✅ Required field: Ingredients
- ✅ Required field: Instructions

### 4. Image Upload (`image-upload.test.js`)
- ✅ Upload valid JPEG image
- ✅ Upload valid PNG image
- ✅ Upload valid GIF image
- ✅ Upload valid WebP image
- ✅ Remove uploaded image
- ✅ Verify file input attributes

## Configuration

Edit `config.js` to customize:
- Frontend/backend URLs
- Browser settings (headless mode)
- Timeouts and wait durations
- Test data
- Screenshot settings

## Test Data

Sample test images are provided in the `fixtures/` directory for all supported formats:
- `test-recipe.jpg` - JPEG format
- `test-recipe.png` - PNG format
- `test-recipe.gif` - GIF format
- `test-recipe.webp` - WebP format

## Directory Structure

```
tests/
├── package.json           # Dependencies and scripts
├── config.js             # Test configuration
├── utils.js              # Shared utilities
├── run-tests.js          # Main test runner
├── recipe-crud.test.js   # CRUD operations tests
├── search-filter.test.js # Search/filter tests
├── form-validation.test.js # Validation tests
├── image-upload.test.js  # Image upload tests
├── screenshots/          # Auto-generated on failures
└── fixtures/             # Test data files
    ├── test-recipe.jpg
    ├── test-recipe.png
    ├── test-recipe.gif
    └── test-recipe.webp
```

## Writing New Tests

1. Create a new test file: `feature-name.test.js`
2. Import utilities:
   ```javascript
   const { setupDriver, clickElement, assert, runTest } = require('./utils');
   ```
3. Follow the existing test pattern
4. Add to `run-tests.js` if creating a new suite

## Troubleshooting

### Tests fail with "connection refused"
- Ensure backend is running: `cd backend && npm start`
- Ensure frontend is running: `cd frontend && python3 -m http.server 8000`

### Chrome driver issues
- Update chromedriver: `npm update chromedriver`
- Check Chrome browser version matches driver

### Tests timeout
- Increase timeouts in `config.js`
- Check if app is responding slowly

### Screenshots not saving
- Check `config.SAVE_SCREENSHOTS_ON_FAILURE` is true
- Ensure `screenshots/` directory is writable

## Why No Screen Capture Permissions?

Selenium controls the browser through **WebDriver APIs**, not screen recording:
- Interacts with DOM elements directly
- Reads page content via browser internals
- Takes screenshots via browser APIs (not screen capture)
- No macOS screen recording permissions required ✅

## CI/CD Integration

These tests can run in continuous integration:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd backend && npm start &
    cd frontend && python3 -m http.server 8000 &
    cd tests && npm install && npm test
```

## License

MIT
