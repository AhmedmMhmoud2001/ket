import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    MapPinIcon,
    PhoneIcon,
    UserIcon,
    TruckIcon,
    MapIcon,
    BuildingStorefrontIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
        fetchDrivers();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data.data);
        } catch (error) {
            toast.error('Error fetching order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            // TODO: Implement driver API endpoint
            // const response = await api.get('/drivers?status=available');
            // setDrivers(response.data.data.drivers);
            setDrivers([]);
        } catch (error) {
            console.error('Error fetching drivers', error);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            await api.patch(`/orders/${id}/status`, { status: newStatus });
            toast.success('Status updated successfully');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const updatePaymentStatus = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            await api.patch(`/orders/${id}/payment-status`, { payment_status: newStatus });
            toast.success('Payment status updated successfully');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to update payment status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const assignDriver = async (driverId) => {
        if (!driverId) return;
        try {
            setAssigning(true);
            await api.patch(`/orders/${id}/assign-driver`, { driver_id: driverId });
            toast.success('Driver assigned successfully');
            fetchOrderDetails();
        } catch (error) {
            toast.error('Failed to assign driver');
        } finally {
            setAssigning(false);
        }
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'delivered': return 'badge-success';
            case 'cancelled': return 'badge-danger';
            case 'out_for_delivery': return 'badge-info';
            case 'preparing': return 'badge-warning';
            case 'ready': return 'badge-info';
            case 'confirmed': return 'badge-info';
            case 'pending': return 'badge-warning';
            default: return 'badge-gray';
        }
    };

    const getPaymentStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'paid': return 'badge-success';
            case 'failed': return 'badge-danger';
            case 'refunded': return 'badge-warning';
            case 'pending': return 'badge-warning';
            default: return 'badge-gray';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <XCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Order not found</p>
                <Link to="/orders" className="btn btn-primary mt-4">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Orders
                </Link>
            </div>
        );
    }

    const orderItems = order.items || order.order_items || [];
    const orderStatus = order.status || 'PENDING';
    const paymentStatus = order.paymentStatus || order.payment_status || 'PENDING';

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/orders" className="text-gray-400 hover:text-gray-600">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.orderNumber || order.order_number || id.slice(0, 8)}
                        </h1>
                        <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <ClockIcon className="w-4 h-4" />
                            {new Date(order.createdAt || order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <select
                        className="input w-auto capitalize font-bold"
                        value={orderStatus}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={updatingStatus}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Order Status</p>
                            <span className={`badge ${getStatusColor(orderStatus)} mt-2`}>
                                {orderStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <CheckCircleIcon className={`w-8 h-8 ${orderStatus === 'DELIVERED' ? 'text-green-500' : 'text-gray-300'}`} />
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <span className={`badge ${getPaymentStatusColor(paymentStatus)} mt-2`}>
                                {paymentStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <select
                            className="input text-sm w-auto"
                            value={paymentStatus}
                            onChange={(e) => updatePaymentStatus(e.target.value)}
                            disabled={updatingStatus}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-1">
                                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                                {order.total || order.total_amount || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Order Items</h2>
                        <div className="space-y-4">
                            {orderItems.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No items found</p>
                            ) : (
                                orderItems.map((item, index) => (
                                    <div key={item.id || index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                        <div className="flex space-x-4 flex-1">
                                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-sm font-bold text-primary-700">
                                                {item.quantity}x
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {item.product?.name || item.product_name || 'Product'}
                                                </p>
                                                {item.product?.images?.[0] && (
                                                    <img
                                                        src={item.product.images[0].startsWith('http')
                                                            ? item.product.images[0]
                                                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${item.product.images[0]}`}
                                                        alt={item.product.name}
                                                        className="w-16 h-16 object-cover rounded mt-2"
                                                    />
                                                )}
                                                {item.extras && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Extras: {typeof item.extras === 'string'
                                                            ? item.extras
                                                            : JSON.stringify(item.extras)}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-sm text-gray-500 mt-1 italic">
                                                        Note: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                ${item.subtotal || item.price || 0}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ${item.price || 0} each
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div className="border-t pt-4 mt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${order.subtotal || 0}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-${order.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>${order.deliveryFee || order.delivery_fee || 0}</span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>${order.tax}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                                    <span>Total</span>
                                    <span>${order.total || order.total_amount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Address */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Delivery Details</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                                    <UserIcon className="w-5 h-5 mr-2 text-primary-600" />
                                    Customer Information
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-gray-900 font-medium">
                                        {order.user?.firstName && order.user?.lastName
                                            ? `${order.user.firstName} ${order.user.lastName}`
                                            : order.customer_name || 'N/A'}
                                    </p>
                                    <p className="text-gray-500 text-sm flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-2" />
                                        {order.user?.phone || order.customer_phone || 'N/A'}
                                    </p>
                                    {order.user?.email && (
                                        <p className="text-gray-500 text-sm">
                                            {order.user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                                    <MapPinIcon className="w-5 h-5 mr-2 text-primary-600" />
                                    Delivery Address
                                </h3>
                                {order.address ? (
                                    <div className="space-y-1">
                                        <p className="text-gray-900 text-sm">
                                            {order.address.street || ''}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {order.address.city || ''}, {order.address.state || ''}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {order.address.postalCode || ''}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">
                                        {order.delivery_address || 'No address provided'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Driver & Restaurant */}
                <div className="space-y-6">
                    {/* Driver Assignment */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                            <TruckIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Driver Assignment
                        </h2>
                        {order.driver ? (
                            <div>
                                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                    {order.driver.user?.avatar ? (
                                        <img
                                            src={order.driver.user.avatar.startsWith('http')
                                                ? order.driver.user.avatar
                                                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${order.driver.user.avatar}`}
                                            alt="Driver"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <TruckIcon className="w-6 h-6 text-primary-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {order.driver.user?.firstName && order.driver.user?.lastName
                                                ? `${order.driver.user.firstName} ${order.driver.user.lastName}`
                                                : order.driver_name || 'Driver'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.driver.user?.phone || order.driver_phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Change driver for this order?')) {
                                            // Implement change driver logic
                                        }
                                    }}
                                    className="w-full btn btn-secondary text-sm"
                                >
                                    Change Driver
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                                    No driver assigned yet.
                                </p>
                                {drivers.length > 0 ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Driver
                                        </label>
                                        <select
                                            className="input"
                                            onChange={(e) => assignDriver(e.target.value)}
                                            disabled={assigning}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select a driver...</option>
                                            {drivers.map(driver => (
                                                <option key={driver.id} value={driver.id}>
                                                    {driver.full_name} ({driver.vehicle_type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No available drivers at the moment.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                            <BuildingStorefrontIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Restaurant
                        </h2>
                        {order.restaurant ? (
                            <div>
                                {order.restaurant.logo && (
                                    <img
                                        src={order.restaurant.logo.startsWith('http')
                                            ? order.restaurant.logo
                                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${order.restaurant.logo}`}
                                        alt={order.restaurant.name}
                                        className="w-20 h-20 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <p className="font-bold text-gray-900">
                                    {order.restaurant.name || order.restaurant_name}
                                </p>
                                {order.restaurant.address && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.restaurant.address}
                                    </p>
                                )}
                                {order.restaurant.phone && (
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-1" />
                                        {order.restaurant.phone}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                {order.restaurant_name || 'Restaurant information not available'}
                            </p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                            Payment Information
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-medium">
                                    {order.paymentMethod || order.payment_method || 'Cash'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`badge ${getPaymentStatusColor(paymentStatus)}`}>
                                    {paymentStatus.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
