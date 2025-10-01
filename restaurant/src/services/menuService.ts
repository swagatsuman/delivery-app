import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Category, MenuItem } from '../types';

export const menuService = {
    async getCategories(establishmentId: string): Promise<Category[]> {
        try {
            // First try with compound index (establishmentId + sortOrder)
            let q = query(
                collection(db, 'categories'),
                where('establishmentId', '==', establishmentId),
                orderBy('sortOrder', 'asc')
            );

            try {
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            } catch (indexError: any) {
                console.warn('Compound index not found for categories, trying simple query:', indexError.message);

                // Fallback to simple query without orderBy
                q = query(
                    collection(db, 'categories'),
                    where('establishmentId', '==', establishmentId)
                );

                const snapshot = await getDocs(q);
                const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

                // Sort client-side
                return categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            // Return empty array for missing collection instead of throwing
            if (error.message?.includes('collection') || error.message?.includes('index')) {
                return [];
            }
            throw new Error(error.message || 'Failed to fetch categories');
        }
    },

    async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
        try {
            const docRef = await addDoc(collection(db, 'categories'), {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { id: docRef.id, ...data, createdAt: new Date(), updatedAt: new Date() };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create category');
        }
    },

    async updateCategory(id: string, data: Partial<Category>): Promise<void> {
        try {
            await updateDoc(doc(db, 'categories', id), {
                ...data,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update category');
        }
    },

    async deleteCategory(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'categories', id));
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete category');
        }
    },

    async getMenuItems(establishmentId: string, categoryId?: string): Promise<MenuItem[]> {
        try {
            let q;

            if (categoryId) {
                // Try compound index query first (establishmentId + categoryId + createdAt)
                try {
                    q = query(
                collection(db, 'menuItems'),
                where('establishmentId', '==', establishmentId),
                        where('categoryId', '==', categoryId),
                orderBy('createdAt', 'desc')
            );

                    const snapshot = await getDocs(q);
                    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
                } catch (indexError: any) {
                    console.warn('Compound index not found for menu items with category, trying simple query:', indexError.message);

                    // Fallback to simple query without orderBy
                    q = query(
                        collection(db, 'menuItems'),
                        where('establishmentId', '==', establishmentId),
                        where('categoryId', '==', categoryId)
                    );
                }
            } else {
                // Try single field index query first (establishmentId + createdAt)
                try {
                q = query(
                    collection(db, 'menuItems'),
                    where('establishmentId', '==', establishmentId),
                    orderBy('createdAt', 'desc')
                );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
                } catch (indexError: any) {
                    console.warn('Index not found for menu items, trying simple query:', indexError.message);

                    // Fallback to simple query without orderBy
                    q = query(
                        collection(db, 'menuItems'),
                        where('establishmentId', '==', establishmentId)
                    );
                }
            }

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));

            // Sort client-side when orderBy is not available
            return items.sort((a, b) => {
                const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });

        } catch (error: any) {
            console.error('Error fetching menu items:', error);
            // Return empty array for missing collection instead of throwing
            if (error.message?.includes('collection') || error.message?.includes('index')) {
                return [];
            }
            throw new Error(error.message || 'Failed to fetch menu items');
        }
    },

    async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
        try {
            const docRef = await addDoc(collection(db, 'menuItems'), {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { id: docRef.id, ...data, createdAt: new Date(), updatedAt: new Date() };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create menu item');
        }
    },

    async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
        try {
            await updateDoc(doc(db, 'menuItems', id), {
                ...data,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update menu item');
        }
    },

    async deleteMenuItem(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'menuItems', id));
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete menu item');
        }
    }
};
