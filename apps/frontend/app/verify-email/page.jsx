'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Car, Loader2, AlertCircle, Check, Mail } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { initialize, isAuthenticated } = useAuthStore();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError('Invalid verification link');
      return;
    }

    // Simulate email verification (in real app would call API)
    const verifyEmail = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setVerified(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err) {
        setError('Verification failed. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  // If no token, show resend option
  if (!token) {
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

          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-brand-400" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-2">Verify Your Email</h1>
            <p className="text-surface-400 text-sm mb-6">
              Please check your email for the verification link.
            </p>

            <button className="btn-primary w-full mb-4">
              Resend Verification Email
            </button>

            <Link href="/login" className="text-sm text-surface-400 hover:text-white">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="card text-center">
          {verifying && (
            <>
              <Loader2 className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-4" />
              <h1 className="font-display font-bold text-2xl text-white mb-2">Verifying Email</h1>
              <p className="text-surface-400 text-sm">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {verified && (
            <>
              <div className="w-12 h-12 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-success-400" />
              </div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">Email Verified!</h1>
              <p className="text-surface-400 text-sm">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {error && (
            <>
              <div className="w-12 h-12 rounded-full bg-danger-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-danger-400" />
              </div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">Verification Failed</h1>
              <p className="text-surface-400 text-sm mb-6">{error}</p>
              <Link href="/login" className="btn-primary">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}