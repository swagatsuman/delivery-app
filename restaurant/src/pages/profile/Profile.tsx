import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateEstablishmentProfile } from '../../store/slices/authSlice';
import { validateEmail, validatePhone, validateGSTIN } from '../../utils/helpers';
import { CUISINE_TYPES } from '../../utils/constants';
import { storageService } from '../../services/storageService';
import { Save, Upload, MapPin, Clock, Star, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormData {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    gstin: string;
    description: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    deliveryRadius: number;
    minimumOrderValue: number;
    deliveryFee: number;
    estimatedDeliveryTime: number;
    openTime: string;
    closeTime: string;
}

const Profile: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(
        user?.establishmentDetails?.profileImage || null
    );
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
        user?.establishmentDetails?.cuisineTypes || []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<ProfileFormData>({
        defaultValues: {
            businessName: user?.establishmentDetails?.businessName || '',
            ownerName: user?.establishmentDetails?.ownerName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            gstin: user?.establishmentDetails?.gstin || '',
            description: user?.establishmentDetails?.description || '',
            street: user?.establishmentDetails?.address?.street || '',
            city: user?.establishmentDetails?.address?.city || '',
            state: user?.establishmentDetails?.address?.state || '',
            pincode: user?.establishmentDetails?.address?.pincode || '',
            deliveryRadius: user?.establishmentDetails?.deliveryRadius || 5,
            minimumOrderValue: user?.establishmentDetails?.minimumOrderValue || 100,
            deliveryFee: user?.establishmentDetails?.deliveryFee || 30,
            estimatedDeliveryTime: user?.establishmentDetails?.estimatedDeliveryTime || 30,
            openTime: user?.establishmentDetails?.operatingHours?.open || '09:00',
            closeTime: user?.establishmentDetails?.operatingHours?.close || '23:00'
        }
    });

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);
        try {
            const profileData = {
                ...data,
                cuisineTypes: selectedCuisines,
                profileImage: profileImage || '',
                address: {
                    id: user?.establishmentDetails?.address?.id || 'primary',
                    label: 'Restaurant Address',
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    coordinates: user?.establishmentDetails?.address?.coordinates || { lat: 0, lng: 0 }
                },
                operatingHours: {
                    open: data.openTime,
                    close: data.closeTime,
                    isOpen: user?.establishmentDetails?.operatingHours?.isOpen || false
                }
            };

            await dispatch(updateEstablishmentProfile(profileData)).unwrap();
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines(prev =>
            prev.includes(cuisine)
                ? prev.filter(c => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.uid) return;

        // Validate file
        const validation = storageService.validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid file');
            return;
        }

        setUploadingImage(true);
        try {
            // Delete old image if exists
            if (profileImage) {
                await storageService.deleteProfileImage(profileImage);
            }

            // Upload new image
            const imageUrl = await storageService.uploadProfileImage(file, user.uid);
            setProfileImage(imageUrl);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageDelete = async () => {
        if (!profileImage) return;

        setUploadingImage(true);
        try {
            await storageService.deleteProfileImage(profileImage);
            setProfileImage(null);
            toast.success('Image removed successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove image');
        } finally {
            setUploadingImage(false);
        }
    };

    const stats = {
        rating: user?.establishmentDetails?.rating || 0,
        totalRatings: user?.establishmentDetails?.totalRatings || 0,
        totalOrders: user?.establishmentDetails?.totalOrders || 0,
        revenue: user?.establishmentDetails?.revenue || 0
    };

    return (
        <Layout title="Restaurant Profile">
            <div className="p-6 space-y-6">
                {/* Profile Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Rating</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.rating.toFixed(1)}</p>
                                <p className="text-xs text-secondary-500">{stats.totalRatings} reviews</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.totalOrders}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <div className="h-6 w-6 bg-blue-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Revenue</p>
                                <p className="text-2xl font-bold text-secondary-900">₹{(stats.revenue / 1000).toFixed(1)}K</p>
                            </div>
                            <div className="p-3 bg-success-100 rounded-lg">
                                <div className="h-6 w-6 bg-success-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Status</p>
                                <p className="text-lg font-bold text-success-600 capitalize">{user?.status}</p>
                            </div>
                            <div className="p-3 bg-success-100 rounded-lg">
                                <div className="h-6 w-6 bg-success-600 rounded-full"></div>
                            </div>
                        </div>
                    </Card>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card title="Basic Information" padding="md">
                            <div className="space-y-4">
                                <Input
                                    label="Business Name"
                                    {...register('businessName', {
                                        required: 'Business name is required'
                                    })}
                                    error={errors.businessName?.message}
                                />

                                <Input
                                    label="Owner Name"
                                    {...register('ownerName', {
                                        required: 'Owner name is required'
                                    })}
                                    error={errors.ownerName?.message}
                                />

                                <Input
                                    label="Email Address"
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        validate: (value) => validateEmail(value) || 'Invalid email address'
                                    })}
                                    error={errors.email?.message}
                                />

                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    {...register('phone', {
                                        required: 'Phone number is required',
                                        validate: (value) => validatePhone(value) || 'Invalid phone number'
                                    })}
                                    error={errors.phone?.message}
                                />

                                <Input
                                    label="GSTIN Number"
                                    {...register('gstin', {
                                        required: 'GSTIN is required',
                                        validate: (value) => validateGSTIN(value) || 'Invalid GSTIN format'
                                    })}
                                    error={errors.gstin?.message}
                                />

                                <Textarea
                                    label="Restaurant Description"
                                    rows={3}
                                    {...register('description')}
                                    placeholder="Describe your restaurant and specialties..."
                                />
                            </div>
                        </Card>

                        {/* Address Information */}
                        <Card title="Address Information" padding="md">
                            <div className="space-y-4">
                                <Input
                                    label="Street Address"
                                    icon={<MapPin className="h-4 w-4" />}
                                    {...register('street', { required: 'Street address is required' })}
                                    error={errors.street?.message}
                                />

                                <div className="grid grid-cols-2 gap-4">
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
                                </div>

                                <Input
                                    label="Pincode"
                                    {...register('pincode', {
                                        required: 'Pincode is required',
                                        pattern: { value: /^\d{6}$/, message: 'Invalid pincode' }
                                    })}
                                    error={errors.pincode?.message}
                                />

                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<MapPin className="h-4 w-4" />}
                                >
                                    Update Location on Map
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Cuisine Types */}
                    <Card title="Cuisine Types" padding="md">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {CUISINE_TYPES.map((cuisine) => (
                                <button
                                    key={cuisine}
                                    type="button"
                                    onClick={() => toggleCuisine(cuisine)}
                                    className={`p-3 text-sm rounded-lg border transition-colors ${
                                        selectedCuisines.includes(cuisine)
                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                            : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                                    }`}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Business Settings */}
                        <Card title="Business Settings" padding="md">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Delivery Fee (₹)"
                                        type="number"
                                        {...register('deliveryFee', {
                                            required: 'Delivery fee is required',
                                            min: { value: 0, message: 'Cannot be negative' }
                                        })}
                                        error={errors.deliveryFee?.message}
                                    />

                                    <Input
                                        label="Estimated Delivery Time (min)"
                                        type="number"
                                        {...register('estimatedDeliveryTime', {
                                            required: 'Estimated delivery time is required',
                                            min: { value: 15, message: 'Minimum 15 minutes' }
                                        })}
                                        error={errors.estimatedDeliveryTime?.message}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Operating Hours */}
                        <Card title="Operating Hours" padding="md">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Clock className="h-5 w-5 text-secondary-400" />
                                    <div>
                                        <h4 className="text-sm font-medium text-secondary-900">Current Status</h4>
                                        <p className="text-sm text-secondary-600">
                                            Restaurant is currently {' '}
                                            <span className={user?.establishmentDetails?.operatingHours?.isOpen ? 'text-success-600' : 'text-error-600'}>
                                                {user?.establishmentDetails?.operatingHours?.isOpen ? 'Open' : 'Closed'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Opening Time"
                                        type="time"
                                        {...register('openTime', {
                                            required: 'Opening time is required'
                                        })}
                                        error={errors.openTime?.message}
                                    />

                                    <Input
                                        label="Closing Time"
                                        type="time"
                                        {...register('closeTime', {
                                            required: 'Closing time is required'
                                        })}
                                        error={errors.closeTime?.message}
                                    />
                                </div>

                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> You can manually open/close your restaurant using the toggle in the header, regardless of these operating hours.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Restaurant Profile Image */}
                    <Card title="Restaurant Profile Image" padding="md">
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center">
                                {profileImage ? (
                                    <div className="relative group">
                                        <img
                                            src={profileImage}
                                            alt="Restaurant Profile"
                                            className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-secondary-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleImageDelete}
                                            disabled={uploadingImage}
                                            className="absolute top-3 right-3 bg-error-500 hover:bg-error-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full max-w-md border-2 border-dashed border-secondary-300 rounded-lg p-12 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="hidden"
                                        />
                                        {uploadingImage ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                                                <p className="text-sm text-secondary-600">Uploading...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <ImageIcon className="h-16 w-16 mx-auto text-secondary-400 mb-4" />
                                                <p className="text-sm font-medium text-secondary-700 mb-2">Upload Profile Image</p>
                                                <p className="text-xs text-secondary-500">Click to browse or drag and drop</p>
                                                <p className="text-xs text-secondary-400 mt-2">JPEG, PNG, or WebP (Max 5MB)</p>
                                            </div>
                                        )}
                                    </label>
                                )}
                            </div>

                            {profileImage && (
                                <div className="text-center">
                                    <label className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="hidden"
                                        />
                                        <Upload className="h-4 w-4 mr-2" />
                                        {uploadingImage ? 'Uploading...' : 'Change Image'}
                                    </label>
                                </div>
                            )}

                            <p className="text-xs text-center text-secondary-500">
                                Upload a high-quality image of your restaurant. This will be displayed on your profile.
                            </p>
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            loading={loading}
                            icon={<Save className="h-4 w-4" />}
                            size="lg"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Profile;
