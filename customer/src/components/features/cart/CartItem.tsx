import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../../types';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
                                                      item,
                                                      onUpdateQuantity,
                                                      onRemove
                                                  }) => {
    const getFoodTypeIcon = (type: string) => {
        switch (type) {
            case 'veg': return '🟢';
            case 'non-veg': return '🔴';
            case 'egg': return '🟡';
            default: return '⚪';
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-start space-x-3">
                {/* Food Type Icon */}
                <span className="text-lg mt-1">
          {getFoodTypeIcon(item.menuItem.type)}
        </span>

                {/* Item Details */}
                <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 mb-1">
                        {item.menuItem.name}
                    </h3>

                    {/* Customizations */}
                    {item.customizations.length > 0 && (
                        <div className="mb-2">
                            {item.customizations.map((customization, index) => (
                                <div key={index} className="text-sm text-secondary-600">
                                    <span className="font-medium">{customization.name}:</span>{' '}
                                    {customization.selectedOptions.map(option => option.name).join(', ')}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                        <p className="text-sm text-secondary-600 mb-2">
                            <span className="font-medium">Note:</span> {item.specialInstructions}
                        </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
            <span className="font-semibold text-secondary-900">
              ₹{item.totalPrice}
            </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                            {/* Remove Button */}
                            <button
                                onClick={() => onRemove(item.id)}
                                className="p-1 text-error-600 hover:bg-error-50 rounded"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-secondary-300 rounded-lg">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    className="p-2 text-primary-600 hover:bg-primary-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-2 text-sm font-semibold text-secondary-900">
                  {item.quantity}
                </span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="p-2 text-primary-600 hover:bg-primary-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
