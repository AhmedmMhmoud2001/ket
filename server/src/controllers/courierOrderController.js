const prisma = require('../utils/prisma');

// Calculate estimated cost
exports.calculateCost = async (req, res) => {
    try {
        const { pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, weight } = req.body;

        if (!pickup_latitude || !pickup_longitude || !delivery_latitude || !delivery_longitude) {
            return res.status(400).json({
                success: false,
                message: 'Please provide pickup and delivery coordinates'
            });
        }

        // Calculate distance (simplified - in production use proper distance calculation)
        const distance = calculateDistance(
            pickup_latitude,
            pickup_longitude,
            delivery_latitude,
            delivery_longitude
        );

        // Base cost calculation
        const baseCost = 10; // Base delivery fee
        const distanceCost = distance * 2; // 2 per km
        const weightCost = weight ? weight * 1.5 : 0; // 1.5 per kg

        const estimatedCost = baseCost + distanceCost + weightCost;
        const minCost = estimatedCost * 0.8; // 20% lower bound
        const maxCost = estimatedCost * 1.2; // 20% upper bound

        // Estimated time (simplified)
        const estimatedTime = Math.ceil(distance * 2); // 2 minutes per km

        res.json({
            success: true,
            data: {
                estimated_cost_min: parseFloat(minCost.toFixed(2)),
                estimated_cost_max: parseFloat(maxCost.toFixed(2)),
                estimated_time_minutes: estimatedTime,
                distance_km: parseFloat(distance.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Calculate cost error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating cost',
            error: error.message
        });
    }
};

// Get payment methods
exports.getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = [
            {
                id: 'CASH',
                name: 'كاش',
                nameAr: 'كاش',
                icon: 'wallet',
                available: true
            },
            {
                id: 'CARD',
                name: 'Credit/Debit Card',
                nameAr: 'بطاقة ائتمان/خصم',
                icon: 'card-add',
                available: true
            },
            {
                id: 'WALLET',
                name: 'Wallet',
                nameAr: 'محفظة',
                icon: 'wallet',
                available: true
            }
        ];

        res.json({
            success: true,
            data: {
                payment_methods: paymentMethods
            }
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment methods',
            error: error.message
        });
    }
};

// Create courier order
exports.createCourierOrder = async (req, res) => {
    try {
        const {
            user_id,
            pickup_address_id,
            delivery_address_id,
            description,
            images,
            weight,
            payment_method,
            coupon_code,
            notes
        } = req.body;

        // Validation
        if (!user_id || !pickup_address_id || !delivery_address_id || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Get addresses
        const [pickupAddress, deliveryAddress] = await Promise.all([
            prisma.address.findUnique({ where: { id: pickup_address_id } }),
            prisma.address.findUnique({ where: { id: delivery_address_id } })
        ]);

        if (!pickupAddress || !deliveryAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Calculate cost
        const distance = calculateDistance(
            pickupAddress.latitude,
            pickupAddress.longitude,
            deliveryAddress.latitude,
            deliveryAddress.longitude
        );

        const baseCost = 10;
        const distanceCost = distance * 2;
        const weightCost = weight ? weight * 1.5 : 0;
        let estimatedCost = baseCost + distanceCost + weightCost;

        // Apply coupon if provided
        let discount = 0;
        let couponId = null;
        if (coupon_code) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: coupon_code.toUpperCase() }
            });

            if (coupon && coupon.isActive && 
                new Date() >= coupon.startDate && 
                new Date() <= coupon.expiryDate) {
                
                if (estimatedCost >= coupon.minOrderAmount) {
                    couponId = coupon.id;
                    if (coupon.type === 'PERCENTAGE') {
                        discount = (estimatedCost * coupon.discountValue) / 100;
                        if (coupon.maxDiscount) {
                            discount = Math.min(discount, coupon.maxDiscount);
                        }
                    } else {
                        discount = coupon.discountValue;
                    }
                    estimatedCost -= discount;
                }
            }
        }

        // Generate order number
        const orderNumber = 'COU-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        // Create order
        const courierOrder = await prisma.courierOrder.create({
            data: {
                orderNumber,
                userId: user_id,
                pickupAddressId: pickup_address_id,
                deliveryAddressId: delivery_address_id,
                paymentMethod: payment_method.toUpperCase(),
                paymentStatus: 'PENDING',
                description: description || null,
                images: images ? JSON.parse(images) : null,
                weight: weight ? parseFloat(weight) : null,
                estimatedCost: parseFloat(estimatedCost.toFixed(2)),
                couponId: couponId,
                notes: notes || null,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                },
                pickupAddress: true,
                deliveryAddress: true
            }
        });

        // Create tracking
        await prisma.courierTracking.create({
            data: {
                courierOrderId: courierOrder.id,
                pickupLatitude: pickupAddress.latitude,
                pickupLongitude: pickupAddress.longitude,
                deliveryLatitude: deliveryAddress.latitude,
                deliveryLongitude: deliveryAddress.longitude,
                estimatedDistance: distance,
                estimatedTime: Math.ceil(distance * 2)
            }
        });

        res.status(201).json({
            success: true,
            message: 'Courier order created successfully',
            data: {
                order: courierOrder,
                estimated_pickup_time: new Date(Date.now() + 15 * 60000), // 15 minutes
                estimated_delivery_time: new Date(Date.now() + (15 + Math.ceil(distance * 2)) * 60000)
            }
        });
    } catch (error) {
        console.error('Create courier order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating courier order',
            error: error.message
        });
    }
};

// Get all courier orders
exports.getAllCourierOrders = async (req, res) => {
    try {
        const { status, user_id, driver_id, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (status) {
            where.status = status.toUpperCase();
        }

        if (user_id) {
            where.userId = user_id;
        }

        if (driver_id) {
            where.driverId = driver_id;
        }

        const [orders, total] = await Promise.all([
            prisma.courierOrder.findMany({
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
                    driver: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    pickupAddress: true,
                    deliveryAddress: true,
                    tracking: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.courierOrder.count({ where })
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
        console.error('Get courier orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courier orders',
            error: error.message
        });
    }
};

// Get courier order by ID
exports.getCourierOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.courierOrder.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        avatar: true
                    }
                },
                driver: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                                avatar: true
                            }
                        }
                    }
                },
                pickupAddress: true,
                deliveryAddress: true,
                tracking: true,
                coupon: true
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Courier order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get courier order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courier order',
            error: error.message
        });
    }
};

// Update courier order status
exports.updateCourierOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'CONFIRMED', 'PICKING_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

        if (!validStatuses.includes(status?.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await prisma.courierOrder.findUnique({
            where: { id }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Courier order not found'
            });
        }

        const updateData = {
            status: status.toUpperCase()
        };

        if (status.toUpperCase() === 'PICKING_UP') {
            updateData.pickupAt = new Date();
        }

        if (status.toUpperCase() === 'DELIVERED') {
            updateData.deliveredAt = new Date();
        }

        if (status.toUpperCase() === 'CANCELLED') {
            updateData.cancelledAt = new Date();
        }

        const updatedOrder = await prisma.courierOrder.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Courier order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update courier order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating courier order status',
            error: error.message
        });
    }
};

// Assign driver to courier order
exports.assignDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { driver_id } = req.body;

        if (!driver_id) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        const driver = await prisma.driver.findUnique({
            where: { id: driver_id }
        });

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        const updatedOrder = await prisma.courierOrder.update({
            where: { id },
            data: {
                driverId: driver_id,
                status: 'CONFIRMED'
            }
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

// Get courier order tracking
exports.getCourierOrderTracking = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.courierOrder.findUnique({
            where: { id },
            include: {
                driver: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                                avatar: true
                            }
                        }
                    }
                },
                pickupAddress: true,
                deliveryAddress: true,
                tracking: true
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Courier order not found'
            });
        }

        res.json({
            success: true,
            data: {
                order_id: order.id,
                order_number: order.orderNumber,
                status: order.status,
                driver: order.driver ? {
                    name: `${order.driver.user.firstName} ${order.driver.user.lastName}`,
                    phone: order.driver.user.phone,
                    avatar: order.driver.user.avatar
                } : null,
                pickup: {
                    address: order.pickupAddress,
                    latitude: order.pickupAddress.latitude,
                    longitude: order.pickupAddress.longitude
                },
                delivery: {
                    address: order.deliveryAddress,
                    latitude: order.deliveryAddress.latitude,
                    longitude: order.deliveryAddress.longitude
                },
                tracking: order.tracking
            }
        });
    } catch (error) {
        console.error('Get courier order tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courier order tracking',
            error: error.message
        });
    }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

