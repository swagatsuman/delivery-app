import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { Order } from '../../../types';
import { formatRelativeTime, formatCurrency } from '../../../utils/helpers';
import { Clock, MapPin, Eye, CheckCircle } from 'lucide-react';

interface RecentDeliveriesProps {
    orders: Order[];
    onStatusUpdate: (orderId: string, status: string) => void;
    loading: boolean;
}

export const RecentDeliveries: React.FC<RecentDeliveriesProps> = ({
                                                                      orders,
                                                                      onStatusUpdate,
                                                                      loading
                                                                  }) => {
    if (loading) {
        return (
            <Card title="Recent Deliveries" padding="md">
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

    return (
        <Card title="Recent Deliveries" padding="md">
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                        <p className="text-secondary-500">No recent deliveries</p>
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
                                                    order.status === 'on_the_way' ? 'warning' : 'info'
                                        }>
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                                        <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {order.distance.toFixed(1)} km
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatRelativeTime(order.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-secondary-900">
                                        {formatCurrency(order.deliveryFee)}
                                    </p>
                                    <p className="text-xs text-secondary-500">{order.items.length} items</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-secondary-500">
                                    Customer: {order.customerName}
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        icon={<Eye className="h-3 w-3" />}
                                    >
                                        View
                                    </Button>
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
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
