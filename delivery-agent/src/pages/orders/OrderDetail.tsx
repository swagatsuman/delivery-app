import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { fetchOrderDetails, updateOrderStatus } from '../../store/slices/orderSlice';
import { orderService } from '../../services/orderService';
import { formatRelativeTime, formatCurrency, formatDate } from '../../utils/helpers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Phone,
    User,
    Package,
    Navigation,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mobile TopHeader component
const TopHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="sticky top-0 z-10 bg-surface border-b border-secondary-200 px-4 py-3">
        <div className="flex items-center space-x-3">
            <button
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="h-5 w-5 text-secondary-700" />
            </button>
            <h1 className="text-lg font-semibold text-secondary-900 truncate">{title}</h1>
        </div>
    </div>
);

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { selectedOrder, loading, error } = useAppSelector(state => state.orders);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [agentCommission, setAgentCommission] = useState<number>(80); // Default 80%

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderDetails(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }
            );
        }
    }, []);

    // Fetch delivery settings for commission calculation
    useEffect(() => {
        const fetchDeliverySettings = async () => {
            try {
                const settingsDoc = await getDoc(doc(db, 'settings', 'delivery'));
                if (settingsDoc.exists()) {
                    const settings = settingsDoc.data();
                    setAgentCommission(settings.agentCommissionPercentage || 80);
                }
            } catch (error) {
                console.error('Error fetching delivery settings:', error);
                // Use default 80% if error
            }
        };

        fetchDeliverySettings();
    }, []);

    const handleStatusUpdate = async (status: string) => {
        if (!selectedOrder) return;

        console.log('Updating order status to:', status);
        console.log('Current location:', currentLocation);

        try {
            await dispatch(updateOrderStatus({
                orderId: selectedOrder.id,
                status,
                location: currentLocation
            })).unwrap();
            toast.success('Order status updated successfully');

            // Refresh order details
            console.log('Refreshing order details...');
            dispatch(fetchOrderDetails(selectedOrder.id));
        } catch (error: any) {
            console.error('Error updating order status:', error);
            toast.error(error.message || 'Failed to update order status');
        }
    };

    const getNextAction = (deliveryStatus: string) => {
        const actions = {
            'assigned': { status: 'picked_up', label: 'Mark as Picked Up', color: 'primary' },
            'picked_up': { status: 'on_the_way', label: 'Start Delivery', color: 'primary' },
            'on_the_way': { status: 'delivered', label: 'Mark as Delivered', color: 'success' },
            'out_for_delivery': { status: 'delivered', label: 'Mark as Delivered', color: 'success' }
        };
        return actions[deliveryStatus as keyof typeof actions];
    };

    const openDirections = (address: any) => {
        const destination = { lat: address.coordinates.lat, lng: address.coordinates.lng };
        // Use real-time current location if available, otherwise fall back to stored location
        const origin = currentLocation || user?.deliveryAgentDetails?.currentLocation;
        orderService.openGoogleMaps(destination, origin);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <TopHeader title="Order Details" onBack={() => navigate('/orders')} />
                <Loading fullScreen text="Loading order details..." />
            </div>
        );
    }

    if (!selectedOrder) {
        return (
            <div className="min-h-screen bg-background">
                <TopHeader title="Order Details" onBack={() => navigate('/orders')} />
                <div className="flex items-center justify-center h-96 px-4">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-error-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">Order Not Found</h3>
                        <p className="text-secondary-600 mb-4">The order you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/orders')}>
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const deliveryStatus = selectedOrder.deliveryStatus || 'assigned';
    const nextAction = getNextAction(deliveryStatus);

    // Don't show "Mark as Picked Up" button until food is ready
    const canShowPickupButton = deliveryStatus === 'assigned' && selectedOrder.status !== 'ready';
    const shouldHideButton = canShowPickupButton;

    return (
        <div className="min-h-screen bg-background">
            <TopHeader title={`Order #${selectedOrder.orderNumber}`} onBack={() => navigate('/orders')} />
            <div className="p-4 space-y-4 pb-20">
                {/* Order Header */}
                <Card padding="md">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <Badge variant={
                                selectedOrder.status === 'delivered' ? 'success' :
                                    selectedOrder.status === 'cancelled' ? 'error' :
                                        selectedOrder.status === 'on_the_way' ? 'warning' : 'info'
                            }>
                                {selectedOrder.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-xs text-secondary-600">
                                {formatRelativeTime(selectedOrder.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">Total Amount</p>
                                <p className="text-2xl font-bold text-secondary-900">
                                    {formatCurrency(selectedOrder.pricing.total)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-secondary-600">Your Earnings</p>
                                <p className="text-lg font-bold text-success-600">
                                    {formatCurrency(selectedOrder.deliveryFee * (agentCommission / 100))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {shouldHideButton ? (
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-warning-700 font-medium">
                                Waiting for restaurant to prepare food
                            </p>
                            <p className="text-xs text-warning-600 mt-1">
                                You can pick up once the status is "Ready"
                            </p>
                        </div>
                    ) : nextAction && (
                        <div className="flex space-x-3">
                            <Button
                                variant={nextAction.color as any}
                                onClick={() => {
                                    console.log('Button clicked! Next action:', nextAction);
                                    handleStatusUpdate(nextAction.status);
                                }}
                                className="flex-1"
                            >
                                {nextAction.label}
                            </Button>
                            {selectedOrder.status === 'assigned' && (
                                <Button
                                    variant="danger"
                                    onClick={() => handleStatusUpdate('cancelled')}
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    )}
                </Card>

                <div className="space-y-4">
                        {/* Restaurant Address */}
                        <Card title="Pickup Location" padding="md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-secondary-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-secondary-900">
                                            {(selectedOrder as any).restaurant?.name || (selectedOrder as any).restaurantName || 'Restaurant'}
                                        </p>
                                        <p className="text-sm text-secondary-600 mt-1">
                                            {selectedOrder.addresses.restaurant.street}<br />
                                            {selectedOrder.addresses.restaurant.city}, {selectedOrder.addresses.restaurant.state}<br />
                                            {selectedOrder.addresses.restaurant.pincode}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => openDirections(selectedOrder.addresses.restaurant)}
                                    icon={<Navigation className="h-4 w-4" />}
                                >
                                    Directions
                                </Button>
                            </div>
                        </Card>

                        {/* Delivery Address */}
                        <Card title="Delivery Location" padding="md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-primary-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-secondary-900">
                                            {selectedOrder.addresses.delivery.label}
                                        </p>
                                        <p className="text-sm text-secondary-600 mt-1">
                                            {selectedOrder.addresses.delivery.street}<br />
                                            {selectedOrder.addresses.delivery.city}, {selectedOrder.addresses.delivery.state}<br />
                                            {selectedOrder.addresses.delivery.pincode}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => openDirections(selectedOrder.addresses.delivery)}
                                    icon={<Navigation className="h-4 w-4" />}
                                >
                                    Directions
                                </Button>
                            </div>
                        </Card>

                        {/* Order Items */}
                        <Card title="Order Items" padding="md">
                            <div className="space-y-4">
                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                    selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-start space-x-4 p-4 border border-secondary-200 rounded-lg">
                                            <div className="flex-shrink-0 w-16 h-16 bg-secondary-100 rounded-lg overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            const parent = e.currentTarget.parentElement;
                                                            if (parent) {
                                                                parent.classList.add('flex', 'items-center', 'justify-center');
                                                                const icon = document.createElement('div');
                                                                icon.className = 'flex items-center justify-center';
                                                                icon.innerHTML = '<svg class="h-6 w-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                                                parent.appendChild(icon);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-secondary-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-secondary-900">{item.name || 'Item'}</h4>
                                                {item.customizations && item.customizations.length > 0 && (
                                                    <p className="text-sm text-secondary-600 mt-1">
                                                        Customizations: {item.customizations.join(', ')}
                                                    </p>
                                                )}
                                                {item.specialInstructions && (
                                                    <p className="text-sm text-warning-600 mt-1">
                                                        Note: {item.specialInstructions}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm text-secondary-600">
                                                        Quantity: {item.quantity || 0}
                                                    </span>
                                                    <span className="font-semibold text-secondary-900">
                                                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-secondary-500 text-center py-4">No items found</p>
                                )}
                            </div>
                        </Card>

                        {/* Order Timeline */}
                        <Card title="Order Timeline" padding="md">
                            <div className="space-y-4">
                                {selectedOrder.timeline.map((event, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-secondary-900 capitalize">
                                                {event.status.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-secondary-600">
                                                {formatDate(event.timestamp)}
                                            </p>
                                            {event.note && (
                                                <p className="text-sm text-secondary-500 mt-1">{event.note}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card title="Customer Details" padding="md">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-secondary-400" />
                                    <div>
                                        <p className="font-medium text-secondary-900">{selectedOrder.customerName}</p>
                                        <p className="text-sm text-secondary-600">Customer</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-secondary-400" />
                                        <span className="font-medium text-secondary-900">{selectedOrder.customerPhone}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => window.open(`tel:${selectedOrder.customerPhone}`)}
                                    >
                                        Call
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Payment Information */}
                        <Card title="Payment Details" padding="md">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Payment Method:</span>
                                    <span className="font-medium text-secondary-900">
                                        {selectedOrder.payment.method.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Payment Status:</span>
                                    <Badge variant={selectedOrder.payment.status === 'completed' ? 'success' : 'warning'} size="sm">
                                        {selectedOrder.payment.status}
                                    </Badge>
                                </div>

                                {selectedOrder.payment.method === 'cash' && (
                                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                                        <p className="text-sm text-warning-800">
                                            <strong>Cash Payment:</strong> Collect ₹{selectedOrder.pricing.total} from customer
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Order Summary */}
                        <Card title="Order Summary" padding="md">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Subtotal:</span>
                                    <span className="text-secondary-900">{formatCurrency(selectedOrder.pricing.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Tax:</span>
                                    <span className="text-secondary-900">{formatCurrency(selectedOrder.pricing.tax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Delivery Fee:</span>
                                    <span className="text-success-600">{formatCurrency(selectedOrder.pricing.deliveryFee)}</span>
                                </div>
                                {selectedOrder.pricing.discount > 0 && (
                                    <div className="flex justify-between text-success-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(selectedOrder.pricing.discount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-secondary-200 pt-3">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span className="text-secondary-900">Total:</span>
                                        <span className="text-secondary-900">{formatCurrency(selectedOrder.pricing.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Delivery Info */}
                        <Card title="Delivery Information" padding="md">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Distance:</span>
                                    <span className="text-secondary-900">{selectedOrder.distance.toFixed(1)} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Estimated Time:</span>
                                    <span className="text-secondary-900">
                                        {selectedOrder.estimatedDeliveryTime.toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Your Earnings:</span>
                                    <span className="text-success-600 font-semibold">
                                        {formatCurrency(selectedOrder.deliveryFee * (agentCommission / 100))} ({agentCommission}% commission)
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Special Instructions */}
                        {selectedOrder.specialInstructions && (
                            <Card title="Special Instructions" padding="md">
                                <p className="text-sm text-secondary-700 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                                    {selectedOrder.specialInstructions}
                                </p>
                            </Card>
                        )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
