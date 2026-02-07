/**
 * Cloudinary OCR Provider (Placeholder)
 * Future implementation for Cloudinary AI OCR
 * 
 * To implement:
 * 1. Install cloudinary SDK: npm install cloudinary
 * 2. Configure with API credentials
 * 3. Use cloudinary.uploader.upload with ocr: true option
 * 4. Extract text from response
 */

class CloudinaryProvider {
    /**
     * Extract text from image using Cloudinary OCR
     * @param {Buffer} imageBuffer - Image file buffer
     * @returns {Promise<string>} Extracted text
     */
    async extractText(imageBuffer) {
        throw new Error(
            'Cloudinary OCR provider not yet implemented. ' +
            'Please use Tesseract provider or implement Cloudinary integration.'
        );

        // Future implementation:
        // const cloudinary = require('cloudinary').v2;
        // const result = await cloudinary.uploader.upload(imageBuffer, {
        //     ocr: 'adv_ocr',
        //     resource_type: 'auto'
        // });
        // return result.info.ocr.adv_ocr.data[0].textAnnotations[0].description;
    }

    /**
     * Get supported MIME types
     * @returns {string[]} Array of supported MIME types
     */
    getSupportedTypes() {
        return [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/bmp',
            'image/tiff',
            'application/pdf' // Cloudinary supports PDF OCR
        ];
    }

    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getName() {
        return 'cloudinary';
    }
}

module.exports = CloudinaryProvider;
