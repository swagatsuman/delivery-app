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
    onSnapshot,
    Timestamp,
    addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, OrderFilters } from '../types';

export const orderService = {
    async getAvailableOrders(agentLocation: { lat: number; lng: number }, maxDistance: number = 10): Promise<Order[]> {
        try {
            // Get orders that are ready for pickup and not assigned
            const q = query(
                collection(db, 'orders'),
                where('status', '==', 'ready'),
                where('deliveryAgentId', '==', null),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || []
                } as Order;
            });

            // Filter by distance (in real app, use geospatial queries)
            return orders.filter(order => {
                const distance = this.calculateDistance(
                    agentLocation,
                    order.addresses.restaurant.coordinates
                );
                return distance <= maxDistance;
            });
        } catch (error: any) {
            console.error('Error fetching available orders:', error);
            return [];
        }
    },

    async getAssignedOrders(agentId: string): Promise<Order[]> {
        try {
            const q = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                where('status', 'in', ['assigned', 'picked_up', 'on_the_way']),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || []
                } as Order;
            });
        } catch (error: any) {
            console.error('Error fetching assigned orders:', error);
            return [];
        }
    },

    async getCompletedOrders(agentId: string, filters?: OrderFilters): Promise<Order[]> {
        try {
            let q = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                where('status', 'in', ['delivered', 'cancelled']),
                orderBy('updatedAt', 'desc'),
                limit(50)
            );

            const snapshot = await getDocs(q);
            let orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || []
                } as Order;
            });

            // Apply client-side filters
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

                orders = orders.filter(order => order.updatedAt >= startDate);
            }

            return orders;
        } catch (error: any) {
            console.error('Error fetching completed orders:', error);
            return [];
        }
    },

    async acceptOrder(orderId: string, agentId: string): Promise<void> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data() as Order;

            // Check if order is still available
            if (orderData.deliveryAgentId || orderData.status !== 'ready') {
                throw new Error('Order is no longer available');
            }

            const newTimeline = [
                ...(orderData.timeline || []),
                {
                    status: 'assigned' as const,
                    timestamp: new Date(),
                    note: 'Order assigned to delivery agent'
                }
            ];

            await updateDoc(orderRef, {
                deliveryAgentId: agentId,
                status: 'assigned',
                timeline: newTimeline,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to accept order');
        }
    },

    async updateOrderStatus(orderId: string, status: string, note?: string, location?: { lat: number; lng: number }): Promise<void> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data() as Order;
            const newTimeline = [
                ...(orderData.timeline || []),
                {
                    status: status as any,
                    timestamp: new Date(),
                    note: note || `Status updated to ${status}`,
                    location: location
                }
            ];

            const updateData: any = {
                status,
                timeline: newTimeline,
                updatedAt: new Date()
            };

            if (status === 'delivered') {
                updateData.actualDeliveryTime = new Date();
            }

            await updateDoc(orderRef, updateData);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update order status');
        }
    },

    calculateDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(pos2.lat - pos1.lat);
        const dLng = this.deg2rad(pos2.lng - pos1.lng);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(pos1.lat)) * Math.cos(this.deg2rad(pos2.lat)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in km
        return d;
    },

    deg2rad(deg: number): number {
        return deg * (Math.PI/180);
    },

    subscribeToAvailableOrders(agentLocation: { lat: number; lng: number }, callback: (orders: Order[]) => void) {
        const q = query(
            collection(db, 'orders'),
            where('status', '==', 'ready'),
            where('deliveryAgentId', '==', null),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || []
                } as Order;
            });

            // Filter by distance
            const nearbyOrders = orders.filter(order => {
                const distance = this.calculateDistance(
                    agentLocation,
                    order.addresses.restaurant.coordinates
                );
                return distance <= 10; // 10km radius
            });

            callback(nearbyOrders);
        });
    }
};
