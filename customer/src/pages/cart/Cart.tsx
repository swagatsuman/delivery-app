import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CartItem } from '../../components/features/cart/CartItem';
import { BillDetails } from '../../components/features/cart/BillDetails';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { updateCartItem, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { useCart } from '../../hooks/useCart';

const Cart: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items, restaurantId, deliveryAddress, pricing } = useAppSelector(state => state.cart);
    const { restaurants } = useAppSelector(state => state.restaurant);
    const { getTotalItems, getTotalAmount } = useCart();

    const restaurant = restaurants.find(r => r.id === restaurantId);
    const totalItems = getTotalItems();
    const totalAmount = getTotalAmount();

    const handleBack = () => {
        navigate(-1);
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity === 0) {
            dispatch(removeFromCart(itemId));
        } else {
            dispatch(updateCartItem({ itemId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (itemId: string) => {
        dispatch(removeFromCart(itemId));
    };

    const handleClearCart = () => {
        dispatch(clearCart());
        navigate('/home');
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleChangeAddress = () => {
        navigate('/addresses', { state: { from: 'cart' } });
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-surface border-b border-secondary-200">
                    <div className="flex items-center p-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-secondary-100 rounded-full mr-3"
                        >
                            <ArrowLeft className="h-6 w-6 text-secondary-700" />
                        </button>
                        <h1 className="text-lg font-semibold text-secondary-900">Cart</h1>
                    </div>
                </div>

                {/* Empty Cart */}
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="text-8xl mb-6">🛒</div>
                        <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                            Your cart is empty
                        </h2>
                        <p className="text-secondary-600 mb-8">
                            Looks like you haven't added anything to your cart yet
                        </p>
                        <Button
                            onClick={() => navigate('/home')}
                            className="px-8"
                        >
                            Start Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-surface border-b border-secondary-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-secondary-100 rounded-full mr-3"
                        >
                            <ArrowLeft className="h-6 w-6 text-secondary-700" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-secondary-900">Cart</h1>
                            <p className="text-sm text-secondary-600">
                                {totalItems} item{totalItems > 1 ? 's' : ''} from {restaurant?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="p-2 hover:bg-secondary-100 rounded-full"
                    >
                        <Trash2 className="h-5 w-5 text-error-600" />
                    </button>
                </div>
            </div>

            {/* Main Content - with proper padding bottom for checkout button */}
            <div className="pb-4">
                {/* Restaurant Info */}
                {restaurant && (
                    <div className="bg-surface border-b border-secondary-200 p-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src={restaurant.images[0]}
                                alt={restaurant.name}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f3f4f6'/%3E%3Ctext x='24' y='24' font-family='Arial, sans-serif' font-size='20' fill='%23d1d5db' text-anchor='middle' dominant-baseline='middle'%3E🏪%3C/text%3E%3C/svg%3E";
                                }}
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-secondary-900">{restaurant.name}</h3>
                                <p className="text-sm text-secondary-600 break-words">
                                    {restaurant.address.address}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delivery Address */}
                <div className="bg-surface border-b border-secondary-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-secondary-900 mb-2">
                                Deliver to
                            </h3>
                            {deliveryAddress ? (
                                <div>
                                    <p className="font-medium text-secondary-900 mb-1">
                                        {deliveryAddress.label} {deliveryAddress.name && `• ${deliveryAddress.name}`}
                                    </p>
                                    <p className="text-sm text-secondary-600 break-words leading-relaxed">
                                        {deliveryAddress.address}
                                    </p>
                                    <p className="text-sm text-secondary-600 mt-1">
                                        {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-error-600">
                                    Please select a delivery address
                                </p>
                            )}
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleChangeAddress}
                            className="flex-shrink-0"
                        >
                            Change
                        </Button>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="bg-surface">
                    <div className="divide-y divide-secondary-100">
                        {items.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>
                </div>

                {/* Bill Details */}
                <div className="bg-surface border-t border-secondary-200">
                    <BillDetails pricing={pricing} />
                </div>
            </div>

            {/* Fixed Checkout Button */}
            <div className="px-2 mb-2">
                <Button
                    onClick={handleCheckout}
                    className="w-full h-12 text-lg"
                    disabled={!deliveryAddress}
                >
                    <div className="flex items-center justify-between w-full">
                        <span>Proceed to Checkout</span>
                        <span>₹{totalAmount}</span>
                    </div>
                </Button>
                {!deliveryAddress && (
                    <p className="text-sm text-error-600 text-center mt-2">
                        Please select a delivery address to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default Cart;
