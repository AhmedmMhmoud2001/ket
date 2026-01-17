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
                    options: true,
                    images: {
                        orderBy: [
                            { isPrimary: 'desc' },
                            { sortOrder: 'asc' }
                        ]
                    }
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
                options: true,
                images: {
                    orderBy: [
                        { isPrimary: 'desc' },
                        { sortOrder: 'asc' }
                    ]
                }
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
            images,
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
                } : undefined,
                images: images && Array.isArray(images) && images.length > 0 ? {
                    create: images.map((imgUrl, index) => ({
                        imageUrl: imgUrl,
                        isPrimary: index === 0, // First image is primary
                        sortOrder: index
                    }))
                } : undefined
            },
            include: {
                options: true,
                images: {
                    orderBy: [
                        { isPrimary: 'desc' },
                        { sortOrder: 'asc' }
                    ]
                }
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

        // Handle images update (if provided as array of imageUrls)
        if (updateData.images && Array.isArray(updateData.images)) {
            // Delete existing images
            await prisma.productImage.deleteMany({ where: { productId: id } });
            
            // Create new images
            if (updateData.images.length > 0) {
                mappedData.images = {
                    create: updateData.images.map((imgUrl, index) => ({
                        imageUrl: imgUrl,
                        isPrimary: index === 0, // First image is primary
                        sortOrder: index
                    }))
                };
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: mappedData,
            include: {
                options: true,
                images: {
                    orderBy: [
                        { isPrimary: 'desc' },
                        { sortOrder: 'asc' }
                    ]
                }
            }
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

// Add product image
exports.addProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl, isPrimary, sortOrder } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        // If setting as primary, unset other primary images
        if (isPrimary) {
            await prisma.productImage.updateMany({
                where: { productId: id, isPrimary: true },
                data: { isPrimary: false }
            });
        }

        const productImage = await prisma.productImage.create({
            data: {
                productId: id,
                imageUrl,
                isPrimary: isPrimary || false,
                sortOrder: sortOrder || 0
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product image added successfully',
            data: productImage
        });
    } catch (error) {
        console.error('Add product image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding product image',
            error: error.message
        });
    }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const image = await prisma.productImage.findUnique({
            where: { id: imageId },
            select: { productId: true }
        });

        if (!image || image.productId !== id) {
            return res.status(404).json({
                success: false,
                message: 'Product image not found'
            });
        }

        await prisma.productImage.delete({
            where: { id: imageId }
        });

        res.json({
            success: true,
            message: 'Product image deleted successfully'
        });
    } catch (error) {
        console.error('Delete product image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product image',
            error: error.message
        });
    }
};

// Set primary image
exports.setPrimaryImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const image = await prisma.productImage.findUnique({
            where: { id: imageId },
            select: { productId: true }
        });

        if (!image || image.productId !== id) {
            return res.status(404).json({
                success: false,
                message: 'Product image not found'
            });
        }

        // Unset other primary images
        await prisma.productImage.updateMany({
            where: { productId: id, isPrimary: true },
            data: { isPrimary: false }
        });

        // Set this image as primary
        const updatedImage = await prisma.productImage.update({
            where: { id: imageId },
            data: { isPrimary: true }
        });

        res.json({
            success: true,
            message: 'Primary image updated successfully',
            data: updatedImage
        });
    } catch (error) {
        console.error('Set primary image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting primary image',
            error: error.message
        });
    }
};

// Update image sort order
exports.updateImageSortOrder = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        const { sortOrder } = req.body;

        if (sortOrder === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Sort order is required'
            });
        }

        const image = await prisma.productImage.findUnique({
            where: { id: imageId },
            select: { productId: true }
        });

        if (!image || image.productId !== id) {
            return res.status(404).json({
                success: false,
                message: 'Product image not found'
            });
        }

        const updatedImage = await prisma.productImage.update({
            where: { id: imageId },
            data: { sortOrder: parseInt(sortOrder) }
        });

        res.json({
            success: true,
            message: 'Image sort order updated successfully',
            data: updatedImage
        });
    } catch (error) {
        console.error('Update image sort order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating image sort order',
            error: error.message
        });
    }
};
