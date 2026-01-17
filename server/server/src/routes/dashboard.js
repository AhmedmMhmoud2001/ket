const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get dashboard KPIs
router.get('/kpis', authorize('admin', 'manager'), dashboardController.getDashboardKPIs);

// Get revenue chart data
router.get('/revenue-chart', authorize('admin', 'manager'), dashboardController.getRevenueChart);

// Get orders analytics
router.get('/orders-analytics', authorize('admin', 'manager'), dashboardController.getOrdersAnalytics);

// Get best performing restaurants
router.get('/best-restaurants', authorize('admin', 'manager'), dashboardController.getBestRestaurants);

// Get best selling products
router.get('/best-products', authorize('admin', 'manager'), dashboardController.getBestProducts);

// Get driver performance
router.get('/driver-performance', authorize('admin', 'manager'), dashboardController.getDriverPerformance);

// Get recent activities
router.get('/recent-activities', authorize('admin', 'manager', 'support'), dashboardController.getRecentActivities);

// Get active orders
router.get('/active-orders', authorize('admin', 'manager', 'support'), dashboardController.getActiveOrders);

// Get support tickets statistics
router.get('/support-tickets-stats', authorize('admin', 'manager', 'support'), dashboardController.getSupportTicketsStats);

// Get shipping orders statistics
router.get('/shipping-orders-stats', authorize('admin', 'manager'), dashboardController.getShippingOrdersStats);

// Get categories statistics
router.get('/categories-stats', authorize('admin', 'manager'), dashboardController.getCategoriesStats);

// Get promotions statistics
router.get('/promotions-stats', authorize('admin', 'manager'), dashboardController.getPromotionsStats);

// Get coupons statistics
router.get('/coupons-stats', authorize('admin', 'manager'), dashboardController.getCouponsStats);

// Get ratings statistics
router.get('/ratings-stats', authorize('admin', 'manager'), dashboardController.getRatingsStats);

// Get shipping agents performance
router.get('/shipping-agents-performance', authorize('admin', 'manager'), dashboardController.getShippingAgentsPerformance);

// Get order status breakdown
router.get('/order-status-breakdown', authorize('admin', 'manager'), dashboardController.getOrderStatusBreakdown);

module.exports = router;
