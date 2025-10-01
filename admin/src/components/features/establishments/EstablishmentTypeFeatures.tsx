import React from 'react';
import { MapPin, Clock, Truck, Package, Calendar, Coffee, Utensils, ShoppingCart, Cake, Car, Store } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { EstablishmentType, Establishment } from '../../../types';

interface EstablishmentTypeFeaturesProps {
    establishmentType: EstablishmentType;
    establishment: Establishment;
}

export const EstablishmentTypeFeatures: React.FC<EstablishmentTypeFeaturesProps> = ({
    establishmentType,
    establishment
}) => {
    const renderRestaurantFeatures = () => {
        const features = establishment.restaurantFeatures;
        if (!features) return null;

        return (
            <Card title="Restaurant Features" icon={<Utensils className="h-5 w-5" />}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Dine-in Available</span>
                        <Badge variant={features.dineInAvailable ? 'success' : 'secondary'}>
                            {features.dineInAvailable ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Table Reservation</span>
                        <Badge variant={features.tableReservation ? 'success' : 'secondary'}>
                            {features.tableReservation ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Live Music</span>
                        <Badge variant={features.liveMusic ? 'success' : 'secondary'}>
                            {features.liveMusic ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Outdoor Seating</span>
                        <Badge variant={features.outdoorSeating ? 'success' : 'secondary'}>
                            {features.outdoorSeating ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Parking Available</span>
                        <Badge variant={features.parkingAvailable ? 'success' : 'secondary'}>
                            {features.parkingAvailable ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                </div>
            </Card>
        );
    };

    const renderFoodTruckFeatures = () => {
        const features = establishment.foodTruckFeatures;
        if (!features) return null;

        return (
            <Card title="Food Truck Features" icon={<Car className="h-5 w-5" />}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-secondary-700">Current Location</label>
                            <p className="text-secondary-900">
                                {features.currentLocation.lat.toFixed(4)}, {features.currentLocation.lng.toFixed(4)}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-secondary-700">Vehicle Details</label>
                            <p className="text-secondary-900">
                                {features.vehicleDetails.vehicleType} - {features.vehicleDetails.licensePlate}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Schedule Enabled</span>
                            <Badge variant={features.scheduleEnabled ? 'success' : 'secondary'}>
                                {features.scheduleEnabled ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Mobile Menu</span>
                            <Badge variant={features.mobileMenuEnabled ? 'success' : 'secondary'}>
                                {features.mobileMenuEnabled ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                    </div>

                    {features.route && features.route.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-secondary-700 mb-2 block">Route Stops</label>
                            <div className="space-y-2">
                                {features.route.map((stop, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                                        <span className="text-sm text-secondary-900">{stop.address}</span>
                                        <div className="text-xs text-secondary-600">
                                            {stop.arrivalTime} - {stop.departureTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const renderGroceryShopFeatures = () => {
        const features = establishment.groceryShopFeatures;
        if (!features) return null;

        return (
            <Card title="Grocery Shop Features" icon={<ShoppingCart className="h-5 w-5" />}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Bulk Orders</span>
                        <Badge variant={features.bulkOrdersEnabled ? 'success' : 'secondary'}>
                            {features.bulkOrdersEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Inventory Management</span>
                        <Badge variant={features.inventoryManagement ? 'success' : 'secondary'}>
                            {features.inventoryManagement ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Category Management</span>
                        <Badge variant={features.categoryManagement ? 'success' : 'secondary'}>
                            {features.categoryManagement ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Expiry Tracking</span>
                        <Badge variant={features.expiryTracking ? 'success' : 'secondary'}>
                            {features.expiryTracking ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Wholesale</span>
                        <Badge variant={features.wholesaleEnabled ? 'success' : 'secondary'}>
                            {features.wholesaleEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary-700">Min Bulk Quantity</label>
                        <p className="text-secondary-900">{features.minimumBulkQuantity}</p>
                    </div>
                </div>
            </Card>
        );
    };

    const renderBakeryFeatures = () => {
        const features = establishment.bakeryFeatures;
        if (!features) return null;

        return (
            <Card title="Bakery Features" icon={<Cake className="h-5 w-5" />}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Custom Orders</span>
                            <Badge variant={features.customOrdersEnabled ? 'success' : 'secondary'}>
                                {features.customOrdersEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-secondary-700">Advance Booking</label>
                            <p className="text-secondary-900">{features.advanceBookingDays} days</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Cake Customization</span>
                            <Badge variant={features.cakeCustomization ? 'success' : 'secondary'}>
                                {features.cakeCustomization ? 'Available' : 'Not Available'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Decoration Services</span>
                            <Badge variant={features.decorationServices ? 'success' : 'secondary'}>
                                {features.decorationServices ? 'Available' : 'Not Available'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Event Catering</span>
                            <Badge variant={features.eventCatering ? 'success' : 'secondary'}>
                                {features.eventCatering ? 'Available' : 'Not Available'}
                            </Badge>
                        </div>
                    </div>

                    {features.specializedItems && features.specializedItems.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-secondary-700 mb-2 block">Specialized Items</label>
                            <div className="flex flex-wrap gap-2">
                                {features.specializedItems.map((item, index) => (
                                    <Badge key={index} variant="outline">{item}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const renderCafeFeatures = () => {
        const features = establishment.cafeFeatures;
        if (!features) return null;

        return (
            <Card title="Café Features" icon={<Coffee className="h-5 w-5" />}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Study Space</span>
                        <Badge variant={features.studySpaceAvailable ? 'success' : 'secondary'}>
                            {features.studySpaceAvailable ? 'Available' : 'Not Available'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">WiFi Available</span>
                        <Badge variant={features.wifiAvailable ? 'success' : 'secondary'}>
                            {features.wifiAvailable ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Study Friendly</span>
                        <Badge variant={features.workingHours.studyFriendly ? 'success' : 'secondary'}>
                            {features.workingHours.studyFriendly ? 'Yes' : 'No'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Quiet Zone</span>
                        <Badge variant={features.workingHours.quietZone ? 'success' : 'secondary'}>
                            {features.workingHours.quietZone ? 'Available' : 'Not Available'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Charging Ports</span>
                        <Badge variant={features.workingHours.chargingPorts ? 'success' : 'secondary'}>
                            {features.workingHours.chargingPorts ? 'Available' : 'Not Available'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Meeting Rooms</span>
                        <Badge variant={features.meetingRoomsAvailable ? 'success' : 'secondary'}>
                            {features.meetingRoomsAvailable ? 'Available' : 'Not Available'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Casual Dining</span>
                        <Badge variant={features.casualDining ? 'success' : 'secondary'}>
                            {features.casualDining ? 'Available' : 'Not Available'}
                        </Badge>
                    </div>
                </div>
            </Card>
        );
    };

    const renderCloudKitchenFeatures = () => {
        const features = establishment.cloudKitchenFeatures;
        if (!features) return null;

        return (
            <Card title="Cloud Kitchen Features" icon={<Store className="h-5 w-5" />}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Delivery Only</span>
                            <Badge variant={features.deliveryOnly ? 'success' : 'secondary'}>
                                {features.deliveryOnly ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-secondary-700">Kitchen Capacity</label>
                            <p className="text-secondary-900">{features.kitchenCapacity} orders/hour</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Multi-Cuisine</span>
                            <Badge variant={features.multiCuisineEnabled ? 'success' : 'secondary'}>
                                {features.multiCuisineEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-secondary-600">Brand Management</span>
                            <Badge variant={features.brandManagement ? 'success' : 'secondary'}>
                                {features.brandManagement ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                    </div>

                    {features.virtualBrands && features.virtualBrands.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-secondary-700 mb-2 block">Virtual Brands</label>
                            <div className="space-y-2">
                                {features.virtualBrands.map((brand) => (
                                    <div key={brand.id} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                                        <div>
                                            <span className="text-sm font-medium text-secondary-900">{brand.name}</span>
                                            <p className="text-xs text-secondary-600">{brand.cuisineType}</p>
                                        </div>
                                        <Badge variant={brand.isActive ? 'success' : 'secondary'}>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    switch (establishmentType) {
        case 'restaurant':
            return renderRestaurantFeatures();
        case 'food_truck':
            return renderFoodTruckFeatures();
        case 'grocery_shop':
            return renderGroceryShopFeatures();
        case 'bakery':
            return renderBakeryFeatures();
        case 'cafe':
            return renderCafeFeatures();
        case 'cloud_kitchen':
            return renderCloudKitchenFeatures();
        default:
            return null;
    }
};