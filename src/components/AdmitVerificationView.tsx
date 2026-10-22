import React, { useState, useEffect } from 'react';
import { INSTITUTION, Applicant } from '../types';
import { storage } from '../services/storage';
import { SupportedLang, toLangNumber } from '../utils/i18n';
import { CheckCircle2, XCircle, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface AdmitVerificationViewProps {
  initialToken?: string;
  initialAppNo?: string;
  lang?: SupportedLang;
}

export const AdmitVerificationView: React.FC<AdmitVerificationViewProps> = ({
  initialToken,
  initialAppNo,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [tokenInput, setTokenInput] = useState(initialToken || initialAppNo || '');
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    if (initialAppNo || initialToken) {
      handleVerify(initialAppNo || initialToken || '');
    }
  }, [initialAppNo, initialToken]);

  const handleVerify = (query: string) => {
    setIsSearched(true);
    const clean = query.trim().toUpperCase();
    if (!clean) {
      setApplicant(null);
      return;
    }

    const all = storage.getApplicants();
    const found = all.find(a => 
      a.applicationNo.toUpperCase() === clean || 
      (a.admitCardNo && a.admitCardNo.toUpperCase() === clean) ||
      (a.rollNumber && a.rollNumber === clean) ||
      clean.includes(a.applicationNo.toUpperCase()) ||
      a.applicationNo.toUpperCase().includes(clean)
    );

    setApplicant(found || null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(tokenInput);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
          {isEnglish ? 'Official Document Verification' : 'দাপ্তরিক সত্যতা যাচাই'}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif-bn text-[#072C4C]">
          {isEnglish ? 'Admit Card Online Verification Portal' : 'প্রবেশপত্র সত্যতা যাচাই পোর্টাল'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isEnglish
            ? 'Scan the QR code printed on the admit card or enter the Application ID / Roll Number to verify institutional authenticity.'
            : 'প্রবেশপত্রের QR কোড স্ক্যান করে অথবা আবেদন/রোল নম্বর লিখে প্রবেশপত্রের সঠিকতা যাচাই করুন'}
        </p>
      </div>

      {/* Input box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={isEnglish ? 'Enter App ID / Roll No / Verification Token' : 'আবেদন নং / প্রবেশপত্র নং / রোল নং'}
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm uppercase bg-white focus:border-[#0284C7] font-mono"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Search className="w-4 h-4 text-white" />
            <span>{isEnglish ? 'Verify Document' : 'যাচাই করুন'}</span>
          </button>
        </form>
      </div>

      {/* Result Verification Card */}
      {isSearched && (
        applicant ? (
          applicant.admitCardIssued && applicant.status === 'approved' ? (
            <div className="bg-white rounded-2xl border-4 border-[#072C4C] p-6 sm:p-8 space-y-5 shadow-md relative overflow-hidden">
              <div className="absolute inset-1.5 border border-[#DC2626] rounded-xl pointer-events-none" />

              <div className="border-b border-slate-200 pb-4 text-center space-y-2 relative z-10">
                <div className="flex justify-center">
                  <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-lg">
                    <Logo className="w-full h-full" />
                  </div>
                </div>
                <div>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isEnglish ? 'AUTHENTIC & VERIFIED ADMIT CARD' : 'বৈধ ও অনুমোদিত প্রবেশপত্র'}</span>
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C] pt-2">
                    {isEnglish ? 'Al-Ikhwan Primary & Ebtedayee Scholarship Examination 2026' : INSTITUTION.examName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isEnglish ? INSTITUTION.englishName : INSTITUTION.name} ({isEnglish ? 'Reg. No: 299' : `রেজি নং: ${INSTITUTION.regNo}`})
                  </p>
                </div>
              </div>

              {/* Minimal Privacy-Preserved Details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs relative z-10">
                <div className="p-3 bg-slate-50 flex justify-between border-b border-slate-200">
                  <span className="text-slate-500">{isEnglish ? 'Candidate Name:' : 'শিক্ষার্থীর নাম:'}</span>
                  <strong className="text-[#072C4C]">{isEnglish ? (applicant.nameEn || applicant.nameBn) : applicant.nameBn}</strong>
                </div>
                <div className="p-3 bg-white flex justify-between border-b border-slate-200">
                  <span className="text-slate-500">{isEnglish ? 'Examination Roll No:' : 'পরীক্ষার রোল নম্বর:'}</span>
                  <strong className="font-mono text-[#072C4C] font-bold text-sm">{applicant.rollNumber}</strong>
                </div>
                <div className="p-3 bg-slate-50 flex justify-between border-b border-slate-200">
                  <span className="text-slate-500">{isEnglish ? 'Class:' : 'শ্রেণি:'}</span>
                  <span className="text-[#072C4C] font-semibold">{applicant.className}</span>
                </div>
                <div className="p-3 bg-white flex justify-between border-b border-slate-200">
                  <span className="text-slate-500">{isEnglish ? 'Institution:' : 'বিদ্যালয় / মাদ্রাসা:'}</span>
                  <span className="text-[#072C4C]">{applicant.schoolName}</span>
                </div>
                <div className="p-3 bg-slate-50 flex justify-between border-b border-slate-200">
                  <span className="text-slate-500">{isEnglish ? 'Allocated Exam Center:' : 'অনুমোদিত পরীক্ষাকেন্দ্র:'}</span>
                  <span className="font-bold text-[#0284C7]">{applicant.examCenter}</span>
                </div>
                <div className="p-3 bg-white flex justify-between">
                  <span className="text-slate-500">{isEnglish ? 'Verification Status:' : 'যাচাইয়ের স্থিতি:'}</span>
                  <span className="text-emerald-700 font-bold">{isEnglish ? 'Verified & Active in Council Database' : 'অনুমোদিত ও সচল'}</span>
                </div>
              </div>

              <p className="text-2xs text-slate-500 text-center relative z-10">
                {isEnglish
                  ? '* Student personal contact information is protected in compliance with data privacy policies.'
                  : '* শিক্ষার্থীর ব্যক্তিগত গোপনীয়তার স্বার্থে কোনো প্রকার মোবাইল নম্বর বা পূর্ণ জন্মতারিখ প্রকাশ করা হয় না।'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 text-center space-y-3 shadow-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
                {isEnglish ? 'Admit Card Not Yet Issued' : 'প্রবেশপত্র প্রস্তুত বা অনুমোদিত নয়'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isEnglish
                  ? `This application currently holds status: ${applicant.status}. Admit cards are valid only once approved by the Examination Committee.`
                  : `এই আবেদনটির বর্তমান স্ট্যাটাস: ${applicant.status === 'rejected' ? 'বাতিল' : 'যাচাইাধীন'}। পরীক্ষা কমিটি কর্তৃক অনুমোদিত না হওয়া পর্যন্ত প্রবেশপত্র কার্যকর বলে গণ্য হবে না।`}
              </p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8 text-center space-y-3 shadow-xs">
            <XCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="text-base font-bold text-red-600 font-serif-bn">
              {isEnglish ? 'Invalid or Unrecognized Admit Card' : 'অবৈধ বা অস্তিত্বহীন প্রবেশপত্র'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {isEnglish
                ? 'No matching admit card or application record found in the central examination database for this query.'
                : 'প্রদত্ত টোকেন বা আবেদন নম্বরের বিপরীতে কেন্দ্রীয় ডেটাবেসে কোনো বৈধ প্রবেশপত্রের রেকর্ড পাওয়া যায়নি।'}
            </p>
          </div>
        )
      )}
    </div>
  );
};
