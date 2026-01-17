import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BilingualFormTabs = ({ children, defaultTab = 'en' }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'en'
                            ? 'border-b-2 border-primary-500 text-primary-700'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {t('forms.englishTab')}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('ar')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'ar'
                            ? 'border-b-2 border-primary-500 text-primary-700'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {t('forms.arabicTab')}
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'en' && children.en}
                {activeTab === 'ar' && children.ar}
            </div>
        </div>
    );
};

export default BilingualFormTabs;

