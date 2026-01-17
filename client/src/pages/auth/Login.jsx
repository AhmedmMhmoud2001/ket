import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const { login, sendOTP, verifyOTP } = useAuth();
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
    const [step, setStep] = useState(1); // 1: input phone, 2: verify otp

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (loginMethod === 'email') {
            await login(formData.email, formData.password);
        } else {
            if (step === 1) {
                // Send OTP
                const result = await sendOTP(formData.phone);
                // if (result.success) setStep(2);
            } else {
                // Verify OTP
                // await verifyOTP(formData.phone, formData.otp);
            }
        }

        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl font-bold text-primary-600">F</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Food Delivery</h1>
                    <p className="text-primary-100">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`flex-1 pb-3 text-sm font-medium ${loginMethod === 'email' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => { setLoginMethod('email'); setStep(1); }}
                        >
                            Email Login
                        </button>
                        <button
                            className={`flex-1 pb-3 text-sm font-medium ${loginMethod === 'phone' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => { setLoginMethod('phone'); setStep(1); }}
                        >
                            Phone Login
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {loginMethod === 'email' ? 'Welcome Back' : (step === 1 ? 'Enter Phone Number' : 'Enter Verification Code')}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {loginMethod === 'email' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="email" type="email" required
                                            value={formData.email} onChange={handleChange}
                                            className="input pl-10" placeholder="admin@fooddelivery.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="password" type="password" required
                                            value={formData.password} onChange={handleChange}
                                            className="input pl-10" placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {loginMethod === 'phone' && step === 1 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    name="phone" type="tel" required
                                    value={formData.phone} onChange={handleChange}
                                    className="input" placeholder="01XXXXXXXXX"
                                />
                                <p className="text-xs text-gray-500 mt-2">We will send a code to this number.</p>
                            </div>
                        )}

                        {loginMethod === 'phone' && step === 2 && (
                            <div className="text-center">
                                <label className="block text-sm font-medium text-gray-700 mb-4">Enter 6-digit code sent to {formData.phone}</label>
                                <input
                                    name="otp" type="text" required maxLength="6"
                                    value={formData.otp} onChange={handleChange}
                                    className="input text-center text-2xl tracking-widest font-mono" placeholder="000000"
                                />
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline mt-4">
                                    Wrong number?
                                </button>
                            </div>
                        )}

                        {loginMethod === 'email' && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                                </div>
                                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                loginMethod === 'email' ? 'Sign In' : (step === 1 ? 'Send Code' : 'Verify & Login')
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    {loginMethod === 'email' && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
                            <p className="text-xs text-gray-800">
                                <strong>Email:</strong> admin@fooddelivery.com<br />
                                <strong>Password:</strong> admin123
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center text-primary-100 text-sm mt-6">
                    © 2026 Food Delivery. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
