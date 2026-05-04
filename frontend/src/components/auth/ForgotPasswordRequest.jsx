import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const inputClass = 'block w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200';

export const ForgotPasswordRequest = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.requestPasswordResetOtp({ email: data.email });
      toast.success(response.message || 'OTP generated.');
      navigate('/forgot-password/verify', {
        state: { email: data.email },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-sky-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700/70">Password Reset</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Find your account</h2>
          <p className="mt-2 text-sm text-slate-600">Enter your email and we will generate a reset OTP.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className={inputClass}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Generating OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
