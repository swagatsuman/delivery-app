import React, { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Car,
    FileText,
    Star,
    CreditCard,
    Edit,
    Save,
    X
} from 'lucide-react';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || ''
    });

    const handleSave = () => {
        // TODO: Implement profile update
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            email: user?.email || ''
        });
        setIsEditing(false);
    };

    if (!user) {
        return (
            <Layout title="Profile">
                <div className="flex items-center justify-center h-96">
                    <p className="text-secondary-500">Loading profile...</p>
                </div>
            </Layout>
        );
    }

    const agent = user.deliveryAgentDetails;

    return (
        <Layout title="My Profile">
            <div className="p-6 space-y-6">
                {/* Profile Header */}
                <Card padding="md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="h-10 w-10 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-secondary-900">{user.name}</h2>
                                <p className="text-secondary-600">{user.email}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                                        {user.status.toUpperCase()}
                                    </Badge>
                                    {agent && (
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-4 w-4 text-warning-500" />
                                            <span className="text-sm font-medium">
                                                {agent.averageRating?.toFixed(1) || '0.0'} ({agent.totalRatings || 0} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setIsEditing(!isEditing)}
                            icon={<Edit className="h-4 w-4" />}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Personal Information" padding="md">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        icon={<User className="h-4 w-4" />}
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        icon={<Phone className="h-4 w-4" />}
                                    />
                                    <Input
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        icon={<Mail className="h-4 w-4" />}
                                        disabled
                                    />
                                    <div className="flex space-x-3">
                                        <Button onClick={handleSave} icon={<Save className="h-4 w-4" />}>
                                            Save Changes
                                        </Button>
                                        <Button variant="secondary" onClick={handleCancel} icon={<X className="h-4 w-4" />}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Full Name</p>
                                            <p className="font-medium text-secondary-900">{user.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Phone Number</p>
                                            <p className="font-medium text-secondary-900">{user.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Email Address</p>
                                            <p className="font-medium text-secondary-900">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Vehicle Information */}
                        {agent && (
                            <Card title="Vehicle Information" padding="md">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center space-x-3">
                                        <Car className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Vehicle Type</p>
                                            <p className="font-medium text-secondary-900 capitalize">{agent.vehicleType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Vehicle Number</p>
                                            <p className="font-medium text-secondary-900">{agent.vehicleNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">License Number</p>
                                            <p className="font-medium text-secondary-900">{agent.licenseNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Status</p>
                                            <Badge variant={agent.isAvailable ? 'success' : 'error'}>
                                                {agent.isAvailable ? 'Available' : 'Offline'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Emergency Contact */}
                        {agent?.emergencyContact && (
                            <Card title="Emergency Contact" padding="md">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-secondary-600">Name</p>
                                        <p className="font-medium text-secondary-900">{agent.emergencyContact.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-600">Phone</p>
                                        <p className="font-medium text-secondary-900">{agent.emergencyContact.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-600">Relationship</p>
                                        <p className="font-medium text-secondary-900 capitalize">{agent.emergencyContact.relationship}</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        {agent && (
                            <Card title="Delivery Stats" padding="md">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Total Deliveries:</span>
                                        <span className="font-semibold text-secondary-900">{agent.totalDeliveries}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Completed:</span>
                                        <span className="font-semibold text-success-600">{agent.completedDeliveries}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Cancelled:</span>
                                        <span className="font-semibold text-error-600">{agent.cancelledDeliveries}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Success Rate:</span>
                                        <span className="font-semibold text-secondary-900">
                                            {agent.totalDeliveries > 0 ?
                                                Math.round((agent.completedDeliveries / agent.totalDeliveries) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Total Earnings:</span>
                                        <span className="font-semibold text-success-600">{formatCurrency(agent.earnings)}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Bank Details */}
                        {agent?.bankDetails && (
                            <Card title="Bank Details" padding="md">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Account Holder</p>
                                            <p className="font-medium text-secondary-900">{agent.bankDetails.accountHolderName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-600">Account Number</p>
                                        <p className="font-medium text-secondary-900">
                                            ****{agent.bankDetails.accountNumber.slice(-4)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-600">IFSC Code</p>
                                        <p className="font-medium text-secondary-900">{agent.bankDetails.ifscCode}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Working Hours */}
                        {agent?.workingHours && (
                            <Card title="Working Hours" padding="md">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Start Time:</span>
                                        <span className="font-medium text-secondary-900">{agent.workingHours.start}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">End Time:</span>
                                        <span className="font-medium text-secondary-900">{agent.workingHours.end}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-secondary-600">Currently:</span>
                                        <Badge variant={agent.workingHours.isOnline ? 'success' : 'error'}>
                                            {agent.workingHours.isOnline ? 'Online' : 'Offline'}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* KYC Documents */}
                        {agent?.kycDocuments && (
                            <Card title="KYC Documents" padding="md">
                                <div className="space-y-3">
                                    {Object.entries(agent.kycDocuments).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm text-secondary-600 capitalize">
                                                {key === 'aadhar' ? 'Aadhar Card' :
                                                    key === 'license' ? 'Driving License' :
                                                        key === 'pan' ? 'PAN Card' : 'Profile Photo'}:
                                            </span>
                                            <Badge variant={value ? 'success' : 'error'} size="sm">
                                                {value ? 'Verified' : 'Pending'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
