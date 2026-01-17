import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    EyeIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Orders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        payment_status: ''
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'badge-success';
            case 'cancelled': return 'badge-danger';
            case 'on_the_way': return 'badge-info';
            case 'pending': return 'badge-warning';
            default: return 'badge-gray';
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const queryString = new URLSearchParams(filters).toString();
            const response = await api.get(`/orders?${queryString}`);
            setOrders(response.data.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-2">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer Name..."
                            className="input pl-10"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="input"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="on_the_way">On the way</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        className="input"
                        value={filters.payment_status}
                        onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                    >
                        <option value="">Payment Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className="card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Restaurant</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        #{order.order_number || order.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{order.customer_name}</div>
                                        <div className="text-xs text-gray-400">{order.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{order.restaurant_name}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        ${order.total_amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${getStatusColor(order.status)} uppercase`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-1" />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
