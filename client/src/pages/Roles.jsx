import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheckIcon,
    UsersIcon,
    EyeIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Roles = () => {
    const { t } = useTranslation();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showPermissions, setShowPermissions] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/roles');
            setRoles(response.data.data.roles || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const viewPermissions = (role) => {
        setSelectedRole(role);
        setShowPermissions(true);
    };

    const getRoleColor = (roleId) => {
        const colors = {
            'SUPER_ADMIN': 'purple',
            'RESTAURANT_MANAGER': 'blue',
            'SUPPORT_AGENT': 'green',
            'ANALYST': 'yellow',
            'DRIVER': 'orange',
            'CUSTOMER': 'gray'
        };
        return colors[roleId] || 'gray';
    };

    const getRoleIcon = (roleId) => {
        return <ShieldCheckIcon className="w-6 h-6" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-500 mt-1">Manage user roles and their access levels</p>
                </div>
                <Link 
                    to="/roles/permissions" 
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-all transform hover:scale-105 shadow-sm"
                >
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    View All Permissions
                </Link>
            </div>

            {/* Roles Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => {
                        const color = getRoleColor(role.id);
                        const permissionCount = Object.values(role.permissions || {}).reduce(
                            (acc, perms) => acc + perms.length, 0
                        );

                        return (
                            <div
                                key={role.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
                            >
                                {/* Header */}
                                <div className={`bg-${color}-50 border-b border-${color}-100 p-6`}>
                                    <div className="flex items-start justify-between">
                                        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform`}>
                                            {getRoleIcon(role.id)}
                                        </div>
                                        {role.isSystem && (
                                            <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 text-xs font-semibold rounded-full`}>
                                                System
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mt-4">
                                        {role.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                        {role.description}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-600">
                                            <UsersIcon className="w-5 h-5 mr-2" />
                                            <span className="text-sm">Users</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {role.userCount || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-gray-600">
                                            <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                            <span className="text-sm">Permissions</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {permissionCount}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                                        <button
                                            onClick={() => viewPermissions(role)}
                                            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                                        >
                                            <EyeIcon className="w-5 h-5 mr-2" />
                                            View Details
                                        </button>
                                        <Link
                                            to={`/users?role=${role.id}`}
                                            className="flex items-center justify-center px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-medium transition-colors"
                                        >
                                            <UsersIcon className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Permissions Modal */}
            {showPermissions && selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className={`px-6 py-4 border-b border-gray-100 bg-${getRoleColor(selectedRole.id)}-50`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-${getRoleColor(selectedRole.id)}-100 rounded-lg flex items-center justify-center text-${getRoleColor(selectedRole.id)}-600`}>
                                        {getRoleIcon(selectedRole.id)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedRole.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedRole.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPermissions(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Permissions List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {Object.keys(selectedRole.permissions).length === 0 ? (
                                <div className="text-center py-12">
                                    <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">This role has no specific permissions assigned.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(selectedRole.permissions).map(([module, permissions]) => (
                                        <div key={module} className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 capitalize mb-3 flex items-center">
                                                <ChevronRightIcon className="w-5 h-5 mr-2 text-primary-600" />
                                                {module}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {permissions.map((permission) => (
                                                    <span
                                                        key={permission}
                                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg font-medium capitalize"
                                                    >
                                                        {permission.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPermissions(false)}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <Link
                                to={`/users?role=${selectedRole.id}`}
                                onClick={() => setShowPermissions(false)}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
                            >
                                <UsersIcon className="w-5 h-5 mr-2" />
                                View Users
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;

