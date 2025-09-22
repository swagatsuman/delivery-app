import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartState, CartItem, MenuItem, Address, CartPricing, SelectedCustomization } from '../../types';
import { generateId } from '../../utils/helpers';
import { parsePrice, getFinalPrice } from '../../utils/priceUtils';
import { cartService } from '../../services/cartService';

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
    error: null
};

// Helper function to calculate pricing
const calculatePricing = (items: CartItem[], deliveryFee: number = 30): CartPricing => {
    console.log('Calculating pricing for items:', items);

    const itemTotal = items.reduce((total, item) => {
        console.log(`Item: ${item.menuItem.name}, Quantity: ${item.quantity}, Total Price: ${item.totalPrice}`);
        return total + item.totalPrice;
    }, 0);

    console.log('Item total:', itemTotal);

    const taxes = Math.round(itemTotal * 0.05); // 5% tax
    const discount = 0; // Apply coupon discounts here
    const actualDeliveryFee = itemTotal >= 299 ? 0 : deliveryFee; // Free delivery above 299
    const total = itemTotal + actualDeliveryFee + taxes - discount;

    const pricing = {
        itemTotal,
        deliveryFee: actualDeliveryFee,
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

            // Recalculate pricing
            state.pricing = calculatePricing(state.items);

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

                // Recalculate pricing
                state.pricing = calculatePricing(state.items);

                // Save to localStorage
                cartService.saveCart(state.items, state.restaurantId);
            }
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);

            // Clear restaurant if no items
            if (state.items.length === 0) {
                state.restaurantId = null;
                cartService.clearCart();
            } else {
                // Save to localStorage
                cartService.saveCart(state.items, state.restaurantId);
            }

            // Recalculate pricing
            state.pricing = calculatePricing(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            state.restaurantId = null;
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
            // Recalculate pricing with updated delivery fee if needed
            state.pricing = calculatePricing(state.items);
        },

        applyCoupon: (state, action: PayloadAction<any>) => {
            state.coupon = action.payload;
            // Recalculate pricing with coupon discount
            state.pricing = calculatePricing(state.items);
        },

        removeCoupon: (state) => {
            state.coupon = null;
            // Recalculate pricing without coupon
            state.pricing = calculatePricing(state.items);
        },

        // Add action to recalculate pricing manually
        recalculatePricing: (state) => {
            state.pricing = calculatePricing(state.items);
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
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
    recalculatePricing,
    setLoading,
    setError
} = cartSlice.actions;

export default cartSlice.reducer;
