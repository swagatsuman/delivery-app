import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OrderList } from '../../components/features/orders/OrderList';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchAvailableOrders,
    fetchAssignedOrders,
    fetchCompletedOrders,
    acceptOrder,
    updateOrderStatus,
    setFilters
} from '../../store/slices/orderSlice';
import type { Order, OrderFilters } from '../../types';
import { Search, Filter, RefreshCw, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { availableOrders, assignedOrders, completedOrders, loading, filters } = useAppSelector(state => state.orders);

    const [activeTab, setActiveTab] = useState<'available' | 'assigned' | 'completed'>('available');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        // Get current location and update it
        const updateCurrentLocation = () => {
            if (navigator.geolocation && user?.uid) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const currentLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        console.log('Current location obtained:', currentLocation);

                        // Update location in database
                        try {
                            const { authService } = await import('../../services/authService');
                            await authService.updateLocation(currentLocation);
                            console.log('Location updated in database');
                        } catch (error) {
                            console.error('Failed to update location:', error);
                        }

                        // Fetch available orders with current location
                        if (user?.deliveryAgentDetails?.isAvailable) {
                            dispatch(fetchAvailableOrders(currentLocation));
                        }
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        // Fallback to stored location if available
                        if (user?.deliveryAgentDetails?.currentLocation) {
                            if (user?.deliveryAgentDetails?.isAvailable) {
                                dispatch(fetchAvailableOrders(user.deliveryAgentDetails.currentLocation));
                            }
                        }
                    }
                );
            }
        };

        if (user?.uid) {
            updateCurrentLocation();
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

    const handleAcceptOrder = async (orderId: string) => {
        if (!user?.uid) return;

        // Check if agent already has an active order
        if (assignedOrders.length > 0) {
            toast.error('You already have an active order. Complete it before accepting a new one.');
            return;
        }

        try {
            await dispatch(acceptOrder({ orderId, agentId: user.uid })).unwrap();
            toast.success('Order accepted successfully!');

            // Refresh orders
            if (user.deliveryAgentDetails?.currentLocation) {
                dispatch(fetchAvailableOrders(user.deliveryAgentDetails.currentLocation));
            }
            dispatch(fetchAssignedOrders(user.uid));
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept order');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (user?.uid && user?.deliveryAgentDetails?.currentLocation) {
                const promises = [
                    dispatch(fetchAssignedOrders(user.uid)).unwrap(),
                    dispatch(fetchCompletedOrders({ agentId: user.uid, filters })).unwrap()
                ];

                if (user.deliveryAgentDetails.isAvailable) {
                    promises.push(dispatch(fetchAvailableOrders(user.deliveryAgentDetails.currentLocation)).unwrap());
                }

                await Promise.all(promises);
                toast.success('Orders refreshed');
            }
        } catch (error) {
            // Error handled by global error handler
        } finally {
            setRefreshing(false);
        }
    };

    const getOrderStats = () => {
        const available = availableOrders.length;
        const assigned = assignedOrders.length;
        const completed = completedOrders.filter(o => o.status === 'delivered').length;
        const cancelled = completedOrders.filter(o => o.status === 'cancelled').length;

        return { available, assigned, completed, cancelled, total: assigned + completedOrders.length };
    };

    const stats = getOrderStats();
    const currentOrders = activeTab === 'available' ? availableOrders : activeTab === 'assigned' ? assignedOrders : completedOrders;

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
                                <p className="text-sm font-medium text-secondary-600">Available</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Navigation className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

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
                                onClick={() => setActiveTab('available')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'available'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                                }`}
                            >
                                Available Orders ({stats.available})
                            </button>
                            <button
                                onClick={() => setActiveTab('assigned')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'assigned'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                                }`}
                            >
                                My Orders ({stats.assigned})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'completed'
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-secondary-500 hover:text-secondary-700'
                                }`}
                            >
                                History ({completedOrders.length})
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
                            onAcceptOrder={activeTab === 'available' ? handleAcceptOrder : undefined}
                            onViewDetails={handleViewDetails}
                            loading={loading}
                            emptyMessage={
                                activeTab === 'available'
                                    ? user?.deliveryAgentDetails?.isAvailable
                                        ? "No orders available nearby. Check back soon!"
                                        : "Go online to see available orders"
                                    : activeTab === 'assigned'
                                    ? "No active orders"
                                    : "No completed orders yet"
                            }
                            showActions={activeTab === 'assigned'}
                            showAcceptButton={activeTab === 'available'}
                        />
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Orders;
