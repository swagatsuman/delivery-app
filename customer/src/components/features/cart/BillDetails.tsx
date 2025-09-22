import React from 'react';
import { Receipt } from 'lucide-react';
import type { CartPricing } from '../../../types';

interface BillDetailsProps {
    pricing: CartPricing;
}

export const BillDetails: React.FC<BillDetailsProps> = ({ pricing }) => {
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
                {pricing.deliveryFee === 0 && pricing.itemTotal >= 299 && (
                    <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                        <p className="text-sm text-success-800">
                            🎉 You're saving ₹30 on delivery!
                        </p>
                    </div>
                )}

                {/* Almost Free Delivery Message */}
                {pricing.deliveryFee > 0 && pricing.itemTotal < 299 && (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                        <p className="text-sm text-warning-800">
                            Add items worth ₹{299 - pricing.itemTotal} more to get free delivery
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
