import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Toggle } from '../../ui/Toggle';
import type { Category } from '../../../types';

interface CategoryFormData {
    name: string;
    description: string;
    isActive: boolean;
}

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    category?: Category | null;
    loading: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSubmit,
                                                              category,
                                                              loading
                                                          }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: category?.name || '',
            description: category?.description || '',
            isActive: category?.isActive ?? true
        }
    });

    React.useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                description: category.description,
                isActive: category.isActive
            });
        } else {
            reset({
                name: '',
                description: '',
                isActive: true
            });
        }
    }, [category, reset]);

    const isActive = watch('isActive');

    const handleFormSubmit = (data: CategoryFormData) => {
        onSubmit(data);
        reset();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={category ? 'Edit Category' : 'Add Category'}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <Input
                    label="Category Name"
                    {...register('name', {
                        required: 'Category name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    error={errors.name?.message}
                    placeholder="e.g., Starters, Main Course, Desserts"
                />

                <Textarea
                    label="Description"
                    rows={3}
                    {...register('description')}
                    placeholder="Brief description of this category..."
                />

                <Toggle
                    checked={isActive}
                    onChange={(checked) => setValue('isActive', checked)}
                    label="Active Category"
                    description="Inactive categories won't be visible to customers"
                />

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                    >
                        {category ? 'Update' : 'Create'} Category
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
