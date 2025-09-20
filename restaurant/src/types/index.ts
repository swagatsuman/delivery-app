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
    description?: string;
    images?: string[];
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

export interface Category {
    id: string;
    restaurantId: string;
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
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    discountPrice?: number;
    type: 'veg' | 'non-veg' | 'egg';
    spiceLevel: 'mild' | 'medium' | 'hot';
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
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    restaurantId: string;
    deliveryAgentId?: string;
    customerName: string;
    customerPhone: string;
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
