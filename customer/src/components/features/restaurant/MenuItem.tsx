import React, { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { addToCart, updateCartItem, removeFromCart } from '../../../store/slices/cartSlice';
import type { MenuItem as MenuItemType } from '../../../types';

interface MenuItemProps {
    item: MenuItemType;
    restaurantId: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, restaurantId }) => {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(state => state.cart.items);
    const cartRestaurantId = useAppSelector(state => state.cart.restaurantId);

    // Find current quantity in cart
    const cartItem = cartItems.find(cartItem => cartItem.menuItem.id === item.id);
    const currentQuantity = cartItem?.quantity || 0;

    const handleAddToCart = () => {
        // Check if adding from different restaurant
        if (cartRestaurantId && cartRestaurantId !== restaurantId) {
            if (!confirm('Adding items from a different restaurant will clear your current cart. Continue?')) {
                return;
            }
        }

        dispatch(addToCart({
            menuItem: item,
            quantity: 1,
            customizations: [],
            restaurantId
        }));
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
    };

    const getFoodTypeIcon = (type: string) => {
        switch (type) {
            case 'veg':
                return '🟢';
            case 'non-veg':
                return '🔴';
            case 'egg':
                return '🟡';
            default:
                return '⚪';
        }
    };

    // Placeholder image for when no image is available
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial, sans-serif' font-size='30' fill='%23d1d5db' text-anchor='middle' dominant-baseline='middle'%3E🍽️%3C/text%3E%3C/svg%3E";

    return (
        <div className="flex p-4 border-b border-secondary-100 last:border-b-0 gap-3">
            {/* Item Image */}
            <div className="flex-shrink-0">
                <img
                    src={item.images.length > 0 ? item.images[0] : placeholderImage}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-secondary-100"
                />
            </div>

            {/* Item Details */}
            <div className="flex-1 flex flex-col">
                {/* Top Row: Type, Recommended & Rating */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        {/* Food Type */}
                        <span className="text-lg">
                            {getFoodTypeIcon(item.type)}
                        </span>

                        {/* Recommended Badge */}
                        {item.isRecommended && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                Bestseller
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    {item.rating > 0 && (
                        <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-secondary-600">
                                {item.rating.toFixed(1)} ({item.totalRatings})
                            </span>
                        </div>
                    )}
                </div>

                {/* Item Name */}
                <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-1">
                    {item.name}
                </h3>

                {/* Price Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-secondary-900">
                            ₹{item.price}
                        </span>
                        {item.discountPrice && (
                            <span className="text-sm text-secondary-500 line-through">
                                ₹{item.discountPrice}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex-shrink-0">
                        {!item.isAvailable ? (
                            <div className="px-3 py-1 bg-secondary-100 text-secondary-500 text-xs rounded-lg font-medium">
                                Not available
                            </div>
                        ) : currentQuantity === 0 ? (
                            <Button
                                size="sm"
                                onClick={handleAddToCart}
                                className="h-8 px-4 text-xs bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
                            >
                                ADD
                            </Button>
                        ) : (
                            <div className="flex items-center bg-white border border-primary-500 rounded-lg shadow-sm">
                                <button
                                    onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                                    className="p-1 text-primary-600 hover:bg-primary-50 rounded-l-lg"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 text-sm font-semibold text-primary-600 min-w-[2rem] text-center">
                                    {currentQuantity}
                                </span>
                                <button
                                    onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                                    className="p-1 text-primary-600 hover:bg-primary-50 rounded-r-lg"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
