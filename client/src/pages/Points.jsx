import { useState, useEffect } from 'react';
import {
    GiftIcon,
    CurrencyDollarIcon,
    ClockIcon,
    PlusIcon,
    MinusIcon,
    MagnifyingGlassIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Points = () => {
    const { t } = useTranslation();
    const [userPoints, setUserPoints] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustForm, setAdjustForm] = useState({
        userId: '',
        points: '',
        type: 'reward',
        description: ''
    });

    useEffect(() => {
        fetchAllUsersPoints();
    }, [search, pagination.page]);

    useEffect(() => {
        if (userPoints?.userId) {
            fetchTransactions(userPoints.userId);
        }
    }, [typeFilter, userPoints]);

    const fetchAllUsersPoints = async () => {
        try {
            setLoading(true);
            const res = await api.get('/points', {
                params: {
                    search,
                    page: pagination.page,
                    limit: pagination.limit
                }
            });
            if (res.data.success) {
                setUserPoints(res.data.data.userPoints[0] || null);
                setPagination(res.data.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch users points');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (userId) => {
        try {
            const res = await api.get(`/points/${userId}/transactions`, {
                params: {
                    type: typeFilter || undefined,
                    page: 1,
                    limit: 50
                }
            });
            if (res.data.success) {
                setTransactions(res.data.data.transactions);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const handleAdjustPoints = async (e) => {
        e.preventDefault();
        try {
            const pointsNum = parseInt(adjustForm.points);
            if (!pointsNum || pointsNum === 0) {
                toast.error('Please enter a valid points amount');
                return;
            }

            await api.post('/points/adjust', {
                userId: adjustForm.userId,
                points: pointsNum,
                type: adjustForm.type,
                description: adjustForm.description || undefined
            });

            toast.success(`Successfully ${pointsNum > 0 ? 'added' : 'removed'} ${Math.abs(pointsNum)} points`);
            setIsAdjustModalOpen(false);
            setAdjustForm({ userId: '', points: '', type: 'reward', description: '' });
            fetchAllUsersPoints();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to adjust points');
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            earned: 'text-green-600 bg-green-50',
            used: 'text-red-600 bg-red-50',
            expired: 'text-gray-600 bg-gray-50',
            reward: 'text-blue-600 bg-blue-50',
            bonus: 'text-purple-600 bg-purple-50'
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    const getTypeIcon = (type) => {
        if (type === 'earned' || type === 'reward' || type === 'bonus') {
            return <ArrowTrendingUpIcon className="w-5 h-5" />;
        }
        return <ArrowTrendingDownIcon className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Points Management</h1>
                    <p className="text-gray-500">Manage user points and rewards</p>
                </div>
                <button
                    onClick={() => setIsAdjustModalOpen(true)}
                    className="btn btn-primary"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adjust Points
                </button>
            </div>

            {/* Points Overview Cards */}
            {userPoints && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Current Points</p>
                                <p className="text-3xl font-bold text-gray-900">{userPoints.points || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <GiftIcon className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                                <p className="text-3xl font-bold text-green-600">{userPoints.earnedPoints || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Used</p>
                                <p className="text-3xl font-bold text-red-600">{userPoints.usedPoints || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {userPoints.expiresAt && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Expires At</p>
                                    <p className="text-sm font-semibold text-orange-600">
                                        {new Date(userPoints.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input pl-10 w-full"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPagination({ ...pagination, page: 1 });
                            }}
                        />
                    </div>
                    <select
                        className="input"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="earned">Earned</option>
                        <option value="used">Used</option>
                        <option value="expired">Expired</option>
                        <option value="reward">Reward</option>
                        <option value="bonus">Bonus</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Points Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Points</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                                {getTypeIcon(transaction.type)}
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.points > 0 ? '+' : ''}{transaction.points}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {transaction.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {transaction.order?.id ? (
                                                <span className="font-mono text-xs">{transaction.order.id.slice(0, 8)}...</span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Points Modal */}
            {isAdjustModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Adjust Points</h3>
                            <button
                                onClick={() => setIsAdjustModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleAdjustPoints} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">User ID *</label>
                                <input
                                    required
                                    type="text"
                                    className="input w-full"
                                    value={adjustForm.userId}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })}
                                    placeholder="Enter user ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Points Amount *</label>
                                <input
                                    required
                                    type="number"
                                    className="input w-full"
                                    value={adjustForm.points}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, points: e.target.value })}
                                    placeholder="Enter points (positive to add, negative to remove)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Use positive number to add, negative to remove</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="input w-full"
                                    value={adjustForm.type}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                                >
                                    <option value="reward">Reward</option>
                                    <option value="bonus">Bonus</option>
                                    <option value="earned">Earned</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    className="input w-full"
                                    value={adjustForm.description}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                                    placeholder="Optional description"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAdjustModalOpen(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Adjust Points
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Points;

