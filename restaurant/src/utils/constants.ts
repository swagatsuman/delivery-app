export const USER_ROLES = {
    ADMIN: 'admin',
    RESTAURANT: 'restaurant',
    CUSTOMER: 'customer',
    DELIVERY_AGENT: 'delivery_agent'
} as const;

export const USER_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
} as const;

export const ORDER_STATUS = {
    PLACED: 'placed',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    PICKED_UP: 'picked_up',
    ON_THE_WAY: 'on_the_way',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
} as const;

export const FOOD_TYPES = {
    VEG: 'veg',
    NON_VEG: 'non-veg',
    EGG: 'egg'
} as const;

export const SPICE_LEVELS = {
    MILD: 'mild',
    MEDIUM: 'medium',
    HOT: 'hot'
} as const;

export const ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    MENU: '/menu',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    PROFILE: '/profile',
    SETTINGS: '/settings'
} as const;

export const ORDER_STATUS_COLORS = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    on_the_way: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
} as const;

export const CUISINE_TYPES = [
    'Indian',
    'Chinese',
    'Italian',
    'Mexican',
    'Thai',
    'American',
    'Continental',
    'South Indian',
    'North Indian',
    'Fast Food',
    'Beverages',
    'Desserts'
] as const;
