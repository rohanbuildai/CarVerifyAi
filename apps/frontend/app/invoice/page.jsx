'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Printer, Loader2, FileText, CreditCard, Calendar } from 'lucide-react';

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    // Simulate fetching invoice
    setTimeout(() => {
      setInvoice({
        id: orderId || 'INV-2026-001',
        date: '2026-04-03',
        dueDate: '2026-04-03',
        status: 'paid',
        customer: {
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          address: 'Bangalore, Karnataka',
        },
        items: [
          { description: 'Pro Monthly Subscription', quantity: 1, unitPrice: 49900, total: 49900 },
        ],
        subtotal: 49900,
        tax: 8982,
        total: 58882,
        payment: {
          method: 'Razorpay',
          transactionId: 'txn_1234567890',
          date: '2026-04-03',
        },
      });
      setLoading(false);
    }, 500);
  }, [orderId]);

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download functionality would generate PDF');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invoice Not Found</h1>
          <Link href="/billing" className="btn-primary">Back to Billing</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center h-14 justify-between">
          <Link href="/billing" className="flex items-center gap-2 text-surface-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Billing
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn-ghost btn-sm">
              <Printer className="w-4 h-4 mr-1" /> Print
            </button>
            <button onClick={handleDownload} className="btn-primary btn-sm">
              <Download className="w-4 h-4 mr-1" /> Download
            </button>
          </div>
        </div>
      </header>

      <div className="section max-w-3xl pt-8">
        <div className="card p-8 bg-white text-surface-900">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-surface-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg">CarVerify AI</span>
              </div>
              <p className="text-sm text-surface-600">Bangalore, Karnataka, India</p>
              <p className="text-sm text-surface-600">support@carverify.ai</p>
            </div>
            <div className="text-right">
              <h1 className="font-display font-bold text-2xl text-surface-900 mb-1">INVOICE</h1>
              <p className="text-surface-600">#{invoice.id}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-2 ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-medium text-surface-900">{invoice.customer.name}</p>
              <p className="text-sm text-surface-600">{invoice.customer.email}</p>
              <p className="text-sm text-surface-600">{invoice.customer.address}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-xs text-surface-500 uppercase tracking-wider">Invoice Date</p>
                <p className="text-surface-900">{new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-surface-500 uppercase tracking-wider">Due Date</p>
                <p className="text-surface-900">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-2 text-xs text-surface-500 uppercase tracking-wider">Description</th>
                <th className="text-right py-2 text-xs text-surface-500 uppercase tracking-wider">Qty</th>
                <th className="text-right py-2 text-xs text-surface-500 uppercase tracking-wider">Amount</th>
                <th className="text-right py-2 text-xs text-surface-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-surface-100">
                  <td className="py-3 text-surface-900">{item.description}</td>
                  <td className="py-3 text-right text-surface-600">{item.quantity}</td>
                  <td className="py-3 text-right text-surface-600">₹{(item.unitPrice / 100).toFixed(2)}</td>
                  <td className="py-3 text-right text-surface-900 font-medium">₹{(item.total / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-surface-600">Subtotal</span>
                <span className="text-surface-900">₹{(invoice.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-surface-600">GST (18%)</span>
                <span className="text-surface-900">₹{(invoice.tax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-surface-200 font-bold">
                <span className="text-surface-900">Total</span>
                <span className="text-brand-600">₹{(invoice.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-8 pt-6 border-t border-surface-200">
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Payment Details</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-surface-600">
                <CreditCard className="w-4 h-4" />
                {invoice.payment.method}
              </div>
              <div className="flex items-center gap-1 text-surface-600">
                <Calendar className="w-4 h-4" />
                {new Date(invoice.payment.date).toLocaleDateString('en-IN')}
              </div>
              <span className="text-surface-500">Txn: {invoice.payment.transactionId}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-surface-200 text-center text-sm text-surface-500">
            <p>Thank you for your business!</p>
            <p className="mt-1">Questions? Contact us at support@carverify.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
}