import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../ui/Loading';
import { Truck } from "lucide-react";

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

    if (user.role !== 'delivery_agent') {
        return <Navigate to="/unauthorized" replace />;
    }

    if (user.status === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center max-w-md">
                    <div className="h-16 w-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-8 w-8 text-warning-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                        Application Under Review
                    </h2>
                    <p className="text-secondary-600 mb-6">
                        Your delivery partner application is being reviewed by our team. You'll receive an email once approved and can start delivering orders.
                    </p>
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                        <p className="text-sm text-warning-700">
                            <strong>What's next?</strong><br />
                            Our team will verify your documents and approve your account within 24-48 hours.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (user.status !== 'active') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                        Account Not Active
                    </h2>
                    <p className="text-secondary-600">
                        Your account is not active. Please contact support.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
