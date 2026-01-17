import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    ShoppingBagIcon,
    UsersIcon,
    TruckIcon,
    TagIcon,
    ReceiptPercentIcon,
    BellIcon,
    UserIcon,
    Cog6ToothIcon,
    XMarkIcon,
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    ListBulletIcon,
    RectangleStackIcon,
    RectangleGroupIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SidebarItem = ({ to, icon: Icon, label, active, collapsed }) => {
    return (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
            {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
        </Link>
    );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const collapsed = !isOpen;

    const isAdmin = user?.roles?.includes('ADMIN');
    const isRestaurantOwner = user?.roles?.includes('RESTAURANT_OWNER') || user?.roles?.includes('RESTAURANT_ADMIN');

    const adminLinks = [
        { to: '/dashboard', icon: HomeIcon, label: t('common.dashboard') },
        { to: '/users', icon: UsersIcon, label: t('common.users') || 'Users' },
        { to: '/orders', icon: ShoppingBagIcon, label: t('common.orders') },
        { to: '/products', icon: RectangleGroupIcon, label: t('common.products') || 'Products' },
        { to: '/categories', icon: RectangleStackIcon, label: t('common.categories') },
        { to: '/subcategories', icon: ListBulletIcon, label: t('common.subcategories') || 'Subcategories' },
        { to: '/drivers', icon: TruckIcon, label: t('common.drivers') },
        { to: '/coupons', icon: TagIcon, label: t('common.coupons') },
        { to: '/offers', icon: ReceiptPercentIcon, label: t('common.offers') },
        { to: '/reviews', icon: StarIcon, label: t('common.reviews') },
        { to: '/support', icon: ChatBubbleLeftRightIcon, label: t('common.support') },
        { to: '/roles', icon: ShieldCheckIcon, label: t('common.roles') },
        { to: '/logs', icon: DocumentTextIcon, label: t('common.logs') },
    ];

    const restaurantLinks = [
        { to: '/restaurant-owner/dashboard', icon: ChartBarIcon, label: t('restaurantOwner.dashboard') },
        { to: '/restaurant-owner/products', icon: ShoppingBagIcon, label: t('common.products') },
        { to: '/restaurant-owner/orders', icon: ListBulletIcon, label: t('common.orders') },
    ];

    const bottomLinks = [
        { to: '/profile', icon: UserIcon, label: t('common.profile') },
        { to: '/settings', icon: Cog6ToothIcon, label: t('common.settings') },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 transform ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
                    }`}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-200">
                            <span className="text-white font-bold text-xl uppercase">F</span>
                        </div>
                        {isOpen && <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">FoodHub</span>}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col h-[calc(100%-4rem)] justify-between">
                    <nav className="space-y-2 overflow-y-auto no-scrollbar pb-20">
                        {isAdmin && adminLinks.map((link) => (
                            <SidebarItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                collapsed={collapsed}
                            />
                        ))}
                        {isRestaurantOwner && restaurantLinks.map((link) => (
                            <SidebarItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                collapsed={collapsed}
                            />
                        ))}
                    </nav>

                    <nav className="space-y-2 pt-4 border-t border-gray-100">
                        {bottomLinks.map((link) => (
                            <SidebarItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                collapsed={collapsed}
                            />
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
