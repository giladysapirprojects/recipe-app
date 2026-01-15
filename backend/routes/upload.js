/**
 * Upload Routes
 * API endpoints for file uploads (images)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =============================================================================
// STORAGE CONFIGURATION
// =============================================================================
// NOTE: This uses local file storage. To migrate to cloud storage (Cloudinary/S3),
// replace this multer.diskStorage configuration with cloud SDK storage.
// The upload directory is in the frontend assets folder so images are accessible
// to the frontend application.

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../frontend/assets/images/recipes');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: recipe-timestamp-originalname
        const timestamp = Date.now();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `recipe-${timestamp}-${sanitizedName}`);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// =============================================================================
// UPLOAD ENDPOINT
// =============================================================================

/**
 * POST /api/upload/image
 * Upload a single image file
 * Returns the URL path to access the uploaded image
 */
router.post('/image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Return the URL path to access the image (frontend will use this)
        const imageUrl = `/assets/images/recipes/${req.file.filename}`;

        res.json({
            success: true,
            data: {
                imageUrl: imageUrl,
                filename: req.file.filename,
                size: req.file.size
            },
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image',
            message: error.message
        });
    }
});

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large',
                message: 'Maximum file size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Upload error',
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid file',
            message: err.message
        });
    }

    next();
});

module.exports = router;
