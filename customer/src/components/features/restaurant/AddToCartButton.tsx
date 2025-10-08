import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { addToCart, updateCartItem, removeFromCart, recalculateCartPricing } from '../../../store/slices/cartSlice';
import type { MenuItem, SelectedCustomization } from '../../../types';

interface AddToCartButtonProps {
    menuItem: MenuItem;
    restaurantId: string;
    customizations?: SelectedCustomization[];
    specialInstructions?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
                                                                    menuItem,
                                                                    restaurantId,
                                                                    customizations = [],
                                                                    specialInstructions
                                                                }) => {
    const dispatch = useAppDispatch();
    const { items, restaurantId: cartRestaurantId } = useAppSelector(state => state.cart);

    // Find current quantity in cart
    const cartItem = items.find(item =>
        item.menuItem.id === menuItem.id &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations) &&
        item.specialInstructions === specialInstructions
    );

    const currentQuantity = cartItem?.quantity || 0;
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = async () => {
        if (!menuItem.isAvailable) return;

        // Check if adding from different restaurant
        if (cartRestaurantId && cartRestaurantId !== restaurantId) {
            // Show confirmation dialog or clear cart
            if (!confirm('Adding items from a different restaurant will clear your current cart. Continue?')) {
                return;
            }
        }

        setIsLoading(true);
        try {
            dispatch(addToCart({
                menuItem,
                quantity: 1,
                customizations,
                specialInstructions,
                restaurantId
            }));
            // Recalculate pricing after adding to cart
            dispatch(recalculateCartPricing());
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateQuantity = (newQuantity: number) => {
        if (!cartItem) return;

        if (newQuantity === 0) {
            dispatch(removeFromCart(cartItem.id));
        } else {
            dispatch(updateCartItem({
                itemId: cartItem.id,
                quantity: newQuantity
            }));
        }
        // Recalculate pricing after quantity update
        dispatch(recalculateCartPricing());
    };

    if (currentQuantity === 0) {
        return (
            <Button
                onClick={handleAddToCart}
                disabled={!menuItem.isAvailable || isLoading}
                loading={isLoading}
                size="sm"
                className="bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
            >
                ADD
            </Button>
        );
    }

    return (
        <div className="flex items-center bg-white border-2 border-primary-500 rounded-lg">
            <button
                onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                className="p-1 text-primary-600 hover:bg-primary-50"
            >
                <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-primary-600 min-w-[2rem] text-center">
        {currentQuantity}
      </span>
            <button
                onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                className="p-1 text-primary-600 hover:bg-primary-50"
            >
                <Plus className="h-3 w-3" />
            </button>
        </div>
    );
};
