import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    getDoc,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, OrderFilters } from '../types';

export const orderService = {
    async getOrders(restaurantId: string, filters?: OrderFilters): Promise<Order[]> {
        try {
            console.log('Fetching orders for restaurant ID:', restaurantId);

            let q;

            if (filters?.status && filters.status !== 'all') {
                console.log('Filtering by status:', filters.status);
                // Try compound index query first (restaurantId + status + createdAt)
                try {
                    q = query(
                        collection(db, 'orders'),
                        where('restaurantId', '==', restaurantId),
                        where('status', '==', filters.status),
                        orderBy('createdAt', 'desc')
                    );

                    const snapshot = await getDocs(q);
                    console.log('Found orders with status filter:', snapshot.size);
                    let orders = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            // Convert Firestore timestamps to dates
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                            actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                            timeline: data.timeline?.map((t: any) => ({
                                ...t,
                                timestamp: t.timestamp?.toDate() || new Date()
                            })) || [],
                            // Map items from customer app structure
                            items: data.items?.map((item: any) => ({
                                menuItemId: item.menuItem?.id || item.id,
                                name: item.menuItem?.name || item.name,
                                price: item.menuItem?.price || item.price,
                                quantity: item.quantity,
                                customizations: item.customizations?.map((c: any) =>
                                    typeof c === 'string' ? c : c.name
                                ) || [],
                                specialInstructions: item.specialInstructions || '',
                                images: item.menuItem?.images || []
                            })) || []
                        } as Order;
                    });
                    return this.applyClientSideFilters(orders, filters);
                } catch (indexError: any) {
                    console.warn('Compound index not found for orders with status, trying simple query:', indexError.message);

                    // Fallback to simple query without orderBy
                    q = query(
                        collection(db, 'orders'),
                        where('restaurantId', '==', restaurantId),
                        where('status', '==', filters.status)
                    );
                }
            } else {
                // Try single field index query first (restaurantId + createdAt)
                try {
                    q = query(
                        collection(db, 'orders'),
                        where('restaurantId', '==', restaurantId),
                        orderBy('createdAt', 'desc')
                    );

                    const snapshot = await getDocs(q);
                    console.log('Found orders without status filter:', snapshot.size);
                    let orders = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            // Convert Firestore timestamps to dates
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                            actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                            timeline: data.timeline?.map((t: any) => ({
                                ...t,
                                timestamp: t.timestamp?.toDate() || new Date()
                            })) || [],
                            // Map items from customer app structure
                            items: data.items?.map((item: any) => ({
                                menuItemId: item.menuItem?.id || item.id,
                                name: item.menuItem?.name || item.name,
                                price: item.menuItem?.price || item.price,
                                quantity: item.quantity,
                                customizations: item.customizations?.map((c: any) =>
                                    typeof c === 'string' ? c : c.name
                                ) || [],
                                specialInstructions: item.specialInstructions || '',
                                images: item.menuItem?.images || []
                            })) || []
                        } as Order;
                    });
                    return this.applyClientSideFilters(orders, filters);
                } catch (indexError: any) {
                    console.warn('Index not found for orders, trying simple query:', indexError.message);

                    // Fallback to simple query without orderBy
                    q = query(
                        collection(db, 'orders'),
                        where('restaurantId', '==', restaurantId)
                    );
                }
            }

            const snapshot = await getDocs(q);
            console.log('Found orders with simple query:', snapshot.size);
            let orders = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Order data:', {
                    id: doc.id,
                    orderNumber: data.orderNumber,
                    restaurantId: data.restaurantId
                });

                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore timestamps to dates
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || [],
                    // Map customer app data structure to restaurant app expectations
                    customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                    customerPhone: data.deliveryAddress?.phone || data.customerPhone || 'No phone',
                    addresses: {
                        delivery: {
                            label: data.deliveryAddress?.label || '',
                            street: data.deliveryAddress?.address || '',
                            city: data.deliveryAddress?.city || '',
                            state: data.deliveryAddress?.state || '',
                            pincode: data.deliveryAddress?.pincode || ''
                        }
                    },
                    payment: {
                        method: data.paymentMethod || 'cash',
                        status: data.paymentStatus || 'pending',
                        transactionId: data.transactionId
                    },
                    pricing: {
                        subtotal: data.pricing?.itemTotal || 0,
                        tax: data.pricing?.taxes || 0,
                        deliveryFee: data.pricing?.deliveryFee || 0,
                        discount: data.pricing?.discount || 0,
                        total: data.pricing?.total || 0
                    },
                    // Map items from customer app structure
                    items: data.items?.map((item: any) => ({
                        menuItemId: item.menuItem?.id || item.id,
                        name: item.menuItem?.name || item.name,
                        price: item.menuItem?.price || item.price,
                        quantity: item.quantity,
                        customizations: item.customizations?.map((c: any) =>
                            typeof c === 'string' ? c : c.name
                        ) || [],
                        specialInstructions: item.specialInstructions || '',
                        images: item.menuItem?.images || []
                    })) || []
                } as Order;
            });

            // Sort client-side when orderBy is not available
            orders = orders.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

            console.log('Final processed orders:', orders.length);
            return this.applyClientSideFilters(orders, filters);

        } catch (error: any) {
            console.error('Error fetching orders:', error);
            // Return empty array for missing collection instead of throwing
            if (error.message?.includes('collection') || error.message?.includes('index')) {
                console.log('Collection or index missing, returning empty array');
                return [];
            }
            throw new Error(error.message || 'Failed to fetch orders');
        }
    },

    // Helper method to apply client-side filters
    applyClientSideFilters(orders: Order[], filters?: OrderFilters): Order[] {
        let filteredOrders = [...orders];

        // Apply search filter
        if (filters?.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredOrders = filteredOrders.filter(order =>
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm) ||
                (order.items && order.items.some && order.items.some((item: any) => item.name?.toLowerCase().includes(searchTerm)))
            );
        }

        // Apply date range filter
        if (filters?.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            const startDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
            }

            filteredOrders = filteredOrders.filter(order => {
                const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
                return orderDate >= startDate;
            });
        }

        return filteredOrders;
    },

    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            console.log('Fetching order details for:', orderId);
            const orderDoc = await getDoc(doc(db, 'orders', orderId));
            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const data = orderDoc.data();
            console.log('Order details data:', data);

            return {
                id: orderDoc.id,
                ...data,
                // Convert Firestore timestamps to dates
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                timeline: data.timeline?.map((t: any) => ({
                    ...t,
                    timestamp: t.timestamp?.toDate() || new Date()
                })) || [],
                // Map customer app data structure to restaurant app expectations
                customerName: data.deliveryAddress?.name || 'Customer',
                customerPhone: data.deliveryAddress?.phone || 'No phone',
                addresses: {
                    delivery: {
                        label: data.deliveryAddress?.label || '',
                        street: data.deliveryAddress?.address || '',
                        city: data.deliveryAddress?.city || '',
                        state: data.deliveryAddress?.state || '',
                        pincode: data.deliveryAddress?.pincode || ''
                    }
                },
                payment: {
                    method: data.paymentMethod || 'cash',
                    status: data.paymentStatus || 'pending',
                    transactionId: data.transactionId
                },
                pricing: {
                    subtotal: data.pricing?.itemTotal || 0,
                    tax: data.pricing?.taxes || 0,
                    deliveryFee: data.pricing?.deliveryFee || 0,
                    discount: data.pricing?.discount || 0,
                    total: data.pricing?.total || 0
                },
                // Map items from customer app structure
                items: data.items?.map((item: any) => ({
                    menuItemId: item.menuItem?.id || item.id,
                    name: item.menuItem?.name || item.name,
                    price: item.menuItem?.price || item.price,
                    quantity: item.quantity,
                    customizations: item.customizations?.map((c: any) =>
                        typeof c === 'string' ? c : c.name
                    ) || [],
                    specialInstructions: item.specialInstructions || '',
                    images: item.menuItem?.images || []
                })) || []
            } as Order;
        } catch (error: any) {
            console.error('Error fetching order details:', error);
            throw new Error(error.message || 'Failed to fetch order details');
        }
    },

    async updateOrderStatus(orderId: string, status: string, note?: string): Promise<void> {
        try {
            console.log('Updating order status:', {orderId, status, note});
            const orderDoc = await getDoc(doc(db, 'orders', orderId));
            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data() as Order;

            // Restaurant can only set these statuses (food preparation statuses)
            const allowedStatuses = ['confirmed', 'preparing', 'ready', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                throw new Error(`Restaurant can only update status to: ${allowedStatuses.join(', ')}`);
            }

            // Validate status flow for restaurant (food preparation flow)
            const currentStatus = orderData.status;
            const validTransitions: { [key: string]: string[] } = {
                'placed': ['confirmed', 'cancelled'],
                'confirmed': ['preparing', 'cancelled'],
                'preparing': ['ready', 'cancelled'],
                'ready': ['ready', 'cancelled'], // Can stay ready, waiting for pickup
                // If delivery agent has picked up, restaurant can't change status
                'picked_up': [],
                'on_the_way': [],
                'delivered': []
            };

            if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(status)) {
                throw new Error(`Cannot change status from ${currentStatus} to ${status}. Food has already been ${currentStatus.replace('_', ' ')}.`);
            }

            const newTimeline = [
                ...(orderData.timeline || []),
                {
                    status: status as any,
                    timestamp: Timestamp.now(),
                    note: note || `Status updated to ${status}`
                }
            ];

            await updateDoc(doc(db, 'orders', orderId), {
                status,
                timeline: newTimeline,
                updatedAt: Timestamp.now()
            });

            console.log('Order status updated successfully');
        } catch (error: any) {
            console.error('Error updating order status:', error);
            throw new Error(error.message || 'Failed to update order status');
        }
    },

    subscribeToOrders(restaurantId: string, callback: (orders: Order[]) => void) {
        console.log('Setting up real-time subscription for restaurant:', restaurantId);
        // Try with compound index first
        try {
            const q = query(
                collection(db, 'orders'),
                where('restaurantId', '==', restaurantId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            return onSnapshot(q, (snapshot) => {
                console.log('Real-time update: found orders:', snapshot.size);
                const orders = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Convert Firestore timestamps to dates
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                        estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                        actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                        timeline: data.timeline?.map((t: any) => ({
                            ...t,
                            timestamp: t.timestamp?.toDate() || new Date()
                        })) || [],
                        // Map customer app data structure to restaurant app expectations
                        customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                        customerPhone: data.deliveryAddress?.phone || data.customerPhone || 'No phone',
                        addresses: {
                            delivery: {
                                label: data.deliveryAddress?.label || '',
                                street: data.deliveryAddress?.address || '',
                                city: data.deliveryAddress?.city || '',
                                state: data.deliveryAddress?.state || '',
                                pincode: data.deliveryAddress?.pincode || ''
                            }
                        },
                        payment: {
                            method: data.paymentMethod || 'cash',
                            status: data.paymentStatus || 'pending',
                            transactionId: data.transactionId
                        },
                        pricing: {
                            subtotal: data.pricing?.itemTotal || 0,
                            tax: data.pricing?.taxes || 0,
                            deliveryFee: data.pricing?.deliveryFee || 0,
                            discount: data.pricing?.discount || 0,
                            total: data.pricing?.total || 0
                        },
                        // Map items from customer app structure
                        items: data.items?.map((item: any) => ({
                            menuItemId: item.menuItem?.id || item.id,
                            name: item.menuItem?.name || item.name,
                            price: item.menuItem?.price || item.price,
                            quantity: item.quantity,
                            customizations: item.customizations?.map((c: any) =>
                                typeof c === 'string' ? c : c.name
                            ) || [],
                            specialInstructions: item.specialInstructions || '',
                            images: item.menuItem?.images || []
                        })) || []
                    } as Order;
                });
                callback(orders);
            }, (error) => {
                console.warn('Real-time subscription failed with index, trying simple query:', error.message);

                // Fallback to simple query
                const simpleQ = query(
                    collection(db, 'orders'),
                    where('restaurantId', '==', restaurantId),
                    limit(50)
                );

                return onSnapshot(simpleQ, (snapshot) => {
                    console.log('Real-time update (simple): found orders:', snapshot.size);
                    const orders = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            // Convert Firestore timestamps to dates
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                            actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                            timeline: data.timeline?.map((t: any) => ({
                                ...t,
                                timestamp: t.timestamp?.toDate() || new Date()
                            })) || [],
                            // Map customer app data structure to restaurant app expectations
                            customerName: data.deliveryAddress?.name || 'Customer',
                            customerPhone: data.deliveryAddress?.phone || 'No phone',
                            addresses: {
                                delivery: {
                                    label: data.deliveryAddress?.label || '',
                                    street: data.deliveryAddress?.address || '',
                                    city: data.deliveryAddress?.city || '',
                                    state: data.deliveryAddress?.state || '',
                                    pincode: data.deliveryAddress?.pincode || ''
                                }
                            },
                            payment: {
                                method: data.paymentMethod || 'cash',
                                status: data.paymentStatus || 'pending',
                                transactionId: data.transactionId
                            },
                            pricing: {
                                subtotal: data.pricing?.itemTotal || 0,
                                tax: data.pricing?.taxes || 0,
                                deliveryFee: data.pricing?.deliveryFee || 0,
                                discount: data.pricing?.discount || 0,
                                total: data.pricing?.total || 0
                            },
                            // Map items from customer app structure
                            items: data.items?.map((item: any) => ({
                                menuItemId: item.menuItem?.id || item.id,
                                name: item.menuItem?.name || item.name,
                                price: item.menuItem?.price || item.price,
                                quantity: item.quantity,
                                customizations: item.customizations?.map((c: any) =>
                                    typeof c === 'string' ? c : c.name
                                ) || [],
                                specialInstructions: item.specialInstructions || '',
                                images: item.menuItem?.images || []
                            })) || []
                        } as Order;
                    });
                    // Sort client-side
                    const sortedOrders = orders.sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                        return dateB.getTime() - dateA.getTime();
                    });
                    callback(sortedOrders);
                }, (fallbackError) => {
                    console.error('Real-time subscription failed completely:', fallbackError);
                    callback([]);
                });
            });
        } catch (error) {
            console.error('Failed to setup real-time subscription:', error);
            // Return a dummy unsubscribe function
            return () => {
            };
        }
    }
};
