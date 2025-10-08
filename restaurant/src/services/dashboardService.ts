import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DashboardStats, Order, Restaurant } from '../types';

export const dashboardService = {
    async getDashboardStats(restaurantId: string): Promise<DashboardStats> {
        try {
            console.log('Fetching dashboard stats for restaurant:', restaurantId);

            // Fetch restaurant details from establishments collection
            const restaurantDoc = await getDoc(doc(db, 'establishments', restaurantId));
            const restaurant = restaurantDoc.exists() ? restaurantDoc.data() as Restaurant : null;

            // Fetch all orders for the restaurant
            const ordersQuery = query(
                collection(db, 'orders'),
                where('restaurantId', '==', restaurantId)
            );
            const ordersSnapshot = await getDocs(ordersQuery);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // Calculate today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);

            // Calculate stats
            const todayRevenue = todayOrders.reduce((sum, order) => sum + order.pricing.total, 0);
            const pendingOrders = orders.filter(order =>
                ['placed', 'confirmed', 'preparing'].includes(order.status)
            ).length;
            const completedOrders = orders.filter(order => order.status === 'delivered').length;
            const averageOrderValue = orders.length > 0 ?
                orders.reduce((sum, order) => sum + order.pricing.total, 0) / orders.length : 0;

            // Fetch menu items count
            const menuItemsQuery = query(
                collection(db, 'menuItems'),
                where('restaurantId', '==', restaurantId)
            );
            const menuItemsSnapshot = await getDocs(menuItemsQuery);
            const totalMenuItems = menuItemsSnapshot.size;

            // Get food ratings from ratings collection
            const ratingsQuery = query(
                collection(db, 'ratings'),
                where('restaurantId', '==', restaurantId)
            );
            const ratingsSnapshot = await getDocs(ratingsQuery);
            const ratings = ratingsSnapshot.docs.map(doc => doc.data());

            const totalReviews = ratings.length;
            const averageRating = totalReviews > 0
                ? ratings.reduce((sum, rating) => sum + (rating.foodRating || 0), 0) / totalReviews
                : 0;

            return {
                todayOrders: todayOrders.length,
                todayRevenue,
                pendingOrders,
                completedOrders,
                averageOrderValue,
                totalMenuItems,
                averageRating,
                totalReviews
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch dashboard stats');
        }
    },

    async getRecentOrders(restaurantId: string): Promise<Order[]> {
        try {
            const q = query(
                collection(db, 'orders'),
                where('restaurantId', '==', restaurantId),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        } catch (error: any) {
            console.error('Recent orders error:', error);
            return [];
        }
    },

    async getChartData(restaurantId: string, timeRange: string) {
        try {
            // Fetch orders for chart data
            const ordersQuery = query(
                collection(db, 'orders'),
                where('restaurantId', '==', restaurantId),
                orderBy('createdAt', 'desc')
            );
            const ordersSnapshot = await getDocs(ordersQuery);
            const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

            // Group orders by date for chart
            const chartData = [];
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });

                const dayOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate.toDateString() === date.toDateString();
                });

                const dayRevenue = dayOrders.reduce((sum, order) => sum + order.pricing.total, 0);

                chartData.push({
                    name: dayName,
                    orders: dayOrders.length,
                    revenue: dayRevenue
                });
            }

            return chartData;
        } catch (error: any) {
            console.error('Chart data error:', error);
            return [];
        }
    }
};
