import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { validateEmail } from '../../utils/helpers';
import { Mail, Lock, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>();

    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            await dispatch(loginUser(data)).unwrap();
            toast.success('Welcome back!');
        } catch (error: any) {
            toast.error(error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
                        <Truck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-secondary-900">
                        Welcome Back!
                    </h2>
                    <p className="mt-2 text-sm text-secondary-600">
                        Sign in to your delivery partner account
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                    {error && (
                        <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                            <p className="text-sm text-error-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            icon={<Mail className="h-4 w-4" />}
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
                            {...register('password', {
                                required: 'Password is required'
                            })}
                            error={errors.password?.message}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-secondary-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                                Join as a delivery partner
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-secondary-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
