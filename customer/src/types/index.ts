export interface User {
    uid: string;
    role: 'customer';
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
    defaultAddressId?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    passwordResetSent: boolean;
}

// Form Types
export interface LoginForm {
    email: string;
    password: string;
}

export interface SignupForm {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordForm {
    email: string;
}

// Location Types
export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Address {
    id: string;
    userId: string;
    label: string; // Home, Work, Other
    name?: string; // Person name for delivery
    phone?: string; // Contact number
    address: string; // Full address
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LocationState {
    currentLocation: Address | null;
    addresses: Address[];
    loading: boolean;
    error: string | null;
}

// Restaurant Types
export interface Restaurant {
    id: string;
    name: string;
    description: string;
    images: string[];
    cuisineTypes: string[];
    rating: number;
    totalRatings: number;
    deliveryTime: string; // "30-40 mins"
    deliveryFee: number;
    minimumOrder: number;
    address: Address;
    isOpen: boolean;
    distance?: number; // in km
    offers?: Offer[];
    featured: boolean;
}

export interface Category {
    id: string;
    name: string;
    image: string;
    restaurantCount: number;
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
    isRecommended: boolean;
    isAvailable: boolean;
    rating: number;
    totalRatings: number;
    customizations?: Customization[];
}

export interface Customization {
    id: string;
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    options: CustomizationOption[];
}

export interface CustomizationOption {
    id: string;
    name: string;
    price: number;
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}

// Cart Types
export interface CartItem {
    id: string;
    menuItem: MenuItem;
    quantity: number;
    customizations: SelectedCustomization[];
    specialInstructions?: string;
    totalPrice: number;
}

export interface SelectedCustomization {
    customizationId: string;
    name: string;
    selectedOptions: CustomizationOption[];
}

export interface CartState {
    items: CartItem[];
    restaurantId: string | null;
    deliveryAddress: Address | null;
    coupon: Coupon | null;
    pricing: CartPricing;
    loading: boolean;
    error: string | null;
}

export interface CartPricing {
    itemTotal: number;
    deliveryFee: number;
    taxes: number;
    discount: number;
    total: number;
}

// Order Types
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    restaurantId: string;
    restaurant: Restaurant;
    items: CartItem[];
    pricing: CartPricing;
    deliveryAddress: Address;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: 'pending' | 'completed' | 'failed';
    specialInstructions?: string;
    estimatedDeliveryTime: Date;
    actualDeliveryTime?: Date;
    timeline: OrderTimeline[];
    rating?: OrderRating;
    createdAt: Date;
    updatedAt: Date;
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
    description: string;
}

export interface OrderRating {
    foodRating: number;
    foodReview?: string;
    deliveryRating: number;
    deliveryReview?: string;
    createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet';

export interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    error: string | null;
}

// Search Types
export interface SearchState {
    query: string;
    results: SearchResults;
    recentSearches: string[];
    loading: boolean;
    error: string | null;
    filters: SearchFilters;
}

export interface SearchResults {
    restaurants: Restaurant[];
    dishes: MenuItem[];
    categories: Category[];
}

export interface SearchFilters {
    sortBy: 'relevance' | 'rating' | 'delivery_time' | 'cost_low_to_high' | 'cost_high_to_low';
    cuisines: string[];
    priceRange: [number, number];
    rating: number;
    deliveryTime: number;
    offers: boolean;
}

// Offer Types
export interface Offer {
    id: string;
    title: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_delivery';
    value: number;
    minimumOrder: number;
    maxDiscount?: number;
    validUntil: Date;
    terms: string[];
}

export interface Coupon {
    id: string;
    code: string;
    title: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    minimumOrder: number;
    maxDiscount?: number;
    validUntil: Date;
    applicableRestaurants: string[];
}

// Notification Types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'order' | 'offer' | 'general';
    isRead: boolean;
    createdAt: Date;
    data?: any;
}

// App State
export interface RootState {
    auth: AuthState;
    location: LocationState;
    cart: CartState;
    orders: OrderState;
    search: SearchState;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// Form Types
export interface LoginForm {
    phone: string;
}

export interface SignupForm {
    name: string;
    phone: string;
}

export interface OTPForm {
    otp: string;
}

export interface AddressForm {
    label: string;
    name?: string;
    phone?: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: Coordinates;
}

// Filter and Sort Types
export interface RestaurantFilters {
    search?: string;
    cuisines?: string[];
    rating?: number;
    deliveryTime?: number;
    priceRange?: [number, number];
    sortBy?: 'relevance' | 'rating' | 'delivery_time' | 'cost_low_to_high' | 'cost_high_to_low';
    offers?: boolean;
}

export interface MenuFilters {
    category?: string;
    type?: 'all' | 'veg' | 'non-veg' | 'egg';
    search?: string;
}
