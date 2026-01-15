# Test Fixtures

This directory contains test data for the Selenium automated tests.

## Test Images

The following images are used to test image upload functionality:

- **test-recipe.jpg** - JPEG format test image (chocolate chip cookie)
- **test-recipe.png** - PNG format test image (garden salad)
- **test-recipe.gif** - GIF format test image (pancake stack)
- **test-recipe.webp** - WebP format test image (gourmet burger)

All test images are under 5MB to meet the application's file size requirements.

## Adding More Test Files

To add additional test fixtures:

1. Place the file in this directory
2. Update the test configuration in `../config.js` if needed
3. Reference the file in your test using `path.resolve(__dirname, 'fixtures', 'filename')`

## Notes

- Test images were generated specifically for automated testing
- Images are not actual recipe photos but are representative of food photography
- These files should not be included in production builds
