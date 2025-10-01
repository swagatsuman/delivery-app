import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DashboardStats, EstablishmentType } from '../types';
import { USER_ROLES, USER_STATUS, ESTABLISHMENT_TYPES, ESTABLISHMENT_STATUS } from '../utils/constants';

export const dashboardService = {
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            // Fetch all users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate establishment stats from users collection
            const establishmentUsers = users.filter(user => user.role === USER_ROLES.ESTABLISHMENT);
            const totalEstablishments = establishmentUsers.length;
            const pendingEstablishments = establishmentUsers.filter(r => r.status === USER_STATUS.PENDING).length;
            const approvedEstablishments = establishmentUsers.filter(r => r.status === USER_STATUS.ACTIVE).length;

            // Calculate customer stats
            const totalCustomers = users.filter(user => user.role === USER_ROLES.CUSTOMER).length;

            // Calculate delivery agent stats
            const deliveryAgents = users.filter(user => user.role === USER_ROLES.DELIVERY_AGENT);
            const totalDeliveryAgents = deliveryAgents.length;
            const pendingDeliveryAgents = deliveryAgents.filter(d => d.status === USER_STATUS.PENDING).length;

            // Fetch establishment collection data for business stats
            const establishmentsSnapshot = await getDocs(collection(db, 'establishments'));
            const establishments = establishmentsSnapshot.docs.map(doc => doc.data());

            // Calculate aggregated business stats
            const totalRevenue = establishments.reduce((sum, establishment) => sum + (establishment.revenue || 0), 0);
            const totalOrders = establishments.reduce((sum, establishment) => sum + (establishment.totalOrders || 0), 0);
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Calculate establishments by type
            const establishmentsByType: Record<EstablishmentType, number> = {
                restaurant: 0,
                food_truck: 0,
                grocery_shop: 0,
                bakery: 0,
                cafe: 0,
                cloud_kitchen: 0
            };

            establishments.forEach(establishment => {
                if (establishment.establishmentType && establishmentsByType.hasOwnProperty(establishment.establishmentType)) {
                    establishmentsByType[establishment.establishmentType as EstablishmentType]++;
                }
            });

            // Today's stats (mock data for now - would need timestamps in orders)
            const todayOrders = 0;
            const todayRevenue = 0;

            return {
                totalEstablishments,
                pendingEstablishments,
                approvedEstablishments,
                establishmentsByType,
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

            // Fetch recent establishment registrations with business names
            const establishmentUsersQuery = query(
                collection(db, 'users'),
                where('role', '==', USER_ROLES.ESTABLISHMENT),
                orderBy('createdAt', 'desc'),
                limit(5)
            );

            const establishmentUsersSnapshot = await getDocs(establishmentUsersQuery);
            const recentEstablishmentUsers = establishmentUsersSnapshot.docs.map(doc => doc.data());

            // Get business names from establishments collection
            const establishmentActivities = await Promise.all(
                recentEstablishmentUsers.map(async (user) => {
                    try {
                        const establishmentSnapshot = await getDocs(
                            query(collection(db, 'establishments'), where('ownerId', '==', user.uid))
                        );
                        const establishment = establishmentSnapshot.docs[0]?.data();
                        return {
                            ...user,
                            type: 'establishment_registration',
                            businessName: establishment?.businessName || 'Unknown Business',
                            establishmentType: establishment?.establishmentType || 'unknown'
                        };
                    } catch (error) {
                        return {
                            ...user,
                            type: 'establishment_registration',
                            businessName: 'Unknown Business',
                            establishmentType: 'unknown'
                        };
                    }
                })
            );

            // Combine and sort all activities
            const allActivities = [...recentUsers, ...establishmentActivities]
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
