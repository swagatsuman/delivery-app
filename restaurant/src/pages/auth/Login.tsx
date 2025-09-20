import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/features/auth/AuthLayout';
import { LoginForm } from '../../components/features/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthLayout>
            <LoginForm />

            <div className="mt-6 text-center">
                <p className="text-sm text-secondary-600">
                    Don't have a restaurant account?{' '}
                    <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                        Register your restaurant
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
