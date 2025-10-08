import React from 'react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { Order } from '../../../types';
import { formatRelativeTime, formatCurrency } from '../../../utils/helpers';
import { Clock, MapPin, Eye, Package, CheckCircle, XCircle } from 'lucide-react';

interface OrderListProps {
    orders: Order[];
    onStatusUpdate?: (orderId: string, status: string) => void;
    onAcceptOrder?: (orderId: string) => void;
    onViewDetails: (order: Order) => void;
    loading: boolean;
    emptyMessage: string;
    showActions?: boolean;
    showAcceptButton?: boolean;
}

export const OrderList: React.FC<OrderListProps> = ({
                                                        orders,
                                                        onStatusUpdate,
                                                        onAcceptOrder,
                                                        onViewDetails,
                                                        loading,
                                                        emptyMessage,
                                                        showActions = true,
                                                        showAcceptButton = false
                                                    }) => {
    const getNextStatus = (currentStatus: string) => {
        const statusFlow = {
            'assigned': 'picked_up',
            'picked_up': 'on_the_way',
            'on_the_way': 'delivered'
        };
        return statusFlow[currentStatus as keyof typeof statusFlow];
    };

    const getStatusAction = (status: string) => {
        const actions = {
            'assigned': 'Pick Up',
            'picked_up': 'Start Delivery',
            'on_the_way': 'Delivered'
        };
        return actions[status as keyof typeof actions];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="h-4 w-4 text-success-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-error-600" />;
            default:
                return <Package className="h-4 w-4 text-secondary-400" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse p-4 border border-secondary-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="h-4 bg-secondary-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-secondary-200 rounded w-48"></div>
                            </div>
                            <div className="h-6 bg-secondary-200 rounded w-16"></div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="h-8 bg-secondary-200 rounded w-20"></div>
                            <div className="h-8 bg-secondary-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Orders Found</h3>
                <p className="text-secondary-600">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const nextStatus = getNextStatus(order.status);

                return (
                    <div key={order.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    {getStatusIcon(order.status)}
                                    <h3 className="font-semibold text-secondary-900">#{order.orderNumber}</h3>
                                    <Badge variant={
                                        order.status === 'delivered' ? 'success' :
                                            order.status === 'cancelled' ? 'error' :
                                                order.status === 'on_the_way' ? 'warning' : 'info'
                                    }>
                                        {order.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-secondary-600 mb-3">
                                    <div>
                                        <p className="font-medium">Customer:</p>
                                        <p>{order.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Items:</p>
                                        <p>{order.items.length} items</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                                    <span className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {order.distance.toFixed(1)} km
                                    </span>
                                    <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatRelativeTime(order.createdAt)}
                                    </span>
                                </div>

                                <div className="text-xs text-secondary-500">
                                    <p><strong>Pickup:</strong> {(order as any).restaurant?.name || (order as any).restaurantName || order.addresses.restaurant.street}</p>
                                    <p><strong>Drop:</strong> {order.addresses.delivery.street}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold text-secondary-900 text-lg">
                                    {formatCurrency(order.deliveryFee)}
                                </p>
                                <p className="text-xs text-secondary-500">delivery fee</p>
                                <p className="text-sm font-medium text-secondary-700 mt-1">
                                    Total: {formatCurrency(order.pricing.total)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-xs text-secondary-500">
                                <p>Payment: {order.payment.method.toUpperCase()}</p>
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onViewDetails(order)}
                                    icon={<Eye className="h-3 w-3" />}
                                >
                                    View Details
                                </Button>
                                {showAcceptButton && onAcceptOrder && (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => onAcceptOrder(order.id)}
                                    >
                                        Accept Order
                                    </Button>
                                )}
                                {showActions && nextStatus && onStatusUpdate && (
                                    <Button
                                        size="sm"
                                        onClick={() => onStatusUpdate(order.id, nextStatus)}
                                    >
                                        {getStatusAction(order.status)}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
