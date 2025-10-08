import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Order, OrderRating } from '../types';

class OrderService {

    async createOrder(orderData: any): Promise<Order> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('Creating order for user:', user.uid);
            console.log('Order data received:', orderData);

            // Validate required fields
            if (!orderData.restaurantId) {
                throw new Error('Restaurant ID is required');
            }
            if (!orderData.items || orderData.items.length === 0) {
                throw new Error('Order items are required');
            }
            if (!orderData.deliveryAddress) {
                throw new Error('Delivery address is required');
            }
            if (!orderData.pricing) {
                throw new Error('Pricing information is required');
            }

            // Fetch restaurant details to get address and coordinates
            const restaurantDocForAddress = await getDoc(doc(db, 'establishments', orderData.restaurantId));
            if (!restaurantDocForAddress.exists()) {
                throw new Error('Restaurant not found');
            }
            const restaurantDataForAddress = restaurantDocForAddress.data();
            console.log('Restaurant data from establishments:', {
                id: restaurantDocForAddress.id,
                businessName: restaurantDataForAddress.businessName,
                name: restaurantDataForAddress.name,
                restaurantName: restaurantDataForAddress.restaurantName,
                address: restaurantDataForAddress.address
            });
            const restaurantAddress = restaurantDataForAddress.address || {};

            // Calculate distance between restaurant and delivery address
            const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number => {
                const R = 6371; // Radius of the Earth in km
                const dLat = (pos2.lat - pos1.lat) * (Math.PI / 180);
                const dLng = (pos2.lng - pos1.lng) * (Math.PI / 180);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(pos1.lat * (Math.PI / 180)) * Math.cos(pos2.lat * (Math.PI / 180)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c; // Distance in km
            };

            const distance = calculateDistance(
                restaurantAddress.coordinates || { lat: 0, lng: 0 },
                orderData.deliveryAddress.coordinates || { lat: 0, lng: 0 }
            );

            // Helper function to remove undefined values but preserve Timestamps
            const cleanObject = (obj: any): any => {
                if (obj === null || obj === undefined) return null;
                if (typeof obj !== 'object') return obj;
                if (Array.isArray(obj)) return obj.map(cleanObject).filter(item => item !== undefined);

                // Preserve Firestore Timestamp objects
                if (obj && typeof obj.toDate === 'function') {
                    return obj;
                }

                const cleaned: any = {};
                for (const key in obj) {
                    if (obj[key] !== undefined) {
                        cleaned[key] = cleanObject(obj[key]);
                    }
                }
                return cleaned;
            };

            // Fetch user details for name and phone if not in delivery address
            let customerName = orderData.deliveryAddress?.name || '';
            let customerPhone = orderData.deliveryAddress?.phone || '';

            if (!customerName || !customerPhone) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (!customerName) {
                            customerName = userData.name || user.displayName || 'Customer';
                        }
                        if (!customerPhone) {
                            customerPhone = userData.phone || user.phoneNumber || '';
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }

            const rawOrderDoc = {
                userId: user.uid,
                customerName: customerName || 'Customer',
                customerPhone: customerPhone || '',
                restaurantId: orderData.restaurantId,
                restaurantName: restaurantDataForAddress.businessName || restaurantDataForAddress.name || restaurantDataForAddress.restaurantName || 'Restaurant',
                items: orderData.items.map((item: any) => {
                    const menuItem: any = {
                        id: item.menuItem.id,
                        name: item.menuItem.name,
                        price: item.menuItem.price,
                        type: item.menuItem.type,
                        images: item.menuItem.images || []
                    };

                    // Only add discountPrice if it exists and is not undefined
                    if (item.menuItem.discountPrice !== undefined && item.menuItem.discountPrice !== null) {
                        menuItem.discountPrice = item.menuItem.discountPrice;
                    }

                    const orderItem: any = {
                        id: item.id,
                        menuItem: menuItem,
                        quantity: item.quantity,
                        customizations: item.customizations || [],
                        totalPrice: item.totalPrice
                    };

                    // Only add specialInstructions if it exists and is not undefined
                    if (item.specialInstructions !== undefined && item.specialInstructions !== null && item.specialInstructions.trim() !== '') {
                        orderItem.specialInstructions = item.specialInstructions;
                    }

                    return orderItem;
                }),
                pricing: {
                    itemTotal: orderData.pricing.itemTotal,
                    deliveryFee: orderData.pricing.deliveryFee,
                    taxes: orderData.pricing.taxes,
                    discount: orderData.pricing.discount || 0,
                    total: orderData.pricing.total
                },
                deliveryAddress: {
                    id: orderData.deliveryAddress.id,
                    label: orderData.deliveryAddress.label,
                    address: orderData.deliveryAddress.address,
                    city: orderData.deliveryAddress.city,
                    state: orderData.deliveryAddress.state,
                    pincode: orderData.deliveryAddress.pincode,
                    coordinates: orderData.deliveryAddress.coordinates,
                    // Only add name if it exists
                    ...(orderData.deliveryAddress.name && { name: orderData.deliveryAddress.name }),
                    // Only add phone if it exists
                    ...(orderData.deliveryAddress.phone && { phone: orderData.deliveryAddress.phone })
                },
                restaurantAddress: {
                    address: restaurantAddress.address || restaurantAddress.street || '',
                    street: restaurantAddress.street || restaurantAddress.address || '',
                    city: restaurantAddress.city || '',
                    state: restaurantAddress.state || '',
                    pincode: restaurantAddress.pincode || '',
                    coordinates: restaurantAddress.coordinates || { lat: 0, lng: 0 }
                },
                orderNumber: this.generateOrderNumber(),
                status: 'placed',
                distance: distance,
                paymentMethod: orderData.paymentMethod || 'cash',
                paymentStatus: 'pending',
                estimatedDeliveryTime: orderData.estimatedDeliveryTime ? Timestamp.fromDate(orderData.estimatedDeliveryTime) : Timestamp.fromDate(new Date(Date.now() + 45 * 60 * 1000)),
                timeline: [{
                    status: 'placed',
                    timestamp: Timestamp.now(),
                    description: 'Order placed successfully'
                }],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                // Only add specialInstructions if it exists
                ...(orderData.specialInstructions && orderData.specialInstructions.trim() && { specialInstructions: orderData.specialInstructions.trim() })
            };

            const orderDoc = cleanObject(rawOrderDoc);

            console.log('Processed order document:', orderDoc);

            const docRef = await addDoc(collection(db, 'orders'), orderDoc);
            console.log('Order created with ID:', docRef.id);

            // Fetch the restaurant details for the response
            let restaurantData;
            try {
                const restaurantDoc = await getDoc(doc(db, 'establishments', orderData.restaurantId));
                if (restaurantDoc.exists()) {
                    const data = restaurantDoc.data();
                    restaurantData = {
                        id: restaurantDoc.id,
                        name: data.businessName || data.name || 'Unknown Restaurant',
                        description: data.description || '',
                        images: data.images || [],
                        cuisineTypes: data.cuisineTypes || [],
                        rating: data.rating || 0,
                        totalRatings: data.totalRatings || 0,
                        deliveryTime: data.deliveryTime || '30-40 mins',
                        deliveryFee: data.deliveryFee || 30,
                        minimumOrder: data.minimumOrder || 0,
                        address: data.address || {},
                        isOpen: true,
                        featured: false
                    };
                } else {
                    console.warn('Restaurant not found, using placeholder data');
                    restaurantData = {
                        id: orderData.restaurantId,
                        name: 'Restaurant',
                        description: '',
                        images: [],
                        cuisineTypes: [],
                        rating: 0,
                        totalRatings: 0,
                        deliveryTime: '30-40 mins',
                        deliveryFee: 30,
                        minimumOrder: 0,
                        address: {},
                        isOpen: true,
                        featured: false
                    };
                }
            } catch (restaurantError) {
                console.error('Error fetching restaurant details:', restaurantError);
                restaurantData = {
                    id: orderData.restaurantId,
                    name: 'Restaurant',
                    description: '',
                    images: [],
                    cuisineTypes: [],
                    rating: 0,
                    totalRatings: 0,
                    deliveryTime: '30-40 mins',
                    deliveryFee: 30,
                    minimumOrder: 0,
                    address: {},
                    isOpen: true,
                    featured: false
                };
            }

            const createdOrder: Order = {
                id: docRef.id,
                orderNumber: orderDoc.orderNumber,
                userId: user.uid,
                restaurantId: orderData.restaurantId,
                restaurant: restaurantData,
                items: orderDoc.items,
                pricing: orderDoc.pricing,
                deliveryAddress: orderDoc.deliveryAddress,
                status: 'placed',
                paymentMethod: orderDoc.paymentMethod,
                paymentStatus: 'pending',
                specialInstructions: orderDoc.specialInstructions,
                estimatedDeliveryTime: orderDoc.estimatedDeliveryTime.toDate(),
                timeline: orderDoc.timeline.map((t: any) => ({
                    ...t,
                    timestamp: t.timestamp.toDate()
                })),
                createdAt: orderDoc.createdAt.toDate(),
                updatedAt: orderDoc.updatedAt.toDate()
            };

            console.log('Order created successfully:', createdOrder);
            return createdOrder;

        } catch (error: any) {
            console.error('Error creating order:', error);
            console.error('Order data that failed:', orderData);

            // Provide more specific error messages
            if (error.code === 'permission-denied') {
                throw new Error('Permission denied. Please check your authentication status.');
            } else if (error.code === 'unavailable') {
                throw new Error('Service temporarily unavailable. Please try again later.');
            } else if (error.message.includes('User not authenticated')) {
                throw new Error('Please sign in to place an order.');
            } else {
                throw new Error(`Failed to create order: ${error.message}`);
            }
        }
    }

    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            console.log('Fetching orders for user:', userId);

            const ordersRef = collection(db, 'orders');
            // Query without orderBy to avoid index requirement
            // We'll sort in memory instead
            const q = query(
                ordersRef,
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(q);

            console.log('Found orders:', snapshot.size);

            const orders: Order[] = [];

            for (const orderDoc of snapshot.docs) {
                const data = orderDoc.data();

                // Get restaurant details - try from establishment first, fallback to order data
                let restaurantData;
                console.log('Order data restaurantId:', data.restaurantId);
                console.log('Order has restaurantAddress?', !!data.restaurantAddress);

                try {
                    const restaurantDoc = await getDoc(doc(db, 'establishments', data.restaurantId));
                    console.log('Restaurant doc exists?', restaurantDoc.exists());

                    if (restaurantDoc.exists()) {
                        const restData = restaurantDoc.data();
                        console.log('Restaurant data found:', { businessName: restData.businessName, name: restData.name, address: restData.address });

                        // Use restaurantAddress from order if establishment doesn't have it
                        const addressToUse = restData.address && Object.keys(restData.address).length > 0
                            ? restData.address
                            : data.restaurantAddress || {};

                        restaurantData = {
                            id: restaurantDoc.id,
                            name: restData.businessName || restData.name || restData.restaurantName || 'Unknown Restaurant',
                            description: restData.description || '',
                            images: restData.images || [],
                            cuisineTypes: restData.cuisineTypes || [],
                            rating: restData.rating || 0,
                            totalRatings: restData.totalRatings || 0,
                            deliveryTime: restData.deliveryTime || '30-40 mins',
                            deliveryFee: restData.deliveryFee || 30,
                            minimumOrder: restData.minimumOrder || 0,
                            address: addressToUse,
                            isOpen: true,
                            featured: false
                        };
                    } else {
                        console.warn('Restaurant not found in establishments, using order data');
                        // Use data from order document
                        restaurantData = {
                            id: data.restaurantId,
                            name: data.restaurantName || 'Unknown Restaurant',
                            description: '',
                            images: [],
                            cuisineTypes: [],
                            rating: 0,
                            totalRatings: 0,
                            deliveryTime: '30-40 mins',
                            deliveryFee: 30,
                            minimumOrder: 0,
                            address: data.restaurantAddress || {},
                            isOpen: true,
                            featured: false
                        };
                    }
                } catch (error) {
                    console.error('Error fetching restaurant for order:', error);
                    console.error('Restaurant ID that failed:', data.restaurantId);
                    // Fallback to order data
                    restaurantData = {
                        id: data.restaurantId,
                        name: data.restaurantName || 'Unknown Restaurant',
                        description: '',
                        images: [],
                        cuisineTypes: [],
                        rating: 0,
                        totalRatings: 0,
                        deliveryTime: '30-40 mins',
                        deliveryFee: 30,
                        minimumOrder: 0,
                        address: data.restaurantAddress || {},
                        isOpen: true,
                        featured: false
                    };
                }

                orders.push({
                    id: orderDoc.id,
                    orderNumber: data.orderNumber,
                    userId: data.userId,
                    restaurantId: data.restaurantId,
                    restaurant: restaurantData,
                    deliveryAgentId: data.deliveryAgentId || undefined,
                    items: data.items || [],
                    pricing: data.pricing || { itemTotal: 0, deliveryFee: 0, taxes: 0, discount: 0, total: 0 },
                    deliveryAddress: data.deliveryAddress,
                    status: data.status || 'placed',
                    deliveryStatus: data.deliveryStatus || undefined,
                    paymentMethod: data.paymentMethod || 'cash',
                    paymentStatus: data.paymentStatus || 'pending',
                    specialInstructions: data.specialInstructions,
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || [],
                    rating: data.rating ? {
                        ...data.rating,
                        createdAt: data.rating.createdAt?.toDate() || new Date()
                    } : undefined,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                });
            }

            // Sort orders by createdAt in descending order (newest first)
            orders.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                return dateB - dateA;
            });

            console.log('Orders sorted, returning:', orders.length);
            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw new Error('Failed to fetch orders');
        }
    }

    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            console.log('Fetching order details for:', orderId);

            const orderDoc = await getDoc(doc(db, 'orders', orderId));

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const data = orderDoc.data();

            // Get restaurant details - try from establishment first, fallback to order data
            let restaurantData;
            console.log('Order details restaurantId:', data.restaurantId);
            console.log('Order has restaurantAddress?', !!data.restaurantAddress);

            try {
                const restaurantDoc = await getDoc(doc(db, 'establishments', data.restaurantId));
                console.log('Restaurant doc exists for order details?', restaurantDoc.exists());

                if (restaurantDoc.exists()) {
                    const restData = restaurantDoc.data();
                    console.log('Restaurant data for order details:', { businessName: restData.businessName, name: restData.name, address: restData.address });

                    // Use restaurantAddress from order if establishment doesn't have it
                    const addressToUse = restData.address && Object.keys(restData.address).length > 0
                        ? restData.address
                        : data.restaurantAddress || {};

                    restaurantData = {
                        id: restaurantDoc.id,
                        name: restData.businessName || restData.name || restData.restaurantName || 'Unknown Restaurant',
                        description: restData.description || '',
                        images: restData.images || [],
                        cuisineTypes: restData.cuisineTypes || [],
                        rating: restData.rating || 0,
                        totalRatings: restData.totalRatings || 0,
                        deliveryTime: restData.deliveryTime || '30-40 mins',
                        deliveryFee: restData.deliveryFee || 30,
                        minimumOrder: restData.minimumOrder || 0,
                        address: addressToUse,
                        isOpen: true,
                        featured: false
                    };
                } else {
                    console.warn('Restaurant not found in establishments for order details, using order data');
                    // Use data from order document
                    restaurantData = {
                        id: data.restaurantId,
                        name: data.restaurantName || 'Unknown Restaurant',
                        description: '',
                        images: [],
                        cuisineTypes: [],
                        rating: 0,
                        totalRatings: 0,
                        deliveryTime: '30-40 mins',
                        deliveryFee: 30,
                        minimumOrder: 0,
                        address: data.restaurantAddress || {},
                        isOpen: true,
                        featured: false
                    };
                }
            } catch (error) {
                console.error('Error fetching restaurant for order details:', error);
                console.error('Restaurant ID that failed:', data.restaurantId);
                // Fallback to order data
                restaurantData = {
                    id: data.restaurantId,
                    name: data.restaurantName || 'Unknown Restaurant',
                    description: '',
                    images: [],
                    cuisineTypes: [],
                    rating: 0,
                    totalRatings: 0,
                    deliveryTime: '30-40 mins',
                    deliveryFee: 30,
                    minimumOrder: 0,
                    address: data.restaurantAddress || {},
                    isOpen: true,
                    featured: false
                };
            }

            return {
                id: orderDoc.id,
                orderNumber: data.orderNumber,
                userId: data.userId,
                restaurantId: data.restaurantId,
                restaurant: restaurantData,
                deliveryAgentId: data.deliveryAgentId || undefined,
                items: data.items || [],
                pricing: data.pricing || { itemTotal: 0, deliveryFee: 0, taxes: 0, discount: 0, total: 0 },
                deliveryAddress: data.deliveryAddress,
                status: data.status || 'placed',
                deliveryStatus: data.deliveryStatus || undefined,
                paymentMethod: data.paymentMethod || 'cash',
                paymentStatus: data.paymentStatus || 'pending',
                specialInstructions: data.specialInstructions,
                estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                timeline: data.timeline?.map((t: any) => ({
                    ...t,
                    timestamp: t.timestamp?.toDate() || new Date()
                })) || [],
                rating: data.rating ? {
                    ...data.rating,
                    createdAt: data.rating.createdAt?.toDate() || new Date()
                } : undefined,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw new Error('Failed to fetch order details');
        }
    }

    async cancelOrder(orderId: string): Promise<void> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'cancelled',
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw new Error('Failed to cancel order');
        }
    }

    async rateOrder(orderId: string, rating: OrderRating): Promise<OrderRating> {
        try {
            // Import ratingService here to avoid circular dependency
            const { ratingService } = await import('./ratingService');

            // Create rating in the ratings collection
            await ratingService.createRating(orderId, rating);

            // Also update order document for backward compatibility
            const orderRef = doc(db, 'orders', orderId);
            const ratingWithTimestamp = {
                ...rating,
                createdAt: Timestamp.now()
            };

            await updateDoc(orderRef, {
                rating: ratingWithTimestamp,
                updatedAt: Timestamp.now()
            });

            return {
                ...rating,
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Error rating order:', error);
            throw new Error('Failed to rate order');
        }
    }

    private generateOrderNumber(): string {
        return 'FE' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
    }
}

export const orderService = new OrderService();
