const prisma = require('../utils/prisma');

// ========== PRODUCT FAVORITES ==========

// Get user's favorite products
exports.getUserFavoriteProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [favorites, total] = await Promise.all([
            prisma.productFavorite.findMany({
                where: { userId },
                include: {
                    product: {
                        include: {
                            restaurant: { select: { id: true, name: true } },
                            category: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.productFavorite.count({ where: { userId } })
        ]);

        res.json({
            success: true,
            data: {
                favorites: favorites.map(f => f.product),
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get favorite products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorite products',
            error: error.message
        });
    }
};

// Add product to favorites
exports.addProductToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already favorited
        const existing = await prisma.productFavorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Product already in favorites'
            });
        }

        // Add to favorites
        await prisma.productFavorite.create({
            data: {
                userId,
                productId
            }
        });

        res.json({
            success: true,
            message: 'Product added to favorites'
        });
    } catch (error) {
        console.error('Add product to favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding product to favorites',
            error: error.message
        });
    }
};

// Remove product from favorites
exports.removeProductFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const favorite = await prisma.productFavorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Product not in favorites'
            });
        }

        await prisma.productFavorite.delete({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        res.json({
            success: true,
            message: 'Product removed from favorites'
        });
    } catch (error) {
        console.error('Remove product from favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing product from favorites',
            error: error.message
        });
    }
};

// Get users who favorited a product (Admin only)
exports.getProductFavoriteUsers = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [favorites, total] = await Promise.all([
            prisma.productFavorite.findMany({
                where: { productId },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.productFavorite.count({ where: { productId } })
        ]);

        res.json({
            success: true,
            data: {
                users: favorites.map(f => ({
                    ...f.user,
                    full_name: `${f.user.firstName || ''} ${f.user.lastName || ''}`.trim(),
                    favorited_at: f.createdAt
                })),
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get product favorite users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get product favorites count
exports.getProductFavoritesCount = async (req, res) => {
    try {
        const { productId } = req.params;

        const count = await prisma.productFavorite.count({
            where: { productId }
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get product favorites count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites count',
            error: error.message
        });
    }
};

// ========== RESTAURANT FAVORITES ==========

// Get user's favorite restaurants
exports.getUserFavoriteRestaurants = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [favorites, total] = await Promise.all([
            prisma.restaurantFavorite.findMany({
                where: { userId },
                include: {
                    restaurant: {
                        include: {
                            category: { select: { id: true, name: true, icon: true } },
                            restaurantCategories: {
                                include: {
                                    category: { select: { id: true, name: true, icon: true } }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.restaurantFavorite.count({ where: { userId } })
        ]);

        res.json({
            success: true,
            data: {
                favorites: favorites.map(f => ({
                    ...f.restaurant,
                    categories: f.restaurant.restaurantCategories?.map(rc => rc.category) || []
                })),
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get favorite restaurants error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorite restaurants',
            error: error.message
        });
    }
};

// Add restaurant to favorites
exports.addRestaurantToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { restaurantId } = req.params;

        // Check if restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Check if already favorited
        const existing = await prisma.restaurantFavorite.findUnique({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId
                }
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant already in favorites'
            });
        }

        // Add to favorites
        await prisma.restaurantFavorite.create({
            data: {
                userId,
                restaurantId
            }
        });

        res.json({
            success: true,
            message: 'Restaurant added to favorites'
        });
    } catch (error) {
        console.error('Add restaurant to favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding restaurant to favorites',
            error: error.message
        });
    }
};

// Remove restaurant from favorites
exports.removeRestaurantFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { restaurantId } = req.params;

        const favorite = await prisma.restaurantFavorite.findUnique({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId
                }
            }
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not in favorites'
            });
        }

        await prisma.restaurantFavorite.delete({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId
                }
            }
        });

        res.json({
            success: true,
            message: 'Restaurant removed from favorites'
        });
    } catch (error) {
        console.error('Remove restaurant from favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing restaurant from favorites',
            error: error.message
        });
    }
};

// Get users who favorited a restaurant (Admin only)
exports.getRestaurantFavoriteUsers = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [favorites, total] = await Promise.all([
            prisma.restaurantFavorite.findMany({
                where: { restaurantId },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.restaurantFavorite.count({ where: { restaurantId } })
        ]);

        res.json({
            success: true,
            data: {
                users: favorites.map(f => ({
                    ...f.user,
                    full_name: `${f.user.firstName || ''} ${f.user.lastName || ''}`.trim(),
                    favorited_at: f.createdAt
                })),
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get restaurant favorite users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get restaurant favorites count
exports.getRestaurantFavoritesCount = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const count = await prisma.restaurantFavorite.count({
            where: { restaurantId }
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get restaurant favorites count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching favorites count',
            error: error.message
        });
    }
};

