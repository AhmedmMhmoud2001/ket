const prisma = require('../utils/prisma');
const { deleteFile } = require('../utils/fileHandler');

// Simple slugify function
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

// ========== RESTAURANT INFO ==========

// Get restaurant info (for the logged-in restaurant owner)
exports.getMyRestaurant = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                category: true,
                restaurantCategories: {
                    include: {
                        category: { select: { id: true, name: true, icon: true } }
                    }
                },
                _count: {
                    select: {
                        products: true,
                        orders: true,
                        reviews: true
                    }
                }
            }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Format response
        const formattedRestaurant = {
            ...restaurant,
            categories: restaurant.restaurantCategories?.map(rc => rc.category) || [],
            products_count: restaurant._count?.products || 0,
            orders_count: restaurant._count?.orders || 0,
            reviews_count: restaurant._count?.reviews || 0
        };

        res.json({
            success: true,
            data: formattedRestaurant
        });
    } catch (error) {
        console.error('Get my restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurant',
            error: error.message
        });
    }
};

// Update restaurant info
exports.updateMyRestaurant = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const {
            name,
            nameAr,
            description,
            descriptionAr,
            address,
            addressAr,
            phone,
            email,
            logo,
            banner,
            openingTime,
            closingTime,
            isOpen,
            deliveryFee,
            minOrderAmount,
            preparationTime
        } = req.body;

        // Build update data
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (nameAr !== undefined) updateData.nameAr = nameAr;
        if (description !== undefined) updateData.description = description;
        if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
        if (address !== undefined) updateData.address = address;
        if (addressAr !== undefined) updateData.addressAr = addressAr;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (logo !== undefined) updateData.logo = logo;
        if (banner !== undefined) updateData.banner = banner;
        if (openingTime !== undefined) updateData.openingTime = openingTime;
        if (closingTime !== undefined) updateData.closingTime = closingTime;
        if (isOpen !== undefined) updateData.isOpen = isOpen;
        if (deliveryFee !== undefined) updateData.deliveryFee = parseFloat(deliveryFee);
        if (minOrderAmount !== undefined) updateData.minOrderAmount = parseFloat(minOrderAmount);
        if (preparationTime !== undefined) updateData.preparationTime = parseInt(preparationTime);

        const restaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: updateData,
            include: {
                category: true,
                restaurantCategories: {
                    include: {
                        category: { select: { id: true, name: true } }
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: restaurant
        });
    } catch (error) {
        console.error('Update restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating restaurant',
            error: error.message
        });
    }
};

// ========== PRODUCTS ==========

// Get all products for my restaurant
exports.getMyProducts = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { search, category_id, subcategory_id, is_available, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {
            restaurantId: restaurantId // Only products from this restaurant
        };

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { nameAr: { contains: search } },
                { descriptionAr: { contains: search } }
            ];
        }

        if (category_id) {
            where.categoryId = category_id;
        }

        if (subcategory_id) {
            where.subcategoryId = subcategory_id;
        }

        if (is_available !== undefined) {
            where.isAvailable = is_available === 'true';
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    extras: true,
                    _count: {
                        select: { favoritedBy: true, orderItems: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
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
        console.error('Get my products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get product by ID (only if it belongs to my restaurant)
exports.getMyProductById = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { id } = req.params;

        const product = await prisma.product.findFirst({
            where: {
                id,
                restaurantId: restaurantId
            },
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                extras: true,
                _count: {
                    select: { favoritedBy: true, orderItems: true }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or you do not have access to it'
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

// Create product for my restaurant
exports.createMyProduct = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const {
            category_id,
            subcategory_id,
            section_id,
            name,
            nameAr,
            description,
            descriptionAr,
            price,
            discountedPrice,
            calories,
            images,
            ingredients,
            extras,
            isAvailable,
            isFeatured
        } = req.body;

        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and price'
            });
        }

        // Generate slug
        const slug = slugify(name) + '-' + Date.now();

        // Create product
        const product = await prisma.product.create({
            data: {
                restaurantId: restaurantId,
                categoryId: category_id || null,
                subcategoryId: subcategory_id || null,
                sectionId: section_id || null,
                name: name,
                nameAr: nameAr || null,
                slug: slug,
                description: description || null,
                descriptionAr: descriptionAr || null,
                price: parseFloat(price),
                discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
                calories: calories ? parseInt(calories) : null,
                images: images || null,
                ingredients: ingredients || null,
                isAvailable: isAvailable !== undefined ? isAvailable : true,
                isFeatured: isFeatured || false,
                extras: extras && Array.isArray(extras) && extras.length > 0 ? {
                    create: extras.map(extra => ({
                        name: extra.name,
                        price: parseFloat(extra.price),
                        isRequired: extra.isRequired || false
                    }))
                } : undefined
            },
            include: {
                extras: true,
                category: { select: { name: true } },
                subcategory: { select: { name: true } }
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

// Update product (only if it belongs to my restaurant)
exports.updateMyProduct = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { id } = req.params;
        const {
            category_id,
            subcategory_id,
            section_id,
            name,
            nameAr,
            description,
            descriptionAr,
            price,
            discountedPrice,
            calories,
            images,
            ingredients,
            extras,
            isAvailable,
            isFeatured
        } = req.body;

        // Check if product exists and belongs to this restaurant
        const existing = await prisma.product.findFirst({
            where: {
                id,
                restaurantId: restaurantId
            }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or you do not have access to it'
            });
        }

        // Build update data
        const updateData = {};
        if (category_id !== undefined) updateData.categoryId = category_id;
        if (subcategory_id !== undefined) updateData.subcategoryId = subcategory_id;
        if (section_id !== undefined) updateData.sectionId = section_id;
        if (name !== undefined) {
            updateData.name = name;
            updateData.slug = slugify(name) + '-' + Date.now();
        }
        if (nameAr !== undefined) updateData.nameAr = nameAr;
        if (description !== undefined) updateData.description = description;
        if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : null;
        if (calories !== undefined) updateData.calories = calories ? parseInt(calories) : null;
        if (images !== undefined) updateData.images = images;
        if (ingredients !== undefined) updateData.ingredients = ingredients;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

        // Update product
        await prisma.product.update({
            where: { id },
            data: updateData
        });

        // Update extras if provided
        if (extras && Array.isArray(extras)) {
            // Delete existing extras
            await prisma.productExtra.deleteMany({ where: { productId: id } });

            // Create new extras
            if (extras.length > 0) {
                await prisma.productExtra.createMany({
                    data: extras.map(extra => ({
                        productId: id,
                        name: extra.name,
                        price: parseFloat(extra.price),
                        isRequired: extra.isRequired || false
                    }))
                });
            }
        }

        // Fetch updated product
        const updatedProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                extras: true,
                category: { select: { name: true } },
                subcategory: { select: { name: true } }
            }
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
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

// Delete product (only if it belongs to my restaurant)
exports.deleteMyProduct = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { id } = req.params;

        // Check if product exists and belongs to this restaurant
        const product = await prisma.product.findFirst({
            where: {
                id,
                restaurantId: restaurantId
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or you do not have access to it'
            });
        }

        // Delete product
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

// ========== SUBcategories ==========

// Get subcategories for my restaurant's products
exports.getMySubcategories = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { category_id, is_active } = req.query;

        // Get all subcategories that are used by products in this restaurant
        const products = await prisma.product.findMany({
            where: { restaurantId: restaurantId },
            select: { subcategoryId: true },
            distinct: ['subcategoryId']
        });

        const subcategoryIds = products
            .map(p => p.subcategoryId)
            .filter(id => id !== null);

        if (subcategoryIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    subcategories: [],
                    pagination: {
                        page: 1,
                        limit: 100,
                        total: 0,
                        totalPages: 0
                    }
                }
            });
        }

        const where = {
            id: { in: subcategoryIds }
        };

        if (category_id) {
            where.categoryId = category_id;
        }

        if (is_active !== undefined) {
            where.isActive = is_active === 'true';
        }

        const subcategories = await prisma.subcategory.findMany({
            where,
            include: {
                category: { select: { id: true, name: true } }
            },
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            data: {
                subcategories,
                pagination: {
                    page: 1,
                    limit: 100,
                    total: subcategories.length,
                    totalPages: 1
                }
            }
        });
    } catch (error) {
        console.error('Get my subcategories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories',
            error: error.message
        });
    }
};

// ========== CATEGORIES ==========

// Get categories linked to my restaurant
exports.getMyCategories = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                restaurantCategories: {
                    include: {
                        category: true
                    }
                }
            }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const categories = restaurant.restaurantCategories.map(rc => rc.category);

        res.json({
            success: true,
            data: {
                categories,
                pagination: {
                    page: 1,
                    limit: 100,
                    total: categories.length,
                    totalPages: 1
                }
            }
        });
    } catch (error) {
        console.error('Get my categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// ========== ORDERS ==========

// Get orders for my restaurant
exports.getMyOrders = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {
            restaurantId: restaurantId
        };

        if (status) {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true
                                }
                            }
                        }
                    },
                    driver: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phone: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.order.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// ========== STATISTICS ==========

// Get restaurant statistics
exports.getMyStatistics = async (req, res) => {
    try {
        const restaurantId = req.restaurantId;

        const [
            totalProducts,
            totalOrders,
            totalRevenue,
            averageRating,
            totalReviews,
            todayOrders,
            todayRevenue
        ] = await Promise.all([
            prisma.product.count({ where: { restaurantId: restaurantId } }),
            prisma.order.count({ where: { restaurantId: restaurantId } }),
            prisma.order.aggregate({
                where: {
                    restaurantId: restaurantId,
                    paymentStatus: 'PAID'
                },
                _sum: { total: true }
            }),
            prisma.review.aggregate({
                where: {
                    restaurantId: restaurantId,
                    type: 'RESTAURANT'
                },
                _avg: { rating: true }
            }),
            prisma.review.count({
                where: {
                    restaurantId: restaurantId,
                    type: 'RESTAURANT'
                }
            }),
            prisma.order.count({
                where: {
                    restaurantId: restaurantId,
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            prisma.order.aggregate({
                where: {
                    restaurantId: restaurantId,
                    paymentStatus: 'PAID',
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                },
                _sum: { total: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue._sum.total || 0,
                averageRating: averageRating._avg.rating || 0,
                totalReviews,
                todayOrders,
                todayRevenue: todayRevenue._sum.total || 0
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

