import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderHistoryCard } from '../../components/features/profile/OrderHistoryCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { addToCart, clearCart } from '../../store/slices/cartSlice';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Order, Restaurant } from '../../types';

const OrderHistory: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Real-time listener for user's orders
    useEffect(() => {
        if (!user?.uid) return;

        console.log('Setting up real-time listener for user orders:', user.uid);
        setLoading(true);

        const ordersQuery = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            ordersQuery,
            async (snapshot) => {
                const ordersData: Order[] = await Promise.all(
                    snapshot.docs.map(async (orderDoc) => {
                        const data = orderDoc.data();

                        // Fetch restaurant details if not in order or if missing name
                        let restaurantData = data.restaurant;
                        if ((!restaurantData || !restaurantData.name) && data.restaurantId) {
                            try {
                                const restaurantDoc = await getDoc(doc(db, 'establishments', data.restaurantId));
                                if (restaurantDoc.exists()) {
                                    const restData = restaurantDoc.data();
                                    restaurantData = {
                                        id: restaurantDoc.id,
                                        name: restData.businessName || restData.name || restData.restaurantName || data.restaurantName || 'Restaurant',
                                        description: restData.description || '',
                                        images: restData.images || [],
                                        cuisineTypes: restData.cuisineTypes || [],
                                        rating: restData.rating || 0,
                                        totalRatings: restData.totalRatings || 0,
                                        deliveryTime: restData.deliveryTime || '30-40 mins',
                                        deliveryFee: restData.deliveryFee || 30,
                                        minimumOrder: restData.minimumOrder || 0,
                                        address: restData.address || {},
                                        isOpen: true,
                                        featured: false
                                    } as Restaurant;
                                }
                            } catch (error) {
                                console.error('Error fetching restaurant for order:', error);
                            }
                        }

                        // If still no restaurant data, use restaurantName from order
                        if (!restaurantData && data.restaurantName) {
                            restaurantData = {
                                id: data.restaurantId || '',
                                name: data.restaurantName,
                                description: '',
                                images: [],
                                cuisineTypes: [],
                                rating: 0,
                                totalRatings: 0,
                                deliveryTime: '30-40 mins',
                                deliveryFee: 0,
                                minimumOrder: 0,
                                address: data.restaurantAddress || {},
                                isOpen: true,
                                featured: false
                            } as Restaurant;
                        }

                        return {
                            id: orderDoc.id,
                            ...data,
                            restaurant: restaurantData,
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                            actualDeliveryTime: data.actualDeliveryTime?.toDate()
                        } as Order;
                    })
                );

                console.log('Received real-time orders update:', ordersData.length);
                setOrders(ordersData);
                setLoading(false);
            },
            (error) => {
                console.error('Error listening to orders:', error);
                setLoading(false);
            }
        );

        return () => {
            console.log('Cleaning up orders listener');
            unsubscribe();
        };
    }, [user?.uid]);

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
