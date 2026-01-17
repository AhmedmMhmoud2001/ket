const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
    'uploads/restaurants/logos',
    'uploads/restaurants/banners',
    'uploads/products',
    'uploads/categories',
    'uploads/drivers',
    'uploads/users/avatars',
    'uploads/offers',
    'uploads/splash',
    'uploads/onboarding',
    'uploads/temp' // Temporary storage before processing
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for temporary upload
const storage = multer.memoryStorage(); // Store in memory for Sharp processing

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max before compression
    }
});

/**
 * Process and save image using Sharp
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} destination - Destination folder
 * @param {string} filename - Base filename
 * @param {Object} options - Resize options
 * @returns {Promise<string>} - Saved file path
 */
const processImage = async (buffer, destination, filename, options = {}) => {
    const {
        width = null,
        height = null,
        quality = 80,
        fit = 'cover'
    } = options;

    // Generate filename with .webp extension
    const webpFilename = filename.replace(/\.[^.]+$/, '') + '.webp';
    const outputPath = path.join(destination, webpFilename);

    let sharpInstance = sharp(buffer);

    // Resize if dimensions provided
    if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
            fit: fit, // 'cover', 'contain', 'fill', 'inside', 'outside'
            withoutEnlargement: true
        });
    }

    // Convert to WebP with compression
    await sharpInstance
        .webp({ quality: quality })
        .toFile(outputPath);

    // Return relative path
    return outputPath.replace(/\\/g, '/').replace('uploads/', '/uploads/');
};

// Middleware to process restaurant images
exports.uploadRestaurantImages = [
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            const files = req.files;
            const processedFiles = {};

            // Process logo
            if (files.logo && files.logo[0]) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `logo-${uniqueSuffix}`;
                
                processedFiles.logo = await processImage(
                    files.logo[0].buffer,
                    'uploads/restaurants/logos',
                    filename,
                    { width: 400, height: 400, quality: 85, fit: 'cover' }
                );
            }

            // Process banner
            if (files.banner && files.banner[0]) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `banner-${uniqueSuffix}`;
                
                processedFiles.banner = await processImage(
                    files.banner[0].buffer,
                    'uploads/restaurants/banners',
                    filename,
                    { width: 1200, height: 400, quality: 85, fit: 'cover' }
                );
            }

            req.processedFiles = processedFiles;
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing images',
                error: error.message
            });
        }
    }
];

// Middleware to process product images
exports.uploadProductImages = [
    upload.array('product_images', 5),
    async (req, res, next) => {
        try {
            const files = req.files;
            const processedFiles = [];

            if (files && files.length > 0) {
                for (const file of files) {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const filename = `product-${uniqueSuffix}`;
                    
                    const processedPath = await processImage(
                        file.buffer,
                        'uploads/products',
                        filename,
                        { width: 800, height: 800, quality: 85, fit: 'cover' }
                    );
                    
                    processedFiles.push(processedPath);
                }
            }

            req.processedFiles = processedFiles;
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing images',
                error: error.message
            });
        }
    }
];

// Middleware to process single product image
exports.uploadProductImage = [
    upload.single('product_image'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `product-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/products',
                    filename,
                    { width: 800, height: 800, quality: 85, fit: 'cover' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing image',
                error: error.message
            });
        }
    }
];

// Middleware to process category image
exports.uploadCategoryImage = [
    upload.single('category_image'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `category-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/categories',
                    filename,
                    { width: 300, height: 300, quality: 85, fit: 'cover' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing image',
                error: error.message
            });
        }
    }
];

// Middleware to process driver image
exports.uploadDriverImage = [
    upload.single('driver_image'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `driver-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/drivers',
                    filename,
                    { width: 400, height: 400, quality: 85, fit: 'cover' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing image',
                error: error.message
            });
        }
    }
];

// Middleware to process user avatar
exports.uploadUserAvatar = [
    upload.single('avatar'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `avatar-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/users/avatars',
                    filename,
                    { width: 200, height: 200, quality: 85, fit: 'cover' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing avatar',
                error: error.message
            });
        }
    }
];

// Middleware to process offer image
exports.uploadOfferImage = [
    upload.single('offer_image'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `offer-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/offers',
                    filename,
                    { width: 1200, height: 600, quality: 90, fit: 'cover' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing offer image',
                error: error.message
            });
        }
    }
];

// Middleware to process splash screen image
exports.uploadSplashImage = [
    upload.single('splash_image'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `splash-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/splash',
                    filename,
                    { width: 1080, height: 1920, quality: 90, fit: 'cover' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing splash image',
                error: error.message
            });
        }
    }
];

// Middleware to process onboarding screen image
exports.uploadOnboardingImage = [
    upload.single('onboarding_image'),
    async (req, res, next) => {
        try {
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `onboarding-${uniqueSuffix}`;
                
                const processedPath = await processImage(
                    req.file.buffer,
                    'uploads/onboarding',
                    filename,
                    { width: 1080, height: 1920, quality: 90, fit: 'contain' }
                );
                
                req.processedFile = processedPath;
            }
            next();
        } catch (error) {
            console.error('Image processing error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing onboarding image',
                error: error.message
            });
        }
    }
];

// Error handler for multer
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB (will be compressed).'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};
