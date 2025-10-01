import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchEstablishmentDetails,
    approveEstablishment,
    rejectEstablishment,
    clearSelectedEstablishment
} from '../../store/slices/establishmentSlice';
import { EstablishmentTypeFeatures } from '../../components/features/establishments/EstablishmentTypeFeatures';
import { ApprovalActions } from '../../components/features/establishments/ApprovalActions';

const EstablishmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedEstablishment, loading, error } = useAppSelector(state => state.establishments);
    const { user } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (id) {
            dispatch(fetchEstablishmentDetails(id));
        }

        return () => {
            dispatch(clearSelectedEstablishment());
        };
    }, [dispatch, id]);

    const handleApprove = () => {
        if (id && user) {
            dispatch(approveEstablishment({ uid: id, approvedBy: user.uid }));
        }
    };

    const handleReject = (reason: string) => {
        if (id) {
            dispatch(rejectEstablishment({ uid: id, rejectedReason: reason }));
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            </Layout>
        );
    }

    if (error || !selectedEstablishment) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">Establishment not found</h3>
                    <p className="text-secondary-600">{error || 'The establishment you\'re looking for doesn\'t exist.'}</p>
                    <Button onClick={() => navigate('/establishments')} className="mt-4">
                        Back to Establishments
                    </Button>
                </div>
            </Layout>
        );
    }

    const establishment = selectedEstablishment.establishmentDetails;
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'suspended': return 'error';
            default: return 'secondary';
        }
    };

    return (
        <Layout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div
                            className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 cursor-pointer transition-colors"
                            onClick={() => navigate('/establishments')}
                        >
                            <Icon icon={<ArrowLeft />} size="sm" variant="ghost" />
                            <span className="text-sm font-medium">Back to Establishments</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-secondary-900">
                                {establishment?.businessName || selectedEstablishment.name}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={getStatusColor(selectedEstablishment.status)}>
                                    {selectedEstablishment.status}
                                </Badge>
                                {establishment?.establishmentType && (
                                    <Badge variant="outline">
                                        {establishment.establishmentType.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Approval Actions */}
                    {selectedEstablishment.status === 'pending' && (
                        <ApprovalActions
                            onApprove={handleApprove}
                            onReject={handleReject}
                            loading={loading}
                        />
                    )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Basic Information">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Owner Name</label>
                                    <p className="text-secondary-900">{selectedEstablishment.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Email</label>
                                    <p className="text-secondary-900">{selectedEstablishment.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Phone</label>
                                    <p className="text-secondary-900">{selectedEstablishment.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Business Name</label>
                                    <p className="text-secondary-900">{establishment?.businessName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">GSTIN</label>
                                    <p className="text-secondary-900">{establishment?.gstin || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Establishment Type</label>
                                    <p className="text-secondary-900 capitalize">
                                        {establishment?.establishmentType?.replace('_', ' ') || 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Type-specific Features */}
                        {establishment?.establishmentType && (
                            <EstablishmentTypeFeatures
                                establishmentType={establishment.establishmentType}
                                establishment={establishment}
                            />
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Statistics */}
                        <Card title="Statistics">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Total Orders</span>
                                    <span className="font-medium">{establishment?.totalOrders || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Revenue</span>
                                    <span className="font-medium">₹{establishment?.revenue || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Rating</span>
                                    <span className="font-medium">{establishment?.rating || 0}/5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Total Ratings</span>
                                    <span className="font-medium">{establishment?.totalRatings || 0}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Status Information */}
                        <Card title="Status Information">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Account Status</label>
                                    <p className="text-secondary-900 capitalize">{selectedEstablishment.status}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary-700">Joined Date</label>
                                    <p className="text-secondary-900">
                                        {new Date(selectedEstablishment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {establishment?.approvedAt && (
                                    <div>
                                        <label className="text-sm font-medium text-secondary-700">Approved Date</label>
                                        <p className="text-secondary-900">
                                            {new Date(establishment.approvedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {establishment?.rejectedReason && (
                                    <div>
                                        <label className="text-sm font-medium text-secondary-700">Rejection Reason</label>
                                        <p className="text-error-600">{establishment.rejectedReason}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EstablishmentDetail;