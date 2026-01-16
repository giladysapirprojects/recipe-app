# Future Features & Enhancements

This document tracks planned features and improvements for the Recipe App.

## Planned Features

### 1. Unit Conversion System
**Priority:** High  
**Description:** Add ability to convert between different measurement units

**Features:**
- **Weight Conversions:**
  - Pounds (lb) ↔ Grams (g)
  - Pounds (lb) ↔ Kilograms (kg)
  - Ounces (oz) ↔ Grams (g)
  
- **Volume Conversions:**
  - Cups ↔ Milliliters (ml)
  - Tablespoons (tbsp) ↔ Milliliters (ml)
  - Teaspoons (tsp) ↔ Milliliters (ml)
  - Fluid ounces (fl oz) ↔ Milliliters (ml)

**Implementation Ideas:**
- Add conversion utility functions in `utils.js`
- Add a dropdown or toggle button on ingredient display to switch units
- Store original unit in database, calculate conversions on the fly
- Consider user preference for default unit system (Metric/Imperial)

**Technical Considerations:**
- Need conversion tables/formulas
- Handle edge cases (different cup sizes by country)
- Consider precision/rounding for display

---

### 2. Import Recipe from URL
**Priority:** Medium  
**Description:** Parse and import recipe data from external recipe websites

**Features:**
- Paste URL to import recipe
- Auto-parse recipe title, ingredients, instructions, times
- Support common recipe websites (AllRecipes, Food Network, etc.)
- Handle HTML/metadata extraction
- Preview before saving

**Implementation Ideas:**
- Backend endpoint to fetch and parse URL
- Use recipe schema.org microdata/JSON-LD if available
- Fall back to HTML parsing for common patterns
- Frontend UI: URL input field in "Add Recipe" form
- Automatically populate form fields from parsed data

**Technical Considerations:**
- CORS issues - may need backend proxy
- Different website structures require different parsers
- Rate limiting/caching to avoid overloading external sites
- Error handling for unsupported sites

---

### 3. Theme System
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

### Image Upload (done ✅)
**Description:** Add photos to recipes

~~**Features:**~~
~~- File input in recipe form~~
~~- Image preview before saving~~
~~- Cloud storage (Cloudinary/S3)~~
~~- Display images in recipe cards and detail view~~

~~**Implementation:**~~
~~- Add file input to form~~
~~- Use FileReader API for preview~~
~~- Store in cloud with URL in `imageUrl` field~~

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

## Contributing Ideas
Have an idea for a new feature? Add it to this document or create an issue!

**Last Updated:** 2026-01-10
