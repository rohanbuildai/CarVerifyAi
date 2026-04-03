'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Lock, Bell, Shield, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-client';

export default function SettingsPage() {
  const { initialize, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', preferredLang: 'en' });

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      preferredLang: user.preferredLang || 'en',
    });
    setLoading(false);
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save - in real app would call API
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
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
        <h1 className="font-display font-bold text-2xl text-white mb-2">Settings</h1>
        <p className="text-surface-400 text-sm mb-8">Manage your account preferences.</p>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="font-medium text-white">Profile Information</h2>
                <p className="text-sm text-surface-500">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  className="input"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input"
                  disabled
                />
                <p className="text-xs text-surface-500 mt-1">Contact support to change email</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-surface-300 mb-1.5">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label htmlFor="preferredLang" className="block text-sm font-medium text-surface-300 mb-1.5">Language</label>
                <select
                  id="preferredLang"
                  value={form.preferredLang}
                  onChange={(e) => setForm(p => ({ ...p, preferredLang: e.target.value }))}
                  className="input"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="font-medium text-white">Security</h2>
                <p className="text-sm text-surface-500">Manage your password and security settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
                <div>
                  <p className="font-medium text-white">Password</p>
                  <p className="text-sm text-surface-500">Last changed 30 days ago</p>
                </div>
                <button type="button" className="btn-secondary btn-sm">Change</button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-surface-400" />
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-surface-500">Add an extra layer of security</p>
                  </div>
                </div>
                <span className="badge badge-info">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-warning-400" />
              </div>
              <div>
                <h2 className="font-medium text-white">Notifications</h2>
                <p className="text-sm text-surface-500">Configure how you receive updates</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Email notifications', desc: 'Receive reports and updates via email', default: true },
                { label: 'SMS alerts', desc: 'Get critical alerts on your phone', default: false },
                { label: 'Marketing emails', desc: 'News about new features and offers', default: false },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 cursor-pointer hover:bg-surface-800">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-surface-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.default}
                    className="w-5 h-5 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-900"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                'Save Changes'
              )}
            </button>
            {saved && (
              <span className="text-sm text-success-400">Your settings have been updated.</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}