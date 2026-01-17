import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderTracking from './pages/OrderTracking';
import Drivers from './pages/Drivers';
import CategoryForm from './pages/CategoryForm';
import Categories from './pages/Categories';
import SubcategoryForm from './pages/SubcategoryForm';
import Subcategories from './pages/Subcategories';
import Products from './pages/Products';
import Users from './pages/Users';
import Coupons from './pages/Coupons';
import Offers from './pages/Offers';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import RestaurantOwnerDashboard from './pages/RestaurantOwnerDashboard';
import RestaurantOwnerProducts from './pages/RestaurantOwnerProducts';
import RestaurantOwnerOrders from './pages/RestaurantOwnerOrders';
import Support from './pages/Support';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Logs from './pages/Logs';
import Reviews from './pages/Reviews';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />

                        {/* Admin Routes */}
                        <Route path="orders" element={<Orders />} />
                        <Route path="orders/:id" element={<OrderDetails />} />
                        <Route path="tracking/:id" element={<OrderTracking />} />
                        <Route path="drivers" element={<Drivers />} />
                        <Route path="users" element={<Users />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="categories/new" element={<CategoryForm />} />
                        <Route path="categories/:id/edit" element={<CategoryForm />} />
                        <Route path="subcategories" element={<Subcategories />} />
                        <Route path="subcategories/new" element={<SubcategoryForm />} />
                        <Route path="subcategories/:id/edit" element={<SubcategoryForm />} />
                        <Route path="products" element={<Products />} />
                        <Route path="coupons" element={<Coupons />} />
                        <Route path="offers" element={<Offers />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="support" element={<Support />} />
                        <Route path="roles" element={<Roles />} />
                        <Route path="permissions" element={<Permissions />} />
                        <Route path="logs" element={<Logs />} />
                        <Route path="reviews" element={<Reviews />} />

                        {/* Restaurant Owner Routes */}
                        <Route path="restaurant-owner/dashboard" element={<RestaurantOwnerDashboard />} />
                        <Route path="restaurant-owner/products" element={<RestaurantOwnerProducts />} />
                        <Route path="restaurant-owner/orders" element={<RestaurantOwnerOrders />} />

                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
