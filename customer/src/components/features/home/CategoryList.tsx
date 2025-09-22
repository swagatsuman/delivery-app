import React from 'react';
import { Loading } from '../../ui/Loading';
import type { Category } from '../../../types';

interface CategoryListProps {
    categories: Category[];
    selectedCategory: string;
    onCategorySelect: (categoryId: string) => void;
    loading: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
                                                              categories,
                                                              selectedCategory,
                                                              onCategorySelect,
                                                              loading
                                                          }) => {
    if (loading) {
        return (
            <div className="px-4">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="w-16 h-16 bg-secondary-200 rounded-full mb-2"></div>
                            <div className="w-12 h-3 bg-secondary-200 rounded mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const allCategories = [
        { id: 'all', name: 'All', image: '🍽️', restaurantCount: 0 },
        ...categories
    ];

    return (
        <div className="px-4">
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {allCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.id)}
                        className={`flex-shrink-0 text-center p-2 rounded-xl transition-all ${
                            selectedCategory === category.id
                                ? 'bg-primary-50 border-2 border-primary-200'
                                : 'hover:bg-secondary-50'
                        }`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                            selectedCategory === category.id
                                ? 'bg-primary-100'
                                : 'bg-secondary-100'
                        }`}>
                            {category.image.startsWith('http') ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-10 h-10 object-cover rounded-full"
                                />
                            ) : (
                                <span className="text-2xl">{category.image}</span>
                            )}
                        </div>
                        <p className={`text-xs font-medium ${
                            selectedCategory === category.id
                                ? 'text-primary-700'
                                : 'text-secondary-700'
                        }`}>
                            {category.name}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};
