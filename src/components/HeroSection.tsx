import React, { useState, useEffect } from 'react';
import { ExamSettings, Notice, INSTITUTION, Campaign, GalleryItem, WebsiteEditorConfig, OFFICIAL_CONTACTS } from '../types';
import { storage } from '../services/storage';
import { ActiveTab } from './Navbar';
import { calculateCampaignStatus, convertToBengaliNumber } from '../utils/validation';
import { SupportedLang, formatLangDate, formatLangDateTime } from '../utils/i18n';
import { 
  Award, 
  ArrowRight, 
  BookOpen, 
  HeartHandshake, 
  GraduationCap, 
  Users, 
  Bell, 
  ChevronRight,
  ChevronDown,
  Maximize2,
  FileText,
  Phone,
  Shield,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  X,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  HelpCircle,
  Trophy,
  BarChart3
} from 'lucide-react';
import { Logo } from './Logo';
import { GallerySection } from './GallerySection';

interface HeroSectionProps {
  settings: ExamSettings;
  latestNotice?: Notice;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectNotice: (notice: Notice) => void;
  lang?: SupportedLang;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  latestNotice: initialLatestNotice,
  setActiveTab,
  onSelectNotice,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [featuredCampaign, setFeaturedCampaign] = useState<Campaign>(() => storage.getFeaturedCampaign());
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => storage.getGalleryItems());
  const [notices, setNotices] = useState<Notice[]>(() => storage.getNotices());
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteEditorConfig>(() => storage.getWebsiteEditorConfig());
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setFeaturedCampaign(storage.getFeaturedCampaign());
      setGalleryItems(storage.getGalleryItems());
      setNotices(storage.getNotices());
      setWebsiteConfig(storage.getWebsiteEditorConfig());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const target = new Date(websiteConfig.features?.countdownTargetDate || '2026-11-14T10:00:00').getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [websiteConfig.features?.countdownTargetDate]);

  const campaignStatus = calculateCampaignStatus(featuredCampaign);
  const activeNotice = initialLatestNotice || notices[0];

  // Committee leaders
  const committee = storage.getCommitteeMembers();
  const president = committee.find(m => m.tier === 'president');
  const generalSecretary = committee.find(m => m.tier === 'general_sec');

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 0. Emergency Broadcast Alert Banner (Configurable in Website Editor) */}
      {websiteConfig.features?.emergencyBanner?.enabled && (
        <div className={`border p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bangla rounded-lg shadow-xs ${
          websiteConfig.features.emergencyBanner.type === 'danger' ? 'bg-red-50 text-red-900 border-red-300' :
          websiteConfig.features.emergencyBanner.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-300' :
          websiteConfig.features.emergencyBanner.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
          'bg-sky-50 text-sky-900 border-sky-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${
              websiteConfig.features.emergencyBanner.type === 'danger' ? 'text-red-600' :
              websiteConfig.features.emergencyBanner.type === 'warning' ? 'text-amber-600' :
              websiteConfig.features.emergencyBanner.type === 'success' ? 'text-emerald-600' :
              'text-sky-600'
            }`} />
            <span className="font-semibold">{websiteConfig.features.emergencyBanner.message}</span>
          </div>

          {websiteConfig.features.emergencyBanner.actionText && (
            <button
              type="button"
              onClick={() => {
                const target = websiteConfig.features?.emergencyBanner?.actionUrl || '#admit';
                if (target === '#admit') setActiveTab('admit');
                else if (target === '#apply') setActiveTab('apply');
                else if (target === '#receipt') setActiveTab('receipt');
                else if (target.startsWith('http')) window.open(target, '_blank');
              }}
              className="px-3.5 py-1 bg-white hover:bg-slate-50 border border-current text-xs font-bold rounded cursor-pointer shadow-xs"
            >
              <span>{websiteConfig.features.emergencyBanner.actionText}</span>
              <ArrowRight className="w-3 h-3 inline ml-1" />
            </button>
          )}
        </div>
      )}

      {/* 1. Official Gazette Dispatch / Breaking Circular Ribbon */}
      {(websiteConfig.features?.tickerEnabled ?? true) && activeNotice && (
        <div className="border border-slate-300 bg-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-slate-800">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="font-bold text-[#D92D20] uppercase tracking-wider text-[11px] shrink-0 border-r border-slate-200 pr-3 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>{websiteConfig.features?.tickerPrefix || (isEnglish ? 'Official Notice' : 'দাপ্তরিক বিজ্ঞপ্তি')}</span>
            </span>
            <div className="truncate font-medium text-slate-700">
              <span>{activeNotice.title}</span>
              <span className="text-slate-500 font-normal ml-2">
                ({formatLangDate(activeNotice.date, lang)})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedNotice(activeNotice)}
            className="text-[#0272A6] hover:text-[#07243B] font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 hover:underline"
          >
            <span>{isEnglish ? 'Read Circular' : 'বিজ্ঞপ্তি পড়ুন'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. Asymmetric Broadsheet Lead Section (Editorial Institutional Centerpiece) */}
      <section className="bg-white border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Institutional Legacy & Heritage (7 of 12 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Bismillah Calligraphy */}
              <div className="border-b border-slate-100 pb-3">
                <span className="font-arabic text-lg sm:text-xl text-slate-800 tracking-wider block font-bold select-none text-left">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <span className="text-[11px] text-slate-500 font-sans tracking-wide">
                  {isEnglish ? 'In the Name of Allah, Most Gracious, Most Merciful' : 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে'}
                </span>
              </div>

              {/* Institutional Name and Motto */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider flex items-center gap-2">
                  <span>{isEnglish ? 'Education · Unity · Social Welfare' : INSTITUTION.motto}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-mono">ESTD 2000</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-bn text-[#07243B] leading-tight">
                  {isEnglish ? INSTITUTION.englishName : INSTITUTION.name}
                </h1>

                <p className="text-xs text-slate-500 font-medium">
                  {isEnglish ? 'Gallasangon, Barlekha, Moulvibazar, Bangladesh' : `${INSTITUTION.address} · সমাজসেবা অধিদপ্তর রেজিঃ ${INSTITUTION.regNo}`}
                </p>
              </div>

              {/* Institutional Editorial Overview */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                {isEnglish
                  ? 'Al-Ikhwan Islamic Social Welfare Organization is an established, non-political community welfare institution registered under the Department of Social Services, Government of Bangladesh (Reg. No: 299). Founded on January 1, 2000 in Gallasangon, Barlekha, the organization has dedicated over two decades to empowering primary and madrasah students, organizing regional merit examinations, providing emergency flood and winter relief, and advancing moral and educational development.'
                  : INSTITUTION.aboutText}
              </p>

              {/* Verified Institutional Hallmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-[11px] text-slate-500 block">{isEnglish ? 'Govt. Registration' : 'সরকারি নিবন্ধন'}</span>
                  <strong className="text-slate-900 font-bold block mt-0.5">রেজিঃ নং ২৯৯</strong>
                  <span className="text-[10px] text-slate-500 block">সমাজসেবা অধিদপ্তর</span>
                </div>

                <div className="border border-slate-200 bg-slate-50/70 p-3">
                  <span className="text-[11px] text-slate-500 block">{isEnglish ? 'Established' : 'প্রতিষ্ঠা সাল'}</span>
                  <strong className="text-slate-900 font-bold block mt-0.5">০১/০১/২০০০ ইং</strong>
                  <span className="text-[10px] text-slate-500 block">২৬ বছরের গৌরবময় পথচলা</span>
                </div>

                <div className="border border-slate-200 bg-slate-50/70 p-3 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-500 block">{isEnglish ? 'Working Area' : 'কার্যপরিধি'}</span>
                  <strong className="text-slate-900 font-bold block mt-0.5">বড়লেখা</strong>
                  <span className="text-[10px] text-slate-500 block">মৌলভীবাজার ও বিয়ানীবাজার</span>
                </div>
              </div>
            </div>

            {/* Navigational Anchor Links */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('committee')}
                className="text-xs font-semibold text-slate-700 hover:text-[#0272A6] flex items-center gap-1 cursor-pointer"
              >
                <span>{isEnglish ? 'Governing Body Directory' : 'পরিচালনা পর্ষদ তালিকা'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setActiveTab('notices')}
                className="text-xs font-semibold text-slate-700 hover:text-[#0272A6] flex items-center gap-1 cursor-pointer"
              >
                <span>{isEnglish ? 'Notice Board' : 'সকল প্রজ্ঞাপন'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">·</span>
              <a
                href="/assets/Nitimala.pdf"
                target="_blank"
                rel="noreferrer"
                download="Nitimala_2026.pdf"
                className="text-xs font-semibold text-slate-700 hover:text-[#0272A6] flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEnglish ? 'Official Rules (PDF)' : 'নীতিমালা (PDF)'}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Active Examination Dispatch / Gazetted Program (5 of 12 cols) */}
          <div className="lg:col-span-5 bg-[#07243B] text-slate-100 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Program Status Header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#0E3E6A] pb-3">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isEnglish ? 'Active Program' : 'চলমান দাপ্তরিক কর্মসূচি'}</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded border border-emerald-400/30 bg-emerald-950/60 text-emerald-300 font-bold">
                  {campaignStatus.status === 'active' ? 'আবেদন গ্রহণ চলছে' : 'আসন্ন কর্মসূচি'}
                </span>
              </div>

              {/* Program Title */}
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-white leading-snug">
                  {featuredCampaign.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {featuredCampaign.shortDescription || 'বড়লেখা উপজেলা ও বিয়ানীবাজার উপজেলার লাউতা ইউনিয়নের প্রাথমিক ও ইবতেদায়ী পর্যায়ের মেধা যাচাই পরীক্ষা।'}
                </p>
              </div>

              {/* Gazette Key Parameters */}
              <div className="border border-[#144872] bg-[#0A2F4D] divide-y divide-[#144872] text-xs">
                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 text-[11px]">পরীক্ষার তারিখ:</span>
                  <span className="font-bold text-emerald-300">
                    {featuredCampaign.examDate || '১৪/১১/২০২৬ ইং রোজ শনিবার'}
                  </span>
                </div>

                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 text-[11px]">আবেদনের শেষ তারিখ:</span>
                  <span className="font-bold text-amber-300">
                    {featuredCampaign.applicationEndDate || '২৫ অক্টোবর ২০২৫'}
                  </span>
                </div>

                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 text-[11px]">প্রতিষ্ঠান কোটা:</span>
                  <span className="font-medium text-white">
                    সর্বোচ্চ ৭ জন ছাত্র-ছাত্রী
                  </span>
                </div>

                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 text-[11px]">পরীক্ষার ফি ও মাধ্যম:</span>
                  <span className="font-bold text-white">
                    ৳১০০/- (বিকাশ ক্যাশ আউট)
                  </span>
                </div>

                <div className="p-2.5 flex justify-between items-center">
                  <span className="text-slate-300 text-[11px]">বিকাশ এজেন্ট নম্বর:</span>
                  <span className="font-mono font-bold text-amber-300">
                    ০১৭৯৭-২৬৭৯২৪
                  </span>
                </div>
              </div>

              {/* Live Countdown Clock if enabled */}
              {websiteConfig.features?.showCountdownTimer && (
                <div className="border border-[#144872] bg-[#07243B] p-3 rounded-lg space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5 font-bangla">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{websiteConfig.features.countdownTitle || 'বৃত্তি পরীক্ষা ২০২৬ শুরু হতে বাকি:'}</span>
                    </span>
                    <span className="text-3xs text-slate-400 font-mono">লাইভ</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="bg-[#0A2F4D] py-1 px-1 rounded border border-[#144872]">
                      <div className="text-sm sm:text-base font-bold text-white">{convertToBengaliNumber(timeLeft.days)}</div>
                      <div className="text-3xs text-slate-400 font-bangla">দিন</div>
                    </div>
                    <div className="bg-[#0A2F4D] py-1 px-1 rounded border border-[#144872]">
                      <div className="text-sm sm:text-base font-bold text-white">{convertToBengaliNumber(timeLeft.hours)}</div>
                      <div className="text-3xs text-slate-400 font-bangla">ঘণ্টা</div>
                    </div>
                    <div className="bg-[#0A2F4D] py-1 px-1 rounded border border-[#144872]">
                      <div className="text-sm sm:text-base font-bold text-white">{convertToBengaliNumber(timeLeft.minutes)}</div>
                      <div className="text-3xs text-slate-400 font-bangla">মিনিট</div>
                    </div>
                    <div className="bg-[#0A2F4D] py-1 px-1 rounded border border-[#144872]">
                      <div className="text-sm sm:text-base font-bold text-amber-400">{convertToBengaliNumber(timeLeft.seconds)}</div>
                      <div className="text-3xs text-slate-400 font-bangla">সেকেন্ড</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Program Action CTAs */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className="w-full py-2.5 px-4 bg-[#0272A6] hover:bg-[#065A82] text-white text-xs font-bold rounded transition shadow-2xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>{isEnglish ? 'Open Online Application' : 'অনলাইন আবেদন করুন'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('admit')}
                  className="py-2 px-3 border border-[#164871] bg-[#0A2F4D] hover:bg-[#0E3E6A] text-slate-200 text-xs font-semibold rounded text-center transition cursor-pointer"
                >
                  {isEnglish ? 'Admit Card' : 'প্রবেশপত্র'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('receipt')}
                  className="py-2 px-3 border border-[#164871] bg-[#0A2F4D] hover:bg-[#0E3E6A] text-slate-200 text-xs font-semibold rounded text-center transition cursor-pointer"
                >
                  {isEnglish ? 'Money Receipt' : 'টাকা জমার রসিদ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2B. DYNAMIC NITIMALA & MAN BONTON SECTION (Requested by User) */}
      <section 
        className="rounded-2xl border p-6 sm:p-8 space-y-6 shadow-xl transition-all"
        style={{
          backgroundColor: websiteConfig.theme.secondaryColor || '#0f172a',
          borderColor: `${websiteConfig.theme.accentColor || '#10b981'}40`
        }}
      >
        {/* Header */}
        <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{websiteConfig.icons.noticeEmoji || '📢'}</span>
              <span className="text-xs font-bold uppercase tracking-wider font-bangla" style={{ color: websiteConfig.theme.accentColor || '#10b981' }}>
                {websiteConfig.hero.badgeText || 'আল-ইখওয়ান বৃত্তি পরীক্ষা ২০২৬'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bn text-white">
              {websiteConfig.nitimala.sectionTitle || 'অংশগ্রহণ নীতিমালা ও বিষয়ভিত্তিক মান বণ্টন'}
            </h2>
            <p className="text-xs text-slate-300 font-bangla mt-1">
              {websiteConfig.nitimala.sectionSubtitle || 'আস্সালামু আলাইকুম ওয়ারাহমাতুল্লাহ — পরীক্ষা আগামী ১৪/১১/২০২৬ ইং রোজ শনিবার অনুষ্ঠিত হবে।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: websiteConfig.theme.accentColor || '#10b981' }}
            >
              <span>অনলাইন আবেদন করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 10-Point Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bangla">
          {websiteConfig.nitimala.officialRules.map((rule, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-start gap-2.5 text-slate-200"
            >
              <span 
                className="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 font-mono mt-0.5"
                style={{ backgroundColor: `${websiteConfig.theme.accentColor || '#10b981'}25`, color: websiteConfig.theme.accentColor || '#10b981' }}
              >
                {convertToBengaliNumber(idx + 1)}
              </span>
              <span className="leading-relaxed">{rule}</span>
            </div>
          ))}
        </div>

        {/* School & Madrasa Man Bonton Cards (Side by side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* School Syllabus */}
          <div className="rounded-xl p-5 border bg-black/30 space-y-3" style={{ borderColor: 'rgba(56, 189, 248, 0.3)' }}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{websiteConfig.icons.schoolEmoji || '🏫'}</span>
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 font-bangla">মান বন্টন দেখুন, স্কুল</h3>
                  <span className="text-[11px] text-slate-400 font-bangla">সাধারণ প্রাথমিক ও কিন্ডারগার্টেন শাখা</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs">
                মোট: {convertToBengaliNumber(websiteConfig.nitimala.schoolSubjects.reduce((a, b) => a + (Number(b.marks) || 0), 0))}
              </span>
            </div>

            <div className="divide-y divide-white/5 text-xs font-bangla">
              {websiteConfig.nitimala.schoolSubjects.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-slate-200">
                  <span className="font-semibold">{item.subject}</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {convertToBengaliNumber(item.marks)} নম্বর
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Madrasa Syllabus */}
          <div className="rounded-xl p-5 border bg-black/30 space-y-3" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{websiteConfig.icons.madrasaEmoji || '🕌'}</span>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300 font-bangla">মান বন্টন দেখুন, মাদ্রাসা</h3>
                  <span className="text-[11px] text-slate-400 font-bangla">ইবতেদায়ী মাদ্রাসা শাখা</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                মোট: {convertToBengaliNumber(websiteConfig.nitimala.madrasaSubjects.reduce((a, b) => a + (Number(b.marks) || 0), 0))}
              </span>
            </div>

            <div className="divide-y divide-white/5 text-xs font-bangla">
              {websiteConfig.nitimala.madrasaSubjects.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-slate-200">
                  <span className="font-semibold">{item.subject}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {convertToBengaliNumber(item.marks)} নম্বর
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contacts & Facebook Link Footer inside card */}
        <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bangla" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <span>{websiteConfig.icons.phoneEmoji || '📞'}</span> বিশেষ প্রয়োজনে যোগাযোগ:
            </span>
            {OFFICIAL_CONTACTS.map((c, idx) => (
              <a 
                key={idx} 
                href={`tel:${c.rawPhone}`}
                className="font-mono font-bold hover:underline"
                style={{ color: websiteConfig.theme.accentColor || '#10b981' }}
              >
                {c.name}: {c.phone}
              </a>
            ))}
          </div>

          <a
            href={websiteConfig.footer.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-sky-300 hover:text-white border border-[#1877F2]/40 text-xs font-semibold transition self-start sm:self-auto"
          >
            <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>ফেইসবুক আইডি / পেজ</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* 3. Leadership & Institutional Governance Directory Excerpt */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider">
              {isEnglish ? 'Executive Leadership' : 'প্রাতিষ্ঠানিক অভিভাবকত্ব ও নেতৃত্ব'}
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#07243B] mt-0.5">
              পরিচালনা পর্ষদ ও পরীক্ষা নিয়ন্ত্রণ পরিষদ (২০২৪–২০২৬ সেশন)
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('committee')}
            className="text-xs font-bold text-[#0272A6] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{isEnglish ? 'Complete Committee Roster' : 'পূর্ণাঙ্গ কমিটি তালিকা'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* President Card */}
          {president && (
            <div className="border border-slate-200 p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0272A6] block">
                    {president.designation}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">পরিচালনা পরিষদ</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
                  {president.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {president.bio || 'সংস্থার সামগ্রিক নীতিমালা প্রণয়ন এবং শিক্ষামূলক কার্যক্রমের দিকনির্দেশনায় নেতৃত্ব দিচ্ছেন।'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="text-[11px]">বিশেষ যোগাযোগ:</span>
                <a
                  href={`tel:${president.rawPhone || president.phone}`}
                  className="font-mono font-bold text-[#0272A6] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{president.phone}</span>
                </a>
              </div>
            </div>
          )}

          {/* General Secretary Card */}
          {generalSecretary && (
            <div className="border border-slate-200 p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    {generalSecretary.designation}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">দাপ্তরিক সমন্বয়</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B]">
                  {generalSecretary.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {generalSecretary.bio || 'সংস্থার সকল দাপ্তরিক কার্যক্রম, পরীক্ষা ব্যবস্থাপনা ও সমাজসেবা উদ্যোগ সমন্বয় করছেন।'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="text-[11px]">দাপ্তরিক হেল্পলাইন:</span>
                <a
                  href={`tel:${generalSecretary.rawPhone || generalSecretary.phone}`}
                  className="font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{generalSecretary.phone}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Core Institutional Welfare Pillars (Broadsheet Editorial Format) */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <div className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider">
            {isEnglish ? 'Core Objectives' : 'স্থায়ী সমাজকল্যাণ কর্মসূচি'}
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#07243B] mt-0.5">
            আল-ইখওয়ান-এর নিয়মিত সামাজিক ও শিক্ষামূলক কার্যক্রম
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-slate-200 p-4 bg-slate-50/40 space-y-2">
            <div className="w-8 h-8 rounded bg-sky-100 text-[#0272A6] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#07243B]">মেধা বৃত্তি পরীক্ষা</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              প্রাথমিক ও ইবতেদায়ী স্তরের ছাত্র-ছাত্রীদের মেধা যাচাই ও উচ্চশিক্ষায় প্রণোদনা দিতে প্রতিবছর বৃত্তি পরীক্ষা আয়োজন।
            </p>
          </div>

          <div className="border border-slate-200 p-4 bg-slate-50/40 space-y-2">
            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#07243B]">ত্রাণ ও মানবিক সহায়তা</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বন্যা ও প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্তদের খাদ্যসামগ্রী, জরুরি পুনর্বাসন এবং শীতার্তদের মধ্যে শীতবস্ত্র বিতরণ।
            </p>
          </div>

          <div className="border border-slate-200 p-4 bg-slate-50/40 space-y-2">
            <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#07243B]">উন্মুক্ত পাঠাগার ও শিক্ষা</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              যুবসমাজ ও শিশুদের মধ্যে নৈতিক ও ইসলামী বই পড়ার অভ্যাস গড়ে তুলতে পাঠাগার ও নিয়মিত গ্রন্থ বিতরণ কার্যক্রম।
            </p>
          </div>

          <div className="border border-slate-200 p-4 bg-slate-50/40 space-y-2">
            <div className="w-8 h-8 rounded bg-slate-200 text-slate-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#07243B]">যুব সংস্কার ও সবুজায়ন</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              মাদকমুক্ত সমাজ বিনির্মাণে সামাজিক সচেতনতা, বৃক্ষরোপণ অভিযান এবং যুবসমাজকে সমাজসেবায় সম্পৃক্তকরণ।
            </p>
          </div>
        </div>
      </section>

      {/* 4B. Quick Statistics Counter Cards (Website Editor Controlled) */}
      {websiteConfig.features?.statsCountersEnabled && (websiteConfig.features.stats?.length || 0) > 0 && (
        <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider">
                {isEnglish ? 'Key Statistics' : 'এক নজরে পরিসংখ্যান'}
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#07243B] mt-0.5">
                {websiteConfig.features.statsTitle || 'বৃত্তি পরীক্ষা ২০২৬ — মূল পরিসংখ্যান'}
              </h2>
            </div>
            <BarChart3 className="w-5 h-5 text-[#0272A6]" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {websiteConfig.features.stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-1">
                <div className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#07243B] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-800 font-bangla">
                  {stat.label}
                </div>
                {stat.sub && (
                  <div className="text-2xs text-slate-500 font-bangla">
                    {stat.sub}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4C. Scholarship Awards & Incentive Showcase (Website Editor Controlled) */}
      {websiteConfig.features?.awardsEnabled && (websiteConfig.features.awards?.length || 0) > 0 && (
        <section className="bg-gradient-to-br from-[#07243B] to-[#0A2F4D] text-white p-6 sm:p-8 rounded-2xl border border-sky-900/50 shadow-lg space-y-6">
          <div className="border-b border-sky-800/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{isEnglish ? 'Scholarships & Grants' : 'বৃত্তি ও আর্থিক পুরস্কার'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-bn text-white">
                {websiteConfig.features.awardsTitle || 'মেধাবৃত্তি ও সম্মাননা পুরস্কারসমূহ'}
              </h2>
              <p className="text-xs text-slate-300 font-bangla mt-1">
                {websiteConfig.features.awardsSubtitle || 'কৃতি শিক্ষার্থীদের উচ্চশিক্ষায় অনুপ্রেরণা যোগাতে সংস্থার বিশেষ আর্থিক অনুদান ও সম্মাননা'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold font-bangla transition shadow cursor-pointer shrink-0"
            >
              বৃত্তি পরীক্ষায় অংশ নিন →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {websiteConfig.features.awards.map((award, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-3xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {award.badge}
                  </span>
                  <h3 className="text-sm font-bold font-serif-bn text-white">
                    {award.title}
                  </h3>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    {award.amount}
                  </div>
                </div>
                <p className="text-2xs text-slate-300 border-t border-white/10 pt-2 leading-relaxed font-bangla">
                  {award.perks}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4D. Exam Centers Guide (Website Editor Controlled) */}
      {websiteConfig.features?.examCentersEnabled && (websiteConfig.features.examCenters?.length || 0) > 0 && (
        <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{isEnglish ? 'Examination Centers' : 'পরীক্ষা কেন্দ্র গাইড'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#07243B] mt-0.5">
                {websiteConfig.features.examCentersTitle || 'নির্ধারিত পরীক্ষা কেন্দ্রসমূহ ও দিকনির্দেশনা'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {websiteConfig.features.examCenters.map((center, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white space-y-2.5 transition">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#07243B] font-serif-bn leading-tight">
                    {center.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-3xs font-mono font-bold border border-rose-200 shrink-0">
                    {center.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600 flex items-start gap-1.5 font-bangla">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{center.address}</span>
                </p>
                <div className="text-2xs text-slate-500 bg-white p-2.5 rounded border border-slate-200 font-bangla">
                  {center.instructions}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4E. FAQ Accordion Section (Website Editor Controlled) */}
      {websiteConfig.features?.showFaqSection && (websiteConfig.features.faqs?.length || 0) > 0 && (
        <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isEnglish ? 'Frequently Asked Questions' : 'জিজ্ঞাসিত প্রশ্নাবলী'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#07243B] mt-0.5">
                {websiteConfig.features.faqsTitle || 'বৃত্তি পরীক্ষা সংক্রান্ত সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)'}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {websiteConfig.features.faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden transition">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left font-bangla font-bold text-xs sm:text-sm text-[#07243B] bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#0272A6] shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed font-bangla border-t border-slate-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Photographic & Video Archive Grid (Exact layout from image (2).png) */}
      <GallerySection isHomePageView={true} setActiveTab={setActiveTab} lang={lang} />

      {/* Lightbox / Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xs">
          <div className="bg-white max-w-4xl w-full border border-slate-300 shadow-2xl overflow-hidden">
            <div className="p-3 bg-[#07243B] text-white flex items-center justify-between">
              <span className="text-xs font-bold">{selectedMedia.titleBn}</span>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedMedia.mediaUrl}
                alt={selectedMedia.titleBn}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-3 bg-slate-50 text-xs text-slate-600 border-t border-slate-200">
              {selectedMedia.descriptionBn}
            </div>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-2xs">
          <div className="bg-white max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#D92D20] uppercase tracking-wider block">
                  দাপ্তরিক প্রজ্ঞাপন · {formatLangDate(selectedNotice.date, lang)}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#07243B] mt-0.5">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed max-h-[50vh] overflow-y-auto">
              {selectedNotice.content}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-1.5 border border-slate-300 text-xs text-slate-700 font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedNotice(null);
                  setActiveTab('apply');
                }}
                className="px-4 py-1.5 bg-[#0272A6] hover:bg-[#065A82] text-white text-xs font-bold cursor-pointer"
              >
                অনলাইন আবেদন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
