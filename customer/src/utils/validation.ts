export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    message?: string;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
    if (rules.required && (!value || value.toString().trim() === '')) {
        return rules.message || 'This field is required';
    }

    if (!value) return null; // Skip other validations if value is empty and not required

    const stringValue = value.toString();

    if (rules.minLength && stringValue.length < rules.minLength) {
        return rules.message || `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
        return rules.message || `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.pattern && !rules.pattern.test(stringValue)) {
        return rules.message || 'Invalid format';
    }

    if (rules.custom && !rules.custom(value)) {
        return rules.message || 'Invalid value';
    }

    return null;
};

export const validateForm = (data: any, rules: ValidationRules): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    Object.keys(rules).forEach(field => {
        const error = validateField(data[field], rules[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};

// Common validation rules
export const VALIDATION_RULES = {
    name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Name must be between 2-50 characters'
    },
    phone: {
        required: true,
        pattern: /^[6-9]\d{9}$/,
        message: 'Please enter a valid 10-digit phone number'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    pincode: {
        required: true,
        pattern: /^[1-9][0-9]{5}$/,
        message: 'Please enter a valid 6-digit pincode'
    },
    address: {
        required: true,
        minLength: 10,
        maxLength: 200,
        message: 'Address must be between 10-200 characters'
    },
    otp: {
        required: true,
        pattern: /^\d{6}$/,
        message: 'Please enter a valid 6-digit OTP'
    }
};
