import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const SubcategoryForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        name_ar: '',
        sort_order: 0,
        is_active: true,
        image_url: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchSubcategory();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories?is_active=true');
            setCategories(response.data.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategory = async () => {
        try {
            const response = await api.get(`/subcategories/${id}`);
            const data = response.data.data;
            setFormData({
                category_id: data.categoryId || data.category_id || '',
                name: data.name || '',
                name_ar: data.nameAr || data.name_ar || '',
                sort_order: data.sortOrder || data.sort_order || 0,
                is_active: data.isActive !== undefined ? data.isActive : data.is_active !== undefined ? data.is_active : true,
                image_url: data.image || data.image_url || ''
            });

            if (data.image || data.image_url) {
                const imageUrl = (data.image || data.image_url);
                setImagePreview(
                    imageUrl.startsWith('http') 
                        ? imageUrl 
                        : `http://localhost:5000${imageUrl}`
                );
            }
        } catch (error) {
            toast.error('Error fetching subcategory details');
            navigate('/subcategories');
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
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
            uploadFormData.append('category_image', imageFile);

            const response = await api.post('/upload/category', uploadFormData, {
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
        
        if (!formData.category_id) {
            toast.error('Please select a parent category');
            return;
        }

        setLoading(true);

        try {
            const imageUrl = await uploadImage();

            const submitData = {
                ...formData,
                image_url: imageUrl || formData.image_url
            };

            if (isEdit) {
                await api.put(`/subcategories/${id}`, submitData);
                toast.success('Subcategory updated successfully');
            } else {
                await api.post('/subcategories', submitData);
                toast.success('Subcategory created successfully');
            }
            navigate('/subcategories');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/subcategories')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Subcategories
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEdit ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h1>
                <p className="text-gray-500 mt-2">
                    {isEdit ? 'Update subcategory information' : 'Create a new subcategory under a parent category'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subcategory Image</h2>
                    
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition-colors">
                                <div className="space-y-2 text-center w-full">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img 
                                                src={imagePreview} 
                                                alt="Subcategory preview" 
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
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-700">
                                                    <span className="text-lg">Upload image</span>
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                            <p className="text-xs text-gray-400">Optimized to 300x300 WebP</p>
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
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parent Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category_id"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                value={formData.category_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Parent Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subcategory Name (English) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Chicken Burgers"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subcategory Name (Arabic)
                                </label>
                                <input
                                    type="text"
                                    name="name_ar"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.name_ar}
                                    onChange={handleChange}
                                    placeholder="مثال: برجر الدجاج"
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    name="sort_order"
                                    min="0"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    value={formData.sort_order}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                            </div>

                            <div className="pt-8">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-900">
                                        Active Subcategory
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-7">Active subcategories are visible</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-4 space-x-reverse">
                    <button
                        type="button"
                        onClick={() => navigate('/subcategories')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="px-8 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {uploading ? 'Uploading...' : loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubcategoryForm;

