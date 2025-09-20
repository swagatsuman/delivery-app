import { format, formatDistanceToNow, isToday, isYesterday, isValid } from 'date-fns';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

// Helper function to safely convert Firestore timestamp to Date
const toDate = (dateInput: any): Date | null => {
    try {
        if (!dateInput) return null;

        // If it's already a Date object
        if (dateInput instanceof Date) {
            return isValid(dateInput) ? dateInput : null;
        }

        // If it's a Firestore Timestamp object
        if (dateInput && typeof dateInput === 'object' && typeof dateInput.toDate === 'function') {
            return dateInput.toDate();
        }

        // If it's a string, try to parse it
        if (typeof dateInput === 'string') {
            const date = new Date(dateInput);
            return isValid(date) ? date : null;
        }

        // If it's a number (timestamp)
        if (typeof dateInput === 'number') {
            const date = new Date(dateInput);
            return isValid(date) ? date : null;
        }

        // If it's an object with seconds and nanoseconds (Firestore timestamp format)
        if (dateInput && typeof dateInput === 'object' && 'seconds' in dateInput) {
            const date = new Date(dateInput.seconds * 1000 + (dateInput.nanoseconds || 0) / 1000000);
            return isValid(date) ? date : null;
        }

        return null;
    } catch (error) {
        console.warn('Error converting date:', dateInput, error);
        return null;
    }
};

export const formatDate = (date: any): string => {
    try {
        const dateObj = toDate(date);

        if (!dateObj) {
            return 'Invalid date';
        }

    if (isToday(dateObj)) {
        return `Today ${format(dateObj, 'HH:mm')}`;
    } else if (isYesterday(dateObj)) {
        return `Yesterday ${format(dateObj, 'HH:mm')}`;
    } else {
        return format(dateObj, 'MMM dd, yyyy HH:mm');
    }
    } catch (error) {
        console.warn('Error formatting date:', date, error);
        return 'Invalid date';
    }
};

export const formatRelativeTime = (date: any): string => {
    try {
        const dateObj = toDate(date);

        if (!dateObj) {
            return 'Unknown time';
        }

    return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        console.warn('Error formatting relative time:', date, error);
        return 'Unknown time';
    }
};

export const getStatusColor = (status: string): string => {
    const colors = {
        pending: 'bg-warning-100 text-warning-700',
        active: 'bg-success-100 text-success-700',
        inactive: 'bg-secondary-100 text-secondary-700',
        suspended: 'bg-error-100 text-error-700',
        placed: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-green-100 text-green-700',
        preparing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-purple-100 text-purple-700',
        picked_up: 'bg-indigo-100 text-indigo-700',
        on_the_way: 'bg-orange-100 text-orange-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || 'bg-secondary-100 text-secondary-700';
};

export const getRoleColor = (role: string): string => {
    const colors = {
        admin: 'bg-purple-100 text-purple-700',
        restaurant: 'bg-primary-100 text-primary-700',
        customer: 'bg-green-100 text-green-700',
        delivery_agent: 'bg-blue-100 text-blue-700'
    };
    return colors[role as keyof typeof colors] || 'bg-secondary-100 text-secondary-700';
};

export const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

export const generateOrderNumber = (): string => {
    return `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

export const validateGSTIN = (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

// Additional utility to create a proper timestamp for Firestore
export const createTimestamp = (): Date => {
    return new Date();
};
