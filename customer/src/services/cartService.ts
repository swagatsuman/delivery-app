import type { CartItem, MenuItem, SelectedCustomization } from '../types';

class CartService {
    private STORAGE_KEY = 'cart_data';

    saveCart(items: CartItem[], restaurantId: string | null): void {
        const cartData = {
            items,
            restaurantId,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartData));
            console.log('Cart saved to localStorage:', cartData);
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    loadCart(): { items: CartItem[]; restaurantId: string | null } {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                console.log('No cart found in localStorage');
                return { items: [], restaurantId: null };
            }

            const cartData = JSON.parse(stored);

            // Check if cart is older than 24 hours
            const isExpired = Date.now() - cartData.timestamp > 24 * 60 * 60 * 1000;
            if (isExpired) {
                console.log('Cart expired, clearing...');
                this.clearCart();
                return { items: [], restaurantId: null };
            }

            console.log('Cart loaded from localStorage:', cartData);
            return {
                items: cartData.items || [],
                restaurantId: cartData.restaurantId || null
            };
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            this.clearCart();
            return { items: [], restaurantId: null };
        }
    }

    clearCart(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Cart cleared from localStorage');
        } catch (error) {
            console.error('Error clearing cart from localStorage:', error);
        }
    }

    calculateItemPrice(menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[]): number {
        // Convert price to number in case it comes from database as string
        let basePrice = typeof menuItem.price === 'string' ? parseFloat(menuItem.price) : menuItem.price;

        // Handle discount price if available
        if (menuItem.discountPrice) {
            const discountPrice = typeof menuItem.discountPrice === 'string' ? parseFloat(menuItem.discountPrice) : menuItem.discountPrice;
            if (discountPrice < basePrice) {
                basePrice = discountPrice;
            }
        }

        // Ensure basePrice is a valid number
        if (isNaN(basePrice) || basePrice < 0) {
            console.error(`Invalid price for ${menuItem.name}:`, menuItem.price);
            basePrice = 0;
        }

        let customizationPrice = 0;

        customizations.forEach(customization => {
            customization.selectedOptions.forEach(option => {
                const optionPrice = typeof option.price === 'string' ? parseFloat(option.price) : option.price;
                customizationPrice += optionPrice || 0;
            });
        });

        const totalPrice = (basePrice + customizationPrice) * quantity;

        console.log(`CartService - Calculating price for ${menuItem.name}:`, {
            originalPrice: menuItem.price,
            parsedBasePrice: basePrice,
            customizationPrice,
            quantity,
            totalPrice
        });

        return totalPrice;
    }

    // Validate cart data structure
    validateCartItem(item: any): item is CartItem {
        return (
            item &&
            typeof item.id === 'string' &&
            item.menuItem &&
            typeof item.menuItem.id === 'string' &&
            typeof item.menuItem.name === 'string' &&
            typeof item.menuItem.price === 'number' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0 &&
            Array.isArray(item.customizations) &&
            typeof item.totalPrice === 'number'
        );
    }

    // Clean up invalid cart items
    cleanupCart(items: any[]): CartItem[] {
        if (!Array.isArray(items)) {
            console.warn('Cart items is not an array, returning empty cart');
            return [];
        }

        const validItems = items.filter(item => this.validateCartItem(item));

        if (validItems.length !== items.length) {
            console.warn(`Removed ${items.length - validItems.length} invalid cart items`);
        }

        return validItems;
    }
}

export const cartService = new CartService();
