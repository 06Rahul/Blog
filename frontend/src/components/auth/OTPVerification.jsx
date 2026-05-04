import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

export const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);

    useEffect(() => {
        if (!email) {
            toast.error('No email provided. Please register first.');
            navigate('/signup');
        }
    }, [email, navigate]);

    // Cooldown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        document.getElementById(`otp-${lastIndex}`)?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOtp({ email, otp: otpCode });
            toast.success('Email verified successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        try {
            const response = await authService.resendOtp({ email });
            toast.success(response.message || 'New OTP sent to your email');
            setResendCooldown(30); // 30 second cooldown
            setAttemptsRemaining(prev => prev - 1);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to resend OTP';
            toast.error(errorMsg);

            // If rate limit exceeded, redirect to signup
            if (errorMsg.includes('Too many')) {
                setTimeout(() => navigate('/signup'), 2000);
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-400">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-white font-semibold mt-1">{email}</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div>
                            <label className="block text-white font-semibold mb-4 text-center">
                                Enter OTP Code
                            </label>
                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-900 border-2 border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Email'
                            )}
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div className="mt-6 text-center space-y-3">
                        <p className="text-gray-400 text-sm">
                            Didn't receive the code?
                        </p>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading || resendCooldown > 0}
                            className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {resendLoading ? (
                                'Sending...'
                            ) : resendCooldown > 0 ? (
                                `Resend in ${resendCooldown}s`
                            ) : (
                                'Resend OTP'
                            )}
                        </button>

                        {/* Attempts Remaining */}
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-gray-500">Attempts remaining:</span>
                            <span className={`font-semibold ${attemptsRemaining <= 2 ? 'text-red-400' : 'text-green-400'
                                }`}>
                                {attemptsRemaining}/5
                            </span>
                        </div>

                        {/* Warning for low attempts */}
                        {attemptsRemaining <= 2 && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ You have {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} left. After that, you'll need to register again.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg">
                        <p className="text-gray-400 text-sm text-center">
                            💡 <strong className="text-white">Tip:</strong> Check your spam folder if you don't see the email
                        </p>
                    </div>
                </div>

                {/* Back to Signup */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Signup
                    </button>
                </div>
            </div>
        </div>
    );
};
