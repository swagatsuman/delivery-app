import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderHistoryCard } from '../../components/features/profile/OrderHistoryCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchOrders } from '../../store/slices/orderSlice';
import { addToCart, clearCart } from '../../store/slices/cartSlice';
import type { Order } from '../../types';

const OrderHistory: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { orders, loading } = useAppSelector(state => state.order);
    const { user } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchOrders(user.uid));
        }
    }, [dispatch, user]);

    const handleReorder = (order: Order) => {
        // Clear current cart and add all items from the order
        dispatch(clearCart());

        order.items.forEach(item => {
            dispatch(addToCart({
                menuItem: item.menuItem,
                quantity: item.quantity,
                customizations: item.customizations,
                specialInstructions: item.specialInstructions,
                restaurantId: order.restaurantId
            }));
        });

        navigate('/cart');
    };

    const handleRateOrder = (order: Order) => {
        navigate(`/rate-order/${order.id}`);
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-secondary-200 h-32 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4">
                {orders.length === 0 ? (
                    <EmptyState
                        icon="📦"
                        title="No orders yet"
                        description="Your order history will appear here"
                        actionLabel="Start Ordering"
                        onAction={() => navigate('/home')}
                    />
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderHistoryCard
                                key={order.id}
                                order={order}
                                onReorder={handleReorder}
                                onRate={handleRateOrder}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
