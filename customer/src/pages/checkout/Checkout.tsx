import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Wallet, DollarSign } from 'lucide-react';
import { TopHeader } from '../../components/layout/TopHeader';
import { Button } from '../../components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import type { PaymentMethod } from '../../types';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items, pricing, deliveryAddress, restaurantId } = useAppSelector(state => state.cart);
    const { restaurants } = useAppSelector(state => state.restaurant);
    const { user } = useAppSelector(state => state.auth);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const restaurant = restaurants.find(r => r.id === restaurantId);

    const paymentMethods = [
        { id: 'cash', label: 'Cash on Delivery', icon: DollarSign, available: true },
        { id: 'upi', label: 'UPI', icon: Smartphone, available: true },
        { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, available: true },
        { id: 'wallet', label: 'Wallet', icon: Wallet, available: false }
    ];

    useEffect(() => {
        if (!deliveryAddress || items.length === 0) {
            navigate('/cart');
        }
    }, [deliveryAddress, items, navigate]);

    const handlePlaceOrder = async () => {
        if (!restaurant || !deliveryAddress || !user) return;

        setIsPlacingOrder(true);
        try {
            const orderData = {
                restaurantId: restaurant.id,
                items,
                pricing,
                deliveryAddress,
                paymentMethod: selectedPaymentMethod,
                specialInstructions: specialInstructions.trim() || undefined,
                estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
            };

            const order = await dispatch(createOrder(orderData)).unwrap();
            dispatch(clearCart());

            // Navigate to order tracking
            navigate(`/order-tracking/${order.id}`, { replace: true });
        } catch (error) {
            console.error('Failed to place order:', error);
            // Show error toast
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (!restaurant || !deliveryAddress) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <TopHeader title="Checkout" />

            <div className="p-4 space-y-6 pb-32">
                {/* Delivery Address */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Delivery Address</h3>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="font-medium text-secondary-900">
                                {deliveryAddress.label} {deliveryAddress.name && `• ${deliveryAddress.name}`}
                            </p>
                            <p className="text-sm text-secondary-600 mt-1">
                                {deliveryAddress.address}
                            </p>
                            <p className="text-sm text-secondary-600">
                                {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/addresses', { state: { from: 'checkout' } })}
                        >
                            Change
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Order Summary</h3>

                    {/* Restaurant */}
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={restaurant.images[0]}
                            alt={restaurant.name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                            <h4 className="font-medium text-secondary-900">{restaurant.name}</h4>
                            <p className="text-sm text-secondary-600">{restaurant.deliveryTime}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-secondary-900">{item.menuItem.name}</p>
                                    {item.customizations.length > 0 && (
                                        <p className="text-sm text-secondary-600">
                                            {item.customizations.map(c => c.selectedOptions.map(o => o.name).join(', ')).join(', ')}
                                        </p>
                                    )}
                                    <p className="text-sm text-secondary-600">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-medium text-secondary-900">₹{item.totalPrice}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-secondary-200 pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Item Total</span>
                            <span className="text-secondary-900">₹{pricing.itemTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Delivery Fee</span>
                            <span className={pricing.deliveryFee === 0 ? 'text-success-600' : 'text-secondary-900'}>
                {pricing.deliveryFee === 0 ? 'Free' : `₹${pricing.deliveryFee}`}
              </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Taxes & Charges</span>
                            <span className="text-secondary-900">₹{pricing.taxes}</span>
                        </div>
                        {pricing.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-secondary-600">Discount</span>
                                <span className="text-success-600">-₹{pricing.discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg border-t border-secondary-200 pt-2">
                            <span className="text-secondary-900">Total</span>
                            <span className="text-secondary-900">₹{pricing.total}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => method.available && setSelectedPaymentMethod(method.id as PaymentMethod)}
                                disabled={!method.available}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                    selectedPaymentMethod === method.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : method.available
                                            ? 'border-secondary-200 hover:border-secondary-300'
                                            : 'border-secondary-200 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <method.icon className="h-5 w-5 text-secondary-600" />
                                    <span className="font-medium text-secondary-900">{method.label}</span>
                                    {!method.available && (
                                        <span className="text-xs text-secondary-500">(Coming Soon)</span>
                                    )}
                                </div>
                                {selectedPaymentMethod === method.id && (
                                    <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Special Instructions */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Special Instructions</h3>
                    <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any special requests for the restaurant..."
                        className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        rows={3}
                        maxLength={200}
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                        {specialInstructions.length}/200 characters
                    </p>
                </div>
            </div>

            {/* Place Order Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-secondary-200 p-4">
                <Button
                    onClick={handlePlaceOrder}
                    className="w-full h-12 text-lg"
                    loading={isPlacingOrder}
                    disabled={isPlacingOrder}
                >
                    <div className="flex items-center justify-between w-full">
                        <span>Place Order</span>
                        <span>₹{pricing.total}</span>
                    </div>
                </Button>
            </div>
        </div>
    );
};

export default Checkout;
