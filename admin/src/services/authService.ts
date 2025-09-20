import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

export const authService = {
    async signIn(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                if (email === 'admin@foodeats.com') {
                    // Auto-create admin user document
                    const adminData: User = {
                        uid: user.uid,
                        role: 'admin',
                        email: user.email!,
                        name: 'Admin User',
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    await setDoc(doc(db, 'users', user.uid), adminData);
                    return { user, userData: adminData };
                }

                throw new Error('User data not found');
            }

            const userData = userDoc.data() as User;

            // Check if user is admin
            if (userData.role !== 'admin') {
                await signOut(auth);
                throw new Error('Access denied. Admin privileges required.');
            }

            // Check if user is active
            if (userData.status !== 'active') {
                await signOut(auth);
                throw new Error('Account is not active. Please contact administrator.');
            }

            return { user, userData };
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
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
                            if (userData.role === 'admin' && userData.status === 'active') {
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
                        if (userData.role === 'admin' && userData.status === 'active') {
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
    }
};
