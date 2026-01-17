const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    uploadRestaurantImages,
    uploadProductImages,
    uploadProductImage,
    uploadCategoryImage,
    uploadDriverImage,
    uploadUserAvatar,
    uploadOfferImage,
    uploadSplashImage,
    uploadOnboardingImage,
    handleUploadError
} = require('../middleware/upload.middleware');

// All routes require authentication
router.use(protect);

// Upload restaurant images (logo and banner)
// Processed by Sharp: Logo (400x400), Banner (1200x400), WebP format
router.post('/restaurant',
    authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER'),
    ...uploadRestaurantImages,
    handleUploadError,
    (req, res) => {
        try {
            const processedFiles = req.processedFiles || {};

            if (Object.keys(processedFiles).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Images uploaded and optimized successfully',
                data: processedFiles
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading images',
                error: error.message
            });
        }
    }
);

// Upload multiple product images
// Processed by Sharp: 800x800, WebP format
router.post('/product/multiple',
    authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER'),
    ...uploadProductImages,
    handleUploadError,
    (req, res) => {
        try {
            const processedFiles = req.processedFiles || [];

            if (processedFiles.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            res.json({
                success: true,
                message: `${processedFiles.length} image(s) uploaded and optimized successfully`,
                data: { images: processedFiles }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading images',
                error: error.message
            });
        }
    }
);

// Upload single product image
// Processed by Sharp: 800x800, WebP format
router.post('/product',
    authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER'),
    ...uploadProductImage,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Image uploaded and optimized successfully',
                data: { image: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading image',
                error: error.message
            });
        }
    }
);

// Upload category image
// Processed by Sharp: 300x300, WebP format
router.post('/category',
    authorize('SUPER_ADMIN'),
    ...uploadCategoryImage,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Image uploaded and optimized successfully',
                data: { image: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading image',
                error: error.message
            });
        }
    }
);

// Upload driver image
// Processed by Sharp: 400x400, WebP format
router.post('/driver',
    authorize('SUPER_ADMIN'),
    ...uploadDriverImage,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Image uploaded and optimized successfully',
                data: { image: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading image',
                error: error.message
            });
        }
    }
);

// Upload user avatar
// Processed by Sharp: 200x200, WebP format
router.post('/user/avatar',
    authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER', 'SUPPORT_AGENT', 'ANALYST'),
    ...uploadUserAvatar,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Avatar uploaded and optimized successfully',
                data: { avatar: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading avatar',
                error: error.message
            });
        }
    }
);

// Upload offer image
// Processed by Sharp: 1200x600, WebP format
router.post('/offer',
    authorize('SUPER_ADMIN'),
    ...uploadOfferImage,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Offer image uploaded and optimized successfully',
                data: { image: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading offer image',
                error: error.message
            });
        }
    }
);

// Upload splash screen image
// Processed by Sharp: 1080x1920 (Mobile vertical), WebP format
router.post('/splash',
    authorize('SUPER_ADMIN'),
    ...uploadSplashImage,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Splash screen image uploaded and optimized successfully',
                data: { image: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading splash image',
                error: error.message
            });
        }
    }
);

// Upload onboarding screen image
// Processed by Sharp: 1080x1920 (Mobile vertical), WebP format
router.post('/onboarding',
    authorize('SUPER_ADMIN'),
    ...uploadOnboardingImage,
    handleUploadError,
    (req, res) => {
        try {
            const processedFile = req.processedFile;

            if (!processedFile) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            res.json({
                success: true,
                message: 'Onboarding screen image uploaded and optimized successfully',
                data: { image: processedFile }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading onboarding image',
                error: error.message
            });
        }
    }
);

module.exports = router;
