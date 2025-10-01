import type { EstablishmentType } from '../types';
import {
    LayoutDashboard,
    Menu,
    ShoppingBag,
    BarChart3,
    Settings,
    Star,
    Package,
    MapPin,
    Calendar,
    Coffee,
    Truck,
    Store,
    ChefHat,
    Croissant,
    ShoppingCart,
    Home
} from 'lucide-react';

export interface EstablishmentTypeConfig {
    label: string;
    description: string;
    icon: any;
    color: string;
    menuItems: {
        name: string;
        href: string;
        icon: any;
        description: string;
    }[];
    defaultServiceTypes: string[];
    supportedFeatures: string[];
}

export const ESTABLISHMENT_CONFIGS: Record<EstablishmentType, EstablishmentTypeConfig> = {
    restaurant: {
        label: 'Restaurant',
        description: 'Full-service dining establishment with dine-in and delivery',
        icon: ChefHat,
        color: 'text-orange-600 bg-orange-100',
        menuItems: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview and analytics' },
            { name: 'Menu', href: '/menu', icon: Menu, description: 'Manage your food menu' },
            { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Track customer orders' },
            { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance' },
            { name: 'Reviews', href: '/reviews', icon: Star, description: 'Customer feedback' },
            { name: 'Profile', href: '/profile', icon: Settings, description: 'Restaurant settings' }
        ],
        defaultServiceTypes: ['Indian', 'Chinese', 'Continental', 'Italian', 'Fast Food'],
        supportedFeatures: ['dine_in', 'takeaway', 'delivery', 'table_booking', 'custom_orders']
    },
    food_truck: {
        label: 'Food Truck',
        description: 'Mobile food service with location-based operations',
        icon: Truck,
        color: 'text-blue-600 bg-blue-100',
        menuItems: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview and analytics' },
            { name: 'Menu', href: '/menu', icon: Menu, description: 'Manage your food menu' },
            { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Track customer orders' },
            { name: 'Location', href: '/location', icon: MapPin, description: 'Update current location' },
            { name: 'Schedule', href: '/schedule', icon: Calendar, description: 'Plan your routes' },
            { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance' },
            { name: 'Reviews', href: '/reviews', icon: Star, description: 'Customer feedback' },
            { name: 'Profile', href: '/profile', icon: Settings, description: 'Truck settings' }
        ],
        defaultServiceTypes: ['Street Food', 'Burgers', 'Tacos', 'BBQ', 'Ice Cream'],
        supportedFeatures: ['mobile_ordering', 'location_tracking', 'route_planning', 'delivery']
    },
    grocery_shop: {
        label: 'Grocery Shop',
        description: 'Retail store selling food and household items',
        icon: ShoppingCart,
        color: 'text-green-600 bg-green-100',
        menuItems: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview and analytics' },
            { name: 'Inventory', href: '/inventory', icon: Package, description: 'Manage your products' },
            { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Track customer orders' },
            { name: 'Categories', href: '/categories', icon: Menu, description: 'Product categories' },
            { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance' },
            { name: 'Reviews', href: '/reviews', icon: Star, description: 'Customer feedback' },
            { name: 'Profile', href: '/profile', icon: Settings, description: 'Store settings' }
        ],
        defaultServiceTypes: ['Vegetables', 'Fruits', 'Dairy', 'Packaged Foods', 'Household Items'],
        supportedFeatures: ['home_delivery', 'pickup', 'bulk_orders', 'subscription']
    },
    bakery: {
        label: 'Bakery',
        description: 'Specialized in baked goods and custom cake orders',
        icon: Croissant,
        color: 'text-yellow-600 bg-yellow-100',
        menuItems: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview and analytics' },
            { name: 'Menu', href: '/menu', icon: Menu, description: 'Manage baked items' },
            { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Track customer orders' },
            { name: 'Custom Orders', href: '/custom-orders', icon: Calendar, description: 'Cake & custom orders' },
            { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance' },
            { name: 'Reviews', href: '/reviews', icon: Star, description: 'Customer feedback' },
            { name: 'Profile', href: '/profile', icon: Settings, description: 'Bakery settings' }
        ],
        defaultServiceTypes: ['Cakes', 'Pastries', 'Bread', 'Cookies', 'Custom Cakes'],
        supportedFeatures: ['custom_orders', 'advance_booking', 'delivery', 'pickup']
    },
    cafe: {
        label: 'Café',
        description: 'Casual dining spot for coffee, snacks, and light meals',
        icon: Coffee,
        color: 'text-brown-600 bg-orange-50',
        menuItems: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview and analytics' },
            { name: 'Menu', href: '/menu', icon: Menu, description: 'Manage café menu' },
            { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Track customer orders' },
            { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance' },
            { name: 'Reviews', href: '/reviews', icon: Star, description: 'Customer feedback' },
            { name: 'Profile', href: '/profile', icon: Settings, description: 'Café settings' }
        ],
        defaultServiceTypes: ['Coffee', 'Tea', 'Sandwiches', 'Salads', 'Desserts'],
        supportedFeatures: ['dine_in', 'takeaway', 'delivery', 'wifi', 'study_space']
    },
    cloud_kitchen: {
        label: 'Cloud Kitchen',
        description: 'Delivery-only kitchen serving multiple brands',
        icon: Home,
        color: 'text-purple-600 bg-purple-100',
        menuItems: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview and analytics' },
            { name: 'Brands', href: '/brands', icon: Store, description: 'Manage your brands' },
            { name: 'Menu', href: '/menu', icon: Menu, description: 'Manage all menus' },
            { name: 'Orders', href: '/orders', icon: ShoppingBag, description: 'Track customer orders' },
            { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Sales and performance' },
            { name: 'Reviews', href: '/reviews', icon: Star, description: 'Customer feedback' },
            { name: 'Profile', href: '/profile', icon: Settings, description: 'Kitchen settings' }
        ],
        defaultServiceTypes: ['Multiple Cuisines', 'Fast Food', 'Healthy Food', 'Desserts', 'Beverages'],
        supportedFeatures: ['multiple_brands', 'delivery_only', 'virtual_restaurants', 'dark_kitchen']
    }
};

export const getEstablishmentConfig = (type: EstablishmentType): EstablishmentTypeConfig => {
    return ESTABLISHMENT_CONFIGS[type] || ESTABLISHMENT_CONFIGS.restaurant;
};

export const getEstablishmentTypes = () => {
    return Object.keys(ESTABLISHMENT_CONFIGS) as EstablishmentType[];
};

export const getEstablishmentLabel = (type: EstablishmentType): string => {
    return ESTABLISHMENT_CONFIGS[type]?.label || 'Restaurant';
};

export const getEstablishmentIcon = (type: EstablishmentType) => {
    return ESTABLISHMENT_CONFIGS[type]?.icon || ChefHat;
};

export const getEstablishmentMenuItems = (type: EstablishmentType) => {
    return ESTABLISHMENT_CONFIGS[type]?.menuItems || ESTABLISHMENT_CONFIGS.restaurant.menuItems;
};