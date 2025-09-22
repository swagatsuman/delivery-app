import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Order, OrderRating } from '../types';

class OrderService {

    async createOrder(orderData: any): Promise<Order> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const orderDoc = {
                ...orderData,
                userId: user.uid,
                orderNumber: this.generateOrderNumber(),
                status: 'placed',
                paymentStatus: 'pending',
                timeline: [{
                    status: 'placed',
                    timestamp: Timestamp.now(),
                    description: 'Order placed successfully'
                }],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, 'orders'), orderDoc);

            return {
                id: docRef.id,
                ...orderDoc,
                createdAt: orderDoc.createdAt.toDate(),
                updatedAt: orderDoc.updatedAt.toDate(),
                estimatedDeliveryTime: orderData.estimatedDeliveryTime,
                timeline: orderDoc.timeline.map((t: any) => ({
                    ...t,
                    timestamp: t.timestamp.toDate()
                }))
            } as Order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('Failed to create order');
        }
    }

    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const orders: Order[] = [];

            for (const orderDoc of snapshot.docs) {
                const data = orderDoc.data();

                // Get restaurant details
                const restaurantDoc = await getDoc(doc(db, 'restaurants', data.restaurantId));
                const restaurantData = restaurantDoc.data();

                orders.push({
                    id: orderDoc.id,
                    ...data,
                    restaurant: {
                        id: restaurantDoc.id,
                        name: restaurantData?.name || 'Unknown Restaurant',
                        description: restaurantData?.description || '',
                        images: restaurantData?.images || [],
                        cuisineTypes: restaurantData?.cuisineTypes || [],
                        rating: restaurantData?.rating || 0,
                        totalRatings: restaurantData?.totalRatings || 0,
                        deliveryTime: restaurantData?.deliveryTime || '30-40 mins',
                        deliveryFee: restaurantData?.deliveryFee || 30,
                        minimumOrder: restaurantData?.minimumOrder || 0,
                        address: restaurantData?.address || {},
                        isOpen: true,
                        featured: false
                    },
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || []
                } as Order);
            }

            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw new Error('Failed to fetch orders');
        }
    }

    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const data = orderDoc.data();

            // Get restaurant details
            const restaurantDoc = await getDoc(doc(db, 'restaurants', data.restaurantId));
            const restaurantData = restaurantDoc.data();

            return {
                id: orderDoc.id,
                ...data,
                restaurant: {
                    id: restaurantDoc.id,
                    name: restaurantData?.name || 'Unknown Restaurant',
                    description: restaurantData?.description || '',
                    images: restaurantData?.images || [],
                    cuisineTypes: restaurantData?.cuisineTypes || [],
                    rating: restaurantData?.rating || 0,
                    totalRatings: restaurantData?.totalRatings || 0,
                    deliveryTime: restaurantData?.deliveryTime || '30-40 mins',
                    deliveryFee: restaurantData?.deliveryFee || 30,
                    minimumOrder: restaurantData?.minimumOrder || 0,
                    address: restaurantData?.address || {},
                    isOpen: true,
                    featured: false
                },
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                timeline: data.timeline?.map((t: any) => ({
                    ...t,
                    timestamp: t.timestamp?.toDate() || new Date()
                })) || []
            } as Order;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw new Error('Failed to fetch order details');
        }
    }

    async cancelOrder(orderId: string): Promise<void> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'cancelled',
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw new Error('Failed to cancel order');
        }
    }

    async rateOrder(orderId: string, rating: OrderRating): Promise<OrderRating> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const ratingWithTimestamp = {
                ...rating,
                createdAt: Timestamp.now()
            };

            await updateDoc(orderRef, {
                rating: ratingWithTimestamp,
                updatedAt: Timestamp.now()
            });

            return {
                ...rating,
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Error rating order:', error);
            throw new Error('Failed to rate order');
        }
    }

    private generateOrderNumber(): string {
        return 'FE' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
    }
}

export const orderService = new OrderService();
