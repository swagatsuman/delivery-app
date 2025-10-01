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
import { ESTABLISHMENT_CONFIGS, getEstablishmentConfig } from '../../../utils/establishmentConfig';
import type { EstablishmentType } from '../../../types';

interface SignupFormData {
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    establishmentType: EstablishmentType;
    businessName: string;
    gstin: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    serviceTypes: string[];
    description: string;
    estimatedDeliveryTime: number;
}

export const SignupForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const {loading, error} = useAppSelector(state => state.auth);
    const [step, setStep] = useState(1);
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
    const [selectedEstablishmentType, setSelectedEstablishmentType] = useState<EstablishmentType>('restaurant');
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
            establishmentType: selectedEstablishmentType,
            serviceTypes: selectedServiceTypes,
            address: {
                id: 'primary',
                label: 'Business Address',
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
        if (step === 1) {
            const isValid = await trigger(['ownerName', 'email', 'phone', 'password', 'confirmPassword']);
            if (isValid) {
                setStep(2);
            }
        } else if (step === 2) {
            setStep(3);
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

    const toggleServiceType = (serviceType: string) => {
        setSelectedServiceTypes(prev =>
            prev.includes(serviceType)
                ? prev.filter(c => c !== serviceType)
                : [...prev, serviceType]
        );
    };

    const handleEstablishmentTypeChange = (type: EstablishmentType) => {
        setSelectedEstablishmentType(type);
        setSelectedServiceTypes([]); // Reset service types when changing establishment type
    };

    console.log(getValues('businessName'));

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Join FoodEats</h1>
                <p className="text-secondary-600 mt-2">Register your establishment and start selling</p>
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
                    <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary-500' : 'bg-secondary-200'}`}/>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= 3 ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-600'
                    }`}>
                        3
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
                                minLength: {value: 6, message: 'Password must be at least 6 characters'}
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
                            <h3 className="text-lg font-semibold text-secondary-900">Business Type</h3>
                            <p className="text-sm text-secondary-600">What type of business are you running?</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-4">
                                Select Your Business Type
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(ESTABLISHMENT_CONFIGS).map(([type, config]) => {
                                    const IconComponent = config.icon;
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleEstablishmentTypeChange(type as EstablishmentType)}
                                            className={`p-4 text-left rounded-xl border-2 transition-all hover:shadow-md ${
                                                selectedEstablishmentType === type
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-secondary-200 bg-white hover:border-secondary-300'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg ${config.color}`}>
                                                    <IconComponent className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-secondary-900 mb-1">
                                                        {config.label}
                                                    </h4>
                                                    <p className="text-sm text-secondary-600">
                                                        {config.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

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
                                type="button"
                                className="flex-1"
                                onClick={() => setStep(3)}
                            >
                                Next Step
                            </Button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-secondary-900">Business Details</h3>
                            <p className="text-sm text-secondary-600">Tell us about your {getEstablishmentConfig(selectedEstablishmentType).label.toLowerCase()}</p>
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
                                Business Address
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
                                {selectedEstablishmentType === 'restaurant' ? 'Cuisine Types' : 'Service Types'} (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {getEstablishmentConfig(selectedEstablishmentType).defaultServiceTypes.map((serviceType) => (
                                    <button
                                        key={serviceType}
                                        type="button"
                                        onClick={() => toggleServiceType(serviceType)}
                                        className={`p-2 text-sm rounded-lg border transition-colors ${
                                            selectedServiceTypes.includes(serviceType)
                                                ? 'bg-primary-50 border-primary-200 text-primary-700'
                                                : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                                        }`}
                                    >
                                        {serviceType}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Textarea
                            label="Business Description"
                            rows={3}
                            {...register('description')}
                            placeholder={`Brief description of your ${getEstablishmentConfig(selectedEstablishmentType).label.toLowerCase()} and specialties...`}
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
                                onClick={() => setStep(2)}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={loading}
                                disabled={!coordinates}
                            >
                                Create Business Account
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
