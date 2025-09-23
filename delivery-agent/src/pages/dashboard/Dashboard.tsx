import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
// import { StatsCards } from '../../components/features/dashboard/StatsCards';
// import { EarningsChart } from '../../components/features/dashboard/EarningsChart';
// import { AvailableOrders } from '../../components/features/dashboard/AvailableOrders';
import { RecentDeliveries } from '../../components/features/dashboard/RecentDeliveries';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchDashboardStats,
    fetchRecentDeliveries,
    fetchEarningsData
} from '../../store/slices/dashboardSlice';
import {
    fetchAvailableOrders,
    acceptOrder,
    updateOrderStatus
} from '../../store/slices/orderSlice';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const { stats, recentOrders, earnings, loading } = useAppSelector(state => state.dashboard);
    const { availableOrders } = useAppSelector(state => state.orders);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(location);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Use default location for demo
                    setCurrentLocation({ lat: 12.9716, lng: 77.5946 });
                }
            );
        }
    }, []);

    useEffect(() => {
        if (user?.uid && currentLocation) {
            dispatch(fetchDashboardStats(user.uid));
            dispatch(fetchRecentDeliveries(user.uid));
            dispatch(fetchEarningsData({ agentId: user.uid, timeRange: '7d' }));
            dispatch(fetchAvailableOrders(currentLocation));
        }
    }, [dispatch, user, currentLocation]);

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await dispatch(acceptOrder({ orderId, agentId: user!.uid })).unwrap();
            toast.success('Order accepted successfully');
            // Refresh available orders
            if (currentLocation) {
                dispatch(fetchAvailableOrders(currentLocation));
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept order');
        }
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status })).unwrap();
            toast.success('Order status updated successfully');
            // Refresh data
            if (user?.uid) {
                dispatch(fetchRecentDeliveries(user.uid));
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
                        Welcome back, {user?.name}!
                    </h2>
                    <p className="text-primary-100">
                        {user?.deliveryAgentDetails?.isAvailable
                            ? "You're online and ready to deliver!"
                            : "You're offline. Go online to start receiving orders."
                        }
                    </p>
                </div>

                {/* Stats Cards */}
                {/*<StatsCards stats={stats} loading={loading} />*/}

                {/* Earnings Chart */}
                {/*<EarningsChart data={earnings} loading={loading} />*/}

                {/* Available Orders & Recent Deliveries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/*<AvailableOrders
                        orders={availableOrders}
                        onAcceptOrder={handleAcceptOrder}
                        loading={loading}
                    />*/}
                    <RecentDeliveries
                        orders={recentOrders}
                        onStatusUpdate={handleStatusUpdate}
                        loading={loading}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
