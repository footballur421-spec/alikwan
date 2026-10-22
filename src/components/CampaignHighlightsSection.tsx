import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { storage } from '../services/storage';
import { ActiveTab } from './Navbar';
import { 
  Award, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  HeartHandshake, 
  Trees, 
  GraduationCap, 
  ShieldCheck 
} from 'lucide-react';
import { convertToBengaliNumber } from '../utils/validation';
import { formatLangDateTime, formatLangDate } from '../utils/i18n';

interface CampaignHighlightsSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
  lang?: 'bn' | 'en';
}

export const CampaignHighlightsSection: React.FC<CampaignHighlightsSectionProps> = ({
  setActiveTab,
  lang = 'bn'
}) => {
  const isEnglish = lang === 'en';
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storage.getCampaigns());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCampaigns(storage.getCampaigns());
    });
    return unsub;
  }, []);

  const getCategoryIcon = (category: string) => {
    if (category.includes('বৃত্তি') || category.includes('শিক্ষা')) {
      return <GraduationCap className="w-4 h-4 text-[#0284C7]" />;
    }
    if (category.includes('ত্রাণ') || category.includes('শীতবস্ত্র') || category.includes('সহায়তা')) {
      return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
    }
    if (category.includes('পরিবেশ') || category.includes('বৃক্ষ')) {
      return <Trees className="w-4 h-4 text-green-600" />;
    }
    return <Award className="w-4 h-4 text-amber-600" />;
  };

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-2xs font-bold text-[#0284C7] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{isEnglish ? 'Institutional Milestones & Impact' : 'সংস্থার সকল কর্মসূচি ও সার্বিক অর্জন'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-bn text-[#072C4C]">
            {isEnglish ? 'Active Campaign Highlights & Showcase' : 'সকল কর্মসূচির হাইলাইটস ও সাম্প্রতিক কার্যক্রম'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isEnglish
              ? 'Comprehensive highlights of Al-Ikhwan\'s scholarship exams, humanitarian winter relief, environmental tree plantation, and student welfare initiatives.'
              : 'আল-ইখওয়ান পরিচালিত মেধা বৃত্তি পরীক্ষা, দরিদ্র পরিবারে শীতবস্ত্র বিতরণ, সবুজায়ন বৃক্ষরোপণ এবং শিক্ষার্থী কল্যাণমূলক সকল উদ্যোগের আকর্ষণীয় হাইলাইটস।'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('campaigns');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="self-start sm:self-end px-4 py-2 border border-slate-200 hover:border-[#0284C7] text-slate-700 hover:text-[#0284C7] bg-slate-50 hover:bg-sky-50/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>{isEnglish ? 'All Programs List' : 'সকল কর্মসূচি তালিকা'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((camp) => {
          const isFeatured = camp.isFeaturedOnHome;
          const isExam = camp.campaignType === 'exam' || camp.id.includes('scholarship');

          return (
            <div
              key={camp.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-slate-50/50 hover:shadow-md ${
                isFeatured
                  ? 'border-[#0284C7]/60 ring-1 ring-[#0284C7]/20 bg-white'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Top Badge & Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/80 text-2xs font-bold text-[#072C4C]">
                    {getCategoryIcon(camp.category)}
                    <span>{camp.category}</span>
                  </div>

                  {isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{isEnglish ? 'Featured' : 'চলতি প্রধান কর্মসূচি'}</span>
                    </span>
                  )}
                </div>

                {/* Campaign Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C] leading-snug">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {camp.shortDescription || camp.fullDescription}
                  </p>
                </div>

                {/* Highlights List */}
                {camp.highlights && camp.highlights.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                    <span className="text-3xs font-bold text-[#0284C7] uppercase tracking-wider block">
                      {isEnglish ? 'Key Highlights:' : 'কর্মসূচির প্রধান আকর্ষণ ও হাইলাইটস:'}
                    </span>
                    <ul className="space-y-1.5">
                      {camp.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-2xs text-slate-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Important Dates / Parameters Pills */}
                <div className="grid grid-cols-2 gap-2 text-2xs">
                  {camp.applicationStartDate && (
                    <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200/60">
                      <span className="text-3xs text-slate-500 block">
                        {isEnglish ? 'Application Period' : 'আবেদনের সময়'}
                      </span>
                      <strong className="text-slate-800 font-mono block truncate mt-0.5">
                        {formatLangDate(camp.applicationStartDate, lang)} – {formatLangDate(camp.applicationEndDate, lang)}
                      </strong>
                    </div>
                  )}

                  {camp.admitCardAvailableDate && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/70">
                      <span className="text-3xs text-amber-800 font-bold block">
                        {isEnglish ? 'Admit Card Date' : 'প্রবেশপত্র উন্মুক্ত'}
                      </span>
                      <strong className="text-[#072C4C] block truncate mt-0.5 text-3xs font-mono font-bold">
                        {formatLangDateTime(camp.admitCardAvailableDate, lang)}
                      </strong>
                    </div>
                  )}

                  {camp.examDate && !camp.admitCardAvailableDate && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/70">
                      <span className="text-3xs text-emerald-800 font-bold block">
                        {isEnglish ? 'Date' : 'নির্ধারিত তারিখ'}
                      </span>
                      <strong className="text-[#072C4C] block truncate mt-0.5 text-3xs font-bold">
                        {camp.examDate}
                      </strong>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200/60">
                    <span className="text-3xs text-slate-500 block">
                      {isEnglish ? 'Fee & Quota' : 'ফি ও কোটা'}
                    </span>
                    <strong className="text-slate-800 font-mono block truncate mt-0.5">
                      {camp.isFeeRequired ? `৳${convertToBengaliNumber(camp.feeAmount)} টাকা` : 'ফি সম্পূর্ণ মওকুফ'}
                      {camp.maxStudentsPerSchool ? ` (সর্বোচ্চ ${convertToBengaliNumber(camp.maxStudentsPerSchool)} জন)` : ''}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isExam ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('apply');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <span>{isEnglish ? 'Apply Online' : 'অনলাইন আবেদন করুন'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('campaigns');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-[#072C4C] hover:bg-[#041B2D] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <span>{isEnglish ? 'View Program' : 'কর্মসূচি বিস্তারিত'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isExam && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admit');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <span>{isEnglish ? 'Admit Card' : 'প্রবেশপত্র'}</span>
                    </button>
                  )}
                </div>

                {camp.documents && camp.documents.length > 0 && (
                  <a
                    href={camp.documents[0].fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={camp.documents[0].fileName}
                    className="text-2xs text-[#0284C7] hover:underline font-semibold flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>নীতিমালা (PDF)</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
