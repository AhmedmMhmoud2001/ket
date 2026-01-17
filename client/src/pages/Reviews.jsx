import { useState } from 'react';
import {
    StarIcon,
    TrashIcon,
    CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

const Reviews = () => {
    const { t } = useTranslation();
    const [reviews] = useState([
        { id: 1, user: 'John Doe', item: 'Big Mac Burger', rating: 5, comment: 'Absolutely delicious! Arrived hot.', date: '2 mins ago', status: 'pending' },
        { id: 2, user: 'Sarah Smith', item: 'Driver: Ahmed Ali', rating: 4, comment: 'Fast delivery but forgot the napkin.', date: '1 hour ago', status: 'approved' },
        { id: 3, user: 'Mike Ross', item: 'Pizza Hut', rating: 1, comment: 'Cold pizza, terrible service.', date: 'Yesterday', status: 'rejected' },
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>

            <div className="card">
                <div className="divide-y divide-gray-100">
                    {reviews.map(review => (
                        <div key={review.id} className="py-6 flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                    {review.user.charAt(0)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{review.user}</h4>
                                        <p className="text-xs text-gray-500">Reviewed: <span className="font-medium text-gray-800">{review.item}</span> • {review.date}</p>
                                    </div>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>

                                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {review.comment}
                                </p>

                                <div className="mt-3 flex space-x-3">
                                    {review.status === 'pending' && (
                                        <button className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center">
                                            <CheckCircleIcon className="w-4 h-4 mr-1" /> Approve
                                        </button>
                                    )}
                                    <button className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center">
                                        <TrashIcon className="w-4 h-4 mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
