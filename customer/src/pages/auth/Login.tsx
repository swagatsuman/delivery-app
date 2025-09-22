import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { sendOTP } from '../../store/slices/authSlice';
import { validatePhone } from '../../utils/helpers';

interface LoginFormData {
    phone: string;
}

const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {loading, error} = useAppSelector(state => state.auth);

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            await dispatch(sendOTP({phone: data.phone, type: 'login'})).unwrap();
            navigate('/verify-otp', {state: {phone: data.phone, type: 'login'}});
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
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">Welcome to FoodEats</h1>
                <p className="text-secondary-600">Order your favorite food from the best restaurants</p>
            </div>

            {/* Form */}
            <div className="flex-1 bg-surface rounded-t-3xl px-6 py-8">
                <div className="max-w-sm mx-auto">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Sign In</h2>
                    <p className="text-secondary-600 mb-8">Enter your phone number to continue</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Phone Number"
                            type="tel"
                            icon={<Phone className="h-5 w-5"/>}
                            placeholder="Enter your phone number"
                            {...register('phone', {
                                required: 'Phone number is required',
                                validate: (value) => validatePhone(value) || 'Please enter a valid phone number'
                            })}
                            error={errors.phone?.message}
                            className="text-lg"
                        />

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
                            {loading ? 'Sending OTP...' : (
                                <>
                                    Continue
                                    <ArrowRight className="ml-2 h-5 w-5"/>
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-secondary-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary-600 font-semibold">
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

export default Login;
