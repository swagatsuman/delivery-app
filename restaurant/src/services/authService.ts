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
import type { User, Establishment } from '../types';

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

            if (userData.role !== 'establishment') {
                await signOut(auth);
                throw new Error('Access denied. Establishment account required.');
            }

            // If user is an establishment, also fetch establishment details
            let establishmentDetails = null;
            if (userData.role === 'establishment') {
                const establishmentDoc = await getDoc(doc(db, 'establishments', user.uid));
                if (establishmentDoc.exists()) {
                    establishmentDetails = establishmentDoc.data() as Establishment;
                }
            }

            return {user, userData: {...userData, establishmentDetails}};
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    async signUp(signupData: any) {
        try {
            const {email, password, ...userData} = signupData;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in users collection (without establishment details)
            const userDoc: User = {
                uid: user.uid,
                email: user.email!,
                role: 'establishment',
                name: userData.ownerName,
                phone: userData.phone,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                establishmentId: user.uid // Link to establishment collection
            };

            // Create establishment document in establishments collection
            const establishmentDoc: Establishment = {
                id: user.uid,
                ownerId: user.uid,
                establishmentType: userData.establishmentType || 'restaurant',
                businessName: userData.businessName,
                ownerName: userData.ownerName,
                email: user.email!,
                phone: userData.phone,
                gstin: userData.gstin,
                description: userData.description || '',
                images: [],
                address: userData.address,
                serviceTypes: userData.serviceTypes || [],
                operatingHours: {
                    open: '09:00',
                    close: '23:00',
                    isOpen: false
                },
                rating: 0,
                totalRatings: 0,
                deliveryRadius: 10,
                minimumOrderValue: 100,
                deliveryFee: 30,
                estimatedDeliveryTime: userData.estimatedDeliveryTime || 30,
                totalOrders: 0,
                revenue: 0,
                isActive: true,
                featured: false,
                config: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save both documents
            await Promise.all([
                setDoc(doc(db, 'users', user.uid), userDoc),
                setDoc(doc(db, 'establishments', user.uid), establishmentDoc)
            ]);

            await sendEmailVerification(user);

            return {user, userData: {...userDoc, establishmentDetails: establishmentDoc}};
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
                            if (userData.role === 'establishment') {
                                // Fetch establishment details
                                const establishmentDoc = await getDoc(doc(db, 'establishments', user.uid));
                                if (establishmentDoc.exists()) {
                                    const establishmentDetails = establishmentDoc.data() as Establishment;
                                    resolve({user, userData: {...userData, establishmentDetails}});
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
                        if (userData.role === 'establishment') {
                            // Fetch establishment details
                            const establishmentDoc = await getDoc(doc(db, 'establishments', user.uid));
                            if (establishmentDoc.exists()) {
                                const establishmentDetails = establishmentDoc.data() as Establishment;
                                callback({user, userData: {...userData, establishmentDetails}});
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

    async updateEstablishmentStatus(isOpen: boolean) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await updateDoc(doc(db, 'establishments', user.uid), {
                'operatingHours.isOpen': isOpen,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update establishment status');
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

            // Update establishment document
            const establishmentUpdateData = {
                businessName: profileData.businessName,
                ownerName: profileData.ownerName,
                email: profileData.email,
                phone: profileData.phone,
                gstin: profileData.gstin,
                description: profileData.description,
                address: profileData.address,
                serviceTypes: profileData.serviceTypes,
                operatingHours: profileData.operatingHours,
                estimatedDeliveryTime: profileData.estimatedDeliveryTime,
                updatedAt: new Date()
            };

            // Update both collections
            await Promise.all([
                updateDoc(doc(db, 'users', user.uid), userUpdateData),
                updateDoc(doc(db, 'establishments', user.uid), establishmentUpdateData)
            ]);

            // Get updated user data
            const [userDoc, establishmentDoc] = await Promise.all([
                getDoc(doc(db, 'users', user.uid)),
                getDoc(doc(db, 'establishments', user.uid))
            ]);

            const userData = userDoc.data() as User;
            const establishmentDetails = establishmentDoc.data() as Establishment;

            return {...userData, establishmentDetails};
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update profile');
        }
    }
};
