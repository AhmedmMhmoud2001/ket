import { useState } from 'react';
import {
    ChatBubbleLeftRightIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Support = () => {
    const { t } = useTranslation();
    const [tickets] = useState([
        { id: 101, subject: 'Order never arrived', customer: 'John Doe', status: 'open', priority: 'high', date: '2 hours ago' },
        { id: 102, subject: 'Payment failed issue', customer: 'Sarah Connor', status: 'pending', priority: 'medium', date: '5 hours ago' },
        { id: 103, subject: 'Change address request', customer: 'Mike Ross', status: 'closed', priority: 'low', date: '1 day ago' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <div className="flex space-x-2">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">2 Open</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">1 Closed</span>
                </div>
            </div>

            <div className="card">
                <div className="divide-y divide-gray-100">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="py-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-mono text-gray-400">#{ticket.id}</span>
                                    <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                                    {ticket.priority === 'high' && <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-red-100">High</span>}
                                    {ticket.priority === 'medium' && <span className="bg-yellow-50 text-yellow-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-yellow-100">Medium</span>}
                                </div>
                                <p className="text-sm text-gray-500">From <span className="font-medium text-gray-700">{ticket.customer}</span> • {ticket.date}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                        ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-500'
                                    }`}>
                                    {ticket.status}
                                </span>

                                <button className="btn btn-secondary p-2 rounded-full" title="Reply">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                {ticket.status !== 'closed' && (
                                    <button className="btn btn-secondary p-2 rounded-full text-green-600 hover:bg-green-50" title="Close Ticket">
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Support;
