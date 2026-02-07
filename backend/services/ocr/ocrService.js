/**
 * OCR Service Manager
 * Manages OCR provider selection and text extraction from images/PDFs
 * 
 * This abstraction layer allows easy switching between OCR providers
 * (Tesseract.js, Cloudinary, Google Vision, AWS Textract, etc.)
 */

const TesseractProvider = require('./providers/tesseractProvider');
const CloudinaryProvider = require('./providers/cloudinaryProvider');
const pdfParse = require('pdf-parse');

class OCRService {
    /**
     * Create OCR service with specified provider
     * @param {string} providerName - Provider to use ('tesseract' or 'cloudinary')
     */
    constructor(providerName = 'tesseract') {
        this.provider = this.loadProvider(providerName);
        console.log(`OCR Service initialized with provider: ${this.provider.getName()}`);
    }

    /**
     * Load OCR provider by name
     * @param {string} name - Provider name
     * @returns {Object} Provider instance
     */
    loadProvider(name) {
        const providers = {
            'tesseract': TesseractProvider,
            'cloudinary': CloudinaryProvider
        };

        const ProviderClass = providers[name.toLowerCase()];
        if (!ProviderClass) {
            throw new Error(
                `Unknown OCR provider: ${name}. Available providers: ${Object.keys(providers).join(', ')}`
            );
        }

        return new ProviderClass();
    }

    /**
     * Extract text from file (image or PDF)
     * @param {Buffer} fileBuffer - File buffer
     * @param {string} mimeType - MIME type of file
     * @returns {Promise<string>} Extracted text
     */
    async extractTextFromFile(fileBuffer, mimeType) {
        // Handle PDF files separately (text extraction without OCR)
        if (mimeType === 'application/pdf') {
            return await this.extractTextFromPDF(fileBuffer);
        }

        // Validate file type is supported by provider
        if (!this.provider.getSupportedTypes().includes(mimeType)) {
            throw new Error(
                `File type ${mimeType} is not supported by ${this.provider.getName()} provider. ` +
                `Supported types: ${this.provider.getSupportedTypes().join(', ')}`
            );
        }

        // Extract text using OCR provider
        return await this.provider.extractText(fileBuffer);
    }

    /**
     * Extract text from PDF (text-based only, no OCR)
     * @param {Buffer} pdfBuffer - PDF file buffer
     * @returns {Promise<string>} Extracted text
     */
    async extractTextFromPDF(pdfBuffer) {
        try {
            console.log('Extracting text from PDF...');
            const data = await pdfParse(pdfBuffer);

            if (!data.text || data.text.trim().length === 0) {
                throw new Error(
                    'Could not extract text from PDF. ' +
                    'This PDF may be image-based and require OCR, which is not supported yet.'
                );
            }

            console.log(`Extracted ${data.text.length} characters from PDF`);
            return data.text;
        } catch (error) {
            console.error('PDF text extraction error:', error);
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }

    /**
     * Get currently active provider name
     * @returns {string} Provider name
     */
    getProviderName() {
        return this.provider.getName();
    }

    /**
     * Get supported file types for current provider
     * @returns {string[]} Array of supported MIME types
     */
    getSupportedTypes() {
        // Include PDF support in addition to provider's types
        const types = [...this.provider.getSupportedTypes()];
        if (!types.includes('application/pdf')) {
            types.push('application/pdf');
        }
        return types;
    }
}

module.exports = OCRService;
