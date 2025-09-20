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
import type { User, UserFilters } from '../types';

export const userService = {
    async getUsers(params?: {
        filters?: UserFilters;
        page?: number;
        limit?: number;
        lastDoc?: DocumentSnapshot;
    }) {
        try {
            const pageLimit = params?.limit || 20;
            const filters = params?.filters || { role: 'all', status: 'all', search: '' };

            let q = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                limit(pageLimit)
            );

            // Apply role filter
            if (filters.role !== 'all') {
                q = query(q, where('role', '==', filters.role));
            }

            // Apply status filter
            if (filters.status !== 'all') {
                q = query(q, where('status', '==', filters.status));
            }

            // Add pagination
            if (params?.lastDoc) {
                q = query(q, startAfter(params.lastDoc));
            }

            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            })) as User[];

            // Apply search filter (client-side)
            let filteredUsers = users;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredUsers = users.filter(user =>
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm) ||
                    (user.phone && user.phone.includes(searchTerm))
                );
            }

            return {
                users: filteredUsers,
                total: filteredUsers.length,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch users');
        }
    },

    async getUserDetails(id: string) {
        try {
            const userDoc = await getDoc(doc(db, 'users', id));
            if (!userDoc.exists()) {
                throw new Error('User not found');
            }

            return { ...userDoc.data(), uid: userDoc.id } as User;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch user details');
        }
    },

    async updateUserStatus(uid: string, status: string) {
        try {
            await updateDoc(doc(db, 'users', uid), {
                status,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update user status');
        }
    }
};
