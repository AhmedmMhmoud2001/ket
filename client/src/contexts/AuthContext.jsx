import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const flattenUser = (userData) => {
        if (!userData) return null;
        const newUser = { ...userData };
        if (newUser.roles && Array.isArray(newUser.roles)) {
            newUser.roles = newUser.roles.map(ur => {
                if (typeof ur === 'string') return ur;
                if (ur && typeof ur === 'object') {
                    return ur.role?.name || ur.roleName || ur.name || 'USER';
                }
                return 'USER';
            });
        }
        if (newUser.role && typeof newUser.role === 'object') {
            newUser.role = newUser.role.name || 'USER';
        }
        return newUser;
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setUser(flattenUser(response.data.data));
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: userData, token } = response.data.data;

            localStorage.setItem('token', token);
            setUser(flattenUser(userData));

            toast.success('Login successful!');
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const sendOTP = async (phone, method = 'sms') => {
        try {
            const response = await api.post('/auth/send-otp', { phone, method });
            // In dev mode, show the OTP in toast for convenience
            if (response.data.data?.code) {
                toast.success(`Dev OTP: ${response.data.data.code}`);
            } else {
                const methodName = method === 'whatsapp' ? 'واتساب' : 'رسالة نصية';
                toast.success(`تم إرسال رمز التحقق عبر ${methodName}`);
            }
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';
            toast.error(message);
            return { success: false, message };
        }
    };

    const verifyOTP = async (phone, code) => {
        try {
            const response = await api.post('/auth/verify-otp', { phone, code });
            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            setUser(flattenUser(user));

            toast.success('Login successful!');
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP';
            toast.error(message);
            return { success: false, message };
        }
    };

    const googleLogin = async (token) => {
        try {
            const response = await api.post('/auth/google', { token });
            const { user, token: authToken } = response.data.data;

            localStorage.setItem('token', authToken);
            setUser(flattenUser(user));

            toast.success('Login successful!');
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Google login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const appleLogin = async (token) => {
        try {
            const response = await api.post('/auth/apple', { token });
            const { user, token: authToken } = response.data.data;

            localStorage.setItem('token', authToken);
            setUser(flattenUser(user));

            toast.success('Login successful!');
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Apple login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        setUser,
        checkAuth,
        loading,
        login,
        sendOTP,
        verifyOTP,
        googleLogin,
        appleLogin,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
