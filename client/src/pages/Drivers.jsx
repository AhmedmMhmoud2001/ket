import { useState, useEffect } from 'react';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    TruckIcon,
    PhoneIcon,
    StarIcon,
    PencilSquareIcon,
    TrashIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useTranslation } from 'react-i18next';

const Drivers = () => {
    const { t } = useTranslation();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        vehicle_type: 'bike',
        vehicle_number: '',
        email: '',
        password: '',
        status: 'offline'
    });

    useEffect(() => {
        fetchDrivers();
    }, [search, statusFilter, pagination.page]);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/drivers?search=${search}&status=${statusFilter}&page=${pagination.page}&limit=${pagination.limit}`);
            setDrivers(res.data.data.drivers);
            if (res.data.data.pagination) {
                setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
            }
        } catch (error) {
            toast.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDriver) {
                await api.put(`/drivers/${editingDriver.id}`, formData);
                toast.success('Driver updated');
            } else {
                await api.post('/drivers', formData);
                toast.success('Driver created');
            }
            setIsModalOpen(false);
            setEditingDriver(null);
            resetForm();
            fetchDrivers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const openEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            full_name: driver.full_name,
            phone: driver.phone,
            vehicle_type: driver.vehicle_type,
            vehicle_number: driver.vehicle_number,
            email: driver.email || '',
            status: driver.status,
            password: '' // Don't populate password
        });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingDriver(null);
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            phone: '',
            vehicle_type: 'bike',
            vehicle_number: '',
            email: '',
            password: '',
            status: 'offline'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this driver?')) return;
        try {
            await api.delete(`/drivers/${id}`);
            toast.success('Driver deleted');
            fetchDrivers();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available': return 'badge-success';
            case 'busy': return 'badge-warning';
            case 'offline': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Drivers Fleet</h1>
                <button onClick={openNew} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Driver
                </button>
            </div>

            <div className="card">
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Search drivers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="input w-auto"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Total Deliveries</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-6">Loading...</td></tr>
                            ) : drivers.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-6 text-gray-500">No drivers found.</td></tr>
                            ) : (
                                drivers.map(driver => (
                                    <tr key={driver.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold mr-3">
                                                    {driver.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{driver.full_name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center">
                                                        <PhoneIcon className="w-3 h-3 mr-1" /> {driver.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="capitalize flex items-center">
                                                <TruckIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                {driver.vehicle_type}
                                            </div>
                                            <div className="text-xs text-gray-500 pl-5">{driver.vehicle_number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(driver.status)}`}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                                <span>{driver.rating || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{driver.total_deliveries || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {driver.latitude && driver.longitude ? (
                                                <div className="flex items-center" title={`${driver.latitude}, ${driver.longitude}`}>
                                                    <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                                                    Active
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEdit(driver)} className="text-gray-400 hover:text-primary-600 mr-3">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(driver.id)} className="text-gray-400 hover:text-red-600">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name *</label>
                                <input required type="text" className="input" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone *</label>
                                    <input required type="tel" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            {!editingDriver && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password *</label>
                                    <input required type="password" className="input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                                    <select className="input" value={formData.vehicle_type} onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}>
                                        <option value="bike">Bike</option>
                                        <option value="scooter">Scooter</option>
                                        <option value="car">Car</option>
                                        <option value="van">Van</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                                    <input type="text" className="input" value={formData.vehicle_number} onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="offline">Offline</option>
                                </select>
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

export default Drivers;
