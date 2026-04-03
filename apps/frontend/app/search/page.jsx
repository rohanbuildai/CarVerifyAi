'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search as SearchIcon, Car, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, Radio, ArrowLeft, Shield,
} from 'lucide-react';
import { vehicleApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

const QUERY_TYPES = [
  { id: 'registration', label: 'Registration No', placeholder: 'e.g. MH02AB1234', pattern: '^[A-Z]{2}\\d{2}[A-Z]{1,2}\\d{4}$' },
  { id: 'vin', label: 'VIN', placeholder: 'e.g. MA1ZA2GKXM1234567', pattern: '^[A-HJ-NPR-Z0-9]{17}$' },
  { id: 'chassis', label: 'Chassis No', placeholder: 'e.g. MALA851CJHM123456', pattern: '.{10,}' },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialize } = useAuthStore();
  const pollRef = useRef(null);

  const [queryType, setQueryType] = useState('registration');
  const [queryInput, setQueryInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Polling states
  const [activeQueryId, setActiveQueryId] = useState(searchParams.get('queryId') || null);
  const [queryStatus, setQueryStatus] = useState(null);

  useEffect(() => { initialize(); }, [initialize]);

  // Poll for query status
  const pollStatus = useCallback(async (queryId) => {
    try {
      const data = await vehicleApi.getQuery(queryId);
      setQueryStatus(data);

      if (data.query.status === 'completed' && data.report) {
        clearInterval(pollRef.current);
        // Auto-redirect to report after short delay
        setTimeout(() => router.push(`/reports/${data.report.id}`), 1500);
      } else if (data.query.status === 'failed') {
        clearInterval(pollRef.current);
        setError(data.query.failureReason || 'Search failed. Please try again.');
      }
    } catch (err) {
      // Keep polling on transient errors
    }
  }, [router]);

  useEffect(() => {
    if (!activeQueryId) return;
    pollStatus(activeQueryId);
    pollRef.current = setInterval(() => pollStatus(activeQueryId), 3000);
    return () => clearInterval(pollRef.current);
  }, [activeQueryId, pollStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setQueryStatus(null);

    try {
      const idempotencyKey = `${user?.id || 'anon'}-${queryInput.toUpperCase().replace(/\s/g, '')}-${new Date().toISOString().slice(0, 13)}`;
      const data = await vehicleApi.search({
        queryInput: queryInput.toUpperCase().replace(/\s/g, ''),
        queryType,
        idempotencyKey,
      });
      setActiveQueryId(data.queryId);
    } catch (err) {
      if (err.isPaymentRequired) {
        setError('Free search quota exceeded. Please upgrade your plan.');
      } else if (err.isRateLimited) {
        setError('Too many searches. Please wait a moment.');
      } else {
        setError(err.message || 'Search failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const providerProgress = queryStatus?.query
    ? Math.round((queryStatus.query.providersFetched / Math.max(queryStatus.query.providersTotal, 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 pattern-dots" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/6 rounded-full blur-[120px]" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 h-16">
        <Link href="/dashboard" className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white">CarVerify AI</span>
        </Link>
      </header>

      <div className="relative z-10 section max-w-2xl pt-8 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 mb-5 shadow-lg shadow-brand-500/20">
            <SearchIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Vehicle Verification</h1>
          <p className="text-surface-400">Enter a vehicle number to get an AI-powered risk analysis</p>
        </div>

        {/* Search Form */}
        {!activeQueryId && (
          <div className="card-glass">
            {/* Query Type Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-surface-800/50 mb-6">
              {QUERY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setQueryType(type.id); setError(null); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    queryType === type.id
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-surface-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="search-input" className="block text-sm font-medium text-surface-300 mb-1.5">
                  {QUERY_TYPES.find((t) => t.id === queryType)?.label}
                </label>
                <input
                  id="search-input"
                  type="text"
                  required
                  placeholder={QUERY_TYPES.find((t) => t.id === queryType)?.placeholder}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value.toUpperCase())}
                  className="input-lg font-mono tracking-wider text-center"
                  disabled={submitting}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20">
                  <AlertCircle className="w-4 h-4 text-danger-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-danger-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !queryInput.trim()}
                className="btn-primary btn-lg w-full"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
                ) : (
                  <><Shield className="w-5 h-5" /> Verify Vehicle</>
                )}
              </button>
            </form>

            <p className="text-xs text-surface-600 text-center mt-4">
              Your data is encrypted and never shared with third parties.
            </p>
          </div>
        )}

        {/* Progress / Status */}
        {activeQueryId && queryStatus && (
          <div className="card-glass text-center">
            {queryStatus.query.status === 'processing' || queryStatus.query.status === 'pending' ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/10 mb-5">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">Analyzing Vehicle</h2>
                <p className="text-surface-400 text-sm mb-6">
                  Fetching data from {queryStatus.query.providersTotal} sources...
                </p>

                {/* Progress bar */}
                <div className="w-full bg-surface-800 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(providerProgress, 10)}%` }}
                  />
                </div>
                <p className="text-xs text-surface-500">
                  {queryStatus.query.providersFetched} of {queryStatus.query.providersTotal} providers complete
                </p>

                {/* Provider status list */}
                <div className="mt-6 space-y-2 text-left">
                  {['Vehicle Registry (RTO)', 'Insurance Records', 'Service History', 'Parts Pricing'].map((name, i) => (
                    <div key={name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-800/30">
                      {i < queryStatus.query.providersFetched ? (
                        <CheckCircle2 className="w-4 h-4 text-success-400" />
                      ) : i === queryStatus.query.providersFetched ? (
                        <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                      ) : (
                        <Radio className="w-4 h-4 text-surface-600" />
                      )}
                      <span className={`text-sm ${i < queryStatus.query.providersFetched ? 'text-surface-300' : i === queryStatus.query.providersFetched ? 'text-white' : 'text-surface-500'}`}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : queryStatus.query.status === 'completed' ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-500/10 mb-5">
                  <CheckCircle2 className="w-8 h-8 text-success-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">Report Ready!</h2>
                <p className="text-surface-400 text-sm mb-6">Redirecting to your report...</p>
                <Loader2 className="w-5 h-5 text-brand-400 animate-spin mx-auto" />
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-500/10 mb-5">
                  <AlertCircle className="w-8 h-8 text-danger-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">Search Failed</h2>
                <p className="text-sm text-surface-400 mb-6">{queryStatus.query.failureReason || 'An error occurred.'}</p>
                <button onClick={() => { setActiveQueryId(null); setQueryStatus(null); setError(null); }} className="btn-primary">
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
