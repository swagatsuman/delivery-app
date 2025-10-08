import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { User, Lock, Bell, Shield, Camera, Truck } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

interface DeliverySettings {
    deliveryFeePerOrder: number;
    deliveryRadius: number;
    agentCommissionPercentage: number;
    platformCommissionPercentage: number;
    restaurantCommissionPercentage: number;
    taxPercentage: number;
    minimumOrderValue: number;
    longDistanceThreshold: number;
    longDistanceDeliveryFee: number;
}

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'delivery'>('profile');
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification settings state
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotions: false
    });

    // Delivery settings state
    const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
        deliveryFeePerOrder: 40,
        deliveryRadius: 10,
        agentCommissionPercentage: 80,
        platformCommissionPercentage: 20,
        restaurantCommissionPercentage: 15,
        taxPercentage: 5,
        minimumOrderValue: 199,
        longDistanceThreshold: 7,
        longDistanceDeliveryFee: 60
    });

    // Load delivery settings from Firestore
    useEffect(() => {
        loadDeliverySettings();
    }, []);

    const loadDeliverySettings = async () => {
        setLoadingSettings(true);
        try {
            const settingsDoc = await getDoc(doc(db, 'settings', 'delivery'));
            if (settingsDoc.exists()) {
                const data = settingsDoc.data();
                // Merge with default values to handle missing fields
                setDeliverySettings({
                    deliveryFeePerOrder: data.deliveryFeePerOrder ?? 40,
                    deliveryRadius: data.deliveryRadius ?? 10,
                    agentCommissionPercentage: data.agentCommissionPercentage ?? 80,
                    platformCommissionPercentage: data.platformCommissionPercentage ?? 20,
                    restaurantCommissionPercentage: data.restaurantCommissionPercentage ?? 15,
                    taxPercentage: data.taxPercentage ?? 5,
                    minimumOrderValue: data.minimumOrderValue ?? 199,
                    longDistanceThreshold: data.longDistanceThreshold ?? 7,
                    longDistanceDeliveryFee: data.longDistanceDeliveryFee ?? 60
                });
            }
        } catch (error) {
            console.error('Error loading delivery settings:', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // TODO: Implement profile update logic
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            // TODO: Implement password update logic
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        }
    };

    const handleNotificationUpdate = async () => {
        try {
            // TODO: Implement notification settings update logic
            toast.success('Notification settings updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update notification settings');
        }
    };

    const handleDeliverySettingsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);

        try {
            // Validate inputs
            if (deliverySettings.deliveryFeePerOrder < 0) {
                toast.error('Delivery fee cannot be negative');
                return;
            }
            if (deliverySettings.deliveryRadius < 1 || deliverySettings.deliveryRadius > 50) {
                toast.error('Delivery radius must be between 1 and 50 km');
                return;
            }
            if (deliverySettings.agentCommissionPercentage < 0 || deliverySettings.agentCommissionPercentage > 100) {
                toast.error('Agent commission must be between 0 and 100%');
                return;
            }
            if (deliverySettings.restaurantCommissionPercentage < 0 || deliverySettings.restaurantCommissionPercentage > 100) {
                toast.error('Restaurant commission must be between 0 and 100%');
                return;
            }
            if (deliverySettings.taxPercentage < 0 || deliverySettings.taxPercentage > 100) {
                toast.error('Tax percentage must be between 0 and 100%');
                return;
            }

            // Save to Firestore
            await setDoc(doc(db, 'settings', 'delivery'), {
                ...deliverySettings,
                updatedAt: new Date(),
                updatedBy: user?.uid
            });

            toast.success('Delivery settings updated successfully');
            loadDeliverySettings(); // Reload to confirm
        } catch (error: any) {
            console.error('Error updating delivery settings:', error);
            toast.error(error.message || 'Failed to update delivery settings');
        } finally {
            setSavingSettings(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'delivery', label: 'Delivery Configuration', icon: Truck }
    ];

    return (
        <Layout title="Settings">
            <div className="p-6 space-y-6">
                {/* Tabs */}
                <Card padding="none">
                    <div className="border-b border-secondary-200">
                        <div className="flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-primary-500 text-primary-600'
                                                : 'border-transparent text-secondary-600 hover:text-secondary-900'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* Profile Settings Tab */}
                {activeTab === 'profile' && (
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-secondary-900">Profile Information</h2>
                                    <p className="text-sm text-secondary-600">Update your account profile information</p>
                                </div>
                            </div>

                            {/* Profile Picture */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-secondary-700 mb-4">Profile Picture</label>
                                <div className="flex items-center space-x-6">
                                    <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                                        {user?.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt={user.name}
                                                className="h-24 w-24 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-primary-600 font-bold text-3xl">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <Button variant="secondary" icon={<Camera className="h-4 w-4" />}>
                                        Change Photo
                                    </Button>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        required
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        required
                                    />

                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                                        <div className="px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg">
                                            <span className="text-secondary-900 capitalize">{user?.role || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" variant="primary">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <Card>
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-secondary-900">Security Settings</h2>
                                <p className="text-sm text-secondary-600">Manage your password and security preferences</p>
                            </div>

                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    icon={<Lock className="h-4 w-4" />}
                                    required
                                />

                                <Input
                                    label="New Password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    icon={<Lock className="h-4 w-4" />}
                                    required
                                    helperText="Password must be at least 8 characters long"
                                />

                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    icon={<Lock className="h-4 w-4" />}
                                    required
                                />

                                <div className="flex justify-end">
                                    <Button type="submit" variant="primary">
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <Card>
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-secondary-900">Notification Preferences</h2>
                                <p className="text-sm text-secondary-600">Manage how you receive notifications</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between py-4 border-b border-secondary-200">
                                    <div>
                                        <h3 className="font-medium text-secondary-900">Email Notifications</h3>
                                        <p className="text-sm text-secondary-600">Receive notifications via email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailNotifications}
                                            onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-secondary-200">
                                    <div>
                                        <h3 className="font-medium text-secondary-900">Push Notifications</h3>
                                        <p className="text-sm text-secondary-600">Receive push notifications on your device</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.pushNotifications}
                                            onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-secondary-200">
                                    <div>
                                        <h3 className="font-medium text-secondary-900">Order Updates</h3>
                                        <p className="text-sm text-secondary-600">Get notified about order status changes</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.orderUpdates}
                                            onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <h3 className="font-medium text-secondary-900">Promotions & Updates</h3>
                                        <p className="text-sm text-secondary-600">Receive promotional offers and platform updates</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications.promotions}
                                            onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleNotificationUpdate} variant="primary">
                                        Save Preferences
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Delivery Configuration Tab */}
                {activeTab === 'delivery' && (
                    <Card>
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-secondary-900">Delivery Configuration</h2>
                                <p className="text-sm text-secondary-600">Manage delivery fees, radius, and commission settings</p>
                            </div>

                            {loadingSettings ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <form onSubmit={handleDeliverySettingsUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Input
                                                label="Delivery Fee Per Order (₹)"
                                                type="number"
                                                value={deliverySettings.deliveryFeePerOrder}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    deliveryFeePerOrder: parseFloat(e.target.value) || 0
                                                })}
                                                min="0"
                                                step="1"
                                                required
                                                helperText="Base delivery fee charged to customers per order"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Delivery Radius (km)"
                                                type="number"
                                                value={deliverySettings.deliveryRadius}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    deliveryRadius: parseFloat(e.target.value) || 0
                                                })}
                                                min="1"
                                                max="50"
                                                step="0.5"
                                                required
                                                helperText="Maximum delivery distance from restaurant"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Agent Commission (%)"
                                                type="number"
                                                value={deliverySettings.agentCommissionPercentage}
                                                onChange={(e) => {
                                                    const agentCommission = parseFloat(e.target.value) || 0;
                                                    setDeliverySettings({
                                                        ...deliverySettings,
                                                        agentCommissionPercentage: agentCommission,
                                                        platformCommissionPercentage: 100 - agentCommission
                                                    });
                                                }}
                                                min="0"
                                                max="100"
                                                step="1"
                                                required
                                                helperText="Percentage of delivery fee paid to agent"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Platform Commission (%)"
                                                type="number"
                                                value={deliverySettings.platformCommissionPercentage}
                                                disabled
                                                helperText="Automatically calculated (100% - Agent Commission)"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Restaurant Commission (%)"
                                                type="number"
                                                value={deliverySettings.restaurantCommissionPercentage}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    restaurantCommissionPercentage: parseFloat(e.target.value) || 0
                                                })}
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                required
                                                helperText="Platform commission from restaurant's order value"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Tax/GST (%)"
                                                type="number"
                                                value={deliverySettings.taxPercentage}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    taxPercentage: parseFloat(e.target.value) || 0
                                                })}
                                                min="0"
                                                max="100"
                                                step="0.5"
                                                required
                                                helperText="Tax percentage applied to order subtotal"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Minimum Order Value (₹)"
                                                type="number"
                                                value={deliverySettings.minimumOrderValue}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    minimumOrderValue: parseFloat(e.target.value) || 0
                                                })}
                                                min="0"
                                                step="1"
                                                required
                                                helperText="Free delivery for orders above this value (within normal distance)"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Long Distance Threshold (km)"
                                                type="number"
                                                value={deliverySettings.longDistanceThreshold}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    longDistanceThreshold: parseFloat(e.target.value) || 0
                                                })}
                                                min="1"
                                                max="50"
                                                step="0.5"
                                                required
                                                helperText="Distance above which long-distance fee applies"
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Long Distance Delivery Fee (₹)"
                                                type="number"
                                                value={deliverySettings.longDistanceDeliveryFee}
                                                onChange={(e) => setDeliverySettings({
                                                    ...deliverySettings,
                                                    longDistanceDeliveryFee: parseFloat(e.target.value) || 0
                                                })}
                                                min="0"
                                                step="1"
                                                required
                                                helperText="Delivery fee for restaurants beyond threshold distance"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview Card */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-3">Preview - Delivery Fee Rules</h3>
                                        <div className="bg-white rounded-lg p-3 mb-3">
                                            <div className="text-sm space-y-2">
                                                <div className="font-semibold text-blue-900">📋 Rules Summary:</div>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex items-start">
                                                        <span className="text-success-600 mr-2">✓</span>
                                                        <span>Order ≥ ₹{deliverySettings.minimumOrderValue} & Distance ≤ {deliverySettings.longDistanceThreshold}km: <strong>FREE delivery</strong> for customer, Agent gets ₹{(deliverySettings.deliveryFeePerOrder * deliverySettings.agentCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-warning-600 mr-2">⚠</span>
                                                        <span>Order &lt; ₹{deliverySettings.minimumOrderValue} & Distance ≤ {deliverySettings.longDistanceThreshold}km: Customer pays ₹{deliverySettings.deliveryFeePerOrder}, Agent gets ₹{(deliverySettings.deliveryFeePerOrder * deliverySettings.agentCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-error-600 mr-2">⚡</span>
                                                        <span>Distance &gt; {deliverySettings.longDistanceThreshold}km: Customer pays ₹{deliverySettings.longDistanceDeliveryFee} (no minimum order), Agent gets ₹{(deliverySettings.longDistanceDeliveryFee * deliverySettings.agentCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-blue-900 mb-3 mt-4">Sample Order (₹500 food, 5km distance)</h3>
                                        <div className="space-y-3 text-sm">
                                            {/* Customer Side */}
                                            <div className="bg-white rounded-lg p-3">
                                                <div className="font-semibold text-blue-900 mb-2">Customer Pays:</div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary-600">Food subtotal:</span>
                                                        <span>₹500.00</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary-600">Tax ({deliverySettings.taxPercentage}%):</span>
                                                        <span>₹{(500 * deliverySettings.taxPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary-600">Delivery fee:</span>
                                                        <span className="text-success-600 font-semibold">FREE</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold border-t pt-1">
                                                        <span>Total:</span>
                                                        <span>₹{(500 + (500 * deliverySettings.taxPercentage / 100)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Restaurant Side */}
                                            <div className="bg-white rounded-lg p-3">
                                                <div className="font-semibold text-blue-900 mb-2">Restaurant Receives:</div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary-600">Food subtotal:</span>
                                                        <span>₹500.00</span>
                                                    </div>
                                                    <div className="flex justify-between text-error-600">
                                                        <span>Platform commission ({deliverySettings.restaurantCommissionPercentage}%):</span>
                                                        <span>-₹{(500 * deliverySettings.restaurantCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold border-t pt-1 text-success-600">
                                                        <span>Net Amount:</span>
                                                        <span>₹{(500 - (500 * deliverySettings.restaurantCommissionPercentage / 100)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delivery Agent Side */}
                                            <div className="bg-white rounded-lg p-3">
                                                <div className="font-semibold text-blue-900 mb-2">Delivery Agent Receives:</div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-secondary-600">Delivery fee ({deliverySettings.agentCommissionPercentage}% of ₹{deliverySettings.deliveryFeePerOrder}):</span>
                                                        <span className="font-semibold text-success-600">₹{(deliverySettings.deliveryFeePerOrder * deliverySettings.agentCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="text-xs text-secondary-500 mt-1">
                                                        * Agent gets {deliverySettings.agentCommissionPercentage}% of delivery fee, even when customer gets free delivery
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Platform Side */}
                                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                                                <div className="font-semibold text-primary-900 mb-2">Platform Receives:</div>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-primary-700">From restaurant ({deliverySettings.restaurantCommissionPercentage}%):</span>
                                                        <span>₹{(500 * deliverySettings.restaurantCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-primary-700">Tax collected:</span>
                                                        <span>₹{(500 * deliverySettings.taxPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-error-600">
                                                        <span>Agent fee paid ({deliverySettings.agentCommissionPercentage}%):</span>
                                                        <span>-₹{(deliverySettings.deliveryFeePerOrder * deliverySettings.agentCommissionPercentage / 100).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-semibold border-t border-primary-300 pt-1 text-primary-900">
                                                        <span>Net Platform Revenue:</span>
                                                        <span>₹{((500 * deliverySettings.restaurantCommissionPercentage / 100) + (500 * deliverySettings.taxPercentage / 100) - (deliverySettings.deliveryFeePerOrder * deliverySettings.agentCommissionPercentage / 100)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-blue-300 pt-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-blue-700">Service radius:</span>
                                                    <span className="font-semibold text-blue-900">
                                                        {deliverySettings.deliveryRadius} km
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={loadDeliverySettings}
                                            disabled={savingSettings}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={savingSettings}
                                        >
                                            {savingSettings ? 'Saving...' : 'Save Settings'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default Settings;
