'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Check, Loader2, X, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';
import { paymentApi } from '@/lib/api-client';

const PLANS = {
  single: {
    name: 'Single Report',
    price: 199,
    priceDisplay: '₹199',
    period: 'one-time',
    description: 'Full report for one vehicle',
    features: [
      'Complete vehicle report',
      'Ownership & insurance analysis',
      'Maintenance cost forecast',
      'AI risk verdict (EN + HI)',
      '10 AI chat messages',
      'PDF export',
    ],
  },
  monthly: {
    name: 'Pro Monthly',
    price: 499,
    priceDisplay: '₹499',
    period: '/month',
    description: 'For active car buyers and dealers',
    features: [
      '15 full reports per month',
      'Everything in Single Report',
      'Unlimited AI chat',
      'Priority processing',
      'Comparison tools',
      'PDF export',
      'Priority support',
    ],
    popular: true,
  },
  annual: {
    name: 'Pro Annual',
    price: 4999,
    priceDisplay: '₹4,999',
    period: '/year',
    description: 'Save 17% with annual billing',
    features: [
      '20 full reports per month',
      'Everything in Pro Monthly',
      'Early access to new features',
      'Dedicated support',
      'API access (coming soon)',
    ],
    badge: 'Save 17%',
  },
};

export default function CheckoutPage() {
  const { initialize, user, isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan');
  
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated === false) {
      // Not logged in, redirect to login with redirect param
      window.location.href = `/login?redirect=/checkout?plan=${planKey}`;
    } else if (isAuthenticated === true) {
      setLoading(false);
    }
  }, [isAuthenticated, planKey]);

  const plan = planKey && PLANS[planKey] ? PLANS[planKey] : null;

  const handlePurchase = async () => {
    if (!plan) return;
    setPurchasing(true);
    setError(null);
    try {
      await paymentApi.createOrder({ plan: planKey });
      alert(`Order created for ${plan.name}! In production, this would open Razorpay payment.`);
    } catch (err) {
      setError('Failed to create order. Please try again.');
    }
    setPurchasing(false);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Plan</h1>
          <p className="text-surface-400 mb-4">Please select a plan from the pricing page.</p>
          <Link href="/pricing" className="btn-primary">View Pricing</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center h-14">
          <Link href="/pricing" className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Pricing
          </Link>
        </div>
      </header>

      <div className="section max-w-4xl pt-8">
        <h1 className="font-display font-bold text-2xl text-white mb-2">Complete Purchase</h1>
        <p className="text-surface-400 text-sm mb-8">Review your plan and complete payment.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div className="card">
            {plan.badge && (
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 text-sm font-medium">
                  {plan.badge}
                </span>
              </div>
            )}
            <h2 className="font-display font-bold text-2xl text-white mb-2">{plan.name}</h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display font-extrabold text-4xl text-white">{plan.priceDisplay}</span>
              <span className="text-surface-500">{plan.period}</span>
            </div>
            <p className="text-surface-400 mb-6">{plan.description}</p>

            <h3 className="font-medium text-white mb-3">What's included:</h3>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                  <span className="text-surface-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Section */}
          <div className="card">
            <h3 className="font-display font-semibold text-lg text-white mb-4">Payment Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Plan Price</span>
                <span className="text-white">₹{plan.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">GST (18%)</span>
                <span className="text-white">₹{Math.round(plan.price * 0.18)}</span>
              </div>
              <div className="border-t border-surface-800 pt-3 flex justify-between">
                <span className="text-surface-300 font-medium">Total</span>
                <span className="text-white font-bold text-xl">₹{plan.price + Math.round(plan.price * 0.18)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20">
                <p className="text-sm text-danger-400">{error}</p>
              </div>
            )}

            <button 
              onClick={handlePurchase}
              disabled={purchasing}
              className="btn-primary w-full"
            >
              {purchasing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Pay ₹{plan.price + Math.round(plan.price * 0.18)}</>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-500">
              <Shield className="w-4 h-4" />
              <span>Secure payment powered by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}