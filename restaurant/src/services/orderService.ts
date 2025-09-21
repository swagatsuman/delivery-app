import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    getDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, OrderFilters } from '../types';

export const orderService = {
    async getOrders(restaurantId: string, filters?: OrderFilters): Promise<Order[]> {
        try {
            let q;

            if (filters?.status && filters.status !== 'all') {
                // Try compound index query first (restaurantId + status + createdAt)
                try {
                    q = query(
                collection(db, 'orders'),
                where('restaurantId', '==', restaurantId),
                        where('status', '==', filters.status),
                orderBy('createdAt', 'desc')
            );

                    const snapshot = await getDocs(q);
                    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                    return this.applyClientSideFilters(orders, filters);
                } catch (indexError: any) {
                    console.warn('Compound index not found for orders with status, trying simple query:', indexError.message);

                    // Fallback to simple query without orderBy
                    q = query(
                        collection(db, 'orders'),
                        where('restaurantId', '==', restaurantId),
                        where('status', '==', filters.status)
                    );
                }
            } else {
                // Try single field index query first (restaurantId + createdAt)
                try {
                q = query(
                    collection(db, 'orders'),
                    where('restaurantId', '==', restaurantId),
                    orderBy('createdAt', 'desc')
                );

            const snapshot = await getDocs(q);
            let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                    return this.applyClientSideFilters(orders, filters);
                } catch (indexError: any) {
                    console.warn('Index not found for orders, trying simple query:', indexError.message);

                    // Fallback to simple query without orderBy
                    q = query(
                        collection(db, 'orders'),
                        where('restaurantId', '==', restaurantId)
                    );
                }
            }

            const snapshot = await getDocs(q);
            let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

            // Sort client-side when orderBy is not available
            orders = orders.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            return this.applyClientSideFilters(orders, filters);

        } catch (error: any) {
            console.error('Error fetching orders:', error);
            // Return empty array for missing collection instead of throwing
            if (error.message?.includes('collection') || error.message?.includes('index')) {
                return [];
            }
            throw new Error(error.message || 'Failed to fetch orders');
        }
    },

    // Helper method to apply client-side filters
    applyClientSideFilters(orders: Order[], filters?: OrderFilters): Order[] {
        let filteredOrders = [...orders];

        // Apply search filter
            if (filters?.search) {
                const searchTerm = filters.search.toLowerCase();
            filteredOrders = filteredOrders.filter(order =>
                    order.orderNumber.toLowerCase().includes(searchTerm) ||
                    order.customerName.toLowerCase().includes(searchTerm) ||
                    order.items.some(item => item.name.toLowerCase().includes(searchTerm))
                );
            }

        // Apply date range filter
            if (filters?.dateRange && filters.dateRange !== 'all') {
                const now = new Date();
                const startDate = new Date();

                switch (filters.dateRange) {
                    case 'today':
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'week':
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                }

            filteredOrders = filteredOrders.filter(order => {
                const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
                return orderDate >= startDate;
            });
            }

        return filteredOrders;
    },

    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));
            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            return { id: orderDoc.id, ...orderDoc.data() } as Order;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch order details');
        }
    },

    async updateOrderStatus(orderId: string, status: string, note?: string): Promise<void> {
        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));
            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data() as Order;
            const newTimeline = [
                ...orderData.timeline,
                {
                    status: status as any,
                    timestamp: new Date(),
                    note: note || `Status updated to ${status}`
                }
            ];

            await updateDoc(doc(db, 'orders', orderId), {
                status,
                timeline: newTimeline,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update order status');
        }
    },

    subscribeToOrders(restaurantId: string, callback: (orders: Order[]) => void) {
        // Try with compound index first
        try {
        const q = query(
            collection(db, 'orders'),
            where('restaurantId', '==', restaurantId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            callback(orders);
            }, (error) => {
                console.warn('Real-time subscription failed with index, trying simple query:', error.message);

                // Fallback to simple query
                const simpleQ = query(
                    collection(db, 'orders'),
                    where('restaurantId', '==', restaurantId),
                    limit(50)
                );

                return onSnapshot(simpleQ, (snapshot) => {
                    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                    // Sort client-side
                    const sortedOrders = orders.sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                        return dateB.getTime() - dateA.getTime();
                    });
                    callback(sortedOrders);
                }, (fallbackError) => {
                    console.error('Real-time subscription failed completely:', fallbackError);
                    callback([]);
                });
        });
        } catch (error) {
            console.error('Failed to setup real-time subscription:', error);
            // Return a dummy unsubscribe function
            return () => {};
        }
    }
};
