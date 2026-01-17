const prisma = require('../utils/prisma');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const { search, is_active, type, page = 1, limit = 100 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { nameAr: { contains: search } },
                { nameEn: { contains: search } }
            ];
        }

        if (is_active !== undefined) {
            where.isActive = is_active === 'true';
        }

        if (type) {
            where.type = type.toUpperCase();
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                orderBy: { nameEn: 'asc' },
                skip,
                take
            }),
            prisma.category.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                categories,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { nameAr, nameEn, type, isActive } = req.body;

        if (!nameAr || !nameEn || !type) {
            return res.status(400).json({
                success: false,
                message: 'Please provide nameAr, nameEn and type'
            });
        }

        const category = await prisma.category.create({
            data: {
                nameAr,
                nameEn,
                type: type.toUpperCase(),
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                restaurants: {
                    select: { id: true, nameEn: true }
                }
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameAr, nameEn, type, isActive } = req.body;

        const updateData = {};
        if (nameAr !== undefined) updateData.nameAr = nameAr;
        if (nameEn !== undefined) updateData.nameEn = nameEn;
        if (type !== undefined) updateData.type = type.toUpperCase();
        if (isActive !== undefined) updateData.isActive = isActive;

        const category = await prisma.category.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, message: 'Category updated successfully', data: category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.category.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category (likely has related data)',
            error: error.message
        });
    }
};
