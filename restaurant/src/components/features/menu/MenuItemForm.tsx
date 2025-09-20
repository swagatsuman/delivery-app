import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Toggle } from '../../ui/Toggle';
import type { MenuItem } from '../../../types';
import { FOOD_TYPES, SPICE_LEVELS } from '../../../utils/constants';
import { Upload, X } from 'lucide-react';

interface MenuItemFormData {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    type: string;
    spiceLevel: string;
    ingredients: string;
    allergens: string;
    preparationTime: number;
    isAvailable: boolean;
    isRecommended: boolean;
    tags: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface MenuItemFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MenuItemFormData & { categoryId: string }) => void;
    menuItem?: MenuItem | null;
    categoryId: string;
    loading: boolean;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSubmit,
                                                              menuItem,
                                                              categoryId,
                                                              loading
                                                          }) => {
    const [images, setImages] = useState<string[]>(menuItem?.images || []);
    const [dragOver, setDragOver] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue
    } = useForm<MenuItemFormData>({
        defaultValues: {
            name: menuItem?.name || '',
            description: menuItem?.description || '',
            price: menuItem?.price || 0,
            discountPrice: menuItem?.discountPrice || undefined,
            type: menuItem?.type || FOOD_TYPES.VEG,
            spiceLevel: menuItem?.spiceLevel || SPICE_LEVELS.MILD,
            ingredients: menuItem?.ingredients?.join(', ') || '',
            allergens: menuItem?.allergens?.join(', ') || '',
            preparationTime: menuItem?.preparationTime || 15,
            isAvailable: menuItem?.isAvailable ?? true,
            isRecommended: menuItem?.isRecommended ?? false,
            tags: menuItem?.tags?.join(', ') || '',
            calories: menuItem?.nutritionInfo?.calories || 0,
            protein: menuItem?.nutritionInfo?.protein || 0,
            carbs: menuItem?.nutritionInfo?.carbs || 0,
            fat: menuItem?.nutritionInfo?.fat || 0
        }
    });

    React.useEffect(() => {
        if (menuItem) {
            reset({
                name: menuItem.name,
                description: menuItem.description,
                price: menuItem.price,
                discountPrice: menuItem.discountPrice,
                type: menuItem.type,
                spiceLevel: menuItem.spiceLevel,
                ingredients: menuItem.ingredients.join(', '),
                allergens: menuItem.allergens.join(', '),
                preparationTime: menuItem.preparationTime,
                isAvailable: menuItem.isAvailable,
                isRecommended: menuItem.isRecommended,
                tags: menuItem.tags.join(', '),
                calories: menuItem.nutritionInfo.calories,
                protein: menuItem.nutritionInfo.protein,
                carbs: menuItem.nutritionInfo.carbs,
                fat: menuItem.nutritionInfo.fat
            });
            setImages(menuItem.images);
        } else {
            reset({
                name: '',
                description: '',
                price: 0,
                discountPrice: undefined,
                type: FOOD_TYPES.VEG,
                spiceLevel: SPICE_LEVELS.MILD,
                ingredients: '',
                allergens: '',
                preparationTime: 15,
                isAvailable: true,
                isRecommended: false,
                tags: '',
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            });
            setImages([]);
        }
    }, [menuItem, reset]);

    const isAvailable = watch('isAvailable');
    const isRecommended = watch('isRecommended');

    const handleFormSubmit = (data: MenuItemFormData) => {
        const formattedData = {
            ...data,
            categoryId,
            ingredients: data.ingredients.split(',').map(item => item.trim()).filter(Boolean),
            allergens: data.allergens.split(',').map(item => item.trim()).filter(Boolean),
            tags: data.tags.split(',').map(item => item.trim()).filter(Boolean),
            nutritionInfo: {
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat
            },
            images
        };
        onSubmit(formattedData);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            // In a real app, upload to Firebase Storage and get URLs
            // For now, we'll use placeholder URLs
            const newImages = Array.from(files).map((file, index) =>
                `https://via.placeholder.com/300x200?text=Image+${images.length + index + 1}`
            );
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        // Handle file drop logic here
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={menuItem ? 'Edit Menu Item' : 'Add Menu Item'}
            size="xl"
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Images Section */}
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Images
                    </label>
                    <div className="space-y-4">
                        {/* Image Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                dragOver
                                    ? 'border-primary-400 bg-primary-50'
                                    : 'border-secondary-300 hover:border-secondary-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-8 w-8 mx-auto text-secondary-400 mb-2" />
                            <p className="text-sm text-secondary-600">
                                Drag & drop images here, or{' '}
                                <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                                    browse
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </p>
                            <p className="text-xs text-secondary-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>

                        {/* Image Preview */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Menu item ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-secondary-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-secondary-900">Basic Information</h3>

                        <Input
                            label="Item Name"
                            {...register('name', {
                                required: 'Item name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                            })}
                            error={errors.name?.message}
                            placeholder="e.g., Chicken Biryani"
                        />

                        <Textarea
                            label="Description"
                            rows={3}
                            {...register('description', {
                                required: 'Description is required'
                            })}
                            error={errors.description?.message}
                            placeholder="Describe the dish, its taste, and ingredients..."
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Price (₹)"
                                type="number"
                                step="0.01"
                                {...register('price', {
                                    required: 'Price is required',
                                    min: { value: 0, message: 'Price must be positive' }
                                })}
                                error={errors.price?.message}
                            />

                            <Input
                                label="Discount Price (₹)"
                                type="number"
                                step="0.01"
                                {...register('discountPrice')}
                                helpText="Optional discounted price"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Food Type
                                </label>
                                <select
                                    className="input-field"
                                    {...register('type', { required: 'Food type is required' })}
                                >
                                    <option value={FOOD_TYPES.VEG}>Vegetarian</option>
                                    <option value={FOOD_TYPES.NON_VEG}>Non-Vegetarian</option>
                                    <option value={FOOD_TYPES.EGG}>Egg</option>
                                </select>
                                {errors.type && (
                                    <p className="text-sm text-error-600">{errors.type.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Spice Level
                                </label>
                                <select
                                    className="input-field"
                                    {...register('spiceLevel', { required: 'Spice level is required' })}
                                >
                                    <option value={SPICE_LEVELS.MILD}>Mild</option>
                                    <option value={SPICE_LEVELS.MEDIUM}>Medium</option>
                                    <option value={SPICE_LEVELS.HOT}>Hot</option>
                                </select>
                                {errors.spiceLevel && (
                                    <p className="text-sm text-error-600">{errors.spiceLevel.message}</p>
                                )}
                            </div>
                        </div>

                        <Input
                            label="Preparation Time (minutes)"
                            type="number"
                            {...register('preparationTime', {
                                required: 'Preparation time is required',
                                min: { value: 1, message: 'Must be at least 1 minute' }
                            })}
                            error={errors.preparationTime?.message}
                        />
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-secondary-900">Additional Details</h3>

                        <Textarea
                            label="Ingredients"
                            rows={2}
                            {...register('ingredients')}
                            placeholder="Comma-separated list of ingredients"
                            helpText="e.g., chicken, rice, onions, spices"
                        />

                        <Textarea
                            label="Allergens"
                            rows={2}
                            {...register('allergens')}
                            placeholder="Comma-separated list of allergens"
                            helpText="e.g., nuts, dairy, gluten"
                        />

                        <Input
                            label="Tags"
                            {...register('tags')}
                            placeholder="Comma-separated tags"
                            helpText="e.g., spicy, popular, chef-special"
                        />

                        {/* Nutrition Information */}
                        <div>
                            <h4 className="text-sm font-medium text-secondary-700 mb-3">Nutrition Info (per serving)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Calories"
                                    type="number"
                                    {...register('calories', { min: 0 })}
                                />
                                <Input
                                    label="Protein (g)"
                                    type="number"
                                    step="0.1"
                                    {...register('protein', { min: 0 })}
                                />
                                <Input
                                    label="Carbs (g)"
                                    type="number"
                                    step="0.1"
                                    {...register('carbs', { min: 0 })}
                                />
                                <Input
                                    label="Fat (g)"
                                    type="number"
                                    step="0.1"
                                    {...register('fat', { min: 0 })}
                                />
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="space-y-4 pt-4 border-t border-secondary-200">
                            <Toggle
                                checked={isAvailable}
                                onChange={(checked) => setValue('isAvailable', checked)}
                                label="Available"
                                description="Item is available for ordering"
                            />

                            <Toggle
                                checked={isRecommended}
                                onChange={(checked) => setValue('isRecommended', checked)}
                                label="Recommended"
                                description="Mark as chef's recommendation"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
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
                        {menuItem ? 'Update' : 'Create'} Item
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
