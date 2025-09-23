import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, DeliveryAgentDetails } from '../types';

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

            if (userData.role !== 'delivery_agent') {
                await signOut(auth);
                throw new Error('Access denied. Delivery agent account required.');
            }

            // Fetch delivery agent details
            let deliveryAgentDetails = null;
            const agentDoc = await getDoc(doc(db, 'deliveryAgents', user.uid));
            if (agentDoc.exists()) {
                deliveryAgentDetails = agentDoc.data() as DeliveryAgentDetails;
            }

            return {user, userData: {...userData, deliveryAgentDetails}};
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    },

    async signUp(signupData: any) {
        try {
            const {email, password, ...userData} = signupData;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document
            const userDoc: User = {
                uid: user.uid,
                email: user.email!,
                role: 'delivery_agent',
                name: userData.name,
                phone: userData.phone,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Create delivery agent document
            const deliveryAgentDoc: DeliveryAgentDetails = {
                vehicleType: userData.vehicleType,
                vehicleNumber: userData.vehicleNumber,
                licenseNumber: userData.licenseNumber,
                kycDocuments: userData.kycDocuments,
                currentLocation: { lat: 0, lng: 0 },
                isAvailable: false,
                rating: 0,
                totalRatings: 0,
                totalDeliveries: 0,
                earnings: 0,
                completedDeliveries: 0,
                cancelledDeliveries: 0,
                averageRating: 0,
                workingHours: {
                    start: '09:00',
                    end: '22:00',
                    isOnline: false
                },
                emergencyContact: userData.emergencyContact,
                bankDetails: userData.bankDetails
            };

            await Promise.all([
                setDoc(doc(db, 'users', user.uid), userDoc),
                setDoc(doc(db, 'deliveryAgents', user.uid), deliveryAgentDoc)
            ]);

            return {user, userData: {...userDoc, deliveryAgentDetails: deliveryAgentDoc}};
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

    async updateAvailabilityStatus(isAvailable: boolean) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await updateDoc(doc(db, 'deliveryAgents', user.uid), {
                isAvailable,
                'workingHours.isOnline': isAvailable,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update availability status');
        }
    },

    async updateLocation(coordinates: { lat: number; lng: number }) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            await updateDoc(doc(db, 'deliveryAgents', user.uid), {
                currentLocation: coordinates,
                updatedAt: new Date()
            });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update location');
        }
    },

    onAuthStateChanged(callback: (user: { user: FirebaseUser; userData: User } | null) => void) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        if (userData.role === 'delivery_agent') {
                            const agentDoc = await getDoc(doc(db, 'deliveryAgents', user.uid));
                            if (agentDoc.exists()) {
                                const deliveryAgentDetails = agentDoc.data() as DeliveryAgentDetails;
                                callback({user, userData: {...userData, deliveryAgentDetails}});
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
    }
};
