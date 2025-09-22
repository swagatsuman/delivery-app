import type { CartItem, MenuItem, SelectedCustomization } from '../types';

class CartService {
    private STORAGE_KEY = 'cart_data';

    saveCart(items: CartItem[], restaurantId: string | null): void {
        const cartData = {
            items,
            restaurantId,
            timestamp: Date.now()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartData));
    }

    loadCart(): { items: CartItem[]; restaurantId: string | null } {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return { items: [], restaurantId: null };

            const cartData = JSON.parse(stored);

            // Check if cart is older than 24 hours
            const isExpired = Date.now() - cartData.timestamp > 24 * 60 * 60 * 1000;
            if (isExpired) {
                this.clearCart();
                return { items: [], restaurantId: null };
            }

            return {
                items: cartData.items || [],
                restaurantId: cartData.restaurantId || null
            };
        } catch (error) {
            this.clearCart();
            return { items: [], restaurantId: null };
        }
    }

    clearCart(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    calculateItemPrice(menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[]): number {
        let basePrice = menuItem.discountPrice || menuItem.price;
        let customizationPrice = 0;

        customizations.forEach(customization => {
            customization.selectedOptions.forEach(option => {
                customizationPrice += option.price;
            });
        });

        return (basePrice + customizationPrice) * quantity;
    }
}

export const cartService = new CartService();
