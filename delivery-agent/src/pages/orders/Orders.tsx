import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import {
    acceptOrder,
    updateOrderStatus,
    setFilters
} from '../../store/slices/orderSlice';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Order, OrderFilters } from '../../types';
import { Search, Filter, RefreshCw, MapPin, Navigation, Package, Clock, IndianRupee, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { filters } = useAppSelector(state => state.orders);

    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('active');
    const [refreshing, setRefreshing] = useState(false);

    // Use refs to track values without causing re-renders
    const previousAvailableCountRef = useRef(0);
    const isInitialLoadRef = useRef(true);
    const previousAssignedCountRef = useRef(0);

    // Check for navigation state to set active tab
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            // Clear the state so it doesn't persist on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    // Real-time location tracking - only when agent has active deliveries
    const hasActiveDeliveries = assignedOrders.length > 0;
    const { isTracking, hasPermission, error: locationError, requestPermission } = useLocationTracking({
        shouldTrack: hasActiveDeliveries,
        updateInterval: 15000, // Update every 15 seconds
        onLocationUpdate: (location) => {
            console.log('Location updated:', location);
        },
        onError: (error) => {
            console.error('Location tracking error:', error);
        }
    });

    // Request location permission when agent accepts first order
    useEffect(() => {
        if (hasActiveDeliveries && hasPermission === null) {
            // Request permission automatically when agent has active deliveries
            requestPermission().then(granted => {
                if (granted) {
                    toast.success('Location tracking enabled for delivery');
                } else {
                    toast.error('Location permission denied. Please enable location access for better service.');
                }
            });
        }
    }, [hasActiveDeliveries, hasPermission]);

    // Real-time listener for available orders
    useEffect(() => {
        if (!user?.uid) {
            setAvailableOrders([]);
            setLoading(false);
            return;
        }

        console.log('Setting up real-time listener for available orders');
        console.log('User isAvailable:', user?.deliveryAgentDetails?.isAvailable);

        // Show all unassigned orders - from placed to ready for pickup
        // Don't use orderBy to avoid needing composite index
        const ordersQuery = query(
            collection(db, 'orders')
        );

        const unsubscribe = onSnapshot(
            ordersQuery,
            {
                next: (snapshot) => {
                    console.log('✅ Firestore snapshot received, total docs:', snapshot.docs.length);

                    const orders: Order[] = snapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            console.log('📦 Order doc:', doc.id.slice(0,8), 'status:', data.status, 'deliveryAgentId:', data.deliveryAgentId || 'null');
                            return {
                                id: doc.id,
                                ...data,
                                createdAt: data.createdAt?.toDate() || new Date(),
                                updatedAt: data.updatedAt?.toDate() || new Date(),
                                estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                                actualDeliveryTime: data.actualDeliveryTime?.toDate()
                            } as Order;
                        })
                        .filter(order => {
                            // Only show orders not assigned to any agent and in specific statuses
                            const isUnassigned = !order.deliveryAgentId;
                            const validStatus = ['placed', 'confirmed', 'preparing', 'ready'].includes(order.status);
                            console.log('🔍 Order', order.id.slice(0,8), 'isUnassigned:', isUnassigned, 'validStatus:', validStatus, 'status:', order.status);
                            return isUnassigned && validStatus;
                        })
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first

                    console.log('✨ Available orders after filtering:', orders.length);

                    // Auto-switch to available tab when new orders arrive (only after initial load)
                    if (!isInitialLoadRef.current && orders.length > previousAvailableCountRef.current && orders.length > 0) {
                        setActiveTab('pending');
                        toast.success(`🔔 ${orders.length} new order${orders.length > 1 ? 's' : ''} available!`, { duration: 5000 });
                    }

                    previousAvailableCountRef.current = orders.length;
                    setAvailableOrders(orders);
                    setLoading(false);
                    isInitialLoadRef.current = false;
                },
                error: (error: any) => {
                    console.error('❌ Error listening to available orders:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);

                    // Check if it's an index error
                    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                        console.error('🔴 FIRESTORE INDEX REQUIRED!');
                        console.error('Create index at:', error.message);
                        toast.error('Database index required. Check console for details.', { duration: 10000 });
                    }

                    setLoading(false);
                    isInitialLoadRef.current = false;
                }
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    // Real-time listener for assigned orders
    useEffect(() => {
        if (!user?.uid) return;

        console.log('Setting up real-time listener for assigned orders');

        const ordersQuery = query(
            collection(db, 'orders'),
            where('deliveryAgentId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(
            ordersQuery,
            (snapshot) => {
                const orders: Order[] = snapshot.docs
                    .map(doc => {
                        const data = doc.data();
                        console.log('📦 Assigned order:', doc.id.slice(0,8), 'status:', data.status, 'deliveryStatus:', data.deliveryStatus);
                        return {
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                            actualDeliveryTime: data.actualDeliveryTime?.toDate()
                        } as Order;
                    })
                    .filter(order => {
                        // Show orders that are assigned but not yet delivered/cancelled
                        const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
                        console.log('🔍 Order', order.id.slice(0,8), 'isActive:', isActive, 'status:', order.status);
                        return isActive;
                    })
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                console.log('✅ Assigned orders update:', orders.length);

                // Auto-switch to active tab when orders are assigned (only after initial load)
                if (!isInitialLoadRef.current && orders.length > 0 && previousAssignedCountRef.current === 0) {
                    setActiveTab('active');
                }

                previousAssignedCountRef.current = orders.length;
                setAssignedOrders(orders);
                setLoading(false);
            },
            (error) => {
                console.error('❌ Error listening to assigned orders:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    // Real-time listener for completed orders
    useEffect(() => {
        if (!user?.uid) return;

        console.log('Setting up real-time listener for completed orders');

        const ordersQuery = query(
            collection(db, 'orders'),
            where('deliveryAgentId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(
            ordersQuery,
            (snapshot) => {
                const orders: Order[] = snapshot.docs
                    .map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                            actualDeliveryTime: data.actualDeliveryTime?.toDate()
                        } as Order;
                    })
                    .filter(order => order.status === 'delivered')
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                console.log('Completed orders update:', orders.length);
                setCompletedOrders(orders);
            },
            (error) => console.error('Error listening to completed orders:', error)
        );

        return () => unsubscribe();
    }, [user?.uid]);

    const handleFiltersChange = (newFilters: Partial<OrderFilters>) => {
        dispatch(setFilters(newFilters));
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status })).unwrap();
            toast.success('Order status updated successfully');
            // Real-time listeners will automatically update the orders
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
            // Switch to active tab after accepting order
            setActiveTab('active');
            // Real-time listeners will automatically update the orders
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept order');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        // Real-time listeners automatically keep data updated
        // Just show feedback to user
        setTimeout(() => {
            setRefreshing(false);
            toast.success('Orders are up to date');
        }, 500);
    };

    const getOrderStats = () => {
        // Pending: available orders not yet accepted
        const pending = availableOrders.length;

        // Active: accepted orders (deliveryStatus = assigned, picked_up, on_the_way)
        const active = assignedOrders.length;

        // History: delivered or cancelled
        const completed = completedOrders.filter(o => o.status === 'delivered').length;
        const cancelled = completedOrders.filter(o => o.status === 'cancelled').length;
        const history = completed + cancelled;

        return { pending, active, history, completed, cancelled, total: assignedOrders.length + completedOrders.length };
    };

    const stats = getOrderStats();

    // Filter orders based on active tab
    const getCurrentOrders = () => {
        if (activeTab === 'pending') {
            // Show available orders (not yet accepted)
            return availableOrders;
        } else if (activeTab === 'active') {
            // Show assigned orders (accepted by agent)
            return assignedOrders;
        } else {
            // Show completed/cancelled orders
            return completedOrders;
        }
    };

    const currentOrders = getCurrentOrders();

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'picked_up':
            case 'on_the_way':
            case 'out_for_delivery':
                return 'warning';
            case 'assigned':
            case 'ready':
            case 'preparing':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatOrderStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface border-b border-secondary-200 px-4 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-secondary-900">My Orders</h1>
                    <div className="flex items-center space-x-2">
                        {/* Location Tracking Indicator */}
                        {isTracking && (
                            <div className="flex items-center space-x-1 bg-success-50 border border-success-200 rounded-lg px-2 py-1">
                                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-success-700">Live</span>
                            </div>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`h-5 w-5 text-secondary-600 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-warning-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-warning-600">{stats.pending}</div>
                        <div className="text-xs text-warning-600">Available</div>
                    </div>
                    <div className="bg-primary-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-primary-600">{stats.active}</div>
                        <div className="text-xs text-primary-600">Active</div>
                    </div>
                    <div className="bg-success-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-success-600">{stats.completed}</div>
                        <div className="text-xs text-success-600">Delivered</div>
                    </div>
                    <div className="bg-secondary-100 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-secondary-900">{stats.total}</div>
                        <div className="text-xs text-secondary-600">Total</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-surface border-b border-secondary-200">
                <div className="flex px-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'pending'
                                ? 'border-warning-500 text-warning-600'
                                : 'border-transparent text-secondary-500'
                        }`}
                    >
                        Available
                        <span className={`ml-1 ${activeTab === 'pending' ? 'text-warning-600' : 'text-secondary-400'}`}>
                            ({stats.pending})
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'active'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-secondary-500'
                        }`}
                    >
                        Active
                        <span className={`ml-1 ${activeTab === 'active' ? 'text-primary-600' : 'text-secondary-400'}`}>
                            ({stats.active})
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'history'
                                ? 'border-success-500 text-success-600'
                                : 'border-transparent text-secondary-500'
                        }`}
                    >
                        History
                        <span className={`ml-1 ${activeTab === 'history' ? 'text-success-600' : 'text-secondary-400'}`}>
                            ({stats.history})
                        </span>
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Orders List */}
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Card key={index} className="animate-pulse">
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : currentOrders.length === 0 ? (
                    <Card className="p-8 text-center">
                        <div className="text-6xl mb-4">
                            {activeTab === 'pending' ? '📦' : activeTab === 'active' ? '🚴' : '✅'}
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            {activeTab === 'pending' && 'No Available Orders'}
                            {activeTab === 'active' && 'No Active Deliveries'}
                            {activeTab === 'history' && 'No Order History'}
                        </h3>
                        <p className="text-secondary-600">
                            {activeTab === 'pending' && 'Available orders will appear here'}
                            {activeTab === 'active' && 'Your accepted orders will appear here'}
                            {activeTab === 'history' && 'Your completed orders will appear here'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {currentOrders.map((order: any) => {
                            const isPending = activeTab === 'pending';
                            const isActive = activeTab === 'active';
                            const isHistory = activeTab === 'history';

                            // For pending (available) orders, show main status; for active/history, show deliveryStatus
                            const displayStatus = isPending ? order.status : (order.deliveryStatus || order.status);
                            const deliveryStatus = order.deliveryStatus || 'assigned';

                            // Get next action for active orders
                            const getNextAction = () => {
                                if (!isActive) return null;
                                // Don't show pickup button until food is ready
                                if (deliveryStatus === 'assigned') {
                                    if (order.status === 'ready') {
                                        return { status: 'picked_up', label: 'Mark as Picked Up' };
                                    }
                                    return null; // Food not ready yet
                                }
                                if (deliveryStatus === 'picked_up') return { status: 'on_the_way', label: 'Start Delivery' };
                                if (deliveryStatus === 'on_the_way') return { status: 'delivered', label: 'Mark as Delivered' };
                                return null;
                            };

                            const nextAction = getNextAction();

                            return (
                                <Card key={order.id} className="overflow-hidden">
                                    <div
                                        className="cursor-pointer hover:bg-secondary-50 transition-colors"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        {/* Order Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <Package className="h-4 w-4 text-primary-600" />
                                                    <span className="font-semibold text-secondary-900">
                                                        Order #{order.orderNumber || order.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-secondary-600">
                                                    {order.items?.length || 0} items
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={getStatusBadgeVariant(displayStatus)}>
                                                    {formatOrderStatus(displayStatus)}
                                                </Badge>
                                                <div className="flex items-center space-x-1 text-success-600 font-bold mt-1">
                                                    <IndianRupee className="h-4 w-4" />
                                                    <span>{order.deliveryFee || 40}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pickup Location */}
                                        <div className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg mb-2">
                                            <MapPin className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-secondary-700">Pickup</p>
                                                <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                                                    {order.restaurant?.name || order.restaurantName || 'Restaurant'}
                                                </p>
                                                <p className="text-xs text-secondary-600 line-clamp-1">
                                                    {order.addresses?.restaurant?.street || order.restaurantAddress?.street || ''}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delivery Location */}
                                        <div className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg mb-3">
                                            <MapPin className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-secondary-700">Drop</p>
                                                <p className="text-sm text-secondary-900 line-clamp-1">
                                                    {order.addresses?.delivery?.street || order.deliveryAddress?.address || 'Customer'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex items-center justify-between text-xs text-secondary-500 mb-3">
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {order.createdAt instanceof Date
                                                        ? order.createdAt.toLocaleTimeString()
                                                        : order.createdAt?.toDate
                                                        ? order.createdAt.toDate().toLocaleTimeString()
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            {order.distance > 0 && (
                                                <div className="flex items-center space-x-1">
                                                    <Navigation className="h-3 w-3" />
                                                    <span>{order.distance.toFixed(1)} km</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isPending && (
                                        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptOrder(order.id);
                                                }}
                                                size="sm"
                                            >
                                                Accept Order
                                            </Button>
                                        </div>
                                    )}

                                    {isActive && (
                                        <div className="px-4 pb-4">
                                            {nextAction ? (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(order.id, nextAction.status);
                                                    }}
                                                    className="w-full"
                                                    size="sm"
                                                >
                                                    {nextAction.label}
                                                </Button>
                                            ) : deliveryStatus === 'assigned' && order.status !== 'ready' ? (
                                                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center">
                                                    <p className="text-xs text-warning-700 font-medium">
                                                        Waiting for restaurant - {formatOrderStatus(order.status)}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
