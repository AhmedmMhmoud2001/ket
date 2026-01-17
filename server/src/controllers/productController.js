const prisma = require('../utils/prisma');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const { search, restaurantId, subcategoryId, isAvailable, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { nameAr: { contains: search } },
                { nameEn: { contains: search } }
            ];
        }

        if (restaurantId) {
            where.restaurantId = restaurantId;
        }

        if (subcategoryId) {
            where.subcategoryId = subcategoryId;
        }

        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true';
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    restaurant: { select: { id: true, nameEn: true, nameAr: true } },
                    subcategory: { select: { id: true, nameEn: true, nameAr: true } },
                    options: true
                },
                orderBy: { nameEn: 'asc' },
                skip,
                take
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                restaurant: true,
                subcategory: true,
                options: true
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const {
            restaurantId,
            subcategoryId,
            nameAr,
            nameEn,
            descriptionAr,
            descriptionEn,
            price,
            calories,
            options,
            isAvailable
        } = req.body;

        // Validation
        if (!restaurantId || !subcategoryId || !nameAr || !nameEn || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide required fields (restaurantId, subcategoryId, nameAr, nameEn, price)'
            });
        }

        const product = await prisma.product.create({
            data: {
                restaurantId,
                subcategoryId,
                nameAr,
                nameEn,
                descriptionAr,
                descriptionEn,
                price: parseFloat(price),
                calories: calories ? parseInt(calories) : null,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                options: options && Array.isArray(options) ? {
                    create: options.map(opt => ({
                        nameAr: opt.nameAr,
                        nameEn: opt.nameEn,
                        price: parseFloat(opt.price),
                        isActive: true
                    }))
                } : undefined
            },
            include: {
                options: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const mappedData = {};
        if (updateData.nameAr) mappedData.nameAr = updateData.nameAr;
        if (updateData.nameEn) mappedData.nameEn = updateData.nameEn;
        if (updateData.descriptionAr) mappedData.descriptionAr = updateData.descriptionAr;
        if (updateData.descriptionEn) mappedData.descriptionEn = updateData.descriptionEn;
        if (updateData.price !== undefined) mappedData.price = parseFloat(updateData.price);
        if (updateData.calories !== undefined) mappedData.calories = parseInt(updateData.calories);
        if (updateData.isAvailable !== undefined) mappedData.isAvailable = updateData.isAvailable;
        if (updateData.subcategoryId) mappedData.subcategoryId = updateData.subcategoryId;

        // Handle options update
        if (updateData.options && Array.isArray(updateData.options)) {
            await prisma.productOption.deleteMany({ where: { productId: id } });
            mappedData.options = {
                create: updateData.options.map(opt => ({
                    nameAr: opt.nameAr,
                    nameEn: opt.nameEn,
                    price: parseFloat(opt.price),
                    isActive: true
                }))
            };
        }

        const product = await prisma.product.update({
            where: { id },
            data: mappedData,
            include: { options: true }
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.product.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};
