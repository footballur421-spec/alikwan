import React from 'react';
import { INSTITUTION, OFFICIAL_CONTACTS } from '../types';
import { MapPin, Phone, Mail, Lock, ChevronRight, FileText } from 'lucide-react';
import { ActiveTab } from './Navbar';
import { Logo } from './Logo';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  lang?: 'bn' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, lang = 'bn' }) => {
  const isEnglish = lang === 'en';

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07243B] text-slate-300 pt-12 pb-8 border-t border-[#0B3556] no-print mt-14">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* 1. Institutional Identity & Accreditation */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-13 shrink-0 flex items-center justify-center p-1 rounded bg-white/10 border border-white/10">
              <Logo className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm sm:text-base leading-tight font-serif-bn">
                {isEnglish ? INSTITUTION.englishName : INSTITUTION.name}
              </h2>
              <p className="text-[11px] text-sky-300 font-medium mt-0.5">
                রেজিঃ নং ২৯৯ · স্থাপিত: ০১/০১/২০০০ ইং
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা একটি শিক্ষা ও জনকল্যাণমুখী সরকারি নিবন্ধিত সামাজিক প্রতিষ্ঠান। বড়লেখা ও সংলগ্ন এলাকার শিক্ষার্থীদের সুশিক্ষা ও মেধা বিকাশের লক্ষ্যে নিবেদিত।
          </p>

          <div className="text-[11px] text-slate-400 border-t border-[#0B3556] pt-2">
            <span>মূল নীতিবাক্য: </span>
            <span className="text-white font-semibold">{INSTITUTION.motto}</span>
          </div>
        </div>

        {/* 2. Institutional Services & Direct Links */}
        <div>
          <h3 className="text-white font-bold text-xs mb-3 pb-1.5 border-b border-[#0B3556] uppercase tracking-wider text-sky-400">
            {isEnglish ? 'Institutional Services' : 'দাপ্তরিক সেবা ও লিংক'}
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button 
                type="button"
                onClick={() => navigateTo('apply')}
                className="text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>অনলাইন আবেদন ফরম</span>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigateTo('admit')}
                className="text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>প্রবেশপত্র ডাউনলোড ও সূচি</span>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigateTo('receipt')}
                className="text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>টাকা জমার রসিদ (Money Receipt)</span>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigateTo('notices')}
                className="text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>দাপ্তরিক নোটিশ ও প্রজ্ঞাপন</span>
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => navigateTo('committee')}
                className="text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>পরিচালনা পর্ষদ তালিকা</span>
              </button>
            </li>
            <li>
              <a
                href="/assets/Nitimala.pdf"
                target="_blank"
                rel="noreferrer"
                download="Nitimala_2026.pdf"
                className="text-slate-300 hover:text-white transition flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-amber-400" />
                <span>{isEnglish ? 'Nitimala (PDF)' : 'নীতিমালা (PDF)'}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* 3. Official Contacts & Secretariat */}
        <div>
          <h3 className="text-white font-bold text-xs mb-3 pb-1.5 border-b border-[#0B3556] uppercase tracking-wider text-sky-400">
            {isEnglish ? 'Contact & Location' : 'কার্যালয় ও দায়িত্বশীলগণ'}
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>{INSTITUTION.address}</span>
            </li>
            <li className="space-y-1 pt-1">
              <span className="block text-[11px] text-sky-300 font-semibold">বিশেষ প্রয়োজনে যোগাযোগ:</span>
              {OFFICIAL_CONTACTS.map((person, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <a href={`tel:${person.rawPhone}`} className="hover:text-white font-mono font-bold text-slate-200">
                    {person.name}: {person.phone}
                  </a>
                </div>
              ))}
            </li>
            <li className="pt-2">
              <a
                href="https://www.facebook.com/people/%E0%A6%86%E0%A6%B2-%E0%A6%87%E0%A6%96%E0%A6%93%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%A8-%E0%A6%87%E0%A6%B8%E0%A6%83%E0%A6%B8%E0%A6%83%E0%A6%95%E0%A6%83-%E0%A6%B8%E0%A6%82%E0%A6%B8%E0%A7%8D%E0%A6%A5%E0%A6%BE/100015332053937/#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-sky-300 hover:text-white border border-[#1877F2]/40 text-xs font-semibold transition"
              >
                <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{isEnglish ? 'Facebook Page' : 'ফেইসবুক পেজ'}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* 4. Administrative Security */}
        <div>
          <h3 className="text-white font-bold text-xs mb-3 pb-1.5 border-b border-[#0B3556] uppercase tracking-wider text-sky-400">
            {isEnglish ? 'Administrative Control' : 'প্রশাসনিক নিয়ন্ত্রণকক্ষ'}
          </h3>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            শুধুমাত্র অনুমোদিত পরীক্ষা নিয়ন্ত্রক ও কর্মকর্তাদের জন্য সুরক্ষিত প্রশাসনিক পোর্টাল।
          </p>
          <button
            type="button"
            onClick={() => navigateTo('admin')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0B3556] hover:bg-[#0E3E6A] text-amber-300 hover:text-white rounded text-xs font-semibold border border-[#164871] transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>প্রশাসনিক নিয়ন্ত্রণকক্ষ (Admin)</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-4 border-t border-[#0B3556] flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
        <p>© ২০২৬ {INSTITUTION.name}। সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="text-center sm:text-right text-[11px]">
          {INSTITUTION.address} · সমাজসেবা অধিদপ্তর রেজিঃ {INSTITUTION.regNo}
        </p>
      </div>
    </footer>
  );
};
