import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DashboardStats, EarningsData, Order } from '../types';

export const dashboardService = {
    async getDashboardStats(agentId: string): Promise<DashboardStats> {
        try {
            // Get agent details
            const agentDoc = await getDoc(doc(db, 'deliveryAgents', agentId));
            const agentData = agentDoc.exists() ? agentDoc.data() : {};

            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get today's orders
            const todayOrdersQuery = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                where('updatedAt', '>=', Timestamp.fromDate(today)),
                where('updatedAt', '<', Timestamp.fromDate(tomorrow))
            );

            const todayOrdersSnapshot = await getDocs(todayOrdersQuery);
            const todayOrders = todayOrdersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    deliveryFee: data.deliveryFee || 0,
                    status: data.status
                };
            });

            const todayDeliveries = todayOrders.filter(order => order.status === 'delivered').length;
            const todayEarnings = todayOrders
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + (order.deliveryFee * 0.8), 0); // 80% commission

            // Get pending orders (assigned, picked_up, on_the_way)
            const pendingOrdersQuery = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                where('status', 'in', ['assigned', 'picked_up', 'on_the_way'])
            );

            const pendingOrdersSnapshot = await getDocs(pendingOrdersQuery);
            const pendingOrders = pendingOrdersSnapshot.size;

            // Calculate online hours (mock data - in real app, track actual online time)
            const onlineHours = agentData.workingHours?.isOnline ? 8 : 0;

            return {
                todayDeliveries,
                todayEarnings,
                pendingOrders,
                completedOrders: agentData.completedDeliveries || 0,
                averageRating: agentData.averageRating || 0,
                totalRatings: agentData.totalRatings || 0,
                totalDistance: agentData.totalDistance || 0,
                onlineHours
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return default stats on error
            return {
                todayDeliveries: 0,
                todayEarnings: 0,
                pendingOrders: 0,
                completedOrders: 0,
                averageRating: 0,
                totalRatings: 0,
                totalDistance: 0,
                onlineHours: 0
            };
        }
    },

    async getRecentDeliveries(agentId: string): Promise<Order[]> {
        try {
            const q = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                orderBy('updatedAt', 'desc'),
                limit(10)
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
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || []
                } as Order;
            });
        } catch (error) {
            console.error('Error fetching recent deliveries:', error);
            return [];
        }
    },

    async getEarningsData(agentId: string, timeRange: string): Promise<EarningsData[]> {
        try {
            const endDate = new Date();
            const startDate = new Date();

            // Set date range based on timeRange parameter
            switch (timeRange) {
                case '7d':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(endDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(endDate.getDate() - 90);
                    break;
                default:
                    startDate.setDate(endDate.getDate() - 7);
            }

            // Query delivered orders in the date range
            const q = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                where('status', '==', 'delivered'),
                where('updatedAt', '>=', Timestamp.fromDate(startDate)),
                where('updatedAt', '<=', Timestamp.fromDate(endDate))
            );

            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    deliveryFee: data.deliveryFee || 0,
                    distance: data.distance || 0
                };
            });

            // Group orders by date
            const earningsByDate: { [key: string]: { earnings: number; deliveries: number; distance: number } } = {};

            orders.forEach(order => {
                const dateStr = order.updatedAt.toISOString().split('T')[0];
                if (!earningsByDate[dateStr]) {
                    earningsByDate[dateStr] = { earnings: 0, deliveries: 0, distance: 0 };
                }
                earningsByDate[dateStr].earnings += order.deliveryFee * 0.8; // 80% commission
                earningsByDate[dateStr].deliveries += 1;
                earningsByDate[dateStr].distance += order.distance;
            });

            // Generate complete date range with zero values for missing dates
            const result: EarningsData[] = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const data = earningsByDate[dateStr] || { earnings: 0, deliveries: 0, distance: 0 };

                result.push({
                    date: currentDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                    earnings: Math.round(data.earnings),
                    deliveries: data.deliveries,
                    distance: Math.round(data.distance * 10) / 10 // Round to 1 decimal
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return result;
        } catch (error) {
            console.error('Error fetching earnings data:', error);
            return [];
        }
    },

    async updateAgentLocation(agentId: string, location: { lat: number; lng: number }): Promise<void> {
        try {
            const agentRef = doc(db, 'deliveryAgents', agentId);
            await agentRef.update({
                currentLocation: location,
                lastLocationUpdate: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating agent location:', error);
            throw new Error('Failed to update location');
        }
    }
};
