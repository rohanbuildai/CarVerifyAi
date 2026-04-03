'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Check, Loader2, AlertCircle, Crown, X } from 'lucide-react';
import { paymentApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

export default function BillingPage() {
  const { initialize, user } = useAuthStore();
  const [sub, setSub] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      paymentApi.getCurrentSubscription().catch(() => ({ subscription: null })),
      paymentApi.listOrders().catch(() => ({ data: [] })),
    ]).then(([subRes, ordRes]) => {
      setSub(subRes.subscription);
      setOrders(ordRes.data || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await paymentApi.cancelSubscription();
      setSub((p) => p ? { ...p, status: 'cancelled' } : null);
      setCancelOpen(false);
    } catch { /* handled */ }
    finally { setCancelling(false); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center h-14">
          <Link href="/dashboard" className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </header>

      <div className="section max-w-4xl pt-8">
        <h1 className="font-display font-bold text-2xl text-white mb-2">Billing & Subscription</h1>
        <p className="text-surface-400 text-sm mb-8">Manage your plan and payment history.</p>

        {/* Current Plan */}
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-brand-400" />
                <h2 className="font-display font-bold text-xl text-white capitalize">
                  {sub?.plan || 'Free'}
                </h2>
                {sub?.status === 'active' && <span className="badge badge-success">Active</span>}
                {sub?.status === 'past_due' && <span className="badge badge-warning">Past Due</span>}
                {sub?.status === 'cancelled' && <span className="badge badge-danger">Cancelled</span>}
              </div>
            </div>
            {sub?.plan && sub?.plan !== 'free' && sub?.status === 'active' && (
              <button onClick={() => setCancelOpen(true)} className="btn-ghost btn-sm text-danger-400 hover:text-danger-300">
                Cancel Plan
              </button>
            )}
          </div>

          {sub && sub.plan !== 'free' && (
            <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-surface-800">
              <div>
                <p className="text-xs text-surface-500 mb-1">Reports This Month</p>
                <p className="font-semibold text-white">{sub.reportsUsedThisMonth} / {sub.reportsPerMonth}</p>
                <div className="w-full bg-surface-800 rounded-full h-1.5 mt-2">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((sub.reportsUsedThisMonth / sub.reportsPerMonth) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-surface-500 mb-1">Current Period</p>
                <p className="text-sm text-surface-300">
                  {sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString('en-IN') : '—'} — {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-surface-500 mb-1">Next Billing</p>
                <p className="text-sm text-surface-300">
                  {sub.status === 'active' && sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
            </div>
          )}

          {(!sub || sub.plan === 'free') && (
            <div className="pt-4 border-t border-surface-800">
              <p className="text-sm text-surface-400 mb-4">Upgrade to unlock full reports, AI chat, and priority processing.</p>
              <Link href="/pricing" className="btn-primary btn-sm">View Plans</Link>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div>
          <h2 className="font-display font-semibold text-lg text-white mb-4">Payment History</h2>
          {orders.length === 0 ? (
            <div className="card text-center py-10">
              <CreditCard className="w-8 h-8 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400">No payments yet</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-surface-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-surface-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-xs font-medium text-surface-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-xs font-medium text-surface-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-surface-800/50 last:border-0">
                      <td className="px-4 py-3 text-sm text-surface-300">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-surface-300 capitalize">{order.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">₹{(order.amountInr / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${order.status === 'paid' ? 'badge-success' : order.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="card-glass max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-white">Cancel Subscription?</h3>
              <button onClick={() => setCancelOpen(false)} className="btn-ghost btn-icon btn-sm"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-surface-400 mb-6">
              Your plan will remain active until the end of the current billing period. You won&apos;t be charged again.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelOpen(false)} className="btn-secondary btn-sm">Keep Plan</button>
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger btn-sm">
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
