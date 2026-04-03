'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Car, Shield, AlertTriangle, CheckCircle2, Lock,
  MessageSquare, Download, Globe, Loader2, TrendingUp, Users,
  FileWarning, Wrench, DollarSign, ChevronDown, ChevronUp,
} from 'lucide-react';
import { reportApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-client';

const RISK_CONFIG = {
  low:      { color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/30', label: 'Low Risk', emoji: '✅' },
  medium:   { color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30', label: 'Medium Risk', emoji: '⚠️' },
  high:     { color: 'text-danger-400',  bg: 'bg-danger-500/10',  border: 'border-danger-500/30',  label: 'High Risk',   emoji: '🚨' },
  critical: { color: 'text-danger-400',  bg: 'bg-danger-500/10',  border: 'border-danger-500/30',  label: 'Critical',    emoji: '🛑' },
};

const SECTION_ICONS = {
  summary: Shield,
  ownership: Users,
  insurance: FileWarning,
  service: Wrench,
  parts: DollarSign,
  maintenance: TrendingUp,
  verdict: CheckCircle2,
};

export default function ReportPage() {
  const params = useParams();
  const { initialize } = useAuthStore();
  const [report, setReport] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en');
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    setLoading(true);
    reportApi.get(params.reportId)
      .then((data) => {
        setReport(data.report);
        setSections(data.sections || []);
        // Auto-expand free sections
        const freeSectionIds = new Set((data.sections || []).filter((s) => s.isFree).map((s) => s.id));
        setExpandedSections(freeSectionIds);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.reportId]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center card p-8">
          <AlertTriangle className="w-10 h-10 text-danger-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">Report Not Found</h2>
          <p className="text-sm text-surface-400 mb-6">{error || 'This report does not exist or you do not have access.'}</p>
          <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const risk = RISK_CONFIG[report.riskVerdict] || RISK_CONFIG.medium;
  const riskAngle = (report.overallRiskScore / 100) * 180;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-surface-800 glass-effect sticky top-0 z-40">
        <div className="section flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="btn-ghost btn-sm"
              title="Toggle language"
            >
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
            {report.isPaid && (
              <Link href={`/reports/${params.reportId}/chat`} className="btn-primary btn-sm">
                <MessageSquare className="w-4 h-4" /> Ask AI
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="section max-w-4xl pt-8">
        {/* Vehicle Info */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center flex-shrink-0">
            <Car className="w-7 h-7 text-surface-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Vehicle Report</h1>
            <p className="text-surface-400 text-sm mt-1">
              Generated {new Date(report.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className={`rounded-2xl border ${risk.border} ${risk.bg} p-6 mb-8`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score Gauge */}
            <div className="relative w-32 h-16 flex-shrink-0 overflow-hidden">
              <svg viewBox="0 0 120 60" className="w-full h-full">
                <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-800" strokeLinecap="round" />
                <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="url(#riskGradient)" strokeWidth="8"
                      strokeDasharray={`${(report.overallRiskScore / 100) * 157} 157`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <text x="60" y="50" textAnchor="middle" className="fill-white font-display font-bold" fontSize="20">
                  {report.overallRiskScore}
                </text>
              </svg>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl">{risk.emoji}</span>
                <h2 className={`font-display font-bold text-xl ${risk.color}`}>{risk.label}</h2>
              </div>
              <p className="text-sm text-surface-300 mt-1">
                {lang === 'en' ? report.verdictEn : (report.verdictHi || report.verdictEn)}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-surface-500 justify-center sm:justify-start">
                <span>Data completeness: {Math.round((report.dataCompleteness || 0) * 100)}%</span>
                <span>•</span>
                <span>Model: {report.modelVersion || 'AI'}</span>
              </div>
            </div>
          </div>

          {/* Maintenance Cost Estimates */}
          {(report.maintenanceCost1y || report.maintenanceCost3y) && (
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-xs text-surface-400 mb-1">Est. 1-Year Maintenance</p>
                <p className="font-display font-bold text-lg text-white">₹{(report.maintenanceCost1y || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-surface-400 mb-1">Est. 3-Year Maintenance</p>
                <p className="font-display font-bold text-lg text-white">₹{(report.maintenanceCost3y || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Report Sections */}
        <div className="space-y-3">
          {sections
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((section) => {
              const Icon = SECTION_ICONS[section.sectionType] || Shield;
              const isExpanded = expandedSections.has(section.id);
              const isLocked = !section.isFree && !report.isPaid;
              const title = lang === 'en' ? section.titleEn : (section.titleHi || section.titleEn);
              const content = lang === 'en' ? section.contentEn : (section.contentHi || section.contentEn);

              return (
                <div key={section.id} className={`card overflow-hidden ${isLocked ? 'opacity-70' : ''}`}>
                  <button
                    onClick={() => !isLocked && toggleSection(section.id)}
                    className="flex items-center gap-3 w-full text-left"
                    disabled={isLocked}
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <h3 className="font-semibold text-white flex-1 text-sm">{title}</h3>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-surface-500" />
                    ) : isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-surface-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-surface-500" />
                    )}
                  </button>

                  {isExpanded && !isLocked && (
                    <div className="mt-4 pt-4 border-t border-surface-800">
                      <div className="prose prose-sm prose-invert max-w-none text-surface-300 leading-relaxed whitespace-pre-wrap">
                        {content}
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="mt-3 p-3 rounded-xl bg-surface-800/30 text-center">
                      <p className="text-xs text-surface-500">🔒 Unlock full report to view this section</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Unlock CTA */}
        {!report.isPaid && (
          <div className="mt-8 p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/10 to-accent-600/10 text-center">
            <Lock className="w-8 h-8 text-brand-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-xl text-white mb-2">Unlock Full Report</h3>
            <p className="text-sm text-surface-400 mb-5 max-w-md mx-auto">
              Get complete vehicle analysis, detailed risk breakdown, AI chat, and PDF export.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/billing?reportId=${params.reportId}`} className="btn-primary btn-lg">
                <DollarSign className="w-5 h-5" /> Unlock for ₹199
              </Link>
              <Link href="/pricing" className="btn-secondary btn-sm">
                Or subscribe from ₹499/mo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
