import React, { useState, useEffect } from 'react';
import { Notice } from '../types';
import { storage } from '../services/storage';
import { SupportedLang, formatLangDate } from '../utils/i18n';
import { Search, ArrowRight, X, Printer, FileText, Bell } from 'lucide-react';
import { Logo } from './Logo';

interface NoticeBoardViewProps {
  onSelectNotice?: (notice: Notice) => void;
  selectedNoticeModal?: Notice | null;
  onCloseNoticeModal?: () => void;
  lang?: SupportedLang;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  onSelectNotice,
  selectedNoticeModal,
  onCloseNoticeModal,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [notices, setNotices] = useState<Notice[]>(() => storage.getNotices());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setNotices(storage.getNotices());
    });
    return unsub;
  }, []);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalModal, setInternalModal] = useState<Notice | null>(selectedNoticeModal || null);

  const categories = [
    { id: 'all', bn: 'সব বিজ্ঞপ্তি', en: 'All Circulars' },
    { id: 'urgent', bn: 'জরুরি', en: 'Urgent' },
    { id: 'syllabus', bn: 'সিলেবাস', en: 'Syllabus' },
    { id: 'general', bn: 'সাধারণ', en: 'General' },
    { id: 'results', bn: 'ফলাফল', en: 'Results' }
  ];

  const filteredNotices = notices.filter(n => {
    let catMatch = true;
    if (activeCategory !== 'all') {
      const activeObj = categories.find(c => c.id === activeCategory);
      if (activeObj) {
        catMatch = n.category === activeObj.bn;
      }
    }
    const matchesQuery = !searchQuery.trim() || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && matchesQuery;
  });

  const handleOpenNotice = (n: Notice) => {
    setInternalModal(n);
    if (onSelectNotice) onSelectNotice(n);
  };

  const handleClose = () => {
    setInternalModal(null);
    if (onCloseNoticeModal) onCloseNoticeModal();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Official Gazette Masthead */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-3">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider block">
            {isEnglish ? 'Official Circulars & Executive Notifications' : 'প্রাতিষ্ঠানিক প্রজ্ঞাপন ও দাপ্তরিক গেজেট'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#07243B] mt-1">
            {isEnglish ? 'Official Notice Board' : 'দাপ্তরিক নোটিশ বোর্ড'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEnglish
              ? 'Official circulars, examination schedule revisions, and administrative decisions from the Examination Control Council.'
              : 'বৃত্তি পরীক্ষা সংক্রান্ত প্রাতিষ্ঠানিক প্রজ্ঞাপন, সময়সূচি, ফলাফল ও দাপ্তরিক বিজ্ঞপ্তি।'}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 text-xs font-semibold transition cursor-pointer border ${
                  activeCategory === c.id
                    ? 'bg-[#07243B] text-white border-[#07243B] font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isEnglish ? c.en : c.bn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={isEnglish ? 'Search notices...' : 'বিজ্ঞপ্তি খুঁজুন...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 pl-8 pr-3 py-1.5 border border-slate-200 text-xs bg-white focus:border-[#0272A6] outline-none"
            />
          </div>
        </div>
      </section>

      {/* Gazette Listing */}
      <section className="bg-white border border-slate-200 divide-y divide-slate-200">
        {filteredNotices.length > 0 ? (
          filteredNotices.map(n => (
            <div
              key={n.id}
              onClick={() => handleOpenNotice(n)}
              className={`p-5 sm:p-6 transition cursor-pointer hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                n.isPinned ? 'bg-amber-50/20' : ''
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                    n.category === 'জরুরি'
                      ? 'bg-red-50 text-[#D92D20] border-red-200'
                      : n.category === 'ফলাফল'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {n.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    তারিখ: {formatLangDate(n.date, lang)}
                  </span>
                  {n.isPinned && (
                    <span className="text-[10px] font-bold text-amber-700 font-mono">
                      [গুরুত্বপূর্ণ]
                    </span>
                  )}
                </div>

                <h2 className="text-sm sm:text-base font-bold text-[#07243B] hover:text-[#0272A6] transition-colors leading-snug">
                  {n.title}
                </h2>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {n.content}
                </p>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0272A6] hover:underline">
                  <span>{isEnglish ? 'View Full Circular' : 'সম্পূর্ণ পড়ুন'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center space-y-2 text-slate-500 text-xs">
            <Bell className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="font-semibold">{isEnglish ? 'No circulars found' : 'কোনো বিজ্ঞপ্তি পাওয়া যায়নি'}</p>
          </div>
        )}
      </section>

      {/* Notice Detail Gazette Modal */}
      {internalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xs">
          <div className="bg-white max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Gazette Masthead */}
            <div className="bg-[#07243B] text-white p-5 flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-12 shrink-0 p-1 bg-white/10 rounded">
                  <Logo className="w-full h-full" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                    দাপ্তরিক গেজেট প্রজ্ঞাপন · {formatLangDate(internalModal.date, lang)}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-serif-bn text-white leading-snug">
                    {internalModal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200 p-5 bg-slate-50/50">
                {internalModal.content}
              </div>

              <div className="pt-2 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-t border-slate-200">
                <span>আদেশক্রমে: পরীক্ষা নিয়ন্ত্রণ পরিষদ</span>
                <span>আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা (রেজিঃ ২৯৯)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 bg-[#0272A6] hover:bg-[#065A82] text-white text-xs font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
