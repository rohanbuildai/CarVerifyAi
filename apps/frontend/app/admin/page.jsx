'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, CreditCard, FileText, TrendingUp, DollarSign, Activity, Loader2, Crown, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';

export default function AdminPage() {
  const { initialize, user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    reportsGenerated: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!user) return;
    // Simulate fetching admin data
    setStats({
      totalUsers: 1247,
      activeSubscriptions: 342,
      totalRevenue: 487500,
      reportsGenerated: 8934,
    });
    setRecentUsers([
      { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', plan: 'Pro Monthly', joined: '2 hours ago' },
      { id: 2, name: 'Priya Singh', email: 'priya@example.com', plan: 'Pro Annual', joined: '5 hours ago' },
      { id: 3, name: 'Amit Kumar', email: 'amit@example.com', plan: 'Free', joined: '1 day ago' },
    ]);
    setRecentOrders([
      { id: 'ORD-001', user: 'Rahul Sharma', amount: 499, status: 'paid', date: '2 hours ago' },
      { id: 'ORD-002', user: 'Priya Singh', amount: 4999, status: 'paid', date: '5 hours ago' },
      { id: 'ORD-003', user: 'Vikram Reddy', amount: 199, status: 'paid', date: '1 day ago' },
    ]);
    setLoading(false);
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center h-14 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span className="text-xs text-surface-500">Admin Panel</span>
        </div>
      </header>

      <div className="section pt-8">
        <h1 className="font-display font-bold text-2xl text-white mb-2">Admin Dashboard</h1>
        <p className="text-surface-400 text-sm mb-8">Overview of platform performance and user management.</p>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-surface-500">Total Users</span>
              <Users className="w-5 h-5 text-brand-400" />
            </div>
            <p className="font-display font-bold text-2xl text-white">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-success-400 mt-1">+12% this month</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-surface-500">Active Subscriptions</span>
              <Crown className="w-5 h-5 text-accent-400" />
            </div>
            <p className="font-display font-bold text-2xl text-white">{stats.activeSubscriptions}</p>
            <p className="text-xs text-surface-500 mt-1">27% conversion rate</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-surface-500">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-success-400" />
            </div>
            <p className="font-display font-bold text-2xl text-white">₹{(stats.totalRevenue / 100).toLocaleString()}</p>
            <p className="text-xs text-success-400 mt-1">+8% this month</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-surface-500">Reports Generated</span>
              <FileText className="w-5 h-5 text-brand-400" />
            </div>
            <p className="font-display font-bold text-2xl text-white">{stats.reportsGenerated.toLocaleString()}</p>
            <p className="text-xs text-surface-500 mt-1">Today: 234</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-white">Recent Users</h2>
              <button className="btn-ghost btn-sm text-brand-400">View All</button>
            </div>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50">
                  <div>
                    <p className="font-medium text-white">{u.name}</p>
                    <p className="text-xs text-surface-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-sm badge-info">{u.plan}</span>
                    <p className="text-xs text-surface-500 mt-1">{u.joined}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-white">Recent Orders</h2>
              <button className="btn-ghost btn-sm text-brand-400">View All</button>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50">
                  <div>
                    <p className="font-medium text-white">{order.id}</p>
                    <p className="text-xs text-surface-500">{order.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">₹{order.amount}</p>
                    <span className="badge badge-sm badge-success">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="font-display font-semibold text-lg text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary">Send Broadcast</button>
            <button className="btn-secondary">Export Data</button>
            <button className="btn-secondary">View Reports</button>
            <button className="btn-secondary">Manage Plans</button>
          </div>
        </div>
      </div>
    </div>
  );
}