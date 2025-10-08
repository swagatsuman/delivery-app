import React from 'react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { Order } from '../../../types';
import { formatRelativeTime, formatCurrency, getOrderStatusColor } from '../../../utils/helpers';
import { Clock, MapPin, Phone, Eye, User, AlertCircle } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    onStatusUpdate: (orderId: string, status: string) => void;
    onViewDetails: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
                                                        order,
                                                        onStatusUpdate,
                                                        onViewDetails
                                                    }) => {
    // Calculate subtotal from items
    const calculateSubtotal = () => {
        if (!order.items || order.items.length === 0) return 0;
        return order.items.reduce((sum, item) => {
            const price = item.menuItem?.price || item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const itemsSubtotal = calculateSubtotal();

    const getNextStatus = (currentStatus: string) => {
        const statusFlow = {
            'placed': 'confirmed',
            'confirmed': 'preparing',
            'preparing': 'ready'
        };
        return statusFlow[currentStatus as keyof typeof statusFlow];
    };

    const getStatusAction = (status: string) => {
        const actions = {
            'placed': 'Accept Order',
            'confirmed': 'Start Preparing',
            'preparing': 'Mark Ready'
        };
        return actions[status as keyof typeof actions];
    };

    const isUrgent = () => {
        if (order.status !== 'placed') return false;
        const orderTime = new Date(order.createdAt).getTime();
        const now = new Date().getTime();
        const minutesElapsed = (now - orderTime) / (1000 * 60);
        return minutesElapsed > 15;
    };

    const getEstimatedTime = () => {
        const totalPrepTime = Math.max(...order.items.map(item => 15)); // Default 15 mins
        const orderTime = new Date(order.createdAt);
        const estimatedTime = new Date(orderTime.getTime() + totalPrepTime * 60000);
        return estimatedTime;
    };

    return (
        <div className={`border rounded-xl p-6 hover:shadow-md transition-all ${
            isUrgent() ? 'border-error-200 bg-error-50' : 'border-secondary-200 bg-surface'
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">
                            #{order.orderNumber}
                        </h3>
                        <Badge variant={
                            order.status === 'delivered' ? 'success' :
                                order.status === 'cancelled' ? 'error' :
                                    order.status === 'ready' ? 'warning' : 'info'
                        }>
                            {order.status.replace('_', ' ')}
                        </Badge>
                        {isUrgent() && (
                            <Badge variant="error" size="sm">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Urgent
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                        <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {order.customerName}
                        </span>
                        <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {order.customerPhone}
                        </span>
                        <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatRelativeTime(order.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xl font-bold text-secondary-900">
                        {formatCurrency(order.pricing.total)}
                    </p>
                    <p className="text-sm text-secondary-500">{order.items.length} items</p>
                </div>
            </div>

            {/* Customer Address */}
            {order.deliveryAddress && (
                <div className="flex items-start space-x-2 mb-4 p-3 bg-secondary-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-secondary-700">
                        <p className="font-medium">{order.deliveryAddress.label || 'Delivery Address'}</p>
                        <p>{order.deliveryAddress.address}</p>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-secondary-900">Order Items:</h4>
                <div className="space-y-1">
                    {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-secondary-700">
                                {item.quantity}x {item.menuItem?.name || item.name || 'Item'}
                                {item.customizations?.length > 0 && (
                                    <span className="text-secondary-500 ml-1">
                                        ({item.customizations.join(', ')})
                                    </span>
                                )}
                            </span>
                            <span className="font-medium text-secondary-900">
                                {formatCurrency((item.menuItem?.price || item.price || 0) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
                <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <p className="text-sm text-warning-800">
                        <strong>Special Instructions:</strong> {order.specialInstructions}
                    </p>
                </div>
            )}

            {/* Payment Info */}
            {order.payment && (
                <div className="flex items-center justify-between text-sm text-secondary-600 mb-4">
                    <span>Payment: {order.payment.method?.toUpperCase() || 'N/A'}</span>
                    <Badge variant={order.payment.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {order.payment.status}
                    </Badge>
                </div>
            )}

            {/* Pricing Breakdown */}
            <div className="border-t border-secondary-200 pt-3 mb-4">
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-secondary-600">Subtotal:</span>
                        <span className="text-secondary-900">{formatCurrency(itemsSubtotal)}</span>
                    </div>
                    {order.pricing && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Tax:</span>
                                <span className="text-secondary-900">{formatCurrency(order.pricing.taxes || order.pricing.tax || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Delivery Fee:</span>
                                <span className="text-secondary-900">{formatCurrency(order.pricing.deliveryFee || order.pricing.delivery || 0)}</span>
                            </div>
                            {(order.pricing.discount || 0) > 0 && (
                                <div className="flex justify-between text-success-600">
                                    <span>Discount:</span>
                                    <span>-{formatCurrency(order.pricing.discount)}</span>
                                </div>
                            )}
                            {(order.pricing.platformFee || 0) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Platform Fee:</span>
                                    <span className="text-secondary-900">{formatCurrency(order.pricing.platformFee)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-secondary-900 border-t border-secondary-200 pt-1">
                                <span>Total:</span>
                                <span>{formatCurrency(order.pricing.total || 0)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onViewDetails(order)}
                    icon={<Eye className="h-4 w-4" />}
                >
                    View Details
                </Button>

                <div className="flex space-x-2">
                    {order.status === 'placed' && (
                        <>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onStatusUpdate(order.id, 'cancelled')}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => onStatusUpdate(order.id, 'confirmed')}
                            >
                                Accept Order
                            </Button>
                        </>
                    )}

                    {getNextStatus(order.status) && order.status !== 'placed' && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onStatusUpdate(order.id, getNextStatus(order.status)!)}
                        >
                            {getStatusAction(order.status)}
                        </Button>
                    )}
                </div>
            </div>

            {/* Estimated Time */}
            {order.status === 'confirmed' && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated ready time: {getEstimatedTime().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </div>
            )}

            {/* Waiting for Delivery Agent */}
            {order.status === 'ready' && !order.deliveryAgentId && (
                <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg text-sm text-warning-800">
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 animate-pulse" />
                        <span className="font-medium">Waiting for delivery agent to pick up</span>
                    </div>
                </div>
            )}

            {/* Delivery Agent Assigned */}
            {order.status === 'ready' && order.deliveryAgentId && (
                <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded-lg text-sm text-success-800">
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">Delivery agent assigned - waiting for pickup</span>
                    </div>
                </div>
            )}
        </div>
    );
};
