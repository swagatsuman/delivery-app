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

    const getFoodTypeColor = (type: string) => {
        switch (type) {
            case 'veg': return 'text-green-600';
            case 'non-veg': return 'text-red-600';
            case 'egg': return 'text-yellow-600';
            default: return 'text-secondary-600';
        }
    };

    const getFoodTypeIcon = (type: string) => {
        switch (type) {
            case 'veg': return '🟢';
            case 'non-veg': return '🔴';
            case 'egg': return '🟡';
            default: return '⚪';
        }
    };

    return (
        <div className="flex p-4 border-b border-secondary-100 last:border-b-0">
            {/* Item Details */}
            <div className="flex-1 pr-4">
                {/* Type & Rating */}
                <div className="flex items-center space-x-2 mb-2">
          <span className={`text-lg ${getFoodTypeColor(item.type)}`}>
            {getFoodTypeIcon(item.type)}
          </span>
                    {item.isRecommended && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
              ⭐ Bestseller
            </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="font-semibold text-secondary-900 mb-1">
                    {item.name}
                </h3>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-2">
          <span className="font-semibold text-secondary-900">
            ₹{item.price}
          </span>
                    {item.discountPrice && (
                        <span className="text-sm text-secondary-500 line-through">
              ₹{item.discountPrice}
            </span>
                    )}
                </div>

                {/* Rating */}
                {item.rating > 0 && (
                    <div className="flex items-center space-x-1 mb-2">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-secondary-600">
              {item.rating.toFixed(1)} ({item.totalRatings})
            </span>
                    </div>
                )}

                {/* Description */}
                <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                    {item.description}
                </p>

                {/* Availability */}
                {!item.isAvailable && (
                    <p className="text-sm text-error-600 font-medium">
                        Currently unavailable
                    </p>
                )}
            </div>

            {/* Item Image & Add Button */}
            <div className="relative">
                {item.images.length > 0 && (
                    <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                    />
                )}

                {/* Add to Cart Button */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    {currentQuantity === 0 ? (
                        <Button
                            size="sm"
                            onClick={handleAddToCart}
                            disabled={!item.isAvailable}
                            className="h-8 px-4 text-xs bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 shadow-lg"
                        >
                            ADD
                        </Button>
                    ) : (
                        <div className="flex items-center bg-white border-2 border-primary-500 rounded-lg shadow-lg">
                            <button
                                onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                                className="p-1 text-primary-600 hover:bg-primary-50"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-sm font-semibold text-primary-600">
                {currentQuantity}
              </span>
                            <button
                                onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                                className="p-1 text-primary-600 hover:bg-primary-50"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
