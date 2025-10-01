import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuState, Category, MenuItem, MenuFilters } from '../../types';
import { menuService } from '../../services/menuService';

const initialState: MenuState = {
    categories: [],
    menuItems: [],
    selectedCategory: null,
    selectedMenuItem: null,
    loading: false,
    error: null,
    filters: {
        search: '',
        category: '',
        type: 'all',
        availability: 'all'
    }
};

export const fetchCategories = createAsyncThunk(
    'menu/fetchCategories',
    async (establishmentId: string) => {
        const response = await menuService.getCategories(establishmentId);
        return response;
    }
);

export const createCategory = createAsyncThunk(
    'menu/createCategory',
    async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await menuService.createCategory(categoryData);
        return response;
    }
);

export const updateCategory = createAsyncThunk(
    'menu/updateCategory',
    async ({ id, data }: { id: string; data: Partial<Category> }) => {
        await menuService.updateCategory(id, data);
        return { id, data };
    }
);

export const deleteCategory = createAsyncThunk(
    'menu/deleteCategory',
    async (id: string) => {
        await menuService.deleteCategory(id);
        return id;
    }
);

export const fetchMenuItems = createAsyncThunk(
    'menu/fetchMenuItems',
    async ({ establishmentId, categoryId }: { establishmentId: string; categoryId?: string }) => {
        const response = await menuService.getMenuItems(establishmentId, categoryId);
        return response;
    }
);

export const createMenuItem = createAsyncThunk(
    'menu/createMenuItem',
    async (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        const response = await menuService.createMenuItem(itemData);
        return response;
    }
);

export const updateMenuItem = createAsyncThunk(
    'menu/updateMenuItem',
    async ({ id, data }: { id: string; data: Partial<MenuItem> }) => {
        await menuService.updateMenuItem(id, data);
        return { id, data };
    }
);

export const deleteMenuItem = createAsyncThunk(
    'menu/deleteMenuItem',
    async (id: string) => {
        await menuService.deleteMenuItem(id);
        return id;
    }
);

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<MenuFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
            state.selectedCategory = action.payload;
        },
        setSelectedMenuItem: (state, action: PayloadAction<MenuItem | null>) => {
            state.selectedMenuItem = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch categories';
            })
            // Create Category
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            // Update Category
            .addCase(updateCategory.fulfilled, (state, action) => {
                const { id, data } = action.payload;
                const categoryIndex = state.categories.findIndex(c => c.id === id);
                if (categoryIndex !== -1) {
                    state.categories[categoryIndex] = { ...state.categories[categoryIndex], ...data };
                }
            })
            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.id !== action.payload);
            })
            // Fetch Menu Items
            .addCase(fetchMenuItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMenuItems.fulfilled, (state, action) => {
                state.loading = false;
                state.menuItems = action.payload;
            })
            .addCase(fetchMenuItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch menu items';
            })
            // Create Menu Item
            .addCase(createMenuItem.fulfilled, (state, action) => {
                state.menuItems.push(action.payload);
            })
            // Update Menu Item
            .addCase(updateMenuItem.fulfilled, (state, action) => {
                const { id, data } = action.payload;
                const itemIndex = state.menuItems.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    state.menuItems[itemIndex] = { ...state.menuItems[itemIndex], ...data };
                }
            })
            // Delete Menu Item
            .addCase(deleteMenuItem.fulfilled, (state, action) => {
                state.menuItems = state.menuItems.filter(item => item.id !== action.payload);
            });
    }
});

export const { setFilters, setSelectedCategory, setSelectedMenuItem, clearError } = menuSlice.actions;
export default menuSlice.reducer;
