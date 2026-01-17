import { useState, useEffect } from 'react';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
    const { t, i18n } = useTranslation();
    const [content, setContent] = useState({ en: '', ar: '' });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const res = await api.get('/terms-of-service');
            if (res.data.success && res.data.data) {
                setContent({
                    en: res.data.data.contentEn || '',
                    ar: res.data.data.contentAr || ''
                });
            }
        } catch (error) {
            // If not found, initialize with empty content
            if (error.response?.status !== 404) {
                toast.error('Failed to fetch terms of service');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.post('/terms-of-service', {
                contentEn: content.en,
                contentAr: content.ar
            });
            toast.success('Terms of service saved successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to save terms of service');
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('common.terms')}</h1>
                    <p className="text-gray-500">Manage terms of service content</p>
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
                        <h2 className="text-lg font-semibold text-gray-900">Edit Terms of Service</h2>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Content (English)</label>
                            <textarea
                                rows="15"
                                className="input w-full"
                                value={content.en}
                                onChange={(e) => setContent({ ...content, en: e.target.value })}
                                placeholder="Enter terms of service content in English..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Content (Arabic)</label>
                            <textarea
                                rows="15"
                                className="input w-full"
                                dir="rtl"
                                value={content.ar}
                                onChange={(e) => setContent({ ...content, ar: e.target.value })}
                                placeholder="أدخل محتوى شروط الخدمة بالعربية..."
                            />
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
                    <div
                        className="prose max-w-none"
                        dir={isRTL ? 'rtl' : 'ltr'}
                    >
                        {content[isRTL ? 'ar' : 'en'] ? (
                            <div
                                className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: content[isRTL ? 'ar' : 'en'].replace(/\n/g, '<br />')
                                }}
                            />
                        ) : (
                            <p className="text-gray-500 italic">
                                No terms of service content available. Click "Edit" to add content.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TermsOfService;

