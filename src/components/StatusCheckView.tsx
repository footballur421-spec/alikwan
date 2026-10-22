import React, { useState } from 'react';
import { Applicant, ExamSettings } from '../types';
import { storage } from '../services/storage';
import { convertToBengaliNumber } from '../utils/validation';
import { SupportedLang, toLangNumber, t } from '../utils/i18n';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard, 
  Award, 
  Printer, 
  AlertCircle, 
  ArrowRight,
  User,
  School,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface StatusCheckViewProps {
  settings: ExamSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectApplicant: (applicant: Applicant) => void;
  lang?: SupportedLang;
}

export const StatusCheckView: React.FC<StatusCheckViewProps> = ({
  settings,
  setActiveTab,
  onSelectApplicant,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [appNoInput, setAppNoInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [foundApplicant, setFoundApplicant] = useState<Applicant | null>(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    if (!appNoInput.trim()) {
      setSearchError(isEnglish ? 'Please enter Application Number or Roll Number' : 'অনুগ্রহ করে আবেদন নম্বর বা রোল নম্বর লিখুন');
      setFoundApplicant(null);
      return;
    }

    const app = storage.getApplicantByNo(appNoInput, mobileInput || undefined);
    if (!app) {
      setFoundApplicant(null);
      setSearchError(
        isEnglish
          ? 'No record found with the given Application Number. Please check and try again.'
          : 'প্রদত্ত আবেদন নম্বরের কোনো রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বরটি লিখুন।'
      );
    } else {
      setFoundApplicant(app);
      onSelectApplicant(app);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
          {isEnglish ? 'Online Tracking Portal' : 'অনলাইন ট্র্যাকিং পোর্টাল'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#072C4C]">
          {isEnglish ? 'Application Status & Tracking' : 'আবেদনের অবস্থা ও ট্র্যাকিং'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isEnglish
            ? 'Enter your Application ID (e.g. ALIKH-2026-00101) to verify current review status, confirm payment, or retrieve your admit card.'
            : 'আপনার আবেদন নম্বর (যেমন: ALIKH-2026-00101) প্রদান করে বর্তমান অবস্থা, ফি যাচাই ও প্রবেশপত্র ডাউনলোড করুন'}
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1.5">
                {isEnglish ? 'Application ID / Roll Number' : 'আবেদন নম্বর / রোল নম্বর'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ALIKH-2026-00101"
                value={appNoInput}
                onChange={e => setAppNoInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm uppercase bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-sky-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1.5">
                {isEnglish ? 'Registered Mobile Number (Optional)' : 'নিবন্ধিত মোবাইল নম্বর (ঐচ্ছিক নিরাপত্তা যাচাই)'}
              </label>
              <input
                type="tel"
                placeholder="017XXXXXXXX"
                value={mobileInput}
                onChange={e => setMobileInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-sky-500/20 font-mono"
              />
            </div>
          </div>

          {searchError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{searchError}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              <span>{isEnglish ? 'Search Application' : 'অবস্থা অনুসন্ধান করুন'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* APPLICANT DASHBOARD RESULT */}
      {foundApplicant && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Top Identifier & Status Indicators */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <span className="text-2xs text-slate-500 uppercase font-mono block">
                {isEnglish ? 'Application ID' : 'আবেদন নম্বর (Application ID)'}
              </span>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#0284C7]">
                  {foundApplicant.applicationNo}
                </h2>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {foundApplicant.status === 'approved' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEnglish ? 'Application Approved' : 'আবেদন অনুমোদিত (Approved)'}</span>
                </span>
              )}
              {foundApplicant.status === 'submitted' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isEnglish ? 'Under Review' : 'প্রাথমিক যাচাইাধীন (Under Review)'}</span>
                </span>
              )}
              {foundApplicant.status === 'under_review' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 font-bold border border-sky-200">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isEnglish ? 'Review in Progress' : 'কমিটি কর্তৃক যাচাই চলছে'}</span>
                </span>
              )}
              {foundApplicant.status === 'rejected' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>{isEnglish ? 'Application Rejected' : 'আবেদন বাতিলকৃত'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Visual Step-by-Step Progress Pipeline */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5">
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              {isEnglish ? 'Application Progress Pipeline' : 'আবেদন অগ্রগতি পাইপলাইন'}
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1.5">
                <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  ✓
                </div>
                <span className="block font-semibold text-slate-800 text-2xs sm:text-xs">
                  {isEnglish ? 'Submitted' : 'আবেদন দাখিল'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                  foundApplicant.status === 'approved' || foundApplicant.status === 'under_review'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {foundApplicant.status === 'approved' ? '✓' : (isEnglish ? '2' : '২')}
                </div>
                <span className="block font-semibold text-slate-800 text-2xs sm:text-xs">
                  {isEnglish ? 'Data Verification' : 'তথ্য যাচাই'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                  foundApplicant.paymentStatus === 'paid'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  {foundApplicant.paymentStatus === 'paid' ? '✓' : (isEnglish ? '3' : '৩')}
                </div>
                <span className="block font-semibold text-slate-800 text-2xs sm:text-xs">
                  {isEnglish ? 'Fee Confirmed' : 'ফি নিশ্চিতকরণ'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                  foundApplicant.admitCardIssued
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  {foundApplicant.admitCardIssued ? '✓' : (isEnglish ? '4' : '৪')}
                </div>
                <span className="block font-semibold text-slate-800 text-2xs sm:text-xs">
                  {isEnglish ? 'Admit Card Ready' : 'প্রবেশপত্র প্রস্তুত'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/80">
            {/* Candidate Photo */}
            <div className="flex flex-col items-center justify-center sm:border-r border-slate-200 sm:pr-4">
              <img
                src={foundApplicant.photoUrl}
                alt={foundApplicant.nameBn}
                className="w-24 h-24 object-cover rounded-xl border-2 border-slate-300 shadow-2xs bg-white"
              />
              <span className="text-2xs text-slate-500 mt-1.5 font-medium">{isEnglish ? 'Student Photo' : 'শিক্ষার্থীর ছবি'}</span>
            </div>

            {/* Candidate details */}
            <div className="sm:col-span-2 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">{isEnglish ? 'Name (Bengali):' : 'শিক্ষার্থীর নাম (বাংলা):'}</span>
                <span className="font-bold text-[#072C4C] text-sm">{foundApplicant.nameBn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">{isEnglish ? 'Name (English):' : 'Name (English):'}</span>
                <span className="font-semibold text-slate-800 font-mono">{foundApplicant.nameEn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">{isEnglish ? 'Class & Category:' : 'শ্রেণি ও বিভাগ:'}</span>
                <span className="font-bold text-[#0284C7]">
                  {foundApplicant.className} ({isEnglish ? (foundApplicant.gender === 'ছাত্র' ? 'Boy' : 'Girl') : foundApplicant.gender})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">{isEnglish ? 'Institution:' : 'বিদ্যালয় / মাদ্রাসা:'}</span>
                <span className="font-semibold text-slate-800">{foundApplicant.schoolName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/70 pb-1.5">
                <span className="text-slate-500">{isEnglish ? "Father's Name:" : 'পিতার নাম:'}</span>
                <span className="text-slate-800 font-medium">{foundApplicant.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isEnglish ? 'Mobile Number:' : 'মোবাইল নম্বর:'}</span>
                <span className="font-mono font-medium text-slate-800">{toLangNumber(foundApplicant.mobile, lang)}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {foundApplicant.admitCardIssued ? (
                <button
                  onClick={() => {
                    onSelectApplicant(foundApplicant);
                    setActiveTab('admit');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <Award className="w-4 h-4" />
                  <span>{isEnglish ? 'Download Admit Card PDF' : 'প্রবেশপত্র ডাউনলোড করুন'}</span>
                </button>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  {isEnglish ? 'Admit Card pending verification' : 'প্রবেশপত্র এখনও প্রস্তুত হয়নি'}
                </div>
              )}

              {settings.isFeeRequired && foundApplicant.paymentStatus === 'unpaid' && (
                <button
                  onClick={() => {
                    onSelectApplicant(foundApplicant);
                    setActiveTab('payment');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isEnglish ? 'Pay Examination Fee' : 'ফি পরিশোধ করুন'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isEnglish ? 'Print Status' : 'প্রিন্ট করুন'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
