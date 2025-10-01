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
import type { User, Establishment, EstablishmentFilters, EstablishmentType } from '../types';
import { USER_ROLES } from '../utils/constants';

export const establishmentService = {
    async getEstablishments(params?: {
        filters?: EstablishmentFilters;
        page?: number;
        limit?: number;
        lastDoc?: DocumentSnapshot;
    }) {
        try {
            const pageLimit = params?.limit || 20;
            const filters = params?.filters || {
                status: 'all',
                establishmentType: 'all',
                search: '',
                cuisine: '',
                rating: null
            };

            let snapshot;

            try {
                // Try the simplest query first - only filter by role
                const q = query(
                    collection(db, 'users'),
                    where('role', '==', USER_ROLES.ESTABLISHMENT),
                    limit(pageLimit * 3)
                );

                console.log('Executing establishment query with role filter...');
                snapshot = await getDocs(q);
                console.log('Query results count:', snapshot.size);
            } catch (roleQueryError) {
                console.warn('Role-based query failed, falling back to all users:', roleQueryError);

                // Fallback: Get all users and filter client-side
                const allUsersQuery = query(
                    collection(db, 'users'),
                    limit(pageLimit * 5) // Get more since we need to filter
                );

                snapshot = await getDocs(allUsersQuery);
                console.log('Fallback query results count:', snapshot.size);
            }

            let establishmentUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    uid: doc.id
                } as User;
            }).filter(user => user.role === USER_ROLES.ESTABLISHMENT); // Ensure we only get establishments

            console.log('Establishment users found:', establishmentUsers.length);

            // Fetch establishment details for each user
            const establishmentsWithDetails = await Promise.all(
                establishmentUsers.map(async (user) => {
                    try {
                        const establishmentDoc = await getDoc(doc(db, 'establishments', user.uid));
                        if (establishmentDoc.exists()) {
                            const establishmentDetails = establishmentDoc.data() as Establishment;
                            console.log('Establishment details found for:', user.uid, establishmentDetails.businessName);
                            return { ...user, establishmentDetails };
                        } else {
                            console.warn('No establishment details found for user:', user.uid);
                            return user;
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch establishment details for user ${user.uid}:`, error);
                        return user;
                    }
                })
            );

            let establishments = establishmentsWithDetails;

            // Sort by createdAt desc (client-side since we removed orderBy from query)
            establishments.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });

            // Apply client-side status filter first (most restrictive)
            if (filters.status && filters.status !== 'all') {
                establishments = establishments.filter(establishment =>
                    establishment.status === filters.status
                );
            }

            // Apply client-side search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                establishments = establishments.filter(establishment =>
                    establishment.name.toLowerCase().includes(searchTerm) ||
                    establishment.email.toLowerCase().includes(searchTerm) ||
                    (establishment.establishmentDetails?.businessName &&
                     establishment.establishmentDetails.businessName.toLowerCase().includes(searchTerm))
                );
            }

            // Apply establishment type filter
            if (filters.establishmentType && filters.establishmentType !== 'all') {
                establishments = establishments.filter(establishment =>
                    establishment.establishmentDetails?.establishmentType === filters.establishmentType
                );
            }

            // Apply cuisine filter
            if (filters.cuisine) {
                establishments = establishments.filter(establishment =>
                    establishment.establishmentDetails?.cuisineTypes?.includes(filters.cuisine)
                );
            }

            // Apply rating filter
            if (filters.rating) {
                establishments = establishments.filter(establishment =>
                    (establishment.establishmentDetails?.rating || 0) >= filters.rating!
                );
            }

            console.log('Final filtered establishments:', establishments.length);

            // Limit results to the requested page size after filtering
            const paginatedEstablishments = establishments.slice(0, pageLimit);

            return {
                establishments: paginatedEstablishments,
                total: establishments.length,
                lastDoc: null, // Pagination disabled for now to avoid index issues
                hasMore: establishments.length > pageLimit
            };
        } catch (error: any) {
            console.error('Error in getEstablishments:', error);
            throw new Error(error.message || 'Failed to fetch establishments');
        }
    },

    async getEstablishmentDetails(id: string) {
        try {
            // Fetch user data
            const userDoc = await getDoc(doc(db, 'users', id));
            if (!userDoc.exists()) {
                throw new Error('Establishment user not found');
            }

            const userData = userDoc.data() as User;
            if (userData.role !== USER_ROLES.ESTABLISHMENT) {
                throw new Error('Invalid establishment ID');
            }

            // Fetch establishment details
            const establishmentDoc = await getDoc(doc(db, 'establishments', id));
            let establishmentDetails = null;
            if (establishmentDoc.exists()) {
                establishmentDetails = establishmentDoc.data() as Establishment;
            }

            return {
                ...userData,
                uid: userDoc.id,
                establishmentDetails
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch establishment details');
        }
    },

    async updateEstablishmentStatus(uid: string, status: string, rejectedReason?: string) {
        try {
            console.log(`Updating establishment status: ${uid} -> ${status}`);

            // Update status in users collection
            await updateDoc(doc(db, 'users', uid), {
                status,
                updatedAt: new Date()
            });

            // Update establishment collection with additional fields
            const establishmentUpdates: any = {
                status,
                updatedAt: new Date()
            };

            if (status === 'approved') {
                establishmentUpdates.approvedAt = new Date();
                establishmentUpdates.isOpen = true;
            } else if (status === 'rejected') {
                establishmentUpdates.rejectedReason = rejectedReason || 'Not specified';
                establishmentUpdates.isOpen = false;
            } else if (status === 'suspended') {
                establishmentUpdates.isOpen = false;
            }

            await updateDoc(doc(db, 'establishments', uid), establishmentUpdates);

            console.log('Establishment status updated successfully');
        } catch (error: any) {
            console.error('Error updating establishment status:', error);
            throw new Error(error.message || 'Failed to update establishment status');
        }
    },

    async approveEstablishment(uid: string, approvedBy: string) {
        try {
            console.log(`Approving establishment: ${uid} by ${approvedBy}`);

            await updateDoc(doc(db, 'users', uid), {
                status: 'active',
                updatedAt: new Date()
            });

            await updateDoc(doc(db, 'establishments', uid), {
                status: 'approved',
                approvedAt: new Date(),
                approvedBy,
                isOpen: true,
                updatedAt: new Date()
            });

            console.log('Establishment approved successfully');
        } catch (error: any) {
            console.error('Error approving establishment:', error);
            throw new Error(error.message || 'Failed to approve establishment');
        }
    },

    async rejectEstablishment(uid: string, rejectedReason: string) {
        try {
            console.log(`Rejecting establishment: ${uid}`);

            await updateDoc(doc(db, 'users', uid), {
                status: 'suspended',
                updatedAt: new Date()
            });

            await updateDoc(doc(db, 'establishments', uid), {
                status: 'rejected',
                rejectedReason,
                isOpen: false,
                updatedAt: new Date()
            });

            console.log('Establishment rejected successfully');
        } catch (error: any) {
            console.error('Error rejecting establishment:', error);
            throw new Error(error.message || 'Failed to reject establishment');
        }
    },

    async getEstablishmentStats(uid: string) {
        try {
            // Fetch establishment details
            const establishmentDoc = await getDoc(doc(db, 'establishments', uid));
            if (establishmentDoc.exists()) {
                const establishment = establishmentDoc.data() as Establishment;
                return {
                    totalOrders: establishment.totalOrders || 0,
                    revenue: establishment.revenue || 0,
                    rating: establishment.rating || 0,
                    totalRatings: establishment.totalRatings || 0
                };
            }

            return {
                totalOrders: 0,
                revenue: 0,
                rating: 0,
                totalRatings: 0
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch establishment stats');
        }
    },

    async getEstablishmentsByType(establishmentType: EstablishmentType) {
        try {
            const q = query(
                collection(db, 'establishments'),
                where('establishmentType', '==', establishmentType),
                where('status', '==', 'approved'),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Establishment));
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch establishments by type');
        }
    }
};