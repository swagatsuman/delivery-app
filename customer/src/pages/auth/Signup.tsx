import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { signUpUser } from '../../store/slices/authSlice';

interface SignupFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

const Signup: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector(state => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<SignupFormData>();

    const password = watch('password');

    const onSubmit = async (data: SignupFormData) => {
        try {
            await dispatch(signUpUser({
                email: data.email,
                password: data.password,
                name: data.name,
                phone: data.phone
            })).unwrap();
            navigate('/location-setup');
        } catch (error) {
            // Error handled by Redux
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex flex-col">
            {/* Header */}
            <div className="pt-12 pb-8 px-6 text-center">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">F</span>
                </div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Join FoodEats</h1>
                <p className="text-secondary-600">Create your account to start ordering delicious food</p>
            </div>

            {/* Form */}
            <div className="flex-1 bg-surface rounded-t-3xl px-6 py-8">
                <div className="max-w-sm mx-auto">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Create Account</h2>
                    <p className="text-secondary-600 mb-8">Enter your details to get started</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            icon={<User className="h-5 w-5" />}
                            placeholder="Enter your full name"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Name must be at least 2 characters'
                                },
                                maxLength: {
                                    value: 50,
                                    message: 'Name must be less than 50 characters'
                                }
                            })}
                            error={errors.name?.message}
                        />

                        <Input
                            label="Email"
                            type="email"
                            icon={<Mail className="h-5 w-5" />}
                            placeholder="Enter your email address"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                            error={errors.email?.message}
                        />

                        <Input
                            label="Phone Number"
                            type="tel"
                            icon={<Phone className="h-5 w-5" />}
                            placeholder="Enter your phone number"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message: 'Please enter a valid 10-digit phone number'
                                }
                            })}
                            error={errors.phone?.message}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                icon={<Lock className="h-5 w-5" />}
                                placeholder="Create a password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    },
                                })}
                                error={errors.password?.message}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 p-1 text-secondary-400 hover:text-secondary-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                                <p className="text-sm text-error-700">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg"
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-secondary-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                                Sign In
                            </Link>
                        </p>
                    </div>

                    {/* Terms */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-secondary-500">
                            By creating an account, you agree to our{' '}
                            <span className="text-primary-600">Terms of Service</span> and{' '}
                            <span className="text-primary-600">Privacy Policy</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
