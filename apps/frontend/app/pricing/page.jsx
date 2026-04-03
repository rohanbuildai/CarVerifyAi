import Link from 'next/link';
import { Check, ArrowRight, Car, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for CarVerify AI. Start free, upgrade when you need more.',
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Try CarVerify AI with basic verifications.',
    features: [
      '3 vehicle searches per month',
      'Preview report (summary only)',
      'Basic risk score',
      'Email support',
    ],
    notIncluded: [
      'Full detailed report',
      'AI chat follow-ups',
      'Priority processing',
      'PDF export',
    ],
    cta: 'Get Started Free',
    ctaHref: '/register?redirect=/dashboard',
    popular: false,
    gradient: 'from-surface-800 to-surface-900',
  },
  {
    id: 'single',
    name: 'Single Report',
    price: '₹199',
    period: 'one-time',
    description: 'Full report for one vehicle. Perfect for a single purchase decision.',
    features: [
      'Complete vehicle report',
      'Ownership & insurance analysis',
      'Maintenance cost forecast',
      'AI risk verdict (EN + HI)',
      '10 AI chat messages',
      'PDF export',
    ],
    notIncluded: [],
    cta: 'Buy Single Report',
    ctaHref: '/register?redirect=/billing&plan=single',
    popular: false,
    gradient: 'from-surface-800 to-surface-900',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '₹499',
    period: '/month',
    description: 'For active car buyers and dealers. Best value for multiple checks.',
    features: [
      '15 full reports per month',
      'Everything in Single Report',
      'Unlimited AI chat',
      'Priority processing',
      'Comparison tools',
      'PDF export',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Start Pro Monthly',
    ctaHref: '/register?redirect=/billing&plan=monthly',
    popular: true,
    gradient: 'from-brand-600 to-brand-500',
  },
  {
    id: 'annual',
    name: 'Pro Annual',
    price: '₹4,999',
    period: '/year',
    description: 'Save 17% with annual billing. Best for dealers and professionals.',
    features: [
      '20 full reports per month',
      'Everything in Pro Monthly',
      'Early access to new features',
      'Dedicated support',
      'API access (coming soon)',
    ],
    notIncluded: [],
    cta: 'Start Pro Annual',
    ctaHref: '/register?redirect=/billing&plan=annual',
    popular: false,
    gradient: 'from-accent-600 to-accent-500',
    badge: 'Save 17%',
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/[0.06]">
        <div className="section flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              CarVerify<span className="text-gradient"> AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">Log in</Link>
            <Link href="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-10 text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />
        <div className="section relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">Simple, transparent pricing</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-4 text-balance">
            Choose Your <span className="text-gradient">Plan</span>
          </h1>
          <p className="text-surface-400 max-w-xl mx-auto text-lg">
            Start free. Upgrade when you need full reports, AI chat, and priority processing.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-10 pb-20">
        <div className="section">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular
                    ? 'border-brand-500/50 bg-surface-900/80 shadow-lg shadow-brand-500/10'
                    : 'border-surface-800 bg-surface-900/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Save Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-600 to-accent-500 text-white text-xs font-semibold shadow-lg">
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-5">
                  <h3 className="font-display font-bold text-lg text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-display font-extrabold text-3xl text-white">{plan.price}</span>
                    <span className="text-sm text-surface-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-surface-400">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                      <span className="text-surface-300">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm opacity-40">
                      <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center text-surface-600">—</span>
                      <span className="text-surface-500 line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`w-full text-center ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* GST Note */}
          <p className="text-center text-xs text-surface-600 mt-8">
            All prices are exclusive of 18% GST. Prices in INR.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8 mt-auto">
        <div className="section flex items-center justify-between">
          <p className="text-xs text-surface-500">© {new Date().getFullYear()} CarVerify AI</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-surface-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-surface-500 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
