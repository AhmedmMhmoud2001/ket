import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CurrencyDollarIcon,
    ShoppingBagIcon,
    StarIcon,
    ShoppingCartIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const KPICard = ({ title, value, change, icon: Icon, color, subValue }) => {
    const isPositive = change >= 0;

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                    {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {change !== undefined && (
                <div className="mt-4 flex items-center">
                    <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                        {Math.abs(change)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                </div>
            )}
        </div>
    );
};

const RestaurantOwnerDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [restaurantRes, statsRes, ordersRes] = await Promise.all([
                api.get('/restaurant-owner/restaurant'),
                api.get('/restaurant-owner/statistics'),
                api.get('/restaurant-owner/orders?limit=5')
            ]);

            setRestaurant(restaurantRes.data.data);
            setStats(statsRes.data.data);
            setRecentOrders(ordersRes.data.data.orders || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {restaurant?.name || t('restaurantOwner.dashboard')}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {t('restaurantOwner.welcomeMessage')}
                    </p>
                </div>
                <Link
                    to="/restaurant-owner/restaurant/edit"
                    className="btn btn-primary"
                >
                    {t('restaurantOwner.editRestaurant')}
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title={t('restaurantOwner.totalProducts')}
                    value={stats?.totalProducts || 0}
                    icon={ShoppingBagIcon}
                    color="blue"
                />
                <KPICard
                    title={t('restaurantOwner.totalOrders')}
                    value={stats?.totalOrders || 0}
                    icon={ShoppingCartIcon}
                    color="green"
                />
                <KPICard
                    title={t('restaurantOwner.totalRevenue')}
                    value={`${(stats?.totalRevenue || 0).toFixed(2)} ${t('common.currency')}`}
                    icon={CurrencyDollarIcon}
                    color="purple"
                />
                <KPICard
                    title={t('restaurantOwner.averageRating')}
                    value={stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                    subValue={`${stats?.totalReviews || 0} ${t('restaurantOwner.reviews')}`}
                    icon={StarIcon}
                    color="orange"
                />
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('restaurantOwner.todayStats')}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">{t('restaurantOwner.todayOrders')}</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {stats?.todayOrders || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">{t('restaurantOwner.todayRevenue')}</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {`${(stats?.todayRevenue || 0).toFixed(2)} ${t('common.currency')}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('restaurantOwner.restaurantInfo')}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">{t('restaurantOwner.status')}</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                                restaurant?.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {restaurant?.status || 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">{t('restaurantOwner.isOpen')}</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                                restaurant?.isOpen 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {restaurant?.isOpen ? t('common.yes') : t('common.no')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">{t('restaurantOwner.deliveryFee')}</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {`${restaurant?.deliveryFee || 0} ${t('common.currency')}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t('restaurantOwner.recentOrders')}
                    </h3>
                    <Link
                        to="/restaurant-owner/orders"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        {t('common.viewAll')}
                    </Link>
                </div>
                {recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {t('restaurantOwner.noOrders')}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.orderNumber')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.customer')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.total')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.status')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('common.date')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {`${order.total} ${t('common.currency')}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/restaurant-owner/products"
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {t('restaurantOwner.manageProducts')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {t('restaurantOwner.addEditProducts')}
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/restaurant-owner/orders"
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <ShoppingCartIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {t('restaurantOwner.viewOrders')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {t('restaurantOwner.manageOrders')}
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/restaurant-owner/restaurant/edit"
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {t('restaurantOwner.restaurantSettings')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {t('restaurantOwner.updateInfo')}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default RestaurantOwnerDashboard;

