export const DELIVERY_FEE = 30;
export const FREE_DELIVERY_THRESHOLD = 299;
export const TAX_RATE = 0.05; // 5%

export const ORDER_STATUS_LABELS = {
    placed: 'Order Placed',
    confirmed: 'Order Confirmed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    picked_up: 'Picked Up',
    on_the_way: 'On the Way',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
};

export const PAYMENT_METHODS = {
    cash: 'Cash on Delivery',
    card: 'Credit/Debit Card',
    upi: 'UPI',
    wallet: 'Wallet'
};

export const FOOD_TYPE_COLORS = {
    veg: '#22c55e',
    'non-veg': '#ef4444',
    egg: '#f59e0b'
};

export const FOOD_TYPE_ICONS = {
    veg: '🟢',
    'non-veg': '🔴',
    egg: '🟡'
};

export const SPICE_LEVELS = {
    mild: '🌶️',
    medium: '🌶️🌶️',
    hot: '🌶️🌶️🌶️'
};

export const DEFAULT_LOCATION = {
    lat: 12.9716,
    lng: 77.5946
}; // Bangalore

export const RATING_STARS = [1, 2, 3, 4, 5];

export const SEARCH_SUGGESTIONS = [
    'Pizza',
    'Biryani',
    'Burger',
    'Chinese',
    'South Indian',
    'North Indian',
    'Ice Cream',
    'Desserts',
    'Beverages',
    'Healthy'
];
