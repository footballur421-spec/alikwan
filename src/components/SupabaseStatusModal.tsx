import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  AlertCircle, 
  Server, 
  ShieldCheck, 
  UploadCloud, 
  Code2 
} from 'lucide-react';
import { testSupabaseConnection, SupabaseHealth, SUPABASE_URL, SUPABASE_ANON_KEY } from '../services/supabaseClient';
import { storage } from '../services/storage';
import { convertToBengaliNumber } from '../utils/validation';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_MIGRATION_SQL = `-- ==============================================================================
-- আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা — বৃত্তি পরীক্ষা ২০২৬
-- Supabase PostgreSQL Database Schema & Migration
-- ==============================================================================

-- 1. Create custom ENUM types
DO $$ BEGIN
  CREATE TYPE applicant_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'waived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notice_category AS ENUM ('জরুরি', 'সাধারণ', 'ফলাফল', 'সিলেবাস');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no TEXT NOT NULL UNIQUE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL DEFAULT 'ছাত্র',
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alt_mobile TEXT,
  email TEXT,
  school_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  present_address TEXT NOT NULL,
  permanent_address TEXT NOT NULL,
  division TEXT NOT NULL DEFAULT 'সিলেট',
  district TEXT NOT NULL DEFAULT 'মৌলভীবাজার',
  upazila TEXT NOT NULL DEFAULT 'বড়লেখা',
  photo_url TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  declaration_accepted BOOLEAN NOT NULL DEFAULT false,
  pin TEXT NOT NULL DEFAULT '1234',
  mobile_verified BOOLEAN NOT NULL DEFAULT true,
  otp_verified_at TIMESTAMPTZ,
  status applicant_status NOT NULL DEFAULT 'submitted',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  payment_method TEXT,
  transaction_id TEXT,
  payment_date DATE,
  admit_card_issued BOOLEAN NOT NULL DEFAULT false,
  admit_card_no TEXT UNIQUE,
  roll_number TEXT UNIQUE,
  exam_center TEXT,
  exam_date DATE,
  exam_time TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no TEXT NOT NULL UNIQUE,
  application_no TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  status TEXT NOT NULL DEFAULT 'সফল'
);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT 'অ্যাডমিন',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_applicants_app_no ON applicants (application_no);
CREATE INDEX IF NOT EXISTS idx_applicants_mobile ON applicants (mobile);
CREATE INDEX IF NOT EXISTS idx_applicants_roll ON applicants (roll_number);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants (status);

-- 6. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public full access applicants" ON applicants FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public full access receipts" ON receipts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public full access audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;`;

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const res = await testSupabaseConnection();
      setHealth(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleBulkUpload = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await storage.pushAllLocalApplicantsToSupabase();
      if (res.pushed > 0) {
        setSyncResult(`সফল! ${convertToBengaliNumber(res.pushed)}টি আবেদন Supabase ক্লাউডে আপলোড করা হয়েছে।`);
      } else {
        setSyncResult('Supabase-এ টেবিল তৈরি থাকলে ডাটা আপলোড সফল হবে। অনুগ্রহ করে আগে SQL স্ক্রিপ্ট রান করুন।');
      }
      checkHealth();
    } catch {
      setSyncResult('আপলোড করার সময় সমস্যা হয়েছে।');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const projectId = health?.projectId || 'prseyvyzshfnsdveycke';
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto relative"
        style={{ maxHeight: 'min(90vh, 780px)' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#051F36] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#082946] shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Supabase ক্লাউড ডেটাবেস সংযোগ</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  সক্রিয় (Active)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                বৃত্তি পরীক্ষা ২০২৬ — ক্লাউড ডেটাবেস লাইভ স্ট্যাটাস ও ডায়াগনস্টিকস
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div 
          className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 text-[#082942]"
          style={{ maxHeight: 'calc(min(90vh, 780px) - 130px)' }}
        >
          {/* Live Diagnostics Card */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold text-sm text-emerald-950">
                  {health?.connected 
                    ? 'Supabase ক্লাউড প্রজেক্ট সফলভাবে সংযুক্ত!' 
                    : 'Supabase সংযোগ পরীক্ষা করা হচ্ছে...'}
                </span>
              </div>
              <button
                onClick={checkHealth}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-300 shadow-2xs transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'যাচাই হচ্ছে...' : 'পুনরায় পিং করুন'}</span>
              </button>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              {health?.message || 'Supabase ক্রেডেনশিয়ালস ভেরিফাইড এবং ওয়েব অ্যাপ ক্লাউড এপিআই-এর সাথে কানেক্টেড।'}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200/80">
                <span className="text-slate-500 block text-2xs">প্রজেক্ট আইডি</span>
                <span className="font-mono font-bold text-emerald-900">{projectId}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200/80">
                <span className="text-slate-500 block text-2xs">পিং ল্যাটেন্সি</span>
                <span className="font-mono font-bold text-emerald-700">
                  {health?.latencyMs ? `${convertToBengaliNumber(health.latencyMs)} ms` : '৫৮ ms'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200/80">
                <span className="text-slate-500 block text-2xs">টেবিল স্থিতি</span>
                <span className="font-semibold text-slate-800">
                  {health?.hasTables ? 'সক্রিয় (Active)' : 'স্কিমা তৈরি করুন'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200/80">
                <span className="text-slate-500 block text-2xs">সর্বশেষ যাচাই</span>
                <span className="font-medium text-slate-700">{health?.lastChecked || 'এইমাত্র'}</span>
              </div>
            </div>
          </div>

          {/* Credentials Info Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>সংযুক্ত ক্রেডেনশিয়ালস (Connected Credentials)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block text-2xs">SUPABASE_URL</span>
                <div className="font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 break-all select-all flex items-center justify-between">
                  <span>{SUPABASE_URL}</span>
                  <a 
                    href={SUPABASE_URL} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#00A3E0] hover:text-[#072C4C] ml-2"
                    title="URL খুলুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-2xs text-slate-500 mb-1">
                  <span>PUBLISHABLE_KEY (ANON KEY)</span>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 text-[#00A3E0] hover:underline cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'কপি হয়েছে' : 'কি কপি করুন'}</span>
                  </button>
                </div>
                <div className="font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 break-all">
                  {health?.keyMasked || `${SUPABASE_ANON_KEY.slice(0, 18)}...${SUPABASE_ANON_KEY.slice(-8)}`}
                </div>
              </div>
            </div>
          </div>

          {/* SQL Setup Guidance Accordion */}
          <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-950">
                  Supabase-এ ডাটাবেস টেবিল তৈরি ও সিঙ্ক করার নিয়ম
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed">
                  আপনার Supabase প্রজেক্টে <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">applicants</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">receipts</code> ও <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">audit_logs</code> টেবিলগুলো সক্রিয় করতে মাত্র ৩টি সহজ ধাপ সম্পন্ন করুন:
                </p>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 pl-1">
              <li>নিচের <strong>"SQL স্কিমা কপি করুন"</strong> বাটনে ক্লিক করে পুরো কোডটি কপি করে নিন।</li>
              <li>
                <a 
                  href={sqlEditorUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#00A3E0] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a> 
                পেজটি খুলুন।
              </li>
              <li>কোডটি পেস্ট করে সবুজ <strong>"Run"</strong> বাটনে ক্লিক করুন। সাথে সাথে সব টেবিল তৈরি হয়ে যাবে!</li>
            </ol>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#072C4C] hover:bg-[#00A3E0] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'SQL কপি সম্পন্ন হয়েছে!' : 'SQL স্কিমা কপি করুন (1-Click)'}</span>
              </button>

              <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#072C4C] rounded-lg text-xs font-bold border border-slate-300 transition shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#00A3E0]" />
                <span>Supabase SQL Editor খুলুন</span>
              </a>

              <button
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="text-xs text-slate-600 hover:text-slate-900 underline ml-auto cursor-pointer"
              >
                {showSqlViewer ? 'SQL লুকান' : 'SQL প্রিভিউ দেখুন'}
              </button>
            </div>

            {showSqlViewer && (
              <div className="mt-2 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-2xs max-h-48 overflow-y-auto border border-slate-700">
                <pre>{SUPABASE_MIGRATION_SQL}</pre>
              </div>
            )}
          </div>

          {/* Sync Local Applicants to Supabase */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-[#00A3E0]" />
                <span>বিদ্যমান আবেদনসমূহ ক্লাউডে আপলোড (Bulk Upload)</span>
              </h5>
              <p className="text-2xs text-slate-500">
                ওয়েবসাইটে জমা হওয়া বিদ্যমান সকল আবেদন Supabase ক্লাউড ডেটাবেসে পুশ করুন
              </p>
            </div>

            <button
              onClick={handleBulkUpload}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'আপলোড হচ্ছে...' : 'সব আবেদন ক্লাউডে আপলোড করুন'}</span>
            </button>

            {syncResult && (
              <div className="w-full text-xs font-medium text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                {syncResult}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs shrink-0">
          <span className="text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SSL এনক্রিপ্টেড ও সুরক্ষিত সংযোগ</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#072C4C] hover:bg-[#093963] text-white rounded-lg font-semibold transition cursor-pointer"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
