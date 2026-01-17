import { useState, useEffect } from 'react';
import { PencilSquareIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AboutApp = () => {
    const { t, i18n } = useTranslation();
    const [content, setContent] = useState({
        en: { title: '', description: '', version: '', image: '' },
        ar: { title: '', description: '', version: '', image: '' }
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState({ en: null, ar: null });
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const res = await api.get('/about-app');
            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setContent({
                    en: {
                        title: data.titleEn || '',
                        description: data.descriptionEn || '',
                        version: data.version || '',
                        image: data.imageEn || ''
                    },
                    ar: {
                        title: data.titleAr || '',
                        description: data.descriptionAr || '',
                        version: data.version || '',
                        image: data.imageAr || ''
                    }
                });
                if (data.imageEn) {
                    setImagePreview({
                        en: data.imageEn.startsWith('http') ? data.imageEn : `http://localhost:5000${data.imageEn}`,
                        ar: imagePreview.ar
                    });
                }
                if (data.imageAr) {
                    setImagePreview({
                        en: imagePreview.en,
                        ar: data.imageAr.startsWith('http') ? data.imageAr : `http://localhost:5000${data.imageAr}`
                    });
                }
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                toast.error('Failed to fetch about app content');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e, lang) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setImageFile({ file, lang });
            setImagePreview({
                ...imagePreview,
                [lang]: URL.createObjectURL(file)
            });
        }
    };

    const uploadImage = async (lang) => {
        if (!imageFile || imageFile.lang !== lang) {
            return content[lang].image;
        }

        try {
            const formData = new FormData();
            formData.append('about_image', imageFile.file);
            formData.append('language', lang);

            const response = await api.post('/upload/about', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return response.data.data.image;
        } catch (error) {
            toast.error('Error uploading image');
            throw error;
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Upload images if new ones selected
            const imageEn = await uploadImage('en');
            const imageAr = await uploadImage('ar');

            await api.post('/about-app', {
                titleEn: content.en.title,
                titleAr: content.ar.title,
                descriptionEn: content.en.description,
                descriptionAr: content.ar.description,
                version: content.en.version || content.ar.version,
                imageEn: imageEn || content.en.image,
                imageAr: imageAr || content.ar.image
            });

            toast.success('About app content saved successfully');
            setIsEditing(false);
            setImageFile(null);
            fetchContent();
        } catch (error) {
            toast.error('Failed to save about app content');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const currentContent = content[isRTL ? 'ar' : 'en'];
    const currentPreview = imagePreview[isRTL ? 'ar' : 'en'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('common.about')}</h1>
                    <p className="text-gray-500">Manage about app content</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                    >
                        <PencilSquareIcon className="w-5 h-5 mr-2" />
                        {t('common.edit')}
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Edit About App</h2>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700">English</h3>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                                {imagePreview.en ? (
                                    <div className="relative">
                                        <img src={imagePreview.en} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center cursor-pointer py-8">
                                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Upload Image (EN)</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'en')}
                                        />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Title (English)</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={content.en.title}
                                    onChange={(e) => setContent({
                                        ...content,
                                        en: { ...content.en, title: e.target.value }
                                    })}
                                    placeholder="About Our App"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (English)</label>
                                <textarea
                                    rows="6"
                                    className="input w-full"
                                    value={content.en.description}
                                    onChange={(e) => setContent({
                                        ...content,
                                        en: { ...content.en, description: e.target.value }
                                    })}
                                    placeholder="Enter app description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Version</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={content.en.version}
                                    onChange={(e) => setContent({
                                        ...content,
                                        en: { ...content.en, version: e.target.value },
                                        ar: { ...content.ar, version: e.target.value }
                                    })}
                                    placeholder="1.0.0"
                                />
                            </div>
                        </div>

                        {/* Arabic Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700">العربية</h3>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                                {imagePreview.ar ? (
                                    <div className="relative">
                                        <img src={imagePreview.ar} alt="Preview" className="w-full h-48 object-contain rounded-lg" />
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center cursor-pointer py-8">
                                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">رفع صورة (AR)</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'ar')}
                                        />
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">العنوان (عربي)</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    dir="rtl"
                                    value={content.ar.title}
                                    onChange={(e) => setContent({
                                        ...content,
                                        ar: { ...content.ar, title: e.target.value }
                                    })}
                                    placeholder="عن التطبيق"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">الوصف (عربي)</label>
                                <textarea
                                    rows="6"
                                    className="input w-full"
                                    dir="rtl"
                                    value={content.ar.description}
                                    onChange={(e) => setContent({
                                        ...content,
                                        ar: { ...content.ar, description: e.target.value }
                                    })}
                                    placeholder="أدخل وصف التطبيق..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="btn btn-secondary"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {currentPreview && (
                        <div className="mb-6">
                            <img src={currentPreview} alt="About" className="w-full max-w-md mx-auto rounded-lg" />
                        </div>
                    )}
                    <div dir={isRTL ? 'rtl' : 'ltr'} className="text-center space-y-4">
                        {currentContent.title && (
                            <h2 className="text-3xl font-bold text-gray-900">{currentContent.title}</h2>
                        )}
                        {currentContent.version && (
                            <p className="text-sm text-gray-500">Version {currentContent.version}</p>
                        )}
                        {currentContent.description && (
                            <div
                                className="text-gray-700 leading-relaxed whitespace-pre-wrap text-left max-w-3xl mx-auto"
                                dangerouslySetInnerHTML={{
                                    __html: currentContent.description.replace(/\n/g, '<br />')
                                }}
                            />
                        )}
                        {!currentContent.title && !currentContent.description && (
                            <p className="text-gray-500 italic">
                                No about app content available. Click "Edit" to add content.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutApp;

