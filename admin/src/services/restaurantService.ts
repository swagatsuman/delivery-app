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
import type { User, Restaurant, RestaurantFilters } from '../types';
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

            let q;

            // Build query based on whether we need status filter or not
            if (filters.status !== 'all') {
                // Query with both role and status filters + ordering
                q = query(
                collection(db, 'users'),
                where('role', '==', USER_ROLES.RESTAURANT),
                    where('status', '==', filters.status),
                orderBy('createdAt', 'desc'),
                limit(pageLimit)
            );
            } else {
                // Query with only role filter + ordering
                q = query(
                    collection(db, 'users'),
                    where('role', '==', USER_ROLES.RESTAURANT),
                    orderBy('createdAt', 'desc'),
                    limit(pageLimit)
                );
            }

            // Add pagination if provided
            if (params?.lastDoc) {
                q = query(q, startAfter(params.lastDoc));
            }

            console.log('Executing query with filters:', filters);
            const snapshot = await getDocs(q);
            console.log('Query results count:', snapshot.size);

            let restaurantUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('User document:', { id: doc.id, role: data.role, status: data.status, name: data.name });
                return {
                    ...data,
                uid: doc.id
                } as User;
            });

            console.log('Restaurant users found:', restaurantUsers.length);

            // Fetch restaurant details for each user
            const restaurantsWithDetails = await Promise.all(
                restaurantUsers.map(async (user) => {
                    try {
                        const restaurantDoc = await getDoc(doc(db, 'restaurants', user.uid));
                        if (restaurantDoc.exists()) {
                            const restaurantDetails = restaurantDoc.data() as Restaurant;
                            console.log('Restaurant details found for:', user.uid, restaurantDetails.businessName);
                            return { ...user, restaurantDetails };
                        } else {
                            console.warn('No restaurant details found for user:', user.uid);
                        return user;
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch restaurant details for user ${user.uid}:`, error);
                        return user;
                    }
                })
            );

            let restaurants = restaurantsWithDetails;

            // Apply client-side filters
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                restaurants = restaurants.filter(restaurant =>
                    restaurant.name.toLowerCase().includes(searchTerm) ||
                    restaurant.email.toLowerCase().includes(searchTerm) ||
                    (restaurant.restaurantDetails?.businessName &&
                     restaurant.restaurantDetails.businessName.toLowerCase().includes(searchTerm))
                );
            }

            // Apply cuisine filter
            if (filters.cuisine) {
                restaurants = restaurants.filter(restaurant =>
                    restaurant.restaurantDetails?.cuisineTypes?.includes(filters.cuisine)
                );
            }

            // Apply rating filter
            if (filters.rating) {
                restaurants = restaurants.filter(restaurant =>
                    (restaurant.restaurantDetails?.rating || 0) >= filters.rating!
                );
            }

            console.log('Final filtered restaurants:', restaurants.length);

            return {
                restaurants: restaurants,
                total: restaurants.length,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        } catch (error: any) {
            console.error('Error in getRestaurants:', error);
            throw new Error(error.message || 'Failed to fetch restaurants');
        }
    },

    async getRestaurantDetails(id: string) {
        try {
            // Fetch user data
            const userDoc = await getDoc(doc(db, 'users', id));
            if (!userDoc.exists()) {
                throw new Error('Restaurant user not found');
            }

            const userData = userDoc.data() as User;
            if (userData.role !== USER_ROLES.RESTAURANT) {
                throw new Error('Invalid restaurant ID');
            }

            // Fetch restaurant details
            const restaurantDoc = await getDoc(doc(db, 'restaurants', id));
            let restaurantDetails = null;
            if (restaurantDoc.exists()) {
                restaurantDetails = restaurantDoc.data() as Restaurant;
            }

            return {
                ...userData,
                uid: userDoc.id,
                restaurantDetails
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch restaurant details');
        }
    },

    async updateRestaurantStatus(uid: string, status: string) {
        try {
            console.log(`Updating restaurant status: ${uid} -> ${status}`);

            // Update status in users collection only
            await updateDoc(doc(db, 'users', uid), {
                status,
                updatedAt: new Date()
            });

            // Update isActive in restaurants collection based on status
            const restaurantUpdates: any = { updatedAt: new Date() };

            if (status === 'active') {
                restaurantUpdates.isActive = true;
            } else if (status === 'suspended' || status === 'inactive') {
                restaurantUpdates.isActive = false;
                restaurantUpdates['operatingHours.isOpen'] = false;
            }

            await updateDoc(doc(db, 'restaurants', uid), restaurantUpdates);

            console.log('Restaurant status updated successfully');
        } catch (error: any) {
            console.error('Error updating restaurant status:', error);
            throw new Error(error.message || 'Failed to update restaurant status');
        }
    },

    async getRestaurantStats(uid: string) {
        try {
            // Fetch restaurant details
            const restaurantDoc = await getDoc(doc(db, 'restaurants', uid));
            if (restaurantDoc.exists()) {
                const restaurant = restaurantDoc.data() as Restaurant;
                return {
                    totalOrders: restaurant.totalOrders || 0,
                    revenue: restaurant.revenue || 0,
                    rating: restaurant.rating || 0,
                    totalRatings: restaurant.totalRatings || 0
                };
            }

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
