'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
      });
      // Force hard navigation to clear Next.js client-side router cache of the unauthenticated redirect
      window.location.href = '/dashboard';
    } catch {
      // Error handled by store
    }
  };

  const passwordValid = form.password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-12">
      <div className="absolute inset-0 pattern-dots" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[120px]" />

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
          <h1 className="font-display font-bold text-2xl text-white mb-2">Create your account</h1>
          <p className="text-sm text-surface-400">Start with 3 free vehicle verifications</p>
        </div>

        <div className="card-glass">
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 mb-5">
              <AlertCircle className="w-4 h-4 text-danger-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-danger-400">{error}</p>
              <button onClick={clearError} className="ml-auto text-danger-400 hover:text-danger-300 text-xs">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-surface-300 mb-1.5">Full name</label>
              <input id="reg-name" type="text" required autoComplete="name" placeholder="Rohan Sharma"
                     value={form.name} onChange={updateField('name')} className="input" disabled={isLoading} />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-surface-300 mb-1.5">Email address</label>
              <input id="reg-email" type="email" required autoComplete="email" placeholder="you@example.com"
                     value={form.email} onChange={updateField('email')} className="input" disabled={isLoading} />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-surface-300 mb-1.5">
                Phone <span className="text-surface-600">(optional)</span>
              </label>
              <input id="reg-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                     value={form.phone} onChange={updateField('phone')} className="input" disabled={isLoading} />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                       placeholder="Minimum 8 characters" minLength={8}
                       value={form.password} onChange={updateField('password')} className="input pr-10" disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <p className={`text-xs mt-1.5 ${passwordValid ? 'text-success-400' : 'text-warning-400'}`}>
                  {passwordValid ? '✓ Password strength OK' : 'Must be at least 8 characters'}
                </p>
              )}
            </div>

            <button type="submit" disabled={isLoading || !form.name || !form.email || !passwordValid}
                    className="btn-primary w-full mt-2">
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-800" /></div>
            <div className="relative flex justify-center"><span className="px-3 text-xs text-surface-500 bg-surface-900/80">or</span></div>
          </div>

          <p className="text-center text-sm text-surface-400">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-surface-600 mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-surface-500 hover:text-surface-300 underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-surface-500 hover:text-surface-300 underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
