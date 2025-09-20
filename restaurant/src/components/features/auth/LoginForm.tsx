import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../../ui/Button';
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
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Welcome Back</h1>
                <p className="text-secondary-600 mt-2">Sign in to your restaurant dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="restaurant@foodeats.com"
                    {...register('email', {
                        required: 'Email is required',
                        validate: (value) => validateEmail(value) || 'Invalid email address'
                    })}
                    error={errors.email?.message}
                />

                <Input
                    label="Password"
                    type="password"
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Enter your password"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    error={errors.password?.message}
                />

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
        </div>
    );
};
