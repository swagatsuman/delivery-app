import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchAvailableOrders,
    acceptOrder
} from '../../store/slices/orderSlice';
import { MapPin, Clock, Package, IndianRupee, Navigation } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Toggle';
import { updateAgentAvailability } from '../../store/slices/authSlice';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Order } from '../../types';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isAvailable, setIsAvailable] = useState(user?.deliveryAgentDetails?.isAvailable || false);
    const previousOrderCountRef = useRef(0);

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

    // Real-time listener for available orders
    useEffect(() => {
        if (!isAvailable) {
            setAvailableOrders([]);
            setLoading(false);
            return;
        }

        console.log('🏠 Setting up real-time listener for available orders on home page');
        setLoading(true);

        // Listen to ALL orders and filter on client side
        const ordersQuery = collection(db, 'orders');

        const unsubscribe = onSnapshot(
            ordersQuery,
            {
                next: (snapshot) => {
                    console.log('🏠 Firestore snapshot received, total docs:', snapshot.docs.length);

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
                        .filter(order => {
                            // Only show orders not assigned to any agent and in specific statuses
                            const isUnassigned = !order.deliveryAgentId;
                            const validStatus = ['placed', 'confirmed', 'preparing', 'ready'].includes(order.status);
                            return isUnassigned && validStatus;
                        })
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first

                    console.log('🏠 Available orders after filtering:', orders.length);

                    // Show notification when new orders arrive
                    if (orders.length > previousOrderCountRef.current && previousOrderCountRef.current > 0) {
                        const newOrdersCount = orders.length - previousOrderCountRef.current;
                        toast.success(`🔔 ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} available!`, {
                            duration: 5000,
                            icon: '📦'
                        });
                    }

                    previousOrderCountRef.current = orders.length;
                    setAvailableOrders(orders);
                    setLoading(false);
                },
                error: (error: any) => {
                    console.error('❌ Error listening to available orders:', error);
                    toast.error('Failed to load available orders');
                    setLoading(false);
                }
            }
        );

        return () => {
            console.log('🏠 Cleaning up available orders listener');
            unsubscribe();
        };
    }, [isAvailable]);

    const handleToggleAvailability = async (available: boolean) => {
        try {
            await dispatch(updateAgentAvailability(available)).unwrap();
            setIsAvailable(available);
            toast.success(available ? 'You are now online' : 'You are now offline');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update availability');
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await dispatch(acceptOrder({ orderId, agentId: user!.uid })).unwrap();
            toast.success('Order accepted successfully');
            // Navigate to orders page and switch to active tab
            navigate('/orders', { state: { activeTab: 'active' } });
        } catch (error: any) {
            toast.error(error.message || 'Failed to accept order');
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary-500 text-white px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Hello, {user?.name}!</h1>
                        <p className="text-primary-100 text-sm mt-1">
                            {isAvailable ? 'Ready to deliver' : 'Currently offline'}
                        </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <Toggle
                            checked={isAvailable}
                            onChange={handleToggleAvailability}
                            size="lg"
                        />
                        <span className="text-xs text-white font-semibold">
                            {isAvailable ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{user?.deliveryAgentDetails?.totalDeliveries || 0}</div>
                        <div className="text-xs text-primary-100">Deliveries</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">₹{user?.deliveryAgentDetails?.earnings?.toFixed(0) || 0}</div>
                        <div className="text-xs text-primary-100">Earnings</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{user?.deliveryAgentDetails?.rating?.toFixed(1) || '0.0'}</div>
                        <div className="text-xs text-primary-100">Rating</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{user?.deliveryAgentDetails?.totalRatings || 0}</div>
                        <div className="text-xs text-primary-100">Reviews</div>
                    </div>
                </div>
            </div>

            {/* Available Orders */}
            <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-secondary-900">
                        Available Orders
                    </h2>
                    <div className="flex items-center space-x-2">
                        {isAvailable && !loading && (
                            <div className="flex items-center space-x-1 bg-success-50 border border-success-200 rounded-lg px-2 py-1">
                                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-success-700">Live</span>
                            </div>
                        )}
                        <Badge variant={isAvailable ? 'success' : 'secondary'}>
                            {availableOrders.length} orders
                        </Badge>
                    </div>
                </div>

                {!isAvailable ? (
                    <Card className="text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            You're Offline
                        </h3>
                        <p className="text-secondary-600 mb-4">
                            Go online to start receiving delivery orders
                        </p>
                        <Button
                            onClick={() => handleToggleAvailability(true)}
                            className="w-full"
                        >
                            Go Online
                        </Button>
                    </Card>
                ) : loading ? (
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
                ) : availableOrders.length === 0 ? (
                    <Card className="text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            No Orders Available
                        </h3>
                        <p className="text-secondary-600">
                            We'll notify you when new orders are available nearby
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {availableOrders.map((order: any) => {
                            // Debug: Log order structure to see what fields are available
                            console.log('🏠 Order data:', {
                                id: order.id.slice(0, 8),
                                restaurantAddress: order.restaurantAddress,
                                restaurantLocation: order.restaurantLocation,
                                deliveryAddress: order.deliveryAddress,
                                addresses: order.addresses
                            });

                            // Get restaurant and delivery coordinates
                            const restaurantCoords = order.restaurantAddress?.coordinates || order.restaurantLocation || order.addresses?.restaurant?.coordinates;
                            const deliveryCoords = order.deliveryAddress?.coordinates || order.addresses?.delivery?.coordinates;

                            console.log('🏠 Coordinates:', {
                                restaurant: restaurantCoords,
                                delivery: deliveryCoords,
                                currentLocation
                            });

                            // Check if coordinates are valid
                            const hasValidRestaurantCoords =
                                restaurantCoords &&
                                typeof restaurantCoords.lat === 'number' &&
                                typeof restaurantCoords.lng === 'number' &&
                                restaurantCoords.lat !== 0 &&
                                restaurantCoords.lng !== 0;

                            const hasValidDeliveryCoords =
                                deliveryCoords &&
                                typeof deliveryCoords.lat === 'number' &&
                                typeof deliveryCoords.lng === 'number' &&
                                deliveryCoords.lat !== 0 &&
                                deliveryCoords.lng !== 0;

                            console.log('🏠 Valid coords check:', {
                                hasValidRestaurant: hasValidRestaurantCoords,
                                hasValidDelivery: hasValidDeliveryCoords
                            });

                            // Calculate distances
                            const distanceToRestaurant = currentLocation && hasValidRestaurantCoords
                                ? calculateDistance(
                                    currentLocation.lat,
                                    currentLocation.lng,
                                    restaurantCoords.lat,
                                    restaurantCoords.lng
                                )
                                : 0;

                            const restaurantToDelivery = hasValidRestaurantCoords && hasValidDeliveryCoords
                                ? calculateDistance(
                                    restaurantCoords.lat,
                                    restaurantCoords.lng,
                                    deliveryCoords.lat,
                                    deliveryCoords.lng
                                )
                                : 0;

                            // Total distance = to restaurant + delivery distance
                            const totalDistance = distanceToRestaurant + restaurantToDelivery;
                            const hasValidDistance = totalDistance > 0;

                            return (
                                <Card key={order.id} className="overflow-hidden">
                                    <div className="space-y-4">
                                        {/* Order Header */}
                                        <div className="flex items-start justify-between">
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
                                                <div className="flex items-center space-x-1 text-primary-600 font-bold">
                                                    <IndianRupee className="h-4 w-4" />
                                                    <span>{order.pricing?.deliveryFee || order.deliveryFee || 40}</span>
                                                </div>
                                                <p className="text-xs text-secondary-500">Delivery fee</p>
                                            </div>
                                        </div>

                                        {/* Pickup Location */}
                                        <div className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-secondary-700">Pickup</p>
                                                <p className="text-sm text-secondary-900 line-clamp-1">
                                                    {order.restaurantAddress?.address ||
                                                     order.restaurantAddress?.street ||
                                                     order.addresses?.restaurant?.street ||
                                                     'Restaurant Address'}
                                                </p>
                                                {distanceToRestaurant > 0 && (
                                                    <p className="text-xs text-secondary-500 mt-0.5">
                                                        {distanceToRestaurant.toFixed(1)} km from you
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delivery Location */}
                                        <div className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-secondary-700">Drop</p>
                                                <p className="text-sm text-secondary-900 line-clamp-1">
                                                    {order.deliveryAddress?.address ||
                                                     order.deliveryAddress?.street ||
                                                     order.addresses?.delivery?.street ||
                                                     'Customer Address'}
                                                </p>
                                                {restaurantToDelivery > 0 && (
                                                    <p className="text-xs text-secondary-500 mt-0.5">
                                                        {restaurantToDelivery.toFixed(1)} km from restaurant
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex items-center justify-between text-sm bg-primary-50 p-3 rounded-lg">
                                            <div className="flex items-center space-x-1 text-primary-700">
                                                <Navigation className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {hasValidDistance ? `${totalDistance.toFixed(1)} km total` : 'Distance unavailable'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-primary-700">
                                                <Clock className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {hasValidDistance ? `~${Math.ceil(totalDistance * 3)} mins` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toast.info('Order declined');
                                                }}
                                                variant="secondary"
                                                size="lg"
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptOrder(order.id);
                                                }}
                                                size="lg"
                                            >
                                                Accept
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
