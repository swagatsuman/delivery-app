import React, { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import type { CartPricing } from '../../../types';
import { settingsService, type DeliverySettings } from '../../../services/settingsService';
import { useAppSelector } from '../../../hooks/useAppDispatch';
import { calculateDistance } from '../../../utils/helpers';

interface BillDetailsProps {
    pricing: CartPricing;
}

export const BillDetails: React.FC<BillDetailsProps> = ({ pricing }) => {
    const [settings, setSettings] = useState<DeliverySettings | null>(null);
    const { deliveryAddress, restaurantAddress } = useAppSelector(state => state.cart);

    useEffect(() => {
        settingsService.getDeliverySettings().then(setSettings);
    }, []);

    if (!settings) {
        // Loading settings, show basic view
        return (
            <div className="p-4 border-t border-secondary-200">
                <div className="flex items-center space-x-2 mb-4">
                    <Receipt className="h-5 w-5 text-secondary-600" />
                    <h3 className="font-semibold text-secondary-900">Bill Details</h3>
                </div>
                {/* Basic pricing info */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-secondary-600">Item Total</span>
                        <span className="text-secondary-900">₹{pricing.itemTotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-secondary-600">Delivery Fee</span>
                        <span className={`${pricing.deliveryFee === 0 ? 'text-success-600' : 'text-secondary-900'}`}>
                            {pricing.deliveryFee === 0 ? 'Free' : `₹${pricing.deliveryFee}`}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-secondary-600">Taxes & Charges</span>
                        <span className="text-secondary-900">₹{pricing.taxes}</span>
                    </div>
                    <div className="border-t border-secondary-200 pt-3">
                        <div className="flex justify-between font-semibold text-lg">
                            <span className="text-secondary-900">Total</span>
                            <span className="text-secondary-900">₹{pricing.total}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate distance
    let distance = 0;
    if (deliveryAddress?.coordinates && restaurantAddress?.coordinates) {
        distance = calculateDistance(
            restaurantAddress.coordinates.lat,
            restaurantAddress.coordinates.lng,
            deliveryAddress.coordinates.lat,
            deliveryAddress.coordinates.lng
        );
    }

    const isLongDistance = distance > settings.longDistanceThreshold;
    const meetsMinimumOrder = pricing.itemTotal >= settings.minimumOrderValue;
    return (
        <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center space-x-2 mb-4">
                <Receipt className="h-5 w-5 text-secondary-600" />
                <h3 className="font-semibold text-secondary-900">Bill Details</h3>
            </div>

            <div className="space-y-3">
                {/* Item Total */}
                <div className="flex justify-between">
                    <span className="text-secondary-600">Item Total</span>
                    <span className="text-secondary-900">₹{pricing.itemTotal}</span>
                </div>

                {/* Delivery Fee */}
                <div className="flex justify-between">
                    <span className="text-secondary-600">Delivery Fee</span>
                    <span className={`${pricing.deliveryFee === 0 ? 'text-success-600' : 'text-secondary-900'}`}>
            {pricing.deliveryFee === 0 ? 'Free' : `₹${pricing.deliveryFee}`}
          </span>
                </div>

                {/* Taxes */}
                <div className="flex justify-between">
                    <span className="text-secondary-600">Taxes & Charges</span>
                    <span className="text-secondary-900">₹{pricing.taxes}</span>
                </div>

                {/* Discount */}
                {pricing.discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-secondary-600">Discount</span>
                        <span className="text-success-600">-₹{pricing.discount}</span>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-secondary-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                        <span className="text-secondary-900">Total</span>
                        <span className="text-secondary-900">₹{pricing.total}</span>
                    </div>
                </div>

                {/* Free Delivery Message */}
                {pricing.deliveryFee === 0 && meetsMinimumOrder && !isLongDistance && (
                    <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                        <p className="text-sm text-success-800">
                            🎉 You're getting FREE delivery! You're saving ₹{settings.deliveryFeePerOrder}
                        </p>
                    </div>
                )}

                {/* Almost Free Delivery Message */}
                {pricing.deliveryFee > 0 && !meetsMinimumOrder && !isLongDistance && pricing.itemTotal > 0 && (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                        <p className="text-sm text-warning-800">
                            Add items worth ₹{Math.ceil(settings.minimumOrderValue - pricing.itemTotal)} more to get free delivery
                        </p>
                    </div>
                )}

                {/* Long Distance Message */}
                {isLongDistance && distance > 0 && (
                    <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                        <p className="text-sm text-info-800">
                            ⚡ Long distance delivery ({distance.toFixed(1)}km) - Special delivery fee applies
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
