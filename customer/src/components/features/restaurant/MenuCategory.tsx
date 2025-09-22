import React from 'react';
import { MenuItem } from './MenuItem';
import type { MenuCategory as MenuCategoryType } from '../../../types';

interface MenuCategoryProps {
    category: MenuCategoryType;
    restaurantId: string;
}

export const MenuCategory: React.FC<MenuCategoryProps> = ({ category, restaurantId }) => {
    if (category.items.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface mb-2">
            {/* Category Header */}
            <div className="px-4 py-3 border-b border-secondary-200">
                <h2 className="text-lg font-semibold text-secondary-900">
                    {category.name} ({category.items.length})
                </h2>
            </div>

            {/* Menu Items */}
            <div>
                {category.items.map((item) => (
                    <MenuItem
                        key={item.id}
                        item={item}
                        restaurantId={restaurantId}
                    />
                ))}
            </div>
        </div>
    );
};
