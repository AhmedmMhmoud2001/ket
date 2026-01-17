import { useState, useEffect } from 'react';
import {
    BellIcon,
    CheckCircleIcon,
    TrashIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    ShoppingBagIcon,
    UserIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Notifications = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    useEffect(() => {
        fetchNotifications();
    }, [pagination.page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/notifications?page=${pagination.page}&limit=${pagination.limit}`);
            setNotifications(response.data.data.notifications);
            if (response.data.data.pagination) {
                setPagination(prev => ({
                    ...prev,
                    ...response.data.data.pagination
                }));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingBagIcon className="w-6 h-6 text-blue-500" />;
            case 'driver': return <UserIcon className="w-6 h-6 text-green-500" />;
            case 'alert': return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
            default: return <InformationCircleIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 mt-1">Updates and alerts for your store</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={markAllAsRead}
                        className="btn btn-secondary flex items-center"
                        disabled={notifications.every(n => n.is_read)}
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Mark all as read
                    </button>
                    <button
                        onClick={fetchNotifications}
                        className="btn btn-ghost p-2"
                        title="Refresh"
                    >
                        <BellIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-4 mt-1">
                                        <div className={`p-2 rounded-full ${!notification.is_read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                                <span className="text-xs text-gray-400 flex items-center">
                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                    {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                                                        title="Mark as read"
                                                    >
                                                        <span className="h-2 w-2 rounded-full bg-blue-600 block"></span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
