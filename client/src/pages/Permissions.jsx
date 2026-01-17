import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheckIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Permissions = () => {
    const { t } = useTranslation();
    const [permissions, setPermissions] = useState({});
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [permsResponse, rolesResponse] = await Promise.all([
                api.get('/roles/permissions'),
                api.get('/roles')
            ]);

            setPermissions(permsResponse.data.data || {});
            setRoles(rolesResponse.data.data.roles || []);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    const getRolesWithPermission = (module, permission) => {
        return roles.filter(role => 
            role.permissions[module]?.includes(permission)
        );
    };

    const getModuleIcon = (module) => {
        const icons = {
            users: '👥',
            restaurants: '🏪',
            categories: '📑',
            subcategories: '📁',
            products: '🛍️',
            orders: '📦',
            drivers: '🚗',
            offers: '🎁',
            coupons: '🎫',
            reviews: '⭐',
            support: '💬',
            settings: '⚙️',
            logs: '📋',
            reports: '📊'
        };
        return icons[module] || '📌';
    };

    const getPermissionColor = (permission) => {
        if (permission.includes('delete')) return 'text-red-600 bg-red-50 border-red-200';
        if (permission.includes('edit') || permission.includes('manage')) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (permission.includes('create')) return 'text-green-600 bg-green-50 border-green-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/roles"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Permissions</h1>
                        <p className="text-gray-500 mt-1">Complete list of available system permissions</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(permissions).map(([module, modulePermissions]) => (
                        <div
                            key={module}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            {/* Module Header */}
                            <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 p-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getModuleIcon(module)}</span>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 capitalize">
                                            {module}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {modulePermissions.length} permission{modulePermissions.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedModule(selectedModule === module ? null : module)}
                                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                    >
                                        <ChevronRightIcon 
                                            className={`w-5 h-5 text-gray-600 transition-transform ${
                                                selectedModule === module ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Permissions List */}
                            <div className="p-5">
                                <div className="space-y-3">
                                    {modulePermissions.map((permission) => {
                                        const rolesWithPerm = getRolesWithPermission(module, permission);
                                        
                                        return (
                                            <div
                                                key={permission}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    <span className="font-medium text-gray-900 capitalize">
                                                        {permission.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {rolesWithPerm.length > 0 ? (
                                                        <div className="flex -space-x-1">
                                                            {rolesWithPerm.slice(0, 3).map((role) => (
                                                                <div
                                                                    key={role.id}
                                                                    className="w-7 h-7 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                                                    title={role.name}
                                                                >
                                                                    {role.name.charAt(0)}
                                                                </div>
                                                            ))}
                                                            {rolesWithPerm.length > 3 && (
                                                                <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                                                    +{rolesWithPerm.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No roles</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Module Details (Expandable) */}
                            {selectedModule === module && (
                                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Roles with access:</h4>
                                    <div className="space-y-2">
                                        {roles.filter(role => role.permissions[module]?.length > 0).map((role) => (
                                            <Link
                                                key={role.id}
                                                to={`/users?role=${role.id}`}
                                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <span className="font-medium text-gray-900">{role.name}</span>
                                                <span className="text-sm text-gray-500">
                                                    {role.permissions[module].length} permission{role.permissions[module].length !== 1 ? 's' : ''}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Permission Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Permission Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">View - Read access</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">Create - Add new items</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-gray-700">Edit - Modify existing</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-700">Delete - Remove items</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Permissions;

