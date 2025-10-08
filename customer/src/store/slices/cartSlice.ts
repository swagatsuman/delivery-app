import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartState, CartItem, MenuItem, Address, CartPricing, SelectedCustomization, Restaurant } from '../../types';
import { generateId, calculateDistance } from '../../utils/helpers';
import { parsePrice, getFinalPrice } from '../../utils/priceUtils';
import { cartService } from '../../services/cartService';
import { settingsService } from '../../services/settingsService';

const initialState: CartState = {
    ...cartService.loadCart(),
    deliveryAddress: null,
    coupon: null,
    pricing: {
        itemTotal: 0,
        deliveryFee: 0,
        taxes: 0,
        discount: 0,
        total: 0
    },
    loading: false,
    error: null,
    restaurantAddress: null
};

// Add restaurant address to CartState interface extension
declare module '../../types' {
    interface CartState {
        restaurantAddress?: Address | null;
    }
}

// Helper function to calculate pricing
const calculatePricing = async (
    items: CartItem[],
    deliveryAddress: Address | null = null,
    restaurantAddress: Address | null = null
): Promise<CartPricing> => {
    console.log('Calculating pricing for items:', items);

    const itemTotal = items.reduce((total, item) => {
        console.log(`Item: ${item.menuItem.name}, Quantity: ${item.quantity}, Total Price: ${item.totalPrice}`);
        return total + item.totalPrice;
    }, 0);

    console.log('Item total:', itemTotal);

    // Get delivery settings from Firestore
    const settings = await settingsService.getDeliverySettings();

    // Calculate distance if both addresses are available
    let distance = 0;
    if (deliveryAddress?.coordinates && restaurantAddress?.coordinates) {
        distance = calculateDistance(
            restaurantAddress.coordinates.lat,
            restaurantAddress.coordinates.lng,
            deliveryAddress.coordinates.lat,
            deliveryAddress.coordinates.lng
        );
        console.log(`Distance between restaurant and delivery address: ${distance}km`);
    }

    // Calculate delivery fee based on new rules
    const { customerFee } = settingsService.calculateDeliveryFee(itemTotal, distance, settings);

    const taxes = Math.round(itemTotal * (settings.taxPercentage / 100));
    const discount = 0; // Apply coupon discounts here
    const total = itemTotal + customerFee + taxes - discount;

    const pricing = {
        itemTotal,
        deliveryFee: customerFee,
        taxes,
        discount,
        total: Math.max(0, total)
    };

    console.log('Final pricing:', pricing);
    return pricing;
};

// Helper function to calculate item total price
const calculateItemPrice = (menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[]): number => {
    // Use utility function to get the final price (considering discounts)
    const basePrice = getFinalPrice(menuItem.price, menuItem.discountPrice);

    let customizationPrice = 0;

    customizations.forEach(customization => {
        customization.selectedOptions.forEach(option => {
            customizationPrice += parsePrice(option.price);
        });
    });

    const totalPrice = (basePrice + customizationPrice) * quantity;
    console.log(`Calculating price for ${menuItem.name}: originalPrice=${menuItem.price}, finalBasePrice=${basePrice}, customization=${customizationPrice}, quantity=${quantity}, total=${totalPrice}`);

    return totalPrice;
};

// Async thunk to recalculate pricing
export const recalculateCartPricing = createAsyncThunk(
    'cart/recalculateCartPricing',
    async (_, { getState }) => {
        const state = getState() as { cart: CartState };
        const { items, deliveryAddress, restaurantAddress } = state.cart;
        return await calculatePricing(items, deliveryAddress, restaurantAddress);
    }
);

// Async thunk to set restaurant info and recalculate
export const setRestaurantInfo = createAsyncThunk(
    'cart/setRestaurantInfo',
    async (restaurant: Restaurant, { getState }) => {
        const state = getState() as { cart: CartState };
        const { items, deliveryAddress } = state.cart;
        const pricing = await calculatePricing(items, deliveryAddress, restaurant.address);
        return { restaurantAddress: restaurant.address, pricing };
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{
            menuItem: MenuItem;
            quantity: number;
            customizations: SelectedCustomization[];
            specialInstructions?: string;
            restaurantId: string;
        }>) => {
            const { menuItem, quantity, customizations, specialInstructions, restaurantId } = action.payload;

            console.log('Adding to cart:', { menuItem: menuItem.name, quantity, price: menuItem.price });

            // If adding from different restaurant, clear cart
            if (state.restaurantId && state.restaurantId !== restaurantId) {
                state.items = [];
                state.restaurantAddress = null;
            }

            state.restaurantId = restaurantId;

            // Check if same item with same customizations exists
            const existingItemIndex = state.items.findIndex(item =>
                item.menuItem.id === menuItem.id &&
                JSON.stringify(item.customizations) === JSON.stringify(customizations) &&
                item.specialInstructions === specialInstructions
            );

            const totalPrice = calculateItemPrice(menuItem, quantity, customizations);

            if (existingItemIndex >= 0) {
                // Update existing item
                state.items[existingItemIndex].quantity += quantity;
                state.items[existingItemIndex].totalPrice = calculateItemPrice(
                    menuItem,
                    state.items[existingItemIndex].quantity,
                    customizations
                );
                console.log('Updated existing item:', state.items[existingItemIndex]);
            } else {
                // Add new item
                const cartItem: CartItem = {
                    id: generateId(),
                    menuItem,
                    quantity,
                    customizations,
                    specialInstructions,
                    totalPrice
                };
                state.items.push(cartItem);
                console.log('Added new item:', cartItem);
            }

            // Update item total immediately (delivery fee will be recalculated async)
            state.pricing.itemTotal = state.items.reduce((total, item) => total + item.totalPrice, 0);

            // Save to localStorage
            cartService.saveCart(state.items, state.restaurantId);
        },

        updateCartItem: (state, action: PayloadAction<{
            itemId: string;
            quantity?: number;
            customizations?: SelectedCustomization[];
            specialInstructions?: string;
        }>) => {
            const { itemId, quantity, customizations, specialInstructions } = action.payload;
            const itemIndex = state.items.findIndex(item => item.id === itemId);

            if (itemIndex >= 0) {
                if (quantity !== undefined) {
                    state.items[itemIndex].quantity = quantity;
                }
                if (customizations !== undefined) {
                    state.items[itemIndex].customizations = customizations;
                }
                if (specialInstructions !== undefined) {
                    state.items[itemIndex].specialInstructions = specialInstructions;
                }

                // Recalculate item price
                state.items[itemIndex].totalPrice = calculateItemPrice(
                    state.items[itemIndex].menuItem,
                    state.items[itemIndex].quantity,
                    state.items[itemIndex].customizations
                );

                console.log('Updated cart item:', state.items[itemIndex]);

                // Update item total immediately
                state.pricing.itemTotal = state.items.reduce((total, item) => total + item.totalPrice, 0);

                // Save to localStorage
                cartService.saveCart(state.items, state.restaurantId);
            }
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);

            // Clear restaurant if no items
            if (state.items.length === 0) {
                state.restaurantId = null;
                state.restaurantAddress = null;
                cartService.clearCart();
            } else {
                // Save to localStorage
                cartService.saveCart(state.items, state.restaurantId);
            }

            // Update item total immediately
            state.pricing.itemTotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
        },

        clearCart: (state) => {
            state.items = [];
            state.restaurantId = null;
            state.restaurantAddress = null;
            state.coupon = null;
            state.pricing = {
                itemTotal: 0,
                deliveryFee: 0,
                taxes: 0,
                discount: 0,
                total: 0
            };
            cartService.clearCart();
        },

        setDeliveryAddress: (state, action: PayloadAction<Address>) => {
            state.deliveryAddress = action.payload;
            // Pricing will be recalculated via async thunk
        },

        applyCoupon: (state, action: PayloadAction<any>) => {
            state.coupon = action.payload;
            // Pricing will be recalculated via async thunk
        },

        removeCoupon: (state) => {
            state.coupon = null;
            // Pricing will be recalculated via async thunk
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(recalculateCartPricing.fulfilled, (state, action) => {
                state.pricing = action.payload;
            })
            .addCase(setRestaurantInfo.fulfilled, (state, action) => {
                state.restaurantAddress = action.payload.restaurantAddress;
                state.pricing = action.payload.pricing;
            });
    }
});

export const {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    setDeliveryAddress,
    applyCoupon,
    removeCoupon,
    setLoading,
    setError
} = cartSlice.actions;

export default cartSlice.reducer;
