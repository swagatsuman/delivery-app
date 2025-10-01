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
import { Save, Upload, MapPin, Clock, Star } from 'lucide-react';
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
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
        user?.restaurantDetails?.cuisineTypes || []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<ProfileFormData>({
        defaultValues: {
            businessName: user?.restaurantDetails?.businessName || '',
            ownerName: user?.restaurantDetails?.ownerName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            gstin: user?.restaurantDetails?.gstin || '',
            description: user?.restaurantDetails?.description || '',
            street: user?.restaurantDetails?.address?.street || '',
            city: user?.restaurantDetails?.address?.city || '',
            state: user?.restaurantDetails?.address?.state || '',
            pincode: user?.restaurantDetails?.address?.pincode || '',
            deliveryRadius: user?.restaurantDetails?.deliveryRadius || 5,
            minimumOrderValue: user?.restaurantDetails?.minimumOrderValue || 100,
            deliveryFee: user?.restaurantDetails?.deliveryFee || 30,
            estimatedDeliveryTime: user?.restaurantDetails?.estimatedDeliveryTime || 30,
            openTime: user?.restaurantDetails?.operatingHours?.open || '09:00',
            closeTime: user?.restaurantDetails?.operatingHours?.close || '23:00'
        }
    });

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);
        try {
            const profileData = {
                ...data,
                cuisineTypes: selectedCuisines,
                address: {
                    id: user?.restaurantDetails?.address?.id || 'primary',
                    label: 'Restaurant Address',
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    coordinates: user?.restaurantDetails?.address?.coordinates || { lat: 0, lng: 0 }
                },
                operatingHours: {
                    open: data.openTime,
                    close: data.closeTime,
                    isOpen: user?.restaurantDetails?.operatingHours?.isOpen || false
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

    const stats = {
        rating: user?.restaurantDetails?.rating || 0,
        totalRatings: user?.restaurantDetails?.totalRatings || 0,
        totalOrders: user?.restaurantDetails?.totalOrders || 0,
        revenue: user?.restaurantDetails?.revenue || 0
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
                                            <span className={user?.restaurantDetails?.operatingHours?.isOpen ? 'text-success-600' : 'text-error-600'}>
                                                {user?.restaurantDetails?.operatingHours?.isOpen ? 'Open' : 'Closed'}
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

                    {/* Restaurant Images */}
                    <Card title="Restaurant Images" padding="md">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Existing Images */}
                                {user?.restaurantDetails?.images?.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Restaurant ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-secondary-200"
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                {/* Upload New Image */}
                                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors cursor-pointer">
                                    <Upload className="h-8 w-8 mx-auto text-secondary-400 mb-2" />
                                    <p className="text-sm text-secondary-600">Add Image</p>
                                </div>
                            </div>
                            <p className="text-xs text-secondary-500">
                                Upload high-quality images of your restaurant, food, and ambiance. Maximum 8 images allowed.
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
