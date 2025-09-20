import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { MenuFilters } from '../../../types';
import { FOOD_TYPES } from '../../../utils/constants';

interface MenuFiltersProps {
    filters: MenuFilters;
    onFiltersChange: (filters: Partial<MenuFilters>) => void;
    onReset: () => void;
    categories: { id: string; name: string }[];
}

export const MenuFiltersComponent: React.FC<MenuFiltersProps> = ({
                                                                     filters,
                                                                     onFiltersChange,
                                                                     onReset,
                                                                     categories
                                                                 }) => {
    const activeFiltersCount = Object.values(filters).filter(value =>
        value !== '' && value !== 'all'
    ).length;

    return (
        <div className="bg-surface border border-secondary-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-secondary-900 flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </h3>
                    {activeFiltersCount > 0 && (
                        <Badge variant="primary" size="sm">
                            {activeFiltersCount} active
                        </Badge>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={onReset}>
                    Reset
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    placeholder="Search menu items..."
                    icon={<Search className="h-4 w-4" />}
                    value={filters.search}
                    onChange={(e) => onFiltersChange({ search: e.target.value })}
                />

                <select
                    className="input-field"
                    value={filters.category}
                    onChange={(e) => onFiltersChange({ category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select
                    className="input-field"
                    value={filters.type}
                    onChange={(e) => onFiltersChange({ type: e.target.value as any })}
                >
                    <option value="all">All Types</option>
                    <option value={FOOD_TYPES.VEG}>Vegetarian</option>
                    <option value={FOOD_TYPES.NON_VEG}>Non-Vegetarian</option>
                    <option value={FOOD_TYPES.EGG}>Egg</option>
                </select>

                <select
                    className="input-field"
                    value={filters.availability}
                    onChange={(e) => onFiltersChange({ availability: e.target.value as any })}
                >
                    <option value="all">All Items</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                </select>
            </div>
        </div>
    );
};
