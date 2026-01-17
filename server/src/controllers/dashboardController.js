const prisma = require('../utils/prisma');

// Get dashboard KPIs
exports.getDashboardKPIs = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // In a real app, you would calculate these based on the period
        // For now, we'll return some aggregated data from the database

        const [revenueCount, ordersCount, customersCount, activeDriversCount] = await Promise.all([
            prisma.foodOrder.aggregate({
                _sum: { totalPrice: true },
                where: { status: 'delivered' }
            }),
            prisma.foodOrder.count(),
            prisma.user.count({
                where: { roles: { some: { role: { name: 'CUSTOMER' } } } }
            }),
            prisma.deliveryDriver.count({
                where: { isOnline: true }
            })
        ]);

        res.json({
            success: true,
            data: {
                revenue: {
                    value: revenueCount._sum.totalPrice || 0,
                    change: 12 // Mock change percentage
                },
                orders: {
                    value: ordersCount,
                    change: 5 // Mock change percentage
                },
                customers: {
                    value: customersCount,
                    change: 8 // Mock change percentage
                },
                active_drivers: {
                    value: activeDriversCount,
                    change: 0
                }
            }
        });
    } catch (error) {
        console.error('KPIs error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get revenue chart data
exports.getRevenueChart = async (req, res) => {
    try {
        // Mock data for the chart as we might not have enough historical data in seeds
        const days = 7;
        const chartData = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            chartData.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 500) + 100 // Random data for visualization
            });
        }

        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Revenue chart error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get orders analytics
exports.getOrdersAnalytics = async (req, res) => {
    try {
        // Mock payment methods distribution
        res.json({
            success: true,
            data: {
                payment_methods: [
                    { name: 'cash', value: 65 },
                    { name: 'card', value: 25 },
                    { name: 'wallet', value: 10 }
                ]
            }
        });
    } catch (error) {
        console.error('Orders analytics error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get best performing restaurants
exports.getBestRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            take: 5,
            orderBy: { rating: 'desc' },
            select: { id: true, nameEn: true, nameAr: true, rating: true }
        });

        res.json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        console.error('Best restaurants error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get best selling products
exports.getBestProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            take: 5,
            orderBy: { rating: 'desc' },
            select: { id: true, nameEn: true, price: true, rating: true }
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Best products error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get driver performance
exports.getDriverPerformance = async (req, res) => {
    try {
        const drivers = await prisma.deliveryDriver.findMany({
            take: 5,
            orderBy: { rating: 'desc' },
            include: {
                user: { select: { name: true } }
            }
        });

        res.json({
            success: true,
            data: drivers
        });
    } catch (error) {
        console.error('Driver performance error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        const activities = await prisma.activityLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } }
            }
        });

        res.json({
            success: true,
            data: activities.map(a => ({
                id: a.id,
                reference: a.entityId.substring(0, 8),
                status: a.action,
                created_at: a.createdAt
            }))
        });
    } catch (error) {
        console.error('Recent activities error:', error);
        // Fallback for demo if no activity logs
        res.json({
            success: true,
            data: [
                { id: 1, reference: 'ORD-001', status: 'New Order', created_at: new Date() },
                { id: 2, reference: 'USR-042', status: 'User Registered', created_at: new Date() }
            ]
        });
    }
};

// Get active orders
exports.getActiveOrders = async (req, res) => {
    try {
        const orders = await prisma.foodOrder.findMany({
            where: {
                status: { in: ['pending', 'preparing', 'ready', 'on_the_way'] }
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
                restaurant: { select: { nameEn: true } },
                driver: { include: { user: { select: { name: true } } } }
            }
        });

        const formattedOrders = orders.map(o => ({
            id: o.id,
            order_number: o.id.substring(0, 6).toUpperCase(),
            customer_name: o.user.name,
            status: o.status,
            driver_name: o.driver?.user?.name || 'Unassigned',
            created_at: o.createdAt
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Active orders error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
