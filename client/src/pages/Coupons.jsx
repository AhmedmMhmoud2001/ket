import { useState, useEffect } from 'react';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    TicketIcon,
    ClipboardDocumentIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Coupons = () => {
    const { t } = useTranslation();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: 0,
        max_discount_amount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, [search, pagination.page]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/coupons?search=${search}&page=${pagination.page}&limit=${pagination.limit}`);
            setCoupons(res.data.data.coupons);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate dates
        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            
            if (startDate > endDate) {
                toast.error('Start date cannot be after end date');
                return;
            }
        }
        
        // Validate discount value
        if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
            toast.error('Discount percentage cannot be greater than 100%');
            return;
        }
        
        if (parseFloat(formData.discount_value) <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }
        
        try {
            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon.id}`, formData);
                toast.success('Coupon updated');
            } else {
                await api.post('/coupons', formData);
                toast.success('Coupon created');
            }
            setIsModalOpen(false);
            setEditingCoupon(null);
            resetForm();
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const openEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: (coupon.type || coupon.discount_type) === 'PERCENTAGE' ? 'percentage' : 'fixed',
            discount_value: coupon.discountValue || coupon.discount_value,
            min_order_amount: coupon.minOrderAmount || coupon.min_order_amount || 0,
            max_discount_amount: coupon.maxDiscount || coupon.max_discount_amount || '',
            usage_limit: coupon.usageLimit || coupon.usage_limit || '',
            start_date: (coupon.startDate || coupon.start_date)?.split('T')[0] || '',
            end_date: (coupon.expiryDate || coupon.end_date)?.split('T')[0] || '',
            is_active: coupon.isActive !== undefined ? coupon.isActive : coupon.is_active
        });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingCoupon(null);
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: 0,
            max_discount_amount: '',
            usage_limit: '',
            start_date: '',
            end_date: '',
            is_active: true
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await api.delete(`/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied!');
    };

    const isExpired = (endDate) => {
        return new Date(endDate) < new Date();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                    <p className="text-gray-500">Manage discount codes and promotions</p>
                </div>
                <button onClick={openNew} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" /> Create Coupon
                </button>
            </div>

            <div className="card">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search coupons..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Valid Period</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No coupons found. Create your first coupon!
                                    </td>
                                </tr>
                            ) : coupons.map(coupon => {
                                const discountType = (coupon.type || coupon.discount_type) === 'PERCENTAGE' || coupon.discount_type === 'percentage' ? 'PERCENTAGE' : 'FIXED';
                                const discountValue = coupon.discountValue || coupon.discount_value;
                                const usedCount = coupon.used_count || coupon.usedCount || 0;
                                const usageLimit = coupon.usage_limit || coupon.usageLimit;
                                const usagePercent = usageLimit ? Math.min((usedCount / usageLimit) * 100, 100) : 0;
                                const startDate = coupon.startDate || coupon.start_date;
                                const endDate = coupon.expiryDate || coupon.end_date;
                                const isActive = (coupon.isActive !== undefined ? coupon.isActive : coupon.is_active) && !isExpired(endDate);
                                
                                return (
                                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-lg text-primary-700 bg-primary-50 px-4 py-2 rounded-lg border-2 border-primary-200 hover:bg-primary-100 transition-colors">
                                                    {coupon.code}
                                            </span>
                                                <button 
                                                    onClick={() => copyCode(coupon.code)} 
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Copy code"
                                                >
                                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {coupon.description && (
                                                <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                                    {coupon.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg text-primary-600">
                                                    {discountType === 'PERCENTAGE' ? `${discountValue}%` : `$${discountValue}`}
                                                </span>
                                                <span className="text-xs text-gray-500 uppercase">
                                                    {discountType === 'PERCENTAGE' ? 'OFF' : 'DISCOUNT'}
                                                </span>
                                                {(coupon.maxDiscount || coupon.max_discount_amount) && (
                                                    <span className="text-xs text-gray-400 mt-1">
                                                        Max: ${coupon.maxDiscount || coupon.max_discount_amount}
                                                    </span>
                                                )}
                                                {(coupon.minOrderAmount || coupon.min_order_amount) > 0 && (
                                                    <span className="text-xs text-gray-400">
                                                        Min: ${coupon.minOrderAmount || coupon.min_order_amount}
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className={`h-2.5 rounded-full transition-all ${
                                                            usagePercent >= 100 ? 'bg-red-500' : 
                                                            usagePercent >= 80 ? 'bg-yellow-500' : 
                                                            'bg-primary-500'
                                                        }`}
                                                        style={{ width: `${usagePercent}%` }}
                                                ></div>
                                                </div>
                                                <div className="text-sm font-medium text-gray-700 min-w-[60px] text-right">
                                                    {usedCount}/{usageLimit || '∞'}
                                                </div>
                                            </div>
                                            {usagePercent >= 100 && (
                                                <span className="text-xs text-red-500 mt-1 block">Limit reached</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-gray-600">
                                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                                    <span>{new Date(startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-gray-400">
                                                    → {new Date(endDate).toLocaleDateString()}
                                                </div>
                                                {isExpired(endDate) && (
                                                    <span className="text-xs text-red-500 mt-1">Expired</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {isActive ? 'Active' : 'Inactive'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openEdit(coupon)} 
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                                <button 
                                                    onClick={() => handleDelete(coupon.id)} 
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                            </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                                <input
                                    required
                                    type="text"
                                    className="input font-mono uppercase"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SAVE20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea rows="2" className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Type *</label>
                                    <select required className="input" value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })}>
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Value *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        step="0.01" 
                                        min="0.01"
                                        max={formData.discount_type === 'percentage' ? 100 : undefined}
                                        className="input" 
                                        value={formData.discount_value} 
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (formData.discount_type === 'percentage' && parseFloat(value) > 100) {
                                                toast.error('Discount percentage cannot exceed 100%');
                                                return;
                                            }
                                            setFormData({ ...formData, discount_value: value });
                                        }}
                                        placeholder={formData.discount_type === 'percentage' ? '0-100' : 'Amount'}
                                    />
                                    {formData.discount_type === 'percentage' && (
                                        <p className="text-xs text-gray-500 mt-1">Maximum: 100%</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
                                    <input type="number" step="0.01" className="input" value={formData.max_discount_amount} onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Order Amount ($)</label>
                                    <input type="number" step="0.01" className="input" value={formData.min_order_amount} onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                    <input type="number" className="input" value={formData.usage_limit} onChange={e => setFormData({ ...formData, usage_limit: e.target.value })} placeholder="Leave empty for unlimited" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                                    <input 
                                        required 
                                        type="date" 
                                        className="input" 
                                        value={formData.start_date} 
                                        onChange={e => {
                                            const newStartDate = e.target.value;
                                            setFormData({ ...formData, start_date: newStartDate });
                                            // Update end date min if start date is after end date
                                            if (formData.end_date && newStartDate > formData.end_date) {
                                                toast.error('Start date cannot be after end date');
                                            }
                                        }}
                                        max={formData.end_date || undefined}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date *</label>
                                    <input 
                                        required 
                                        type="date" 
                                        className="input" 
                                        value={formData.end_date} 
                                        onChange={e => {
                                            const newEndDate = e.target.value;
                                            setFormData({ ...formData, end_date: newEndDate });
                                            // Validate end date is not before start date
                                            if (formData.start_date && newEndDate < formData.start_date) {
                                                toast.error('End date cannot be before start date');
                                            }
                                        }}
                                        min={formData.start_date || undefined}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="mr-2 h-4 w-4" />
                                <label htmlFor="is_active">Active</label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
