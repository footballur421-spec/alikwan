import React, { useState, useEffect } from 'react';
import { INSTITUTION, Campaign } from '../types';
import { Logo } from './Logo';
import { storage } from '../services/storage';
import { 
  Menu, 
  X, 
  Home, 
  Award, 
  Bell, 
  CreditCard, 
  Users, 
  Phone, 
  Lock, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export type ActiveTab = 
  | 'home' 
  | 'committee'
  | 'campaigns'
  | 'gallery'
  | 'apply' 
  | 'status' 
  | 'admit' 
  | 'rules' 
  | 'receipt' 
  | 'payment'
  | 'notices' 
  | 'verify' 
  | 'contact' 
  | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdminLoggedIn: boolean;
  lang?: 'bn' | 'en';
  setLang?: (lang: 'bn' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  isAdminLoggedIn,
  lang = 'bn',
  setLang
}) => {
  const isEnglish = lang === 'en';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredCampaign, setFeaturedCampaign] = useState<Campaign>(() => storage.getFeaturedCampaign());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setFeaturedCampaign(storage.getFeaturedCampaign());
    });
    return unsub;
  }, []);

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCampaignActive = activeTab === 'campaigns' || activeTab === 'rules';

  const navItems = [
    { id: 'home' as ActiveTab, labelBn: 'মূল পাতা', labelEn: 'Home', icon: Home },
    { 
      id: 'campaigns' as ActiveTab, 
      labelBn: 'চলমান কর্মসূচি', 
      labelEn: 'Active Program', 
      isCampaign: true,
      subBn: 'বৃত্তি পরীক্ষা ২০২৬',
      subEn: 'Scholarship Exam 2026',
      icon: Award 
    },
    { id: 'notices' as ActiveTab, labelBn: 'নোটিশ বোর্ড', labelEn: 'Notice Board', icon: Bell },
    { id: 'admit' as ActiveTab, labelBn: 'প্রবেশপত্র', labelEn: 'Admit Card', icon: Award },
    { id: 'receipt' as ActiveTab, labelBn: 'টাকা জমার রসিদ', labelEn: 'Money Receipt', icon: CreditCard },
    { id: 'committee' as ActiveTab, labelBn: 'পরিচালনা পর্ষদ', labelEn: 'Governing Body', icon: Users },
    { id: 'contact' as ActiveTab, labelBn: 'যোগাযোগ', labelEn: 'Contact', icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 no-print">
      {/* 1. Official Government Registry & Verification Top Banner */}
      <div className="bg-[#07243B] text-slate-300 text-xs py-1.5 px-4 border-b border-[#0B3556]">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-100">
              {isEnglish 
                ? 'Registered under Department of Social Services, Govt. of Bangladesh (Reg. No: 299)' 
                : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত সমাজসেবা অধিদপ্তর নিবন্ধিত (রেজিঃ নং ২৯৯)'}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:inline text-slate-300">
              {isEnglish ? 'Estd: 01/01/2000' : 'স্থাপিত: ০১/০১/২০০০ ইং'}
            </span>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-slate-300">
              {isEnglish ? 'Barlekha, Moulvibazar' : 'গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            {/* Language Switcher */}
            {setLang && (
              <div className="inline-flex items-center rounded border border-[#164871] bg-[#0A2F4D] p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    lang === 'bn' 
                      ? 'bg-[#0272A6] text-white font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    lang === 'en' 
                      ? 'bg-[#0272A6] text-white font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            )}

            {/* Helpline number */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-mono">
              <span className="text-slate-400 font-sans text-[11px]">{isEnglish ? 'Helpline:' : 'হেল্পলাইন:'}</span>
              <a href="tel:01750969712" className="text-white hover:text-sky-300 font-bold transition-colors">
                01750-969712
              </a>
            </div>

            {/* Administrative Access */}
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#0272A6] text-white border-sky-400'
                  : 'bg-[#093252] text-amber-300 border-amber-400/30 hover:border-amber-400/60'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span>{isAdminLoggedIn ? (isEnglish ? 'Dashboard' : 'ড্যাশবোর্ড') : (isEnglish ? 'Admin Portal' : 'প্রশাসনিক লগইন')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Institutional Masthead */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group select-none min-w-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNav('home'); }}
          >
            <div className="w-12 h-14 sm:w-13 sm:h-15 shrink-0 flex items-center justify-center p-1 rounded-md bg-slate-50 border border-slate-200 shadow-2xs group-hover:border-[#0272A6]/50 transition-colors">
              <Logo className="w-full h-full" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#0272A6] uppercase tracking-wider flex items-center gap-1.5 truncate">
                <span>{isEnglish ? 'Education · Unity · Social Welfare' : INSTITUTION.motto}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 font-medium">রেজিঃ {INSTITUTION.regNo}</span>
                <span className="text-slate-300 hidden sm:inline">·</span>
                <span className="text-slate-500 font-medium hidden sm:inline">স্থাপিত: ২০০০ইং</span>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-[#07243B] leading-tight font-serif-bn group-hover:text-[#0272A6] transition-colors truncate">
                {isEnglish ? INSTITUTION.englishName : INSTITUTION.name}
              </h1>
              <p className="text-xs text-slate-600 truncate">
                {isEnglish ? 'Gallasangon, Barlekha, Moulvibazar, Bangladesh' : INSTITUTION.address}
              </p>
            </div>
          </div>

          {/* Quick Apply CTA */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNav('apply')}
              className="px-4 py-2 bg-[#0272A6] hover:bg-[#065A82] text-white text-xs font-bold rounded-lg shadow-2xs hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-[0.99]"
            >
              <span>{isEnglish ? 'Online Application Form' : 'অনলাইন আবেদন ফরম'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#0272A6] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              aria-label="মেনু খুলুন বা বন্ধ করুন"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Editorial Navigation Bar */}
      <div className="hidden lg:block bg-[#07243B] text-slate-200 border-t border-[#0B3556]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex items-center space-x-0.5 py-1" aria-label="প্রধান নেভিগেশন">
            {navItems.map(item => {
              const isActive = item.isCampaign ? isCampaignActive : activeTab === item.id;
              const Icon = item.icon;

              if (item.isCampaign) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav('campaigns')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-[#0272A6] text-white font-bold' 
                        : 'text-slate-200 hover:text-white hover:bg-[#0C385B]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isEnglish ? item.labelEn : item.labelBn}</span>
                    <span className="text-[10px] text-sky-200 font-normal">
                      ({isEnglish ? item.subEn : item.subBn})
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#0272A6] text-white font-bold' 
                      : 'text-slate-200 hover:text-white hover:bg-[#0C385B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{isEnglish ? item.labelEn : item.labelBn}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav('apply')}
              className="text-xs font-bold text-white hover:text-sky-300 px-3 py-1 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <span>{isEnglish ? 'Apply Online' : 'অনলাইন আবেদন'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07243B] text-slate-100 border-t border-[#0B3556] px-4 py-3 space-y-2 max-h-[85vh] overflow-y-auto">
          {/* Active Campaign Card */}
          <div
            onClick={() => handleNav('campaigns')}
            className="p-3 bg-[#0B3556] rounded-lg border border-[#164871] cursor-pointer space-y-1 hover:border-[#0272A6] transition"
          >
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEnglish ? 'Active Institutional Program' : 'চলমান প্রাতিষ্ঠানিক কর্মসূচি'}</span>
            </div>
            <div className="text-xs font-bold text-white">
              {featuredCampaign?.title || 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬'}
            </div>
            <p className="text-[11px] text-slate-300">
              {isEnglish ? 'View full guidelines, exam centers and application instructions →' : 'সম্পূর্ণ তথ্য, নীতিমালা ও আবেদন নির্দেশিকা দেখুন →'}
            </p>
          </div>

          {/* Quick Apply Button on Mobile */}
          <button
            type="button"
            onClick={() => handleNav('apply')}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#0272A6] hover:bg-[#065A82] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <span>{isEnglish ? 'Online Application Form' : 'অনলাইন আবেদন ফরম'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Navigation Items */}
          <div className="space-y-1 pt-1">
            {navItems.map(item => {
              const isActive = item.isCampaign ? isCampaignActive : activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md text-left transition cursor-pointer ${
                    isActive 
                      ? 'bg-[#0272A6] text-white font-bold' 
                      : 'text-slate-200 hover:bg-[#0C385B]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{isEnglish ? item.labelEn : item.labelBn}</span>
                  </div>
                  {item.isCampaign && (
                    <span className="text-[10px] text-sky-200 truncate max-w-[120px]">
                      {isEnglish ? item.subEn : item.subBn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 mt-2 border-t border-[#0B3556] text-[11px] text-slate-300 flex justify-between items-center">
            <span>{isEnglish ? 'Office Helpline:' : 'অফিস হেল্পলাইন:'}</span>
            <span className="font-mono text-white font-bold">01750-969712</span>
          </div>
        </div>
      )}
    </header>
  );
};
