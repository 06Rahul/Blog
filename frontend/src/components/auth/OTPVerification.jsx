import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const initialOtp = ['', '', '', '', '', ''];

export const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const mode = location.state?.mode || 'signup';

  const [otp, setOtp] = useState(initialOtp);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const joinedOtp = useMemo(() => otp.join(''), [otp]);

  useEffect(() => {
    if (!email || mode !== 'signup') {
      navigate('/signup', { replace: true });
    }
  }, [email, mode, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < 5) {
      document.getElementById(`signup-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`signup-otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) {
      return;
    }

    const next = [...initialOtp];
    pasted.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    setOtp(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (joinedOtp.length !== 6) {
      toast.error('Enter the full 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifySignupOtp({ email, otp: joinedOtp });
      toast.success(response.message || 'Verification complete. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP.');
      setOtp(initialOtp);
      document.getElementById('signup-otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    try {
      const response = await authService.resendSignupOtp({ email });
      toast.success(response.message || 'A new OTP has been generated.');
      setResendCooldown(30);
      setOtp(initialOtp);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-sky-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700/70">Email Verification</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Enter the OTP</h1>
          <p className="mt-2 text-sm text-slate-600">Use the 6-digit code generated for <span className="font-medium text-slate-800">{email}</span>.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`signup-otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="h-14 w-12 rounded-2xl border border-slate-200 bg-white text-center text-xl font-semibold text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || joinedOtp.length !== 6}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            className="font-medium text-sky-700 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendLoading ? 'Generating new OTP...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link to="/signup" className="font-medium text-slate-700 hover:text-slate-900">
            Back to signup
          </Link>
        </div>
      </div>
    </div>
  );
};
