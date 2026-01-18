import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    RectangleGroupIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const Subcategories = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchSubcategories();
    }, [search, pagination.page]);

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/subcategories?search=${search}&page=${pagination.page}&limit=${pagination.limit}`);
            setSubcategories(res.data.data.subcategories);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            toast.error('Failed to load subcategories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subcategory?')) return;
        try {
            await api.delete(`/subcategories/${id}`);
            toast.success('Subcategory deleted');
            fetchSubcategories();
        } catch (error) {
            toast.error('Failed to delete subcategory');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subcategories Management</h1>
                    <p className="text-gray-500">View and manage food subcategories linked to parent categories</p>
                </div>
                <Link to="/subcategories/new" className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Subcategory
                </Link>
            </div>

            <div className="card">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search subcategories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Subcategory</th>
                                <th className="px-6 py-4">Parent Category</th>
                                <th className="px-6 py-4">Sort Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : subcategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                        No subcategories found.
                                    </td>
                                </tr>
                            ) : subcategories.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {sub.imageUrl ? (
                                                    <img
                                                        src={sub.imageUrl.startsWith('http') ? sub.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${sub.imageUrl}`}
                                                        alt={sub.nameEn}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <RectangleGroupIcon className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{sub.nameEn}</div>
                                                <div className="text-sm text-gray-500 font-medium">{sub.nameAr}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold uppercase">
                                            {sub.category_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                                        {sub.sortOrder || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/subcategories/${sub.id}/edit`}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subcategories;
