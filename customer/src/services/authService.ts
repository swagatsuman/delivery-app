import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    type UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

class AuthService {
    async signUp(email: string, password: string, name: string, phone: string): Promise<User> {
        try {
            console.log('Creating user with email:', email);

            // Create user with email and password
            const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            if (!firebaseUser) {
                throw new Error('Failed to create user account');
            }

            // Update the user's display name
            await updateProfile(firebaseUser, {
                displayName: name
            });

            // Create user document in Firestore
            const user: User = {
                uid: firebaseUser.uid,
                role: 'customer',
                name: name,
                email: email,
                phone: phone,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), user);
            console.log('User document created successfully');

            return user;
        } catch (error: any) {
            console.error('Error creating user:', error);

            let errorMessage = 'Failed to create account. Please try again.';

            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'An account with this email already exists.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Email/password accounts are not enabled.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password should be at least 6 characters long.';
                        break;
                    default:
                        errorMessage = error.message || errorMessage;
                }
            }

            throw new Error(errorMessage);
        }
    }

    async signIn(email: string, password: string): Promise<User> {
        try {
            console.log('Signing in user with email:', email);

            // Sign in with email and password
            const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            if (!firebaseUser) {
                throw new Error('Authentication failed');
            }

            // Get user document from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            if (!userDoc.exists()) {
                throw new Error('User profile not found. Please contact support.');
            }

            const user = userDoc.data() as User;
            console.log('User signed in successfully');

            return user;
        } catch (error: any) {
            console.error('Error signing in:', error);

            let errorMessage = 'Failed to sign in. Please try again.';

            if (error.code) {
                switch (error.code) {
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password. Please try again.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        errorMessage = error.message || errorMessage;
                }
            }

            throw new Error(errorMessage);
        }
    }

    async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent');
        } catch (error: any) {
            console.error('Error sending password reset email:', error);

            let errorMessage = 'Failed to send reset email. Please try again.';

            if (error.code) {
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address.';
                        break;
                    default:
                        errorMessage = error.message || errorMessage;
                }
            }

            throw new Error(errorMessage);
        }
    }

    async getCurrentUser(): Promise<User | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                unsubscribe();

                if (!firebaseUser) {
                    resolve(null);
                    return;
                }

                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        resolve(userDoc.data() as User);
                    } else {
                        // If user document doesn't exist, create one from Firebase user
                        const user: User = {
                            uid: firebaseUser.uid,
                            role: 'customer',
                            name: firebaseUser.displayName || 'User',
                            email: firebaseUser.email || '',
                            phone: '',
                            status: 'active',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };

                        await setDoc(doc(db, 'users', firebaseUser.uid), user);
                        resolve(user);
                    }
                } catch (error) {
                    console.error('Error getting current user:', error);
                    resolve(null);
                }
            });
        });
    }

    async logout(): Promise<void> {
        try {
            await signOut(auth);
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    getAuthToken(): string | null {
        return auth.currentUser?.uid || null;
    }

    // Helper method to check if user is authenticated
    isAuthenticated(): boolean {
        return !!auth.currentUser;
    }

    // Helper method to get current Firebase user
    getCurrentFirebaseUser() {
        return auth.currentUser;
    }
}

export const authService = new AuthService();
