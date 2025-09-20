import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../ui/Loading.tsx';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullScreen text="Authenticating..." />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
    }

    if (user.status !== 'active') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                        Account Not Active
                    </h2>
                    <p className="text-secondary-600">
                        Your account is not active. Please contact administrator.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
