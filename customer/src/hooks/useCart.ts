import { useAppSelector } from './useAppDispatch';

export const useCart = () => {
    const { items, pricing, restaurantId } = useAppSelector(state => state.cart);

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalAmount = () => {
        return pricing.total;
    };

    const getItemQuantity = (menuItemId: string, customizations: any[] = []) => {
        const item = items.find(item =>
            item.menuItem.id === menuItemId &&
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );
        return item?.quantity || 0;
    };

    const isCartEmpty = () => {
        return items.length === 0;
    };

    const canAddItemFromRestaurant = (newRestaurantId: string) => {
        return !restaurantId || restaurantId === newRestaurantId;
    };

    return {
        items,
        pricing,
        restaurantId,
        getTotalItems,
        getTotalAmount,
        getItemQuantity,
        isCartEmpty,
        canAddItemFromRestaurant
    };
};
