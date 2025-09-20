import React from 'react';
import { ChefHat } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
                        <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900">FoodEats Restaurant</h2>
                    <p className="text-secondary-600">Manage your restaurant with ease</p>
                </div>

                {/* Auth Form */}
                <div className="card p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};
