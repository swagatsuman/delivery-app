import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, Car, FileText, CreditCard, Users } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { signupUser, clearError } from '../../../store/slices/authSlice';
import { validateEmail, validatePhone } from '../../../utils/helpers';

interface SignupFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    vehicleType: 'bike' | 'bicycle' | 'car';
    vehicleNumber: string;
    licenseNumber: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
}

export const SignupForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector(state => state.auth);
    const [step, setStep] = useState(1);
    const [kycFiles, setKycFiles] = useState({
        aadhar: null as File | null,
        license: null as File | null,
        pan: null as File | null,
        photo: null as File | null
    });

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

        // In real app, upload KYC files to Firebase Storage
        const kycDocuments = {
            aadhar: kycFiles.aadhar ? 'aadhar-url' : '',
            license: kycFiles.license ? 'license-url' : '',
            pan: kycFiles.pan ? 'pan-url' : '',
            photo: kycFiles.photo ? 'photo-url' : ''
        };

        const signupData = {
            ...data,
            vehicleType: data.vehicleType,
            vehicleNumber: data.vehicleNumber,
            licenseNumber: data.licenseNumber,
            kycDocuments,
            emergencyContact: {
                name: data.emergencyContactName,
                phone: data.emergencyContactPhone,
                relationship: data.emergencyContactRelationship
            },
            bankDetails: {
                accountNumber: data.accountNumber,
                ifscCode: data.ifscCode,
                accountHolderName: data.accountHolderName
            }
        };

        dispatch(signupUser(signupData));
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof SignupFormData)[] = [];

        if (step === 1) {
            fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword'];
        } else if (step === 2) {
            fieldsToValidate = ['vehicleType', 'vehicleNumber', 'licenseNumber'];
        } else if (step === 3) {
            fieldsToValidate = ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(step + 1);
        }
    };

    const handleFileUpload = (type: keyof typeof kycFiles, file: File) => {
        setKycFiles(prev => ({ ...prev, [type]: file }));
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Join FoodEats</h1>
                <p className="text-secondary-600 mt-2">Become a delivery partner and start earning</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4, 5].map((stepNumber) => (
                        <React.Fragment key={stepNumber}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step >= stepNumber ? 'bg-primary-500 text-white' : 'bg-secondary-200 text-secondary-600'
                            }`}>
                                {stepNumber}
                            </div>
                            {stepNumber < 5 && (
                                <div className={`w-12 h-1 ${step > stepNumber ? 'bg-primary-500' : 'bg-secondary-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
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
                            label="Full Name"
                            icon={<User className="h-4 w-4" />}
                            {...register('name', {
                                required: 'Full name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                            })}
                            error={errors.name?.message}
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
                                minLength: { value: 6, message: 'Password must be at least 6 characters' }
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
                            <h3 className="text-lg font-semibold text-secondary-900">Vehicle Information</h3>
                            <p className="text-sm text-secondary-600">Tell us about your vehicle</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Vehicle Type
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'bike', label: 'Bike', icon: '🏍️' },
                                    { value: 'bicycle', label: 'Bicycle', icon: '🚴' },
                                    { value: 'car', label: 'Car', icon: '🚗' }
                                ].map((vehicle) => (
                                    <label key={vehicle.value} className="relative">
                                        <input
                                            type="radio"
                                            value={vehicle.value}
                                            {...register('vehicleType', { required: 'Please select a vehicle type' })}
                                            className="sr-only peer"
                                        />
                                        <div className="border-2 border-secondary-200 rounded-lg p-4 text-center cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:border-secondary-300">
                                            <div className="text-2xl mb-2">{vehicle.icon}</div>
                                            <div className="text-sm font-medium text-secondary-900">{vehicle.label}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.vehicleType && (
                                <p className="text-sm text-error-600 mt-1">{errors.vehicleType.message}</p>
                            )}
                        </div>

                        <Input
                            label="Vehicle Number"
                            icon={<Car className="h-4 w-4" />}
                            {...register('vehicleNumber', {
                                required: 'Vehicle number is required',
                                pattern: {
                                    value: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
                                    message: 'Invalid vehicle number format (e.g., KA01AB1234)'
                                }
                            })}
                            error={errors.vehicleNumber?.message}
                            placeholder="e.g., KA01AB1234"
                        />

                        <Input
                            label="Driving License Number"
                            {...register('licenseNumber', {
                                required: 'License number is required'
                            })}
                            error={errors.licenseNumber?.message}
                        />

                        <div className="flex space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </Button>
                            <Button type="button" className="flex-1" onClick={handleNext}>
                                Next Step
                            </Button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-secondary-900">Emergency Contact</h3>
                            <p className="text-sm text-secondary-600">Someone we can reach in case of emergency</p>
                        </div>

                        <Input
                            label="Contact Name"
                            icon={<Users className="h-4 w-4" />}
                            {...register('emergencyContactName', {
                                required: 'Emergency contact name is required'
                            })}
                            error={errors.emergencyContactName?.message}
                        />

                        <Input
                            label="Contact Phone"
                            type="tel"
                            icon={<Phone className="h-4 w-4" />}
                            {...register('emergencyContactPhone', {
                                required: 'Emergency contact phone is required',
                                validate: (value) => validatePhone(value) || 'Invalid phone number'
                            })}
                            error={errors.emergencyContactPhone?.message}
                        />

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Relationship
                            </label>
                            <select
                                className="input-field"
                                {...register('emergencyContactRelationship', { required: 'Please select relationship' })}
                            >
                                <option value="">Select relationship</option>
                                <option value="spouse">Spouse</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="friend">Friend</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.emergencyContactRelationship && (
                                <p className="text-sm text-error-600">{errors.emergencyContactRelationship.message}</p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setStep(2)}
                            >
                                Back
                            </Button>
                            <Button type="button" className="flex-1" onClick={handleNext}>
                                Next Step
                            </Button>
                        </div>
                    </>
                )}

                {step === 4 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-secondary-900">Bank Details</h3>
                            <p className="text-sm text-secondary-600">For receiving payments</p>
                        </div>

                        <Input
                            label="Account Holder Name"
                            icon={<CreditCard className="h-4 w-4" />}
                            {...register('accountHolderName', {
                                required: 'Account holder name is required'
                            })}
                            error={errors.accountHolderName?.message}
                        />

                        <Input
                            label="Account Number"
                            {...register('accountNumber', {
                                required: 'Account number is required',
                                pattern: {
                                    value: /^\d{9,18}$/,
                                    message: 'Invalid account number'
                                }
                            })}
                            error={errors.accountNumber?.message}
                        />

                        <Input
                            label="IFSC Code"
                            {...register('ifscCode', {
                                required: 'IFSC code is required',
                                pattern: {
                                    value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                                    message: 'Invalid IFSC code format'
                                }
                            })}
                            error={errors.ifscCode?.message}
                            placeholder="e.g., SBIN0001234"
                        />

                        <div className="flex space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setStep(3)}
                            >
                                Back
                            </Button>
                            <Button type="button" className="flex-1" onClick={handleNext}>
                                Next Step
                            </Button>
                        </div>
                    </>
                )}

                {step === 5 && (
                    <>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-secondary-900">KYC Documents</h3>
                            <p className="text-sm text-secondary-600">Upload required documents for verification</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'aadhar', label: 'Aadhar Card', required: true },
                                { key: 'license', label: 'Driving License', required: true },
                                { key: 'pan', label: 'PAN Card', required: true },
                                { key: 'photo', label: 'Profile Photo', required: true }
                            ].map((doc) => (
                                <div key={doc.key} className="border border-secondary-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-secondary-900">
                                            {doc.label} {doc.required && <span className="text-error-500">*</span>}
                                        </label>
                                        {kycFiles[doc.key as keyof typeof kycFiles] && (
                                            <span className="text-xs text-success-600">✓ Uploaded</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                handleFileUpload(doc.key as keyof typeof kycFiles, file);
                                            }
                                        }}
                                        className="w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                    />
                                </div>
                            ))}
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
                                onClick={() => setStep(4)}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                loading={loading}
                                disabled={!Object.values(kycFiles).every(file => file !== null)}
                            >
                                Submit Application
                            </Button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Your application will be reviewed by our team within 24-48 hours.
                                You'll receive an email notification once approved.
                            </p>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};
