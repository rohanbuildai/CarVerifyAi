'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Car, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { login, user, isLoading, error, clearError, initialize, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated && user) {
      window.location.href = redirect;
    }
  }, [isAuthenticated, user, redirect]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Force hard navigation to clear Next.js client-side router cache of the unauthenticated redirect
      window.location.href = redirect;
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {/* Background */}
      <div className="absolute inset-0 pattern-dots" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              CarVerify<span className="text-gradient"> AI</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Welcome back</h1>
          <p className="text-sm text-surface-400">Sign in to your account to continue</p>
        </div>

        {/* Form Card */}
        <div className="card-glass">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 mb-5">
              <AlertCircle className="w-4 h-4 text-danger-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-danger-400">{error}</p>
              </div>
              <button onClick={clearError} className="ml-auto text-danger-400 hover:text-danger-300 text-xs">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-surface-300 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-surface-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-surface-500 bg-surface-900/80">or</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-surface-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        {/* Legal */}
        <p className="text-center text-xs text-surface-600 mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-surface-500 hover:text-surface-300 underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-surface-500 hover:text-surface-300 underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
