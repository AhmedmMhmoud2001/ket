import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    TruckIcon,
    MapPinIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const ShippingOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchOrders();
    }, [search, statusFilter, pagination.page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit
            });
            if (statusFilter) params.append('status', statusFilter);
            
            const res = await api.get(`/shipping-orders?${params}`);
            setOrders(res.data.data.orders || []);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(t('common.error.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'ACCEPTED': 'bg-blue-100 text-blue-700',
            'PICKED_UP': 'bg-purple-100 text-purple-700',
            'IN_TRANSIT': 'bg-indigo-100 text-indigo-700',
            'DELIVERED': 'bg-green-100 text-green-700',
            'CANCELLED': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('shippingOrders.title', 'Shipping Orders')}</h1>
                <p className="text-gray-500">{t('shippingOrders.description', 'Manage shipping orders')}</p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder={t('common.search', 'Search...')}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">{t('common.allStatuses', 'All Statuses')}</option>
                        <option value="PENDING">{t('shippingOrders.status.pending', 'Pending')}</option>
                        <option value="ACCEPTED">{t('shippingOrders.status.accepted', 'Accepted')}</option>
                        <option value="PICKED_UP">{t('shippingOrders.status.pickedUp', 'Picked Up')}</option>
                        <option value="IN_TRANSIT">{t('shippingOrders.status.inTransit', 'In Transit')}</option>
                        <option value="DELIVERED">{t('shippingOrders.status.delivered', 'Delivered')}</option>
                        <option value="CANCELLED">{t('shippingOrders.status.cancelled', 'Cancelled')}</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="card text-center py-12">
                    <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('shippingOrders.noOrders', 'No shipping orders found')}</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <TruckIcon className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {t('shippingOrders.order', 'Order')} #{order.id.slice(0, 8)}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        {order.user && (
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">{t('shippingOrders.customer', 'Customer')}:</span> {order.user.name}
                                                </div>
                                                {order.user.phone && (
                                                    <div>
                                                        <span className="font-medium">{t('common.phone', 'Phone')}:</span> {order.user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Agent Info */}
                                        {order.agent && (
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">{t('shippingOrders.agent', 'Agent')}:</span> {order.agent.user?.name || 'N/A'}
                                                </div>
                                                {order.agent.user?.phone && (
                                                    <div>
                                                        <span className="font-medium">{t('common.phone', 'Phone')}:</span> {order.agent.user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Locations */}
                                        <div className="flex items-start gap-4 text-sm text-gray-600">
                                            <div className="flex items-start gap-2">
                                                <MapPinIcon className="w-4 h-4 mt-0.5 text-green-600" />
                                                <div>
                                                    <span className="font-medium">{t('shippingOrders.pickup', 'Pickup')}:</span>
                                                    <div className="text-xs">{order.pickupLat}, {order.pickupLng}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPinIcon className="w-4 h-4 mt-0.5 text-red-600" />
                                                <div>
                                                    <span className="font-medium">{t('shippingOrders.delivery', 'Delivery')}:</span>
                                                    <div className="text-xs">{order.deliveryLat}, {order.deliveryLng}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost */}
                                        {order.expectedCost && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                                                <span className="font-semibold text-gray-900">
                                                    {order.expectedCost} {t('common.currency', 'EGP')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col items-end gap-3">
                                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                        <Link
                                            to={`/shipping-orders/${order.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-2" />
                                            {t('common.view', 'View Details')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ShippingOrders;
