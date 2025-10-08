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
    Timestamp,
    addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, OrderFilters } from '../types';

export const orderService = {
    async getAvailableOrders(agentLocation: { lat: number; lng: number }, maxDistance: number = 10): Promise<Order[]> {
        try {
            console.log('Fetching available orders...');
            console.log('Agent location:', agentLocation);
            console.log('Max distance:', maxDistance, 'km');

            // Get orders that are placed, preparing or ready for pickup and not assigned
            const q = query(
                collection(db, 'orders'),
                where('status', 'in', ['placed', 'preparing', 'ready'])
            );

            const snapshot = await getDocs(q);
            console.log('Found orders in DB:', snapshot.size);
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    orderNumber: data.orderNumber || '',
                    customerId: data.userId || data.customerId || '',
                    restaurantId: data.restaurantId || data.establishmentId || '',
                    deliveryAgentId: data.deliveryAgentId || null,
                    customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                    customerPhone: data.deliveryAddress?.phone || data.customerPhone || '',
                    items: (data.items || []).map((item: any) => {
                        console.log('Mapping item:', item);
                        return {
                            menuItemId: item.menuItem?.id || item.menuItemId || item.id || '',
                            name: item.menuItem?.name || item.name || 'Item',
                            price: item.menuItem?.price || item.price || item.menuItem?.discountPrice || 0,
                            quantity: item.quantity || 1,
                            customizations: Array.isArray(item.customizations)
                                ? item.customizations.map((c: any) => typeof c === 'string' ? c : c.name || c)
                                : [],
                            specialInstructions: item.specialInstructions || '',
                            images: item.menuItem?.images || item.images || []
                        };
                    }),
                    pricing: {
                        subtotal: parseFloat(data.pricing?.itemTotal || data.pricing?.subtotal || 0) || 0,
                        tax: parseFloat(data.pricing?.taxes || data.pricing?.tax || 0) || 0,
                        deliveryFee: parseFloat(data.pricing?.deliveryFee || 0) || 0,
                        discount: parseFloat(data.pricing?.discount || 0) || 0,
                        total: parseFloat(data.pricing?.total || 0) || 0
                    },
                    status: data.status,
                    deliveryStatus: data.deliveryStatus || null,
                    payment: data.payment || { method: 'cash', status: 'pending', amount: data.pricing?.total || 0 },
                    distance: data.distance || 0,
                    deliveryFee: data.pricing?.deliveryFee || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || [],
                    addresses: {
                        restaurant: {
                            id: data.restaurantId || '',
                            label: 'Restaurant',
                            street: data.restaurantAddress?.address || data.restaurantAddress?.street || '',
                            city: data.restaurantAddress?.city || '',
                            state: data.restaurantAddress?.state || '',
                            pincode: data.restaurantAddress?.pincode || '',
                            coordinates: data.restaurantAddress?.coordinates || data.restaurantLocation || { lat: 0, lng: 0 }
                        },
                        delivery: {
                            id: data.deliveryAddress?.id || '',
                            label: data.deliveryAddress?.label || 'Delivery',
                            street: data.deliveryAddress?.address || data.deliveryAddress?.street || '',
                            city: data.deliveryAddress?.city || '',
                            state: data.deliveryAddress?.state || '',
                            pincode: data.deliveryAddress?.pincode || '',
                            coordinates: data.deliveryAddress?.coordinates || { lat: 0, lng: 0 }
                        }
                    }
                } as Order;
            });

            // Filter by distance and availability (not assigned and agent doesn't have active order)
            const availableOrders = orders.filter(order => {
                // Check if order is not assigned
                if (order.deliveryAgentId) {
                    console.log(`Order ${order.id} already assigned to agent`);
                    return false;
                }

                // Calculate distance to restaurant
                const restaurantCoords = order.addresses?.restaurant?.coordinates ||
                                        order.restaurantLocation ||
                                        { lat: 0, lng: 0 };
                console.log(`Order ${order.id} - Agent location:`, agentLocation);
                console.log(`Order ${order.id} - Restaurant coords:`, restaurantCoords);
                const distance = this.calculateDistance(agentLocation, restaurantCoords);
                console.log(`Order ${order.id} - Calculated distance: ${distance.toFixed(2)}km`);

                if (distance <= maxDistance) {
                    return true;
                } else {
                    console.log(`Order ${order.id} is ${distance.toFixed(2)}km away (max: ${maxDistance}km) - filtered out`);
                    return false;
                }
            });

            console.log('Available orders after filtering:', availableOrders.length);
            return availableOrders;
        } catch (error: any) {
            console.error('Error fetching available orders:', error);
            return [];
        }
    },

    async getAssignedOrders(agentId: string): Promise<Order[]> {
        try {
            console.log('=== getAssignedOrders called ===');
            console.log('Fetching assigned orders for agent:', agentId);
            // Get all orders assigned to this agent (not delivered or cancelled)
            const q = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId)
            );
            console.log('Query for all orders with deliveryAgentId:', agentId);

            const snapshot = await getDocs(q);
            console.log('Firebase query returned:', snapshot.size, 'documents');

            // Debug: Also check ALL orders for this agent (without status filter)
            const debugQuery = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId)
            );
            const debugSnapshot = await getDocs(debugQuery);
            console.log('DEBUG: Total orders with deliveryAgentId =', agentId, ':', debugSnapshot.size);
            if (debugSnapshot.size > 0) {
                console.log('DEBUG: Order statuses:', debugSnapshot.docs.map(doc => ({
                    id: doc.id.slice(0, 8),
                    status: doc.data().status,
                    deliveryAgentId: doc.data().deliveryAgentId
                })));
            }

            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    orderNumber: data.orderNumber || '',
                    customerId: data.userId || data.customerId || '',
                    restaurantId: data.restaurantId || data.establishmentId || '',
                    deliveryAgentId: data.deliveryAgentId || null,
                    customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                    customerPhone: data.deliveryAddress?.phone || data.customerPhone || '',
                    items: (data.items || []).map((item: any) => {
                        console.log('Mapping item:', item);
                        return {
                            menuItemId: item.menuItem?.id || item.menuItemId || item.id || '',
                            name: item.menuItem?.name || item.name || 'Item',
                            price: item.menuItem?.price || item.price || item.menuItem?.discountPrice || 0,
                            quantity: item.quantity || 1,
                            customizations: Array.isArray(item.customizations)
                                ? item.customizations.map((c: any) => typeof c === 'string' ? c : c.name || c)
                                : [],
                            specialInstructions: item.specialInstructions || '',
                            images: item.menuItem?.images || item.images || []
                        };
                    }),
                    pricing: {
                        subtotal: parseFloat(data.pricing?.itemTotal || data.pricing?.subtotal || 0) || 0,
                        tax: parseFloat(data.pricing?.taxes || data.pricing?.tax || 0) || 0,
                        deliveryFee: parseFloat(data.pricing?.deliveryFee || 0) || 0,
                        discount: parseFloat(data.pricing?.discount || 0) || 0,
                        total: parseFloat(data.pricing?.total || 0) || 0
                    },
                    status: data.status,
                    deliveryStatus: data.deliveryStatus || null,
                    payment: data.payment || { method: 'cash', status: 'pending', amount: data.pricing?.total || 0 },
                    distance: data.distance || 0,
                    deliveryFee: data.pricing?.deliveryFee || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || [],
                    addresses: {
                        restaurant: {
                            id: data.restaurantId || '',
                            label: 'Restaurant',
                            street: data.restaurantAddress?.address || data.restaurantAddress?.street || '',
                            city: data.restaurantAddress?.city || '',
                            state: data.restaurantAddress?.state || '',
                            pincode: data.restaurantAddress?.pincode || '',
                            coordinates: data.restaurantAddress?.coordinates || data.restaurantLocation || { lat: 0, lng: 0 }
                        },
                        delivery: {
                            id: data.deliveryAddress?.id || '',
                            label: data.deliveryAddress?.label || 'Delivery',
                            street: data.deliveryAddress?.address || data.deliveryAddress?.street || '',
                            city: data.deliveryAddress?.city || '',
                            state: data.deliveryAddress?.state || '',
                            pincode: data.deliveryAddress?.pincode || '',
                            coordinates: data.deliveryAddress?.coordinates || { lat: 0, lng: 0 }
                        }
                    }
                } as Order;
            });

            console.log('Found assigned orders:', orders.length);
            console.log('Assigned order statuses:', orders.map(o => ({ id: o.id.slice(0, 8), status: o.status, deliveryStatus: o.deliveryStatus })));

            // Filter out delivered and cancelled orders
            const activeOrders = orders.filter(o =>
                o.status !== 'delivered' && o.status !== 'cancelled'
            );

            console.log('Active assigned orders after filtering:', activeOrders.length);

            // Sort by createdAt on client side
            activeOrders.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
                return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
            });

            return activeOrders;
        } catch (error: any) {
            console.error('Error fetching assigned orders:', error);
            return [];
        }
    },

    async getCompletedOrders(agentId: string, filters?: OrderFilters): Promise<Order[]> {
        try {
            console.log('=== getCompletedOrders called ===');
            console.log('Fetching completed orders for agent:', agentId);

            // Query without orderBy to avoid index requirement - we'll sort in memory
            let q = query(
                collection(db, 'orders'),
                where('deliveryAgentId', '==', agentId),
                where('status', 'in', ['delivered', 'cancelled'])
            );
            console.log('Query for statuses: delivered, cancelled');

            const snapshot = await getDocs(q);
            console.log('Firebase query returned:', snapshot.size, 'completed orders');

            let orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    orderNumber: data.orderNumber || '',
                    customerId: data.userId || data.customerId || '',
                    restaurantId: data.restaurantId || data.establishmentId || '',
                    deliveryAgentId: data.deliveryAgentId || null,
                    customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                    customerPhone: data.deliveryAddress?.phone || data.customerPhone || '',
                    items: (data.items || []).map((item: any) => {
                        console.log('Mapping item:', item);
                        return {
                            menuItemId: item.menuItem?.id || item.menuItemId || item.id || '',
                            name: item.menuItem?.name || item.name || 'Item',
                            price: item.menuItem?.price || item.price || item.menuItem?.discountPrice || 0,
                            quantity: item.quantity || 1,
                            customizations: Array.isArray(item.customizations)
                                ? item.customizations.map((c: any) => typeof c === 'string' ? c : c.name || c)
                                : [],
                            specialInstructions: item.specialInstructions || '',
                            images: item.menuItem?.images || item.images || []
                        };
                    }),
                    pricing: {
                        subtotal: parseFloat(data.pricing?.itemTotal || data.pricing?.subtotal || 0) || 0,
                        tax: parseFloat(data.pricing?.taxes || data.pricing?.tax || 0) || 0,
                        deliveryFee: parseFloat(data.pricing?.deliveryFee || 0) || 0,
                        discount: parseFloat(data.pricing?.discount || 0) || 0,
                        total: parseFloat(data.pricing?.total || 0) || 0
                    },
                    status: data.status,
                    deliveryStatus: data.deliveryStatus || null,
                    payment: data.payment || { method: 'cash', status: 'pending', amount: data.pricing?.total || 0 },
                    distance: data.distance || 0,
                    deliveryFee: data.pricing?.deliveryFee || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || [],
                    addresses: {
                        restaurant: {
                            id: data.restaurantId || '',
                            label: 'Restaurant',
                            street: data.restaurantAddress?.address || data.restaurantAddress?.street || '',
                            city: data.restaurantAddress?.city || '',
                            state: data.restaurantAddress?.state || '',
                            pincode: data.restaurantAddress?.pincode || '',
                            coordinates: data.restaurantAddress?.coordinates || data.restaurantLocation || { lat: 0, lng: 0 }
                        },
                        delivery: {
                            id: data.deliveryAddress?.id || '',
                            label: data.deliveryAddress?.label || 'Delivery',
                            street: data.deliveryAddress?.address || data.deliveryAddress?.street || '',
                            city: data.deliveryAddress?.city || '',
                            state: data.deliveryAddress?.state || '',
                            pincode: data.deliveryAddress?.pincode || '',
                            coordinates: data.deliveryAddress?.coordinates || { lat: 0, lng: 0 }
                        }
                    }
                } as Order;
            });

            // Apply client-side filters
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

                orders = orders.filter(order => order.updatedAt >= startDate);
            }

            // Sort by updatedAt descending (newest first)
            orders.sort((a, b) => {
                const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date();
                const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date();
                return dateB.getTime() - dateA.getTime();
            });

            console.log('Found completed orders:', orders.length);
            console.log('Completed order statuses:', orders.map(o => ({ id: o.id.slice(0, 8), status: o.status })));

            // Limit to 50 most recent
            return orders.slice(0, 50);
        } catch (error: any) {
            console.error('Error fetching completed orders:', error);
            return [];
        }
    },

    async acceptOrder(orderId: string, agentId: string): Promise<void> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data() as Order;

            // Check if order is still available
            if (orderData.deliveryAgentId) {
                throw new Error('Order is already assigned to another agent');
            }

            if (!['placed', 'confirmed', 'preparing', 'ready'].includes(orderData.status)) {
                throw new Error('Order is no longer available');
            }

            const newTimeline = [
                ...(orderData.timeline || []),
                {
                    status: 'agent_assigned' as const,
                    timestamp: Timestamp.now(),
                    note: 'Delivery agent accepted the order'
                }
            ];

            // Set deliveryStatus separately - don't change order status
            await updateDoc(orderRef, {
                deliveryAgentId: agentId,
                deliveryStatus: 'assigned', // Separate delivery agent status
                // Keep order status as is (restaurant status)
                timeline: newTimeline,
                updatedAt: Timestamp.now()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to accept order');
        }
    },

    async updateOrderStatus(orderId: string, status: string, note?: string, location?: { lat: number; lng: number }): Promise<void> {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await getDoc(orderRef);

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data() as Order;

            // Delivery agent can only update orders assigned to them
            if (!orderData.deliveryAgentId) {
                throw new Error('This order is not assigned to a delivery agent yet');
            }

            // Get current location from deliveryAgents collection if not provided
            if (!location) {
                try {
                    const agentDoc = await getDoc(doc(db, 'deliveryAgents', orderData.deliveryAgentId));
                    if (agentDoc.exists()) {
                        const agentData = agentDoc.data();
                        if (agentData.currentLocation && agentData.currentLocation.lat !== 0) {
                            location = agentData.currentLocation;
                        }
                    }
                } catch (error) {
                    console.debug('Could not fetch agent location:', error);
                }
            }

            // Delivery agent can only set these statuses
            const allowedStatuses = ['picked_up', 'on_the_way', 'out_for_delivery', 'delivered', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                throw new Error(`Delivery agent can only update status to: ${allowedStatuses.join(', ')}`);
            }

            // Validate status flow for delivery agent
            const currentDeliveryStatus = orderData.deliveryStatus || 'assigned';
            const validTransitions: { [key: string]: string[] } = {
                'assigned': ['picked_up', 'cancelled'],
                'picked_up': ['on_the_way', 'out_for_delivery', 'cancelled'],
                'on_the_way': ['delivered', 'out_for_delivery', 'cancelled'],
                'out_for_delivery': ['delivered', 'cancelled']
            };

            if (validTransitions[currentDeliveryStatus] && !validTransitions[currentDeliveryStatus].includes(status)) {
                throw new Error(`Cannot change delivery status from ${currentDeliveryStatus} to ${status}`);
            }

            // Delivery agent can only pick up when food is ready
            // Check if trying to transition from 'assigned' to 'picked_up'
            if (currentDeliveryStatus === 'assigned' && status === 'picked_up') {
                // Food must be ready for pickup
                if (orderData.status !== 'ready' && orderData.status !== 'picked_up') {
                    throw new Error('Cannot pick up order. Food is not ready yet. Current status: ' + orderData.status);
                }
            }

            // Prepare timeline entry
            const timelineEntry: any = {
                status: status as any,
                timestamp: Timestamp.now(),
                note: note || `Delivery status updated to ${status}`
            };

            // Only add location if it's provided
            if (location) {
                timelineEntry.location = location;
            }

            const newTimeline = [
                ...(orderData.timeline || []),
                timelineEntry
            ];

            const updateData: any = {
                deliveryStatus: status, // Update delivery status separately
                timeline: newTimeline,
                updatedAt: Timestamp.now()
            };

            // Also update main order status for key milestones
            if (status === 'picked_up') {
                // When agent picks up, update main order status too
                updateData.status = 'picked_up';
            } else if (status === 'on_the_way' || status === 'out_for_delivery') {
                updateData.status = 'on_the_way';
            } else if (status === 'delivered') {
                updateData.status = 'delivered';
                updateData.actualDeliveryTime = Timestamp.now();
            } else if (status === 'cancelled') {
                updateData.status = 'cancelled';
            }

            await updateDoc(orderRef, updateData);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update order status');
        }
    },

    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const data = orderDoc.data();
            console.log('Order distance from DB:', data.distance, 'type:', typeof data.distance);

            // Calculate distance if not stored in database (for old orders)
            let distance = data.distance || 0;
            if (!distance || distance === 0) {
                const restaurantCoords = data.restaurantAddress?.coordinates || { lat: 0, lng: 0 };
                const deliveryCoords = data.deliveryAddress?.coordinates || { lat: 0, lng: 0 };

                if (restaurantCoords.lat !== 0 && deliveryCoords.lat !== 0) {
                    distance = this.calculateDistance(restaurantCoords, deliveryCoords);
                    console.log('Calculated distance on-the-fly:', distance);
                }
            }

            return {
                id: orderDoc.id,
                orderNumber: data.orderNumber || '',
                customerId: data.userId || data.customerId || '',
                restaurantId: data.restaurantId || data.establishmentId || '',
                deliveryAgentId: data.deliveryAgentId || null,
                customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                customerPhone: data.deliveryAddress?.phone || data.customerPhone || '',
                items: (data.items || []).map((item: any) => {
                    const price = item.menuItem?.discountPrice && item.menuItem.discountPrice !== ''
                        ? parseFloat(item.menuItem.discountPrice)
                        : parseFloat(item.menuItem?.price || item.price || 0);

                    return {
                        menuItemId: item.menuItem?.id || item.menuItemId || item.id || '',
                        name: item.menuItem?.name || item.name || 'Item',
                        price: isNaN(price) ? 0 : price,
                        quantity: item.quantity || 1,
                        customizations: Array.isArray(item.customizations)
                            ? item.customizations.map((c: any) => typeof c === 'string' ? c : c.name || c)
                            : [],
                        specialInstructions: item.specialInstructions || ''
                    };
                }),
                pricing: {
                    subtotal: parseFloat(data.pricing?.itemTotal || data.pricing?.subtotal || 0) || 0,
                    tax: parseFloat(data.pricing?.taxes || data.pricing?.tax || 0) || 0,
                    deliveryFee: parseFloat(data.pricing?.deliveryFee || 0) || 0,
                    discount: parseFloat(data.pricing?.discount || 0) || 0,
                    total: parseFloat(data.pricing?.total || 0) || 0
                },
                status: data.status,
                deliveryStatus: data.deliveryStatus || null,
                payment: data.payment || { method: 'cash', status: 'pending', amount: data.pricing?.total || 0 },
                distance: distance,
                deliveryFee: data.pricing?.deliveryFee || 0,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                timeline: data.timeline?.map((t: any) => ({
                    ...t,
                    timestamp: t.timestamp?.toDate() || new Date()
                })) || [],
                addresses: {
                    restaurant: {
                        id: data.restaurantId || '',
                        label: 'Restaurant',
                        street: data.restaurantAddress?.address || data.restaurantAddress?.street || '',
                        city: data.restaurantAddress?.city || '',
                        state: data.restaurantAddress?.state || '',
                        pincode: data.restaurantAddress?.pincode || '',
                        coordinates: data.restaurantAddress?.coordinates || data.restaurantLocation || { lat: 0, lng: 0 }
                    },
                    delivery: {
                        id: data.deliveryAddress?.id || '',
                        label: data.deliveryAddress?.label || 'Delivery',
                        street: data.deliveryAddress?.address || data.deliveryAddress?.street || '',
                        city: data.deliveryAddress?.city || '',
                        state: data.deliveryAddress?.state || '',
                        pincode: data.deliveryAddress?.pincode || '',
                        coordinates: data.deliveryAddress?.coordinates || { lat: 0, lng: 0 }
                    }
                }
            } as Order;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch order details');
        }
    },

    openGoogleMaps(destination: { lat: number; lng: number }, origin?: { lat: number; lng: number }): void {
        // Create Google Maps URL with directions
        let url = `https://www.google.com/maps/dir/?api=1`;

        if (origin) {
            url += `&origin=${origin.lat},${origin.lng}`;
        }

        url += `&destination=${destination.lat},${destination.lng}`;
        url += `&travelmode=driving`;

        // Open in new tab/window or native Google Maps app
        window.open(url, '_blank');
    },

    calculateDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }): number {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(pos2.lat - pos1.lat);
        const dLng = this.deg2rad(pos2.lng - pos1.lng);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(pos1.lat)) * Math.cos(this.deg2rad(pos2.lat)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in km
        return d;
    },

    deg2rad(deg: number): number {
        return deg * (Math.PI/180);
    },

    subscribeToAvailableOrders(agentLocation: { lat: number; lng: number }, callback: (orders: Order[]) => void) {
        const q = query(
            collection(db, 'orders'),
            where('status', '==', 'ready'),
            where('deliveryAgentId', '==', null),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    orderNumber: data.orderNumber || '',
                    customerId: data.userId || data.customerId || '',
                    restaurantId: data.restaurantId || data.establishmentId || '',
                    deliveryAgentId: data.deliveryAgentId || null,
                    customerName: data.deliveryAddress?.name || data.customerName || 'Customer',
                    customerPhone: data.deliveryAddress?.phone || data.customerPhone || '',
                    items: (data.items || []).map((item: any) => {
                        console.log('Mapping item:', item);
                        return {
                            menuItemId: item.menuItem?.id || item.menuItemId || item.id || '',
                            name: item.menuItem?.name || item.name || 'Item',
                            price: item.menuItem?.price || item.price || item.menuItem?.discountPrice || 0,
                            quantity: item.quantity || 1,
                            customizations: Array.isArray(item.customizations)
                                ? item.customizations.map((c: any) => typeof c === 'string' ? c : c.name || c)
                                : [],
                            specialInstructions: item.specialInstructions || '',
                            images: item.menuItem?.images || item.images || []
                        };
                    }),
                    pricing: {
                        subtotal: parseFloat(data.pricing?.itemTotal || data.pricing?.subtotal || 0) || 0,
                        tax: parseFloat(data.pricing?.taxes || data.pricing?.tax || 0) || 0,
                        deliveryFee: parseFloat(data.pricing?.deliveryFee || 0) || 0,
                        discount: parseFloat(data.pricing?.discount || 0) || 0,
                        total: parseFloat(data.pricing?.total || 0) || 0
                    },
                    status: data.status,
                    deliveryStatus: data.deliveryStatus || null,
                    payment: data.payment || { method: 'cash', status: 'pending', amount: data.pricing?.total || 0 },
                    distance: data.distance || 0,
                    deliveryFee: data.pricing?.deliveryFee || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
                    actualDeliveryTime: data.actualDeliveryTime?.toDate(),
                    timeline: data.timeline?.map((t: any) => ({
                        ...t,
                        timestamp: t.timestamp?.toDate() || new Date()
                    })) || [],
                    addresses: {
                        restaurant: {
                            id: data.restaurantId || '',
                            label: 'Restaurant',
                            street: data.restaurantAddress?.address || data.restaurantAddress?.street || '',
                            city: data.restaurantAddress?.city || '',
                            state: data.restaurantAddress?.state || '',
                            pincode: data.restaurantAddress?.pincode || '',
                            coordinates: data.restaurantAddress?.coordinates || data.restaurantLocation || { lat: 0, lng: 0 }
                        },
                        delivery: {
                            id: data.deliveryAddress?.id || '',
                            label: data.deliveryAddress?.label || 'Delivery',
                            street: data.deliveryAddress?.address || data.deliveryAddress?.street || '',
                            city: data.deliveryAddress?.city || '',
                            state: data.deliveryAddress?.state || '',
                            pincode: data.deliveryAddress?.pincode || '',
                            coordinates: data.deliveryAddress?.coordinates || { lat: 0, lng: 0 }
                        }
                    }
                } as Order;
            });

            // Filter by distance
            const nearbyOrders = orders.filter(order => {
                const distance = this.calculateDistance(
                    agentLocation,
                    order.addresses.restaurant.coordinates
                );
                return distance <= 5; // 5km radius
            });

            callback(nearbyOrders);
        });
    }
};
