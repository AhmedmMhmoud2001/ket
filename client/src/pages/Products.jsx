import { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    BuildingStorefrontIcon,
    TagIcon,
    TrashIcon,
    EyeIcon,
    NoSymbolIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchProducts();
    }, [search, pagination.page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/products?search=${search}&page=${pagination.page}&limit=${pagination.limit}`);
            setProducts(res.data.data.products);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (id, currentStatus) => {
        try {
            await api.put(`/products/${id}`, { isAvailable: !currentStatus });
            toast.success('Product status updated');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
                <p className="text-gray-500">View and manage all products across all restaurants</p>
            </div>

            <div className="card">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search by product name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Restaurant</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]?.imageUrl?.startsWith('http') ? product.images[0].imageUrl : `http://localhost:5000${product.images[0].imageUrl}`}
                                                        alt={product.nameEn || product.nameAr}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{product.nameEn || product.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-[200px] font-medium">{product.nameAr}</div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <TagIcon className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{product.subcategory?.nameEn || product.subcategory?.name || 'No Category'}</span>
                                                    {product.images && product.images.length > 0 && (
                                                        <span className="text-xs text-gray-400">• {product.images.length} {product.images.length === 1 ? 'image' : 'images'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{product.restaurant?.name || 'Global'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ${product.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${product.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                                            {product.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleAvailability(product.id, product.isAvailable)}
                                                className={`p-2 rounded-lg transition-colors ${product.isAvailable ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={product.isAvailable ? 'Deactivate' : 'Activate'}
                                            >
                                                {product.isAvailable ? <NoSymbolIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
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

export default Products;
