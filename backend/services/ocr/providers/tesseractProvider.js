/**
 * Tesseract OCR Provider
 * Uses Tesseract.js for local OCR processing
 */

const Tesseract = require('tesseract.js');

class TesseractProvider {
    /**
     * Extract text from image buffer using Tesseract.js
     * @param {Buffer} imageBuffer - Image file buffer
     * @returns {Promise<string>} Extracted text
     */
    async extractText(imageBuffer) {
        try {
            console.log('Starting Tesseract OCR processing...');

            const result = await Tesseract.recognize(
                imageBuffer,
                'eng', // English only for now
                {
                    logger: info => {
                        // Log progress for debugging
                        if (info.status === 'recognizing text') {
                            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
                        }
                    }
                }
            );

            console.log('OCR processing complete');
            return result.data.text;
        } catch (error) {
            console.error('Tesseract OCR error:', error);
            throw new Error(`OCR processing failed: ${error.message}`);
        }
    }

    /**
     * Get supported MIME types for this provider
     * @returns {string[]} Array of supported MIME types
     */
    getSupportedTypes() {
        return [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/bmp',
            'image/tiff'
        ];
    }

    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getName() {
        return 'tesseract';
    }
}

module.exports = TesseractProvider;
