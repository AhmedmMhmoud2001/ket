const prisma = require('../utils/prisma');

// Get all food orders
exports.getAllOrders = async (req, res) => {
    try {
        const { status, restaurantId, userId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (status) {
            where.status = status;
        }

        if (restaurantId) {
            where.restaurantId = restaurantId;
        }

        if (userId) {
            where.userId = userId;
        }

        const [orders, total] = await Promise.all([
            prisma.foodOrder.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    restaurant: { select: { id: true, nameEn: true, nameAr: true } },
                    driver: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.foodOrder.count({ where })
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
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.foodOrder.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                restaurant: true,
                driver: {
                    include: {
                        user: { select: { id: true, name: true, phone: true } }
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
                statusHistory: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, expectedAt } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Get current order to check if status is different
        const currentOrder = await prisma.foodOrder.findUnique({
            where: { id }
        });

        if (!currentOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        const updatedOrder = await prisma.foodOrder.update({
            where: { id },
            data: { status }
        });

        // Create status history entry if status changed
        if (currentOrder.status !== status) {
            await prisma.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status,
                    userId: req.user?.id || null,
                    notes: notes || null,
                    expectedAt: expectedAt ? new Date(expectedAt) : null
                }
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Assign driver to order
exports.assignDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        const updatedOrder = await prisma.foodOrder.update({
            where: { id },
            data: { driverId }
        });

        res.json({
            success: true,
            message: 'Driver assigned successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning driver',
            error: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, cancelledBy } = req.body;
        const user = req.user;

        const order = await prisma.foodOrder.findUnique({
            where: { id }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        const nonCancellableStatuses = ['DELIVERED', 'CANCELLED'];
        if (nonCancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        // Determine cancelledBy if not provided
        let cancelledByValue = cancelledBy;
        if (!cancelledByValue) {
            // Determine based on user role
            const userRoles = user.roles?.map(r => r.role?.name || r) || [];
            if (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN')) {
                cancelledByValue = 'admin';
            } else if (userRoles.includes('RESTAURANT_OWNER')) {
                cancelledByValue = 'restaurant';
            } else if (order.userId === user.id) {
                cancelledByValue = 'customer';
            } else {
                cancelledByValue = 'admin'; // Default to admin
            }
        }

        // Update order
        const updatedOrder = await prisma.foodOrder.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelReason: reason || null,
                cancelledBy: cancelledByValue
            }
        });

        // Create status history entry
        await prisma.orderStatusHistory.create({
            data: {
                orderId: id,
                status: 'CANCELLED',
                userId: user.id || null,
                notes: reason ? `Cancelled: ${reason}` : 'Order cancelled'
            }
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

// Reorder (Order Again) - Add previous order items to cart
exports.reorder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { addToCart = true } = req.body; // Default: add to cart, false: create order directly

        // Get the previous order
        const previousOrder = await prisma.foodOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                restaurant: true
            }
        });

        if (!previousOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify the order belongs to the user
        if (previousOrder.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to reorder this order'
            });
        }

        // Check if restaurant is still active
        if (!previousOrder.restaurant.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant is no longer available'
            });
        }

        // If addToCart is true, add items to cart
        if (addToCart) {
            // Get or create cart
            let cart = await prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                cart = await prisma.cart.create({
                    data: { userId }
                });
            }

            // Add items to cart
            const cartItems = [];
            for (const orderItem of previousOrder.items) {
                // Check if product is still available
                if (!orderItem.product.isAvailable) {
                    continue; // Skip unavailable products
                }

                // Check if item already exists in cart
                const existingCartItem = await prisma.cartItem.findUnique({
                    where: {
                        cartId_productId: {
                            cartId: cart.id,
                            productId: orderItem.productId
                        }
                    }
                });

                if (existingCartItem) {
                    // Update quantity
                    const updatedItem = await prisma.cartItem.update({
                        where: { id: existingCartItem.id },
                        data: {
                            quantity: existingCartItem.quantity + orderItem.quantity
                        },
                        include: {
                            product: true
                        }
                    });
                    cartItems.push(updatedItem);
                } else {
                    // Create new cart item
                    const newCartItem = await prisma.cartItem.create({
                        data: {
                            cartId: cart.id,
                            productId: orderItem.productId,
                            quantity: orderItem.quantity,
                            options: orderItem.selectedOptions || null
                        },
                        include: {
                            product: true
                        }
                    });
                    cartItems.push(newCartItem);
                }
            }

            // Fetch updated cart with items
            const updatedCart = await prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
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

            res.json({
                success: true,
                message: 'Order items added to cart successfully',
                data: {
                    cart: updatedCart,
                    itemsAdded: cartItems.length
                }
            });
        } else {
            // Create new order directly (similar to checkout)
            // Verify all products are still available
            for (const orderItem of previousOrder.items) {
                const product = await prisma.product.findUnique({
                    where: { id: orderItem.productId }
                });

                if (!product || !product.isAvailable) {
                    return res.status(400).json({
                        success: false,
                        message: `Product "${product?.nameEn || orderItem.productId}" is no longer available`
                    });
                }
            }

            // Calculate total price
            let totalPrice = 0;
            for (const orderItem of previousOrder.items) {
                const product = await prisma.product.findUnique({
                    where: { id: orderItem.productId }
                });
                totalPrice += product.price * orderItem.quantity;
            }

            // Create new order
            const newOrder = await prisma.foodOrder.create({
                data: {
                    userId: previousOrder.userId,
                    restaurantId: previousOrder.restaurantId,
                    addressId: previousOrder.addressId,
                    status: 'PENDING',
                    totalPrice,
                    tip: previousOrder.tip || null,
                    notes: previousOrder.notes || null,
                    items: {
                        create: previousOrder.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            selectedOptions: item.selectedOptions || null
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

            // Create status history
            await prisma.orderStatusHistory.create({
                data: {
                    orderId: newOrder.id,
                    status: 'PENDING',
                    userId: userId,
                    notes: 'Order recreated from previous order'
                }
            });

            res.status(201).json({
                success: true,
                message: 'Order recreated successfully',
                data: newOrder
            });
        }
    } catch (error) {
        console.error('Reorder error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reordering',
            error: error.message
        });
    }
};
