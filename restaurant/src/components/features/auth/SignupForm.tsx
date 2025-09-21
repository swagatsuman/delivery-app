import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, MapPin, Phone } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { GooglePlacesBusinessInput } from './GooglePlacesBusinessInput';
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
    estimatedDeliveryTime: number;
}

export const SignupForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const {loading, error} = useAppSelector(state => state.auth);
    const [step, setStep] = useState(1);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    const {
        register,
        handleSubmit,
        formState: {errors},
        watch,
        trigger,
        setValue,
        getValues
    } = useForm<SignupFormData>();

    const password = watch('password');

    const onSubmit = async (data: SignupFormData) => {
        dispatch(clearError());

        if (!coordinates) {
            alert('Please select a business location using the search field');
            return;
        }

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
                coordinates: coordinates
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

    const handlePlaceSelected = (place: {
        businessName: string;
        address: {
            street: string;
            city: string;
            state: string;
            pincode: string;
            coordinates: { lat: number; lng: number };
        };
    }) => {
        // Auto-fill the form fields
        setValue('businessName', place.businessName);
        setValue('street', place.address.street);
        setValue('city', place.address.city);
        setValue('state', place.address.state);
        setValue('pincode', place.address.pincode);

        // Store coordinates
        setCoordinates(place.address.coordinates);

        console.log('Address auto-filled:', place);
    };

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines(prev =>
            prev.includes(cuisine)
                ? prev.filter(c => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    console.log(getValues('businessName'));

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
                    <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary-500' : 'bg-secondary-200'}`}/>
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
                            icon={<User className="h-4 w-4"/>}
                            {...register('ownerName', {
                                required: 'Owner name is required',
                                minLength: {value: 2, message: 'Name must be at least 2 characters'}
                            })}
                            error={errors.ownerName?.message}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            icon={<Mail className="h-4 w-4"/>}
                            {...register('email', {
                                required: 'Email is required',
                                validate: (value) => validateEmail(value) || 'Invalid email address'
                            })}
                            error={errors.email?.message}
                        />

                        <Input
                            label="Phone Number"
                            type="tel"
                            icon={<Phone className="h-4 w-4"/>}
                            {...register('phone', {
                                required: 'Phone number is required',
                                validate: (value) => validatePhone(value) || 'Invalid phone number'
                            })}
                            error={errors.phone?.message}
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={<Lock className="h-4 w-4"/>}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {value: 8, message: 'Password must be at least 8 characters'}
                            })}
                            error={errors.password?.message}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            icon={<Lock className="h-4 w-4"/>}
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

                        {/* Google Places Business Search */}
                        <GooglePlacesBusinessInput
                            label="Search Your Business"
                            // value={getValues('businessName') || ''}
                            onChange={(value) => {
                                setValue('businessName', value);
                            }}
                            onPlaceSelected={handlePlaceSelected}
                            error={errors.businessName?.message}
                            placeholder="Type your business name or address..."
                        />

                        {/* Manual Business Name Input (hidden, populated by Google Places) */}
                        <input
                            type="hidden"
                            {...register('businessName', {
                                required: 'Business name is required'
                            })}
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

                        {/* Address Fields (Auto-filled from Google Places) */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-secondary-900 flex items-center">
                                <MapPin className="h-4 w-4 mr-2"/>
                                Restaurant Address
                                {coordinates && (
                                    <span className="ml-2 text-xs text-success-600">
                                        ✓ Location verified
                                    </span>
                                )}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Street Address"
                                    {...register('street', {required: 'Street address is required'})}
                                    error={errors.street?.message}
                                    disabled
                                />

                                <Input
                                    label="City"
                                    {...register('city', {required: 'City is required'})}
                                    error={errors.city?.message}
                                    disabled
                                />

                                <Input
                                    label="State"
                                    {...register('state', {required: 'State is required'})}
                                    error={errors.state?.message}
                                    disabled
                                />

                                <Input
                                    label="Pincode"
                                    {...register('pincode', {
                                        required: 'Pincode is required',
                                        pattern: {value: /^\d{6}$/, message: 'Invalid pincode'}
                                    })}
                                    error={errors.pincode?.message}
                                    disabled
                                />
                            </div>

                            {coordinates && (
                                <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                                    <p className="text-sm text-success-800">
                                        <strong>Location:</strong> {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                                    </p>
                                    <p className="text-xs text-success-600 mt-1">
                                        This location will be used for delivery distance calculations
                                    </p>
                                </div>
                            )}
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
                                disabled={!coordinates}
                            >
                                Create Restaurant Account
                            </Button>
                        </div>

                        {!coordinates && (
                            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                                <p className="text-sm text-warning-800">
                                    Please search and select your business location to continue
                                </p>
                            </div>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};
