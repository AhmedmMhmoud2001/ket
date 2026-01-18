const prisma = require('../utils/prisma');
const { deleteFile } = require('../utils/fileHandler');

// Get all onboarding screens
exports.getAllOnboardingScreens = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [screens, total] = await Promise.all([
            prisma.onboardingScreen.findMany({
                orderBy: { sortOrder: 'asc' },
                skip,
                take
            }),
            prisma.onboardingScreen.count()
        ]);

        res.json({
            success: true,
            data: {
                screens,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get onboarding screens error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching onboarding screens',
            error: error.message
        });
    }
};

// Get active onboarding screens (for mobile app)
exports.getActiveOnboardingScreens = async (req, res) => {
    try {
        const screens = await prisma.onboardingScreen.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        res.json({
            success: true,
            data: { screens }
        });
    } catch (error) {
        console.error('Get active onboarding screens error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active onboarding screens',
            error: error.message
        });
    }
};

// Get onboarding screen by ID
exports.getOnboardingScreenById = async (req, res) => {
    try {
        const { id } = req.params;

        const screen = await prisma.onboardingScreen.findUnique({
            where: { id }
        });

        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Onboarding screen not found'
            });
        }

        res.json({
            success: true,
            data: screen
        });
    } catch (error) {
        console.error('Get onboarding screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching onboarding screen',
            error: error.message
        });
    }
};

// Create onboarding screen
exports.createOnboardingScreen = async (req, res) => {
    try {
        const {
            title,
            title_ar,
            description,
            description_ar,
            image_url,
            sort_order,
            is_active
        } = req.body;

        if (!title || !description || !image_url) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and image are required'
            });
        }

        const screen = await prisma.onboardingScreen.create({
            data: {
                id: require('crypto').randomUUID(),
                title,
                titleAr: title_ar || null,
                description,
                descriptionAr: description_ar || null,
                image: image_url,
                sortOrder: sort_order ? parseInt(sort_order) : 0,
                isActive: is_active !== undefined ? is_active : true,
                updatedAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            message: 'Onboarding screen created successfully',
            data: screen
        });
    } catch (error) {
        console.error('Create onboarding screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating onboarding screen',
            error: error.message
        });
    }
};

// Update onboarding screen
exports.updateOnboardingScreen = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            title_ar,
            description,
            description_ar,
            image_url,
            sort_order,
            is_active
        } = req.body;

        const existing = await prisma.onboardingScreen.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Onboarding screen not found'
            });
        }

        // Delete old image if new one is provided
        if (image_url && image_url !== existing.image) {
            if (existing.image && existing.image.startsWith('/uploads/')) {
                deleteFile(existing.image);
            }
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (title_ar !== undefined) updateData.titleAr = title_ar;
        if (description !== undefined) updateData.description = description;
        if (description_ar !== undefined) updateData.descriptionAr = description_ar;
        if (image_url !== undefined) updateData.image = image_url;
        if (sort_order !== undefined) updateData.sortOrder = parseInt(sort_order);
        if (is_active !== undefined) updateData.isActive = is_active;

        const screen = await prisma.onboardingScreen.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Onboarding screen updated successfully',
            data: screen
        });
    } catch (error) {
        console.error('Update onboarding screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating onboarding screen',
            error: error.message
        });
    }
};

// Delete onboarding screen
exports.deleteOnboardingScreen = async (req, res) => {
    try {
        const { id } = req.params;

        const screen = await prisma.onboardingScreen.findUnique({
            where: { id }
        });

        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Onboarding screen not found'
            });
        }

        // Delete screen
        await prisma.onboardingScreen.delete({
            where: { id }
        });

        // Delete image file
        if (screen.image && screen.image.startsWith('/uploads/')) {
            deleteFile(screen.image);
        }

        res.json({
            success: true,
            message: 'Onboarding screen deleted successfully'
        });
    } catch (error) {
        console.error('Delete onboarding screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting onboarding screen',
            error: error.message
        });
    }
};

// Toggle onboarding screen active status
exports.toggleOnboardingScreen = async (req, res) => {
    try {
        const { id } = req.params;

        const screen = await prisma.onboardingScreen.findUnique({
            where: { id }
        });

        if (!screen) {
            return res.status(404).json({
                success: false,
                message: 'Onboarding screen not found'
            });
        }

        const updated = await prisma.onboardingScreen.update({
            where: { id },
            data: {
                isActive: !screen.isActive,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: `Onboarding screen ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updated
        });
    } catch (error) {
        console.error('Toggle onboarding screen error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling onboarding screen',
            error: error.message
        });
    }
};

