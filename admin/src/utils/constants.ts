export const USER_ROLES = {
    ADMIN: 'admin',
    ESTABLISHMENT: 'establishment',
    CUSTOMER: 'customer',
    DELIVERY_AGENT: 'delivery_agent'
} as const;

export const USER_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
} as const;

export const ESTABLISHMENT_TYPES = {
    RESTAURANT: 'restaurant',
    FOOD_TRUCK: 'food_truck',
    GROCERY_SHOP: 'grocery_shop',
    BAKERY: 'bakery',
    CAFE: 'cafe',
    CLOUD_KITCHEN: 'cloud_kitchen'
} as const;

export const ESTABLISHMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
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

export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    ESTABLISHMENTS: '/establishments',
    ESTABLISHMENT_DETAIL: '/establishments/:id',
    USERS: '/users',
    USER_DETAIL: '/users/:id',
    DELIVERY_AGENTS: '/delivery-agents',
    ORDERS: '/orders',
    ANALYTICS: '/analytics',
    SETTINGS: '/settings'
} as const;

export const API_ENDPOINTS = {
    USERS: 'users',
    ESTABLISHMENTS: 'establishments',
    ORDERS: 'orders',
    CATEGORIES: 'categories',
    MENU_ITEMS: 'menuItems',
    OFFERS: 'offers'
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
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
