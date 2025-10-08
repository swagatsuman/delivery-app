import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { setUser } from '../store/slices/authSlice';
import { auth, db } from '../config/firebase';
import { authService } from '../services/authService';
import type { User } from '../types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, loading } = useAppSelector(state => state.auth);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;

                        // Fetch delivery agent details
                        let deliveryAgentDetails = null;
                        const agentDoc = await getDoc(doc(db, 'deliveryAgents', firebaseUser.uid));
                        if (agentDoc.exists()) {
                            deliveryAgentDetails = agentDoc.data();

                            // Calculate stats from orders and ratings
                            const stats = await authService.calculateAgentStats(firebaseUser.uid);

                            // Merge stats with delivery agent details
                            deliveryAgentDetails = {
                                ...deliveryAgentDetails,
                                ...stats
                            };
                        }

                        dispatch(setUser({
                            ...userData,
                            id: firebaseUser.uid,
                            deliveryAgentDetails
                        }));
                    } else {
                        dispatch(setUser(null));
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    dispatch(setUser(null));
                }
            } else {
                dispatch(setUser(null));
            }

            setInitialLoading(false);
        });

        return () => unsubscribe();
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        loading: loading || initialLoading
    };
};
