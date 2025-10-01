import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { CategoryList } from '../../components/features/menu/CategoryList';
import { MenuItemList } from '../../components/features/menu/MenuItemList';
import { MenuFiltersComponent } from '../../components/features/menu/MenuFilters';
import { CategoryForm } from '../../components/features/menu/CategoryForm';
import { MenuItemForm } from '../../components/features/menu/MenuItemForm';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setFilters,
    setSelectedCategory
} from '../../store/slices/menuSlice';
import type { Category, MenuItem } from '../../types';
import toast from 'react-hot-toast';

const Menu: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const {
        categories,
        menuItems,
        loading,
        filters
    } = useAppSelector(state => state.menu);

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showMenuItemForm, setShowMenuItemForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchCategories(user.uid))
                .unwrap()
                .catch((error) => {
                    console.error('Failed to fetch categories:', error);
                    // Only show toast for real errors, not missing collections/indexes
                    if (!error.message?.includes('index') && !error.message?.includes('collection')) {
                        toast.error('Failed to load categories');
                    }
                });
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (user?.uid && selectedCategoryId) {
            dispatch(fetchMenuItems({ establishmentId: user.uid, categoryId: selectedCategoryId }))
                .unwrap()
                .catch((error) => {
                    console.error('Failed to fetch menu items:', error);
                    // Only show toast for real errors, not missing collections/indexes
                    if (!error.message?.includes('index') && !error.message?.includes('collection')) {
                        toast.error('Failed to load menu items');
                    }
                });
        }
    }, [dispatch, user, selectedCategoryId]);

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            dispatch(setSelectedCategory(category));
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setShowCategoryForm(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowCategoryForm(true);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category? This will also delete all menu items in this category.')) {
            try {
                await dispatch(deleteCategory(categoryId)).unwrap();
                toast.success('Category deleted successfully');
                if (selectedCategoryId === categoryId) {
                    setSelectedCategoryId(null);
                    dispatch(setSelectedCategory(null));
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete category');
            }
        }
    };

    const handleCategoryFormSubmit = async (data: any) => {
        try {
            if (editingCategory) {
                await dispatch(updateCategory({ id: editingCategory.id, data })).unwrap();
                toast.success('Category updated successfully');
            } else {
                await dispatch(createCategory({
                    ...data,
                    establishmentId: user!.uid,
                    image: '',
                    sortOrder: categories.length
                })).unwrap();
                toast.success('Category created successfully');
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save category');
        }
    };

    const handleAddMenuItem = () => {
        if (!selectedCategoryId) {
            toast.error('Please select a category first');
            return;
        }
        setEditingMenuItem(null);
        setShowMenuItemForm(true);
    };

    const handleEditMenuItem = (item: MenuItem) => {
        setEditingMenuItem(item);
        setShowMenuItemForm(true);
    };

    const handleDeleteMenuItem = async (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                await dispatch(deleteMenuItem(itemId)).unwrap();
                toast.success('Menu item deleted successfully');
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete menu item');
            }
        }
    };

    const handleToggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
        try {
            await dispatch(updateMenuItem({ id: itemId, data: { isAvailable } })).unwrap();
            toast.success(`Item ${isAvailable ? 'marked as available' : 'marked as unavailable'}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update item availability');
        }
    };

    const handleMenuItemFormSubmit = async (data: any) => {
        try {
            if (editingMenuItem) {
                await dispatch(updateMenuItem({ id: editingMenuItem.id, data })).unwrap();
                toast.success('Menu item updated successfully');
            } else {
                await dispatch(createMenuItem({
                    ...data,
                    establishmentId: user!.uid,
                    rating: 0,
                    totalRatings: 0
                })).unwrap();
                toast.success('Menu item created successfully');
            }
            setShowMenuItemForm(false);
            setEditingMenuItem(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save menu item');
        }
    };

    const handleFiltersChange = (newFilters: any) => {
        dispatch(setFilters(newFilters));
    };

    const handleResetFilters = () => {
        dispatch(setFilters({
            search: '',
            category: '',
            type: 'all',
            availability: 'all'
        }));
    };

    // Filter menu items based on current filters
    const filteredMenuItems = menuItems.filter(item => {
        if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.type !== 'all' && item.type !== filters.type) {
            return false;
        }
        if (filters.availability !== 'all') {
            if (filters.availability === 'available' && !item.isAvailable) return false;
            if (filters.availability === 'unavailable' && item.isAvailable) return false;
        }
        return true;
    });

    return (
        <Layout title="Menu Management">
            <div className="flex h-full">
                {/* Sidebar - Categories */}
                <div className="w-80 border-r border-secondary-200 p-6 overflow-y-auto">
                    <CategoryList
                        categories={categories}
                        selectedCategory={selectedCategoryId}
                        onCategorySelect={handleCategorySelect}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onAddCategory={handleAddCategory}
                        loading={loading}
                    />
                </div>

                {/* Main Content - Menu Items */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Filters */}
                        <MenuFiltersComponent
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onReset={handleResetFilters}
                            categories={categories.map(c => ({ id: c.id, name: c.name }))}
                        />

                        {/* Menu Items */}
                        <MenuItemList
                            menuItems={filteredMenuItems}
                            onEditItem={handleEditMenuItem}
                            onDeleteItem={handleDeleteMenuItem}
                            onToggleAvailability={handleToggleItemAvailability}
                            onAddItem={handleAddMenuItem}
                            loading={loading}
                            selectedCategory={selectedCategoryId}
                        />
                    </div>
                </div>
            </div>

            {/* Category Form Modal */}
            <CategoryForm
                isOpen={showCategoryForm}
                onClose={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                }}
                onSubmit={handleCategoryFormSubmit}
                category={editingCategory}
                loading={loading}
            />

            {/* Menu Item Form Modal */}
            <MenuItemForm
                isOpen={showMenuItemForm}
                onClose={() => {
                    setShowMenuItemForm(false);
                    setEditingMenuItem(null);
                }}
                onSubmit={handleMenuItemFormSubmit}
                menuItem={editingMenuItem}
                categoryId={selectedCategoryId || ''}
                loading={loading}
            />
        </Layout>
    );
};

export default Menu;
