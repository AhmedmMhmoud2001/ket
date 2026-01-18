import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchRestaurants();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/customers');
            setUsers(res.data.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/restaurants');
            setRestaurants(res.data.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const handleUserChange = async (userId) => {
        setSelectedUser(userId);
        setSelectedAddress('');
        if (userId) {
            try {
                // Fetch addresses for selected user
                const res = await api.get(`/user-address/user/${userId}`);
                setAddresses(res.data.data || []);
            } catch (error) {
                console.error('Error fetching addresses:', error);
                setAddresses([]);
            }
        } else {
            setAddresses([]);
        }
    };

    const handleRestaurantChange = async (restaurantId) => {
        setSelectedRestaurant(restaurantId);
        setOrderItems([]);
        if (restaurantId) {
            try {
                const res = await api.get(`/products?restaurantId=${restaurantId}`);
                setProducts(res.data.data.products);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        } else {
            setProducts([]);
        }
    };

    const addItem = (product) => {
        const existing = orderItems.find(item => item.productId === product.id);
        if (existing) {
            setOrderItems(orderItems.map(item =>
                item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setOrderItems([...orderItems, {
                productId: product.id,
                name: product.nameEn,
                price: product.price,
                quantity: 1
            }]);
        }
    };

    const removeItem = (productId) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedRestaurant || !selectedAddress || !orderItems.length) {
            toast.error('Please fill all required fields and add items');
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                userId: selectedUser,
                restaurantId: selectedRestaurant,
                addressId: selectedAddress,
                items: orderItems,
                totalPrice: calculateTotal(),
                status: 'pending'
            };

            await api.post('/orders', orderData);
            toast.success('Order created successfully');
            navigate('/orders');
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card space-y-4">
                        <h2 className="text-lg font-semibold">Customer & Delivery</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                            <select
                                className="input"
                                value={selectedUser}
                                onChange={(e) => handleUserChange(e.target.value)}
                                required
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.phone})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                            <select
                                className="input"
                                value={selectedAddress}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                                required
                                disabled={!selectedUser}
                            >
                                <option value="">Select Address</option>
                                {addresses.map(addr => (
                                    <option key={addr.id} value={addr.id}>{addr.address} ({addr.type})</option>
                                ))}
                            </select>
                            {selectedUser && !addresses.length && (
                                <p className="text-xs text-red-500 mt-1">This user has no saved addresses.</p>
                            )}
                        </div>
                    </div>

                    <div className="card space-y-4">
                        <h2 className="text-lg font-semibold">Restaurant Selection</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Restaurant</label>
                            <select
                                className="input"
                                value={selectedRestaurant}
                                onChange={(e) => handleRestaurantChange(e.target.value)}
                                required
                            >
                                <option value="">Select Restaurant</option>
                                {restaurants.map(res => (
                                    <option key={res.id} value={res.id}>{res.nameEn}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card">
                        <h2 className="text-lg font-semibold mb-4">Products</h2>
                        {selectedRestaurant ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {products.map(product => (
                                    <div key={product.id} className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium">{product.nameEn}</p>
                                            <p className="text-sm text-gray-500">${product.price}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addItem(product)}
                                            className="p-1 bg-primary-100 text-primary-600 rounded-md hover:bg-primary-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Select a restaurant to see products</p>
                        )}
                    </div>

                    <div className="card h-fit sticky top-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            {orderItems.map(item => (
                                <div key={item.productId} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.productId)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {orderItems.length === 0 && (
                                <p className="text-gray-400 text-center py-4 italic">No items added</p>
                            )}

                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !orderItems.length}
                                className="w-full btn btn-primary mt-4 disabled:bg-gray-400"
                            >
                                {loading ? 'Creating...' : 'Create Order'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/orders')}
                                className="w-full btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default OrderForm;
