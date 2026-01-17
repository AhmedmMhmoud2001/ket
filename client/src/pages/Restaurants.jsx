import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    BuildingStorefrontIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    PencilSquareIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Restaurants = () => {
    const { t, i18n } = useTranslation();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchRestaurants();
    }, [search, statusFilter, pagination.page]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search,
                page: pagination.page,
                limit: pagination.limit
            });
            if (statusFilter) params.append('isActive', statusFilter === 'active');
            
            const res = await api.get(`/restaurants?${params}`);
            setRestaurants(res.data.data.restaurants || []);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            toast.error(t('common.error.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/restaurants/${id}`, { isActive: !currentStatus });
            toast.success(t('common.success.updated'));
            fetchRestaurants();
        } catch (error) {
            toast.error(t('common.error.updateFailed'));
        }
    };

    const deleteRestaurant = async (id) => {
        if (!window.confirm(t('common.confirm.delete'))) return;
        try {
            await api.delete(`/restaurants/${id}`);
            toast.success(t('common.success.deleted'));
            fetchRestaurants();
        } catch (error) {
            toast.error(t('common.error.deleteFailed'));
        }
    };

    const getName = (restaurant) => {
        return i18n.language === 'ar' ? restaurant.nameAr : restaurant.nameEn;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('restaurants.title', 'Restaurants')}</h1>
                    <p className="text-gray-500">{t('restaurants.description', 'Manage all restaurants')}</p>
                </div>
                <Link
                    to="/restaurants/new"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t('common.addNew', 'Add New')}
                </Link>
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

            {/* Restaurants Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : restaurants.length === 0 ? (
                <div className="card text-center py-12">
                    <BuildingStorefrontIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('restaurants.noRestaurants', 'No restaurants found')}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <div key={restaurant.id} className="card hover:shadow-lg transition-shadow">
                                {/* Restaurant Image */}
                                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                    {restaurant.logo ? (
                                        <img src={`${import.meta.env.VITE_API_URL}/uploads/restaurants/logos/${restaurant.logo}`} alt={getName(restaurant)} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BuildingStorefrontIcon className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                                        restaurant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {restaurant.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                    </div>
                                </div>

                                {/* Restaurant Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{getName(restaurant)}</h3>
                                    
                                    {restaurant.category && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            {i18n.language === 'ar' ? restaurant.category.nameAr : restaurant.category.nameEn}
                                        </p>
                                    )}

                                    {restaurant.owner && (
                                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center">
                                                <EnvelopeIcon className="w-4 h-4 mr-2" />
                                                <span>{restaurant.owner.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <PhoneIcon className="w-4 h-4 mr-2" />
                                                <span>{restaurant.owner.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => toggleStatus(restaurant.id, restaurant.isActive)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                restaurant.isActive
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                        >
                                            {restaurant.isActive ? (
                                                <>
                                                    <XCircleIcon className="w-4 h-4 inline mr-1" />
                                                    {t('common.deactivate', 'Deactivate')}
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                                    {t('common.activate', 'Activate')}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => deleteRestaurant(restaurant.id)}
                                            className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
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

export default Restaurants;
