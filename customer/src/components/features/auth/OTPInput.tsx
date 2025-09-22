import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    loading?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
                                                      length = 6,
                                                      onComplete,
                                                      loading = false
                                                  }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== '' && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        const otpValue = otp.join('');
        if (otpValue.length === length) {
            onComplete(otpValue);
        }
    }, [otp, length, onComplete]);

    return (
        <div className="flex justify-center space-x-3">
            {otp.map((data, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={loading}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-secondary-300 rounded-lg focus:border-primary-500 focus:outline-none disabled:opacity-50"
                />
            ))}
        </div>
    );
};
