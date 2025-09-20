import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
        </AuthLayout>
    );
};

export default Login;
