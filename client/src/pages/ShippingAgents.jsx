import { useState, useEffect } from 'react';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    TruckIcon,
    PhoneIcon,
    StarIcon,
    PencilSquareIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const ShippingAgents = () => {
    const { t } = useTranslation();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        vehicleType: 'bike',
        isActive: true
    });

    useEffect(() => {
        fetchAgents();
    }, [search, statusFilter, pagination.page]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                page: pagination.page,
                limit: pagination.limit
            });
            if (statusFilter) params.append('isActive', statusFilter === 'active');
            
            const res = await api.get(`/shipping-agents?${params}`);
            setAgents(res.data.data.agents || []);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            toast.error(t('common.error.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAgent) {
                await api.put(`/shipping-agents/${editingAgent.id}`, formData);
                toast.success(t('common.success.updated'));
            } else {
                await api.post('/shipping-agents', formData);
                toast.success(t('common.success.created'));
            }
            setIsModalOpen(false);
            setEditingAgent(null);
            resetForm();
            fetchAgents();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error.operationFailed'));
        }
    };

    const openEdit = (agent) => {
        setEditingAgent(agent);
        setFormData({
            userId: agent.userId,
            vehicleType: agent.vehicleType,
            isActive: agent.isActive
        });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingAgent(null);
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            vehicleType: 'bike',
            isActive: true
        });
    };

    const deleteAgent = async (id) => {
        if (!window.confirm(t('common.confirm.delete'))) return;
        try {
            await api.delete(`/shipping-agents/${id}`);
            toast.success(t('common.success.deleted'));
            fetchAgents();
        } catch (error) {
            toast.error(t('common.error.deleteFailed'));
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/shipping-agents/${id}`, { isActive: !currentStatus });
            toast.success(t('common.success.updated'));
            fetchAgents();
        } catch (error) {
            toast.error(t('common.error.updateFailed'));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('shippingAgents.title', 'Shipping Agents')}</h1>
                    <p className="text-gray-500">{t('shippingAgents.description', 'Manage shipping agents')}</p>
                </div>
                <button
                    onClick={openNew}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t('common.addNew', 'Add New')}
                </button>
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
                        <option value="active">{t('common.active', 'Active')}</option>
                        <option value="inactive">{t('common.inactive', 'Inactive')}</option>
                    </select>
                </div>
            </div>

            {/* Agents Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    <div className="card overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{t('common.name', 'Name')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{t('common.phone', 'Phone')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{t('shippingAgents.vehicleType', 'Vehicle Type')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{t('common.rating', 'Rating')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">{t('common.status', 'Status')}</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">{t('common.actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                                            {t('shippingAgents.noAgents', 'No shipping agents found')}
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <TruckIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                    <span className="font-medium text-gray-900">{agent.user?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600">{agent.user?.phone || 'N/A'}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                                    {agent.vehicleType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                                    <span className="text-gray-900">{agent.rating?.toFixed(1) || '0.0'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    agent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {agent.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleStatus(agent.id, agent.isActive)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        {agent.isActive ? (
                                                            <XCircleIcon className="w-5 h-5 text-red-600" />
                                                        ) : (
                                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(agent)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAgent(agent.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-5 h-5 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingAgent ? t('shippingAgents.edit', 'Edit Agent') : t('shippingAgents.add', 'Add Agent')}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('common.userId', 'User ID')}
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.userId}
                                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('shippingAgents.vehicleType', 'Vehicle Type')}
                                </label>
                                <select
                                    className="input"
                                    value={formData.vehicleType}
                                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                                    required
                                >
                                    <option value="bike">{t('shippingAgents.bike', 'Bike')}</option>
                                    <option value="car">{t('shippingAgents.car', 'Car')}</option>
                                    <option value="motorcycle">{t('shippingAgents.motorcycle', 'Motorcycle')}</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-4 h-4 text-primary-600 rounded"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                    {t('common.active', 'Active')}
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingAgent(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                >
                                    {editingAgent ? t('common.update', 'Update') : t('common.create', 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingAgents;
