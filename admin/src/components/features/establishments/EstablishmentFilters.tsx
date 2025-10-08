import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import type { EstablishmentFilters as Filters, EstablishmentType } from '../../../types';
import { ESTABLISHMENT_TYPES, ESTABLISHMENT_STATUS, CUISINE_TYPES } from '../../../utils/constants';

interface EstablishmentFiltersProps {
    filters: Filters;
    onFiltersChange: (filters: Partial<Filters>) => void;
}

export const EstablishmentFilters: React.FC<EstablishmentFiltersProps> = ({
    filters,
    onFiltersChange
}) => {
    const handleStatusChange = (status: string) => {
        onFiltersChange({ status: status as any });
    };

    const handleEstablishmentTypeChange = (establishmentType: string) => {
        onFiltersChange({ establishmentType: establishmentType as EstablishmentType | 'all' });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({ search: e.target.value });
    };

    const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFiltersChange({ cuisine: e.target.value });
    };

    const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rating = e.target.value ? parseFloat(e.target.value) : null;
        onFiltersChange({ rating });
    };

    const clearFilters = () => {
        onFiltersChange({
            status: 'all',
            establishmentType: 'all',
            search: '',
            cuisine: '',
            rating: null
        });
    };

    const hasActiveFilters = filters.status !== 'all' ||
                            filters.establishmentType !== 'all' ||
                            filters.search ||
                            filters.cuisine ||
                            filters.rating;

    const getEstablishmentTypeDisplay = (type: string) => {
        if (type === 'all') return 'All Types';
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <Card>
            <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by business name, owner name, or email..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            icon={<Search className="h-4 w-4" />}
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value={ESTABLISHMENT_STATUS.PENDING}>Pending</option>
                            <option value={ESTABLISHMENT_STATUS.APPROVED}>Approved</option>
                            <option value={ESTABLISHMENT_STATUS.REJECTED}>Rejected</option>
                            <option value={ESTABLISHMENT_STATUS.SUSPENDED}>Suspended</option>
                        </select>
                    </div>

                    {/* Establishment Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Establishment Type
                        </label>
                        <select
                            value={filters.establishmentType}
                            onChange={(e) => handleEstablishmentTypeChange(e.target.value)}
                            className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">All Types</option>
                            {Object.values(ESTABLISHMENT_TYPES).map(type => (
                                <option key={type} value={type}>
                                    {getEstablishmentTypeDisplay(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cuisine Filter */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Cuisine Type
                        </label>
                        <select
                            value={filters.cuisine}
                            onChange={handleCuisineChange}
                            className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All Cuisines</option>
                            {CUISINE_TYPES.map((cuisine) => (
                                <option key={cuisine} value={cuisine}>{cuisine}</option>
                            ))}
                        </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Minimum Rating
                        </label>
                        <select
                            value={filters.rating || ''}
                            onChange={handleRatingChange}
                            className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Any Rating</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                            <option value="2">2+ Stars</option>
                            <option value="1">1+ Stars</option>
                        </select>
                    </div>
                </div>
            </div>
        </Card>
    );
};