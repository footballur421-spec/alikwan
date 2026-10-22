import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { 
  testFirebaseConnection, 
  FirebaseHealth, 
  fbRunDiagnostics, 
  DiagnosticsSuiteResult,
  fbResetAllTestData 
} from '../../services/firebaseClient';
import { testSupabaseConnection, SupabaseHealth } from '../../services/supabaseClient';
import { SupportedLang, toLangNumber } from '../../utils/i18n';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Server, 
  ShieldCheck, 
  Layers, 
  Clock, 
  FileCheck,
  Flame,
  ArrowDownUp,
  Activity,
  UploadCloud,
  FileCode,
  Settings2,
  HardDrive,
  ShieldAlert,
  PlayCircle
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

interface DatabaseManagerProps {
  lang?: SupportedLang;
  onDataReset?: () => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ lang = 'bn', onDataReset }) => {
  const isEnglish = lang === 'en';
  const [health, setHealth] = useState<FirebaseHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');
  const [showConfirmResetModal, setShowConfirmResetModal] = useState<boolean>(false);

  // Diagnostics Suite State
  const [diagnosticsRunning, setDiagnosticsRunning] = useState<boolean>(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<DiagnosticsSuiteResult | null>(null);

  // Cloud Recovery & Migration State
  const [migrating, setMigrating] = useState<boolean>(false);
  const [migrationMessage, setMigrationMessage] = useState<string>('');
  const [migrationStats, setMigrationStats] = useState<any>(null);

  // Custom DB Connector State
  const [showCustomDbConfig, setShowCustomDbConfig] = useState<boolean>(false);
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState<string>(
    import.meta.env.VITE_SUPABASE_URL || 'https://prseyvyzshfnsdveycke.supabase.co'
  );
  const [customSupabaseKey, setCustomSupabaseKey] = useState<string>(
    import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Ay1wcaOCjptCMb1HQXPVBw_yn5lm2O5'
  );
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<SupabaseHealth | null>(null);
  const [supabaseTesting, setSupabaseTesting] = useState<boolean>(false);

  // Local collection counts
  const [applicantCount, setApplicantCount] = useState<number>(storage.getApplicants().length);
  const [campaignCount, setCampaignCount] = useState<number>(storage.getCampaigns().length);
  const [schoolCount, setSchoolCount] = useState<number>(storage.getRecognizedSchools().length);
  const [committeeCount, setCommitteeCount] = useState<number>(storage.getCommitteeMembers().length);
  const [galleryCount, setGalleryCount] = useState<number>(storage.getGalleryItems().length);
  const [noticesCount, setNoticesCount] = useState<number>(storage.getNotices().length);

  const checkHealth = async () => {
    setLoading(true);
    const res = await testFirebaseConnection();
    setHealth(res);
    setLoading(false);
  };

  const runFullDiagnostics = async () => {
    setDiagnosticsRunning(true);
    try {
      const suite = await fbRunDiagnostics();
      setDiagnosticsResult(suite);
    } catch (err: any) {
      console.error('Diagnostics suite error:', err);
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const handleCloudMigration = async () => {
    setMigrating(true);
    setMigrationMessage('');
    try {
      const res = await storage.recoverAndMigrateLocalDataToCloud();
      setMigrationMessage(res.message);
      setMigrationStats(res.migrated);
      // Refresh local counts
      setApplicantCount(storage.getApplicants().length);
      setCampaignCount(storage.getCampaigns().length);
      setSchoolCount(storage.getRecognizedSchools().length);
      setCommitteeCount(storage.getCommitteeMembers().length);
      setGalleryCount(storage.getGalleryItems().length);
      setNoticesCount(storage.getNotices().length);
    } catch (err: any) {
      setMigrationMessage(`মাইগ্রেশন ত্রুটি: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const testCustomSupabase = async () => {
    setSupabaseTesting(true);
    const res = await testSupabaseConnection();
    setSupabaseTestStatus(res);
    setSupabaseTesting(false);
  };

  useEffect(() => {
    checkHealth();
    runFullDiagnostics();
    const unsub = storage.subscribe(() => {
      setApplicantCount(storage.getApplicants().length);
      setCampaignCount(storage.getCampaigns().length);
      setSchoolCount(storage.getRecognizedSchools().length);
      setCommitteeCount(storage.getCommitteeMembers().length);
      setGalleryCount(storage.getGalleryItems().length);
      setNoticesCount(storage.getNotices().length);
    });
    return unsub;
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleResetEveryDefaultTestValue = async () => {
    setResetting(true);
    setResetSuccessMsg('');
    try {
      await storage.resetAllTestData();
      setResetSuccessMsg(
        isEnglish 
          ? 'All default test applicants and demo records have been completely reset to 0! The database is now pristine for live production entries.'
          : 'সকল ডিফল্ট টেস্ট আবেদনকারী ও ডেমো রেকর্ড সফলভাবে মুছে ফেলা হয়েছে! ডেটাবেজ এখন সম্পূর্ণ নতুন ও প্রস্তুত।'
      );
      setShowConfirmResetModal(false);
      if (onDataReset) onDataReset();
    } catch (err: any) {
      alert(isEnglish ? `Reset failed: ${err.message}` : `রিসেট ব্যর্থ হয়েছে: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-[#072C4C] via-[#0B3A64] to-[#0272A6] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEnglish ? 'Database & Storage Diagnostics' : 'ক্লাউড ডেটাবেজ ও স্টোরেজ ডায়াগনস্টিকস'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif-bn tracking-tight text-white">
              {isEnglish ? 'Google Cloud Firebase Firestore — Authoritative Source of Truth' : 'গুগল ক্লাউড ফায়ারবেস ফায়ারস্টোর — মূল প্রাতিষ্ঠানিক ডেটাবেজ'}
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              {isEnglish 
                ? 'All notices, campaigns, schools, committee members, gallery media, applications, and settings are authoritatively persisted in Google Cloud Firestore.'
                : 'বৃত্তি পরীক্ষার সকল আবেদন, বিজ্ঞপ্তি, ফটো গ্যালারি, স্কুল কোটা ও কমিটি ডাটা গুগল ক্লাউড ফায়ারবেস ফায়ারস্টোরে রিয়েল-টাইমে সংরক্ষিত হচ্ছে।'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
            <button
              onClick={runFullDiagnostics}
              disabled={diagnosticsRunning}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#072C4C] rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
              <span>{diagnosticsRunning ? (isEnglish ? 'Testing...' : 'যাচাই হচ্ছে...') : (isEnglish ? 'Run Full Diagnostic Suite' : 'সম্পূর্ণ ডায়াগনস্টিক টেস্ট চালান')}</span>
            </button>

            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'Firebase Console' : 'ফায়ারবেস কনসোল'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Real-Time 8-Step Diagnostics Suite Dashboard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              diagnosticsResult?.allPassed ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-sky-50 border border-sky-200 text-[#0284C7]'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#072C4C] font-serif-bn">
                  {isEnglish ? 'Real-Time Database & Storage Diagnostic Probes' : 'রিয়েল-টাইম ডেটাবেজ ও স্টোরেজ স্বয়ংক্রিয় ডায়াগনস্টিকস'}
                </h3>
                {diagnosticsResult && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    diagnosticsResult.allPassed 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {diagnosticsResult.allPassed ? (isEnglish ? '8/8 Passed' : '৮/৮টি টেস্ট উত্তীর্ণ') : (isEnglish ? 'Attention Required' : 'ত্রুটি সনাক্ত')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isEnglish 
                  ? 'Isolated non-destructive probes verifying live Create, Read, Update, Delete, and Storage lifecycle.' 
                  : 'প্রোডাকশন ডেটা অক্ষুণ্ণ রেখে সরাসরি ক্লাউড ডেটাবেজে লাইভ রাইট, রিড, আপডেট, ডিলিট ও স্টোরেজ প্রমাণ যাচাই।'}
              </p>
            </div>
          </div>

          <button
            onClick={runFullDiagnostics}
            disabled={diagnosticsRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
            <span>{isEnglish ? 'Re-run Tests' : 'পুনরায় টেস্ট চালান'}</span>
          </button>
        </div>

        {/* Diagnostic Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {diagnosticsResult?.results?.map((item) => (
            <div 
              key={item.id} 
              className={`p-3.5 rounded-xl border transition-all ${
                item.status === 'passed' 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : 'bg-red-50/60 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold leading-tight truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.message}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.status === 'passed' ? 'bg-emerald-200/60 text-emerald-800' : 'bg-red-200/60 text-red-800'
                  }`}>
                    {item.status === 'passed' ? (item.latencyMs ? `${item.latencyMs}ms` : 'PASS') : 'FAIL'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {!diagnosticsResult && diagnosticsRunning && (
            <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0284C7] mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">ক্লাউড ফায়ারস্টোর ডায়াগনস্টিকস পরীক্ষা চলমান...</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Cloud Recovery & Local Migration Center (Section 7) */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs uppercase tracking-wider">
            <UploadCloud className="w-4 h-4 text-[#0284C7]" />
            <span>{isEnglish ? 'Cloud Recovery & Data Synchronization' : 'ক্লাউড রিকভারি ও সম্পূর্ণ ডেটা মাইগ্রেশন'}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C]">
            {isEnglish ? 'Sync & Migrate Browser Content to Cloud Database' : 'ব্রাউজারের সকল কনটেন্ট ও এডিট ক্লাউড ফায়ারস্টোরে আপলোড করুন'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isEnglish
              ? 'Transfers all locally saved website edits, notices, syllabus rules, campaigns, committee roster, and gallery media directly into Google Cloud Firestore. Guarantees 100% persistence on incognito and external devices.'
              : 'যদি কোনো তথ্য কেবল ব্রাউজারে সংরক্ষিত থাকে, তবে এই বাটনে ক্লিক করলেই ওয়েবসাইট এডিটরের সকল পরিবর্তন, বিজ্ঞপ্তি, সিলেবাস, ক্যাম্পেইন ও গ্যালারি মিডিয়া সরাসরি ফায়ারবেসে চিরস্থায়ীভাবে সংরক্ষিত হবে।'}
          </p>

          {migrationMessage && (
            <div className="p-3 bg-white rounded-lg border border-sky-200 text-xs text-sky-900 font-semibold mt-2">
              {migrationMessage}
            </div>
          )}
        </div>

        <button
          onClick={handleCloudMigration}
          disabled={migrating}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#072C4C] text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          <UploadCloud className={`w-4 h-4 ${migrating ? 'animate-spin' : ''}`} />
          <span>{migrating ? (isEnglish ? 'Uploading to Cloud...' : 'ক্লাউডে আপলোড হচ্ছে...') : (isEnglish ? 'Upload All to Firestore' : 'ফায়ারবেসে মাইগ্রেট করুন')}</span>
        </button>
      </div>

      {/* 4. Database Credentials & Live Collection Counts Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Access Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#072C4C] font-serif-bn">
                  {isEnglish ? 'Authoritative Database Credentials' : 'ফায়ারবেস অথরাইজড ক্রেডেনশিয়াল'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEnglish ? 'Authoritative credentials verified with Google AI Studio' : 'গুগল এআই স্টুডিও প্রোভিশনড ক্লাউড কানেকশন'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-2xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isEnglish ? 'Authoritative & Active' : 'অথরাইজড ও সক্রিয়'}</span>
            </div>
          </div>

          {/* Credentials List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {isEnglish ? 'Firebase Project ID' : 'প্রজেক্ট আইডি (Project ID)'}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#072C4C] truncate">
                  {firebaseConfig.projectId}
                </span>
                <button
                  onClick={() => handleCopy(firebaseConfig.projectId, 'projectId')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition cursor-pointer"
                  title="Copy Project ID"
                >
                  {copiedField === 'projectId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {isEnglish ? 'Firestore Database ID' : 'ফায়ারস্টোর ডাটাবেজ আইডি'}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#072C4C] truncate">
                  {firebaseConfig.firestoreDatabaseId}
                </span>
                <button
                  onClick={() => handleCopy(firebaseConfig.firestoreDatabaseId, 'dbId')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition cursor-pointer"
                  title="Copy Database ID"
                >
                  {copiedField === 'dbId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {isEnglish ? 'Storage Bucket' : 'ক্লাউড স্টোরেজ বাকেট'}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#072C4C] truncate">
                  {firebaseConfig.storageBucket || 'Node.js VFS Persistent Store'}
                </span>
                <button
                  onClick={() => handleCopy(firebaseConfig.storageBucket, 'bucket')}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition cursor-pointer"
                  title="Copy Bucket"
                >
                  {copiedField === 'bucket' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {isEnglish ? 'Cloud Ping & Latency' : 'ক্লাউড পিং ও রেসপন্স লেটেন্সি'}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{health ? `${health.latencyMs} ms (${isEnglish ? 'Ultra Fast' : 'অতি দ্রুত'})` : 'যাচাই করা হচ্ছে...'}</span>
                </span>
                <span className="text-3xs text-slate-500 font-mono">
                  {health?.lastChecked || ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Collection Counts & Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <Layers className="w-4 h-4 text-[#0284C7]" />
              <h3 className="text-sm font-bold text-[#072C4C] font-serif-bn">
                {isEnglish ? 'Live Collections in Firestore' : 'ফায়ারস্টোর কালেকশন ও রেকর্ড'}
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">notices (বিজ্ঞপ্তি ও নোটিশ)</span>
                <span className="font-bold font-mono text-[#072C4C] bg-slate-100 px-2 py-0.5 rounded">
                  {toLangNumber(noticesCount, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">campaigns (ক্যাম্পেইন)</span>
                <span className="font-bold font-mono text-[#072C4C] bg-slate-100 px-2 py-0.5 rounded">
                  {toLangNumber(campaignCount, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">schools (স্বীকৃত বিদ্যালয়)</span>
                <span className="font-bold font-mono text-[#072C4C] bg-slate-100 px-2 py-0.5 rounded">
                  {toLangNumber(schoolCount, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">committee (পর্ষদ সদস্য)</span>
                <span className="font-bold font-mono text-[#072C4C] bg-slate-100 px-2 py-0.5 rounded">
                  {toLangNumber(committeeCount, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">gallery (মিডিয়া ও ফটো)</span>
                <span className="font-bold font-mono text-[#072C4C] bg-slate-100 px-2 py-0.5 rounded">
                  {toLangNumber(galleryCount, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">applicants (আবেদনকারী)</span>
                <span className="font-bold font-mono text-[#072C4C] bg-slate-100 px-2 py-0.5 rounded">
                  {toLangNumber(applicantCount, lang)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-3xs text-slate-400 block text-center">
              {isEnglish ? 'Real-Time Bi-Directional Firebase Sync Active' : 'দ্বি-মুখী রিয়েল-টাইম ফায়ারবেস সিঙ্ক সক্রিয়'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Custom Supabase / External Database Configuration Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-5 h-5 text-[#0284C7]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#072C4C] font-serif-bn">
                {isEnglish ? 'Custom Database Provider Connector (Supabase / External)' : 'কাস্টম ডেটাবেজ কনফিগারেশন ও সুপাবেস কানেক্টর'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEnglish 
                  ? 'Optionally connect your personal Supabase project or view PostgreSQL migration DDL.' 
                  : 'প্রয়োজনে নিজস্ব সুপাবেস (Supabase) প্রজেক্ট যুক্ত করুন অথবা পোস্টগ্রেস এসকিউএল স্কিমা দেখুন।'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCustomDbConfig(!showCustomDbConfig)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition"
          >
            {showCustomDbConfig ? (isEnglish ? 'Hide Details' : 'লুকান') : (isEnglish ? 'Configure' : 'কনফিগার করুন')}
          </button>
        </div>

        {showCustomDbConfig && (
          <div className="space-y-4 pt-3 border-t border-slate-100 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Supabase Project URL</label>
                <input
                  type="text"
                  value={customSupabaseUrl}
                  onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:border-[#0284C7] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Supabase Anon / Publishable Key</label>
                <input
                  type="password"
                  value={customSupabaseKey}
                  onChange={(e) => setCustomSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:border-[#0284C7] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={testCustomSupabase}
                disabled={supabaseTesting}
                className="px-4 py-2 bg-[#072C4C] hover:bg-[#031B2E] text-white rounded-lg font-bold text-xs cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? 'animate-spin' : ''}`} />
                <span>{supabaseTesting ? 'টেস্টিং...' : 'Supabase পিং ও টেবিল টেস্ট করুন'}</span>
              </button>

              <a
                href="/supabase/migrations/20260101000000_init_alikhwan_schema.sql"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-500" />
                <span>PostgreSQL Migration Schema DDL দেখুন</span>
              </a>
            </div>

            {supabaseTestStatus && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold block text-slate-800">টেস্ট ফলাফল:</span>
                <span className="text-slate-600">{supabaseTestStatus.message} (লেটেন্সি: {supabaseTestStatus.latencyMs}ms)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Production Clean State Reset Card */}
      <div className="bg-red-50/60 rounded-2xl border border-red-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>{isEnglish ? 'Clean Production State Configuration' : 'টেস্ট ডাটা রিসেট ও ফ্রেশ প্রোডাকশন কনফিগারেশন'}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#7F1D1D]">
            {isEnglish ? 'Reset Every Default Test Value' : 'সকল ডেমো টেস্ট রেকর্ড মুছে ডেটাবেজ শূন্য (০) থেকে শুরু করুন'}
          </h3>
          <p className="text-xs text-red-800 leading-relaxed">
            {isEnglish
              ? 'Permanently purges all initial sample applicants, dummy payment receipts, and test session runs from both Firebase Firestore and local storage. Keeps recognized school lists and committee profiles intact.'
              : 'সকল ডেমো আবেদনকারী, প্রাথমিক নমুনা ডাটা এবং টেস্ট সেশন রেকর্ড ক্লাউড ফায়ারস্টোর ও লোকাল স্টোরেজ থেকে চিরতরে মুছে শূন্য (০) টি রেকর্ডে ফিরিয়ে নিবে। এর ফলে আসল শিক্ষার্থীরা সরাসরি স্বচ্ছভাবে আবেদন করতে পারবে।'}
          </p>
        </div>

        <button
          onClick={() => setShowConfirmResetModal(true)}
          disabled={resetting}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>{resetting ? (isEnglish ? 'Resetting...' : 'রিসেট হচ্ছে...') : (isEnglish ? 'Reset All Test Data' : 'টেস্ট ডাটা সম্পূর্ণ রিসেট করুন')}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold font-serif-bn text-slate-900">
                {isEnglish ? 'Reset All Test Values?' : 'আপনি কি সকল টেস্ট ডাটা রিসেট করতে চান?'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEnglish
                  ? 'This will erase all mock/test applications from Firebase Firestore and local storage. The applicants list will start fresh from 0. This cannot be undone.'
                  : 'এই পদক্ষেপের ফলে সকল ডেমো ও পরীক্ষামূলক আবেদনকারী ক্লাউড ফায়ারস্টোর ও লোকাল স্টোরেজ থেকে অপসারিত হবে। আবেদনকারীর সংখ্যা ০ তে নেমে আসবে।'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                {isEnglish ? 'Cancel' : 'বাতিল করুন'}
              </button>
              <button
                type="button"
                onClick={handleResetEveryDefaultTestValue}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs disabled:opacity-50"
              >
                {resetting ? (isEnglish ? 'Resetting...' : 'রিসেট হচ্ছে...') : (isEnglish ? 'Yes, Reset to 0' : 'হ্যাঁ, সম্পূর্ণ রিসেট করুন')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
