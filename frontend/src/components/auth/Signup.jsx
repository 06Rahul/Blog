import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const inputClass = 'mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200';

export const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [usernameMeta, setUsernameMeta] = useState({
    checking: false,
    available: null,
    message: '',
    suggestions: [],
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm();

  const password = watch('password');
  const username = watch('username');
  const trimmedUsername = useMemo(() => String(username || '').trim(), [username]);

  useEffect(() => {
    if (!trimmedUsername) {
      setUsernameMeta({ checking: false, available: null, message: '', suggestions: [] });
      clearErrors('username');
      return undefined;
    }

    if (trimmedUsername.length < 3) {
      setUsernameMeta({
        checking: false,
        available: false,
        message: 'Username must be at least 3 characters.',
        suggestions: [],
      });
      return undefined;
    }

    const timeout = setTimeout(async () => {
      setUsernameMeta((current) => ({ ...current, checking: true }));
      try {
        const response = await authService.checkUsernameAvailability(trimmedUsername);
        setUsernameMeta({
          checking: false,
          available: response.available,
          message: response.message,
          suggestions: response.suggestions || [],
        });

        if (response.available) {
          clearErrors('username');
        } else {
          setError('username', { type: 'manual', message: response.message });
        }
      } catch (error) {
        setUsernameMeta({
          checking: false,
          available: null,
          message: '',
          suggestions: [],
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [trimmedUsername, clearErrors, setError]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    if (usernameMeta.available === false) {
      setError('username', {
        type: 'manual',
        message: usernameMeta.message || 'Username already taken. Try another one.',
      });
      return;
    }

    setLoading(true);
    try {
      const imageFile = data.image?.[0] || null;
      const userData = {
        email: data.email,
        password: data.password,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        website: data.website,
        mobileNumber: data.mobileNumber,
      };

      const response = await signup(userData, imageFile);
      toast.success(response.message || 'OTP generated. Verify your email to continue.');
      navigate('/verify-otp', {
        state: {
          email: data.email,
          mode: 'signup',
        },
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      if (message.toLowerCase().includes('username already taken')) {
        setError('username', {
          type: 'manual',
          message: 'Username already taken. Try another username.',
        });

        try {
          const availability = await authService.checkUsernameAvailability(data.username);
          setUsernameMeta({
            checking: false,
            available: availability.available,
            message: availability.message,
            suggestions: availability.suggestions || [],
          });
        } catch (availabilityError) {
          console.error('Username recheck failed', availabilityError);
        }
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-sky-100 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700/70">Create Account</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Register and verify with OTP</h2>
          <p className="mt-2 text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-sky-700 hover:text-sky-600">
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First name *</label>
              <input {...register('firstName', { required: 'First name is required' })} type="text" className={inputClass} />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last name</label>
              <input {...register('lastName')} type="text" className={inputClass} />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username *</label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' },
                })}
                type="text"
                autoComplete="username"
                className={inputClass}
              />
              <div className="mt-1 min-h-[20px] text-sm">
                {usernameMeta.checking && <p className="text-slate-500">Checking username...</p>}
                {!usernameMeta.checking && errors.username && <p className="text-red-600">{errors.username.message}</p>}
                {!usernameMeta.checking && !errors.username && usernameMeta.available && trimmedUsername.length >= 3 && (
                  <p className="text-emerald-600">{usernameMeta.message}</p>
                )}
              </div>
              {usernameMeta.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {usernameMeta.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setValue('username', suggestion, { shouldValidate: true, shouldDirty: true });
                        clearErrors('username');
                        setUsernameMeta({
                          checking: false,
                          available: true,
                          message: 'Username is available.',
                          suggestions: [],
                        });
                      }}
                      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email *</label>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password *</label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                type="password"
                className={inputClass}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm password *</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                type="password"
                className={inputClass}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-slate-700">Mobile number</label>
              <input
                {...register('mobileNumber', {
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Invalid Indian mobile number',
                  },
                })}
                type="tel"
                className={inputClass}
                placeholder="10 digit mobile number"
              />
              {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700">Website</label>
              <input {...register('website')} type="url" className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
              <textarea {...register('bio')} rows="3" className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-slate-700">Profile image</label>
              <input
                {...register('image')}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-full object-cover ring-4 ring-sky-100" />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || usernameMeta.checking}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Generating OTP...' : 'Continue to verification'}
          </button>
        </form>
      </div>
    </div>
  );
};
