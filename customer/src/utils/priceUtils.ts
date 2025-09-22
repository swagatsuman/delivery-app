// src/utils/priceUtils.ts

/**
 * Safely converts a price value from string or number to number
 * Handles edge cases like empty strings, null, undefined
 */
export const parsePrice = (price: number | string | null | undefined): number => {
    if (price === null || price === undefined) {
        return 0;
    }

    if (typeof price === 'number') {
        return isNaN(price) ? 0 : price;
    }

    if (typeof price === 'string') {
        const trimmed = price.trim();
        if (trimmed === '') {
            return 0;
        }

        const parsed = parseFloat(trimmed);
        return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
};

/**
 * Formats a price for display with currency symbol
 */
export const formatPrice = (price: number | string): string => {
    const numPrice = parsePrice(price);
    return `₹${numPrice}`;
};

/**
 * Calculates the final price considering discounts
 */
export const getFinalPrice = (regularPrice: number | string, discountPrice?: number | string): number => {
    const regular = parsePrice(regularPrice);
    const discount = parsePrice(discountPrice);

    // If discount price is valid and lower than regular price, use it
    if (discount > 0 && discount < regular) {
        return discount;
    }

    return regular;
};

/**
 * Validates if a price is valid (positive number)
 */
export const isValidPrice = (price: number | string): boolean => {
    const parsed = parsePrice(price);
    return parsed > 0;
};
