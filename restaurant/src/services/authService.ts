import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
    sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

            if (userData.role !== 'restaurant') {
                await signOut(auth);
                throw new Error('Access denied. Restaurant account required.');
            }

            return { user, userData };
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    async signUp(signupData: any) {
        try {
            const { email, password, ...userData } = signupData;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc: User = {
                uid: user.uid,
                email: user.email!,
                role: 'restaurant',
                name: userData.ownerName,
                phone: userData.phone,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                restaurantDetails: {
                    businessName: userData.businessName,
                    ownerName: userData.ownerName,
                    gstin: userData.gstin,
                    address: userData.address,
                    cuisineTypes: userData.cuisineTypes || [],
                    operatingHours: {
                        open: '09:00',
                        close: '23:00',
                        isOpen: false
                    },
                    rating: 0,
                    totalRatings: 0,
                    deliveryRadius: userData.deliveryRadius || 5,
                    minimumOrderValue: userData.minimumOrderValue || 100,
                    deliveryFee: userData.deliveryFee || 30,
                    estimatedDeliveryTime: userData.estimatedDeliveryTime || 30,
                    totalOrders: 0,
                    revenue: 0,
                    description: userData.description || '',
                    images: []
                }
            };

            await setDoc(doc(db, 'users', user.uid), userDoc);
            await sendEmailVerification(user);

            return { user, userData: userDoc };
        } catch (error: any) {
            throw new Error(error.message || 'Signup failed');
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
                            if (userData.role === 'restaurant') {
                                resolve({ user, userData });
                            } else {
                                resolve(null);
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
                        if (userData.role === 'restaurant') {
                            callback({ user, userData });
                        } else {
                            callback(null);
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

    async updateRestaurantStatus(isOpen: boolean) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await setDoc(doc(db, 'users', user.uid), {
                restaurantDetails: {
                    operatingHours: {
                        isOpen
                    }
                },
                updatedAt: new Date()
            }, { merge: true });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update restaurant status');
        }
    }
};
