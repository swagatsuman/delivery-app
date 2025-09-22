import React from 'react';
import { Search, Filter, Leaf } from 'lucide-react';
import type { MenuFilters, MenuCategory } from '../../../types';

interface MenuFiltersProps {
    filters: MenuFilters;
    onFilterChange: (filters: Partial<MenuFilters>) => void;
    categories: MenuCategory[];
    onToggleFilters: () => void;
}

export const MenuFilters: React.FC<MenuFiltersProps> = ({
                                                            filters,
                                                            onFilterChange,
                                                            categories,
                                                            onToggleFilters
                                                        }) => {
    const foodTypes = [
        { value: 'all', label: 'All', icon: null },
        { value: 'veg', label: 'Veg', icon: '🟢' },
        { value: 'non-veg', label: 'Non-Veg', icon: '🔴' },
        { value: 'egg', label: 'Egg', icon: '🟡' }
    ];

    return (
        <div className="p-4 space-y-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                    type="text"
                    placeholder="Search for dishes..."
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {/* Food Type Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
                {foodTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => onFilterChange({ type: type.value as any })}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                            filters.type === type.value
                                ? 'bg-primary-500 text-white'
                                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                        }`}
                    >
                        {type.icon && <span>{type.icon}</span>}
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Category Filters */}
            {categories.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => onFilterChange({ category: '' })}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                            !filters.category
                                ? 'bg-primary-500 text-white'
                                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onFilterChange({ category: category.id })}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                                filters.category === category.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
