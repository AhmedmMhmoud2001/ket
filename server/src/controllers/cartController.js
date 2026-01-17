const prisma = require('../utils/prisma');

// Get user cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                restaurant: {
                                    select: {
                                        id: true,
                                        nameEn: true,
                                        nameAr: true
                                    }
                                },
                                images: {
                                    where: { isPrimary: true },
                                    take: 1
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    restaurant: {
                                        select: {
                                            id: true,
                                            nameEn: true,
                                            nameAr: true
                                        }
                                    },
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        // Calculate totals
        let subtotal = 0;
        cart.items.forEach(item => {
            const itemPrice = item.product.price * item.quantity;
            // Add options price if exists
            if (item.options && typeof item.options === 'object') {
                // Options are stored as JSON
            }
            subtotal += itemPrice;
        });

        res.json({
            success: true,
            data: {
                ...cart,
                subtotal,
                totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

// Add item to cart
exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1, options } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId }
            });
        }

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId
            }
        });

        let cartItem;

        if (existingItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + parseInt(quantity),
                    options: options ? JSON.parse(JSON.stringify(options)) : existingItem.options
                },
                include: {
                    product: {
                        include: {
                            restaurant: {
                                select: {
                                    id: true,
                                    nameEn: true,
                                    nameAr: true
                                }
                            },
                            images: {
                                where: { isPrimary: true },
                                take: 1
                            }
                        }
                    }
                }
            });
        } else {
            // Create new item
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity: parseInt(quantity),
                    options: options ? JSON.parse(JSON.stringify(options)) : null
                },
                include: {
                    product: {
                        include: {
                            restaurant: {
                                select: {
                                    id: true,
                                    nameEn: true,
                                    nameAr: true
                                }
                            },
                            images: {
                                where: { isPrimary: true },
                                take: 1
                            }
                        }
                    }
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cartItem
        });
    } catch (error) {
        console.error('Add item to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity, options } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required (minimum 1)'
            });
        }

        // Verify cart item belongs to user
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { id }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id },
            data: {
                quantity: parseInt(quantity),
                options: options ? JSON.parse(JSON.stringify(options)) : undefined
            },
            include: {
                product: {
                    include: {
                        restaurant: {
                            select: {
                                id: true,
                                nameEn: true,
                                nameAr: true
                            }
                        },
                        images: {
                            where: { isPrimary: true },
                            take: 1
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Cart item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

// Remove item from cart
exports.removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify cart item belongs to user
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { id }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        await prisma.cartItem.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        console.error('Remove item from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};

// Checkout (convert cart to order)
exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, deliveryInstructions, paymentMethod } = req.body;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: 'Address ID is required'
            });
        }

        // Get cart with items
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                restaurant: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Group items by restaurant
        const restaurantGroups = {};
        cart.items.forEach(item => {
            const restaurantId = item.product.restaurantId;
            if (!restaurantGroups[restaurantId]) {
                restaurantGroups[restaurantId] = [];
            }
            restaurantGroups[restaurantId].push(item);
        });

        // For now, create one order for the first restaurant
        // In a real app, you might want to create multiple orders for multiple restaurants
        const firstRestaurantId = Object.keys(restaurantGroups)[0];
        const restaurantItems = restaurantGroups[firstRestaurantId];

        // Calculate total
        let totalPrice = 0;
        restaurantItems.forEach(item => {
            totalPrice += item.product.price * item.quantity;
        });

        // Create order
        const order = await prisma.foodOrder.create({
            data: {
                userId,
                restaurantId: firstRestaurantId,
                addressId,
                status: 'PENDING',
                totalPrice,
                items: {
                    create: restaurantItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                restaurant: true
            }
        });

        // Clear cart items for this restaurant
        const itemIds = restaurantItems.map(item => item.id);
        await prisma.cartItem.deleteMany({
            where: {
                id: { in: itemIds }
            }
        });

        // If cart is now empty, you might want to delete the cart
        const remainingItems = await prisma.cartItem.count({
            where: { cartId: cart.id }
        });

        if (remainingItems === 0) {
            // Optionally delete cart
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during checkout',
            error: error.message
        });
    }
};

