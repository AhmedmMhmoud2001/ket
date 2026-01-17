import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ProductForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [allSubcategories, setAllSubcategories] = useState([]);

    const [formData, setFormData] = useState({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        price: '',
        calories: '',
        restaurantId: '',
        subcategoryId: '',
        isAvailable: true,
        images: []
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        fetchInitialData();
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    useEffect(() => {
        if (formData.restaurantId) {
            const filtered = allSubcategories.filter(sub => sub.restaurantId === formData.restaurantId);
            setSubcategories(filtered);
        } else {
            setSubcategories([]);
        }
    }, [formData.restaurantId, allSubcategories]);

    const fetchInitialData = async () => {
        try {
            const [restaurantsRes, subcategoriesRes] = await Promise.all([
                api.get('/restaurants?limit=1000'),
                api.get('/subcategories?limit=5000')
            ]);
            setRestaurants(restaurantsRes.data.data.restaurants || []);
            setAllSubcategories(subcategoriesRes.data.data.subcategories || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load restaurants or categories');
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            const data = response.data.data;
            setFormData({
                nameAr: data.nameAr || '',
                nameEn: data.nameEn || '',
                descriptionAr: data.descriptionAr || '',
                descriptionEn: data.descriptionEn || '',
                price: data.price || '',
                calories: data.calories || '',
                restaurantId: data.restaurantId || '',
                subcategoryId: data.subcategoryId || '',
                isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
                images: data.images?.map(img => img.imageUrl) || []
            });

            if (data.images && data.images.length > 0) {
                const previews = data.images.map(img =>
                    img.imageUrl.startsWith('http')
                        ? img.imageUrl
                        : `${import.meta.env.VITE_API_URL}${img.imageUrl}`
                );
                setImagePreviews(previews);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Error fetching product details');
            navigate('/products');
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
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImageFiles(prev => [...prev, ...files]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        // If it's a new file
        if (index >= (formData.images.length)) {
            const fileIndex = index - formData.images.length;
            const newFiles = [...imageFiles];
            newFiles.splice(fileIndex, 1);
            setImageFiles(newFiles);
        } else {
            // It's an existing image
            const newImages = [...formData.images];
            newImages.splice(index, 1);
            setFormData(prev => ({ ...prev, images: newImages }));
        }

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return formData.images;

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            imageFiles.forEach(file => {
                uploadFormData.append('product_images', file);
            });

            const response = await api.post('/upload/product/multiple', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return [...formData.images, ...(response.data.data.images || [])];
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading images');
            return formData.images;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalImages = await uploadImages();

            const submitData = {
                ...formData,
                images: finalImages,
                price: parseFloat(formData.price),
                calories: formData.calories ? parseInt(formData.calories) : null
            };

            if (isEdit) {
                await api.put(`/products/${id}`, submitData);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', submitData);
                toast.success('Product created successfully');
            }
            navigate('/products');
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
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Products
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEdit ? 'Edit Product' : 'Add New Product'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square">
                                <img
                                    src={preview}
                                    alt={`Product ${index}`}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-colors">
                            <PlusIcon className="w-8 h-8 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-2">Add Image</span>
                            <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">You can upload multiple images. The first image will be the primary one.</p>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                                <input
                                    type="number"
                                    name="price"
                                    step="0.01"
                                    required
                                    className="input"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                                <input
                                    type="number"
                                    name="calories"
                                    className="input"
                                    value={formData.calories}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Restaurant & Category */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Category</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant *</label>
                            <select
                                name="restaurantId"
                                required
                                className="input"
                                value={formData.restaurantId}
                                onChange={handleChange}
                            >
                                <option value="">Select Restaurant</option>
                                {restaurants.map(res => (
                                    <option key={res.id} value={res.id}>{res.nameEn} / {res.nameAr}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                            <select
                                name="subcategoryId"
                                required
                                className="input"
                                value={formData.subcategoryId}
                                onChange={handleChange}
                                disabled={!formData.restaurantId}
                            >
                                <option value="">Select Subcategory</option>
                                {subcategories.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.nameEn} / {sub.nameAr}</option>
                                ))}
                            </select>
                            {!formData.restaurantId && <p className="text-xs text-orange-500 mt-1">Please select a restaurant first</p>}
                        </div>

                        <div className="pt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isAvailable"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={formData.isAvailable}
                                    onChange={handleChange}
                                />
                                <span className="ml-2 text-sm text-gray-700">Available for orders</span>
                            </label>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Descriptions</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
                                <textarea
                                    name="descriptionEn"
                                    rows="4"
                                    className="input"
                                    value={formData.descriptionEn}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Arabic)</label>
                                <textarea
                                    name="descriptionAr"
                                    rows="4"
                                    dir="rtl"
                                    className="input"
                                    value={formData.descriptionAr}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="btn-primary px-8"
                    >
                        {loading || uploading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
