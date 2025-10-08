import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Car,
    FileText,
    Star,
    ChevronRight,
    LogOut,
    Shield,
    Bell,
    HelpCircle,
    IndianRupee,
    Package,
    TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to logout');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-secondary-500">Loading profile...</p>
            </div>
        );
    }

    const agent = user.deliveryAgentDetails;

    return (
        <div className="min-h-screen bg-background">
            {/* Profile Header */}
            <div className="bg-primary-500 text-white px-4 py-8">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-primary-100">{user.phone}</p>
                        <div className="flex items-center space-x-2 mt-2">
                            {agent && (
                                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                                    <Star className="h-4 w-4 text-warning-300 fill-current" />
                                    <span className="text-sm font-medium">
                                        {agent.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                </div>
                            )}
                            <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                                {user.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Package className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xl font-bold">{agent?.totalDeliveries || 0}</div>
                        <div className="text-xs text-primary-100">Deliveries</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <IndianRupee className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xl font-bold">₹{agent?.earnings?.toFixed(0) || 0}</div>
                        <div className="text-xs text-primary-100">Earnings</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xl font-bold">{agent?.totalRatings || 0}</div>
                        <div className="text-xs text-primary-100">Reviews</div>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="px-4 py-6 space-y-4">
                {/* Personal Information */}
                <Card>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Personal Information</h3>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-secondary-100 rounded-lg">
                                    <Mail className="h-5 w-5 text-secondary-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-secondary-600">Email</p>
                                    <p className="text-sm font-medium text-secondary-900">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-secondary-100 rounded-lg">
                                    <Phone className="h-5 w-5 text-secondary-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-secondary-600">Phone</p>
                                    <p className="text-sm font-medium text-secondary-900">{user.phone}</p>
                                </div>
                            </div>

                            {agent?.address && (
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-secondary-100 rounded-lg">
                                        <MapPin className="h-5 w-5 text-secondary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-secondary-600">Address</p>
                                        <p className="text-sm font-medium text-secondary-900">
                                            {agent.address.city}, {agent.address.state}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Vehicle Information */}
                {agent?.vehicleDetails && (
                    <Card>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Vehicle Information</h3>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-secondary-100 rounded-lg">
                                        <Car className="h-5 w-5 text-secondary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-secondary-600">Vehicle Type</p>
                                        <p className="text-sm font-medium text-secondary-900 capitalize">
                                            {agent.vehicleDetails.type || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-secondary-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-secondary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-secondary-600">License Plate</p>
                                        <p className="text-sm font-medium text-secondary-900">
                                            {agent.vehicleDetails.licensePlate || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Menu Options */}
                <Card>
                    <div className="divide-y divide-secondary-200">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <Bell className="h-5 w-5 text-secondary-600" />
                                <span className="font-medium text-secondary-900">Notifications</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-secondary-400" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <Shield className="h-5 w-5 text-secondary-600" />
                                <span className="font-medium text-secondary-900">Privacy & Security</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-secondary-400" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <HelpCircle className="h-5 w-5 text-secondary-600" />
                                <span className="font-medium text-secondary-900">Help & Support</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-secondary-400" />
                        </button>
                    </div>
                </Card>

                {/* Logout Button */}
                <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="w-full"
                    icon={<LogOut className="h-5 w-5" />}
                >
                    Logout
                </Button>

                {/* App Version */}
                <p className="text-center text-xs text-secondary-500 pt-4">
                    Version 1.0.0
                </p>
            </div>
        </div>
    );
};

export default Profile;
