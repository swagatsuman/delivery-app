import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { Order } from '../../../types';
import { formatRelativeTime, formatCurrency } from '../../../utils/helpers';
import { Clock, MapPin, Phone } from 'lucide-react';

interface RecentOrdersProps {
    orders: Order[];
    loading: boolean;
    onStatusUpdate: (orderId: string, status: string) => void;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({
                                                              orders,
                                                              loading,
                                                              onStatusUpdate
                                                          }) => {
    if (loading) {
        return (
            <Card title="Recent Orders" padding="md">
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse p-4 border border-secondary-200 rounded-lg">
                            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    const getNextStatus = (currentStatus: string) => {
        const statusFlow = {
            'placed': 'confirmed',
            'confirmed': 'preparing',
            'preparing': 'ready',
            'ready': 'picked_up'
        };
        return statusFlow[currentStatus as keyof typeof statusFlow];
    };

    const getStatusAction = (status: string) => {
        const actions = {
            'placed': 'Accept Order',
            'confirmed': 'Start Preparing',
            'preparing': 'Mark Ready',
            'ready': 'Order Picked Up'
        };
        return actions[status as keyof typeof actions];
    };

    return (
        <Card title="Recent Orders" padding="md">
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                        <p className="text-secondary-500">No recent orders</p>
                    </div>
                ) : (
                    orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h4 className="font-semibold text-secondary-900">#{order.orderNumber}</h4>
                                        <Badge variant={
                                            order.status === 'delivered' ? 'success' :
                                                order.status === 'cancelled' ? 'error' :
                                                    order.status === 'ready' ? 'warning' : 'info'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-secondary-600 mb-1">
                                        {order.customerName} • {formatRelativeTime(order.createdAt)}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-secondary-500">
                    <span className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                        {order.customerPhone}
                    </span>
                                        <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                                            {order.addresses.delivery.city}
                    </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-secondary-900">{formatCurrency(order.pricing.total)}</p>
                                    <p className="text-xs text-secondary-500">{order.items.length} items</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <span key={index} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                      {item.quantity}x {item.name}
                    </span>
                                    ))}
                                    {order.items.length > 3 && (
                                        <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                      +{order.items.length - 3} more
                    </span>
                                    )}
                                </div>

                                {getNextStatus(order.status) && (
                                    <Button
                                        size="sm"
                                        onClick={() => onStatusUpdate(order.id, getNextStatus(order.status)!)}
                                    >
                                        {getStatusAction(order.status)}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
