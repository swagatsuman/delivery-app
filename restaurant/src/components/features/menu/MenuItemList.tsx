import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/Badge';
import type { MenuItem } from '../../../types';
import { formatCurrency, getFoodTypeColor, getSpiceLevelColor } from '../../../utils/helpers';
import { Edit, Trash2, Plus, Clock, Star } from 'lucide-react';

interface MenuItemListProps {
    menuItems: MenuItem[];
    onEditItem: (item: MenuItem) => void;
    onDeleteItem: (itemId: string) => void;
    onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
    onAddItem: () => void;
    loading: boolean;
    selectedCategory?: string;
}

export const MenuItemList: React.FC<MenuItemListProps> = ({
                                                              menuItems,
                                                              onEditItem,
                                                              onDeleteItem,
                                                              onToggleAvailability,
                                                              onAddItem,
                                                              loading,
                                                              selectedCategory
                                                          }) => {
    if (loading) {
        return (
            <Card title="Menu Items" padding="md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse border border-secondary-200 rounded-lg p-4">
                            <div className="h-32 bg-secondary-200 rounded-lg mb-3"></div>
                            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card
            title="Menu Items"
            actions={
                selectedCategory && (
                    <Button onClick={onAddItem} icon={<Plus className="h-4 w-4" />}>
                        Add Item
                    </Button>
                )
            }
            padding="md"
        >
            {!selectedCategory ? (
                <div className="text-center py-12">
                    <div className="h-16 w-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">Select a Category</h3>
                    <p className="text-secondary-600">Choose a category from the sidebar to view and manage menu items</p>
                </div>
            ) : menuItems.length === 0 ? (
                <div className="text-center py-12">
                    <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No Items Yet</h3>
                    <p className="text-secondary-600 mb-4">Start building your menu by adding your first item</p>
                    <Button onClick={onAddItem} icon={<Plus className="h-4 w-4" />}>
                        Add First Item
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => (
                        <div key={item.id} className="border border-secondary-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            {/* Item Image */}
                            <div className="relative h-40 bg-secondary-100">
                                {item.images.length > 0 ? (
                                    <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-secondary-400 text-sm">No Image</span>
                                    </div>
                                )}

                                {/* Recommended Badge */}
                                {item.isRecommended && (
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="warning" size="sm">
                                            <Star className="h-3 w-3 mr-1" />
                                            Recommended
                                        </Badge>
                                    </div>
                                )}

                                {/* Availability Toggle */}
                                <div className="absolute top-2 right-2">
                                    <button
                                        onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                            item.isAvailable
                                                ? 'bg-success-100 text-success-700 hover:bg-success-200'
                                                : 'bg-error-100 text-error-700 hover:bg-error-200'
                                        }`}
                                    >
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-secondary-900 text-lg leading-tight">
                                        {item.name}
                                    </h3>
                                    <div className="flex space-x-1 ml-2">
                                        <Icon
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEditItem(item)}
                                            icon={<Edit className="h-3 w-3" />}
                                        />
                                        <Icon
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onDeleteItem(item.id)}
                                            icon={<Trash2 className="h-3 w-3" />}
                                        />
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(item.price)}
                  </span>
                                    {item.discountPrice && (
                                        <span className="text-sm text-secondary-500 line-through">
                      {formatCurrency(item.discountPrice)}
                    </span>
                                    )}
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge variant="default" size="sm">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        item.type === 'veg' ? 'bg-green-500' :
                            item.type === 'non-veg' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></span>
                                        {item.type}
                                    </Badge>

                                    <Badge variant="default" size="sm">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {item.preparationTime}m
                                    </Badge>
                                </div>

                                {/* Rating & Stats */}
                                <div className="flex items-center justify-between text-xs text-secondary-500">
                                    <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400" />
                        {item.rating.toFixed(1)} ({item.totalRatings})
                    </span>
                                    </div>
                                    <span>{item.nutritionInfo.calories} cal</span>
                                </div>

                                {/* Tags */}
                                {item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {item.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <span className="text-xs text-secondary-500">+{item.tags.length - 3} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};
