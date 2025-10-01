import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { signInUser, resetPassword } from '../../store/slices/authSlice';

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, passwordResetSent } = useAppSelector(state => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            await dispatch(signInUser(data)).unwrap();
            navigate('/home');
        } catch (error) {
            // Error handled by Redux
        }
    };

    const handleForgotPassword = async (email: string) => {
        try {
            await dispatch(resetPassword(email)).unwrap();
        } catch (error) {
            // Error handled by Redux
        }
    };

    if (showForgotPassword) {
        return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} onSubmit={handleForgotPassword} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex flex-col">
            {/* Header */}
            <div className="pt-12 pb-8 px-6 text-center">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">F</span>
                </div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Welcome Back</h1>
                <p className="text-secondary-600">Sign in to continue to FoodEats</p>
            </div>

            {/* Form */}
            <div className="flex-1 bg-surface rounded-t-3xl px-6 py-8">
                <div className="max-w-sm mx-auto">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Sign In</h2>
                    <p className="text-secondary-600 mb-8">Enter your credentials to continue</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                icon={<Lock className="h-5 w-5" />}
                                placeholder="Enter your password"
                                {...register('password', {
                                    required: 'Password is required'
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

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                Forgot Password?
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
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-secondary-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700">
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    {/* Terms */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-secondary-500">
                            By continuing, you agree to our{' '}
                            <span className="text-primary-600">Terms of Service</span> and{' '}
                            <span className="text-primary-600">Privacy Policy</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Forgot Password Component
const ForgotPasswordForm: React.FC<{
    onBack: () => void;
    onSubmit: (email: string) => void;
}> = ({ onBack, onSubmit }) => {
    const { loading, error, passwordResetSent } = useAppSelector(state => state.auth);
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            onSubmit(email.trim());
        }
    };

    if (passwordResetSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-surface rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-success-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">Check Your Email</h2>
                    <p className="text-secondary-600 mb-6">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-secondary-500 mb-6">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <Button onClick={onBack} variant="secondary" className="w-full">
                        Back to Sign In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-surface rounded-2xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Reset Password</h2>
                    <p className="text-secondary-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        icon={<Mail className="h-5 w-5" />}
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {error && (
                        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                            <p className="text-sm text-error-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full h-12"
                            loading={loading}
                            disabled={loading || !email.trim()}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onBack}
                            className="w-full h-12"
                        >
                            Back to Sign In
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
