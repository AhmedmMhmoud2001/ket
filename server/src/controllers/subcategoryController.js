const prisma = require('../utils/prisma');
const { deleteFile } = require('../utils/fileHandler');

// Get all subcategories with filtering
exports.getAllSubcategories = async (req, res) => {
    try {
        const { search, category_id, is_active, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { nameEn: { contains: search } },
                { nameAr: { contains: search } }
            ];
        }

        if (category_id) {
            where.categoryId = category_id;
        }

        if (is_active !== undefined) {
            where.isActive = is_active === 'true';
        }

        const [subcategories, total] = await Promise.all([
            prisma.subcategory.findMany({
                where,
                include: {
                    category: {
                        select: {
                            nameEn: true,
                            nameAr: true
                        }
                    }
                },
                orderBy: { sortOrder: 'asc' },
                skip,
                take
            }),
            prisma.subcategory.count({ where })
        ]);

        // Format response
        const formattedSubcategories = subcategories.map(sub => ({
            ...sub,
            category_name: sub.category?.nameEn || sub.category?.nameAr
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
                category: {
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
        const { category_id, name, name_ar, is_active, sort_order, image_url } = req.body;

        if (!category_id || !name) {
            return res.status(400).json({ success: false, message: 'Category and Name are required' });
        }

        const subcategory = await prisma.subcategory.create({
            data: {
                categoryId: category_id,
                nameEn: name,
                nameAr: name_ar || name,
                imageUrl: image_url,
                sortOrder: sort_order ? parseInt(sort_order) : 0,
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
        const { category_id, name, name_ar, is_active, sort_order, image_url } = req.body;

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
        if (category_id !== undefined) updateData.categoryId = category_id;
        if (name !== undefined) updateData.nameEn = name;
        if (name_ar !== undefined) updateData.nameAr = name_ar;
        if (is_active !== undefined) updateData.isActive = is_active;
        if (sort_order !== undefined) updateData.sortOrder = parseInt(sort_order);
        if (image_url !== undefined) updateData.imageUrl = image_url;

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
                product: { select: { id: true } }
            }
        });

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check if has products
        if (subcategory.product.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subcategory. ${subcategory.product.length} product(s) are using it.`
            });
        }

        // Delete image if exists
        if (subcategory.imageUrl) {
            await deleteFile(subcategory.imageUrl);
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
