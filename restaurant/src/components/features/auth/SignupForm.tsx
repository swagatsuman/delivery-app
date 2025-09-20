import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Building, MapPin, Phone } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { signupUser, clearError } from '../../../store/slices/authSlice';
import { validateEmail, validatePhone, validateGSTIN } from '../../../utils/helpers';
import { CUISINE_TYPES } from '../../../utils/constants';

interface SignupFormData {
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    businessName: string;
    gstin: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    cuisineTypes: string[];
    description: string;
    deliveryRadius: number;
    minimumOrderValue: number;
    deliveryFee: number;
}

export const SignupForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(state => state.auth);
    const [step, setStep] = useState(1);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger
    } = useForm<SignupFormData>();

    const password = watch('password');

    const onSubmit = async (data: SignupFormData) => {
        dispatch(clearError());

        const signupData = {
            ...data,
            cuisineTypes: selectedCuisines,
            address: {
                id: 'primary',
                label: 'Restaurant Address',
                street: data.street,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                coordinates: { lat: 0, lng: 0 } // TODO: Get from Google Maps
            }
        };

        dispatch(signupUser(signupData));
    };

    const handleNext = async () => {
        const isValid = await trigger(['ownerName', 'email', 'phone', 'password', 'confirmPassword']);
        if (isValid) {
            setStep(2);
        }
    };

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines(prev =>
            prev.includes(cuisine)
                ? prev.filter(c => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Join FoodEats</h1>
                <p className="text-secondary-600 mt-2">Register your restaurant and start selling</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= 1 ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-600'
                    }`}>
                        1
                    </div>
                    <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary-500' : 'bg-secondary-200'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= 2 ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-600'
                    }`}>
                        2
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-secondary-900">Personal Information</h3>
                            <p className="text-sm text-secondary-600">Let's start with your basic details</p>
                        </div>

                        <Input
                            label="Owner Name"
                            icon={<User className="h-4 w-4" />}
                            {...register('ownerName', {
                                required: 'Owner name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                            })}
                            error={errors.ownerName?.message}
                        />

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
                            label="Phone Number"
                            type="tel"
                            icon={<Phone className="h-4 w-4" />}
                            {...register('phone', {
                                required: 'Phone number is required',
                                validate: (value) => validatePhone(value) || 'Invalid phone number'
                            })}
                            error={errors.phone?.message}
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={<Lock className="h-4 w-4" />}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' }
                            })}
                            error={errors.password?.message}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            icon={<Lock className="h-4 w-4" />}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) => value === password || 'Passwords do not match'
                            })}
                            error={errors.confirmPassword?.message}
                        />

                        <Button type="button" className="w-full" onClick={handleNext}>
                            Next Step
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-secondary-900">Restaurant Details</h3>
                            <p className="text-sm text-secondary-600">Tell us about your restaurant</p>
                        </div>

                        <Input
                            label="Business Name"
                            icon={<Building className="h-4 w-4" />}
                            {...register('businessName', {
                                required: 'Business name is required'
                            })}
                            error={errors.businessName?.message}
                        />

                        <Input
                            label="GSTIN Number"
                            {...register('gstin', {
                                required: 'GSTIN is required',
                                validate: (value) => validateGSTIN(value) || 'Invalid GSTIN format'
                            })}
                            error={errors.gstin?.message}
                            helpText="15-digit GSTIN number (e.g., 22AAAAA0000A1Z5)"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Street Address"
                                icon={<MapPin className="h-4 w-4" />}
                                {...register('street', { required: 'Street address is required' })}
                                error={errors.street?.message}
                            />

                            <Input
                                label="City"
                                {...register('city', { required: 'City is required' })}
                                error={errors.city?.message}
                            />

                            <Input
                                label="State"
                                {...register('state', { required: 'State is required' })}
                                error={errors.state?.message}
                            />

                            <Input
                                label="Pincode"
                                {...register('pincode', {
                                    required: 'Pincode is required',
                                    pattern: { value: /^\d{6}$/, message: 'Invalid pincode' }
                                })}
                                error={errors.pincode?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-3">
                                Cuisine Types (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {CUISINE_TYPES.map((cuisine) => (
                                    <button
                                        key={cuisine}
                                        type="button"
                                        onClick={() => toggleCuisine(cuisine)}
                                        className={`p-2 text-sm rounded-lg border transition-colors ${
                                            selectedCuisines.includes(cuisine)
                                                ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                                        }`}
                                    >
                                        {cuisine}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Textarea
                            label="Restaurant Description"
                            rows={3}
                            {...register('description')}
                            placeholder="Brief description of your restaurant and specialties..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Delivery Radius (km)"
                                type="number"
                                {...register('deliveryRadius', {
                                    required: 'Delivery radius is required',
                                    min: { value: 1, message: 'Minimum 1 km' },
                                    max: { value: 20, message: 'Maximum 20 km' }
                                })}
                                error={errors.deliveryRadius?.message}
                            />

                            <Input
                                label="Minimum Order (₹)"
                                type="number"
                                {...register('minimumOrderValue', {
                                    required: 'Minimum order value is required',
                                    min: { value: 50, message: 'Minimum ₹50' }
                                })}
                                error={errors.minimumOrderValue?.message}
                            />

                            <Input
                                label="Delivery Fee (₹)"
                                type="number"
                                {...register('deliveryFee', {
                                    required: 'Delivery fee is required',
                                    min: { value: 0, message: 'Cannot be negative' }
                                })}
                                error={errors.deliveryFee?.message}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                                <p className="text-sm text-error-700">{error}</p>
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={loading}
                            >
                                Create Restaurant Account
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};
