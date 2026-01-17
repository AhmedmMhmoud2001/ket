import { useState } from 'react';
import {
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Logs = () => {
    const { t } = useTranslation();
    const [logs] = useState([
        { id: 1, action: 'User Login', user: 'admin@fooddelivery.com', status: 'success', time: '10:30 AM', ip: '192.168.1.1' },
        { id: 2, action: 'Update Product', user: 'Manager John', status: 'success', time: '10:45 AM', ip: '192.168.1.4' },
        { id: 3, action: 'Delete Order', user: 'admin@fooddelivery.com', status: 'warning', time: '11:15 AM', ip: '192.168.1.1' },
        { id: 4, action: 'Failed Login', user: 'unknown@hacker.com', status: 'error', time: '11:20 AM', ip: '45.32.11.90' },
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">IP Address</th>
                            <th className="px-6 py-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium flex items-center">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2" />
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{log.user}</td>
                                <td className="px-6 py-4">
                                    {log.status === 'success' && <span className="badge badge-success flex w-fit items-center"><CheckCircleIcon className="w-3 h-3 mr-1" /> Success</span>}
                                    {log.status === 'warning' && <span className="badge badge-warning flex w-fit items-center"><ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Warning</span>}
                                    {log.status === 'error' && <span className="badge badge-danger flex w-fit items-center"><ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Error</span>}
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-gray-500">{log.ip}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" /> {log.time}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Logs;
