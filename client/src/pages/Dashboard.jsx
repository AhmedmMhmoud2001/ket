import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    TruckIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const KPICard = ({ title, value, change, icon: Icon, color, subValue }) => {
    const isPositive = change >= 0;

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                    {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                    {Math.abs(change)}%
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [orderSources, setOrderSources] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [kpisRes, chartRes, ordersRes, activeOrdersRes, activitiesRes] = await Promise.all([
                    api.get('/dashboard/kpis?period=month'),
                    api.get('/dashboard/revenue-chart?period=week'),
                    api.get('/dashboard/orders-analytics'),
                    api.get('/dashboard/active-orders?limit=5'),
                    api.get('/dashboard/recent-activities?limit=5')
                ]);

                setStats(kpisRes.data.data);
                setChartData(chartRes.data.data);

                // Process Active Orders
                setActiveOrders(activeOrdersRes.data.data);

                // Process Order Sources (using Payment Methods)
                const sources = ordersRes.data.data.payment_methods.map(m => ({
                    name: m.name === 'cash' ? 'Cash' : m.name === 'card' ? 'Card' : 'Wallet',
                    value: m.value
                }));
                // If empty mock data for visualization
                if (sources.length === 0) {
                    setOrderSources([
                        { name: 'No Data', value: 100 }
                    ]);
                } else {
                    setOrderSources(sources);
                }

                setRecentActivities(activitiesRes.data.data);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Total Revenue"
                        value={`$${stats.revenue.value.toLocaleString()}`}
                        change={stats.revenue.change}
                        icon={CurrencyDollarIcon}
                        color="green"
                    />
                    <KPICard
                        title="Total Orders"
                        value={stats.orders.value}
                        change={stats.orders.change}
                        icon={ShoppingBagIcon}
                        color="blue"
                    />
                    <KPICard
                        title="Total Customers"
                        value={stats.customers.value}
                        change={stats.customers.change}
                        icon={UserGroupIcon}
                        color="purple"
                    />
                    <KPICard
                        title="Active Drivers"
                        value={stats.active_drivers.value}
                        change={0} // Driver change not implemented yet
                        subValue="Online & Working"
                        icon={TruckIcon}
                        color="orange"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Revenue Chart */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Analytics (Last 7 Days)</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value) => [`$${value}`, 'Revenue']}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#ef4444"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Active Orders Table */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Active Orders Status</h2>
                            <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Order ID</th>
                                        <th className="px-4 py-3 font-medium">Customer</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Driver</th>
                                        <th className="px-4 py-3 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No active orders right now.</td>
                                        </tr>
                                    ) : (
                                        activeOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.order_number}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{order.customer_name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${order.status === 'preparing' ? 'bg-orange-100 text-orange-600' :
                                                            order.status === 'ready' ? 'bg-blue-100 text-blue-600' :
                                                                order.status === 'on_the_way' ? 'bg-purple-100 text-purple-600' :
                                                                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                                        'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{order.driver_name || 'Unassigned'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Order Sources (Pie Chart) */}
                    <div className="card flex flex-col items-center justify-center">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 w-full text-left">Payment Methods</h2>
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orderSources.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                <p className="text-3xl font-bold text-gray-900">
                                    {orderSources.reduce((acc, curr) => acc + curr.value, 0)}
                                </p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivities.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No recent activity.</p>
                            ) : (
                                recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Order #{activity.reference} - {activity.status}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(activity.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link to="/orders" className="block w-full btn btn-secondary mt-4 text-sm text-center">
                            View All Activity
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
