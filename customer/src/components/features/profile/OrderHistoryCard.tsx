import React from 'react';
import { Clock, Star, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { Order } from '../../../types';
import { ORDER_STATUS_LABELS } from '../../../utils/constants';

interface OrderHistoryCardProps {
    order: Order;
    onReorder?: (order: Order) => void;
    onRate?: (order: Order) => void;
}

export const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
                                                                      order,
                                                                      onReorder,
                                                                      onRate
                                                                  }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            case 'placed':
            case 'confirmed':
            case 'preparing': return 'warning';
            default: return 'primary';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const handleViewDetails = () => {
        if (order.status === 'delivered' || order.status === 'cancelled') {
            // Navigate to order details
            navigate(`/orders/${order.id}`);
        } else {
            // Navigate to order tracking
            navigate(`/order-tracking/${order.id}`);
        }
    };

    return (
        <div className="p-4 bg-surface border border-secondary-200 rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-secondary-900">
                        {order.restaurant?.name || (order as any).restaurantName || 'Restaurant'}
                    </h3>
                    <p className="text-sm text-secondary-600">
                        Order #{order.orderNumber} • {formatDate(order.createdAt)}
                    </p>
                </div>
                <Badge variant={getStatusColor(order.status) as any}>
                    {ORDER_STATUS_LABELS[order.status]}
                </Badge>
            </div>

            {/* Items */}
            <div className="mb-3">
                <p className="text-sm text-secondary-600">
                    {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''} • ₹{order.pricing?.total || 0}
                </p>
                <div className="text-xs text-secondary-500 mt-1">
                    {order.items?.slice(0, 2).map(item => item.menuItem?.name || 'Item').join(', ')}
                    {(order.items?.length || 0) > 2 && ` +${(order.items?.length || 0) - 2} more`}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-secondary-200">
                <button
                    onClick={handleViewDetails}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    {order.status === 'delivered' || order.status === 'cancelled' ? 'View Details' : 'Track Order'}
                </button>

                <div className="flex items-center space-x-2">
                    {order.status === 'delivered' && !order.rating && onRate && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onRate(order)}
                        >
                            <Star className="h-4 w-4 mr-1" />
                            Rate
                        </Button>
                    )}

                    {order.status === 'delivered' && onReorder && (
                        <Button
                            size="sm"
                            onClick={() => onReorder(order)}
                        >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reorder
                        </Button>
                    )}
                </div>
            </div>

            {/* Rating Display */}
            {order.rating && (
                <div className="mt-3 pt-3 border-t border-secondary-200">
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-secondary-700">Food: {order.rating.foodRating}/5</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-secondary-500" />
                            <span className="text-secondary-700">Delivery: {order.rating.deliveryRating}/5</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
