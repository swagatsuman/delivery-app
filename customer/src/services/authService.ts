import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

export const authService = {
    async signIn(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                throw new Error('User data not found');
            }

            const userData = userDoc.data() as User;

            if (userData.role !== 'customer') {
                await signOut(auth);
                throw new Error('Access denied. Customer account required.');
            }

            return { user, userData };
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    async signUp(signupData: {
        email: string;
        password: string;
        name: string;
        phone: string;
    }) {
        try {
            const { email, password, name, phone } = signupData;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in users collection
            const userDoc: User = {
                uid: user.uid,
                email: user.email!,
                role: 'customer',
                name: name,
                phone: phone,
                status: 'active', // Customers are active immediately, unlike restaurants which are 'pending'
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save user document
            await setDoc(doc(db, 'users', user.uid), userDoc);

            // Send email verification
            await sendEmailVerification(user);

            return { user, userData: userDoc };
        } catch (error: any) {
            throw new Error(error.message || 'Signup failed');
            }
    },

    async resetPassword(email: string) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to send password reset email');
            }
    },

    async signOut() {
        try {
            await signOut(auth);
        } catch (error: any) {
            throw new Error(error.message || 'Logout failed');
            }
    },

    async getCurrentUser(): Promise<{ user: FirebaseUser; userData: User } | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();
                if (user) {
                try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                            const userData = userDoc.data() as User;
                            if (userData.role === 'customer') {
                                resolve({ user, userData });
                            } else {
                                resolve(null); // Not a customer account
                            }
                    } else {
                            resolve(null);
                    }
                } catch (error) {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    },

    onAuthStateChanged(callback: (user: { user: FirebaseUser; userData: User } | null) => void) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
        try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        if (userData.role === 'customer') {
                            callback({ user, userData });
                        } else {
                            callback(null); // Not a customer account
                        }
                    } else {
                        callback(null);
                    }
        } catch (error) {
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    },

    async updateProfile(profileData: {
        name?: string;
        phone?: string;
        email?: string;
        defaultAddressId?: string;
    }) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            // Update user document
            const userUpdateData = {
                ...profileData,
                updatedAt: new Date()
            };

            await updateDoc(doc(db, 'users', user.uid), userUpdateData);

            // Get updated user data
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data() as User;

            return userData;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update profile');
        }
    },

    // Helper methods for customer-specific features
    async updateDefaultAddress(addressId: string) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await updateDoc(doc(db, 'users', user.uid), {
                defaultAddressId: addressId,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update default address');
        }
    },

    async updateUserStatus(status: 'active' | 'inactive') {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await updateDoc(doc(db, 'users', user.uid), {
                status: status,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update user status');
    }
    },

    // Get auth token for API calls
    getAuthToken(): string | null {
        return auth.currentUser?.uid || null;
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!auth.currentUser;
    },

    // Get current Firebase user
    getCurrentFirebaseUser() {
        return auth.currentUser;
    }
};
