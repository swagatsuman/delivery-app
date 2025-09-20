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
    async getCategories(restaurantId: string): Promise<Category[]> {
        try {
            const q = query(
                collection(db, 'categories'),
                where('restaurantId', '==', restaurantId),
                orderBy('sortOrder', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        } catch (error: any) {
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

    async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
        try {
            let q = query(
                collection(db, 'menuItems'),
                where('restaurantId', '==', restaurantId),
                orderBy('createdAt', 'desc')
            );

            if (categoryId) {
                q = query(
                    collection(db, 'menuItems'),
                    where('restaurantId', '==', restaurantId),
                    where('categoryId', '==', categoryId),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
        } catch (error: any) {
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
