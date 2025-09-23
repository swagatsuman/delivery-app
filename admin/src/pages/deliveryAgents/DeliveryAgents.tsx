import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DeliveryAgentList } from '../../components/features/deliveryAgents/DeliveryAgentList.tsx';
import { DeliveryAgentFilters } from '../../components/features/deliveryAgents/DeliveryAgentFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchDeliveryAgents,
    updateDeliveryAgentStatus,
    setFilters,
    setPagination
} from '../../store/slices/deliveryAgentSlice';
import type { User } from '../../types';
import { Download, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const DeliveryAgents: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { deliveryAgents, loading, filters, pagination, error } = useAppSelector(state => state.deliveryAgents);

    useEffect(() => {
        // Initialize filters from URL params
        const statusParam = searchParams.get('filter');
        if (statusParam && statusParam !== filters.status) {
            dispatch(setFilters({ status: statusParam as any }));
        }

        dispatch(fetchDeliveryAgents({ filters, page: pagination.page, limit: pagination.limit }));
    }, [dispatch, filters, pagination.page, pagination.limit, searchParams]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleFiltersChange = (newFilters: any) => {
        dispatch(setFilters(newFilters));
        dispatch(setPagination({ page: 1 }));
    };

    const handleResetFilters = () => {
        dispatch(setFilters({ status: 'all', search: '', vehicleType: 'all' }));
        setSearchParams({});
    };

    const handleViewDetails = (agent: User) => {
        navigate(`/delivery-agents/${agent.uid}`);
    };

    const handleUpdateStatus = async (uid: string, status: string) => {
        try {
            await dispatch(updateDeliveryAgentStatus({ uid, status })).unwrap();
            toast.success(`Delivery agent ${status === 'active' ? 'approved' : status} successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update delivery agent status');
        }
    };

    const getStats = () => {
        return {
            total: deliveryAgents.length,
            pending: deliveryAgents.filter(a => a.status === 'pending').length,
            active: deliveryAgents.filter(a => a.status === 'active').length,
            suspended: deliveryAgents.filter(a => a.status === 'suspended').length,
            online: deliveryAgents.filter(a => a.deliveryAgentDetails?.isAvailable).length
        };
    };

    const stats = getStats();

    return (
        <Layout title="Delivery Agent Management">
            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Total Agents</p>
                                <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Truck className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Pending</p>
                                <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-warning-100 rounded-lg">
                                <div className="h-6 w-6 bg-warning-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Active</p>
                                <p className="text-2xl font-bold text-success-600">{stats.active}</p>
                            </div>
                            <div className="p-3 bg-success-100 rounded-lg">
                                <div className="h-6 w-6 bg-success-600 rounded"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Online</p>
                                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <div className="h-6 w-6 bg-green-600 rounded-full"></div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-secondary-600">Suspended</p>
                                <p className="text-2xl font-bold text-error-600">{stats.suspended}</p>
                            </div>
                            <div className="p-3 bg-error-100 rounded-lg">
                                <div className="h-6 w-6 bg-error-600 rounded"></div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <DeliveryAgentFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                />

                {/* Delivery Agents List */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">
                                Delivery Agents ({pagination.total})
                            </h2>
                            <p className="text-sm text-secondary-600">
                                Manage delivery agent approvals and monitoring
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                variant="secondary"
                                icon={<Download className="h-4 w-4" />}
                            >
                                Export
                            </Button>
                        </div>
                    </div>

                    <DeliveryAgentList
                        deliveryAgents={deliveryAgents}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                        onUpdateStatus={handleUpdateStatus}
                    />
                </Card>
            </div>
        </Layout>
    );
};

export default DeliveryAgents;
