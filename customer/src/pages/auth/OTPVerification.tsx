import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { verifyOTP, sendOTP } from '../../store/slices/authSlice';

const OTPVerification: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error } = useAppSelector(state => state.auth);

    const { phone, type, userData } = location.state || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!phone) {
            navigate('/login');
            return;
        }

        // Start resend timer
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phone, navigate]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) return;

        try {
            await dispatch(verifyOTP({
                phone,
                otp: otpCode,
                type,
                userData
            })).unwrap();

            if (type === 'signup') {
                navigate('/location-setup');
            } else {
                navigate('/home');
            }
        } catch (error) {
            // Error handled by Redux
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        try {
            await dispatch(sendOTP({ phone, type, userData })).unwrap();
            setResendTimer(30);
            setOtp(['', '', '', '', '', '']);
        } catch (error) {
            // Error handled by Redux
        } finally {
            setResendLoading(false);
        }
    };

    const formatPhone = (phone: string) => {
        return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-secondary-100 rounded-full"
                >
                    <ArrowLeft className="h-6 w-6 text-secondary-700" />
                </button>
                <h1 className="text-lg font-semibold text-secondary-900 ml-4">Verify Phone Number</h1>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-sm mx-auto text-center">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl">📱</span>
                    </div>

                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">Enter Verification Code</h2>
                    <p className="text-secondary-600 mb-8">
                        We've sent a 6-digit code to {formatPhone(phone)}
                    </p>

                    {/* OTP Input */}
                    <div className="flex justify-center space-x-3 mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-lg font-semibold border-2 border-secondary-300 rounded-lg focus:border-primary-500 focus:outline-none"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 bg-error-50 border border-error-200 rounded-lg mb-6">
                            <p className="text-sm text-error-700">{error}</p>
                        </div>
                    )}

                    <Button
                        onClick={handleVerify}
                        className="w-full h-12 text-lg mb-6"
                        loading={loading}
                        disabled={loading || otp.join('').length !== 6}
                    >
                        {loading ? 'Verifying...' : (
                            <>
                                Verify & Continue
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    {/* Resend */}
                    <div className="text-center">
                        <p className="text-secondary-600 mb-2">Didn't receive the code?</p>
                        {resendTimer > 0 ? (
                            <p className="text-secondary-500">
                                Resend in {resendTimer}s
                            </p>
                        ) : (
                            <button
                                onClick={handleResendOTP}
                                disabled={resendLoading}
                                className="text-primary-600 font-semibold hover:text-primary-700"
                            >
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
