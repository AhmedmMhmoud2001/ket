import { useState } from 'react';
import {
    Cog6ToothIcon,
    CreditCardIcon,
    BellIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'General', icon: Cog6ToothIcon },
        { id: 'payment', name: 'Payments', icon: CreditCardIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'localization', name: 'Localization', icon: GlobeAltIcon },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="card">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b pb-2">App Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">App Name</label>
                                        <input type="text" className="input" defaultValue="FoodDash" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Support Email</label>
                                        <input type="email" className="input" defaultValue="support@fooddash.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tax Percentage (%)</label>
                                        <input type="number" className="input" defaultValue="15" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Delivery Radius (KM)</label>
                                        <input type="number" className="input" defaultValue="10" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold border-b pb-2">Payment Gateways</h3>

                                <div className="border rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center font-bold mr-3">S</div>
                                        <div>
                                            <h4 className="font-bold">Stripe</h4>
                                            <p className="text-sm text-gray-500">Credit Card payments</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm text-green-600 font-medium mr-3">Connected</span>
                                        <button className="btn btn-secondary text-xs">Configure</button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 flex items-center justify-between opacity-60">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold mr-3">P</div>
                                        <div>
                                            <h4 className="font-bold">PayPal</h4>
                                            <p className="text-sm text-gray-500">Wallet payments</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button className="btn btn-secondary text-xs">Connect</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b pb-2">Notification Channels</h3>
                                <div className="flex items-center justify-between py-2">
                                    <span>Email Notifications</span>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span>Push Notifications (Firebase)</span>
                                    <input type="checkbox" className="toggle" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span>SMS Alerts (Twilio)</span>
                                    <input type="checkbox" className="toggle" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'localization' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold border-b pb-2">Language & Currency</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Default Currency</label>
                                    <select className="input">
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                        <option>SAR (﷼)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Default Language</label>
                                    <select className="input">
                                        <option>English</option>
                                        <option>Arabic</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
