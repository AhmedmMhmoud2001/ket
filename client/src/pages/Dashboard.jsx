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
    Legend,
    BarChart,
    Bar,
    LineChart,
    Line
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const KPICard = ({ title, value, change, icon: Icon, color, subValue }) => {
    const { t, i18n } = useTranslation();
    const isPositive = change >= 0;
    const isRTL = i18n.language === 'ar';

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="card">
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                    {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className={`mt-4 flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}>
                <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpIcon className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} /> : <ArrowDownIcon className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />}
                    {Math.abs(change)}%
                </span>
                <span className="text-sm text-gray-500">{t('dashboard.vsLastPeriod')}</span>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [orderSources, setOrderSources] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [orderTrendsData, setOrderTrendsData] = useState([]);

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

                // Process order status distribution
                if (ordersRes.data.data.order_statuses) {
                    setOrderStatusData(ordersRes.data.data.order_statuses.map(s => ({
                        name: s.name.charAt(0).toUpperCase() + s.name.slice(1).replace(/_/g, ' '),
                        value: s.value
                    })));
                }

                // Process order trends (use chart data as trends)
                if (chartRes.data.data && chartRes.data.data.length > 0) {
                    setOrderTrendsData(chartRes.data.data.map(item => ({
                        date: item.date,
                        orders: item.orders || Math.floor(item.revenue / 50) // Mock orders if not available
                    })));
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error(t('dashboard.failedToLoad'));
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
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.overview')}</h1>
                <div className="text-sm text-gray-500">
                    {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title={t('dashboard.totalRevenue')}
                        value={`$${stats.revenue.value.toLocaleString()}`}
                        change={stats.revenue.change}
                        icon={CurrencyDollarIcon}
                        color="green"
                    />
                    <KPICard
                        title={t('dashboard.totalOrders')}
                        value={stats.orders.value}
                        change={stats.orders.change}
                        icon={ShoppingBagIcon}
                        color="blue"
                    />
                    <KPICard
                        title={t('dashboard.totalCustomers')}
                        value={stats.customers.value}
                        change={stats.customers.change}
                        icon={UserGroupIcon}
                        color="purple"
                    />
                    <KPICard
                        title={t('dashboard.activeDrivers')}
                        value={stats.active_drivers.value}
                        change={0} // Driver change not implemented yet
                        subValue={t('dashboard.onlineWorking')}
                        icon={TruckIcon}
                        color="orange"
                    />
                </div>
            )}

            {/* Additional Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Distribution (Bar Chart) */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status Distribution</h2>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={orderStatusData.length > 0 ? orderStatusData : [{ name: 'No Data', value: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Trends (Line Chart) */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Trends (7 Days)</h2>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={orderTrendsData.length > 0 ? orderTrendsData : []}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                    formatter={(value) => [value, 'Orders']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Revenue Chart */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.revenueAnalytics')}</h2>
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height={300}>
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
                                        formatter={(value) => [`$${value}`, t('dashboard.totalRevenue')]}
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
                            <h2 className="text-lg font-bold text-gray-900">{t('dashboard.activeOrdersStatus')}</h2>
                            <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">{t('dashboard.viewAll')}</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">{t('dashboard.orderId')}</th>
                                        <th className="px-4 py-3 font-medium">{t('dashboard.customer')}</th>
                                        <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                                        <th className="px-4 py-3 font-medium">{t('dashboard.driver')}</th>
                                        <th className="px-4 py-3 font-medium">{t('dashboard.time')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activeOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">{t('dashboard.noActiveOrders')}</td>
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
                                                        {t(`orders.${order.status === 'on_the_way' ? 'onTheWay' : order.status}`) || order.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{order.driver_name || t('dashboard.unassigned')}</td>
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
                        <h2 className="text-lg font-bold text-gray-900 mb-4 w-full text-left">{t('dashboard.paymentMethods')}</h2>
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height={250}>
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
                                <p className="text-xs text-gray-500 uppercase font-semibold">{t('dashboard.total')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h2>
                        <div className="space-y-4">
                            {recentActivities.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">{t('dashboard.noRecentActivity')}</p>
                            ) : (
                                recentActivities.map((activity, index) => (
                                    <div key={index} className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
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
                            {t('dashboard.viewAllActivity')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
