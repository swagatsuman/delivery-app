import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { OrderRating } from '../types';

export interface RatingData {
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    restaurantId: string;
    deliveryAgentId?: string;
    foodRating: number;
    foodReview?: string;
    deliveryRating: number;
    deliveryReview?: string;
    createdAt: Date;
}

class RatingService {
    async createRating(orderId: string, rating: OrderRating): Promise<RatingData> {
        try {
            // Fetch order details to get all necessary info
            const orderDoc = await getDoc(doc(db, 'orders', orderId));

            if (!orderDoc.exists()) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data();

            console.log('Creating rating for order:', orderId);
            console.log('Order restaurantId:', orderData.restaurantId);
            console.log('Order data keys:', Object.keys(orderData));

            // Create rating document
            const ratingData: RatingData = {
                orderId,
                orderNumber: orderData.orderNumber || orderId.slice(0, 8),
                customerId: orderData.userId || orderData.customerId,
                customerName: orderData.deliveryAddress?.name || 'Anonymous',
                restaurantId: orderData.restaurantId || orderData.establishmentId,
                deliveryAgentId: orderData.deliveryAgentId || undefined,
                foodRating: rating.foodRating,
                foodReview: rating.foodReview,
                deliveryRating: rating.deliveryRating,
                deliveryReview: rating.deliveryReview,
                createdAt: new Date()
            };

            console.log('Rating data to be stored:', ratingData);

            // Add to ratings collection
            const ratingsRef = collection(db, 'ratings');
            const docRef = await addDoc(ratingsRef, {
                ...ratingData,
                createdAt: Timestamp.now()
            });

            console.log('Rating created successfully with ID:', docRef.id);

            return ratingData;
        } catch (error) {
            console.error('Error creating rating:', error);
            throw new Error('Failed to submit rating');
        }
    }
}

export const ratingService = new RatingService();
