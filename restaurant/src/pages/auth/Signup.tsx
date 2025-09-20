import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/features/auth/AuthLayout';
import { SignupForm } from '../../components/features/auth/SignupForm';
import { useAuth } from '../../hooks/useAuth';

const Signup: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthLayout>
            <SignupForm />

            <div className="mt-6 text-center">
                <p className="text-sm text-secondary-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Signup;
