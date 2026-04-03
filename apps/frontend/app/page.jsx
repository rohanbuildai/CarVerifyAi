import Link from 'next/link';
import {
  Shield,
  Search,
  FileText,
  MessageSquare,
  ChevronRight,
  Star,
  Zap,
  Lock,
  Car,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'CarVerify AI — Know Your Car\'s Truth',
};

const FEATURES = [
  {
    icon: Search,
    title: 'Instant Vehicle Lookup',
    description:
      'Enter a VIN, chassis, or registration number and get comprehensive vehicle intelligence in seconds.',
  },
  {
    icon: Shield,
    title: 'Risk Analysis',
    description:
      'AI-powered risk scoring based on ownership history, accident records, insurance claims, and more.',
  },
  {
    icon: TrendingUp,
    title: 'Maintenance Forecast',
    description:
      '1-year and 3-year maintenance cost projections with parts pricing benchmarks.',
  },
  {
    icon: FileText,
    title: 'Detailed Reports',
    description:
      'Multi-section reports covering ownership, insurance, service history, and AI-generated verdicts.',
  },
  {
    icon: MessageSquare,
    title: 'Ask AI Anything',
    description:
      'Chat with our AI about any vehicle report. Ask follow-up questions in English or Hindi.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description:
      'Bank-grade encryption, secure payments via Razorpay, and strict data privacy compliance.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Enter Vehicle Details',
    description: 'Provide VIN, chassis number, or registration number of the car you want to check.',
  },
  {
    step: '02',
    title: 'AI Analyzes Everything',
    description: 'Our AI fetches data from multiple sources, cross-references, and computes risk scores.',
  },
  {
    step: '03',
    title: 'Get Your Report',
    description: 'Receive a comprehensive report with risk verdict, cost estimates, and actionable insights.',
  },
];

const STATS = [
  { value: '50+', label: 'Data Points Checked' },
  { value: '4', label: 'Provider Sources' },
  { value: '< 30s', label: 'Report Generation' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/[0.06]">
        <div className="section flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              CarVerify
              <span className="text-gradient"> AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/pricing" className="btn-ghost text-sm">Pricing</Link>
            <Link href="/login" className="btn-ghost text-sm">Log in</Link>
            <Link href="/register" className="btn-primary text-sm ml-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden btn-icon btn-ghost" aria-label="Open menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pattern-dots" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[100px]" />

        <div className="section relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">AI-Powered Vehicle Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 animate-slide-up text-balance max-w-4xl mx-auto">
            Know Your Car&apos;s{' '}
            <span className="text-gradient">Truth</span>{' '}
            Before You Buy
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 animate-slide-up text-balance"
             style={{ animationDelay: '0.1s' }}>
            India&apos;s most comprehensive AI-powered used-car verification platform.
            Vehicle history, risk analysis, and maintenance forecasts — in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
               style={{ animationDelay: '0.2s' }}>
            <Link href="/register" className="btn-primary btn-lg group">
              Start Free Verification
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/pricing" className="btn-secondary btn-lg">
              View Pricing
            </Link>
          </div>

          {/* Trust stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in"
               style={{ animationDelay: '0.4s' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl sm:text-3xl text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-surface-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="section">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              How It Works
            </h2>
            <p className="text-surface-400 max-w-xl mx-auto">
              Three simple steps to make an informed used-car buying decision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {STEPS.map((item, i) => (
              <div key={item.step} className="relative group">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-surface-700 to-transparent z-0" />
                )}

                <div className="card-hover relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 text-white font-display font-bold text-lg mb-5 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────── */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent" />

        <div className="section relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-surface-400 max-w-xl mx-auto">
              A complete vehicle intelligence suite powered by AI and real data sources.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card-hover group cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────── */}
      <section className="py-20">
        <div className="section">
          <div className="relative overflow-hidden rounded-3xl border border-surface-800 bg-gradient-to-br from-surface-900 to-surface-950 p-10 sm:p-14 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-500/10 border border-success-500/20 text-success-400 text-xs font-medium mb-6">
                <Star className="w-3.5 h-3.5" />
                Start with 3 free verifications
              </div>

              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 text-balance">
                Don&apos;t Buy a Lemon.{' '}
                <span className="text-gradient">Verify First.</span>
              </h2>

              <p className="text-surface-400 max-w-lg mx-auto mb-8">
                Join thousands of smart car buyers who use CarVerify AI to make informed decisions.
                Your first 3 verifications are completely free.
              </p>

              <Link href="/register" className="btn-primary btn-lg">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-surface-800 py-12 mt-auto">
        <div className="section">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                  <Car className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-white">
                  CarVerify <span className="text-brand-400">AI</span>
                </span>
              </Link>
              <p className="text-sm text-surface-500 leading-relaxed">
                India&apos;s AI-powered used-car intelligence platform. Make smarter buying decisions.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-sm text-surface-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/search" className="text-sm text-surface-400 hover:text-white transition-colors">Search</Link></li>
                <li><Link href="/dashboard" className="text-sm text-surface-400 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-surface-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-surface-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Support</h4>
              <ul className="space-y-2">
                <li><a href="mailto:support@carverify.ai" className="text-sm text-surface-400 hover:text-white transition-colors">support@carverify.ai</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-surface-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-surface-500">
              © {new Date().getFullYear()} CarVerify AI. All rights reserved.
            </p>
            <p className="text-xs text-surface-600">
              Made in India 🇮🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
