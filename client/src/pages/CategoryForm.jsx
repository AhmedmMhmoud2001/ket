import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const CategoryForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        nameEn: '',
        nameAr: '',
        type: 'RESTAURANT',
        sortOrder: 0,
        isActive: true,
        imageUrl: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (isEdit) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/categories/${id}`);
            const data = response.data.data;
            setFormData({
                nameEn: data.nameEn || data.name || '',
                nameAr: data.nameAr || data.name_ar || '',
                type: data.type || 'RESTAURANT',
                sortOrder: data.sortOrder || data.sort_order || 0,
                isActive: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
                imageUrl: data.imageUrl || data.image || data.image_url || ''
            });

            if (data.imageUrl || data.image || data.image_url) {
                const img = data.imageUrl || data.image || data.image_url;
                setImagePreview(
                    img.startsWith('http')
                        ? img
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${img}`
                );
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            toast.error('Error fetching category details');
            navigate('/categories');
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
            uploadFormData.append('category_image', imageFile);

            const response = await api.post('/upload/category', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return response.data.data.image;
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
                imageUrl: finalImageUrl
            };

            if (isEdit) {
                await api.put(`/categories/${id}`, submitData);
                toast.success('Category updated successfully');
            } else {
                await api.post('/categories', submitData);
                toast.success('Category created successfully');
            }
            navigate('/categories');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/categories')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Categories
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEdit ? 'Edit Category' : 'Add New Category'}
                </h1>
                <p className="text-gray-500 mt-2">
                    {isEdit ? 'Update category information and image' : 'Create a new category for your restaurants'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Image</h2>

                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition-colors">
                                <div className="space-y-2 text-center w-full">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Category preview"
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
                                                    <span className="text-lg">Upload category image</span>
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name (English) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nameEn"
                                required
                                className="input"
                                value={formData.nameEn}
                                onChange={handleChange}
                                placeholder="e.g., Fast Food"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nameAr"
                                required
                                className="input"
                                value={formData.nameAr}
                                onChange={handleChange}
                                placeholder="مثال: وجبات سريعة"
                                dir="rtl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                required
                                className="input"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="RESTAURANT">Restaurant</option>
                                <option value="SHOP">Shop</option>
                                <option value="SERVICE">Service</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                name="sortOrder"
                                min="0"
                                className="input"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-900">
                                    Active Category
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="btn-primary px-8"
                    >
                        {uploading ? 'Uploading Image...' : loading ? 'Saving...' : (isEdit ? 'Update Category' : 'Create Category')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
