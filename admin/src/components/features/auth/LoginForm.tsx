import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../../ui/Button.tsx';
import { Input } from '../../ui/Input';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { validateEmail } from '../../../utils/helpers';

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(state => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        dispatch(clearError());
        dispatch(loginUser(data));
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Welcome Back</h1>
                <p className="text-secondary-600 mt-2">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="admin@foodeats.com"
                    {...register('email', {
                        required: 'Email is required',
                        validate: (value) => validateEmail(value) || 'Invalid email address'
                    })}
                    error={errors.email?.message}
                />

                <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Enter your password"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    error={errors.password?.message}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-secondary-600">Show password</span>
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                        <p className="text-sm text-error-700">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    loading={loading}
                    size="lg"
                >
                    Sign In
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-secondary-600">
                    Forgot your password?{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                        Contact Administrator
                    </a>
                </p>
            </div>
        </div>
    );
};
