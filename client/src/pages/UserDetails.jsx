import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    ArrowLeftIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/users/${id}`);
            setUser(res.data.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async () => {
        try {
            await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
            toast.success('User status updated');
            fetchUserDetails();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteUser = async () => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await api.delete(`/users/${user.id}`);
            toast.success('User deleted');
            navigate('/users');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadgeColor = (role) => {
        if (role === 'ADMIN') return 'bg-red-100 text-red-700 border-red-200';
        if (role === 'RESTAURANT_OWNER') return 'bg-purple-100 text-purple-700 border-purple-200';
        if (role === 'DRIVER') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">User not found</p>
                <Link to="/users" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                    Back to Users
                </Link>
            </div>
        );
    }

    const userRoles = (user.roles || user.userrole)?.map(ur => ur.role?.name || ur.roleName) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/users"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('users.userDetails')}</h1>
                        <p className="text-gray-500">View complete user information</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={toggleUserStatus}
                        className={`btn ${user.isActive ? 'btn-secondary' : 'btn-primary'}`}
                    >
                        {user.isActive ? (
                            <>
                                <NoSymbolIcon className="w-4 h-4 mr-2" />
                                Ban User
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Activate User
                            </>
                        )}
                    </button>
                    <button
                        onClick={deleteUser}
                        className="btn btn-danger"
                    >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-500">Full Name</label>
                                <p className="text-gray-900 font-medium mt-1">{user.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 flex items-center gap-2">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    Email
                                </label>
                                <p className="text-gray-900 font-medium mt-1">{user.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4" />
                                    Phone
                                </label>
                                <p className="text-gray-900 font-medium mt-1">{user.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">{t('common.status')}</label>
                                <div className="mt-1">
                                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {user.isActive ? 'Active' : 'Banned'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roles & Permissions */}
                    {userRoles.length > 0 && (
                        <div className="card">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                                Roles & Permissions
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {userRoles.map(role => (
                                    <span
                                        key={role}
                                        className={`px-3 py-2 rounded-lg text-sm font-bold uppercase border ${getRoleBadgeColor(role)}`}
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Account Information */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary-600" />
                            Account Information
                        </h2>
                        <div className="space-y-4">
                            {user.createdAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">{t('users.joinedAt')}</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                            {user.updatedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4" />
                                        Last Updated
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(user.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Avatar Card */}
                    <div className="card text-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-4xl mx-auto mb-4 shadow-lg overflow-hidden border-2 border-white">
                            {user.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                                    {user.name?.charAt(0)?.toUpperCase() || <UserCircleIcon className="w-16 h-16" />}
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name || 'No Name'}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-4">
                            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {user.isActive ? 'Active' : 'Banned'}
                            </span>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {(user.address || user.city || user.country) && (
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5 text-primary-600" />
                                Location
                            </h3>
                            <div className="space-y-2 text-sm">
                                {user.address && <p className="text-gray-700">{user.address}</p>}
                                {(user.city || user.country) && (
                                    <p className="text-gray-500">
                                        {[user.city, user.country].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;

