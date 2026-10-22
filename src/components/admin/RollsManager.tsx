import React, { useState } from 'react';
import { SchoolCategory, CategoryRollConfig, INITIAL_CATEGORY_ROLL_CONFIGS } from '../../types';
import { storage } from '../../services/storage';
import { convertToBengaliNumber } from '../../utils/validation';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  RefreshCw,
  Hash,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const RollsManager: React.FC = () => {
  const [configs, setConfigs] = useState<Record<SchoolCategory, CategoryRollConfig>>(storage.getRollConfigs());
  const [applicants, setApplicants] = useState(storage.getApplicants());
  const [successMessage, setSuccessMessage] = useState('');

  const refreshData = () => {
    setConfigs(storage.getRollConfigs());
    setApplicants(storage.getApplicants());
  };

  const getStats = (category: SchoolCategory) => {
    const list = applicants.filter(a => a.schoolCategory === category && a.rollNumber);
    const rolls = list.map(a => parseInt(a.rollNumber as string, 10)).filter(n => !isNaN(n));
    const base = configs[category]?.initialRoll || INITIAL_CATEGORY_ROLL_CONFIGS[category].initialRoll;
    const highest = rolls.length > 0 ? Math.max(...rolls) : null;
    const nextRoll = highest ? highest + 1 : base;

    return {
      totalAssigned: list.length,
      highestRoll: highest,
      nextRoll,
      baseRoll: base
    };
  };

  const priStats = getStats('primary');
  const kgStats = getStats('kindergarten');
  const madStats = getStats('madrasa');

  // Overlap detection
  const hasOverlap = 
    priStats.nextRoll >= configs.kindergarten.initialRoll || 
    kgStats.nextRoll >= configs.madrasa.initialRoll;

  const handleInitialRollChange = (category: SchoolCategory, val: number) => {
    setConfigs(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        initialRoll: val
      }
    }));
  };

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveRollConfigs(configs);
    setSuccessMessage('রোল নম্বর কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            সেকশন ৬: তিনটি স্বতন্ত্র ক্যাটাগরি ও রোল নম্বর ক্রম
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C]">
            ক্যাটাগরি রোল নম্বর বরাদ্দকরণ ও ক্রমধারা
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সরকারি প্রাথমিক (২৮২১+), কিন্ডারগার্টেন (৩০০১+) ও ইবতেদায়ী/মাদ্রাসা (৩২০১+) ক্যাটাগরির ধারাবাহিক রোল বরাদ্দ।
          </p>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>রোল পরিসংখ্যান রিফ্রেশ</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {hasOverlap && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">সতর্কতা: ক্যাটাগরি রোল সীমার মধ্যে সম্ভাব্য ওভারল্যাপ শনাক্ত হয়েছে!</strong>
            কোনো একটি ক্যাটাগরির বর্তমান সর্বোচ্চ বরাদ্দ পরবর্তী ক্যাটাগরির প্রারম্ভিক রোল নম্বরের কাছাকাছি পৌঁছে গেছে। ওভারল্যাপ এড়াতে পরবর্তী ক্যাটাগরির প্রারম্ভিক রোল পরিবর্তন করুন।
          </div>
        </div>
      )}

      {/* 3 Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Category 1: Primary */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-2xs font-bold">
              ক্যাটাগরি ০১
            </span>
            <span className="text-2xs font-mono text-slate-400">সরকারি প্রাথমিক</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
              সরকারি প্রাথমিক বিদ্যালয়
            </h3>
            <p className="text-xs text-slate-500">
              প্রাথমিক বিদ্যালয়ের ৫ম শ্রেণির নিয়মিত শিক্ষার্থীদের জন্য নির্ধারিত রোল ক্রম।
            </p>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">প্রারম্ভিক রোল:</span>
              <strong className="font-mono text-[#072C4C] text-sm">{priStats.baseRoll}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">বরাদ্দকৃত শিক্ষার্থী:</span>
              <span className="font-mono font-bold text-[#0284C7]">{convertToBengaliNumber(priStats.totalAssigned)} জন</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">সর্বোচ্চ বরাদ্দকৃত রোল:</span>
              <span className="font-mono font-bold text-slate-700">{priStats.highestRoll ? priStats.highestRoll : 'বরাদ্দ হয়নি'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[#072C4C]">
              <span className="font-semibold">পরবর্তী স্বয়ংক্রিয় রোল:</span>
              <strong className="font-mono text-emerald-700 text-sm">{priStats.nextRoll}</strong>
            </div>
          </div>
        </div>

        {/* Category 2: Kindergarten */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-2xs font-bold">
              ক্যাটাগরি ০২
            </span>
            <span className="text-2xs font-mono text-slate-400">কিন্ডারগার্টেন</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
              কিন্ডারগার্টেন
            </h3>
            <p className="text-xs text-slate-500">
              কেজি ও আইডিয়াল একাডেমি প্রতিষ্ঠানের ৫ম শ্রেণির শিক্ষার্থীদের জন্য নির্ধারিত রোল।
            </p>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">প্রারম্ভিক রোল:</span>
              <strong className="font-mono text-[#072C4C] text-sm">{kgStats.baseRoll}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">বরাদ্দকৃত শিক্ষার্থী:</span>
              <span className="font-mono font-bold text-purple-700">{convertToBengaliNumber(kgStats.totalAssigned)} জন</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">সর্বোচ্চ বরাদ্দকৃত রোল:</span>
              <span className="font-mono font-bold text-slate-700">{kgStats.highestRoll ? kgStats.highestRoll : 'বরাদ্দ হয়নি'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[#072C4C]">
              <span className="font-semibold">পরবর্তী স্বয়ংক্রিয় রোল:</span>
              <strong className="font-mono text-emerald-700 text-sm">{kgStats.nextRoll}</strong>
            </div>
          </div>
        </div>

        {/* Category 3: Madrasa */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-bold">
              ক্যাটাগরি ০৩
            </span>
            <span className="text-2xs font-mono text-slate-400">ইবতেদায়ী মাদ্রাসা</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
              ইবতেদায়ী / মাদ্রাসা
            </h3>
            <p className="text-xs text-slate-500">
              সকল স্বতন্ত্র ও সংযুক্ত ইবতেদায়ী মাদ্রাসার ৫ম শ্রেণির শিক্ষার্থীদের রোল ক্রম।
            </p>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">প্রারম্ভিক রোল:</span>
              <strong className="font-mono text-[#072C4C] text-sm">{madStats.baseRoll}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">বরাদ্দকৃত শিক্ষার্থী:</span>
              <span className="font-mono font-bold text-emerald-800">{convertToBengaliNumber(madStats.totalAssigned)} জন</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">সর্বোচ্চ বরাদ্দকৃত রোল:</span>
              <span className="font-mono font-bold text-slate-700">{madStats.highestRoll ? madStats.highestRoll : 'বরাদ্দ হয়নি'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[#072C4C]">
              <span className="font-semibold">পরবর্তী স্বয়ংক্রিয় রোল:</span>
              <strong className="font-mono text-emerald-700 text-sm">{madStats.nextRoll}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Starting Roll Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Hash className="w-4 h-4 text-[#0284C7]" />
          <h3 className="text-sm font-bold text-[#072C4C] font-serif-bn">
            প্রারম্ভিক রোল নম্বর সেটিংস সম্পাদনা (Admin Config)
          </h3>
        </div>

        <form onSubmit={handleSaveConfigs} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                সরকারি প্রাথমিক বিদ্যালয়ের প্রারম্ভিক রোল
              </label>
              <input
                type="number"
                value={configs.primary.initialRoll}
                onChange={e => handleInitialRollChange('primary', parseInt(e.target.value, 10) || 2821)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm"
                required
              />
              <span className="text-2xs text-slate-500 mt-0.5 block">ডিফল্ট: 2821</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                কিন্ডারগার্টেনের প্রারম্ভিক রোল
              </label>
              <input
                type="number"
                value={configs.kindergarten.initialRoll}
                onChange={e => handleInitialRollChange('kindergarten', parseInt(e.target.value, 10) || 3001)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm"
                required
              />
              <span className="text-2xs text-slate-500 mt-0.5 block">ডিফল্ট: 3001</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                ইবতেদায়ী মাদ্রাসার প্রারম্ভিক রোল
              </label>
              <input
                type="number"
                value={configs.madrasa.initialRoll}
                onChange={e => handleInitialRollChange('madrasa', parseInt(e.target.value, 10) || 3201)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-sm"
                required
              />
              <span className="text-2xs text-slate-500 mt-0.5 block">ডিফল্ট: 3201</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-2xs text-slate-600 border border-slate-100">
            <strong>লক্ষ্য করুন:</strong> প্রারম্ভিক রোল নম্বর পরিবর্তন করলে নতুন আবেদন মঞ্জুরির সময় নতুন ক্রম অনুযায়ী রোল বরাদ্দ হবে। ইতিমধ্যে বরাদ্দকৃত আবেদনকারীদের রোল অপরিবর্তিত থাকবে।
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>রোল কনফিগারেশন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
