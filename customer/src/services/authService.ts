import {
    signInWithPhoneNumber,
    RecaptchaVerifier,
    type ConfirmationResult,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

class AuthService {
    private recaptchaVerifier: RecaptchaVerifier | null = null;
    private confirmationResult: ConfirmationResult | null = null;

    private initRecaptcha() {
        if (!this.recaptchaVerifier) {
            this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved');
                }
            });
        }
    }

    async sendOTP(phone: string, type: 'login' | 'signup', userData?: { name: string }): Promise<void> {
        try {
            this.initRecaptcha();
            const phoneNumber = `+91${phone}`;

            if (!this.recaptchaVerifier) {
                throw new Error('reCAPTCHA not initialized');
            }

            this.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);

            // Store user data temporarily for signup
            if (type === 'signup' && userData) {
                localStorage.setItem('tempUserData', JSON.stringify({ ...userData, phone }));
            }
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            throw new Error(error.message || 'Failed to send OTP');
        }
    }

    async verifyOTP(phone: string, otp: string, _type: 'login' | 'signup', userData?: { name: string }): Promise<User> {
        try {
            if (!this.confirmationResult) {
                throw new Error('No OTP confirmation available');
            }

            const result = await this.confirmationResult.confirm(otp);
            const firebaseUser = result.user;

            if (!firebaseUser) {
                throw new Error('Authentication failed');
            }

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            let user: User;

            if (userDoc.exists()) {
                // Existing user
                user = userDoc.data() as User;
            } else {
                // New user - create profile
                const tempData = localStorage.getItem('tempUserData');
                const signupData = tempData ? JSON.parse(tempData) : userData;

                if (!signupData || !signupData.name) {
                    throw new Error('User data not found');
                }

                user = {
                    uid: firebaseUser.uid,
                    role: 'customer',
                    name: signupData.name,
                    phone: phone,
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await setDoc(doc(db, 'users', firebaseUser.uid), user);
                localStorage.removeItem('tempUserData');
            }

            return user;
        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            throw new Error(error.message || 'Invalid OTP');
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
                        resolve(null);
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
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    getAuthToken(): string | null {
        return auth.currentUser?.uid || null;
    }
}

export const authService = new AuthService();
