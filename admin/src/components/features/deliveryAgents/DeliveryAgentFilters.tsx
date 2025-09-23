import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import type { DeliveryAgentFilters } from '../../../types';

interface DeliveryAgentFiltersProps {
    filters: DeliveryAgentFilters;
    onFiltersChange: (filters: Partial<DeliveryAgentFilters>) => void;
    onReset: () => void;
}

export const DeliveryAgentFilters: React.FC<DeliveryAgentFiltersProps> = ({
                                                                                       filters,
                                                                                       onFiltersChange,
                                                                                       onReset
                                                                                   }) => {
    return (
        <div className="bg-surface border border-secondary-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-secondary-900 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={onReset}>
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    placeholder="Search agents..."
                    icon={<Search className="h-4 w-4" />}
                    value={filters.search}
                    onChange={(e) => onFiltersChange({ search: e.target.value })}
                />

                <select
                    className="input-field"
                    value={filters.status}
                    onChange={(e) => onFiltersChange({ status: e.target.value as any })}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>

                <select
                    className="input-field"
                    value={filters.vehicleType}
                    onChange={(e) => onFiltersChange({ vehicleType: e.target.value as any })}
                >
                    <option value="all">All Vehicle Types</option>
                    <option value="bike">Bike</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                </select>
            </div>
        </div>
    );
};
