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

            // Fetch real orders data for stats
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate aggregated business stats from actual orders
            const totalRevenue = orders.reduce((sum, order: any) => {
                if (order.status !== 'cancelled') {
                    return sum + (order.pricing?.total || 0);
                }
                return sum;
            }, 0);
            const totalOrders = orders.filter((order: any) => order.status !== 'cancelled').length;
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

            // Today's stats from real orders
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayOrders = orders.filter((order: any) => {
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                return orderDate >= todayStart && order.status !== 'cancelled';
            }).length;

            const todayRevenue = orders.reduce((sum, order: any) => {
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                if (orderDate >= todayStart && order.status !== 'cancelled') {
                    return sum + (order.pricing?.total || 0);
                }
                return sum;
            }, 0);

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
            // Fetch orders from Firestore
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Determine date range based on timeRange parameter
            const now = new Date();
            let startDate = new Date();
            let groupBy: 'day' | 'week' | 'month' = 'day';

            switch (timeRange) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    groupBy = 'day';
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    groupBy = 'day';
                    break;
                case '3m':
                    startDate.setMonth(now.getMonth() - 3);
                    groupBy = 'week';
                    break;
                case '6m':
                    startDate.setMonth(now.getMonth() - 6);
                    groupBy = 'month';
                    break;
                case '1y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    groupBy = 'month';
                    break;
                default:
                    startDate.setDate(now.getDate() - 30);
                    groupBy = 'day';
            }

            // Filter orders by date range
            const filteredOrders = orders.filter((order: any) => {
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                return orderDate >= startDate && order.status !== 'cancelled';
            });

            // Group orders by time period
            const groupedData: Record<string, { orders: number; revenue: number }> = {};

            filteredOrders.forEach((order: any) => {
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                let key: string;

                if (groupBy === 'day') {
                    key = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                } else if (groupBy === 'week') {
                    const weekStart = new Date(orderDate);
                    weekStart.setDate(orderDate.getDate() - orderDate.getDay());
                    key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                } else {
                    key = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }

                if (!groupedData[key]) {
                    groupedData[key] = { orders: 0, revenue: 0 };
                }

                groupedData[key].orders++;
                groupedData[key].revenue += order.pricing?.total || 0;
            });

            // Convert to array format for charts
            const chartData = Object.entries(groupedData).map(([name, data]) => ({
                name,
                orders: data.orders,
                revenue: data.revenue
            }));

            // Sort by date
            return chartData.sort((a, b) => {
                const dateA = new Date(a.name);
                const dateB = new Date(b.name);
                return dateA.getTime() - dateB.getTime();
            });
        } catch (error: any) {
            console.error('Chart data error:', error);
            return [];
        }
    }
};
