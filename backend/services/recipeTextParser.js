/**
 * Recipe Text Parser
 * Parses plain text (from OCR or clipboard) into structured recipe data
 * 
 * This parser uses heuristic pattern matching to identify recipe sections
 * like ingredients, instructions, etc. from unstructured text.
 */

/**
 * Parse recipe from plain text
 * @param {string} text - Plain text containing recipe
 * @returns {Object} Structured recipe data
 */
function parseRecipeFromText(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid text provided for parsing');
    }

    const cleanText = text.trim();
    if (cleanText.length === 0) {
        throw new Error('No text content to parse');
    }

    // Debug: Log the raw text
    console.log('\n=== RAW OCR TEXT ===');
    console.log(cleanText);
    console.log('=== END RAW TEXT ===\n');

    const result = {
        title: extractTitle(cleanText),
        description: extractDescription(cleanText),
        category: 'Other', // Default category, user can change
        prepTime: extractTime(cleanText, 'prep'),
        cookTime: extractTime(cleanText, 'cook'),
        additionalTime: 0,
        servings: extractServings(cleanText),
        imageUrl: '', // No image from OCR
        sourceUrl: '', // No source URL from OCR
        ingredients: extractIngredients(cleanText),
        instructions: extractInstructions(cleanText),
        tags: []
    };

    // Debug: Log the parsed result
    console.log('\n=== PARSED RECIPE ===');
    console.log('Title:', result.title);
    console.log('Ingredients:', JSON.stringify(result.ingredients, null, 2));
    console.log('Instructions:', JSON.stringify(result.instructions, null, 2));
    console.log('=== END PARSED ===\n');

    return result;
}

/**
 * Extract recipe title from text
 * Usually the first line or a prominent heading
 * Skips OCR artifacts and noise
 */
function extractTitle(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) {
        return 'Untitled Recipe';
    }

    // Find first meaningful line (skip OCR artifacts)
    let titleLine = null;
    for (const line of lines) {
        // Skip very short lines (likely OCR noise)
        if (line.length < 3) continue;

        // Skip lines that are just special characters or numbers
        if (/^[^a-zA-Z]*$/.test(line)) continue;

        // Skip lines that look like OCR garbage (random mix of letters/symbols, all caps短 words)
        if (/^[A-Z]{2,}\s+[a-z]$/.test(line)) continue; // e.g. "CETTE a"
        if (line.split(/\s+/).every(word => word.length <= 2)) continue; // All tiny words

        // Skip common section headers
        if (/^(ingredients?|directions?|instructions?|method|steps?):?$/i.test(line)) continue;

        // This looks like a title
        titleLine = line;
        break;
    }

    if (!titleLine) {
        return 'Untitled Recipe';
    }

    // Remove common prefixes
    const title = titleLine
        .replace(/^(recipe:?\s*)/i, '')
        .replace(/^(title:?\s*)/i, '')
        .trim();

    return title || 'Untitled Recipe';
}

/**
 * Extract recipe description from text
 * Usually found before ingredients section
 */
function extractDescription(text) {
    const lines = text.split('\n').map(line => line.trim());

    // Look for lines after title but before ingredients
    const ingredientsIndex = lines.findIndex(line =>
        /^(ingredients?|what you need):?$/i.test(line)
    );

    if (ingredientsIndex > 1) {
        // Description is lines between title (0) and ingredients section
        const descriptionLines = lines.slice(1, ingredientsIndex)
            .filter(line => line.length > 0)
            .filter(line => !line.match(/^(prep|cook|total|serves?|yield)/i));

        return descriptionLines.join(' ').substring(0, 500); // Limit to 500 chars
    }

    return '';
}

/**
 * Extract time values (prep time, cook time) from text
 */
function extractTime(text, timeType) {
    const patterns = {
        'prep': /prep(?:\s+time)?:?\s*(\d+)\s*(min|minute|minutes|hr|hour|hours)/i,
        'cook': /cook(?:\s+time)?:?\s*(\d+)\s*(min|minute|minutes|hr|hour|hours)/i,
        'total': /total(?:\s+time)?:?\s*(\d+)\s*(min|minute|minutes|hr|hour|hours)/i
    };

    const pattern = patterns[timeType];
    if (!pattern) return 0;

    const match = text.match(pattern);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    // Convert to minutes
    if (unit.startsWith('hr') || unit.startsWith('hour')) {
        return value * 60;
    }

    return value;
}

/**
 * Extract servings/yield from text
 */
function extractServings(text) {
    // Patterns: "Serves 4", "Yield: 6 servings", "Makes 8"
    const patterns = [
        /serves?:?\s*(\d+)/i,
        /yield:?\s*(\d+)/i,
        /makes?:?\s*(\d+)/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseInt(match[1]);
        }
    }

    return 0;
}

/**
 * Extract ingredients list from text
 * Looks for "Ingredients" section and parses each line
 */
function extractIngredients(text) {
    const lines = text.split('\n').map(line => line.trim());

    // Find ingredients section
    const startIndex = lines.findIndex(line =>
        /^(ingredients?|what you need):?$/i.test(line)
    );

    if (startIndex === -1) {
        // No ingredients section found, try to parse entire text
        return parseIngredientLines(lines);
    }

    // Find where ingredients section ends (usually at instructions)
    const endIndex = lines.findIndex((line, idx) =>
        idx > startIndex && /^(instructions?|directions?|method|steps?|preparation):?$/i.test(line)
    );

    const ingredientLines = lines.slice(
        startIndex + 1,
        endIndex !== -1 ? endIndex : lines.length
    );

    return parseIngredientLines(ingredientLines);
}

/**
 * Parse individual ingredient lines
 */
function parseIngredientLines(lines) {
    const ingredients = [];

    for (const line of lines) {
        if (line.length === 0) continue;

        // Skip section headers
        if (/^(ingredients?|instructions?|directions?):?$/i.test(line)) continue;

        // Remove common list markers (bullets, dashes, asterisks, numbers)
        // Handles: •, -, *, ·, ◦, ▪, ▫, +, «, », and numbered lists like "1.", "1)"
        const cleanLine = line
            .replace(/^[•\-*·◦▪▫+«»]\s*/, '')  // Remove bullet points (including +, «, »)
            .replace(/^\d+[.):]\s*/, '')        // Remove numbered lists
            .trim();

        if (cleanLine.length === 0) continue;

        const ingredient = parseIngredientText(cleanLine);
        if (ingredient) {
            ingredients.push(ingredient);
        }
    }

    return ingredients;
}

/**
 * Parse individual ingredient text into quantity, unit, name
 * Similar to parser.js but more lenient for OCR text
 */
function parseIngredientText(text) {
    // Pattern: "QUANTITY UNIT INGREDIENT_NAME"
    // Examples: "2 cups flour", "1/2 teaspoon salt", "250g butter", "5 Tbs. butter"

    // Try to match quantity + unit (with optional period) + name
    // Unit can be letters optionally followed by a period (e.g., "Tbs.", "tsp.")
    const match = text.match(/^([\d\s\/\.]+)\s*([a-zA-Z]+\.?)?\s+(.+)$/);

    if (match) {
        return {
            quantity: match[1].trim(),
            unit: normalizeUnit(match[2]) || '',
            name: match[3].trim()
        };
    }

    // If no quantity found, treat entire text as ingredient name
    return {
        quantity: '',
        unit: '',
        name: text
    };
}

/**
 * Normalize unit names to match frontend dropdown
 */
function normalizeUnit(unit) {
    if (!unit) return '';

    // Remove trailing periods and normalize
    const normalized = unit.toLowerCase().trim().replace(/\.$/, '');

    const unitMap = {
        'cup': 'cups',
        'cups': 'cups',
        'c': 'cups',
        'tablespoon': 'tbsp',
        'tablespoons': 'tbsp',
        'tbsp': 'tbsp',
        'tbs': 'tbsp',
        'teaspoon': 'tsp',
        'teaspoons': 'tsp',
        'tsp': 'tsp',
        'ounce': 'oz',
        'ounces': 'oz',
        'oz': 'oz',
        'pound': 'lbs',
        'pounds': 'lbs',
        'lb': 'lbs',
        'lbs': 'lbs',
        'gram': 'g',
        'grams': 'g',
        'g': 'g',
        'kilogram': 'kg',
        'kilograms': 'kg',
        'kg': 'kg',
        'milliliter': 'ml',
        'milliliters': 'ml',
        'ml': 'ml',
        'liter': 'l',
        'liters': 'l',
        'l': 'l'
    };

    return unitMap[normalized] || normalized;
}

/**
 * Extract instructions from text
 * Looks for "Instructions" section and parses each step
 */
function extractInstructions(text) {
    const lines = text.split('\n').map(line => line.trim());

    // Find instructions section
    const startIndex = lines.findIndex(line =>
        /^(instructions?|directions?|method|steps?|preparation):?$/i.test(line)
    );

    if (startIndex === -1) {
        // No instructions section found
        // If we found ingredients, everything after might be instructions
        const ingredientsIndex = lines.findIndex(line =>
            /^(ingredients?|what you need):?$/i.test(line)
        );

        if (ingredientsIndex !== -1) {
            // Look for the end of ingredients
            const afterIngredients = lines.slice(ingredientsIndex + 1);
            const instructionsStart = afterIngredients.findIndex(line =>
                !line.match(/^[-•*\d]/) && line.length > 20 // Likely instruction not ingredient
            );

            if (instructionsStart !== -1) {
                return parseInstructionLines(afterIngredients.slice(instructionsStart));
            }
        }

        return [];
    }

    const instructionLines = lines.slice(startIndex + 1);
    return parseInstructionLines(instructionLines);
}

/**
 * Parse individual instruction lines
 * Splits on paragraphs (double line breaks) or numbered/bulleted steps
 */
function parseInstructionLines(lines) {
    const instructions = [];
    let currentParagraph = '';
    let lastLineWasEmpty = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.length === 0) {
            // Empty line - potential paragraph break
            lastLineWasEmpty = true;
            continue;
        }

        // Skip section headers (Notes, Tips, etc.)
        if (/^(notes?|tips?|nutrition|source):?$/i.test(line)) {
            break; // Stop at notes/tips section
        }

        // Remove common list markers (including + and «)
        const cleanLine = line
            .replace(/^[•\-*·◦▪▫+«»]\s*/, '')  // Remove bullet points  
            .replace(/^\d+[.):]\s*/, '')        // Remove numbered lists
            .trim();

        if (cleanLine.length === 0) continue;

        // Check if this is a new paragraph/step:
        // 1. Previous line was empty (paragraph break)
        // 2. Original line had a bullet or number (explicit step marker)
        const isNewStep = lastLineWasEmpty || line.match(/^[•\-*·◦▪▫+«»]\s*/) || line.match(/^\d+[.):]\s*/);

        if (isNewStep && currentParagraph.trim().length > 0) {
            // Save current paragraph and start new one
            instructions.push(currentParagraph.trim());
            currentParagraph = cleanLine;
        } else if (currentParagraph.length > 0) {
            // Continue current paragraph on same line (add space)
            currentParagraph += ' ' + cleanLine;
        } else {
            // Start new paragraph
            currentParagraph = cleanLine;
        }

        lastLineWasEmpty = false;
    }

    // Add final paragraph
    if (currentParagraph.trim().length > 0) {
        instructions.push(currentParagraph.trim());
    }

// DISABLED:     // If we only got one giant instruction, try to split it intelligently
// DISABLED:     // Split on sentence patterns that indicate new steps: ". [Capital letter]" 
// DISABLED:     if (instructions.length === 1 && instructions[0].length > 200) {
// DISABLED:         const text = instructions[0];
// DISABLED:         const newInstructions = [];
// DISABLED: 
// DISABLED:         // Split on period followed by space and capital letter (new sentence)
// DISABLED:         // But keep common abbreviations together (Tbs., tsp., etc.)
// DISABLED:         const parts = text.split(/\.\s+(?=[A-Z])/);
// DISABLED: 
// DISABLED:         for (let i = 0; i < parts.length; i++) {
// DISABLED:             let part = parts[i].trim();
// DISABLED:             if (part.length > 0) {
// DISABLED:                 // Add back the period if it was removed by split, unless it's the last part
// DISABLED:                 if (i < parts.length - 1) {
// DISABLED:                     part += '.';
// DISABLED:                 }
// DISABLED:                 newInstructions.push(part);
// DISABLED:             }
// DISABLED:         }
// DISABLED:         return newInstructions.filter(inst => inst.length > 0);
// DISABLED:     }

    return instructions;
}

module.exports = {
    parseRecipeFromText
};
