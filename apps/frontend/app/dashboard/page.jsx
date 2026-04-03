'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, FileText, MessageSquare, CreditCard, Settings, LogOut,
  Car, ChevronRight, Clock, Shield, TrendingUp, Zap, BarChart3,
  AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';
import { useAuthStore, useUserDisplayName } from '@/lib/auth-client';
import { vehicleApi } from '@/lib/api-client';

const RISK_COLORS = {
  low: 'text-success-400 bg-success-500/10 border-success-500/20',
  medium: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
  high: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
  critical: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
};

export default function DashboardPage() {
  const { user, isLoading: authLoading, initialize, logout } = useAuthStore();
  const displayName = useUserDisplayName();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    vehicleApi.listQueries()
      .then((data) => setQueries(data.data || []))
      .catch(() => setQueries([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Searches This Month', value: queries.length, icon: Search, color: 'text-brand-400' },
    { label: 'Reports Generated', value: queries.filter((q) => q.report).length, icon: FileText, color: 'text-accent-400' },
    { label: 'Risk Alerts', value: queries.filter((q) => q.report?.riskVerdict === 'high' || q.report?.riskVerdict === 'critical').length, icon: AlertTriangle, color: 'text-warning-400' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-surface-800 bg-surface-950 p-4">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white">CarVerify<span className="text-brand-400"> AI</span></span>
        </Link>

        <nav className="flex-1 space-y-1">
          <SideLink href="/dashboard" icon={BarChart3} label="Dashboard" active />
          <SideLink href="/search" icon={Search} label="New Search" />
          <SideLink href="/billing" icon={CreditCard} label="Billing" />
          <SideLink href="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="border-t border-surface-800 pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-ghost w-full justify-start text-sm text-surface-400 hover:text-danger-400">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────── */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-surface-800 glass-effect sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm text-white">CarVerify AI</span>
          </Link>
          <button onClick={logout} className="btn-ghost btn-sm text-surface-400"><LogOut className="w-4 h-4" /></button>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-white mb-2">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-surface-400">Here&apos;s an overview of your vehicle verifications.</p>
          </div>

          {/* Quick Action */}
          <Link href="/search" className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-600/20 to-accent-600/20 border border-brand-500/20 mb-8 group hover:border-brand-500/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Start a New Verification</p>
                <p className="text-xs text-surface-400">Enter VIN, chassis, or registration number</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-surface-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="font-display font-bold text-2xl text-white">{stat.value}</p>
                  <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Searches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-white">Recent Searches</h2>
              <Link href="/search" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-2xl" />
                ))}
              </div>
            ) : queries.length === 0 ? (
              <div className="card text-center py-12">
                <Search className="w-10 h-10 text-surface-600 mx-auto mb-3" />
                <p className="text-surface-400 font-medium mb-1">No searches yet</p>
                <p className="text-sm text-surface-500 mb-4">Start your first vehicle verification</p>
                <Link href="/search" className="btn-primary btn-sm inline-flex">
                  <Search className="w-4 h-4" /> Search Now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {queries.slice(0, 5).map((query) => (
                  <Link
                    key={query.id}
                    href={query.report ? `/reports/${query.report.id}` : `/search?queryId=${query.id}`}
                    className="card-hover flex items-center gap-4 p-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-surface-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{query.queryInput}</p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {query.queryType.toUpperCase()} • {new Date(query.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {query.status === 'completed' && query.report && (
                        <span className={`badge ${RISK_COLORS[query.report.riskVerdict] || 'badge-info'}`}>
                          {query.report.riskVerdict}
                        </span>
                      )}
                      {query.status === 'processing' && (
                        <span className="badge badge-info"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>
                      )}
                      {query.status === 'failed' && (
                        <span className="badge badge-danger">Failed</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-surface-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SideLink({ href, icon: Icon, label, active = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
          : 'text-surface-400 hover:bg-surface-800 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
