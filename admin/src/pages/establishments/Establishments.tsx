import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { EstablishmentList } from '../../components/features/establishments/EstablishmentList';
import { EstablishmentFilters } from '../../components/features/establishments/EstablishmentFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchEstablishments, setFilters } from '../../store/slices/establishmentSlice';
import { ESTABLISHMENT_TYPES } from '../../utils/constants';
import type { EstablishmentType } from '../../types';

const Establishments: React.FC = () => {
    const dispatch = useAppDispatch();
    const { establishments, loading, error, filters, pagination } = useAppSelector(state => state.establishments);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Set establishment type filter from URL params
        const typeParam = searchParams.get('type') as EstablishmentType;
        if (typeParam && Object.values(ESTABLISHMENT_TYPES).includes(typeParam)) {
            dispatch(setFilters({ establishmentType: typeParam }));
        } else if (typeParam === null) {
            // Reset to 'all' if no type param
            dispatch(setFilters({ establishmentType: 'all' }));
        }
    }, [dispatch, searchParams]);

    useEffect(() => {
        // Fetch establishments when filters change
        dispatch(fetchEstablishments({ filters, page: pagination.page, limit: pagination.limit }));
    }, [dispatch, filters, pagination.page, pagination.limit]);

    const handleFiltersChange = (newFilters: any) => {
        dispatch(setFilters(newFilters));
    };

    const handleRetry = () => {
        dispatch(fetchEstablishments({ filters, page: pagination.page, limit: pagination.limit }));
    };

    return (
        <Layout title="Establishments">
            <div className="p-6 space-y-6">

                <EstablishmentFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                <EstablishmentList
                    establishments={establishments}
                    loading={loading}
                    error={error}
                    onRetry={handleRetry}
                />

                {/* Show filter status */}
                {!loading && !error && (
                    <div className="flex justify-between items-center text-sm text-secondary-600 mt-4">
                        <span>
                            Showing {establishments.length} establishment{establishments.length !== 1 ? 's' : ''}
                            {filters.status !== 'all' && ` with status "${filters.status}"`}
                            {filters.establishmentType !== 'all' && ` of type "${filters.establishmentType.replace('_', ' ')}"`}
                        </span>
                        {establishments.length === 0 && (filters.status !== 'all' || filters.establishmentType !== 'all' || filters.search) && (
                            <span className="text-primary-600">Try adjusting your filters</span>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Establishments;