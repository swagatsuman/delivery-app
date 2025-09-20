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
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate restaurant stats from users collection
            const restaurantUsers = users.filter(user => user.role === USER_ROLES.RESTAURANT);
            const totalRestaurants = restaurantUsers.length;
            const pendingRestaurants = restaurantUsers.filter(r => r.status === USER_STATUS.PENDING).length;
            const activeRestaurants = restaurantUsers.filter(r => r.status === USER_STATUS.ACTIVE).length;

            // Calculate customer stats
            const totalCustomers = users.filter(user => user.role === USER_ROLES.CUSTOMER).length;

            // Calculate delivery agent stats
            const deliveryAgents = users.filter(user => user.role === USER_ROLES.DELIVERY_AGENT);
            const totalDeliveryAgents = deliveryAgents.length;
            const pendingDeliveryAgents = deliveryAgents.filter(d => d.status === USER_STATUS.PENDING).length;

            // Fetch restaurant collection data for business stats
            const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
            const restaurants = restaurantsSnapshot.docs.map(doc => doc.data());

            // Calculate aggregated business stats
            const totalRevenue = restaurants.reduce((sum, restaurant) => sum + (restaurant.revenue || 0), 0);
            const totalOrders = restaurants.reduce((sum, restaurant) => sum + (restaurant.totalOrders || 0), 0);
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Today's stats (mock data for now - would need timestamps in orders)
            const todayOrders = 0;
            const todayRevenue = 0;

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

            // Fetch recent restaurant registrations with business names
            const restaurantUsersQuery = query(
                collection(db, 'users'),
                where('role', '==', USER_ROLES.RESTAURANT),
                orderBy('createdAt', 'desc'),
                limit(5)
            );

            const restaurantUsersSnapshot = await getDocs(restaurantUsersQuery);
            const recentRestaurantUsers = restaurantUsersSnapshot.docs.map(doc => doc.data());

            // Get business names from restaurants collection
            const restaurantActivities = await Promise.all(
                recentRestaurantUsers.map(async (user) => {
                    try {
                        const restaurantSnapshot = await getDocs(
                            query(collection(db, 'restaurants'), where('ownerId', '==', user.uid))
                        );
                        const restaurant = restaurantSnapshot.docs[0]?.data();
                        return {
                            ...user,
                            type: 'restaurant_registration',
                            businessName: restaurant?.businessName || 'Unknown Business'
                        };
                    } catch (error) {
                        return {
                            ...user,
                            type: 'restaurant_registration',
                            businessName: 'Unknown Business'
                        };
                    }
                })
            );

            // Combine and sort all activities
            const allActivities = [...recentUsers, ...restaurantActivities]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10);

            return allActivities;
        } catch (error: any) {
            console.error('Recent activity error:', error);
            return [];
        }
    },

    async getChartData(timeRange: string) {
        try {
            // Fetch orders for chart data (when orders collection is implemented)
            // For now, returning mock data that can be replaced with real data later
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
            console.error('Chart data error:', error);
            return [];
        }
    }
};
