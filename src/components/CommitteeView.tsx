import React, { useState, useEffect } from 'react';
import { INSTITUTION, CommitteeMember } from '../types';
import { storage } from '../services/storage';
import { 
  Building2, 
  Phone, 
  Users, 
  Award, 
  ShieldCheck, 
  ChevronRight,
  Mail
} from 'lucide-react';
import { SupportedLang } from '../utils/i18n';

interface CommitteeViewProps {
  onContactClick?: (phone: string) => void;
  lang?: SupportedLang;
}

export const CommitteeView: React.FC<CommitteeViewProps> = ({ lang = 'bn' }) => {
  const isEnglish = lang === 'en';
  const [selectedTerm, setSelectedTerm] = useState<string>('২০২৪-২০২৬ সেশন');
  const [members, setMembers] = useState<CommitteeMember[]>(() => storage.getCommitteeMembers());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setMembers(storage.getCommitteeMembers());
    });
    return unsub;
  }, []);

  // Filter members by term
  const termMembers = members.filter(m => m.term === selectedTerm);

  // Group by leadership tiers
  const advisors = termMembers.filter(m => m.tier === 'advisory');
  const president = termMembers.find(m => m.tier === 'president');
  const vicePresidents = termMembers.filter(m => m.tier === 'vice_president');
  const generalSecretary = termMembers.find(m => m.tier === 'general_sec');
  const asstGeneralSec = termMembers.find(m => m.tier === 'asst_gen_sec');
  const treasurers = termMembers.filter(m => m.tier === 'treasurer');
  const otherSecretaries = termMembers.filter(m => m.tier === 'secretaries');
  const executiveMembers = termMembers.filter(m => m.tier === 'members');

  const terms = Array.from(new Set(members.map(m => m.term)));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Official Directory Masthead */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider block">
              {isEnglish ? 'Institutional Governance & Leadership Roster' : 'প্রাতিষ্ঠানিক পরিচালনা পর্ষদ ও দাপ্তরিক পরিষদ'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#07243B] mt-1">
              পরিচালনা পর্ষদ ও কার্যনির্বাহী পরিষদ
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {INSTITUTION.name} · {INSTITUTION.address} (রেজিস্ট্রেশন নং ২৯৯, স্থাপিত ০১/০১/২০০০ ইং)
            </p>
          </div>

          {/* Session Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 border border-slate-200 text-xs">
            {terms.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTerm(t)}
                className={`px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  selectedTerm === t 
                    ? 'bg-[#07243B] text-white font-bold' 
                    : 'text-slate-700 hover:text-black'
                }`}
              >
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          সংস্থার গঠনতন্ত্র ও সমাজসেবা অধিদপ্তরের নীতিমালা মোতাবেক গণতান্ত্রিক প্রক্রিয়ায় গঠিত কার্যনির্বাহী পরিষদ সমগ্র বার্ষিক মেধা বৃত্তি পরীক্ষা, আপৎকালীন মানবিক ত্রাণ এবং সামাজিক উন্নয়ন কর্মসূচি পরিচালনা করে।
        </p>
      </section>

      {/* 2. Principal Executive Leadership (President & General Secretary) */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ১. প্রধান নির্বাহী নেতৃত্ব (President & General Secretary)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">কার্যকাল: ২০২৪–২০২৬</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {president && (
            <div className="border border-slate-300 p-5 bg-slate-50/60 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#0272A6] uppercase tracking-wider block">
                  {president.designation} (সাংগঠনিক প্রধান)
                </span>
                <h3 className="text-lg font-bold font-serif-bn text-[#07243B]">
                  {president.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {president.bio || 'সংস্থার সামগ্রিক নীতিমালা প্রণয়ন এবং শিক্ষামূলক কার্যক্রমের দিকনির্দেশনায় নেতৃত্ব দিচ্ছেন।'}
                </p>
              </div>

              {president.phone && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">দাপ্তরিক যোগাযোগ:</span>
                  <a
                    href={`tel:${president.rawPhone || president.phone}`}
                    className="font-mono font-bold text-[#0272A6] hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{president.phone}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {generalSecretary && (
            <div className="border border-slate-300 p-5 bg-slate-50/60 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {generalSecretary.designation} (দাপ্তরিক প্রধান সমন্বয়ক)
                </span>
                <h3 className="text-lg font-bold font-serif-bn text-[#07243B]">
                  {generalSecretary.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {generalSecretary.bio || 'সংস্থার সকল দাপ্তরিক কার্যক্রম, পরীক্ষা ব্যবস্থাপনা ও সমাজসেবা উদ্যোগ সমন্বয় করছেন।'}
                </p>
              </div>

              {generalSecretary.phone && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">দাপ্তরিক যোগাযোগ:</span>
                  <a
                    href={`tel:${generalSecretary.rawPhone || generalSecretary.phone}`}
                    className="font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{generalSecretary.phone}</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Officers & Departmental Secretaries Matrix */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ২. সহ-সভাপতি, অর্থ ও বিভাগীয় সম্পাদক পরিষদ
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">কার্যকরী পর্ষদ</span>
        </div>

        <div className="border border-slate-200 divide-y divide-slate-200">
          {/* Vice Presidents */}
          {vicePresidents.map((m, idx) => (
            <div key={m.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition">
              <div>
                <span className="text-[10px] font-bold text-[#0272A6] uppercase tracking-wider block">সহ-সভাপতি</span>
                <h4 className="text-sm font-bold text-[#07243B]">{m.name}</h4>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>{m.designation}</span>
                {m.phone && (
                  <a href={`tel:${m.rawPhone || m.phone}`} className="font-mono text-[#0272A6] hover:underline">
                    {m.phone}
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Asst Gen Sec */}
          {asstGeneralSec && (
            <div className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">সহ-সাধারণ সম্পাদক</span>
                <h4 className="text-sm font-bold text-[#07243B]">{asstGeneralSec.name}</h4>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>{asstGeneralSec.designation}</span>
                {asstGeneralSec.phone && (
                  <a href={`tel:${asstGeneralSec.rawPhone || asstGeneralSec.phone}`} className="font-mono text-emerald-800 hover:underline">
                    {asstGeneralSec.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Treasurers */}
          {treasurers.map(m => (
            <div key={m.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">অর্থ ও হিসাব বিভাগ</span>
                <h4 className="text-sm font-bold text-[#07243B]">{m.name}</h4>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>{m.designation}</span>
                {m.phone && (
                  <a href={`tel:${m.rawPhone || m.phone}`} className="font-mono text-amber-800 hover:underline">
                    {m.phone}
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Departmental Secretaries */}
          {otherSecretaries.map(m => (
            <div key={m.id} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">বিভাগীয় সম্পাদক</span>
                <h4 className="text-sm font-bold text-[#07243B]">{m.name}</h4>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-4">
                <span>{m.designation}</span>
                {m.phone && (
                  <a href={`tel:${m.rawPhone || m.phone}`} className="font-mono text-slate-700 hover:underline">
                    {m.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Executive Members Directory */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ৩. কার্যনির্বাহী সদস্যবৃন্দ (Executive Committee Members)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">{executiveMembers.length} জন সদস্য</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {executiveMembers.map(m => (
            <div key={m.id} className="border border-slate-200 p-3 bg-slate-50/40 space-y-1">
              <h4 className="text-xs font-bold text-[#07243B]">{m.name}</h4>
              <p className="text-[11px] text-slate-600">{m.designation}</p>
              {m.phone && (
                <div className="pt-1 text-[11px] font-mono text-slate-500">
                  <a href={`tel:${m.rawPhone || m.phone}`} className="hover:text-[#0272A6]">
                    {m.phone}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Advisory Council (উপদেষ্টা পরিষদ) */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
            ৪. সম্মানিত উপদেষ্টা পরিষদ (Advisory Council)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">{advisors.length} জন উপদেষ্টা</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {advisors.map(m => (
            <div key={m.id} className="border border-slate-200 p-3 bg-slate-50/50 space-y-1 text-center">
              <h4 className="text-xs font-bold text-[#07243B]">{m.name}</h4>
              <span className="text-[10px] text-[#0272A6] font-semibold block">উপদেষ্টা</span>
              {m.phone && (
                <div className="pt-1 text-[11px] font-mono text-slate-500">
                  <a href={`tel:${m.rawPhone || m.phone}`} className="hover:text-[#0272A6]">
                    {m.phone}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
