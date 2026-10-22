import React, { useState, useEffect } from 'react';
import { INSTITUTION, ExamSettings, OFFICIAL_CONTACTS, WebsiteEditorConfig } from '../types';
import { storage } from '../services/storage';
import { Phone, ExternalLink } from 'lucide-react';
import { convertToBengaliNumber } from '../utils/validation';
import { SupportedLang } from '../utils/i18n';
import { ActiveTab } from './Navbar';

interface RulesSectionProps {
  settings: ExamSettings;
  setActiveTab: (tab: ActiveTab) => void;
  lang?: SupportedLang;
}

export const RulesSection: React.FC<RulesSectionProps> = ({ setActiveTab, lang = 'bn' }) => {
  const isEnglish = lang === 'en';
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteEditorConfig>(() => storage.getWebsiteEditorConfig());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setWebsiteConfig(storage.getWebsiteEditorConfig());
    });
    return unsub;
  }, []);

  const schoolTotal = (websiteConfig.nitimala?.schoolSubjects || []).reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);
  const madrasaTotal = (websiteConfig.nitimala?.madrasaSubjects || []).reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-3">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider block">
            {isEnglish ? 'Official Policies & Examination Regulations' : 'অফিসিয়াল নীতিমালা ও পরীক্ষা নির্দেশিকা'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#07243B] mt-1">
            {websiteConfig.hero?.titleBn || INSTITUTION.examName} — সরকারি ও প্রাতিষ্ঠানিক নীতিমালা
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {INSTITUTION.name} (রেজিস্ট্রেশন নং ২৯৯) কর্তৃক অনুমোদিত পরীক্ষা নীতিমালা, অংশগ্রহণ যোগ্যতা ও নির্দেশাবলি
          </p>
        </div>
      </section>

      {/* 1. Candidate Eligibility & Rules */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ১. শিক্ষার্থীদের যোগ্যতা ও অংশগ্রহণের ১০টি আবশ্যিক শর্তাবলি
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            গুগল ফর্ম নীতিমালা
          </span>
        </div>

        <div className="border border-slate-200 divide-y divide-slate-200 text-xs text-slate-700 leading-relaxed">
          {(websiteConfig.nitimala?.officialRules || []).map((rule, idx) => (
            <div key={idx} className="p-3.5 flex items-start gap-2.5 hover:bg-slate-50/50 transition">
              <span className="w-6 h-6 rounded bg-[#07243B] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {convertToBengaliNumber(idx + 1)}
              </span>
              <span className="flex-1 font-medium">{rule}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Marks Distribution (School & Madrasa) */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ২. বিষয়ভিত্তিক মান বণ্টন ও পাঠ্যক্রম
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            পঞ্চম শ্রেণির সাধারণ প্রাথমিক ও ইবতেদায়ী স্তরের পাঠ্যপুস্তকের আলোকে লিখিত পরীক্ষা
          </p>
        </div>

        {/* 2A. School Syllabus */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#07243B] flex items-center gap-1.5">
              <span>{websiteConfig.icons?.schoolEmoji || '🏫'}</span>
              <span>{websiteConfig.nitimala?.schoolTitle || 'মান বন্টন দেখুন, স্কুল (সাধারণ প্রাথমিক বিদ্যালয় ও কিন্ডারগার্টেন শাখা)'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-[#0272A6] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              সর্বমোট: {convertToBengaliNumber(schoolTotal || 100)} নম্বর
            </span>
          </div>

          <div className="border border-slate-200 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#07243B] text-white">
                  <th className="py-2.5 px-4 font-semibold">বিষয়</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-28">পূর্ণমান</th>
                  <th className="py-2.5 px-4 font-semibold">বিবরণ / পাঠ্যসূচি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {(websiteConfig.nitimala?.schoolSubjects || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-[#07243B]">{item.subject}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#0272A6] font-mono">{convertToBengaliNumber(item.marks)}</td>
                    <td className="py-2.5 px-4 text-slate-600">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2B. Madrasa Syllabus */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <span>{websiteConfig.icons?.madrasaEmoji || '📖'}</span>
              <span>{websiteConfig.nitimala?.madrasaTitle || 'মান বন্টন দেখুন, মাদ্রাসা (ইবতেদায়ী শাখা)'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              সর্বমোট: {convertToBengaliNumber(madrasaTotal || 100)} নম্বর
            </span>
          </div>

          <div className="border border-slate-200 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="py-2.5 px-4 font-semibold">বিষয়</th>
                  <th className="py-2.5 px-4 font-semibold text-center w-28">পূর্ণমান</th>
                  <th className="py-2.5 px-4 font-semibold">বিবরণ / পাঠ্যসূচি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {(websiteConfig.nitimala?.madrasaSubjects || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-emerald-900">{item.subject}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-700 font-mono">{convertToBengaliNumber(item.marks)}</td>
                    <td className="py-2.5 px-4 text-slate-600">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Official Helpline & Facebook Section */}
      <section className="bg-slate-50 border border-slate-200 p-6 sm:p-8 space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">বিশেষ প্রয়োজনে যোগাযোগঃ</span>
            <div className="flex items-center gap-4 flex-wrap mt-2">
              {OFFICIAL_CONTACTS.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <a href={`tel:${c.rawPhone}`} className="font-bold hover:underline font-mono">
                    {c.name}: {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {websiteConfig.footer?.facebookUrl && (
            <a
              href={websiteConfig.footer.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold hover:bg-[#166fe5] transition shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>{websiteConfig.icons?.facebookEmoji || '🌐'} ফেইসবুক আইডি / পেজ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </section>

      {/* 4. Hall Instructions */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ৪. পরীক্ষাকেন্দ্রের আবশ্যিক নির্দেশাবলি
          </h2>
        </div>

        <div className="border border-slate-200 divide-y divide-slate-200 text-xs text-slate-700">
          {(websiteConfig.nitimala?.hallInstructions || []).map((ins, idx) => (
            <div key={idx} className="p-3">{ins}</div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="border border-slate-300 bg-[#07243B] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold font-serif-bn">অনলাইন আবেদন সম্পন্ন করুন</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            বৃত্তি পরীক্ষা ২০২৬ সেশনের নির্ধারিত আবেদন ফরমে এখনই তথ্য জমা দিন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('apply');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2 bg-[#0272A6] hover:bg-[#065A82] text-white text-xs font-bold rounded transition cursor-pointer"
          >
            অনলাইন আবেদন ফরম
          </button>
        </div>
      </section>
    </div>
  );
};
