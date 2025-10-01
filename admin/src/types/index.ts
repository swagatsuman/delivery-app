export interface User {
    uid: string;
    role: 'admin' | 'establishment' | 'customer' | 'delivery_agent';
    email: string;
    phone?: string;
    name: string;
    status: 'pending' | 'active' | 'inactive' | 'suspended';
    createdAt: Date;
    updatedAt: Date;
    profileImage?: string;
    establishmentDetails?: EstablishmentDetails;
    customerDetails?: CustomerDetails;
    deliveryAgentDetails?: DeliveryAgentDetails;
}

export interface EstablishmentDetails {
    businessName: string;
    ownerName: string;
    gstin: string;
    address: Address;
    establishmentType: EstablishmentType;
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
    // Type-specific features
    restaurantFeatures?: RestaurantFeatures;
    foodTruckFeatures?: FoodTruckFeatures;
    groceryShopFeatures?: GroceryShopFeatures;
    bakeryFeatures?: BakeryFeatures;
    cafeFeatures?: CafeFeatures;
    cloudKitchenFeatures?: CloudKitchenFeatures;
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

export type EstablishmentType = 'restaurant' | 'food_truck' | 'grocery_shop' | 'bakery' | 'cafe' | 'cloud_kitchen';

export interface Establishment {
    id: string;
    ownerId: string;
    businessName: string;
    description: string;
    images: string[];
    categories: string[];
    establishmentType: EstablishmentType;
    totalOrders: number;
    revenue: number;
    isOpen: boolean;
    featured: boolean;
    rating: number;
    totalRatings: number;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    approvedAt?: Date;
    approvedBy?: string;
    rejectedReason?: string;
    createdAt: Date;
    updatedAt: Date;
    // Type-specific features
    restaurantFeatures?: RestaurantFeatures;
    foodTruckFeatures?: FoodTruckFeatures;
    groceryShopFeatures?: GroceryShopFeatures;
    bakeryFeatures?: BakeryFeatures;
    cafeFeatures?: CafeFeatures;
    cloudKitchenFeatures?: CloudKitchenFeatures;
}

// Restaurant specific features
export interface RestaurantFeatures {
    dineInAvailable: boolean;
    tableReservation: boolean;
    liveMusic: boolean;
    outdoorSeating: boolean;
    parkingAvailable: boolean;
}

// Food Truck specific features
export interface FoodTruckFeatures {
    currentLocation: Coordinates;
    route: RouteStop[];
    vehicleDetails: {
        licensePlate: string;
        vehicleType: string;
        capacity: number;
    };
    scheduleEnabled: boolean;
    mobileMenuEnabled: boolean;
}

export interface RouteStop {
    location: Coordinates;
    address: string;
    arrivalTime: string;
    departureTime: string;
    dayOfWeek: string[];
}

// Grocery Shop specific features
export interface GroceryShopFeatures {
    bulkOrdersEnabled: boolean;
    inventoryManagement: boolean;
    categoryManagement: boolean;
    expiryTracking: boolean;
    wholesaleEnabled: boolean;
    minimumBulkQuantity: number;
}

// Bakery specific features
export interface BakeryFeatures {
    customOrdersEnabled: boolean;
    advanceBookingDays: number;
    specializedItems: string[];
    cakeCustomization: boolean;
    decorationServices: boolean;
    eventCatering: boolean;
}

// Café specific features
export interface CafeFeatures {
    studySpaceAvailable: boolean;
    wifiAvailable: boolean;
    workingHours: {
        studyFriendly: boolean;
        quietZone: boolean;
        chargingPorts: boolean;
    };
    meetingRoomsAvailable: boolean;
    casualDining: boolean;
}

// Cloud Kitchen specific features
export interface CloudKitchenFeatures {
    virtualBrands: VirtualBrand[];
    deliveryOnly: boolean;
    kitchenCapacity: number;
    multiCuisineEnabled: boolean;
    brandManagement: boolean;
}

export interface VirtualBrand {
    id: string;
    name: string;
    description: string;
    logo: string;
    cuisineType: string;
    isActive: boolean;
    menu: string[]; // Menu item IDs
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    establishmentId: string;
    deliveryAgentId?: string;
    items: OrderItem[];
    pricing: OrderPricing;
    addresses: {
        establishment: Address;
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
    totalEstablishments: number;
    pendingEstablishments: number;
    approvedEstablishments: number;
    establishmentsByType: Record<EstablishmentType, number>;
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

export interface EstablishmentState {
    establishments: Establishment[];
    selectedEstablishment: Establishment | null;
    loading: boolean;
    error: string | null;
    filters: EstablishmentFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface EstablishmentFilters {
    status: 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';
    establishmentType: 'all' | EstablishmentType;
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
    role: 'all' | 'establishment' | 'customer' | 'delivery_agent';
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
