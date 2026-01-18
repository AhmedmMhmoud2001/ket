import { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    TagIcon,
    PhotoIcon,
    XMarkIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Offers = () => {
    const { t } = useTranslation();
    const [offers, setOffers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        image_url: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        min_order_amount: 0,
        restaurant_id: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchOffers();
        fetchRestaurants();
    }, [search, pagination.page]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/offers?search=${search}&page=${pagination.page}&limit=${pagination.limit}`);
            setOffers(res.data.data.offers);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/restaurants?is_active=true');
            setRestaurants(res.data.data.restaurants);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image_url: '' });
    };

    const uploadImage = async () => {
        if (!imageFile) {
            return formData.image_url;
        }

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('offer_image', imageFile);

            const response = await api.post('/upload/offer', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data.data.image;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading image');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates
        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (startDate > endDate) {
                toast.error('Start date cannot be after end date');
                return;
            }
        }

        // Validate discount value
        if (formData.discount_type === 'PERCENTAGE' && parseFloat(formData.discount_value) > 100) {
            toast.error('Discount percentage cannot be greater than 100%');
            return;
        }

        if (parseFloat(formData.discount_value) <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }

        try {
            // Upload image first if new image selected
            const imageUrl = await uploadImage();

            const submitData = {
                ...formData,
                image_url: imageUrl || formData.image_url
            };

            if (editingOffer) {
                await api.put(`/offers/${editingOffer.id}`, submitData);
                toast.success('Offer updated');
            } else {
                await api.post('/offers', submitData);
                toast.success('Offer created');
            }
            setIsModalOpen(false);
            setEditingOffer(null);
            resetForm();
            fetchOffers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const openEdit = (offer) => {
        setEditingOffer(offer);
        setImageFile(null);
        setFormData({
            title: offer.title,
            title_ar: offer.title_ar || '',
            description: offer.description || '',
            description_ar: offer.description_ar || '',
            image_url: offer.image_url || '',
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            min_order_amount: offer.min_order_amount || 0,
            restaurant_id: offer.restaurant_id || '',
            start_date: offer.start_date?.split('T')[0] || '',
            end_date: offer.end_date?.split('T')[0] || '',
            is_active: offer.is_active
        });

        // Set image preview
        if (offer.image_url) {
            setImagePreview(
                offer.image_url.startsWith('http')
                    ? offer.image_url
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${offer.image_url}`
            );
        } else {
            setImagePreview(null);
        }

        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingOffer(null);
        setImageFile(null);
        setImagePreview(null);
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            title_ar: '',
            description: '',
            description_ar: '',
            image_url: '',
            discount_type: 'PERCENTAGE',
            discount_value: '',
            min_order_amount: 0,
            restaurant_id: '',
            start_date: '',
            end_date: '',
            is_active: true
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this offer?')) return;
        try {
            await api.delete(`/offers/${id}`);
            toast.success('Offer deleted');
            fetchOffers();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const isExpired = (endDate) => {
        return new Date(endDate) < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
                    <p className="text-gray-500">Manage promotional banners and special deals</p>
                </div>
                <button onClick={openNew} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" /> New Offer
                </button>
            </div>

            <div className="card">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search offers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Offer</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Restaurant</th>
                                <th className="px-6 py-4">Valid Period</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : offers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No offers found. Create your first offer!
                                    </td>
                                </tr>
                            ) : offers.map(offer => (
                                <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {offer.image_url ? (
                                                    <img
                                                        src={offer.image_url.startsWith('http') ? offer.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${offer.image_url}`}
                                                        alt={offer.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <TagIcon className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-gray-900">{offer.title}</div>
                                                {offer.title_ar && (
                                                    <div className="text-sm text-gray-600 font-medium">{offer.title_ar}</div>
                                                )}
                                                {offer.description && (
                                                    <div className="text-sm text-gray-500 mt-1 truncate max-w-md">
                                                        {offer.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-primary-600">
                                                {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}%` :
                                                    offer.discount_type === 'BUY_ONE_GET_ONE' ? 'BOGO' :
                                                        `$${offer.discount_value}`}
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase">
                                                {offer.discount_type === 'PERCENTAGE' ? 'OFF' :
                                                    offer.discount_type === 'BUY_ONE_GET_ONE' ? 'DEAL' :
                                                        'DISCOUNT'}
                                            </span>
                                            {offer.min_order_amount > 0 && (
                                                <span className="text-xs text-gray-400 mt-1">
                                                    Min: ${offer.min_order_amount}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {offer.restaurant_name || 'All Restaurants'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center text-gray-600">
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                <span>{new Date(offer.start_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-gray-400">
                                                → {new Date(offer.end_date).toLocaleDateString()}
                                            </div>
                                            {isExpired(offer.end_date) && (
                                                <span className="text-xs text-red-500 mt-1">Expired</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${offer.is_active && !isExpired(offer.end_date) ? 'badge-success' : 'badge-danger'}`}>
                                            {offer.is_active && !isExpired(offer.end_date) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(offer)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(offer.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Offer Image */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-primary-400 transition-colors">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Offer preview"
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600 font-medium">Upload Offer Banner</span>
                                        <span className="text-xs text-gray-400 mt-1">1200x600 recommended, max 5MB</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (EN) *</label>
                                    <input required type="text" className="input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (AR)</label>
                                    <input type="text" className="input" value={formData.title_ar} onChange={e => setFormData({ ...formData, title_ar: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (EN)</label>
                                <textarea rows="2" className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Type *</label>
                                    <select required className="input" value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })}>
                                        <option value="PERCENTAGE">Percentage</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount</option>
                                        <option value="BUY_ONE_GET_ONE">Buy 1 Get 1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Value *</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={formData.discount_type === 'PERCENTAGE' ? 100 : undefined}
                                        className="input"
                                        value={formData.discount_value}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (formData.discount_type === 'PERCENTAGE' && parseFloat(value) > 100) {
                                                toast.error('Discount percentage cannot exceed 100%');
                                                return;
                                            }
                                            setFormData({ ...formData, discount_value: value });
                                        }}
                                        placeholder={formData.discount_type === 'PERCENTAGE' ? '0-100' : 'Amount'}
                                    />
                                    {formData.discount_type === 'PERCENTAGE' && (
                                        <p className="text-xs text-gray-500 mt-1">Maximum: 100%</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Order ($)</label>
                                    <input type="number" step="0.01" className="input" value={formData.min_order_amount} onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Restaurant (Optional)</label>
                                <select className="input" value={formData.restaurant_id} onChange={e => setFormData({ ...formData, restaurant_id: e.target.value })}>
                                    <option value="">All Restaurants</option>
                                    {restaurants.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                                    <input
                                        required
                                        type="date"
                                        className="input"
                                        value={formData.start_date}
                                        onChange={e => {
                                            const newStartDate = e.target.value;
                                            setFormData({ ...formData, start_date: newStartDate });
                                            // Update end date min if start date is after end date
                                            if (formData.end_date && newStartDate > formData.end_date) {
                                                toast.error('Start date cannot be after end date');
                                            }
                                        }}
                                        max={formData.end_date || undefined}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date *</label>
                                    <input
                                        required
                                        type="date"
                                        className="input"
                                        value={formData.end_date}
                                        onChange={e => {
                                            const newEndDate = e.target.value;
                                            setFormData({ ...formData, end_date: newEndDate });
                                            // Validate end date is not before start date
                                            if (formData.start_date && newEndDate < formData.start_date) {
                                                toast.error('End date cannot be before start date');
                                            }
                                        }}
                                        min={formData.start_date || undefined}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="mr-2 h-4 w-4" />
                                <label htmlFor="is_active">Active</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" disabled={uploading} className="btn btn-primary">
                                    {uploading ? 'Uploading...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Offers;
