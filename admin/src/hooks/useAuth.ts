import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { getCurrentUser, setUser } from '../store/slices/authSlice';
import { authService } from '../services/authService';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, loading, error } = useAppSelector(state => state.auth);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((authUser) => {
            dispatch(setUser(authUser?.userData || null));
        });

        return unsubscribe;
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        loading,
        error,
        getCurrentUser: () => dispatch(getCurrentUser())
    };
};
