import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { Address, Restaurant } from '../../../types';

interface CartSummaryProps {
    restaurant: Restaurant;
    deliveryAddress: Address;
    estimatedTime: string;
    onCheckout: () => void;
    total: number;
    loading?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
                                                            restaurant,
                                                            deliveryAddress,
                                                            estimatedTime,
                                                            onCheckout,
                                                            total,
                                                            loading = false
                                                        }) => {
    return (
        <div className="bg-surface border-t border-secondary-200 p-4 space-y-4">
            {/* Delivery Info */}
            <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">
                        Delivering to {deliveryAddress.label}
                    </p>
                    <p className="text-xs text-secondary-600">
                        {deliveryAddress.address}
                    </p>
                </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-secondary-500" />
                <p className="text-sm text-secondary-700">
                    Estimated delivery: <span className="font-medium">{estimatedTime}</span>
                </p>
            </div>

            {/* Checkout Button */}
            <Button
                onClick={onCheckout}
                className="w-full h-12 text-lg"
                loading={loading}
            >
                <div className="flex items-center justify-between w-full">
                    <span>Proceed to Pay</span>
                    <span>₹{total}</span>
                </div>
            </Button>
        </div>
    );
};
