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
    deliveryAgentDetails?: DeliveryAgentDetails;
}

export interface DeliveryAgentDetails {
    vehicleType: 'bike' | 'bicycle' | 'car';
    vehicleNumber: string;
    licenseNumber: string;
    kycDocuments: {
        aadhar: string;
        license: string;
        pan: string;
        photo: string;
    };
    currentLocation: Coordinates;
    isAvailable: boolean;
    rating: number;
    totalRatings: number;
    totalDeliveries: number;
    earnings: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    averageRating: number;
    workingHours: {
        start: string;
        end: string;
        isOnline: boolean;
    };
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };
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
    deliveryStatus?: 'assigned' | 'picked_up' | 'on_the_way' | 'out_for_delivery' | 'delivered' | 'cancelled';
    timeline: OrderTimeline[];
    payment: Payment;
    estimatedDeliveryTime: Date;
    actualDeliveryTime?: Date;
    specialInstructions?: string;
    distance: number;
    deliveryFee: number;
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
    | 'ready'
    | 'assigned'
    | 'picked_up'
    | 'on_the_way'
    | 'delivered'
    | 'cancelled';

export interface OrderTimeline {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    location?: Coordinates;
}

export interface Payment {
    method: 'cash' | 'card' | 'upi' | 'wallet';
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    amount: number;
}

export interface Address {
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
    landmark?: string;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface DashboardStats {
    todayDeliveries: number;
    todayEarnings: number;
    pendingOrders: number;
    completedOrders: number;
    averageRating: number;
    totalRatings: number;
    totalDistance: number;
    onlineHours: number;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface OrderState {
    availableOrders: Order[];
    assignedOrders: Order[];
    completedOrders: Order[];
    selectedOrder: Order | null;
    loading: boolean;
    error: string | null;
    filters: OrderFilters;
}

export interface OrderFilters {
    status: 'all' | OrderStatus;
    dateRange: 'today' | 'week' | 'month' | 'all';
    distance: number;
}

export interface DashboardState {
    stats: DashboardStats | null;
    recentOrders: Order[];
    earnings: EarningsData[];
    loading: boolean;
    error: string | null;
}

export interface EarningsData {
    date: string;
    earnings: number;
    deliveries: number;
    distance: number;
}
