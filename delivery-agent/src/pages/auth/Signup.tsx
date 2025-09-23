import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from '../../components/features/auth/SignupForm';
import { Truck } from 'lucide-react';

const Signup: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
                        <Truck className="h-8 w-8 text-white" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <SignupForm />

                    <div className="mt-8 text-center">
                        <p className="text-sm text-secondary-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-secondary-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
