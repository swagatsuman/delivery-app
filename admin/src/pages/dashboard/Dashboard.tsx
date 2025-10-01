import React, { useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { StatsCards } from '../../components/features/dashboard/StatsCards';
import { Charts } from '../../components/features/dashboard/Charts';
import { RecentActivity } from '../../components/features/dashboard/RecentActivity';
import { QuickActions } from '../../components/features/dashboard/QuickActions';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchDashboardStats, fetchRecentActivity, fetchChartData } from '../../store/slices/dashboardSlice';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stats, recentActivity, chartData, loading } = useAppSelector(state => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchRecentActivity());
        dispatch(fetchChartData('30d'));
    }, [dispatch]);

    return (
        <Layout title="Dashboard">
            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <StatsCards stats={stats} loading={loading} />

                {/* Charts */}
                <Charts data={chartData} loading={loading} />

                {/* Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentActivity activities={recentActivity} loading={loading} />
                    <QuickActions
                        pendingEstablishments={stats?.pendingEstablishments || 0}
                        pendingDeliveryAgents={stats?.pendingDeliveryAgents || 0}
                        establishmentsByType={stats?.establishmentsByType || {}}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
