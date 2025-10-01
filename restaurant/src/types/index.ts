export type EstablishmentType = 'restaurant' | 'food_truck' | 'grocery_shop' | 'bakery' | 'cafe' | 'cloud_kitchen';

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
    establishmentId?: string; // Link to establishment collection
    establishmentDetails?: Establishment;
}

export interface Establishment {
    id: string;
    ownerId: string; // Link to user collection
    establishmentType: EstablishmentType;
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    gstin: string;
    description: string;
    images: string[];
    address: Address;
    serviceTypes: string[]; // cuisines for restaurants, product types for grocery, etc.
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
    isActive: boolean;
    featured: boolean;
    // Type-specific configurations
    config: EstablishmentConfig;
    createdAt: Date;
    updatedAt: Date;
}

export interface EstablishmentConfig {
    // Restaurant specific
    cuisineTypes?: string[];
    dineIn?: boolean;
    tableCount?: number;

    // Food truck specific
    route?: string[];
    currentLocation?: Coordinates;

    // Grocery specific
    categories?: string[];
    homeDelivery?: boolean;

    // Bakery specific
    customOrders?: boolean;
    cakeOrders?: boolean;

    // Cafe specific
    wifiAvailable?: boolean;
    studySpace?: boolean;

    // Cloud kitchen specific
    brands?: string[];
    deliveryOnly?: boolean;
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

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    establishmentId: string;
    deliveryAgentId?: string;
    customerName: string;
    customerPhone: string;
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
    specialInstructions?: string;
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
    images?: string[];
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

export interface Category {
    id: string;
    establishmentId: string;
    name: string;
    description: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItem {
    id: string;
    establishmentId: string;
    categoryId: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    discountPrice?: number;
    type: 'veg' | 'non-veg' | 'egg' | 'organic' | 'gluten-free' | 'dairy-free';
    spiceLevel?: 'mild' | 'medium' | 'hot';
    ingredients: string[];
    allergens: string[];
    nutritionInfo: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    preparationTime: number;
    isAvailable: boolean;
    isRecommended: boolean;
    rating: number;
    totalRatings: number;
    tags: string[];
    // Item type specific fields
    unit?: string; // for grocery items (kg, liters, pieces)
    brand?: string; // for grocery/bakery items
    expiryDate?: Date; // for perishable items
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardStats {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    averageOrderValue: number;
    totalMenuItems: number;
    averageRating: number;
    totalReviews: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface MenuState {
    categories: Category[];
    menuItems: MenuItem[];
    selectedCategory: Category | null;
    selectedMenuItem: MenuItem | null;
    loading: boolean;
    error: string | null;
    filters: MenuFilters;
}

export interface MenuFilters {
    search: string;
    category: string;
    type: 'all' | 'veg' | 'non-veg' | 'egg';
    availability: 'all' | 'available' | 'unavailable';
}

export interface OrderState {
    orders: Order[];
    selectedOrder: Order | null;
    loading: boolean;
    error: string | null;
    filters: OrderFilters;
    realTimeEnabled: boolean;
}

export interface OrderFilters {
    status: 'all' | OrderStatus;
    dateRange: 'today' | 'week' | 'month' | 'all';
    search: string;
}

export interface DashboardState {
    stats: DashboardStats | null;
    recentOrders: Order[];
    chartData: any[];
    loading: boolean;
    error: string | null;
}

// Admin specific types
export interface EstablishmentFilters {
    type: 'all' | EstablishmentType;
    status: 'all' | 'pending' | 'active' | 'inactive' | 'suspended';
    search: string;
    serviceType: string;
    rating: number | null;
}

export interface UserFilters {
    role: 'all' | 'establishment' | 'customer' | 'delivery_agent';
    status: 'all' | 'pending' | 'active' | 'inactive' | 'suspended';
    search: string;
}

export interface EstablishmentState {
    establishments: User[]; // Users with establishment role
    selectedEstablishment: User | null;
    loading: boolean;
    error: string | null;
    filters: EstablishmentFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
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
