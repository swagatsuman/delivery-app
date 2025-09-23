export interface User {
    uid: string;
    role: 'admin' | 'restaurant' | 'customer' | 'delivery_agent';
    email: string;
    phone?: string;
    name: string;
    status: 'pending' | 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
    profileImage?: string;
    restaurantDetails?: RestaurantDetails;
    customerDetails?: CustomerDetails;
    deliveryAgentDetails?: DeliveryAgentDetails;
}

export interface RestaurantDetails {
    businessName: string;
    ownerName: string;
    gstin: string;
    address: Address;
    cuisineTypes: string[];
    operatingHours: {
        open: string;
        close: string;
        isOpen: boolean;
    };
    rating: number;
    totalRatings: number;
    deliveryRadius: number;
    minimumOrderValue: number;
    deliveryFee: number;
    estimatedDeliveryTime: number;
    totalOrders: number;
    revenue: number;
}

export interface CustomerDetails {
    addresses: Address[];
    preferences: {
        dietaryRestrictions: string[];
        cuisinePreferences: string[];
    };
    totalOrders: number;
    totalSpent: number;
}

export interface DeliveryAgentDetails {
    vehicleType: 'bike' | 'bicycle' | 'car';
    vehicleNumber: string;
    licenseNumber: string;
    kycDocuments: {
        aadhar: string;
        license: string;
        pan: string;
    };
    currentLocation: Coordinates;
    isAvailable: boolean;
    rating: number;
    totalRatings: number;
    totalDeliveries: number;
    earnings: number;
}

export interface Address {
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
    isDefault?: boolean;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Restaurant {
    id: string;
    ownerId: string;
    businessName: string;
    description: string;
    images: string[];
    categories: string[];
    totalOrders: number;
    revenue: number;
    isOpen: boolean;
    featured: boolean;
    rating: number;
    totalRatings: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    restaurantId: string;
    deliveryAgentId?: string;
    items: OrderItem[];
    pricing: OrderPricing;
    addresses: {
        restaurant: Address;
        delivery: Address;
    };
    status: OrderStatus;
    timeline: OrderTimeline[];
    payment: Payment;
    estimatedDeliveryTime: Date;
    actualDeliveryTime?: Date;
    ratings?: {
        food: { rating: number; review: string };
        delivery: { rating: number; review: string };
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customizations: string[];
    specialInstructions: string;
}

export interface OrderPricing {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
}

export type OrderStatus =
    | 'placed'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'picked_up'
    | 'on_the_way'
    | 'delivered'
    | 'cancelled';

export interface OrderTimeline {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
}

export interface Payment {
    method: 'cash' | 'card' | 'upi' | 'wallet';
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
}

export interface DashboardStats {
    totalRestaurants: number;
    pendingRestaurants: number;
    activeRestaurants: number;
    totalCustomers: number;
    totalDeliveryAgents: number;
    pendingDeliveryAgents: number;
    totalOrders: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    averageOrderValue: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface RestaurantState {
    restaurants: Restaurant[];
    selectedRestaurant: Restaurant | null;
    loading: boolean;
    error: string | null;
    filters: RestaurantFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface RestaurantFilters {
    status: 'all' | 'pending' | 'active' | 'inactive' | 'suspended';
    search: string;
    cuisine: string;
    rating: number | null;
}

export interface UserState {
    users: User[];
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
    filters: UserFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface UserFilters {
    role: 'all' | 'restaurant' | 'customer' | 'delivery_agent';
    status: 'all' | 'pending' | 'active' | 'inactive' | 'suspended';
    search: string;
}

export interface DashboardState {
    stats: DashboardStats | null;
    recentActivity: any[];
    chartData: any[];
    loading: boolean;
    error: string | null;
}

export const VEHICLE_TYPES = {
    BIKE: 'bike',
    BICYCLE: 'bicycle',
    CAR: 'car'
} as const;

export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    ONLINE: 'online',
    WALLET: 'wallet'
} as const;

export const KYC_DOCUMENT_TYPES = {
    AADHAR: 'aadhar',
    LICENSE: 'license',
    PAN: 'pan',
    PHOTO: 'photo'
} as const;
