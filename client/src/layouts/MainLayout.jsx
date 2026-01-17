import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className={`transition-all duration-300 ${sidebarOpen 
                ? isRTL ? 'lg:mr-64' : 'lg:ml-64' 
                : isRTL ? 'lg:mr-20' : 'lg:ml-20'
            }`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
