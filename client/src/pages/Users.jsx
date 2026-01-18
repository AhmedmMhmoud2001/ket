import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    TrashIcon,
    PlusIcon,
    PencilSquareIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Users = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [search, selectedRole, pagination.page]);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(res.data.data.roles || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                search,
                page: pagination.page,
                limit: pagination.limit
            });
            if (selectedRole) {
                queryParams.append('roleId', selectedRole);
            }
            const res = await api.get(`/users?${queryParams.toString()}`);
            setUsers(res.data.data.users);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadgeColor = (roles) => {
        if (!roles) return 'bg-gray-100 text-gray-700 border-gray-200';
        const roleStr = roles.join(',').toUpperCase();
        if (roleStr.includes('ADMIN')) return 'bg-red-100 text-red-700 border-red-200';
        if (roleStr.includes('RESTAURANT_OWNER')) return 'bg-purple-100 text-purple-700 border-purple-200';
        if (roleStr.includes('DRIVER')) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
                    <p className="text-gray-500">Manage all system users and their roles</p>
                </div>
                <Link to="/users/new" className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-1" />
                    {t('common.add')} User
                </Link>
            </div>

            <div className="card">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Search by name, email or phone..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            className="input"
                            value={selectedRole}
                            onChange={e => {
                                setSelectedRole(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">{t('users.title')}</th>
                                <th className="px-6 py-4">{t('users.roles')}</th>
                                <th className="px-6 py-4">{t('common.status')}</th>
                                <th className="px-6 py-4">{t('users.joinedAt')}</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        {t('users.noUsers')}
                                    </td>
                                </tr>
                            ) : users.map(user => {
                                const userRoles = user.roleNames || user.roles?.map(ur => ur.role?.name || ur.roleName) || [];
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold uppercase overflow-hidden">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar.startsWith('http')
                                                                ? user.avatar
                                                                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${user.avatar}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = ''; // Fallback
                                                            }}
                                                        />
                                                    ) : (
                                                        user.name?.charAt(0) || <UserCircleIcon className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                                                    <div className="flex flex-col text-xs text-gray-500">
                                                        <span className="flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" /> {user.email}</span>
                                                        <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {user.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {userRoles.map(role => (
                                                    <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadgeColor([role])}`}>
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    to={`/users/${user.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                                                    title={user.isActive ? 'Ban User' : 'Activate User'}
                                                >
                                                    {user.isActive ? <NoSymbolIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
