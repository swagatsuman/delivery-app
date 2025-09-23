import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderList } from '../../components/features/orders/OrderList';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchAssignedOrders,
    fetchCompletedOrders,
    updateOrderStatus,
    setFilters
} from '../../store/slices/orderSlice';
import type { Order, OrderFilters } from '../../types';
import { Search, Filter, RefreshCw, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { assignedOrders, completedOrders, loading, filters } = useAppSelector(state => state.orders);

    const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchAssignedOrders(user.uid));
            dispatch(fetchCompletedOrders({ agentId: user.uid, filters }));
        }
    }, [dispatch, user, filters]);

    const handleFiltersChange = (newFilters: Partial<OrderFilters>) => {
        dispatch(setFilters(newFilters));
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status })).unwrap();
            toast.success('Order status updated successfully');

            // Refresh orders
            if (user?.uid) {
                dispatch(fetchAssignedOrders(user.uid));
                dispatch(fetchCompletedOrders({ agentId: user.uid, filters }));
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update order status');
        }
    };

    const handleViewDetails = (order: Order) => {
        navigate(`/orders/${order.id}`);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (user?.uid) {
                await Promise.all([
                    dispatch(fetchAssignedOrders(user.uid)).unwrap(),
                    dispatch(fetchCompletedOrders({ agentId: user.uid, filters })).unwrap()
                ]);
            }
        } catch (error) {
            // Error handled by global error handler
        } finally {
            setRefreshing(false);
        }
    };

    const getOrderStats = () => {
        const assigned = assignedOrders.length;
        const completed = completedOrders.filter(o => o.status === 'delivered').length;
        const cancelled = completedOrders.filter(o => o.status === 'cancelled').length;

        return { assigned, completed, cancelled, total: assigned + completedOrders.length };
    };

    const stats = getOrderStats();
    const currentOrders = activeTab === 'assigned' ? assignedOrders : completedOrders;

    return (
        <Layout
            title="My Orders"
            actions={
                <div className="flex space-x-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRefresh}
                        loading={refreshing}
                        icon={<RefreshCw className="h-4 w-4" />}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<MapPin className="h-4 w-4" />}
                    >
                        Track Location
                    </Button>
                </div>
            }
        >
            <div className="p-6 space-y-6">
                {/* Order Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Assigned</p>
                                <p className="text-2xl font-bold text-warning-600">{stats.assigned}</p>
                            </div>
                            <div className="p-3 bg-warning-100 rounded-lg">
                                <div className="h-6 w-6 bg-warning-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Completed</p>
                                <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
                            </div>
                            <div className="p-3 bg-success-100 rounded-lg">
                                <div className="h-6 w-6 bg-success-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Cancelled</p>
                                <p className="text-2xl font-bold text-error-600">{stats.cancelled}</p>
                            </div>
                            <div className="p-3 bg-error-100 rounded-lg">
                                <div className="h-6 w-6 bg-error-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <div className="h-6 w-6 bg-blue-600 rounded"></div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <Card padding="none">
                    <div className="border-b border-secondary-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('assigned')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'assigned'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                                }`}
                            >
                                Assigned Orders ({stats.assigned})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'completed'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                                }`}
                            >
                                Completed Orders ({completedOrders.length})
                            </button>
                        </nav>
                    </div>

                    {/* Filters (only for completed orders) */}
                    {activeTab === 'completed' && (
                        <div className="p-6 border-b border-secondary-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-secondary-900 flex items-center">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        className="input-field pl-10"
                                        value={filters.search || ''}
                                        onChange={(e) => handleFiltersChange({ search: e.target.value })}
                                    />
                                </div>

                                <select
                                    className="input-field"
                                    value={filters.status}
                                    onChange={(e) => handleFiltersChange({ status: e.target.value as any })}
                                >
                                    <option value="all">All Status</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <select
                                    className="input-field"
                                    value={filters.dateRange}
                                    onChange={(e) => handleFiltersChange({ dateRange: e.target.value as any })}
                                >
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    <div className="p-6">
                        <OrderList
                            orders={currentOrders}
                            onStatusUpdate={handleStatusUpdate}
                            onViewDetails={handleViewDetails}
                            loading={loading}
                            emptyMessage={
                                activeTab === 'assigned'
                                    ? "No orders assigned. Go online to receive new orders!"
                                    : "No completed orders yet"
                            }
                            showActions={activeTab === 'assigned'}
                        />
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Orders;
