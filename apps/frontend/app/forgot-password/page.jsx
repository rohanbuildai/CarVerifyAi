'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setOtpSent(true);
    } catch {
      // Error handled by store
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <div className="absolute inset-0 pattern-dots" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            CarVerify<span className="text-gradient"> AI</span>
          </span>
        </Link>

        <div className="card">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-2xl text-white mb-2">
              {success ? 'Password Reset!' : otpSent ? 'Enter OTP' : 'Forgot Password'}
            </h1>
            <p className="text-surface-400 text-sm">
              {success
                ? 'Your password has been reset successfully.'
                : otpSent
                ? 'Enter the OTP sent to your email'
                : 'Enter your email to reset your password'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger-400" />
              <p className="text-sm text-danger-400">{error}</p>
            </div>
          )}

          {!otpSent && !success && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {otpSent && !success && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-surface-300 mb-1.5">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-surface-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {success && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-success-400" />
              </div>
              <p className="text-surface-300">Redirecting to login...</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-surface-400 hover:text-white flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}