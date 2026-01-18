import { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    PhotoIcon,
    XMarkIcon,
    ArrowsUpDownIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const OnboardingScreens = () => {
    const { t } = useTranslation();
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScreen, setEditingScreen] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        image_url: '',
        sort_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchScreens();
    }, []);

    const fetchScreens = async () => {
        try {
            setLoading(true);
            const res = await api.get('/onboarding');
            setScreens(res.data.data.screens || []);
        } catch (error) {
            toast.error('Failed to fetch onboarding screens');
        } finally {
            setLoading(false);
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
            uploadFormData.append('onboarding_image', imageFile);

            const response = await api.post('/upload/onboarding', uploadFormData, {
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
        try {
            // Upload image first if new image selected
            const imageUrl = await uploadImage();

            if (!imageUrl) {
                toast.error('Please upload an image');
                return;
            }

            const submitData = {
                ...formData,
                image_url: imageUrl
            };

            if (editingScreen) {
                await api.put(`/onboarding/${editingScreen.id}`, submitData);
                toast.success('Onboarding screen updated');
            } else {
                await api.post('/onboarding', submitData);
                toast.success('Onboarding screen created');
            }
            setIsModalOpen(false);
            setEditingScreen(null);
            resetForm();
            fetchScreens();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const openEdit = (screen) => {
        setEditingScreen(screen);
        setImageFile(null);
        setFormData({
            title: screen.title || '',
            title_ar: screen.titleAr || '',
            description: screen.description || '',
            description_ar: screen.descriptionAr || '',
            image_url: screen.image || '',
            sort_order: screen.sortOrder || 0,
            is_active: screen.isActive !== undefined ? screen.isActive : true
        });

        // Set image preview
        if (screen.image) {
            setImagePreview(
                screen.image.startsWith('http')
                    ? screen.image
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${screen.image}`
            );
        } else {
            setImagePreview(null);
        }

        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingScreen(null);
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
            sort_order: 0,
            is_active: true
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this onboarding screen?')) return;
        try {
            await api.delete(`/onboarding/${id}`);
            toast.success('Onboarding screen deleted');
            fetchScreens();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const toggleActive = async (id) => {
        try {
            await api.patch(`/onboarding/${id}/toggle`);
            toast.success('Status updated');
            fetchScreens();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Onboarding Screens</h1>
                    <p className="text-gray-500">Manage app introduction screens</p>
                </div>
                <button onClick={openNew} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Screen
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {screens.map((screen) => (
                        <div key={screen.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group">
                            <div className="relative">
                                <div className="aspect-[9/16] bg-gray-100 overflow-hidden">
                                    <img
                                        src={screen.image.startsWith('http') ? screen.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${screen.image}`}
                                        alt={screen.title}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={() => toggleActive(screen.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${screen.isActive
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-500 text-white'
                                            }`}
                                    >
                                        {screen.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
                                    <h4 className="font-bold text-sm mb-1">{screen.title}</h4>
                                    <p className="text-xs line-clamp-2 opacity-90">{screen.description}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="flex items-center text-sm text-gray-600">
                                        <ArrowsUpDownIcon className="w-4 h-4 mr-1" />
                                        Order: {screen.sortOrder}
                                    </span>
                                    <span className="flex items-center text-xs text-gray-500">
                                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                                        {screen.description?.length || 0} chars
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(screen)}
                                        className="flex-1 p-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors"
                                    >
                                        <PencilSquareIcon className="w-5 h-5 mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(screen.id)}
                                        className="flex-1 p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingScreen ? 'Edit Onboarding Screen' : 'Add Onboarding Screen'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-primary-400 transition-colors">
                                {imagePreview ? (
                                    <div className="relative">
                                        <div className="aspect-[9/16] max-h-96 mx-auto overflow-hidden rounded-lg">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer py-12">
                                        <PhotoIcon className="w-16 h-16 text-gray-400 mb-3" />
                                        <span className="text-sm text-gray-600 font-medium">Upload Screen Image</span>
                                        <span className="text-xs text-gray-400 mt-1">1080x1920 recommended (9:16 ratio)</span>
                                        <span className="text-xs text-gray-400">Max 5MB</span>
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
                                    <label className="block text-sm font-medium mb-1">Title (English) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="input"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Welcome to FoodApp"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (Arabic)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.title_ar}
                                        onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                                        placeholder="مرحباً بك"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (English) *</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Discover amazing food from local restaurants..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                                <textarea
                                    rows="3"
                                    className="input"
                                    value={formData.description_ar}
                                    onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                                    placeholder="اكتشف أطعمة رائعة..."
                                    dir="rtl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="input"
                                        value={formData.sort_order}
                                        onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Display order (lower first)</p>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium">Active</label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
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

export default OnboardingScreens;

