import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderList } from '../../components/features/orders/OrderList';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchOrders,
    updateOrderStatus,
    setFilters,
} from '../../store/slices/orderSlice';
import type { Order, OrderFilters } from '../../types';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orders, loading, filters } = useAppSelector(state => state.orders);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchOrders({ restaurantId: user.uid, filters }))
                .unwrap()
                .catch((error) => {
                    console.error('Failed to fetch orders:', error);
                    // Only show toast for real errors, not missing collections/indexes
                    if (!error.message?.includes('index') && !error.message?.includes('collection')) {
                        toast.error('Failed to load orders');
                    }
                });
        }
    }, [dispatch, user, filters]);

    const handleFiltersChange = (newFilters: Partial<OrderFilters>) => {
        dispatch(setFilters(newFilters));
    };

    const handleResetFilters = () => {
        dispatch(setFilters({
            status: 'all',
            dateRange: 'today',
            search: ''
        }));
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status })).unwrap();
            toast.success('Order status updated successfully');
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
                await dispatch(fetchOrders({ restaurantId: user.uid, filters })).unwrap();
            }
        } catch (error) {
            // Error handled by global error handler
        } finally {
            setRefreshing(false);
        }
    };

    const getFilteredOrders = () => {
        return orders.filter(order => {
            // Apply client-side filters that aren't handled by the service
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                if (!order.orderNumber.toLowerCase().includes(searchTerm) &&
                    !order.customerName.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            return true;
        });
    };

    const getOrderStats = () => {
        const filteredOrders = getFilteredOrders();
        return {
            total: filteredOrders.length,
            pending: filteredOrders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length,
            ready: filteredOrders.filter(o => o.status === 'ready').length,
            completed: filteredOrders.filter(o => o.status === 'delivered').length
        };
    };

    const stats = getOrderStats();
    const filteredOrders = getFilteredOrders();

    return (
        <Layout
            title="Orders Management"
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
                        icon={<Download className="h-4 w-4" />}
                    >
                        Export
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
                                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <div className="h-6 w-6 bg-blue-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Pending</p>
                                <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-warning-100 rounded-lg">
                                <div className="h-6 w-6 bg-warning-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Ready</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.ready}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <div className="h-6 w-6 bg-purple-600 rounded"></div>
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
                </div>

                {/* Filters */}
                <Card padding="md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-secondary-900 flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </h3>
                        <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                            Reset
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="input-field pl-10"
                                value={filters.search}
                                onChange={(e) => handleFiltersChange({ search: e.target.value })}
                            />
                        </div>

                        <select
                            className="input-field"
                            value={filters.status}
                            onChange={(e) => handleFiltersChange({ status: e.target.value as any })}
                        >
                            <option value="all">All Status</option>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="on_the_way">On The Way</option>
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

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">
                                Showing {filteredOrders.length} orders
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Orders List */}
                <Card padding="md">
                    <OrderList
                        orders={filteredOrders}
                        onStatusUpdate={handleStatusUpdate}
                        onViewDetails={handleViewDetails}
                        loading={loading}
                        emptyMessage={
                            filters.status === 'all'
                                ? "No orders found for the selected date range"
                                : `No ${filters.status} orders found`
                        }
                    />
                </Card>
            </div>
        </Layout>
    );
};

export default Orders;
