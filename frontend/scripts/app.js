/* ============================================
   Recipe App - Main Application Logic (API Version)
   ============================================ */

import { loadRecipes, addRecipe, updateRecipe, deleteRecipe, getRecipeById, checkServerHealth } from './storage.js';
import {
  generateId,
  formatTime,
  getCategories,
  validateRecipe,
  debounce,
  convertIngredient,
  getUnitSystem
} from './utils.js';

// Application State
let recipes = [];
let filteredRecipes = [];
let currentCategory = 'All';
let currentRecipeId = null; // For edit mode
let currentUnitSystem = localStorage.getItem('preferredUnitSystem') || 'metric';

// DOM Elements
const recipeGrid = document.getElementById('recipeGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const addRecipeBtn = document.getElementById('addRecipeBtn');

// Modal elements
const recipeDetailModal = document.getElementById('recipeDetailModal');
const recipeFormModal = document.getElementById('recipeFormModal');
const importUrlModal = document.getElementById('importUrlModal');
const recipeForm = document.getElementById('recipeForm');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
});

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    // Check server health
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
      showError('Cannot connect to backend server. Make sure it\'s running on http://localhost:3000');
      return;
    }

    // Load recipes from API
    recipes = await loadRecipes();
    filteredRecipes = recipes;
    renderCategoryFilters();
    updateCategoryDatalist(); // Populate category suggestions with custom categories
    renderRecipeList();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load recipes. Check console for details.');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search input
  searchInput.addEventListener('input', debounce((e) => {
    handleSearch(e.target.value);
  }, 300));

  // Add recipe button
  addRecipeBtn.addEventListener('click', showAddRecipeForm);

  // Import recipe button and modal handlers
  document.getElementById('importRecipeBtn').addEventListener('click', showImportUrlModal);
  document.getElementById('importUrlBtn').addEventListener('click', handleImportUrl);
  document.getElementById('recipeUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleImportUrl();
    }
  });

  // Recipe form submission
  recipeForm.addEventListener('submit', handleRecipeSubmit);

  // Modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Modal overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Dynamic ingredient/instruction buttons
  document.getElementById('addIngredientBtn').addEventListener('click', addIngredientField);
  document.getElementById('addInstructionBtn').addEventListener('click', addInstructionField);

  // Image upload handlers
  document.getElementById('recipeImage').addEventListener('change', handleImageSelection);
  document.getElementById('removeImageBtn').addEventListener('click', removeImage);
}

/**
 * Render category filter chips
 */
function renderCategoryFilters() {
  const categories = getCategories(recipes);

  categoryFilters.innerHTML = categories.map(category => `
    <button 
      class="category-chip ${category === currentCategory ? 'active' : ''}"
      data-category="${category}"
      onclick="handleCategoryFilter('${category}')"
    >
      ${category}
    </button>
  `).join('');
}

/**
 * Update category datalist with unique categories from recipes
 * Combines predefined categories with custom categories from existing recipes
 */
function updateCategoryDatalist() {
  const datalist = document.getElementById('categoryOptions');
  if (!datalist) return;

  const existingCategories = new Set();

  // Add predefined categories
  const predefined = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Beverage'];
  predefined.forEach(cat => existingCategories.add(cat));

  // Add categories from existing recipes (excluding 'All' and 'Other')
  recipes.forEach(recipe => {
    if (recipe.category && recipe.category !== 'All' && recipe.category !== 'Other') {
      existingCategories.add(recipe.category);
    }
  });

  // Update datalist with sorted unique categories
  datalist.innerHTML = Array.from(existingCategories)
    .sort()
    .map(cat => `<option value="${cat}">`)
    .join('\n');
}

/**
 * Handle category filter
 */
window.handleCategoryFilter = async function (category) {
  currentCategory = category;
  await filterRecipes();
  renderCategoryFilters();
};

/**
 * Handle search
 */
async function handleSearch(query) {
  try {
    // Use API search directly
    const searchResults = await loadRecipes({ search: query, category: currentCategory });
    filteredRecipes = searchResults;
    renderRecipeList();
  } catch (error) {
    console.error('Search failed:', error);
    showError('Search failed. Please try again.');
  }
}

/**
 * Filter recipes by current category
 */
async function filterRecipes() {
  try {
    const searchQuery = searchInput.value;
    const results = await loadRecipes({ search: searchQuery, category: currentCategory });
    filteredRecipes = results;
    renderRecipeList();
  } catch (error) {
    console.error('Filter failed:', error);
    showError('Filter failed. Please try again.');
  }
}

/**
 * Render recipe list
 */
function renderRecipeList() {
  if (filteredRecipes.length === 0) {
    recipeGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  recipeGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');

  recipeGrid.innerHTML = filteredRecipes.map(recipe => createRecipeCard(recipe)).join('');
}

/**
 * Create recipe card HTML
 */
function createRecipeCard(recipe) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0) + (recipe.additionalTime || 0);

  // Use background-image for uploaded images, emoji for fallback
  const imageStyle = recipe.imageUrl
    ? `style="background-image: url('${recipe.imageUrl}');"`
    : '';

  return `
    <div class="recipe-card" onclick="showRecipeDetail('${recipe.id}')">
      <div class="recipe-card-image" ${imageStyle}>
        ${!recipe.imageUrl ? '🍳' : ''}
      </div>
      <div class="recipe-card-content">
        <h3 class="recipe-card-title">${recipe.title}</h3>
        <p class="recipe-card-description">${recipe.description || ''}</p>
        
        <div class="recipe-card-meta">
          ${totalTime > 0 ? `
            <div class="recipe-card-meta-item">
              <span>⏱️</span>
              <span>${formatTime(totalTime)}</span>
            </div>
          ` : ''}
          ${recipe.servings ? `
            <div class="recipe-card-meta-item">
              <span>👥</span>
              <span>${recipe.servings} servings</span>
            </div>
          ` : ''}
        </div>
        
        ${recipe.tags && recipe.tags.length > 0 ? `
          <div class="recipe-card-tags">
            ${recipe.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Show recipe detail modal
 */
window.showRecipeDetail = async function (recipeId) {
  try {
    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
      console.error('Recipe not found:', recipeId);
      showError('Recipe not found');
      return;
    }

    const modalBody = recipeDetailModal.querySelector('.modal-body');

    // Use background-image for uploaded images, emoji for fallback
    const imageStyle = recipe.imageUrl
      ? `style="background-image: url('${recipe.imageUrl}');"`
      : '';

    modalBody.innerHTML = `
      <div class="recipe-detail-image" ${imageStyle}>
        ${!recipe.imageUrl ? '🍳' : ''}
      </div>
      
      <h2 class="mb-4">${recipe.title}</h2>
      
      ${recipe.description ? `<p class="mb-6">${recipe.description}</p>` : ''}
      
      <div class="recipe-meta-grid">
        ${recipe.prepTime ? `
          <div class="recipe-meta-item">
            <div class="recipe-meta-label">Prep Time</div>
            <div class="recipe-meta-value">${formatTime(recipe.prepTime)}</div>
          </div>
        ` : ''}
        ${recipe.cookTime ? `
          <div class="recipe-meta-item">
            <div class="recipe-meta-label">Cook Time</div>
            <div class="recipe-meta-value">${formatTime(recipe.cookTime)}</div>
          </div>
        ` : ''}
        ${recipe.additionalTime ? `
          <div class="recipe-meta-item">
            <div class="recipe-meta-label">Additional Time</div>
            <div class="recipe-meta-value">${formatTime(recipe.additionalTime)}</div>
          </div>
        ` : ''}
        ${recipe.servings ? `
          <div class="recipe-meta-item">
            <div class="recipe-meta-label">Servings</div>
            <div class="recipe-meta-value">${recipe.servings}</div>
          </div>
        ` : ''}
        <div class="recipe-meta-item">
          <div class="recipe-meta-label">Category</div>
          <div class="recipe-meta-value">${recipe.category}</div>
        </div>
      </div>
      
      ${recipe.sourceUrl ? `
        <div class="mb-6">
          <div class="recipe-meta-label">Source</div>
          <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer" class="source-link">
            ${recipe.sourceUrl}
          </a>
        </div>
      ` : ''}
      
      ${recipe.tags && recipe.tags.length > 0 ? `
        <div class="recipe-card-tags mb-6">
          ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="unit-toggle-container" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
        <h3 class="recipe-section-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">Ingredients</h3>
        <div class="segmented-control" role="group" aria-label="Unit system selector">
          <button id="metricBtn" class="segment-btn ${currentUnitSystem === 'metric' ? 'active' : ''}" data-unit-system="metric">
            Metric
          </button>
          <button id="imperialBtn" class="segment-btn ${currentUnitSystem === 'imperial' ? 'active' : ''}" data-unit-system="imperial">
            Imperial
          </button>
        </div>
      </div>
      
      <ul class="ingredients-list">
        ${recipe.ingredients.map(ing => {
      // Try to convert ingredient to current unit system
      const converted = convertIngredient(ing, currentUnitSystem);
      const quantity = converted ? converted.quantity : ing.quantity;
      const unit = converted ? converted.unit : ing.unit;

      return `
          <li class="ingredient-item">
            <span><strong>${quantity}${unit ? ' ' + unit : ''}</strong> ${ing.name}</span>
          </li>
          `;
    }).join('')}
      </ul>
      
      <h3 class="recipe-section-title">Instructions</h3>
      <ol class="instructions-list">
        ${recipe.instructions.map(instruction => `
          <li class="instruction-item">${instruction}</li>
        `).join('')}
      </ol>
      
      <div class="recipe-actions">
        <button class="btn btn-primary" onclick="showEditRecipeForm('${recipe.id}')">
          ✏️ Edit Recipe
        </button>
        <button class="btn btn-danger" onclick="handleDeleteRecipe('${recipe.id}', event)">
          🗑️ Delete Recipe
        </button>
      </div>
    `;

    // Re-attach event listeners for the toggle buttons in the modal
    recipeDetailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Attach click handlers to the newly created buttons
    const metricBtn = document.getElementById('metricBtn');
    const imperialBtn = document.getElementById('imperialBtn');

    if (metricBtn) {
      metricBtn.addEventListener('click', () => handleUnitSystemChange('metric'));
    }
    if (imperialBtn) {
      imperialBtn.addEventListener('click', () => handleUnitSystemChange('imperial'));
    }
  } catch (error) {
    console.error('Failed to load recipe:', error);
    showError('Failed to load recipe details');
  }
};

// ============================================
// Import Recipe from URL
// ============================================

/**
 * Show import URL modal
 */
function showImportUrlModal() {
  importUrlModal.classList.remove('hidden');

  // Reset form
  document.getElementById('recipeUrl').value = '';

  // Hide any previous status messages
  const importStatus = document.getElementById('importStatus');
  importStatus.classList.add('hidden');

  // Focus on URL input
  setTimeout(() => {
    document.getElementById('recipeUrl').focus();
  }, 100);
}

/**
 * Handle import URL
 */
async function handleImportUrl() {
  const urlInput = document.getElementById('recipeUrl');
  const url = urlInput.value.trim();
  const importBtn = document.getElementById('importUrlBtn');

  // Validate URL
  if (!url) {
    showImportStatus('error', 'Please enter a recipe URL');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showImportStatus('error', 'Please enter a valid URL starting with http:// or https://');
    return;
  }

  // Show loading state
  showImportStatus('loading', 'Importing recipe... This may take a few seconds.');
  importBtn.disabled = true;
  importBtn.textContent = '⏳ Importing...';

  try {
    // Call backend import endpoint
    const response = await fetch('http://localhost:3000/api/recipes/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to import recipe');
    }

    // Success! Close import modal, open form, then populate with data
    importUrlModal.classList.add('hidden');
    showAddRecipeForm();
    populateFormWithImportedData(result.data);

  } catch (error) {
    console.error('Import error:', error);
    showImportStatus('error', error.message || 'Failed to import recipe. Please try a different URL.');
  } finally {
    // Reset button state
    importBtn.disabled = false;
    importBtn.textContent = '🔍 Import Recipe';
  }
}

/**
 * Show import status message
 */
function showImportStatus(type, message) {
  const importStatus = document.getElementById('importStatus');
  const statusContent = importStatus.querySelector('.status-content');

  importStatus.classList.remove('hidden', 'status-loading', 'status-error', 'status-success');
  importStatus.classList.add(`status-${type}`);

  if (type === 'loading') {
    statusContent.innerHTML = `
      <div class="spinner"></div>
      <span>${message}</span>
    `;
  } else {
    const icon = type === 'error' ? '⚠️' : '✅';
    statusContent.innerHTML = `<span>${icon} ${message}</span>`;
  }
}

/**
 * Populate form with imported recipe data
 */
function populateFormWithImportedData(data) {
  // Basic fields
  document.getElementById('recipeTitle').value = data.title || '';
  document.getElementById('recipeDescription').value = data.description || '';
  document.getElementById('recipeCategory').value = data.category || 'Other';
  document.getElementById('recipePrepTime').value = data.prepTime || '';
  document.getElementById('recipeCookTime').value = data.cookTime || '';
  document.getElementById('recipeAdditionalTime').value = data.additionalTime || '';
  document.getElementById('recipeServings').value = data.servings || '';
  document.getElementById('recipeSourceUrl').value = data.sourceUrl || '';

  // Tags
  if (data.tags && data.tags.length > 0) {
    document.getElementById('recipeTags').value = data.tags.join(', ');
  }

  // Clear existing ingredients and instructions
  document.getElementById('ingredientsList').innerHTML = '';
  document.getElementById('instructionsList').innerHTML = '';

  // Add ingredients
  if (data.ingredients && data.ingredients.length > 0) {
    data.ingredients.forEach(ingredient => {
      addIngredientField(ingredient);
    });
  } else {
    // Add one empty field if no ingredients
    addIngredientField();
  }

  // Add instructions
  if (data.instructions && data.instructions.length > 0) {
    data.instructions.forEach(instruction => {
      addInstructionField(instruction);
    });
  } else {
    // Add one empty field if no instructions
    addInstructionField();
  }

  // Handle image URL if provided
  if (data.imageUrl && data.imageUrl.startsWith('http')) {
    // Store the external image URL in the hidden field
    document.getElementById('existingImageUrl').value = data.imageUrl;

    // Show preview of the external image
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    imagePreview.src = data.imageUrl;
    imagePreviewContainer.classList.remove('hidden');
  }
}

/**
 * Show add recipe form
 */
function showAddRecipeForm() {
  currentRecipeId = null;
  recipeForm.reset();

  // Clear dynamic fields
  document.getElementById('ingredientsList').innerHTML = '';
  document.getElementById('instructionsList').innerHTML = '';

  // Add initial fields
  addIngredientField();
  addInstructionField();

  // Clear image preview
  removeImage();

  document.getElementById('formTitle').textContent = 'Add New Recipe';
  recipeFormModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * Show edit recipe form
 */
window.showEditRecipeForm = async function (recipeId) {
  closeAllModals();

  try {
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
      showError('Recipe not found');
      return;
    }

    currentRecipeId = recipeId;

    // Populate form fields
    document.getElementById('recipeTitle').value = recipe.title;
    document.getElementById('recipeDescription').value = recipe.description || '';
    document.getElementById('recipeCategory').value = recipe.category;
    document.getElementById('recipeTags').value = recipe.tags ? recipe.tags.join(', ') : '';
    document.getElementById('recipePrepTime').value = recipe.prepTime || '';
    document.getElementById('recipeCookTime').value = recipe.cookTime || '';
    document.getElementById('recipeAdditionalTime').value = recipe.additionalTime || '';
    document.getElementById('recipeServings').value = recipe.servings || '';
    document.getElementById('recipeSourceUrl').value = recipe.sourceUrl || '';

    // Handle existing image
    const existingImageUrl = document.getElementById('existingImageUrl');
    const preview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const fileInput = document.getElementById('recipeImage');

    fileInput.value = ''; // Clear file input

    if (recipe.imageUrl) {
      existingImageUrl.value = recipe.imageUrl;
      preview.src = recipe.imageUrl;
      previewContainer.classList.remove('hidden');
    } else {
      existingImageUrl.value = '';
      preview.src = '';
      previewContainer.classList.add('hidden');
    }

    // Clear and populate ingredients
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach(ing => {
      addIngredientField(ing);
    });

    // Clear and populate instructions
    const instructionsList = document.getElementById('instructionsList');
    instructionsList.innerHTML = '';
    recipe.instructions.forEach(inst => {
      addInstructionField(inst);
    });

    document.getElementById('formTitle').textContent = 'Edit Recipe';
    recipeFormModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (error) {
    console.error('Failed to load recipe for editing:', error);
    showError('Failed to load recipe for editing');
  }
};

/**
 * Add ingredient field
 */
function addIngredientField(ingredient = null) {
  // Handle case where this is called from a button click (receives event object)
  if (ingredient && ingredient instanceof Event) {
    ingredient = null;
  }

  const ingredientsList = document.getElementById('ingredientsList');
  const div = document.createElement('div');
  div.className = 'ingredient-row';

  // Determine which unit should be selected
  const selectedUnit = ingredient?.unit || 'unit';

  div.innerHTML = `
    <div class="form-group">
      <input 
        type="text" 
        class="form-input ingredient-quantity" 
        placeholder="Qty"
        value="${ingredient ? ingredient.quantity || '' : ''}"
      >
    </div>
    <div class="form-group">
      <select class="form-select ingredient-unit" required>
        <optgroup label="Volume/Liquid">
          <option value="cups" ${selectedUnit === 'cups' ? 'selected' : ''}>cups</option>
          <option value="tbsp" ${selectedUnit === 'tbsp' ? 'selected' : ''}>tbsp</option>
          <option value="tsp" ${selectedUnit === 'tsp' ? 'selected' : ''}>tsp</option>
          <option value="fl oz" ${selectedUnit === 'fl oz' ? 'selected' : ''}>fl oz</option>
          <option value="ml" ${selectedUnit === 'ml' ? 'selected' : ''}>ml</option>
        </optgroup>
        <optgroup label="Weight - Metric">
          <option value="g" ${selectedUnit === 'g' ? 'selected' : ''}>g</option>
          <option value="kg" ${selectedUnit === 'kg' ? 'selected' : ''}>kg</option>
        </optgroup>
        <optgroup label="Weight - Imperial">
          <option value="oz" ${selectedUnit === 'oz' ? 'selected' : ''}>oz</option>
          <option value="lbs" ${selectedUnit === 'lbs' ? 'selected' : ''}>lbs</option>
        </optgroup>
        <optgroup label="Count">
          <option value="unit" ${selectedUnit === 'unit' ? 'selected' : ''}>unit</option>
        </optgroup>
      </select>
    </div>
    <div class="form-group">
      <input 
        type="text" 
        class="form-input ingredient-name" 
        placeholder="Ingredient name"
        value="${ingredient ? ingredient.name || '' : ''}"
        required
      >
    </div>
    <button type="button" class="btn btn-icon btn-secondary" onclick="this.parentElement.remove()">
      ✕
    </button>
  `;
  ingredientsList.appendChild(div);
}

/**
 * Add instruction field
 */
function addInstructionField(instruction = null) {
  // Handle case where this is called from a button click (receives event object)
  if (instruction && instruction instanceof Event) {
    instruction = null;
  }

  const instructionsList = document.getElementById('instructionsList');
  const div = document.createElement('div');
  div.className = 'instruction-row';
  div.innerHTML = `
    <div class="form-group">
      <textarea 
        class="form-input instruction-text" 
        placeholder="Instruction step"
        rows="2"
        required
      >${instruction || ''}</textarea>
    </div>
    <button type="button" class="btn btn-icon btn-secondary" onclick="this.parentElement.remove()">
      ✕
    </button>
  `;
  instructionsList.appendChild(div);
}

/**
 * Handle image file selection
 */
function handleImageSelection(e) {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
    e.target.value = '';
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    alert('File is too large. Maximum file size is 5MB.');
    e.target.value = '';
    return;
  }

  // Show preview using FileReader API
  const reader = new FileReader();
  reader.onload = (event) => {
    const preview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');

    preview.src = event.target.result;
    previewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

/**
 * Remove selected image
 */
function removeImage() {
  const fileInput = document.getElementById('recipeImage');
  const preview = document.getElementById('imagePreview');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const existingImageUrl = document.getElementById('existingImageUrl');

  // Clear file input
  fileInput.value = '';

  // Clear preview
  preview.src = '';
  previewContainer.classList.add('hidden');

  // Clear existing image URL (for edit mode)
  existingImageUrl.value = '';
}

/**
 * Upload image to server
 * Returns the image URL or empty string if no image
 */
async function uploadImage() {
  const fileInput = document.getElementById('recipeImage');
  const file = fileInput.files[0];

  // If no new file selected, return existing image URL (for edit mode)
  if (!file) {
    const existingImageUrl = document.getElementById('existingImageUrl').value;
    return existingImageUrl || '';
  }

  // Upload new image
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.data.imageUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
}


/**
 * Handle recipe form submission
 */
async function handleRecipeSubmit(e) {
  e.preventDefault();

  // Collect form data
  const formData = {
    title: document.getElementById('recipeTitle').value.trim(),
    description: document.getElementById('recipeDescription').value.trim(),
    category: document.getElementById('recipeCategory').value,
    tags: document.getElementById('recipeTags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== ''),
    prepTime: parseInt(document.getElementById('recipePrepTime').value) || 0,
    cookTime: parseInt(document.getElementById('recipeCookTime').value) || 0,
    additionalTime: parseInt(document.getElementById('recipeAdditionalTime').value) || 0,
    servings: parseInt(document.getElementById('recipeServings').value) || 0,
    ingredients: [],
    instructions: [],
    imageUrl: '',
    sourceUrl: document.getElementById('recipeSourceUrl').value.trim(),
    notes: ''
  };

  // Collect ingredients
  document.querySelectorAll('.ingredient-row').forEach(row => {
    const quantity = row.querySelector('.ingredient-quantity').value.trim();
    const unit = row.querySelector('.ingredient-unit').value.trim();
    const name = row.querySelector('.ingredient-name').value.trim();

    if (name) {
      formData.ingredients.push({ quantity, unit, name });
    }
  });

  // Collect instructions
  document.querySelectorAll('.instruction-row').forEach(row => {
    const text = row.querySelector('.instruction-text').value.trim();
    if (text) {
      formData.instructions.push(text);
    }
  });

  // Validate
  const validation = validateRecipe(formData);
  if (!validation.valid) {
    alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
    return;
  }

  // Upload image if selected (or get existing image URL)
  try {
    formData.imageUrl = await uploadImage();
  } catch (error) {
    alert('Error uploading image: ' + error.message);
    return;
  }

  // Save recipe
  try {
    if (currentRecipeId) {
      await updateRecipe(currentRecipeId, formData);
    } else {
      formData.id = generateId();
      await addRecipe(formData);
    }

    closeAllModals();
    recipes = await loadRecipes();
    await filterRecipes();
    renderCategoryFilters();
    updateCategoryDatalist(); // Update category suggestions with any new custom categories
  } catch (error) {
    console.error('Error saving recipe:', error);
    showError('Error saving recipe. Please try again.');
  }
}

/**
 * Handle delete recipe
 */
window.handleDeleteRecipe = async function (recipeId, event) {
  // Prevent event from bubbling to modal overlay
  if (event) {
    event.stopPropagation();
  }

  try {
    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
      showError('Recipe not found');
      return;
    }

    if (confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      const success = await deleteRecipe(recipeId);

      if (success) {
        closeAllModals();
        recipes = await loadRecipes();
        await filterRecipes();
        renderCategoryFilters();
      } else {
        showError('Error deleting recipe. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    showError('Error deleting recipe. Please try again.');
  }
};

/**
 * Close all modals
 */
function closeAllModals() {
  recipeDetailModal.classList.add('hidden');
  recipeFormModal.classList.add('hidden');
  importUrlModal.classList.add('hidden');
  document.body.style.overflow = '';
}

/**
 * Show error message to user
 */
function showError(message) {
  alert('Error: ' + message);
  console.error(message);
}

/**
 * Handle unit system change
 */
function handleUnitSystemChange(system) {
  currentUnitSystem = system;
  localStorage.setItem('preferredUnitSystem', system);
  updateSegmentedControl();

  // Re-render recipe detail if it's currently open
  const recipeDetailModal = document.getElementById('recipeDetailModal');
  if (!recipeDetailModal.classList.contains('hidden')) {
    // Find the current recipe ID from the edit button
    const editButton = recipeDetailModal.querySelector('button[onclick*="showEditRecipeForm"]');
    if (editButton) {
      const onclick = editButton.getAttribute('onclick');
      const match = onclick.match(/showEditRecipeForm\('([^']+)'\)/);
      if (match) {
        const recipeId = match[1];
        window.showRecipeDetail(recipeId);
      }
    }
  }
}

/**
 * Update segmented control button states
 */
function updateSegmentedControl() {
  const metricBtn = document.getElementById('metricBtn');
  const imperialBtn = document.getElementById('imperialBtn');

  metricBtn.classList.toggle('active', currentUnitSystem === 'metric');
  imperialBtn.classList.toggle('active', currentUnitSystem === 'imperial');
}
