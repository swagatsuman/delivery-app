import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Store, MapPin, Bike } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface OrderTrackingMapProps {
    restaurantLocation: {
        lat: number;
        lng: number;
    };
    customerLocation: {
        lat: number;
        lng: number;
    };
    deliveryAgentId?: string;
    deliveryStatus?: string;
    orderStatus?: string;
}

interface DeliveryAgentLocation {
    lat: number;
    lng: number;
}

const RoutePolyline: React.FC<{
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    showRoute: boolean;
}> = ({ origin, destination, showRoute }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

    // Initialize Directions Renderer
    useEffect(() => {
        if (!map || !routesLibrary || !showRoute) {
            return;
        }

        console.log('Creating directions renderer');
        const renderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#f97316',
                strokeWeight: 5,
                strokeOpacity: 0.9
            }
        });
        setDirectionsRenderer(renderer);

        return () => {
            console.log('Cleaning up directions renderer');
            renderer.setMap(null);
        };
    }, [map, routesLibrary, showRoute]);

    // Request Directions
    useEffect(() => {
        if (!directionsRenderer || !routesLibrary || !showRoute) return;

        console.log('Requesting directions from', origin, 'to', destination);
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    console.log('✅ Directions received successfully, drawing route');
                    directionsRenderer.setDirections(result);
                } else {
                    console.error('❌ Directions request failed:', status);
                    console.error('Please ensure Directions API is enabled in Google Cloud Console');
                }
            }
        );
    }, [directionsRenderer, routesLibrary, origin, destination, showRoute]);

    return null;
};

const OrderTrackingMapContent: React.FC<OrderTrackingMapProps> = ({
    restaurantLocation,
    customerLocation,
    deliveryAgentId,
    deliveryStatus,
    orderStatus
}) => {
    const [agentLocation, setAgentLocation] = useState<DeliveryAgentLocation | null>(null);
    const map = useMap();

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            'placed': 'Order Placed',
            'confirmed': 'Order Confirmed',
            'preparing': 'Preparing Food',
            'ready': 'Food Ready',
            'picked_up': 'Food Ready',
            'on_the_way': 'Food Ready',
            'delivered': 'Delivered'
        };
        return labels[status] || 'Processing';
    };

    // Listen to delivery agent location updates
    useEffect(() => {
        if (!deliveryAgentId) return;

        const unsubscribe = onSnapshot(
            doc(db, 'deliveryAgents', deliveryAgentId),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    if (data.currentLocation) {
                        setAgentLocation(data.currentLocation);
                    }
                }
            },
            (error) => {
                console.error('Error listening to agent location:', error);
            }
        );

        return () => unsubscribe();
    }, [deliveryAgentId]);

    // Fit bounds to show all markers
    useEffect(() => {
        if (!map) return;

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(restaurantLocation);
        bounds.extend(customerLocation);

        if (agentLocation && agentLocation.lat !== 0 && agentLocation.lng !== 0) {
            bounds.extend(agentLocation);
        }

        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }, [map, restaurantLocation, customerLocation, agentLocation]);

    const showRoute = deliveryStatus === 'picked_up' || deliveryStatus === 'on_the_way';

    console.log('OrderTrackingMapContent - deliveryStatus:', deliveryStatus, 'showRoute:', showRoute);

    return (
        <>
            {/* Restaurant Marker with Status Label */}
            <AdvancedMarker position={restaurantLocation}>
                <div className="relative flex flex-col items-center">
                    {/* Status Label */}
                    {orderStatus && (
                        <div className="mb-2 bg-success-600 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold whitespace-nowrap">
                            {getStatusLabel(orderStatus)}
                        </div>
                    )}
                    {/* Marker Icon */}
                    <div className="relative">
                        <div className="bg-success-500 p-2 rounded-full shadow-lg border-3 border-white">
                            <Store className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white"></div>
                    </div>
                </div>
            </AdvancedMarker>

            {/* Customer Marker */}
            <AdvancedMarker position={customerLocation}>
                <div className="relative">
                    <div className="bg-error-500 p-2 rounded-full shadow-lg border-3 border-white">
                        <MapPin className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white"></div>
                </div>
            </AdvancedMarker>

            {/* Delivery Agent Marker */}
            {agentLocation && agentLocation.lat !== 0 && agentLocation.lng !== 0 && (
                <AdvancedMarker position={agentLocation}>
                    <div className="relative animate-bounce">
                        <div className="bg-primary-500 p-2 rounded-full shadow-lg border-3 border-white ring-4 ring-primary-200">
                            <Bike className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white"></div>
                    </div>
                </AdvancedMarker>
            )}

            {/* Route from restaurant to customer when picked up */}
            {showRoute && (
                <RoutePolyline
                    origin={restaurantLocation}
                    destination={customerLocation}
                    showRoute={showRoute}
                />
            )}
        </>
    );
};

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = (props) => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    // Calculate center point between restaurant and customer
    const center = {
        lat: (props.restaurantLocation.lat + props.customerLocation.lat) / 2,
        lng: (props.restaurantLocation.lng + props.customerLocation.lng) / 2
    };

    return (
        <div className="relative bg-surface rounded-xl overflow-hidden shadow-lg">
            <APIProvider apiKey={apiKey}>
                <div className="relative h-[400px] w-full">
                    <Map
                        defaultCenter={center}
                        defaultZoom={13}
                        mapId="order-tracking-map"
                        disableDefaultUI={false}
                        zoomControl={true}
                        streetViewControl={false}
                        mapTypeControl={false}
                        fullscreenControl={false}
                    >
                        <OrderTrackingMapContent {...props} />
                    </Map>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2.5">
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="bg-success-500 p-1.5 rounded-full">
                                <Store className="h-3 w-3 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-secondary-700 font-medium">Restaurant</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="bg-error-500 p-1.5 rounded-full">
                                <MapPin className="h-3 w-3 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-secondary-700 font-medium">Your Location</span>
                        </div>
                        {props.deliveryAgentId && (
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="bg-primary-500 p-1.5 rounded-full">
                                    <Bike className="h-3 w-3 text-white" strokeWidth={2.5} />
                                </div>
                                <span className="text-secondary-700 font-medium">Delivery Partner</span>
                            </div>
                        )}
                    </div>
                </div>
            </APIProvider>
        </div>
    );
};
