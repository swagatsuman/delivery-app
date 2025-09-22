import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, loading } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (!user && !loading) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, user, loading]);

    return {
        user,
        isAuthenticated,
        loading
    };
};
