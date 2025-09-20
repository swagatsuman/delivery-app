import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, RestaurantFilters } from '../types';
import { USER_ROLES } from '../utils/constants';

export const restaurantService = {
    async getRestaurants(params?: {
        filters?: RestaurantFilters;
        page?: number;
        limit?: number;
        lastDoc?: DocumentSnapshot;
    }) {
        try {
            const pageLimit = params?.limit || 20;
            const filters = params?.filters || { status: 'all', search: '', cuisine: '', rating: null };

            let q = query(
                collection(db, 'users'),
                where('role', '==', USER_ROLES.RESTAURANT),
                orderBy('createdAt', 'desc'),
                limit(pageLimit)
            );

            // Apply filters
            if (filters.status !== 'all') {
                q = query(q, where('status', '==', filters.status));
            }

            // Add pagination
            if (params?.lastDoc) {
                q = query(q, startAfter(params.lastDoc));
            }

            const snapshot = await getDocs(q);
            const restaurants = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            })) as User[];

            // Apply search filter (client-side for now)
            let filteredRestaurants = restaurants;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredRestaurants = restaurants.filter(restaurant =>
                    restaurant.name.toLowerCase().includes(searchTerm) ||
                    restaurant.email.toLowerCase().includes(searchTerm) ||
                    restaurant.restaurantDetails?.businessName.toLowerCase().includes(searchTerm)
                );
            }

            // Apply cuisine filter
            if (filters.cuisine) {
                filteredRestaurants = filteredRestaurants.filter(restaurant =>
                    restaurant.restaurantDetails?.cuisineTypes.includes(filters.cuisine)
                );
            }

            // Apply rating filter
            if (filters.rating) {
                filteredRestaurants = filteredRestaurants.filter(restaurant =>
                    (restaurant.restaurantDetails?.rating || 0) >= filters.rating!
                );
            }

            return {
                restaurants: filteredRestaurants,
                total: filteredRestaurants.length,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch restaurants');
        }
    },

    async getRestaurantDetails(id: string) {
        try {
            const userDoc = await getDoc(doc(db, 'users', id));
            if (!userDoc.exists()) {
                throw new Error('Restaurant not found');
            }

            const userData = userDoc.data() as User;
            if (userData.role !== USER_ROLES.RESTAURANT) {
                throw new Error('Invalid restaurant ID');
            }

            return { ...userData, uid: userDoc.id };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch restaurant details');
        }
    },

    async updateRestaurantStatus(uid: string, status: string) {
        try {
            await updateDoc(doc(db, 'users', uid), {
                status,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update restaurant status');
        }
    },

    async getRestaurantStats(uid: string) {
        try {
            // This would typically involve aggregating data from orders collection
            // For now, returning mock data
            return {
                totalOrders: 0,
                revenue: 0,
                rating: 0,
                totalRatings: 0
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch restaurant stats');
        }
    }
};
