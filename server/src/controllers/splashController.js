const prisma = require('../utils/prisma');
const { deleteFile } = require('../utils/fileHandler');

// Get all splash screens
exports.getAllSplashScreens = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [splashScreens, total] = await Promise.all([
            prisma.splashScreen.findMany({
                orderBy: { sortOrder: 'asc' },
                skip,
                take
            }),
            prisma.splashScreen.count()
        ]);

        res.json({
            success: true,
            data: {
                splashScreens,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get splash screens error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching splash screens',
            error: error.message
        });
    }
};

// Get active splash screens (for mobile app)
exports.getActiveSplashScreens = async (req, res) => {
    try {
        const splashScreens = await prisma.splashScreen.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        res.json({
            success: true,
            data: { splashScreens }
        });
    } catch (error) {
        console.error('Get active splash screens error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active splash screens',
            error: error.message
        });
    }
};

// Get splash screen by ID
exports.getSplashScreenById = async (req, res) => {
    try {
        const { id } = req.params;

        const splashScreen = await prisma.splashScreen.findUnique({
            where: { id }
        });

        if (!splashScreen) {
            return res.status(404).json({
                success: false,
                message: 'Splash screen not found'
            });
        }

        res.json({
            success: true,
            data: splashScreen
        });
    } catch (error) {
        console.error('Get splash screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching splash screen',
            error: error.message
        });
    }
};

// Create splash screen
exports.createSplashScreen = async (req, res) => {
    try {
        const { image_url, duration, sort_order, is_active } = req.body;

        if (!image_url) {
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        const splashScreen = await prisma.splashScreen.create({
            data: {
                image: image_url,
                duration: duration ? parseInt(duration) : 3000,
                sortOrder: sort_order ? parseInt(sort_order) : 0,
                isActive: is_active !== undefined ? is_active : true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Splash screen created successfully',
            data: splashScreen
        });
    } catch (error) {
        console.error('Create splash screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating splash screen',
            error: error.message
        });
    }
};

// Update splash screen
exports.updateSplashScreen = async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, duration, sort_order, is_active } = req.body;

        const existing = await prisma.splashScreen.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Splash screen not found'
            });
        }

        // Delete old image if new one is provided
        if (image_url && image_url !== existing.image) {
            if (existing.image && existing.image.startsWith('/uploads/')) {
                deleteFile(existing.image);
            }
        }

        const updateData = {};
        if (image_url !== undefined) updateData.image = image_url;
        if (duration !== undefined) updateData.duration = parseInt(duration);
        if (sort_order !== undefined) updateData.sortOrder = parseInt(sort_order);
        if (is_active !== undefined) updateData.isActive = is_active;

        const splashScreen = await prisma.splashScreen.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Splash screen updated successfully',
            data: splashScreen
        });
    } catch (error) {
        console.error('Update splash screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating splash screen',
            error: error.message
        });
    }
};

// Delete splash screen
exports.deleteSplashScreen = async (req, res) => {
    try {
        const { id } = req.params;

        const splashScreen = await prisma.splashScreen.findUnique({
            where: { id }
        });

        if (!splashScreen) {
            return res.status(404).json({
                success: false,
                message: 'Splash screen not found'
            });
        }

        // Delete splash screen
        await prisma.splashScreen.delete({
            where: { id }
        });

        // Delete image file
        if (splashScreen.image && splashScreen.image.startsWith('/uploads/')) {
            deleteFile(splashScreen.image);
        }

        res.json({
            success: true,
            message: 'Splash screen deleted successfully'
        });
    } catch (error) {
        console.error('Delete splash screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting splash screen',
            error: error.message
        });
    }
};

// Toggle splash screen active status
exports.toggleSplashScreen = async (req, res) => {
    try {
        const { id } = req.params;

        const splashScreen = await prisma.splashScreen.findUnique({
            where: { id }
        });

        if (!splashScreen) {
            return res.status(404).json({
                success: false,
                message: 'Splash screen not found'
            });
        }

        const updated = await prisma.splashScreen.update({
            where: { id },
            data: { isActive: !splashScreen.isActive }
        });

        res.json({
            success: true,
            message: `Splash screen ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updated
        });
    } catch (error) {
        console.error('Toggle splash screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling splash screen',
            error: error.message
        });
    }
};

