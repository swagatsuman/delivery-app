import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { Category } from '../../../types';
import { Edit, Trash2, Plus } from 'lucide-react';

interface CategoryListProps {
    categories: Category[];
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string) => void;
    onEditCategory: (category: Category) => void;
    onDeleteCategory: (categoryId: string) => void;
    onAddCategory: () => void;
    loading: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
                                                              categories,
                                                              selectedCategory,
                                                              onCategorySelect,
                                                              onEditCategory,
                                                              onDeleteCategory,
                                                              onAddCategory,
                                                              loading
                                                          }) => {
    if (loading) {
        return (
            <Card title="Categories" padding="md">
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="animate-pulse p-3 bg-secondary-100 rounded-lg">
                            <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card
            title="Categories"
            actions={
                <Button size="sm" onClick={onAddCategory} icon={<Plus className="h-4 w-4" />}>
                    Add
                </Button>
            }
            padding="md"
        >
            <div className="space-y-2">
                {categories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-secondary-500 mb-4">No categories yet</p>
                        <Button onClick={onAddCategory} icon={<Plus className="h-4 w-4" />}>
                            Create First Category
                        </Button>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                selectedCategory === category.id
                                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                                    : 'bg-secondary-50 border-secondary-100 hover:bg-secondary-100'
                            }`}
                            onClick={() => onCategorySelect(category.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-medium text-secondary-900">{category.name}</h3>
                                        <Badge variant={category.isActive ? 'success' : 'error'}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {category.description && (
                                        <p className="text-sm text-secondary-600 mt-1">{category.description}</p>
                                    )}
                                </div>
                                <div className="flex space-x-1 ml-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditCategory(category);
                                        }}
                                        icon={<Edit className="h-3 w-3" />}
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteCategory(category.id);
                                        }}
                                        icon={<Trash2 className="h-3 w-3" />}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
