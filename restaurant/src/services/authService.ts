import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
    sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, Restaurant } from '../types';

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

            // If user is a restaurant, also fetch restaurant details
            let restaurantDetails = null;
            if (userData.role === 'restaurant') {
                const restaurantDoc = await getDoc(doc(db, 'restaurants', user.uid));
                if (restaurantDoc.exists()) {
                    restaurantDetails = restaurantDoc.data() as Restaurant;
                }
            }

            return {user, userData: {...userData, restaurantDetails}};
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    async signUp(signupData: any) {
        try {
            const {email, password, ...userData} = signupData;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in users collection (without restaurant details)
            const userDoc: User = {
                uid: user.uid,
                email: user.email!,
                role: 'restaurant',
                name: userData.ownerName,
                phone: userData.phone,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                restaurantId: user.uid // Link to restaurant collection
            };

            // Create restaurant document in restaurants collection
            const restaurantDoc: Restaurant = {
                id: user.uid,
                ownerId: user.uid,
                businessName: userData.businessName,
                ownerName: userData.ownerName,
                email: user.email!,
                phone: userData.phone,
                gstin: userData.gstin,
                description: userData.description || '',
                images: [],
                address: userData.address,
                cuisineTypes: userData.cuisineTypes || [],
                operatingHours: {
                    open: '09:00',
                    close: '23:00',
                    isOpen: false
                },
                rating: 0,
                totalRatings: 0,
                // Removed delivery fields as requested
                estimatedDeliveryTime: userData.estimatedDeliveryTime || 30,
                totalOrders: 0,
                revenue: 0,
                isActive: true,
                featured: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save both documents
            await Promise.all([
                setDoc(doc(db, 'users', user.uid), userDoc),
                setDoc(doc(db, 'restaurants', user.uid), restaurantDoc)
            ]);

            await sendEmailVerification(user);

            return {user, userData: {...userDoc, restaurantDetails: restaurantDoc}};
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
                                // Fetch restaurant details
                                const restaurantDoc = await getDoc(doc(db, 'restaurants', user.uid));
                                if (restaurantDoc.exists()) {
                                    const restaurantDetails = restaurantDoc.data() as Restaurant;
                                    resolve({user, userData: {...userData, restaurantDetails}});
                                } else {
                                    resolve({user, userData});
                                }
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
                            // Fetch restaurant details
                            const restaurantDoc = await getDoc(doc(db, 'restaurants', user.uid));
                            if (restaurantDoc.exists()) {
                                const restaurantDetails = restaurantDoc.data() as Restaurant;
                                callback({user, userData: {...userData, restaurantDetails}});
                            } else {
                                callback({user, userData});
                            }
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

            await updateDoc(doc(db, 'restaurants', user.uid), {
                'operatingHours.isOpen': isOpen,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update restaurant status');
        }
    },

    async updateProfile(profileData: any) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            // Update user document
            const userUpdateData = {
                name: profileData.ownerName,
                phone: profileData.phone,
                email: profileData.email,
                updatedAt: new Date()
            };

            // Update restaurant document
            const restaurantUpdateData = {
                businessName: profileData.businessName,
                ownerName: profileData.ownerName,
                email: profileData.email,
                phone: profileData.phone,
                gstin: profileData.gstin,
                description: profileData.description,
                address: profileData.address,
                cuisineTypes: profileData.cuisineTypes,
                operatingHours: profileData.operatingHours,
                estimatedDeliveryTime: profileData.estimatedDeliveryTime,
                updatedAt: new Date()
            };

            // Update both collections
            await Promise.all([
                updateDoc(doc(db, 'users', user.uid), userUpdateData),
                updateDoc(doc(db, 'restaurants', user.uid), restaurantUpdateData)
            ]);

            // Get updated user data
            const [userDoc, restaurantDoc] = await Promise.all([
                getDoc(doc(db, 'users', user.uid)),
                getDoc(doc(db, 'restaurants', user.uid))
            ]);

            const userData = userDoc.data() as User;
            const restaurantDetails = restaurantDoc.data() as Restaurant;

            return {...userData, restaurantDetails};
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update profile');
        }
    }
};
