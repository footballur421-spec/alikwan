import React, { useState, useEffect } from 'react';
import { Campaign, ExamSettings, INSTITUTION } from '../types';
import { storage } from '../services/storage';
import { ActiveTab } from './Navbar';
import { calculateCampaignStatus, convertToBengaliNumber } from '../utils/validation';
import { SupportedLang, toLangNumber, formatLangDate } from '../utils/i18n';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  ArrowRight, 
  Award, 
  Building2, 
  CreditCard,
  Download,
  Users
} from 'lucide-react';

interface CampaignsViewProps {
  settings: ExamSettings;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCampaignId?: string;
  lang?: SupportedLang;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  settings,
  setActiveTab,
  selectedCampaignId,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storage.getCampaigns());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCampaigns(storage.getCampaigns());
    });
    return unsub;
  }, []);

  const featured = campaigns.find(c => c.isFeaturedOnHome) || campaigns[0];
  const [activeCampaignId, setActiveCampaignId] = useState<string>(
    selectedCampaignId || featured?.id || campaigns[0]?.id || 'camp-2026-scholarship'
  );

  const selectedCampaign = campaigns.find(c => c.id === activeCampaignId) || featured || campaigns[0];
  const campaignStatus = selectedCampaign ? calculateCampaignStatus(selectedCampaign) : null;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Header & Introduction */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] text-2xs sm:text-xs font-semibold border border-sky-100">
            <Award className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{isEnglish ? 'Institutional Programs & Special Campaigns' : 'সংস্থার কর্মসূচি ও বিশেষ কার্যক্রম'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#072C4C]">
            {isEnglish ? 'Programs & Active Campaigns' : 'কর্মসূচি ও ক্যাম্পেইনসমূহ'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isEnglish
              ? 'Al-Ikhwan Islamic Social Welfare Organization operates educational and social welfare initiatives throughout the year. The Primary & Ebtedayee Scholarship Examination is an annual cornerstone education project.'
              : 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা সারা বছরব্যাপী বিভিন্ন শিক্ষামূলক ও সামাজিক কর্মসূচি পরিচালনা করে। প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা সংস্থার একটি বিশেষ বার্ষিক শিক্ষামূলক উদ্যোগ।'}
          </p>
        </div>

        {/* Campaign Switcher if multiple */}
        {campaigns.length > 1 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2">
            {campaigns.map(camp => {
              const cs = calculateCampaignStatus(camp);
              return (
                <button
                  key={camp.id}
                  onClick={() => setActiveCampaignId(camp.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    activeCampaignId === camp.id
                      ? 'bg-[#072C4C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{isEnglish && camp.id === 'camp-2026-scholarship' ? 'Primary & Ebtedayee Scholarship Exam 2026' : camp.title}</span>
                  <span className={`text-2xs px-2 py-0.5 rounded font-normal ${
                    cs.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cs.status === 'active' ? (isEnglish ? 'Active' : 'চলমান') : cs.status === 'upcoming' ? (isEnglish ? 'Upcoming' : 'আসন্ন') : (isEnglish ? 'Closed' : 'সমাপ্ত')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Detailed Campaign View */}
      {selectedCampaign && campaignStatus && (
        <div className="space-y-6">
          {/* Main Campaign Hero Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="space-y-2.5 max-w-2xl">
                {/* Category & Status badge */}
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider">
                    {isEnglish ? 'Scholarship Examination' : selectedCampaign.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                    campaignStatus.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : campaignStatus.status === 'upcoming'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {campaignStatus.status === 'active'
                      ? (isEnglish ? 'Applications Open' : 'আবেদন চলমান')
                      : campaignStatus.status === 'upcoming'
                      ? (isEnglish ? 'Upcoming Program' : 'আসন্ন কর্মসূচি')
                      : (isEnglish ? 'Applications Closed' : 'আবেদন সমাপ্ত')}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-bn text-[#072C4C] leading-snug">
                  {isEnglish ? 'Al-Ikhwan Primary & Ebtedayee Scholarship Examination 2026' : selectedCampaign.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEnglish
                    ? 'Official scholarship examination organized by Al-Ikhwan Islamic Social Welfare Organization for registered 5th-grade students of government primary schools, kindergartens, and recognized ebtedayee madrasas across Barlekha Upazila and Lauta Union of Beanibazar.'
                    : selectedCampaign.fullDescription}
                </p>
              </div>

              {/* Action Box based on Status */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-5 text-center shrink-0 min-w-[260px] space-y-3">
                <div className="space-y-1">
                  <span className="text-2xs text-slate-500 font-medium block">{isEnglish ? 'Application Fee' : 'আবেদন ফি'}</span>
                  <div className="text-2xl font-bold text-[#072C4C] font-mono">
                    {isEnglish ? `BDT ${selectedCampaign.feeAmount}` : `৳${convertToBengaliNumber(selectedCampaign.feeAmount)}`}
                    <span className="text-xs font-normal text-slate-500 ml-1">{isEnglish ? 'per student' : 'জনপ্রতি'}</span>
                  </div>
                </div>

                {campaignStatus.isOpenForApplication ? (
                  <button
                    onClick={() => setActiveTab('apply')}
                    className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>{isEnglish ? 'Apply Online Now' : 'অনলাইন আবেদন করুন'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : campaignStatus.status === 'upcoming' ? (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-2xs text-amber-800 text-center space-y-1">
                    <span className="font-bold block">{isEnglish ? 'Applications Opening Soon' : 'আবেদন শীঘ্রই শুরু হবে'}</span>
                    <span>{isEnglish ? `Start Date: ${formatLangDate(selectedCampaign.applicationStartDate, 'en')}` : `শুরুর তারিখ: ${convertToBengaliNumber(selectedCampaign.applicationStartDate)}`}</span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-2xs text-slate-600 text-center space-y-1">
                    <span className="font-bold block">{isEnglish ? 'Application Closed' : 'আবেদনের সময় শেষ'}</span>
                    <span>{isEnglish ? 'Closed on 05 November 2026' : '০৫ নভেম্বর ২০২৬ শেষ হয়েছে'}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-around text-2xs">
                  <button
                    onClick={() => setActiveTab('status')}
                    className="text-[#0284C7] hover:underline font-semibold cursor-pointer"
                  >
                    {isEnglish ? 'Check Status' : 'আবেদনের অবস্থা'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => setActiveTab('admit')}
                    className="text-[#0284C7] hover:underline font-semibold cursor-pointer"
                  >
                    {isEnglish ? 'Admit Card' : 'প্রবেশপত্র ডাউনলোড'}
                  </button>
                </div>
              </div>
            </div>

            {/* Key Timeline Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-2xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{isEnglish ? 'Application Start Date' : 'আবেদন শুরুর তারিখ'}</span>
                </span>
                <p className="font-bold text-[#072C4C] font-mono text-sm">
                  {formatLangDate(selectedCampaign.applicationStartDate, lang)}
                </p>
                <span className="text-2xs text-slate-500">{isEnglish ? '25 October 2026' : '২৫ অক্টোবর ২০২৬'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-2xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>{isEnglish ? 'Application Deadline' : 'আবেদনের শেষ সময়'}</span>
                </span>
                <p className="font-bold text-red-700 font-mono text-sm">
                  {formatLangDate(selectedCampaign.applicationEndDate, lang)}
                </p>
                <span className="text-2xs text-slate-500">{isEnglish ? '05 November 2026' : '০৫ নভেম্বর ২০২৬'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-2xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEnglish ? 'Examination Date' : 'পরীক্ষার তারিখ ও বার'}</span>
                </span>
                <p className="font-bold text-emerald-800 font-mono text-sm">
                  {formatLangDate(selectedCampaign.examDate, lang)}
                </p>
                <span className="text-2xs text-slate-500">{isEnglish ? 'Saturday, 14 November 2026' : '১৪ নভেম্বর ২০২৬, রোজ শনিবার'}</span>
              </div>
            </div>
          </div>

          {/* Policy & Rules Breakdown (Nitimala.pdf) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rules Section (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-4 h-4 text-[#0284C7]" />
                <h3 className="text-base font-bold font-serif-bn text-[#072C4C]">
                  {isEnglish ? 'Official Guidelines & Policies (Nitimala.pdf)' : 'অফিসিয়াল নীতিমালা ও নির্দেশাবলি (Nitimala.pdf)'}
                </h3>
              </div>

              <div className="space-y-2.5">
                {(isEnglish ? [
                  'Regular 5th-grade students from government primary schools, recognized kindergartens, and ebtedayee madrasas are eligible.',
                  'Each institution can nominate a maximum of 7 candidates with permission from the Head Teacher/Principal.',
                  'Examination subjects cover Bangla, English, Mathematics, and General Knowledge & Religious Studies (100 total marks).',
                  'Online application must include candidate passport photograph and signature.',
                  'Admit card is mandatory for exam hall entry on 14 November 2026.'
                ] : (selectedCampaign.rules || [])).map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>

              {/* Uploaded PDF Documents Section */}
              {selectedCampaign.documents && selectedCampaign.documents.length > 0 && (
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#0284C7]" />
                    <h4 className="text-xs font-bold text-[#072C4C] uppercase tracking-wide">
                      {isEnglish ? 'Official Documents & Downloadable Guidelines (PDF)' : 'ডাউনলোডযোগ্য অফিসিয়াল নির্দেশিকা ও নীতিমালা (PDF)'}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedCampaign.documents.map(doc => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={doc.fileName}
                        className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 border border-sky-200 hover:bg-sky-100/70 text-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <FileText className="w-5 h-5 text-[#0284C7] shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-xs text-[#072C4C] block truncate group-hover:text-[#0284C7] transition-colors">
                              {doc.title}
                            </span>
                            <span className="text-3xs text-slate-500 font-mono block">
                              {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0284C7] flex items-center gap-1 shrink-0 ml-2">
                          <span>ডাউনলোড</span>
                          <Download className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility & Contact Sidebar (1 col) */}
            <div className="space-y-5">
              {/* Admit Card Available Date Announcement */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{isEnglish ? 'Admit Card Release Date' : 'প্রবেশপত্র প্রকাশের সময়'}</span>
                </div>
                <p className="text-xs text-amber-950 font-semibold leading-relaxed">
                  {selectedCampaign.admitCardAvailableDate 
                    ? (isEnglish ? `Available from: ${selectedCampaign.admitCardAvailableDate.replace('T', ' at ')}` : `প্রকাশিত হবে: ${selectedCampaign.admitCardAvailableDate.replace('T', ' সকাল ')} টা থেকে`) 
                    : (isEnglish ? '06 November 2026 at 09:00 AM' : '০৬ নভেম্বর ২০২৬, সকাল ০৯:০০ টা থেকে')}
                </p>
                <p className="text-3xs text-amber-800">
                  {isEnglish ? 'Students can download their admit card with their Application ID or Mobile number.' : 'আবেদন নম্বর বা মোবাইল নম্বর দিয়ে প্রবেশপত্র সরাসরি ডাউনলোড করা যাবে।'}
                </p>
              </div>

              {/* Exam Centers */}
              {selectedCampaign.examCenters && selectedCampaign.examCenters.length > 0 && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#072C4C]">
                    <Building2 className="w-4 h-4 text-[#0284C7]" />
                    <span>{isEnglish ? 'Examination Centers' : 'পরীক্ষা কেন্দ্রসমূহ'}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {selectedCampaign.examCenters.map((center, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                        <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                        <span className="text-slate-800 font-medium">{center}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Box */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#072C4C]">
                  <Users className="w-4 h-4 text-[#0284C7]" />
                  <span>{isEnglish ? 'Eligibility & Institutional Quota' : 'অংশগ্রহণের যোগ্যতা ও কোটা'}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <p>
                    • <strong>{isEnglish ? 'Class:' : 'শ্রেণি:'}</strong> {isEnglish ? 'Regular Class 5 students only (Primary & Ebtedayee).' : 'শুধুমাত্র পঞ্চম শ্রেণির (সাধারণ/ইবতেদায়ী) নিয়মিত শিক্ষার্থীরা।'}
                  </p>
                  <p>
                    • <strong>{isEnglish ? 'Eligible Areas:' : 'আওতাভুক্ত এলাকা:'}</strong> {isEnglish ? 'All schools across Barlekha Upazila (Moulvibazar) and Lauta Union Parishad of Beanibazar (Sylhet).' : 'মৌলভীবাজার জেলার বড়লেখা উপজেলার সকল শিক্ষাপ্রতিষ্ঠান এবং সিলেট জেলার বিয়ানীবাজার উপজেলার লাউতা ইউনিয়ন পরিষদের আওতাধীন প্রতিষ্ঠান।'}
                  </p>
                  <p>
                    • <strong>{isEnglish ? 'School Quota:' : 'প্রতিষ্ঠান কোটা:'}</strong> {isEnglish ? 'Maximum 7 candidates per institution with Head Teacher consent.' : 'একটি প্রতিষ্ঠান থেকে প্রধান শিক্ষকের অনুমতিক্রমে সর্বোচ্চ ৭ জন শিক্ষার্থী।'}
                  </p>
                </div>
              </div>

              {/* Official Helpline */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#072C4C]">
                  <Phone className="w-4 h-4 text-[#0284C7]" />
                  <span>{isEnglish ? 'Official Examination Helpline' : 'বিশেষ প্রয়োজনে যোগাযোগ'}</span>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedCampaign.contacts.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800 block text-2xs">
                          {isEnglish ? (c.designation?.includes('আহ্বায়ক') ? 'Convener' : 'Member Secretary') : c.name}
                        </span>
                        <span className="text-2xs text-slate-500">
                          {isEnglish ? (c.designation?.includes('আহ্বায়ক') ? 'Exam Convener' : 'Exam Member Secretary') : c.designation}
                        </span>
                      </div>
                      <a href={`tel:${c.rawPhone}`} className="font-mono font-bold text-[#0284C7] text-2xs hover:underline">
                        {toLangNumber(c.phone, lang)}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Bar for Active Campaign */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-[#072C4C] font-serif-bn">
                {isEnglish ? 'Ready to Apply for this Program?' : 'এই কর্মসূচিতে অংশগ্রহণে প্রস্তুত?'}
              </h4>
              <p className="text-xs text-slate-500">
                {isEnglish ? 'Fill out the simple online form and get instant payment receipt.' : 'সহজ অনলাইন ফরম পূরণ করুন এবং সাথে সাথে টাকা জমার রসিদ সংগ্রহ করুন।'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveTab('apply')}
                className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-[0.98]"
              >
                <span>{isEnglish ? 'Apply Online Now' : 'অনলাইনে আবেদন ফরম'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('receipt')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{isEnglish ? 'Money Receipt' : 'টাকা জমার রসিদ'}</span>
              </button>

              <button
                onClick={() => setActiveTab('admit')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{isEnglish ? 'Admit Card' : 'প্রবেশপত্র'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
