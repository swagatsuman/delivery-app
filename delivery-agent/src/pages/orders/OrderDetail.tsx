import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchOrderDetails, updateOrderStatus } from '../../store/slices/orderSlice';
import { formatRelativeTime, formatCurrency, formatDate } from '../../utils/helpers';
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

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedOrder, loading, error } = useAppSelector(state => state.orders);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

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

    const handleStatusUpdate = async (status: string) => {
        if (!selectedOrder) return;

        try {
            await dispatch(updateOrderStatus({
                orderId: selectedOrder.id,
                status,
                location: currentLocation
            })).unwrap();
            toast.success('Order status updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update order status');
        }
    };

    const getNextAction = (currentStatus: string) => {
        const actions = {
            'assigned': { status: 'picked_up', label: 'Mark as Picked Up', color: 'primary' },
            'picked_up': { status: 'on_the_way', label: 'Start Delivery', color: 'primary' },
            'on_the_way': { status: 'delivered', label: 'Mark as Delivered', color: 'success' }
        };
        return actions[currentStatus as keyof typeof actions];
    };

    const openDirections = (address: any) => {
        const destination = `${address.coordinates.lat},${address.coordinates.lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <Layout title="Order Details">
                <Loading fullScreen text="Loading order details..." />
            </Layout>
        );
    }

    if (!selectedOrder) {
        return (
            <Layout title="Order Details">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-error-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">Order Not Found</h3>
                        <p className="text-secondary-600 mb-4">The order you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/orders')}>
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const nextAction = getNextAction(selectedOrder.status);

    return (
        <Layout
            title={`Order #${selectedOrder.orderNumber}`}
            actions={
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/orders')}
                    icon={<ArrowLeft className="h-4 w-4" />}
                >
                    Back to Orders
                </Button>
            }
        >
            <div className="p-6 space-y-6">
                {/* Order Header */}
                <Card padding="md">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                                Order #{selectedOrder.orderNumber}
                            </h2>
                            <div className="flex items-center space-x-4">
                                <Badge variant={
                                    selectedOrder.status === 'delivered' ? 'success' :
                                        selectedOrder.status === 'cancelled' ? 'error' :
                                            selectedOrder.status === 'on_the_way' ? 'warning' : 'info'
                                }>
                                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className="text-sm text-secondary-600">
                                    Placed {formatRelativeTime(selectedOrder.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-secondary-900">
                                {formatCurrency(selectedOrder.pricing.total)}
                            </p>
                            <p className="text-sm text-secondary-500">
                                Delivery Fee: {formatCurrency(selectedOrder.deliveryFee)}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {nextAction && (
                        <div className="flex space-x-3">
                            <Button
                                variant={nextAction.color as any}
                                onClick={() => handleStatusUpdate(nextAction.status)}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Addresses */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Restaurant Address */}
                        <Card title="Pickup Location" padding="md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-secondary-400 mt-1" />
                                    <div>
                                        <p className="font-medium text-secondary-900">Restaurant</p>
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
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 border border-secondary-200 rounded-lg">
                                        <div className="flex-shrink-0 w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center">
                                            <Package className="h-6 w-6 text-secondary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-secondary-900">{item.name}</h4>
                                            {item.customizations.length > 0 && (
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
                                                    Quantity: {item.quantity}
                                                </span>
                                                <span className="font-semibold text-secondary-900">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                        {formatCurrency(selectedOrder.deliveryFee * 0.8)} {/* 80% commission */}
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
        </Layout>
    );
};

export default OrderDetail;
