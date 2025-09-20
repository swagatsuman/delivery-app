import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RestaurantList } from '../../components/features/restaurants/RestaurantList';
import { RestaurantFiltersComponent } from '../../components/features/restaurants/RestaurantFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
    fetchRestaurants,
    updateRestaurantStatus,
    setFilters,
    setPagination
} from '../../store/slices/restaurantSlice';
import type { User } from '../../types';
import { Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Restaurants: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { restaurants, loading, filters, pagination, error } = useAppSelector(state => state.restaurants);

    useEffect(() => {
        // Initialize filters from URL params
        const statusParam = searchParams.get('filter');
        if (statusParam && statusParam !== filters.status) {
            dispatch(setFilters({ status: statusParam as any }));
        }

        dispatch(fetchRestaurants({ filters, page: pagination.page, limit: pagination.limit }));
    }, [dispatch, filters, pagination.page, pagination.limit, searchParams]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleFiltersChange = (newFilters: any) => {
        dispatch(setFilters(newFilters));
        dispatch(setPagination({ page: 1 })); // Reset to first page when filtering
    };

    const handleResetFilters = () => {
        dispatch(setFilters({ status: 'all', search: '', cuisine: '', rating: null }));
        setSearchParams({});
    };

    const handleViewDetails = (restaurant: User) => {
        navigate(`/restaurants/${restaurant.uid}`);
    };

    const handleUpdateStatus = async (uid: string, status: string) => {
        try {
            await dispatch(updateRestaurantStatus({ uid, status })).unwrap();
            toast.success(`Restaurant ${status === 'active' ? 'approved' : status} successfully`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update restaurant status');
        }
    };

    return (
        <Layout title="Restaurant Management">
            <div className="p-6 space-y-6">
                {/* Filters */}
                <RestaurantFiltersComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                />

                {/* Restaurant List */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-secondary-900">
                                Restaurants ({pagination.total})
                            </h2>
                            <p className="text-sm text-secondary-600">
                                Manage restaurant approvals and monitoring
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

                    <RestaurantList
                        restaurants={restaurants}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                        onUpdateStatus={handleUpdateStatus}
                    />
                </Card>
            </div>
        </Layout>
    );
};

export default Restaurants;
