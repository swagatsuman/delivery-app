import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { TopHeader } from '../../components/layout/TopHeader';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchOrderDetails } from '../../store/slices/orderSlice';
import { Loading } from '../../components/ui/Loading';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const OrderTracking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentOrder, loading } = useAppSelector(state => state.order);

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderDetails(id));
        }
    }, [id, dispatch]);

    if (loading || !currentOrder) {
        return <Loading fullScreen />;
    }

    const getStatusStep = (status: string) => {
        const steps = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'];
        return steps.indexOf(status);
    };

    const currentStep = getStatusStep(currentOrder.status);
    const statusSteps = [
        { key: 'placed', label: 'Order Placed', time: currentOrder.createdAt },
        { key: 'confirmed', label: 'Order Confirmed', time: null },
        { key: 'preparing', label: 'Preparing Food', time: null },
        { key: 'ready', label: 'Food Ready', time: null },
        { key: 'picked_up', label: 'Order Picked Up', time: null },
        { key: 'on_the_way', label: 'On the Way', time: null },
        { key: 'delivered', label: 'Delivered', time: currentOrder.actualDeliveryTime }
    ];

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const handleCallRestaurant = () => {
        // Implement call functionality
        window.location.href = `tel:+911234567890`;
    };

    const handleChatSupport = () => {
        // Implement chat functionality
        navigate('/help');
    };

    return (
        <div className="min-h-screen bg-background">
            <TopHeader title={`Order #${currentOrder.orderNumber}`} />

            <div className="p-4 space-y-6">
                {/* Status Header */}
                <div className="bg-surface rounded-xl p-4 text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-secondary-900 mb-2">
                        {ORDER_STATUS_LABELS[currentOrder.status]}
                    </h2>
                    {currentOrder.status !== 'delivered' && (
                        <p className="text-secondary-600">
                            Estimated delivery: {formatTime(currentOrder.estimatedDeliveryTime)}
                        </p>
                    )}
                </div>

                {/* Order Timeline */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-4">Order Status</h3>
                    <div className="space-y-4">
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStep;
                            const isActive = index === currentStep;

                            return (
                                <div key={step.key} className="flex items-center space-x-3">
                                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                        isCompleted
                                            ? 'bg-primary-500'
                                            : isActive
                                                ? 'bg-primary-200 border-2 border-primary-500'
                                                : 'bg-secondary-200'
                                    }`} />
                                    <div className="flex-1">
                                        <p className={`font-medium ${
                                            isCompleted ? 'text-secondary-900' : 'text-secondary-500'
                                        }`}>
                                            {step.label}
                                        </p>
                                        {step.time && (
                                            <p className="text-sm text-secondary-600">
                                                {formatTime(step.time)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Restaurant Details */}
                <div className="bg-surface rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={currentOrder.restaurant.images[0]}
                            alt={currentOrder.restaurant.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold text-secondary-900">{currentOrder.restaurant.name}</h4>
                            <p className="text-sm text-secondary-600">{currentOrder.restaurant.address.address}</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCallRestaurant}
                        >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                        </Button>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Delivery Address</h3>
                    <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-secondary-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-secondary-900">
                                {currentOrder.deliveryAddress.label}
                            </p>
                            <p className="text-sm text-secondary-600">
                                {currentOrder.deliveryAddress.address}
                            </p>
                            <p className="text-sm text-secondary-600">
                                {currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {currentOrder.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-secondary-900">{item.menuItem.name}</p>
                                    <p className="text-sm text-secondary-600">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-medium text-secondary-900">₹{item.totalPrice}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-secondary-200 mt-4 pt-3">
                        <div className="flex justify-between font-semibold text-lg">
                            <span className="text-secondary-900">Total Paid</span>
                            <span className="text-secondary-900">₹{currentOrder.pricing.total}</span>
                        </div>
                    </div>
                </div>

                {/* Help */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Need Help?</h3>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={handleChatSupport}
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat Support
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={handleCallRestaurant}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Restaurant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
