import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Clock, User, Bike, Store, Download, FileText, CheckCircle } from 'lucide-react';
import { TopHeader } from '../../components/layout/TopHeader';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setCurrentOrder } from '../../store/slices/orderSlice';
import { Loading } from '../../components/ui/Loading';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { OrderTrackingMap } from '../../components/features/order/OrderTrackingMap';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { Order, Restaurant } from '../../types';
import toast from 'react-hot-toast';

const OrderTracking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentOrder } = useAppSelector(state => state.order);
    const [loading, setLoading] = useState(true);
    const previousStatusRef = useRef<string | null>(null);

    // Real-time listener for order updates
    useEffect(() => {
        if (!id) return;

        console.log('Setting up real-time listener for order:', id);
        setLoading(true);

        const unsubscribe = onSnapshot(
            doc(db, 'orders', id),
            async (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();

                    // Helper to convert Firestore Timestamps to Dates
                    const toDate = (timestamp: any) => {
                        if (!timestamp) return undefined;
                        if (timestamp instanceof Date) return timestamp;
                        if (timestamp.toDate) return timestamp.toDate();
                        return new Date(timestamp);
                    };

                    // Fetch restaurant details if not in order or if missing name
                    let restaurantData = data.restaurant;
                    if ((!restaurantData || !restaurantData.name) && data.restaurantId) {
                        try {
                            const restaurantDoc = await getDoc(doc(db, 'establishments', data.restaurantId));
                            if (restaurantDoc.exists()) {
                                const restData = restaurantDoc.data();
                                restaurantData = {
                                    id: restaurantDoc.id,
                                    name: restData.businessName || restData.name || restData.restaurantName || data.restaurantName || 'Restaurant',
                                    description: restData.description || '',
                                    images: restData.images || [],
                                    cuisineTypes: restData.cuisineTypes || [],
                                    rating: restData.rating || 0,
                                    totalRatings: restData.totalRatings || 0,
                                    deliveryTime: restData.deliveryTime || '30-40 mins',
                                    deliveryFee: restData.deliveryFee || 30,
                                    minimumOrder: restData.minimumOrder || 0,
                                    address: restData.address || {},
                                    isOpen: true,
                                    featured: false
                                } as Restaurant;
                            }
                        } catch (error) {
                            console.error('Error fetching restaurant:', error);
                        }
                    }

                    // If still no restaurant data, use restaurantName from order
                    if (!restaurantData && data.restaurantName) {
                        restaurantData = {
                            id: data.restaurantId || '',
                            name: data.restaurantName,
                            description: '',
                            images: [],
                            cuisineTypes: [],
                            rating: 0,
                            totalRatings: 0,
                            deliveryTime: '30-40 mins',
                            deliveryFee: 0,
                            minimumOrder: 0,
                            address: data.restaurantAddress || {},
                            isOpen: true,
                            featured: false
                        } as Restaurant;
                    }

                    const order: Order = {
                        id: docSnapshot.id,
                        ...data,
                        restaurant: restaurantData,
                        createdAt: toDate(data.createdAt) || new Date(),
                        updatedAt: toDate(data.updatedAt) || new Date(),
                        estimatedDeliveryTime: toDate(data.estimatedDeliveryTime) || new Date(),
                        actualDeliveryTime: toDate(data.actualDeliveryTime)
                    } as Order;

                    console.log('Order data loaded:', {
                        hasRestaurant: !!order.restaurant,
                        hasRestaurantAddress: !!order.restaurant?.address,
                        hasRestaurantCoordinates: !!order.restaurant?.address?.coordinates,
                        hasDeliveryAddress: !!order.deliveryAddress,
                        hasDeliveryCoordinates: !!order.deliveryAddress?.coordinates
                    });

                    // Update Redux store
                    dispatch(setCurrentOrder(order));

                    // Show notification if status changed
                    if (previousStatusRef.current && previousStatusRef.current !== order.status) {
                        const statusMessages: { [key: string]: string } = {
                            'confirmed': '✅ Your order has been confirmed!',
                            'preparing': '👨‍🍳 Restaurant is preparing your food',
                            'ready': '✅ Food is ready for pickup!',
                            'picked_up': '🛵 Delivery partner picked up your order',
                            'on_the_way': '🚀 Your order is on the way!',
                            'delivered': '🎉 Order delivered! Enjoy your meal!'
                        };

                        const message = statusMessages[order.status] || 'Order status updated';
                        toast.success(message, { duration: 4000 });
                    }

                    previousStatusRef.current = order.status;
                    setLoading(false);
                } else {
                    console.error('Order not found');
                    toast.error('Order not found');
                    navigate('/orders');
                }
            },
            (error) => {
                console.error('Error listening to order updates:', error);
                toast.error('Failed to load order details');
                setLoading(false);
            }
        );

        return () => {
            console.log('Cleaning up order listener');
            unsubscribe();
        };
    }, [id, dispatch, navigate]);

    if (loading || !currentOrder) {
        return <Loading fullScreen />;
    }

    // Restaurant status flow (order preparation)
    const getRestaurantStatusStep = (status: string) => {
        const steps = ['placed', 'confirmed', 'preparing', 'ready'];
        const index = steps.indexOf(status);

        // If status has progressed beyond restaurant preparation (picked_up, on_the_way, delivered)
        // then restaurant preparation is complete (all 4 steps done)
        if (index === -1 && ['picked_up', 'on_the_way', 'delivered'].includes(status)) {
            return steps.length - 1; // Return index of 'ready' (last step)
        }

        return index;
    };

    // Delivery agent status flow (separate)
    const getDeliveryStatusStep = (status: string) => {
        const steps = ['assigned', 'picked_up', 'on_the_way', 'delivered'];
        return steps.indexOf(status);
    };

    const currentRestaurantStep = getRestaurantStatusStep(currentOrder.status);
    const restaurantSteps = [
        { key: 'placed', label: 'Order Placed', time: currentOrder.createdAt },
        { key: 'confirmed', label: 'Order Confirmed', time: null },
        { key: 'preparing', label: 'Preparing Food', time: null },
        { key: 'ready', label: 'Food Ready', time: null }
    ];

    const deliveryStatus = currentOrder.deliveryStatus || null;
    const deliveryAgentId = currentOrder.deliveryAgentId || null;
    const currentDeliveryStep = deliveryStatus ? getDeliveryStatusStep(deliveryStatus) : -1;
    const deliverySteps = [
        { key: 'assigned', label: 'Agent Assigned', time: null },
        { key: 'picked_up', label: 'Order Picked Up', time: null },
        { key: 'on_the_way', label: 'On the Way', time: null },
        { key: 'delivered', label: 'Delivered', time: currentOrder.actualDeliveryTime }
    ];

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const handleCallRestaurant = () => {
        // Implement call functionality
        window.location.href = `tel:+911234567890`;
    };

    const handleChatSupport = () => {
        // Implement chat functionality
        navigate('/help');
    };

    const handleDownloadInvoice = () => {
        try {
            // Create invoice HTML
            const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - ${currentOrder.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #333; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-size: 18px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-box { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .info-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
        .info-box p { margin: 5px 0; font-size: 14px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { background: #f0f0f0; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .items-table tr:last-child td { border-bottom: none; }
        .totals { margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row.grand { border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p style="margin: 5px 0;">Order #${currentOrder.orderNumber}</p>
        <p style="margin: 5px 0;">${new Date(currentOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date(currentOrder.createdAt).toLocaleTimeString('en-IN')}</p>
    </div>

    <div class="section">
        <div class="info-grid">
            <div class="info-box">
                <h3>RESTAURANT DETAILS</h3>
                <p><strong>${currentOrder.restaurant?.name || (currentOrder as any).restaurantName || 'Restaurant'}</strong></p>
                <p>${currentOrder.restaurant?.address?.address || currentOrder.restaurant?.address?.street || (currentOrder as any).restaurantAddress?.address || (currentOrder as any).restaurantAddress?.street || ''}</p>
            </div>
            <div class="info-box">
                <h3>DELIVERY ADDRESS</h3>
                <p><strong>${currentOrder.deliveryAddress?.label || 'Delivery Address'}</strong></p>
                <p>${currentOrder.deliveryAddress?.address || ''}</p>
                <p>${currentOrder.deliveryAddress?.city || ''}, ${currentOrder.deliveryAddress?.state || ''}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>ORDER ITEMS</h2>
        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${currentOrder.items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <strong>${item.menuItem.name}</strong>
                        ${item.customizations && item.customizations.length > 0 ? `<br><small style="color: #666;">${item.customizations.join(', ')}</small>` : ''}
                        ${item.specialInstructions ? `<br><small style="color: #666;">Note: ${item.specialInstructions}</small>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>₹${item.menuItem.price}</td>
                    <td>₹${item.totalPrice.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>PAYMENT BREAKDOWN</h2>
        <div class="totals">
            <div class="total-row">
                <span>Item Total</span>
                <span>₹${currentOrder.pricing.itemTotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Delivery Fee</span>
                <span>₹${currentOrder.pricing.deliveryFee.toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Taxes & Charges</span>
                <span>₹${currentOrder.pricing.taxes.toFixed(2)}</span>
            </div>
            ${currentOrder.pricing.discount > 0 ? `
            <div class="total-row" style="color: green;">
                <span>Discount</span>
                <span>-₹${currentOrder.pricing.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row grand">
                <span>TOTAL PAID</span>
                <span>₹${currentOrder.pricing.total.toFixed(2)}</span>
            </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
            <div class="total-row" style="padding: 5px 0;">
                <span>Payment Method:</span>
                <span><strong>${currentOrder.paymentMethod.toUpperCase()}</strong></span>
            </div>
            <div class="total-row" style="padding: 5px 0;">
                <span>Payment Status:</span>
                <span><strong>${currentOrder.paymentStatus.toUpperCase()}</strong></span>
            </div>
        </div>
    </div>

    <div class="footer">
        <p><strong>Thank you for your order!</strong></p>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
    </div>
</body>
</html>
            `;

            // Open print dialog for PDF generation
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write(invoiceHTML);
                printWindow.document.close();
                printWindow.focus();

                // Wait for content to load before printing
                setTimeout(() => {
                    printWindow.print();
                    toast.success('Invoice ready to download as PDF!');
                }, 250);
            } else {
                toast.error('Please allow popups to download invoice');
            }
        } catch (error) {
            console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <TopHeader title={`Order #${currentOrder.orderNumber}`} />

            <div className="p-4 space-y-6">
                {/* Delivered Status Card - Show only after delivery */}
                {currentOrder.status === 'delivered' && currentOrder.actualDeliveryTime && (
                    <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-6 border-2 border-success-200">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-success-900 text-lg mb-1">Order Delivered Successfully!</h3>
                                <p className="text-success-700 text-sm mb-2">
                                    Your order was delivered on {new Date(currentOrder.actualDeliveryTime).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })} at {formatTime(currentOrder.actualDeliveryTime)}
                                </p>
                                <div className="flex items-center space-x-2 text-success-700">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">Thank you for ordering with us!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Tracking - Show only before delivery */}
                {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' &&
                 currentOrder.restaurant?.address?.coordinates && currentOrder.deliveryAddress?.coordinates && (
                    <OrderTrackingMap
                        restaurantLocation={currentOrder.restaurant.address.coordinates}
                        customerLocation={currentOrder.deliveryAddress.coordinates}
                        deliveryAgentId={currentOrder.deliveryAgentId}
                        deliveryStatus={currentOrder.deliveryStatus}
                        orderStatus={currentOrder.status}
                    />
                )}

                {/* Restaurant Order Timeline */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-4">
                        {deliveryAgentId ? 'Restaurant Preparation' : 'Order Status'}
                    </h3>
                    <div className="relative">
                        {restaurantSteps.map((step, index) => {
                            const isCompleted = index <= currentRestaurantStep;
                            const isActive = index === currentRestaurantStep;
                            const isLast = index === restaurantSteps.length - 1;

                            return (
                                <div key={step.key} className="relative flex items-start pb-6 last:pb-0">
                                    {/* Connecting Line */}
                                    {!isLast && (
                                        <div className={`absolute left-2 top-5 w-0.5 h-full ${
                                            isCompleted ? 'bg-primary-500' : 'bg-secondary-200'
                                        }`} />
                                    )}

                                    {/* Status Icon */}
                                    <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-primary-500 ring-4 ring-primary-100'
                                            : isActive
                                                ? 'bg-white border-2 border-primary-500 ring-4 ring-primary-100 animate-pulse'
                                                : 'bg-secondary-200'
                                    }`}>
                                        {isCompleted && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="ml-4 flex-1">
                                        <p className={`font-medium ${
                                            isCompleted ? 'text-secondary-900' : 'text-secondary-500'
                                        }`}>
                                            {step.label}
                                        </p>
                                        {step.time && (
                                            <p className="text-sm text-secondary-600 mt-0.5">
                                                {formatTime(step.time)}
                                            </p>
                                        )}
                                        {isActive && currentOrder.status !== 'delivered' && (
                                            <p className="text-xs text-primary-600 mt-1 animate-pulse">
                                                In Progress...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Delivery Partner Details (shown when delivery agent is assigned) */}
                {deliveryAgentId && (
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
                        <h3 className="font-semibold text-secondary-900 mb-3">Delivery Partner</h3>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-secondary-900">Delivery Partner</h4>
                                <div className="flex items-center space-x-1 text-sm text-secondary-600">
                                    <Bike className="h-3 w-3" />
                                    <span>
                                        {deliveryStatus === 'assigned' && 'Assigned to your order'}
                                        {deliveryStatus === 'picked_up' && 'Picked up your order'}
                                        {deliveryStatus === 'on_the_way' && 'On the way to deliver'}
                                        {deliveryStatus === 'delivered' && 'Order delivered'}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => window.location.href = 'tel:+911234567890'}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Delivery Agent Status Timeline */}
                        {deliveryStatus && (
                            <div className="border-t border-primary-200 pt-3">
                                <p className="text-xs font-medium text-secondary-700 mb-2">Delivery Status</p>
                                <div className="relative">
                                    {deliverySteps.map((step, index) => {
                                        const isCompleted = index <= currentDeliveryStep;
                                        const isActive = index === currentDeliveryStep;
                                        const isLast = index === deliverySteps.length - 1;

                                        return (
                                            <div key={step.key} className="relative flex items-start pb-3 last:pb-0">
                                                {/* Connecting Line */}
                                                {!isLast && (
                                                    <div className={`absolute left-2 top-5 w-0.5 h-full ${
                                                        isCompleted ? 'bg-primary-500' : 'bg-secondary-200'
                                                    }`} />
                                                )}

                                                {/* Status Icon */}
                                                <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                                    isCompleted
                                                        ? 'bg-primary-500 ring-2 ring-primary-100'
                                                        : isActive
                                                            ? 'bg-white border-2 border-primary-500 ring-2 ring-primary-100 animate-pulse'
                                                            : 'bg-secondary-200'
                                                }`}>
                                                    {isCompleted && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Step Content */}
                                                <div className="ml-3 flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        isCompleted ? 'text-secondary-900' : 'text-secondary-500'
                                                    }`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Restaurant Details */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Restaurant Details</h3>
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-secondary-900">
                                {currentOrder.restaurant?.name || (currentOrder as any).restaurantName || 'Restaurant'}
                            </h4>
                            <div className="flex items-start space-x-1 mt-1">
                                <MapPin className="h-4 w-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-secondary-600">
                                    {currentOrder.restaurant?.address?.address ||
                                     currentOrder.restaurant?.address?.street ||
                                     (currentOrder as any).restaurantAddress?.address ||
                                     (currentOrder as any).restaurantAddress?.street ||
                                     'Address not available'}
                                </p>
                            </div>
                            {(currentOrder.restaurant?.address?.city || currentOrder.restaurant?.address?.state) && (
                                <p className="text-sm text-secondary-600 ml-5">
                                    {currentOrder.restaurant?.address?.city}
                                    {currentOrder.restaurant?.address?.city && currentOrder.restaurant?.address?.state && ', '}
                                    {currentOrder.restaurant?.address?.state}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCallRestaurant}
                            className="flex-shrink-0"
                        >
                            <Phone className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Delivery Address</h3>
                    <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-secondary-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-secondary-900">
                                {currentOrder.deliveryAddress.label}
                            </p>
                            <p className="text-sm text-secondary-600">
                                {currentOrder.deliveryAddress.address}
                            </p>
                            <p className="text-sm text-secondary-600">
                                {currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {currentOrder.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-secondary-900">{item.menuItem.name}</p>
                                    <p className="text-sm text-secondary-600">Qty: {item.quantity}</p>
                                    {item.customizations && item.customizations.length > 0 && (
                                        <p className="text-xs text-secondary-500">
                                            {item.customizations.join(', ')}
                                        </p>
                                    )}
                                </div>
                                <span className="font-medium text-secondary-900">₹{item.totalPrice}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoice / Payment Breakdown */}
                <div className="bg-surface rounded-xl p-4 border-2 border-primary-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-primary-600" />
                            <h3 className="font-semibold text-secondary-900">Invoice Details</h3>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDownloadInvoice}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Item Total</span>
                            <span className="text-secondary-900">₹{currentOrder.pricing.itemTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Delivery Fee</span>
                            <span className="text-secondary-900">₹{currentOrder.pricing.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Taxes & Charges</span>
                            <span className="text-secondary-900">₹{currentOrder.pricing.taxes.toFixed(2)}</span>
                        </div>
                        {currentOrder.pricing.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-success-600">Discount</span>
                                <span className="text-success-600">-₹{currentOrder.pricing.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-secondary-200 pt-2 mt-2">
                            <div className="flex justify-between font-semibold text-lg">
                                <span className="text-secondary-900">Total Paid</span>
                                <span className="text-primary-600">₹{currentOrder.pricing.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 pt-4 border-t border-secondary-200">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">Payment Method</span>
                            <span className="text-secondary-900 font-medium capitalize">{currentOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-secondary-600">Payment Status</span>
                            <span className={`font-medium capitalize ${
                                currentOrder.paymentStatus === 'completed' ? 'text-success-600' :
                                currentOrder.paymentStatus === 'pending' ? 'text-warning-600' :
                                'text-error-600'
                            }`}>
                                {currentOrder.paymentStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Help */}
                <div className="bg-surface rounded-xl p-4">
                    <h3 className="font-semibold text-secondary-900 mb-3">Need Help?</h3>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={handleChatSupport}
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat Support
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={handleCallRestaurant}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Restaurant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
