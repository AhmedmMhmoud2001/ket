import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // Placeholder usage

// In a real app, you'd use @react-google-maps/api properly with an API Key
// Since I don't have a key, I'll simulate the map container

const OrderTracking = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const socketRef = useRef();

    useEffect(() => {
        fetchTrackingInfo();

        // Connect to Socket.io
        socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socketRef.current.emit('join-order', id);

        socketRef.current.on('driver-location', (data) => {
            console.log('New driver location:', data);
            setDriverLocation({ lat: data.latitude, lng: data.longitude });
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);

    const fetchTrackingInfo = async () => {
        try {
            const response = await api.get(`/orders/${id}/tracking`);
            setOrder(response.data.data);
            if (response.data.data.driver_location) {
                setDriverLocation({
                    lat: parseFloat(response.data.data.driver_location.latitude),
                    lng: parseFloat(response.data.data.driver_location.longitude)
                });
            }
        } catch (error) {
            console.error('Error fetching tracking info:', error);
        }
    };

    if (!order) return <div className="p-8 text-center">Loading tracking info...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="bg-white p-4 border-b border-gray-200 shadow-sm flex justify-between items-center z-10 relative">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Live Tracking: Order #{order.order_number || order.id}</h1>
                    <p className="text-sm text-gray-500">
                        Driver: <span className="font-medium text-gray-900">{order.driver_name || 'Assigned'}</span> •
                        ETA: <span className="font-medium text-primary-600">15 mins</span>
                    </p>
                </div>
                <div className="badge badge-info animate-pulse">
                    Live Updates Active
                </div>
            </div>

            {/* Map Implementation Placeholder */}
            <div className="flex-1 bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center p-8">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Google Maps Integration</h2>
                        <p className="text-gray-600 max-w-md mx-auto mb-4">
                            This is a placeholder for the Google Maps component. To enable live maps:
                        </p>
                        <ol className="text-left text-sm text-gray-600 max-w-sm mx-auto list-disc pl-5 space-y-1 mb-6">
                            <li>Get a Google Maps JavaScript API Key</li>
                            <li>Add it to your <code>.env</code> file</li>
                            <li>Uncomment the <code>GoogleMap</code> component in <code>OrderTracking.jsx</code></li>
                        </ol>

                        {/* Simulation of marker movement */}
                        {driverLocation && (
                            <div className="bg-white p-4 rounded-lg shadow-lg inline-block text-left">
                                <p className="font-bold text-gray-900 mb-1">Current Driver Coordinates:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                                    Lat: {driverLocation.lat.toFixed(6)}
                                </code>
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1">
                                    Lng: {driverLocation.lng.toFixed(6)}
                                </code>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
