# Future Features & Enhancements

This document tracks planned features and improvements for the Recipe App.

## Completed Features

### ✅ OCR Recipe Import from Images/PDFs (COMPLETED - February 2026)
**Status:** Implemented and ready for testing  
**Description:** Extract recipe data from images and PDF documents using OCR technology

**Implemented Features:**
- ✅ **Tesseract.js Integration**: Local OCR processing for images
- ✅ **PDF Text Extraction**: Support for text-based PDFs
- ✅ **Provider Abstraction Layer**: Easy switching between OCR providers (Tesseract, future: Cloudinary, Google Vision, AWS Textract)
- ✅ **Recipe Text Parser**: Heuristic pattern matching to extract title, ingredients, instructions, times, servings
- ✅ **Drag-and-Drop UI**: File upload with drag-and-drop support
- ✅ **File Type Validation**: Supports JPG, PNG, WebP, BMP, PDF (max 10MB)
- ✅ **Form Population**: Auto-fills recipe form for user review before saving
- ✅ **Error Handling**: Graceful failures with user-friendly messages

**Implementation:**
- Backend: OCR service (`services/ocr/`), Tesseract provider, text parser (`recipeTextParser.js`)
- API: `POST /api/recipes/import/ocr` endpoint with multer file upload
- Frontend: OCR import modal with drag-and-drop zone, file validation, status messages
- Dependencies: `tesseract.js`, `pdf-parse`

**Supported Files:**
- Images: JPEG, PNG, WebP, BMP
- PDFs: Text-based only (no image-based PDFs)

**Known Limitations:**
- OCR accuracy depends on image quality (best with clear, typed text)
- English language only
- Processing time: 5-10 seconds per image
- Users should review and edit imported data

**Future Migration:** 
- Architecture supports easy replacement with cloud OCR providers (Cloudinary, Google Vision, AWS Textract)
- Backend configuration: `export OCR_PROVIDER=cloudinary`

**Documentation:** See implementation walkthrough in artifacts

---

### ✅ Unit Conversion System (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Convert between metric and imperial measurement units when viewing recipes

**Implemented Features:**
- ✅ **Weight Conversions:** oz ↔ g, lbs ↔ kg
- ✅ **Volume Conversions:** cups ↔ ml, tbsp ↔ ml, tsp ↔ ml, fl oz ↔ ml
- ✅ **North American measurements:** 250ml cup, 15ml tbsp, 5ml tsp
- ✅ **Toggle button:** Segmented control in recipe detail modal
- ✅ **localStorage persistence:** User preference remembered
- ✅ **Smart handling:** Unconvertible units (e.g., "whole", "to taste") left as-is
- ✅ **Fractional support:** Parses quantities like "1/2", "1 1/4"

**Implementation:**
- Conversion utilities in `utils.js` (~290 lines)
- Segmented control toggle in recipe detail modal
- Real-time conversion when viewing recipes
- Original units preserved in database

---

### ✅ Flexible Category System (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Support both predefined and custom category values from imported recipes

**Implemented Features:**
- ✅ **Input with autocomplete:** Changed from fixed dropdown to flexible `<input>` with `<datalist>`
- ✅ **Dynamic datalist:** Automatically includes categories from saved recipes
- ✅ **Category normalization:** Parser maps common variations (e.g., "Mains" → "Main Course")
- ✅ **Backward compatibility:** Existing recipes unaffected
- ✅ **Filter updates:** Category filters dynamically update with custom categories

---

### ✅ Import Recipe from URL (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Parse and import recipe data from external recipe websites

**Implemented Features:**
- ✅ **Dual-strategy parsing:** JSON-LD structured data with HTML fallback
- ✅ **Smart unit normalization:** Converts various measurement formats
- ✅ **Comprehensive extraction:** Title, description, times, ingredients, instructions, tags, images
- ✅ **Source URL preservation:** Automatically captures and displays recipe source
- ✅ **Error handling:** User-friendly messages for invalid/unreachable URLs
- ✅ **Non-destructive import:** Populates form for user review before saving

---

### ✅ Image Upload (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Add photos to recipes

**Implemented Features:**
- ✅ File upload with validation (max 5MB, JPEG/PNG/GIF/WebP)
- ✅ Image preview before saving
- ✅ Local storage with automatic cleanup on recipe deletion
- ✅ Fallback emoji display for recipes without images

---

## Planned Features

### 1. Theme System
**Priority:** Low  
**Description:** Allow users to customize the app's color scheme

**Features:**
- Light/Dark mode toggle
- Multiple pre-defined color themes
- Custom color picker for primary/accent colors
- Save theme preference to localStorage
- Theme preview

**Implementation Ideas:**
- CSS custom properties (already using some in `main.css`)
- Theme configuration object with color palettes
- Theme switcher component in header
- Persist user choice in localStorage or user preferences table

**Themes to Consider:**
- Light (current default)
- Dark mode
- Warm/Cozy (browns, oranges)
- Fresh/Green (greens, natural tones)
- Ocean/Blue
- Custom (user-defined colors)

**Technical Considerations:**
- Reorganize CSS to use more CSS variables
- Ensure accessibility (contrast ratios)
- Test all components in different themes
- Consider system preference detection (`prefers-color-scheme`)

---

## Phase 2 Features (Near-term)

These features are planned for the next major release:

### Backend Integration
**Description:** Migrate from localStorage to a cloud database for multi-device sync

**Features:**
- User authentication (Firebase Auth or JWT)
- Cloud database (already using SQLite, easy to migrate to PostgreSQL)
- Multi-device sync
- User accounts and profiles

**Current Status:** Backend with SQLite already implemented ✅

---

### Favorites & Ratings
**Description:** Mark favorite recipes and rate them

**Features:**
- Star rating system (1-5 stars)
- Favorite toggle button
- Filter by favorites
- Sort by rating

**Data Model:**
- Add `isFavorite` boolean field
- Add `rating` number field (1-5)

---

### Print View
**Description:** Print-friendly recipe format

**Features:**
- Clean print layout (no navigation/buttons)
- Optimized for standard paper
- "Print Recipe" button
- Option to exclude images for ink savings

**Implementation:**
- CSS `@media print` queries
- Print-specific layout

---

## Phase 3 Features (Advanced)

These features require significant development and are planned for later:

### Meal Planning Calendar
**Description:** Plan meals in advance with a calendar interface

**Features:**
- Weekly/monthly calendar view
- Drag-and-drop recipe assignment
- Quick meal suggestions
- Export meal plan

**Data Model:**
- New `mealPlan` table with date + recipe associations
- Calendar UI component

---

### Shopping List Generation
**Description:** Auto-generate shopping lists from selected recipes

**Features:**
- Select multiple recipes
- Aggregate ingredient quantities
- Add/remove items manually
- Categorize by grocery section (produce, dairy, etc.)
- Export or print
- Check off items while shopping

**Implementation:**
- Ingredient aggregation logic
- Unit conversion for combining (2 cups + 1 cup = 3 cups)
- Shopping list data model

---

### Nutritional Information
**Description:** Display calorie and nutrition data

**Features:**
- Calories, protein, carbs, fat per serving
- Integration with nutrition API (Edamam, Spoonacular)
- Dietary labels (low-carb, high-protein, etc.)
- Nutritional goals tracking

**Implementation:**
- API integration for ingredient nutrition lookup
- Calculate per serving
- Display in recipe detail view

---

### Recipe Sharing & Export
**Description:** Share recipes with others

**Features:**
- Export to PDF (using jsPDF library)
- Generate shareable link
- Email recipe
- Social media sharing
- QR code generation

**Requirements:**
- Backend for shareable link generation
- PDF export library

---

## Other Potential Features

Feature ideas to consider for future development:

### Recipe Features
- [ ] Recipe scaling - Auto-adjust ingredient quantities for different serving sizes
- [ ] Recipe versioning - Track changes and revert to previous versions
- [ ] Recipe collections/books - Group recipes into cookbooks
- [ ] Recipe notes - Add personal modifications or tips
- [ ] Dietary filters - Vegetarian, vegan, gluten-free, etc.
- [ ] Difficulty level - Easy, medium, hard
- [ ] Cost estimate - Budget-friendly indicators

### Smart Features
- [ ] Voice input - Dictate recipes while cooking
- [ ] Built-in cooking timers - Set timers for each step
- [ ] Alexa/Google Home integration - Voice-controlled recipe reading
- [ ] Smart suggestions - Recipe recommendations based on available ingredients
- [ ] Seasonal recipes - Feature recipes by season
- [ ] Recipe search by ingredients - "What can I make with chicken and rice?"

### Collaboration Features
- [ ] Multi-user accounts - Family sharing
- [ ] Collaborative editing - Family members suggest changes
- [ ] Comments on recipes - Discuss modifications
- [ ] Recipe reviews - Rate and review family recipes
- [ ] Recipe history - See who made what and when

### Advanced UI/UX
- [ ] Multi-language support - Internationalization
- [ ] Offline mode - Progressive Web App (PWA)
- [ ] Recipe video attachments - Link YouTube videos
- [ ] Step-by-step mode - Cooking view with large text
- [ ] Ingredient substitutions - Suggest alternatives
- [ ] Mobile app - Native iOS/Android apps

---

## Completed Features

### ✅ Unit Conversion System (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Convert between metric and imperial measurement units when viewing recipes

**Implemented Features:**
- ✅ **Weight Conversions:** oz ↔ g, lbs ↔ kg
- ✅ **Volume Conversions:** cups ↔ ml, tbsp ↔ ml, tsp ↔ ml, fl oz ↔ ml
- ✅ **North American measurements:** 250ml cup, 15ml tbsp, 5ml tsp
- ✅ **Toggle button:** Segmented control in recipe detail modal
- ✅ **localStorage persistence:** User preference remembered
- ✅ **Smart handling:** Unconvertible units (e.g., "whole", "to taste") left as-is
- ✅ **Fractional support:** Parses quantities like "1/2", "1 1/4"

**Implementation:**
- Conversion utilities in `utils.js` (~290 lines)
- Segmented control toggle in recipe detail modal
- Real-time conversion when viewing recipes
- Original units preserved in database

**Documentation:** See [walkthrough](file:///../.gemini/antigravity/brain/b84c3aef-efda-4174-b340-bc56b0a250af/walkthrough.md)

---

### ✅ Flexible Category System (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Support both predefined and custom category values from imported recipes

**Implemented Features:**
- ✅ **Input with autocomplete:** Changed from fixed dropdown to flexible `<input>` with `<datalist>`
- ✅ **Dynamic datalist:** Automatically includes categories from saved recipes
- ✅ **Category normalization:** Parser maps common variations (e.g., "Mains" → "Main Course")
- ✅ **Backward compatibility:** Existing recipes unaffected
- ✅ **Filter updates:** Category filters dynamically update with custom categories

**Implementation:**
- Frontend: Category input field with datalist in `index.html`
- JavaScript: `updateCategoryDatalist()` function in `app.js`
- Backend: `mapCategory()` normalization in `parser.js`
- Tests: Selenium tests updated and passing

**Documentation:** See [custom_category_walkthrough.md](custom_category_walkthrough.md)

---

### ✅ Import Recipe from URL (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Parse and import recipe data from external recipe websites

**Implemented Features:**
- ✅ **Dual-strategy parsing:** JSON-LD structured data with HTML fallback
- ✅ **Smart unit normalization:** Converts various measurement formats
- ✅ **Comprehensive extraction:** Title, description, times, ingredients, instructions, tags, images
- ✅ **Source URL preservation:** Automatically captures and displays recipe source
- ✅ **Error handling:** User-friendly messages for invalid/unreachable URLs
- ✅ **Non-destructive import:** Populates form for user review before saving

**Implementation:**
- Backend: Parser service (`parser.js`) with axios and cheerio
- API: `POST /api/recipes/import` endpoint
- Frontend: Import modal with URL input and status handling
- Source URL fix: Parser passes original URL through parsing chain as fallback

**Documentation:** See [import_recipe_walkthrough.md](import_recipe_walkthrough.md)

**Known Limitations:** Site compatibility varies; best results with Schema.org JSON-LD markup

---

### ✅ Image Upload (COMPLETED - January 2026)
**Status:** Implemented and deployed  
**Description:** Add photos to recipes

**Implemented Features:**
- ✅ File input in recipe form
- ✅ Image preview before saving
- ✅ Local file storage in `frontend/assets/images/recipes/`
- ✅ Display images in recipe cards and detail view
- ✅ Emoji fallback (🍳) when no image uploaded

**Implementation:**
- Multer middleware for file uploads
- FileReader API for client-side preview
- Static file serving for uploaded images
- Image cleanup on recipe deletion

---

## Contributing Ideas

Have an idea for a new feature? Add it to this document or create an issue!

**Last Updated:** 2026-01-29
