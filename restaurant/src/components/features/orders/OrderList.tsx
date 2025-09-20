import React from 'react';
import { OrderCard } from './OrderCard';
import type { Order } from '../../../types';
import { Clock, CheckCircle } from 'lucide-react';

interface OrderListProps {
    orders: Order[];
    onStatusUpdate: (orderId: string, status: string) => void;
    onViewDetails: (order: Order) => void;
    loading: boolean;
    emptyMessage?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
                                                        orders,
                                                        onStatusUpdate,
                                                        onViewDetails,
                                                        loading,
                                                        emptyMessage = "No orders found"
                                                    }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse border border-secondary-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                                <div className="h-6 bg-secondary-200 rounded w-32"></div>
                                <div className="h-4 bg-secondary-200 rounded w-24"></div>
                            </div>
                            <div className="h-8 bg-secondary-200 rounded w-20"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-secondary-200 rounded w-full"></div>
                            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="h-16 w-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Orders</h3>
                <p className="text-secondary-600">{emptyMessage}</p>
            </div>
        );
    }

    // Separate urgent orders (placed > 15 minutes ago and not yet confirmed)
    const urgentOrders = orders.filter(order => {
        if (order.status !== 'placed') return false;
        const orderTime = new Date(order.createdAt).getTime();
        const now = new Date().getTime();
        const minutesElapsed = (now - orderTime) / (1000 * 60);
        return minutesElapsed > 15;
    });

    const regularOrders = orders.filter(order => !urgentOrders.includes(order));

    return (
        <div className="space-y-6">
            {/* Urgent Orders Section */}
            {urgentOrders.length > 0 && (
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Clock className="h-5 w-5 text-error-600" />
                        <h3 className="text-lg font-semibold text-error-900">
                            Urgent Orders ({urgentOrders.length})
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {urgentOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusUpdate={onStatusUpdate}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Orders Section */}
            {regularOrders.length > 0 && (
                <div>
                    {urgentOrders.length > 0 && (
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Other Orders ({regularOrders.length})
                        </h3>
                    )}
                    <div className="space-y-4">
                        {regularOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusUpdate={onStatusUpdate}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
