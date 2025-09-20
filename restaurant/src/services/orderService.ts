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
            let q = query(
                collection(db, 'orders'),
                where('restaurantId', '==', restaurantId),
                orderBy('createdAt', 'desc')
            );

            if (filters?.status && filters.status !== 'all') {
                q = query(
                    collection(db, 'orders'),
                    where('restaurantId', '==', restaurantId),
                    where('status', '==', filters.status),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

            // Apply client-side filters
            if (filters?.search) {
                const searchTerm = filters.search.toLowerCase();
                orders = orders.filter(order =>
                    order.orderNumber.toLowerCase().includes(searchTerm) ||
                    order.customerName.toLowerCase().includes(searchTerm) ||
                    order.items.some(item => item.name.toLowerCase().includes(searchTerm))
                );
            }

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

                orders = orders.filter(order => new Date(order.createdAt) >= startDate);
            }

            return orders;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch orders');
        }
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
        const q = query(
            collection(db, 'orders'),
            where('restaurantId', '==', restaurantId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            callback(orders);
        });
    }
};
