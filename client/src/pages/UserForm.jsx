import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon, KeyIcon, EnvelopeIcon, PhoneIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleIds: [],
        isActive: true,
        avatar: null
    });

    useEffect(() => {
        fetchRoles();
        if (isEdit) {
            fetchUser();
        }
    }, [id]);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            // The API returns { success: true, data: { roles: [...] } }
            const rolesData = response.data.data?.roles || response.data.data || [];
            setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Error loading roles');
        }
    };

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/users/${id}`);
            const data = response.data.data;
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                password: '', // Don't fetch password
                roleIds: data.roles?.map(ur => ur.roleId) || [],
                isActive: data.isActive !== undefined ? data.isActive : true,
                avatar: data.avatar || null
            });
            if (data.avatar) {
                const fullUrl = data.avatar.startsWith('http')
                    ? data.avatar
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${data.avatar}`;
                setImagePreview(fullUrl);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Error fetching user details');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, avatar: null }));
    };

    const uploadAvatar = async () => {
        if (!imageFile) return formData.avatar;

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('avatar', imageFile);

            const response = await api.post('/upload/user/avatar', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return response.data.data.avatar;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error uploading avatar');
            return formData.avatar;
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'roleIds') {
            const roleId = parseInt(value);
            const newRoleIds = checked
                ? [...formData.roleIds, roleId]
                : formData.roleIds.filter(id => id !== roleId);
            setFormData({ ...formData, roleIds: newRoleIds });
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const uploadedAvatarUrl = await uploadAvatar();
            const submitData = { ...formData, avatar: uploadedAvatarUrl };

            if (isEdit && !submitData.password) {
                delete submitData.password;
            }

            if (isEdit) {
                await api.put(`/users/${id}`, submitData);
                toast.success('User updated successfully');
            } else {
                await api.post('/users', submitData);
                toast.success('User created successfully');
            }
            navigate('/users');
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.message || 'Error saving user');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/users')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit User' : 'Add New User'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 self-start">Profile Image</h2>
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-16 h-16 text-gray-300" />
                            )}
                        </div>
                        {imagePreview && (
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                        <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                            <PhotoIcon className="w-4 h-4" />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Upload a profile picture. Optimized to dimensions 200x200 (WebP).
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="input pl-10"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="input pl-10"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    className="input pl-10"
                                    placeholder="0123456789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required={!isEdit}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Roles & Status</h2>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Assign Roles</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Array.isArray(roles) && roles.map(role => (
                                <label key={role.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        name="roleIds"
                                        value={role.id}
                                        checked={formData.roleIds.includes(role.id)}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {role.name.toLowerCase().replace('_', ' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            User is active and can log in
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="btn btn-secondary"
                        disabled={loading || uploading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary min-w-[120px]"
                        disabled={loading || uploading}
                    >
                        {loading || uploading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>{uploading ? 'Uploading...' : 'Saving...'}</span>
                            </div>
                        ) : (
                            isEdit ? 'Update User' : 'Create User'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
