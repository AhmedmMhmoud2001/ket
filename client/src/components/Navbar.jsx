import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className={`h-full px-6 flex items-center justify-between ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Left side */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>

                {/* Right side */}
                <div className={`${i18n.language === 'ar' ? 'mr-auto' : 'ml-auto'} flex items-center ${i18n.language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                    {/* Language Switcher */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="p-2 rounded-lg hover:bg-gray-100">
                            <GlobeAltIcon className="w-6 h-6 text-gray-600" />
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className={`absolute ${i18n.language === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} mt-2 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
                                <div className="p-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => changeLanguage('en')}
                                                className={`${active ? 'bg-gray-100' : ''} ${i18n.language === 'en' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'} flex items-center w-full px-4 py-2 text-sm rounded-lg`}
                                            >
                                                {t('common.english')}
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => changeLanguage('ar')}
                                                className={`${active ? 'bg-gray-100' : ''} ${i18n.language === 'ar' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'} flex items-center w-full px-4 py-2 text-sm rounded-lg`}
                                            >
                                                {t('common.arabic')}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    {/* Notifications */}
                    <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>

                    {/* User menu */}
                    <Menu as="div" className="relative">
                        <Menu.Button className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'} p-2 rounded-lg hover:bg-gray-100`}>
                            <div className={`${i18n.language === 'ar' ? 'text-left' : 'text-right'} hidden sm:block`}>
                                <p className="text-sm font-medium text-gray-900">{user?.name || user?.full_name}</p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {Array.isArray(user?.roles) ? user?.roles[0] : (typeof user?.role === 'string' ? user?.role : 'USER')}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar.startsWith('http')
                                            ? user.avatar
                                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${user.avatar}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                        }}
                                    />
                                ) : (
                                    <UserCircleIcon className="w-8 h-8 text-gray-600" />
                                )}
                            </div>
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="p-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/profile"
                                                className={`${active ? 'bg-gray-100' : ''
                                                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg`}
                                            >
                                                <UserCircleIcon className={`w-5 h-5 ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                                                {t('common.profile')}
                                            </Link>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={logout}
                                                className={`${active ? 'bg-gray-100' : ''
                                                    } flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg`}
                                            >
                                                <ArrowRightOnRectangleIcon className={`w-5 h-5 ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                                                {t('common.logout')}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
