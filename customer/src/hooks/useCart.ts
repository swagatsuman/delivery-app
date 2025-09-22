import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { recalculatePricing } from '../store/slices/cartSlice';
import { useEffect } from 'react';

export const useCart = () => {
    const dispatch = useAppDispatch();
    const { items, pricing, restaurantId } = useAppSelector(state => state.cart);

    // Ensure pricing is recalculated on component mount
    useEffect(() => {
        if (items.length > 0) {
            dispatch(recalculatePricing());
        }
    }, []);

    const getTotalItems = (): number => {
        const total = items.reduce((total, item) => total + item.quantity, 0);
        console.log('Total items in cart:', total);
        return total;
    };

    const getTotalAmount = (): number => {
        // Use the pricing from Redux state, which should be calculated correctly
        const total = pricing.total;
        console.log('Total amount from pricing:', total);

        // Double-check by calculating manually
        const manualTotal = items.reduce((total, item) => {
            console.log(`Manual calc - Item: ${item.menuItem.name}, Quantity: ${item.quantity}, Item Total: ${item.totalPrice}`);
            return total + item.totalPrice;
        }, 0);
        console.log('Manual total calculation:', manualTotal);

        // If there's a discrepancy, log it
        if (Math.abs(pricing.itemTotal - manualTotal) > 0.01) {
            console.error('Pricing discrepancy detected!', {
                reduxItemTotal: pricing.itemTotal,
                manualTotal,
                difference: pricing.itemTotal - manualTotal
            });
        }

        return total;
    };

    const getItemQuantity = (menuItemId: string, customizations: any[] = []): number => {
        const item = items.find(item =>
            item.menuItem.id === menuItemId &&
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );
        const quantity = item?.quantity || 0;
        console.log(`Getting quantity for item ${menuItemId}:`, quantity);
        return quantity;
    };

    const isCartEmpty = (): boolean => {
        const isEmpty = items.length === 0;
        console.log('Is cart empty:', isEmpty);
        return isEmpty;
    };

    const canAddItemFromRestaurant = (newRestaurantId: string): boolean => {
        const canAdd = !restaurantId || restaurantId === newRestaurantId;
        console.log('Can add item from restaurant:', { restaurantId, newRestaurantId, canAdd });
        return canAdd;
    };

    // Debug function to log cart state
    const debugCart = () => {
        console.log('=== CART DEBUG ===');
        console.log('Items:', items);
        console.log('Pricing:', pricing);
        console.log('Restaurant ID:', restaurantId);
        console.log('Total Items:', getTotalItems());
        console.log('Total Amount:', getTotalAmount());
        console.log('==================');
    };

    return {
        items,
        pricing,
        restaurantId,
        getTotalItems,
        getTotalAmount,
        getItemQuantity,
        isCartEmpty,
        canAddItemFromRestaurant,
        debugCart // For debugging purposes
    };
};
