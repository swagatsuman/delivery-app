import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchDeliveryAgentDetails,
    updateDeliveryAgentStatus,
    clearSelectedDeliveryAgent
} from '../../store/slices/deliveryAgentSlice';
import { formatDate, formatCurrency, validateEmail, validatePhone } from '../../utils/helpers';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Car,
    Star,
    Clock,
    Check,
    X,
    Ban,
    AlertCircle,
    FileText,
    CreditCard,
    Users,
    Download,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const DeliveryAgentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedDeliveryAgent, loading, error } = useAppSelector(state => state.deliveryAgents);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState<{ action: string; status: string } | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<{ type: string; url: string } | null>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchDeliveryAgentDetails(id));
        }

        return () => {
            dispatch(clearSelectedDeliveryAgent());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleStatusUpdate = async (status: string, action: string) => {
        setSelectedAction({ action, status });
        setShowStatusModal(true);
    };

    const confirmStatusUpdate = async () => {
        if (!selectedDeliveryAgent || !selectedAction) return;

        try {
            await dispatch(updateDeliveryAgentStatus({
                uid: selectedDeliveryAgent.uid,
                status: selectedAction.status
            })).unwrap();

            toast.success(`Delivery agent ${selectedAction.action.toLowerCase()} successfully`);
            setShowStatusModal(false);
            setSelectedAction(null);

            // Refresh the agent details
            if (id) {
                dispatch(fetchDeliveryAgentDetails(id));
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to ${selectedAction.action.toLowerCase()} delivery agent`);
        }
    };

    const handleViewDocument = (type: string, url: string) => {
        setSelectedDocument({ type, url });
        setShowDocumentModal(true);
    };

    const getVehicleIcon = (vehicleType: string) => {
        switch (vehicleType) {
            case 'bike':
                return '🏍️';
            case 'bicycle':
                return '🚴';
            case 'car':
                return '🚗';
            default:
                return <Car className="h-6 w-6" />;
        }
    };

    if (loading) {
        return (
            <Layout title="Delivery Agent Details">
                <Loading fullScreen text="Loading agent details..." />
            </Layout>
        );
    }

    if (!selectedDeliveryAgent) {
        return (
            <Layout title="Delivery Agent Details">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-error-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">Agent Not Found</h3>
                        <p className="text-secondary-600 mb-4">The delivery agent you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/delivery-agents')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Agents
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const agent = selectedDeliveryAgent;
    const details = agent.deliveryAgentDetails;

    return (
        <Layout
            title={agent.name}
            actions={
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/delivery-agents')}
                    icon={<ArrowLeft className="h-4 w-4" />}
                >
                    Back to Agents
                </Button>
            }
        >
            <div className="p-6 space-y-6">
                {/* Header */}
                <Card padding="md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="h-20 w-20 bg-primary-100 rounded-xl flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600">
                                    {agent.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                                    {agent.name}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-secondary-600">
                                    <span>ID: {agent.uid}</span>
                                    <span>•</span>
                                    <span>Joined: {formatDate(agent.createdAt)}</span>
                                </div>
                                <div className="flex items-center space-x-3 mt-3">
                                    <Badge
                                        variant={
                                            agent.status === 'active' ? 'success' :
                                                agent.status === 'pending' ? 'warning' :
                                                    agent.status === 'suspended' ? 'error' : 'default'
                                        }
                                        size="md"
                                    >
                                        {agent.status.toUpperCase()}
                                    </Badge>

                                    {details && (
                                        <Badge variant={details.isAvailable ? 'success' : 'error'} size="md">
                                            {details.isAvailable ? 'Available' : 'Offline'}
                                        </Badge>
                                    )}

                                    {details && (
                                        <Badge variant="info" size="md">
                                            {details.vehicleType.charAt(0).toUpperCase() + details.vehicleType.slice(1)}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            {agent.status === 'pending' && (
                                <>
                                    <Button
                                        variant="primary"
                                        icon={<Check className="h-4 w-4" />}
                                        onClick={() => handleStatusUpdate('active', 'Approved')}
                                    >
                                        Approve Agent
                                    </Button>
                                    <Button
                                        variant="danger"
                                        icon={<X className="h-4 w-4" />}
                                        onClick={() => handleStatusUpdate('inactive', 'Rejected')}
                                    >
                                        Reject Agent
                                    </Button>
                                </>
                            )}

                            {agent.status === 'active' && (
                                <Button
                                    variant="danger"
                                    icon={<Ban className="h-4 w-4" />}
                                    onClick={() => handleStatusUpdate('suspended', 'Suspended')}
                                >
                                    Suspend Agent
                                </Button>
                            )}

                            {(agent.status === 'suspended' || agent.status === 'inactive') && (
                                <Button
                                    variant="primary"
                                    icon={<Check className="h-4 w-4" />}
                                    onClick={() => handleStatusUpdate('active', 'Reactivated')}
                                >
                                    Reactivate Agent
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card title="Contact Information" padding="md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-secondary-700 mb-3">Personal Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-4 w-4 text-secondary-400" />
                                            <div>
                                                <p className="text-secondary-900">{agent.email}</p>
                                                <p className="text-xs text-secondary-500">
                                                    {validateEmail(agent.email) ? 'Valid email' : 'Invalid email format'}
                                                </p>
                                            </div>
                                        </div>

                                        {agent.phone && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="h-4 w-4 text-secondary-400" />
                                                <div>
                                                    <p className="text-secondary-900">{agent.phone}</p>
                                                    <p className="text-xs text-secondary-500">
                                                        {validatePhone(agent.phone) ? 'Valid phone' : 'Invalid phone format'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {details?.emergencyContact && (
                                    <div>
                                        <h4 className="text-sm font-medium text-secondary-700 mb-3">Emergency Contact</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <Users className="h-4 w-4 text-secondary-400" />
                                                <div>
                                                    <p className="text-secondary-900">{details.emergencyContact.name}</p>
                                                    <p className="text-xs text-secondary-500 capitalize">
                                                        {details.emergencyContact.relationship}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Phone className="h-4 w-4 text-secondary-400" />
                                                <p className="text-secondary-900">{details.emergencyContact.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Vehicle Information */}
                        {details && (
                            <Card title="Vehicle Information" padding="md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-3xl">{getVehicleIcon(details.vehicleType)}</div>
                                        <div>
                                            <p className="text-sm text-secondary-600">Vehicle Type</p>
                                            <p className="font-medium text-secondary-900 capitalize">{details.vehicleType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Car className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Vehicle Number</p>
                                            <p className="font-medium text-secondary-900">{details.vehicleNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">License Number</p>
                                            <p className="font-medium text-secondary-900">{details.licenseNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Current Status</p>
                                            <Badge variant={details.isAvailable ? 'success' : 'error'}>
                                                {details.isAvailable ? 'Available for delivery' : 'Not available'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* KYC Documents */}
                        {details?.kycDocuments && (
                            <Card title="KYC Documents" padding="md">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { key: 'aadhar', label: 'Aadhar Card', icon: FileText },
                                        { key: 'license', label: 'Driving License', icon: FileText },
                                        { key: 'pan', label: 'PAN Card', icon: FileText },
                                        { key: 'photo', label: 'Profile Photo', icon: FileText }
                                    ].map((doc) => {
                                        const hasDocument = details.kycDocuments[doc.key as keyof typeof details.kycDocuments];
                                        return (
                                            <div
                                                key={doc.key}
                                                className={`border-2 rounded-lg p-4 text-center ${
                                                    hasDocument
                                                        ? 'border-success-200 bg-success-50'
                                                        : 'border-error-200 bg-error-50'
                                                }`}
                                            >
                                                <doc.icon
                                                    className={`h-8 w-8 mx-auto mb-2 ${
                                                        hasDocument ? 'text-success-600' : 'text-error-600'
                                                    }`}
                                                />
                                                <p className="text-sm font-medium text-secondary-900 mb-1">
                                                    {doc.label}
                                                </p>
                                                <Badge
                                                    variant={hasDocument ? 'success' : 'error'}
                                                    size="sm"
                                                >
                                                    {hasDocument ? 'Uploaded' : 'Missing'}
                                                </Badge>
                                                {hasDocument && (
                                                    <div className="mt-2 space-x-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<Eye className="h-3 w-3" />}
                                                            onClick={() => handleViewDocument(doc.label, hasDocument)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<Download className="h-3 w-3" />}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Performance Stats */}
                        {details && (
                            <Card title="Performance Statistics" padding="md">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Total Deliveries:</span>
                                        <span className="font-semibold text-secondary-900">{details.totalDeliveries}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Completed:</span>
                                        <span className="font-semibold text-success-600">{details.completedDeliveries}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Cancelled:</span>
                                        <span className="font-semibold text-error-600">{details.cancelledDeliveries}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Success Rate:</span>
                                        <span className="font-semibold text-secondary-900">
                                            {details.totalDeliveries > 0 ?
                                                Math.round((details.completedDeliveries / details.totalDeliveries) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Rating:</span>
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-4 w-4 text-yellow-400" />
                                            <span className="font-semibold text-secondary-900">
                                                {details.averageRating ? details.averageRating.toFixed(1) : 'N/A'}
                                            </span>
                                            {details.totalRatings > 0 && (
                                                <span className="text-sm text-secondary-500">({details.totalRatings})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Total Earnings:</span>
                                        <span className="font-semibold text-success-600">{formatCurrency(details.earnings)}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Bank Details */}
                        {details?.bankDetails && (
                            <Card title="Bank Details" padding="md">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="h-5 w-5 text-secondary-400" />
                                        <div>
                                            <p className="text-sm text-secondary-600">Account Holder</p>
                                            <p className="font-medium text-secondary-900">{details.bankDetails.accountHolderName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-600">Account Number</p>
                                        <p className="font-medium text-secondary-900">
                                            ****{details.bankDetails.accountNumber.slice(-4)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-600">IFSC Code</p>
                                        <p className="font-medium text-secondary-900">{details.bankDetails.ifscCode}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Working Hours */}
                        {details?.workingHours && (
                            <Card title="Working Hours" padding="md">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Start Time:</span>
                                        <span className="font-medium text-secondary-900">{details.workingHours.start}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">End Time:</span>
                                        <span className="font-medium text-secondary-900">{details.workingHours.end}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Currently:</span>
                                        <Badge variant={details.workingHours.isOnline ? 'success' : 'error'}>
                                            {details.workingHours.isOnline ? 'Online' : 'Offline'}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Account Status */}
                        <Card title="Account Status" padding="md">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Account Status:</span>
                                    <Badge
                                        variant={
                                            agent.status === 'active' ? 'success' :
                                                agent.status === 'pending' ? 'warning' :
                                                    agent.status === 'suspended' ? 'error' : 'default'
                                        }
                                    >
                                        {agent.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-600">Created:</span>
                                    <span className="text-sm text-secondary-900">
                                        {formatDate(agent.createdAt)}
                                    </span>
                                </div>
                                {agent.updatedAt && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-secondary-600">Last Updated:</span>
                                        <span className="text-sm text-secondary-900">
                                            {formatDate(agent.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Status Update Confirmation Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title={`${selectedAction?.action} Delivery Agent`}
            >
                <div className="space-y-4">
                    <p className="text-secondary-600">
                        Are you sure you want to {selectedAction?.action.toLowerCase()} <strong>{agent.name}</strong>?
                    </p>
                    {selectedAction?.action === 'Suspend' && (
                        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                            <p className="text-warning-800 text-sm">
                                This agent will be prevented from taking new orders and marked as unavailable.
                            </p>
                        </div>
                    )}
                    {selectedAction?.action === 'Reject' && (
                        <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                            <p className="text-error-800 text-sm">
                                This will reject the agent's application. They will need to reapply.
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowStatusModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={selectedAction?.action === 'Approve' ? 'primary' : 'danger'}
                            onClick={confirmStatusUpdate}
                            loading={loading}
                        >
                            {selectedAction?.action}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Document View Modal */}
            <Modal
                isOpen={showDocumentModal}
                onClose={() => setShowDocumentModal(false)}
                title={`View ${selectedDocument?.type}`}
                size="lg"
            >
                <div className="space-y-4">
                    {selectedDocument && (
                        <div className="bg-secondary-50 rounded-lg p-8 text-center">
                            <FileText className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
                            <p className="text-secondary-600 mb-4">
                                Document: {selectedDocument.type}
                            </p>
                            <p className="text-sm text-secondary-500 mb-4">
                                URL: {selectedDocument.url}
                            </p>
                            <div className="flex justify-center space-x-3">
                                <Button
                                    variant="primary"
                                    icon={<Eye className="h-4 w-4" />}
                                    onClick={() => window.open(selectedDocument.url, '_blank')}
                                >
                                    View Document
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Download className="h-4 w-4" />}
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = selectedDocument.url;
                                        link.download = `${selectedDocument.type}_${agent.name}`;
                                        link.click();
                                    }}
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};

export default DeliveryAgentDetail;
