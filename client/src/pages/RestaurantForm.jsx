import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const RestaurantForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        phone: '',
        categoryId: '',
        ownerId: '',
        adminId: '',
        deliveryType: 'CAR',
        isActive: true,
        imageUrl: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchInitialData();
        if (isEdit) {
            fetchRestaurant();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const [categoriesRes, usersRes] = await Promise.all([
                api.get('/categories?limit=100'),
                api.get('/users?limit=1000')
            ]);
            setCategories(categoriesRes.data.data.categories || []);
            setUsers(usersRes.data.data.users || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load categories or users');
        }
    };

    const fetchRestaurant = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/restaurants/${id}`);
            const data = response.data.data;
            setFormData({
                nameAr: data.nameAr || '',
                nameEn: data.nameEn || '',
                descriptionAr: data.descriptionAr || '',
                descriptionEn: data.descriptionEn || '',
                phone: data.phone || '',
                categoryId: data.categoryId || '',
                ownerId: data.ownerId || '',
                adminId: data.adminId || '',
                deliveryType: data.deliveryType || 'CAR',
                isActive: data.isActive !== undefined ? data.isActive : true,
                imageUrl: data.imageUrl || ''
            });

            if (data.imageUrl) {
                setImagePreview(
                    data.imageUrl.startsWith('http')
                        ? data.imageUrl
                        : `${import.meta.env.VITE_API_URL}${data.imageUrl}`
                );
            }
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            toast.error('Error fetching restaurant details');
            navigate('/restaurants');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.imageUrl;

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('logo', imageFile);

            const response = await api.post('/upload/restaurant', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return response.data.data.logo;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading image');
            return formData.imageUrl;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalImageUrl = await uploadImage();

            const submitData = {
                ...formData,
                imageUrl: finalImageUrl,
                adminId: formData.adminId || null // Ensure empty string becomes null
            };

            if (isEdit) {
                await api.put(`/restaurants/${id}`, submitData);
                toast.success('Restaurant updated successfully');
            } else {
                await api.post('/restaurants', submitData);
                toast.success('Restaurant created successfully');
            }
            navigate('/restaurants');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/restaurants')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    {t('common.back', 'Back to Restaurants')}
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEdit ? t('restaurants.edit', 'Edit Restaurant') : t('restaurants.add', 'Add New Restaurant')}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('restaurants.logo', 'Restaurant Logo')}</h2>

                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition-colors text-center">
                                <div className="space-y-2 w-full">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="mx-auto h-48 w-48 object-cover rounded-xl shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none">
                                                    <span className="text-lg">Upload logo</span>
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name (English) *</label>
                            <input
                                type="text"
                                name="nameEn"
                                required
                                className="input"
                                value={formData.nameEn}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name (Arabic) *</label>
                            <input
                                type="text"
                                name="nameAr"
                                required
                                dir="rtl"
                                className="input"
                                value={formData.nameAr}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <input
                                type="text"
                                name="phone"
                                required
                                className="input"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
                            <select name="deliveryType" className="input" value={formData.deliveryType} onChange={handleChange}>
                                <option value="CAR">Car</option>
                                <option value="MOTORCYCLE">Motorcycle</option>
                                <option value="BICYCLE">Bicycle</option>
                                <option value="BOTH">Both</option>
                            </select>
                        </div>
                    </div>

                    {/* Description & Category */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details & Category</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                name="categoryId"
                                required
                                className="input"
                                value={formData.categoryId}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nameEn} / {cat.nameAr}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                            <textarea
                                name="descriptionEn"
                                rows="3"
                                className="input"
                                value={formData.descriptionEn}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Arabic)</label>
                            <textarea
                                name="descriptionAr"
                                rows="3"
                                dir="rtl"
                                className="input"
                                value={formData.descriptionAr}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Owner & Admin */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ownership</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Owner *</label>
                                <select
                                    name="ownerId"
                                    required
                                    className="input"
                                    value={formData.ownerId}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Owner</option>
                                    {users.filter(u => u.roles?.some(r => r.role?.name === 'RESTAURANT_OWNER')).map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.phone})</option>
                                    ))}
                                    {/* Fallback if roles are not loaded correctly in filter */}
                                    {users.length > 0 && <option disabled>── All Users ──</option>}
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.phone})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Manager (Admin)</label>
                                <select
                                    name="adminId"
                                    className="input"
                                    value={formData.adminId}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.phone})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/restaurants')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="btn-primary px-8"
                    >
                        {loading || uploading ? 'Saving...' : isEdit ? 'Update Restaurant' : 'Create Restaurant'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantForm;
