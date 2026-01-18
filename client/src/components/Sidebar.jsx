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
    StarIcon,
    BuildingStorefrontIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    GiftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SidebarItem = ({ to, icon: Icon, label, active, collapsed, isRTL }) => {
    return (
        <Link
            to={to}
            className={`flex items-center ${isRTL ? 'flex-row-reverse gap-3' : 'gap-3'} ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
            {!collapsed && <span className={`font-medium whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{label}</span>}
        </Link>
    );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const collapsed = !isOpen;
    const isRTL = i18n.language === 'ar';

    const isAdmin = user?.roles?.includes('ADMIN');
    const isRestaurantOwner = user?.roles?.includes('RESTAURANT_OWNER') || user?.roles?.includes('RESTAURANT_ADMIN');

    const adminLinks = [
        { to: '/dashboard', icon: HomeIcon, label: t('common.dashboard') },
        { to: '/users', icon: UsersIcon, label: t('common.users') || 'Users' },
        { to: '/categories', icon: RectangleStackIcon, label: t('common.categories') },
        { to: '/orders', icon: ShoppingBagIcon, label: t('common.orders') },
        { to: '/restaurants', icon: BuildingStorefrontIcon, label: t('common.restaurants') || 'Restaurants' },
        { to: '/products', icon: RectangleGroupIcon, label: t('common.products') || 'Products' },
        { to: '/subcategories', icon: ListBulletIcon, label: t('common.subcategories') || 'Subcategories' },
        { to: '/drivers', icon: TruckIcon, label: t('common.drivers') },
        { to: '/shipping-agents', icon: PaperAirplaneIcon, label: t('common.shippingAgents') },
        { to: '/shipping-orders', icon: PaperAirplaneIcon, label: t('common.shippingOrders') },
        { to: '/splash-screens', icon: PhotoIcon, label: t('common.splash') },
        { to: '/onboarding-screens', icon: DocumentTextIcon, label: t('common.onboarding') },
        { to: '/privacy-policy', icon: DocumentTextIcon, label: t('common.privacy') },
        { to: '/terms-of-service', icon: DocumentTextIcon, label: t('common.terms') },
        { to: '/about-app', icon: DocumentTextIcon, label: t('common.about') },
        { to: '/coupons', icon: TagIcon, label: t('common.coupons') },
        { to: '/points', icon: GiftIcon, label: t('common.points') || 'Points' },
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
                className={`fixed top-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} h-full bg-white border-gray-200 z-50 transition-all duration-300 transform ${isOpen
                    ? 'translate-x-0 w-64'
                    : isRTL
                        ? 'translate-x-full lg:translate-x-0 lg:w-20'
                        : '-translate-x-full lg:translate-x-0 lg:w-20'
                    }`}
            >
                {/* Header */}
                <div className={`h-16 flex items-center justify-between px-6 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse gap-3' : 'gap-3'} overflow-hidden`}>
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
                <div className={`p-4 flex flex-col h-[calc(100%-4rem)] justify-between ${isRTL ? 'text-right' : 'text-left'}`}>
                    <nav className={`space-y-2 overflow-y-auto no-scrollbar pb-20 ${isRTL ? 'space-y-reverse' : ''}`}>
                        {isAdmin && adminLinks.map((link) => (
                            <SidebarItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                collapsed={collapsed}
                                isRTL={isRTL}
                            />
                        ))}
                        {isRestaurantOwner && restaurantLinks.map((link) => (
                            <SidebarItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                collapsed={collapsed}
                                isRTL={isRTL}
                            />
                        ))}
                    </nav>

                    <nav className={`space-y-2 pt-4 border-t border-gray-100 ${isRTL ? 'space-y-reverse' : ''}`}>
                        {bottomLinks.map((link) => (
                            <SidebarItem
                                key={link.to}
                                {...link}
                                active={location.pathname === link.to}
                                collapsed={collapsed}
                                isRTL={isRTL}
                            />
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
