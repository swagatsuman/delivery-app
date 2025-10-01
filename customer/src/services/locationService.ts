import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Address } from '../types';

class LocationService {

    async setCurrentLocation(address: Address): Promise<void> {
        localStorage.setItem('foodEatsCurrentLocation', JSON.stringify(address));
    }

    async getCurrentLocation(): Promise<Address | null> {
        const stored = localStorage.getItem('foodEatsCurrentLocation');
        return stored ? JSON.parse(stored) : null;
    }

    async getUserAddresses(userId: string): Promise<Address[]> {
        try {
            const addressesRef = collection(db, 'addresses');
            const q = query(addressesRef, where('userId', '==', userId));
            const snapshot = await getDocs(q);

            const addresses: Address[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                addresses.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as Address);
            });

            return addresses;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw new Error('Failed to fetch addresses');
        }
    }

    async addAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const addressDoc = {
                ...address,
                userId: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, 'addresses'), addressDoc);

            return {
                id: docRef.id,
                ...address,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } catch (error) {
            console.error('Error adding address:', error);
            throw new Error('Failed to add address');
        }
    }

    async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
        try {
            const addressRef = doc(db, 'addresses', id);
            const updateData = {
                ...data,
                updatedAt: Timestamp.now()
            };

            await updateDoc(addressRef, updateData);

            return {
                id,
                ...data,
                updatedAt: new Date()
            } as Address;
        } catch (error) {
            console.error('Error updating address:', error);
            throw new Error('Failed to update address');
        }
    }

    async deleteAddress(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'addresses', id));
        } catch (error) {
            console.error('Error deleting address:', error);
            throw new Error('Failed to delete address');
        }
    }

    async setDefaultAddress(addressId: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // First, unset all default addresses for this user
            const addressesRef = collection(db, 'addresses');
            const userAddressesQuery = query(addressesRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(userAddressesQuery);

            const batch = [];
            snapshot.docs.forEach((doc) => {
                batch.push(updateDoc(doc.ref, { isDefault: false }));
            });

            await Promise.all(batch);

            // Set the selected address as default
            await updateDoc(doc(db, 'addresses', addressId), {
                isDefault: true,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error setting default address:', error);
            throw new Error('Failed to set default address');
        }
    }
}

export const locationService = new LocationService();
