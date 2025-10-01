import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/features/auth/AuthLayout';
import { SignUpForm } from '../../components/features/auth/SignUpForm';
import { useAuth } from '../../hooks/useAuth';

const SignUp: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthLayout>
            <SignUpForm />
        </AuthLayout>
    );
};

export default SignUp;