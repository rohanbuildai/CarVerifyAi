'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car, Mail, Phone, MapPin, Send, Loader2, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center h-14">
          <Link href="/" className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            ← Home
          </Link>
        </div>
      </header>

      <div className="section max-w-4xl pt-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Contact Us</h1>
        <p className="text-surface-400 mb-8">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <div className="card mb-6">
              <h2 className="font-display font-semibold text-lg text-white mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 mb-0.5">Email</p>
                    <p className="text-white">support@carverify.ai</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 mb-0.5">Phone</p>
                    <p className="text-white">+91 98765 43210</p>
                    <p className="text-xs text-surface-500">Mon-Fri, 9am-6pm IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500 mb-0.5">Address</p>
                    <p className="text-white">Bangalore, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-display font-semibold text-lg text-white mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-surface-400 hover:text-white text-sm">
                  → View Pricing Plans
                </Link>
                <Link href="/privacy" className="block text-surface-400 hover:text-white text-sm">
                  → Privacy Policy
                </Link>
                <Link href="/terms" className="block text-surface-400 hover:text-white text-sm">
                  → Terms of Service
                </Link>
                <Link href="/faq" className="block text-surface-400 hover:text-white text-sm">
                  → FAQ
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">Message Sent!</h2>
                <p className="text-surface-400 text-sm mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => setSent(false)} className="btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-display font-semibold text-lg text-white mb-4">Send us a Message</h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-surface-300 mb-1.5">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      className="input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-surface-300 mb-1.5">
                      Phone (optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-surface-300 mb-1.5">
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="input"
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-surface-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    className="input min-h-[120px]"
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>

                <button type="submit" disabled={sending} className="btn-primary w-full">
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}