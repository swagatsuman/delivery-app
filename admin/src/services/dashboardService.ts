import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DashboardStats } from '../types';
import { USER_ROLES, USER_STATUS } from '../utils/constants';

export const dashboardService = {
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            // Fetch all users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => doc.data());

            // Calculate restaurant stats
            const restaurants = users.filter(user => user.role === USER_ROLES.RESTAURANT);
            const totalRestaurants = restaurants.length;
            const pendingRestaurants = restaurants.filter(r => r.status === USER_STATUS.PENDING).length;
            const activeRestaurants = restaurants.filter(r => r.status === USER_STATUS.ACTIVE).length;

            // Calculate customer stats
            const totalCustomers = users.filter(user => user.role === USER_ROLES.CUSTOMER).length;

            // Calculate delivery agent stats
            const deliveryAgents = users.filter(user => user.role === USER_ROLES.DELIVERY_AGENT);
            const totalDeliveryAgents = deliveryAgents.length;
            const pendingDeliveryAgents = deliveryAgents.filter(d => d.status === USER_STATUS.PENDING).length;

            // TODO: Fetch actual order and revenue data
            // For now, using mock data
            const totalOrders = 0;
            const todayOrders = 0;
            const totalRevenue = 0;
            const todayRevenue = 0;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            return {
                totalRestaurants,
                pendingRestaurants,
                activeRestaurants,
                totalCustomers,
                totalDeliveryAgents,
                pendingDeliveryAgents,
                totalOrders,
                todayOrders,
                totalRevenue,
                todayRevenue,
                averageOrderValue
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch dashboard stats');
        }
    },

    async getRecentActivity() {
        try {
            // Fetch recent user registrations
            const usersQuery = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            const usersSnapshot = await getDocs(usersQuery);
            const recentUsers = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'user_registration'
            }));

            // TODO: Add orders, status changes, etc.

            return recentUsers;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch recent activity');
        }
    },

    async getChartData(timeRange: string) {
        try {
            // TODO: Implement actual chart data fetching based on timeRange
            // For now, returning mock data
            const mockData = [
                { name: 'Jan', orders: 400, revenue: 24000 },
                { name: 'Feb', orders: 300, revenue: 18000 },
                { name: 'Mar', orders: 500, revenue: 30000 },
                { name: 'Apr', orders: 280, revenue: 16800 },
                { name: 'May', orders: 590, revenue: 35400 },
                { name: 'Jun', orders: 320, revenue: 19200 },
            ];

            return mockData;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch chart data');
        }
    }
};
