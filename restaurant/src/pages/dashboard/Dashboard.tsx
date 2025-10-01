import React, { useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { StatsCards } from '../../components/features/dashboard/StatsCards';
import { Charts } from '../../components/features/dashboard/Charts';
import { RecentOrders } from '../../components/features/dashboard/RecentOrders';
import { QuickActions } from '../../components/features/dashboard/QuickActions';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchDashboardStats,
    fetchRecentOrders,
    fetchChartData
} from '../../store/slices/dashboardSlice';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { stats, recentOrders, chartData, loading } = useAppSelector(state => state.dashboard);

    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchDashboardStats(user.uid));
            dispatch(fetchRecentOrders(user.uid));
            dispatch(fetchChartData({ restaurantId: user.uid, timeRange: '7d' }));
        }
    }, [dispatch, user]);

    const handleOrderStatusUpdate = async (orderId: string, status: string) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status })).unwrap();
            toast.success('Order status updated successfully');
            // Refresh recent orders
            if (user?.uid) {
                dispatch(fetchRecentOrders(user.uid));
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update order status');
        }
    };

    return (
        <Layout title="Dashboard">
            <div className="p-6 space-y-6">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.establishmentDetails?.businessName}!
                    </h2>
                    <p className="text-primary-100">
                        Here's what's happening with your restaurant today.
                    </p>
                </div>

                {/* Stats Cards */}
                <StatsCards stats={stats} loading={loading} />

                {/* Charts */}
                <Charts data={chartData} loading={loading} />

                {/* Recent Orders & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentOrders
                        orders={recentOrders}
                        loading={loading}
                        onStatusUpdate={handleOrderStatusUpdate}
                    />
                    <QuickActions
                        pendingOrders={stats?.pendingOrders || 0}
                        totalMenuItems={stats?.totalMenuItems || 0}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
