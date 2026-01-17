const prisma = require('../utils/prisma');
const { deleteFile } = require('../utils/fileHandler');

// Get all subcategories with filtering
exports.getAllSubcategories = async (req, res) => {
    try {
        const { search, restaurant_id, is_active, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { nameEn: { contains: search } },
                { nameAr: { contains: search } }
            ];
        }

        if (restaurant_id) {
            where.restaurantId = restaurant_id;
        }

        if (is_active !== undefined) {
            where.isActive = is_active === 'true';
        }

        const [subcategories, total] = await Promise.all([
            prisma.subcategory.findMany({
                where,
                include: {
                    restaurant: {
                        select: {
                            nameEn: true,
                            nameAr: true
                        }
                    }
                },
                orderBy: { id: 'desc' },
                skip,
                take
            }),
            prisma.subcategory.count({ where })
        ]);

        // Format response
        const formattedSubcategories = subcategories.map(sub => ({
            ...sub,
            restaurant_name: sub.restaurant?.nameEn || sub.restaurant?.nameAr
        }));

        res.json({
            success: true,
            data: {
                subcategories: formattedSubcategories,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get subcategory by ID
exports.getSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const subcategory = await prisma.subcategory.findUnique({
            where: { id },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true
                    }
                }
            }
        });

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        res.json({
            success: true,
            data: subcategory
        });
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create Subcategory
exports.createSubcategory = async (req, res) => {
    try {
        const { restaurant_id, name_en, name_ar, is_active } = req.body;

        if (!restaurant_id || !name_en || !name_ar) {
            return res.status(400).json({ success: false, message: 'Restaurant, Name (EN) and Name (AR) are required' });
        }

        const subcategory = await prisma.subcategory.create({
            data: {
                restaurantId: restaurant_id,
                nameEn: name_en,
                nameAr: name_ar,
                isActive: is_active !== undefined ? is_active : true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            data: subcategory
        });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update Subcategory
exports.updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurant_id, name_en, name_ar, is_active } = req.body;

        const existingSubcategory = await prisma.subcategory.findUnique({
            where: { id }
        });

        if (!existingSubcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        const updateData = {};
        if (restaurant_id !== undefined) updateData.restaurantId = restaurant_id;
        if (name_en !== undefined) updateData.nameEn = name_en;
        if (name_ar !== undefined) updateData.nameAr = name_ar;
        if (is_active !== undefined) updateData.isActive = is_active;

        const subcategory = await prisma.subcategory.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Subcategory updated successfully',
            data: subcategory
        });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Toggle Subcategory
exports.toggleSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        const subcategory = await prisma.subcategory.findUnique({
            where: { id }
        });

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        const updated = await prisma.subcategory.update({
            where: { id },
            data: { isActive: !subcategory.isActive }
        });

        res.json({
            success: true,
            message: `Subcategory ${updated.isActive ? 'activated' : 'deactivated'}`,
            data: updated
        });
    } catch (error) {
        console.error('Error toggling subcategory:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const subcategory = await prisma.subcategory.findUnique({
            where: { id },
            include: {
                products: { select: { id: true } }
            }
        });

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check if has products
        if (subcategory.products.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subcategory. ${subcategory.products.length} product(s) are using it.`
            });
        }

        // Delete subcategory
        await prisma.subcategory.delete({
            where: { id }
        });
        
        res.json({ success: true, message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
