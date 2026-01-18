import { useState, useEffect } from 'react';
import {
    UserCircleIcon,
    KeyIcon,
    CameraIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { t } = useTranslation();
    const { user, setUser, checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/me');
            const userData = response.data.data;
            // Note: checkAuth already flattens roles, but here we might get raw data if we fetch directly
            // However, we want to update the context too.
            if (userData) {
                setFormData({
                    full_name: userData.name || userData.full_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    avatar: userData.avatar || ''
                });
                if (userData.avatar) {
                    const fullUrl = userData.avatar.startsWith('http')
                        ? userData.avatar
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${userData.avatar}`;
                    setImagePreview(fullUrl);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('avatar', file);

        setUploading(true);
        try {
            const response = await api.post('/upload/user/avatar', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const avatarPath = response.data.data.avatar;
            setFormData(prev => ({ ...prev, avatar: avatarPath }));
            const fullUrl = avatarPath.startsWith('http')
                ? avatarPath
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${avatarPath}`;
            setImagePreview(fullUrl);
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/me', {
                name: formData.full_name,
                phone: formData.phone,
                email: formData.email,
                avatar: formData.avatar
            });
            await checkAuth(); // Refresh global user state
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.new_password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await api.post('/auth/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            toast.success('Password changed successfully');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error('Change password error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const currentRole = Array.isArray(user?.roles) ? user?.roles[0] : (typeof user?.role === 'string' ? user?.role : 'USER');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="card text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto flex items-center justify-center mb-4 relative overflow-hidden group border-2 border-white shadow-md">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-primary-600">
                                    {(formData.full_name || user?.name || user?.full_name)?.charAt(0) || 'U'}
                                </span>
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <CameraIcon className="w-8 h-8 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                </div>
                            )}
                        </div>
                        <h2 className="font-bold text-gray-900">{formData.full_name || user?.name || user?.full_name}</h2>
                        <p className="text-sm text-gray-500 capitalize">{currentRole}</p>
                    </div>

                    <div className="card !p-2 space-y-1 bg-white rounded-xl shadow-sm border border-gray-200">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'general' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <UserCircleIcon className="w-5 h-5 mr-3" />
                            General Information
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <KeyIcon className="w-5 h-5 mr-3" />
                            Security
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {activeTab === 'general' ? (
                        <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                                General Information
                            </h3>
                            <form onSubmit={handleGeneralSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                className="input pl-10"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                                                className="input pl-10"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                className="input pl-10 bg-gray-50"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Path</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CameraIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                className="input pl-10 bg-gray-50"
                                                readOnly
                                                value={formData.avatar}
                                                placeholder="/uploads/users/avatars/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                                Change Password
                            </h3>
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="input"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="input"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="btn btn-secondary">
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
