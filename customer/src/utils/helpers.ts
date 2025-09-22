export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const validatePhone = (phone: string): boolean => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's a valid Indian mobile number
    // Should be 10 digits starting with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
};

export const formatPhone = (phone: string): string => {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
};

export const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDistance = (distance: number): string => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
};

export const formatTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

export const calculateDeliveryTime = (restaurantTime: string, distance: number): string => {
    const baseTime = parseInt(restaurantTime.split('-')[0]);
    const additionalTime = Math.ceil(distance * 2); // 2 minutes per km
    return `${baseTime + additionalTime}-${baseTime + additionalTime + 10} mins`;
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPincode = (pincode: string): boolean => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
};

export const formatOrderNumber = (id: string): string => {
    return `#${id.toUpperCase().slice(-6)}`;
};

export const getDeliveryTimeRange = (minutes: number): string => {
    const start = minutes;
    const end = minutes + 10;
    return `${start}-${end} mins`;
};

export const isRestaurantOpen = (openTime: string, closeTime: string): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    if (closeMinutes > openMinutes) {
        // Same day
        return currentTime >= openMinutes && currentTime <= closeMinutes;
    } else {
        // Crosses midnight
        return currentTime >= openMinutes || currentTime <= closeMinutes;
    }
};
