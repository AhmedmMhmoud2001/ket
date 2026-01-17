const prisma = require('../utils/prisma');

// Helper function to calculate date range based on period
const getDateRange = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate: now };
};

// Helper function to get previous period for comparison
const getPreviousPeriod = (period, startDate) => {
    const prevEnd = new Date(startDate);
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);
    let prevStart;

    switch (period) {
        case 'day':
            prevStart = new Date(prevEnd);
            prevStart.setDate(prevEnd.getDate() - 1);
            break;
        case 'week':
            prevStart = new Date(prevEnd);
            prevStart.setDate(prevEnd.getDate() - 7);
            break;
        case 'month':
            prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() - 1, 1);
            break;
        case 'year':
            prevStart = new Date(prevEnd.getFullYear() - 1, 0, 1);
            break;
        default:
            prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() - 1, 1);
    }

    return { startDate: prevStart, endDate: prevEnd };
};

// Calculate percentage change
const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// Get Dashboard KPIs
exports.getDashboardKPIs = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);
        const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriod(period, startDate);

        // Current period queries
        const [currentRevenue, currentOrders, currentCustomers, currentActiveDrivers] = await Promise.all([
            // Revenue (sum of totalPrice from FoodOrder)
            prisma.foodOrder.aggregate({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'cancelled' }
                },
                _sum: { totalPrice: true }
            }),
            // Total orders
            prisma.foodOrder.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'cancelled' }
                }
            }),
            // Total customers (unique users who placed orders)
            prisma.foodOrder.groupBy({
                by: ['userId'],
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            }).then(result => result.length),
            // Active drivers (online drivers)
            prisma.deliveryDriver.count({
                where: {
                    isOnline: true
                }
            })
        ]);

        // Previous period queries
        const [prevRevenue, prevOrders, prevCustomers] = await Promise.all([
            prisma.foodOrder.aggregate({
                where: {
                    createdAt: { gte: prevStart, lte: prevEnd },
                    status: { not: 'cancelled' }
                },
                _sum: { totalPrice: true }
            }),
            prisma.foodOrder.count({
                where: {
                    createdAt: { gte: prevStart, lte: prevEnd },
                    status: { not: 'cancelled' }
                }
            }),
            prisma.foodOrder.groupBy({
                by: ['userId'],
                where: {
                    createdAt: { gte: prevStart, lte: prevEnd }
                }
            }).then(result => result.length)
        ]);

        const revenueValue = currentRevenue._sum.totalPrice || 0;
        const prevRevenueValue = prevRevenue._sum.totalPrice || 0;

        res.json({
            success: true,
            data: {
                revenue: {
                    value: revenueValue,
                    change: parseFloat(calculateChange(revenueValue, prevRevenueValue).toFixed(2))
                },
                orders: {
                    value: currentOrders,
                    change: parseFloat(calculateChange(currentOrders, prevOrders).toFixed(2))
                },
                customers: {
                    value: currentCustomers,
                    change: parseFloat(calculateChange(currentCustomers, prevCustomers).toFixed(2))
                },
                active_drivers: {
                    value: currentActiveDrivers,
                    change: 0
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard KPIs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard KPIs',
            error: error.message
        });
    }
};

// Get Revenue Chart Data
exports.getRevenueChart = async (req, res) => {
    try {
        const { period = 'week' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get orders grouped by date
        const orders = await prisma.foodOrder.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'cancelled' }
            },
            select: {
                createdAt: true,
                totalPrice: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group by date and sum revenue
        const revenueByDate = {};
        orders.forEach(order => {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            if (!revenueByDate[dateKey]) {
                revenueByDate[dateKey] = 0;
            }
            revenueByDate[dateKey] += order.totalPrice;
        });

        // Convert to array format
        const chartData = Object.keys(revenueByDate)
            .sort()
            .map(date => ({
                date,
                revenue: parseFloat(revenueByDate[date].toFixed(2))
            }));

        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Get revenue chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue chart',
            error: error.message
        });
    }
};

// Get Orders Analytics
exports.getOrdersAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get payments for orders in the period
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                orderType: 'FOOD_ORDER',
                status: 'completed'
            },
            select: {
                method: true,
                amount: true
            }
        });

        // Group by payment method
        const paymentMethods = {};
        payments.forEach(payment => {
            const method = payment.method.toLowerCase();
            if (!paymentMethods[method]) {
                paymentMethods[method] = 0;
            }
            paymentMethods[method] += payment.amount;
        });

        // Convert to array format
        const paymentMethodsArray = Object.keys(paymentMethods).map(method => ({
            name: method,
            value: parseFloat(paymentMethods[method].toFixed(2))
        }));

        res.json({
            success: true,
            data: {
                payment_methods: paymentMethodsArray
            }
        });
    } catch (error) {
        console.error('Get orders analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders analytics',
            error: error.message
        });
    }
};

// Get Best Performing Restaurants
exports.getBestRestaurants = async (req, res) => {
    try {
        const { period = 'month', limit = 10 } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get restaurant performance
        const restaurantStats = await prisma.foodOrder.groupBy({
            by: ['restaurantId'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'cancelled' }
            },
            _count: { id: true },
            _sum: { totalPrice: true }
        });

        // Get restaurant details
        const restaurantIds = restaurantStats.map(stat => stat.restaurantId);
        const restaurants = await prisma.restaurant.findMany({
            where: { id: { in: restaurantIds } },
            select: {
                id: true,
                nameEn: true,
                nameAr: true,
                rating: true
            }
        });

        // Combine and sort
        const bestRestaurants = restaurantStats
            .map(stat => {
                const restaurant = restaurants.find(r => r.id === stat.restaurantId);
                return {
                    id: stat.restaurantId,
                    name: restaurant?.nameEn || restaurant?.nameAr || 'Unknown',
                    nameAr: restaurant?.nameAr,
                    nameEn: restaurant?.nameEn,
                    rating: restaurant?.rating || 0,
                    totalOrders: stat._count.id,
                    totalRevenue: stat._sum.totalPrice || 0
                };
            })
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: bestRestaurants
        });
    } catch (error) {
        console.error('Get best restaurants error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching best restaurants',
            error: error.message
        });
    }
};

// Get Best Selling Products
exports.getBestProducts = async (req, res) => {
    try {
        const { period = 'month', limit = 10 } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get order items in the period
        const orderItems = await prisma.foodOrderItem.findMany({
            where: {
                order: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'cancelled' }
                }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        price: true,
                        rating: true
                    }
                }
            }
        });

        // Group by product
        const productStats = {};
        orderItems.forEach(item => {
            const productId = item.productId;
            if (!productStats[productId]) {
                productStats[productId] = {
                    id: productId,
                    name: item.product.nameEn || item.product.nameAr,
                    nameEn: item.product.nameEn,
                    nameAr: item.product.nameAr,
                    price: item.product.price,
                    rating: item.product.rating || 0,
                    totalQuantity: 0,
                    totalRevenue: 0
                };
            }
            productStats[productId].totalQuantity += item.quantity;
            productStats[productId].totalRevenue += item.price * item.quantity;
        });

        // Convert to array and sort
        const bestProducts = Object.values(productStats)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: bestProducts
        });
    } catch (error) {
        console.error('Get best products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching best products',
            error: error.message
        });
    }
};

// Get Driver Performance
exports.getDriverPerformance = async (req, res) => {
    try {
        const { period = 'month', limit = 10 } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get driver stats
        const driverStats = await prisma.foodOrder.groupBy({
            by: ['driverId'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'cancelled' },
                driverId: { not: null }
            },
            _count: { id: true }
        });

        // Get driver details
        const driverIds = driverStats.map(stat => stat.driverId).filter(Boolean);
        const drivers = await prisma.deliveryDriver.findMany({
            where: { id: { in: driverIds } },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        // Combine and sort
        const driverPerformance = driverStats
            .filter(stat => stat.driverId)
            .map(stat => {
                const driver = drivers.find(d => d.id === stat.driverId);
                return {
                    id: stat.driverId,
                    name: driver?.user?.name || 'Unknown',
                    phone: driver?.user?.phone,
                    totalOrders: stat._count.id,
                    rating: driver?.rating || 0,
                    isOnline: driver?.isOnline || false
                };
            })
            .sort((a, b) => b.totalOrders - a.totalOrders)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: driverPerformance
        });
    } catch (error) {
        console.error('Get driver performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching driver performance',
            error: error.message
        });
    }
};

// Get Recent Activities
exports.getRecentActivities = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent activity logs
        const activities = await prisma.activityLog.findMany({
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Format activities
        const formattedActivities = activities.map(activity => ({
            id: activity.id,
            reference: activity.entityId,
            status: activity.action,
            user_name: activity.user?.name || 'System',
            created_at: activity.createdAt
        }));

        res.json({
            success: true,
            data: formattedActivities
        });
    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activities',
            error: error.message
        });
    }
};

// Get Active Orders
exports.getActiveOrders = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get active orders (not delivered, cancelled, or completed)
        const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way'];
        const orders = await prisma.foodOrder.findMany({
            where: {
                status: { in: activeStatuses }
            },
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                driver: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Format orders
        const formattedOrders = orders.map(order => ({
            id: order.id,
            order_number: order.id.substring(0, 8).toUpperCase(),
            customer_name: order.user?.name || 'Unknown',
            status: order.status,
            driver_name: order.driver?.user?.name || null,
            created_at: order.createdAt
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Get active orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active orders',
            error: error.message
        });
    }
};

// Get Support Tickets Statistics
exports.getSupportTicketsStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get support tickets stats
        const [totalTickets, openTickets, closedTickets, ticketsByStatus] = await Promise.all([
            prisma.supportTicket.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.supportTicket.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { in: ['open', 'pending', 'in_progress'] }
                }
            }),
            prisma.supportTicket.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: 'closed'
                }
            }),
            prisma.supportTicket.groupBy({
                by: ['status'],
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: { id: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalTickets,
                open: openTickets,
                closed: closedTickets,
                byStatus: ticketsByStatus.map(s => ({
                    status: s.status,
                    count: s._count.id
                }))
            }
        });
    } catch (error) {
        console.error('Get support tickets stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching support tickets statistics',
            error: error.message
        });
    }
};

// Get Shipping Orders Statistics
exports.getShippingOrdersStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get shipping orders stats
        const [totalShippingOrders, activeShippingOrders, shippingRevenue] = await Promise.all([
            prisma.shippingOrder.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.shippingOrder.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { notIn: ['delivered', 'cancelled'] }
                }
            }),
            prisma.shippingOrder.aggregate({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: 'delivered',
                    finalCost: { not: null }
                },
                _sum: { finalCost: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalShippingOrders,
                active: activeShippingOrders,
                revenue: shippingRevenue._sum.finalCost || 0
            }
        });
    } catch (error) {
        console.error('Get shipping orders stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shipping orders statistics',
            error: error.message
        });
    }
};

// Get Categories Statistics
exports.getCategoriesStats = async (req, res) => {
    try {
        const [totalCategories, activeCategories, categoriesByType] = await Promise.all([
            prisma.category.count(),
            prisma.category.count({
                where: { isActive: true }
            }),
            prisma.category.groupBy({
                by: ['type'],
                _count: { id: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalCategories,
                active: activeCategories,
                inactive: totalCategories - activeCategories,
                byType: categoriesByType.map(c => ({
                    type: c.type,
                    count: c._count.id
                }))
            }
        });
    } catch (error) {
        console.error('Get categories stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories statistics',
            error: error.message
        });
    }
};

// Get Promotions Statistics
exports.getPromotionsStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        const now = new Date();
        const [totalPromotions, activePromotions, expiredPromotions, upcomingPromotions] = await Promise.all([
            prisma.promotion.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.promotion.count({
                where: {
                    isActive: true,
                    startAt: { lte: now },
                    endAt: { gte: now }
                }
            }),
            prisma.promotion.count({
                where: {
                    endAt: { lt: now }
                }
            }),
            prisma.promotion.count({
                where: {
                    startAt: { gt: now }
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalPromotions,
                active: activePromotions,
                expired: expiredPromotions,
                upcoming: upcomingPromotions
            }
        });
    } catch (error) {
        console.error('Get promotions stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching promotions statistics',
            error: error.message
        });
    }
};

// Get Coupons Statistics
exports.getCouponsStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        const now = new Date();
        const [totalCoupons, activeCoupons, expiredCoupons, totalUsage, couponsByDiscountType] = await Promise.all([
            prisma.coupon.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.coupon.count({
                where: {
                    isActive: true,
                    startAt: { lte: now },
                    endAt: { gte: now }
                }
            }),
            prisma.coupon.count({
                where: {
                    endAt: { lt: now }
                }
            }),
            prisma.couponUsage.count({
                where: {
                    usedAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.coupon.groupBy({
                by: ['discountType'],
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: { id: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalCoupons,
                active: activeCoupons,
                expired: expiredCoupons,
                totalUsage: totalUsage,
                byDiscountType: couponsByDiscountType.map(c => ({
                    type: c.discountType,
                    count: c._count.id
                }))
            }
        });
    } catch (error) {
        console.error('Get coupons stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupons statistics',
            error: error.message
        });
    }
};

// Get Ratings Statistics
exports.getRatingsStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        const [totalRatings, averageRating, ratingsByType, ratingsByValue] = await Promise.all([
            prisma.rating.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                }
            }),
            prisma.rating.aggregate({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                },
                _avg: { rating: true }
            }),
            prisma.rating.groupBy({
                by: ['targetType'],
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: { id: true },
                _avg: { rating: true }
            }),
            prisma.rating.groupBy({
                by: ['rating'],
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                },
                _count: { id: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: totalRatings,
                average: averageRating._avg.rating || 0,
                byType: ratingsByType.map(r => ({
                    type: r.targetType,
                    count: r._count.id,
                    average: r._avg.rating || 0
                })),
                byValue: ratingsByValue.map(r => ({
                    rating: r.rating,
                    count: r._count.id
                })).sort((a, b) => b.rating - a.rating)
            }
        });
    } catch (error) {
        console.error('Get ratings stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ratings statistics',
            error: error.message
        });
    }
};

// Get Shipping Agents Performance
exports.getShippingAgentsPerformance = async (req, res) => {
    try {
        const { period = 'month', limit = 10 } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get shipping agent stats
        const agentStats = await prisma.shippingOrder.groupBy({
            by: ['agentId'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                agentId: { not: null }
            },
            _count: { id: true }
        });

        // Get agent details
        const agentIds = agentStats.map(stat => stat.agentId).filter(Boolean);
        const agents = await prisma.shippingAgent.findMany({
            where: { id: { in: agentIds } },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        // Combine and sort
        const agentPerformance = agentStats
            .filter(stat => stat.agentId)
            .map(stat => {
                const agent = agents.find(a => a.id === stat.agentId);
                return {
                    id: stat.agentId,
                    name: agent?.user?.name || 'Unknown',
                    phone: agent?.user?.phone,
                    totalOrders: stat._count.id,
                    rating: agent?.rating || 0,
                    isActive: agent?.isActive || false
                };
            })
            .sort((a, b) => b.totalOrders - a.totalOrders)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            data: agentPerformance
        });
    } catch (error) {
        console.error('Get shipping agents performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shipping agents performance',
            error: error.message
        });
    }
};

// Get Order Status Breakdown
exports.getOrderStatusBreakdown = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        // Get orders by status
        const ordersByStatus = await prisma.foodOrder.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate, lte: endDate }
            },
            _count: { id: true }
        });

        res.json({
            success: true,
            data: ordersByStatus.map(s => ({
                status: s.status,
                count: s._count.id
            }))
        });
    } catch (error) {
        console.error('Get order status breakdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order status breakdown',
            error: error.message
        });
    }
};

