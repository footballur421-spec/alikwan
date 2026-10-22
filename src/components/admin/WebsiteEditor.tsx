import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Phone, 
  Share2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ExternalLink,
  Eye,
  Sliders,
  Layers,
  AlertTriangle,
  Clock,
  MessageCircle,
  HelpCircle,
  BarChart3,
  Trophy,
  MapPin,
  Bell,
  Grid,
  Check,
  ChevronRight
} from 'lucide-react';
import { 
  WebsiteEditorConfig, 
  DEFAULT_WEBSITE_EDITOR_CONFIG, 
  SyllabusItem,
  WebsiteFaqItem,
  WebsiteStatItem,
  WebsiteAwardItem,
  WebsiteExamCenterItem
} from '../../types';
import { storage } from '../../services/storage';
import { convertToBengaliNumber } from '../../utils/validation';

interface WebsiteEditorProps {
  onSaved?: () => void;
}

type TabType = 
  | 'theme' 
  | 'emergency_ticker'
  | 'countdown_helpline'
  | 'faqs_manager'
  | 'stats_awards'
  | 'exam_centers'
  | 'hero' 
  | 'nitimala' 
  | 'manbonton' 
  | 'gallery_notices'
  | 'footer';

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({ onSaved }) => {
  const [config, setConfig] = useState<WebsiteEditorConfig>(() => storage.getWebsiteEditorConfig());
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setConfig(storage.getWebsiteEditorConfig());
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    await storage.updateWebsiteEditorConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (onSaved) onSaved();
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি ওয়েবসাইট এডিটরের সকল পরিবর্তন রিসেট করে ডিফল্ট সেটিংসে ফিরিয়ে নিতে চান?')) {
      const def = storage.resetWebsiteEditorConfig();
      setConfig(def);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSaved) onSaved();
    }
  };

  // Safe accessor for features
  const features = config.features || DEFAULT_WEBSITE_EDITOR_CONFIG.features!;

  const updateFeatures = (updater: (prev: typeof features) => typeof features) => {
    setConfig(prev => ({
      ...prev,
      features: updater(prev.features || DEFAULT_WEBSITE_EDITOR_CONFIG.features!)
    }));
  };

  // Syllabus management
  const handleAddSyllabusItem = (type: 'school' | 'madrasa') => {
    const targetKey = type === 'school' ? 'schoolSubjects' : 'madrasaSubjects';
    const newItem: SyllabusItem = {
      id: `${type}-${Date.now()}`,
      subject: 'নতুন বিষয়',
      marks: 20,
      details: 'সিলেবাস ও পাঠ্যপুস্তকের বিবরণ'
    };
    setConfig(prev => ({
      ...prev,
      nitimala: {
        ...prev.nitimala,
        [targetKey]: [...prev.nitimala[targetKey], newItem]
      }
    }));
  };

  const handleRemoveSyllabusItem = (type: 'school' | 'madrasa', index: number) => {
    const targetKey = type === 'school' ? 'schoolSubjects' : 'madrasaSubjects';
    const list = [...config.nitimala[targetKey]];
    list.splice(index, 1);
    setConfig(prev => ({
      ...prev,
      nitimala: { ...prev.nitimala, [targetKey]: list }
    }));
  };

  const handleUpdateSyllabusItem = (
    type: 'school' | 'madrasa', 
    index: number, 
    field: keyof SyllabusItem, 
    val: any
  ) => {
    const targetKey = type === 'school' ? 'schoolSubjects' : 'madrasaSubjects';
    const list = [...config.nitimala[targetKey]];
    list[index] = { ...list[index], [field]: val };
    setConfig(prev => ({
      ...prev,
      nitimala: { ...prev.nitimala, [targetKey]: list }
    }));
  };

  // Rules management
  const handleAddRule = () => {
    setConfig(prev => ({
      ...prev,
      nitimala: {
        ...prev.nitimala,
        officialRules: [
          ...prev.nitimala.officialRules, 
          `${convertToBengaliNumber(prev.nitimala.officialRules.length + 1)}। নতুন নীতিমালা বা নিয়ম এখানে লিখুন`
        ]
      }
    }));
  };

  const handleRemoveRule = (idx: number) => {
    const list = [...config.nitimala.officialRules];
    list.splice(idx, 1);
    setConfig(prev => ({
      ...prev,
      nitimala: { ...prev.nitimala, officialRules: list }
    }));
  };

  const handleUpdateRule = (idx: number, val: string) => {
    const list = [...config.nitimala.officialRules];
    list[idx] = val;
    setConfig(prev => ({
      ...prev,
      nitimala: { ...prev.nitimala, officialRules: list }
    }));
  };

  // FAQ management
  const handleAddFaq = () => {
    const newFaq: WebsiteFaqItem = {
      id: `faq-${Date.now()}`,
      question: 'নতুন প্রশ্ন এখানে লিখুন...',
      answer: 'এখানে বিস্তারিত উত্তর প্রদান করুন...'
    };
    updateFeatures(f => ({
      ...f,
      faqs: [...f.faqs, newFaq]
    }));
  };

  const handleRemoveFaq = (id: string) => {
    updateFeatures(f => ({
      ...f,
      faqs: f.faqs.filter(item => item.id !== id)
    }));
  };

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', val: string) => {
    updateFeatures(f => ({
      ...f,
      faqs: f.faqs.map(item => item.id === id ? { ...item, [field]: val } : item)
    }));
  };

  // Exam Center management
  const handleAddCenter = () => {
    const newCenter: WebsiteExamCenterItem = {
      name: 'নতুন পরীক্ষা কেন্দ্র',
      code: `কেন্দ্র কোড: ${100 + (features.examCenters?.length || 0) + 1}`,
      address: 'কেন্দ্রের ঠিকানা ও অবস্থান',
      instructions: 'পরীক্ষার্থীদের জন্য বিশেষ দিকনির্দেশনা'
    };
    updateFeatures(f => ({
      ...f,
      examCenters: [...(f.examCenters || []), newCenter]
    }));
  };

  const handleRemoveCenter = (idx: number) => {
    updateFeatures(f => {
      const list = [...(f.examCenters || [])];
      list.splice(idx, 1);
      return { ...f, examCenters: list };
    });
  };

  const handleUpdateCenter = (idx: number, field: keyof WebsiteExamCenterItem, val: string) => {
    updateFeatures(f => {
      const list = [...(f.examCenters || [])];
      list[idx] = { ...list[idx], [field]: val };
      return { ...f, examCenters: list };
    });
  };

  const schoolTotalMarks = config.nitimala.schoolSubjects.reduce((acc: number, curr: SyllabusItem) => acc + (Number(curr.marks) || 0), 0);
  const madrasaTotalMarks = config.nitimala.madrasaSubjects.reduce((acc: number, curr: SyllabusItem) => acc + (Number(curr.marks) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Bar with Shopify-like header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sliders className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-bangla">ওয়েবসাইট লাইভ এডিটর ও কাস্টমাইজার</h2>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                12+ Flexible Modules
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bangla">
              ওয়েবসাইটের রঙ, ব্যানার, কাউন্টডাউন, হোয়াটসঅ্যাপ হেল্পলাইন, FAQ, পরিসংখ্যান, অ্যাওয়ার্ড ও সিলেবাস পরিবর্তন করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold font-bangla flex items-center gap-1.5 transition-all ${
              showLivePreview 
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showLivePreview ? 'লাইভ প্রিভিউ বন্ধ করুন' : 'লাইভ প্রিভিউ দেখুন'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-semibold font-bangla text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold font-bangla text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তন সেভ করুন</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm font-bangla flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>ওয়েবসাইট এডিটরের পরিবর্তনসমূহ ক্লাউড ফায়ারবেসে সফলভাবে সেভ হয়েছে এবং পুরো সাইটে তাৎক্ষণিক প্রতিফলিত হচ্ছে!</span>
        </div>
      )}

      {/* Editor Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-700/80 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'theme', label: 'রং ও থিম', icon: Palette },
          { id: 'emergency_ticker', label: '১. অ্যালার্ট ব্যানার ও টিকিউ', icon: AlertTriangle },
          { id: 'countdown_helpline', label: '২. কাউন্টডাউন ও হোয়াটসঅ্যাপ', icon: Clock },
          { id: 'faqs_manager', label: '৩. FAQ প্রশ্নাবলী ম্যানেজার', icon: HelpCircle },
          { id: 'stats_awards', label: '৪. পরিসংখ্যান ও অ্যাওয়ার্ড', icon: Trophy },
          { id: 'exam_centers', label: '৫. পরীক্ষা কেন্দ্র গাইড', icon: MapPin },
          { id: 'hero', label: '৬. হিরো সেকশন ও টেক্সট', icon: Layers },
          { id: 'nitimala', label: '৭. নীতিমালা (১০টি নিয়ম)', icon: FileText },
          { id: 'manbonton', label: '৮. সিলেবাস ও মানবন্টন', icon: BookOpen },
          { id: 'gallery_notices', label: '৯. গ্যালারি ও নোটিশ বোর্ড', icon: Grid },
          { id: 'footer', label: '১০. ফুটার ও সোশ্যাল ব্র্যান্ডিং', icon: Share2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all font-bangla ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Preview Panel (Shopify Style) */}
      {showLivePreview && (
        <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900/90 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">রিয়েল-টাইম লাইভ প্রিভিউ</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Primary: {config.theme.primaryColor} • Accent: {config.theme.accentColor}
            </div>
          </div>

          {/* Mini Preview Box */}
          <div 
            className="rounded-xl p-5 border text-white transition-all shadow-inner space-y-3"
            style={{ 
              backgroundColor: config.theme.backgroundColor || '#0b132b',
              borderColor: config.theme.primaryColor || '#1e3a8a'
            }}
          >
            {/* Emergency preview */}
            {features.emergencyBanner?.enabled && (
              <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                features.emergencyBanner.type === 'danger' ? 'bg-red-900 text-red-100 border border-red-700' :
                features.emergencyBanner.type === 'warning' ? 'bg-amber-900 text-amber-100 border border-amber-700' :
                features.emergencyBanner.type === 'success' ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' :
                'bg-sky-900 text-sky-100 border border-sky-700'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{features.emergencyBanner.message}</span>
                </div>
                {features.emergencyBanner.actionText && (
                  <span className="underline text-2xs cursor-pointer">{features.emergencyBanner.actionText}</span>
                )}
              </div>
            )}

            {/* Title preview */}
            <div className="flex items-center justify-between gap-4">
              <span 
                className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                style={{ backgroundColor: `${config.theme.primaryColor}33`, color: config.theme.accentColor }}
              >
                <span>{config.icons.noticeEmoji}</span>
                {config.hero.badgeText}
              </span>
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: config.theme.highlightColor, color: '#000' }}
              >
                {config.hero.programTag}
              </span>
            </div>

            <h3 className="text-xl font-bold font-bangla" style={{ color: '#ffffff' }}>
              {config.hero.titleBn}
            </h3>
            <p className="text-xs font-bangla text-slate-300">
              {config.hero.subtitleBn}
            </p>

            {/* Countdown mini */}
            {features.showCountdownTimer && (
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {features.countdownTitle}
                </span>
                <span className="font-mono text-amber-400 font-bold">১৪ নভেম্বর ২০২৬</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Theme & Colors */}
      {activeTab === 'theme' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-bangla">ওয়েবসাইট কালার প্যালেট ও থিম প্রিসেট</h3>
              <p className="text-xs text-slate-400 font-bangla">এক ক্লিকে প্রিসেট নির্বাচন করুন অথবা নিজস্ব রঙ নির্ধারণ করুন</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfig(prev => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      primaryColor: '#07243B',
                      secondaryColor: '#0272A6',
                      accentColor: '#10b981',
                      highlightColor: '#F59E0B',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'serif'
                    }
                  }));
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 font-bangla"
              >
                অফিসিয়াল নেভি প্রিসেট
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfig(prev => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      primaryColor: '#7B1159',
                      secondaryColor: '#0099DA',
                      accentColor: '#D97706',
                      highlightColor: '#F59E0B',
                      backgroundColor: '#FFFFFF',
                      fontFamily: 'serif'
                    }
                  }));
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bangla"
              >
                রয়েল মেরুন প্রিসেট
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Primary Color */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-bangla block">
                Primary Brand Color (হেডার ও মূল রঙ)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.theme.primaryColor}
                  onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={config.theme.primaryColor}
                  onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-bangla block">
                Secondary Color (বাটন ও লিংক রঙ)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.theme.secondaryColor}
                  onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value } }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={config.theme.secondaryColor}
                  onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value } }))}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <label className="text-xs font-semibold text-slate-300 font-bangla block">
                Accent Color (হাইলাইট ও ব্যাজ)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.theme.accentColor}
                  onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, accentColor: e.target.value } }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={config.theme.accentColor}
                  onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, accentColor: e.target.value } }))}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Emergency Banner & News Ticker Controls */}
      {activeTab === 'emergency_ticker' && (
        <div className="space-y-6">
          {/* Emergency Alert Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>জরুরি ব্রডকাস্ট ব্যানার (Emergency Broadcast Banner)</span>
                </h3>
                <p className="text-xs text-slate-400 font-bangla">
                  ওয়েবসাইটের সবচেয়ে শীর্ষে বিশেষ জরুরি ঘোষণা, আবহাওয়া বা সময় বৃদ্ধির বার্তা প্রদর্শন করুন
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.emergencyBanner?.enabled || false}
                  onChange={e => updateFeatures(f => ({
                    ...f,
                    emergencyBanner: {
                      ...f.emergencyBanner,
                      enabled: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-4 text-xs font-bangla">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ব্যানার মেসেজ / জরুরি বার্তা</label>
                <textarea
                  rows={2}
                  value={features.emergencyBanner?.message || ''}
                  onChange={e => updateFeatures(f => ({
                    ...f,
                    emergencyBanner: { ...f.emergencyBanner, message: e.target.value }
                  }))}
                  placeholder="জরুরি বার্তা এখানে লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ব্যানারের ধরন / রঙ</label>
                  <select
                    value={features.emergencyBanner?.type || 'info'}
                    onChange={e => updateFeatures(f => ({
                      ...f,
                      emergencyBanner: { ...f.emergencyBanner, type: e.target.value as any }
                    }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="danger">লাল (Danger / চরম সতর্কতা)</option>
                    <option value="warning">হলুদ / আম্বার (Warning / সতর্কতা)</option>
                    <option value="info">নীল (Info / সাধারণ তথ্য)</option>
                    <option value="success">সবুজ (Success / শুভ সংবাদ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">অ্যাকশন বাটন টেক্সট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={features.emergencyBanner?.actionText || ''}
                    onChange={e => updateFeatures(f => ({
                      ...f,
                      emergencyBanner: { ...f.emergencyBanner, actionText: e.target.value }
                    }))}
                    placeholder="যেমন: প্রবেশপত্র ডাউনলোড"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">অ্যাকশন লিংক বা ট্যাব আইডি</label>
                  <input
                    type="text"
                    value={features.emergencyBanner?.actionUrl || ''}
                    onChange={e => updateFeatures(f => ({
                      ...f,
                      emergencyBanner: { ...f.emergencyBanner, actionUrl: e.target.value }
                    }))}
                    placeholder="যেমন: #admit বা https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* News Ticker Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-400" />
                  <span>ব্রেকিং সার্কুলার রিবন / নিউজ টিকিউ কন্ট্রোল</span>
                </h3>
                <p className="text-xs text-slate-400 font-bangla">
                  হোমপেজের শীর্ষ নোটিশ রিবন প্রদর্শন ও গতি নিয়ন্ত্রণ
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.tickerEnabled ?? true}
                  onChange={e => updateFeatures(f => ({ ...f, tickerEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bangla">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">টিকিউ প্রিফিক্স ব্যাজ টেক্সট</label>
                <input
                  type="text"
                  value={features.tickerPrefix || 'দাপ্তরিক জরুরি বিজ্ঞপ্তি'}
                  onChange={e => updateFeatures(f => ({ ...f, tickerPrefix: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">টিকিউ অ্যানিমেশন স্পিড</label>
                <select
                  value={features.tickerSpeed || 'normal'}
                  onChange={e => updateFeatures(f => ({ ...f, tickerSpeed: e.target.value as any }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="slow">ধীরগতি (Slow - পড়ার সুবিধার্থে)</option>
                  <option value="normal">স্বাভাবিক (Normal)</option>
                  <option value="fast">দ্রুতগতি (Fast)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Countdown & Floating WhatsApp Helpline */}
      {activeTab === 'countdown_helpline' && (
        <div className="space-y-6">
          {/* Countdown Timer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>পরীক্ষার লাইভ কাউন্টডাউন টাইমার (Exam Countdown Clock)</span>
                </h3>
                <p className="text-xs text-slate-400 font-bangla">
                  পরীক্ষার দিন পর্যন্ত দিন, ঘণ্টা, মিনিট ও সেকেন্ডের রিয়েল-টাইম কাউন্টডাউন ক্লক
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.showCountdownTimer}
                  onChange={e => updateFeatures(f => ({ ...f, showCountdownTimer: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bangla">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">কাউন্টডাউন শিরোনাম</label>
                <input
                  type="text"
                  value={features.countdownTitle || 'বৃত্তি পরীক্ষা ২০২৬ শুরু হতে বাকি'}
                  onChange={e => updateFeatures(f => ({ ...f, countdownTitle: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">পরীক্ষার তারিখ ও সময় (Target Date & Time)</label>
                <input
                  type="datetime-local"
                  value={features.countdownTargetDate?.slice(0, 16) || '2026-11-14T10:00'}
                  onChange={e => updateFeatures(f => ({ ...f, countdownTargetDate: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Floating WhatsApp / Helpline Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>ফ্লোটিং হোয়াটসঅ্যাপ ও তাৎক্ষণিক সহায়তা বাটন</span>
                </h3>
                <p className="text-xs text-slate-400 font-bangla">
                  ব্যবহারকারীরা যেকোনো পেজ থেকে এক ক্লিকে হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করতে পারবেন
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.showFloatingHelpline}
                  onChange={e => updateFeatures(f => ({ ...f, showFloatingHelpline: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bangla">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">হোয়াটসঅ্যাপ / হেল্পলাইন নম্বর</label>
                <input
                  type="text"
                  value={features.floatingHelplineNumber || '01750-969712'}
                  onChange={e => updateFeatures(f => ({ ...f, floatingHelplineNumber: e.target.value }))}
                  placeholder="01750-969712"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">টুলটিপ অভিবাদন বার্তা</label>
                <input
                  type="text"
                  value={features.floatingHelplineText || 'জরুরি হেল্পলাইন ও হোয়াটসঅ্যাপ সহায়তা'}
                  onChange={e => updateFeatures(f => ({ ...f, floatingHelplineText: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">স্ক্রিন পজিশন</label>
                <select
                  value={features.floatingHelplinePosition || 'right'}
                  onChange={e => updateFeatures(f => ({ ...f, floatingHelplinePosition: e.target.value as any }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="right">ডান পাশে (Bottom Right - স্ট্যান্ডার্ড)</option>
                  <option value="left">বাম পাশে (Bottom Left)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ Accordion Manager */}
      {activeTab === 'faqs_manager' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <span>সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ Accordion Manager)</span>
              </h3>
              <p className="text-xs text-slate-400 font-bangla">
                শিক্ষার্থী ও অভিভাবকদের সাধারণ প্রশ্নের উত্তর যুক্ত বা পরিবর্তন করুন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-bangla">
                <input
                  type="checkbox"
                  checked={features.showFaqSection}
                  onChange={e => updateFeatures(f => ({ ...f, showFaqSection: e.target.checked }))}
                  className="rounded text-emerald-500"
                />
                <span>হোমপেজে FAQ প্রদর্শন চালু রাখুন</span>
              </label>

              <button
                type="button"
                onClick={handleAddFaq}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-bangla text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন FAQ যোগ করুন</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-bangla">সেকশন শিরোনাম</label>
              <input
                type="text"
                value={features.faqsTitle || 'বৃত্তি পরীক্ষা সংক্রান্ত সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)'}
                onChange={e => updateFeatures(f => ({ ...f, faqsTitle: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-3">
              {(features.faqs || []).map((faq, index) => (
                <div key={faq.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      প্রশ্ন #{convertToBengaliNumber(index + 1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(faq.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={faq.question}
                    onChange={e => handleUpdateFaq(faq.id, 'question', e.target.value)}
                    placeholder="প্রশ্ন লিখুন..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bangla font-semibold"
                  />

                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={e => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                    placeholder="উত্তর লিখুন..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-bangla"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Quick Stats Counters & Scholarship Awards */}
      {activeTab === 'stats_awards' && (
        <div className="space-y-6">
          {/* Quick Stats Counters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>পরিসংখ্যান কাউন্টার কার্ড (Quick Stat Counters)</span>
                </h3>
                <p className="text-xs text-slate-400 font-bangla">
                  হোমপেজে সংস্থার অর্জন ও পরীক্ষার মূল পরিসংখ্যান প্রদর্শন করুন
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.statsCountersEnabled ?? true}
                  onChange={e => updateFeatures(f => ({ ...f, statsCountersEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(features.stats || []).map((stat, idx) => (
                <div key={idx} className="p-3.5 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2 text-xs font-bangla">
                  <span className="text-2xs font-mono text-emerald-400 block font-bold">কার্ড #{convertToBengaliNumber(idx + 1)}</span>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => {
                      const updated = [...features.stats];
                      updated[idx] = { ...updated[idx], value: e.target.value };
                      updateFeatures(f => ({ ...f, stats: updated }));
                    }}
                    placeholder="সংখ্যা যেমন: ৭০০+"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => {
                      const updated = [...features.stats];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      updateFeatures(f => ({ ...f, stats: updated }));
                    }}
                    placeholder="লেবেল"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  />
                  <input
                    type="text"
                    value={stat.sub || ''}
                    onChange={e => {
                      const updated = [...features.stats];
                      updated[idx] = { ...updated[idx], sub: e.target.value };
                      updateFeatures(f => ({ ...f, stats: updated }));
                    }}
                    placeholder="সাব-টেক্সট"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-2xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Scholarship Awards & Incentives */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>মেধাবৃত্তি ও সম্মাননা পুরস্কারসমূহ (Awards Showcase)</span>
                </h3>
                <p className="text-xs text-slate-400 font-bangla">
                  ট্যালেন্টপুল, সাধারণ গ্রেড ও বিশেষ ক্যাটাগরির পুরস্কারের তালিকা কাস্টমাইজ করুন
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.awardsEnabled ?? true}
                  onChange={e => updateFeatures(f => ({ ...f, awardsEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(features.awards || []).map((award, idx) => (
                <div key={idx} className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2 text-xs font-bangla">
                  <div className="flex justify-between items-center">
                    <span className="text-2xs font-mono text-amber-400 font-bold">ক্যাটাগরি #{convertToBengaliNumber(idx + 1)}</span>
                    <input
                      type="text"
                      value={award.badge}
                      onChange={e => {
                        const updated = [...features.awards];
                        updated[idx] = { ...updated[idx], badge: e.target.value };
                        updateFeatures(f => ({ ...f, awards: updated }));
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-3xs font-bold text-white w-20 text-center"
                    />
                  </div>

                  <input
                    type="text"
                    value={award.title}
                    onChange={e => {
                      const updated = [...features.awards];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      updateFeatures(f => ({ ...f, awards: updated }));
                    }}
                    placeholder="পুরস্কারের নাম"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                  />

                  <input
                    type="text"
                    value={award.amount}
                    onChange={e => {
                      const updated = [...features.awards];
                      updated[idx] = { ...updated[idx], amount: e.target.value };
                      updateFeatures(f => ({ ...f, awards: updated }));
                    }}
                    placeholder="আর্থিক অনুদান / পরিমাণ"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono"
                  />

                  <textarea
                    rows={2}
                    value={award.perks}
                    onChange={e => {
                      const updated = [...features.awards];
                      updated[idx] = { ...updated[idx], perks: e.target.value };
                      updateFeatures(f => ({ ...f, awards: updated }));
                    }}
                    placeholder="সুবিধাসমূহ ও সনদপত্র..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-2xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Exam Centers Guide */}
      {activeTab === 'exam_centers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                <span>নির্ধারিত পরীক্ষা কেন্দ্রসমূহ ও দিকনির্দেশনা (Exam Centers)</span>
              </h3>
              <p className="text-xs text-slate-400 font-bangla">
                পরীক্ষা কেন্দ্রের কোড, পূর্ণ ঠিকানা ও হলরুম সংক্রান্ত নির্দেশনা নির্ধারণ করুন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-bangla">
                <input
                  type="checkbox"
                  checked={features.examCentersEnabled ?? true}
                  onChange={e => updateFeatures(f => ({ ...f, examCentersEnabled: e.target.checked }))}
                  className="rounded text-emerald-500"
                />
                <span>হোমপেজে কেন্দ্র গাইড প্রদর্শন করুন</span>
              </label>

              <button
                type="button"
                onClick={handleAddCenter}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-bangla text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন কেন্দ্র যোগ করুন</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(features.examCenters || []).map((center, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3 text-xs font-bangla">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    কেন্দ্র #{convertToBengaliNumber(idx + 1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCenter(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">কেন্দ্রের নাম</label>
                    <input
                      type="text"
                      value={center.name}
                      onChange={e => handleUpdateCenter(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">কেন্দ্র কোড</label>
                    <input
                      type="text"
                      value={center.code}
                      onChange={e => handleUpdateCenter(idx, 'code', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">কেন্দ্রের ঠিকানা ও অবস্থান</label>
                    <input
                      type="text"
                      value={center.address}
                      onChange={e => handleUpdateCenter(idx, 'address', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">রোল ও রুমের দিকনির্দেশনা</label>
                    <input
                      type="text"
                      value={center.instructions}
                      onChange={e => handleUpdateCenter(idx, 'instructions', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Hero Section */}
      {activeTab === 'hero' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-bangla">হিরো ব্যানার ও মূল টেক্সট কনটেন্ট</h3>
            <p className="text-xs text-slate-400 font-bangla">হোমপেজের মূল হেডার ও পরিচিতিমূলক তথ্য</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bangla">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">সংস্থার পুরো নাম (বাংলা)</label>
              <input
                type="text"
                value={config.hero.titleBn}
                onChange={e => setConfig(prev => ({ ...prev, hero: { ...prev.hero, titleBn: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ইংরেজি নাম</label>
              <input
                type="text"
                value={config.hero.titleEn}
                onChange={e => setConfig(prev => ({ ...prev, hero: { ...prev.hero, titleEn: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">রেজিস্ট্রেশন ও স্লোগান ব্যাজ</label>
              <input
                type="text"
                value={config.hero.badgeText}
                onChange={e => setConfig(prev => ({ ...prev, hero: { ...prev.hero, badgeText: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">সংস্থার বিশদ পরিচিতি অনুচ্ছেদ</label>
              <textarea
                rows={3}
                value={config.hero.aboutParagraph}
                onChange={e => setConfig(prev => ({ ...prev, hero: { ...prev.hero, aboutParagraph: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Official Rules (Nitimala) */}
      {activeTab === 'nitimala' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-bangla">নীতিমালা ও সাধারণ পালনীয় নির্দেশাবলি</h3>
              <p className="text-xs text-slate-400 font-bangla">পরীক্ষায় অংশগ্রহণের সাধারণ শর্তাবলী ও প্রাতিষ্ঠানিক নিয়মাবলী</p>
            </div>
            <button
              type="button"
              onClick={handleAddRule}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-bangla text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন নিয়ম যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.nitimala.officialRules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-800/70 p-3 rounded-xl border border-slate-700">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-emerald-400 flex items-center justify-center font-mono text-xs shrink-0 mt-1">
                  {idx + 1}
                </span>
                <textarea
                  rows={2}
                  value={rule}
                  onChange={e => handleUpdateRule(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bangla"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 shrink-0 cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: Syllabus & Manbonton */}
      {activeTab === 'manbonton' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-bangla">মান বণ্টন ও বিষয়ভিত্তিক সিলেবাস</h3>
              <p className="text-xs text-slate-400 font-bangla">স্কুল ও মাদ্রাসা শাখার বিষয় ও নম্বর বণ্টন</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bangla">
                স্কুল: {schoolTotalMarks} নম্বর
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bangla">
                মাদ্রাসা: {madrasaTotalMarks} নম্বর
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* School Subjects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyan-300 font-bangla">স্কুল শাখা (সাধারণ প্রাথমিক ও কেজি)</h4>
                <button
                  type="button"
                  onClick={() => handleAddSyllabusItem('school')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bangla"
                >
                  <Plus className="w-3.5 h-3.5" /> নতুন বিষয়
                </button>
              </div>

              <div className="space-y-3">
                {config.nitimala.schoolSubjects.map((sub, idx) => (
                  <div key={sub.id} className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sub.subject}
                        onChange={e => handleUpdateSyllabusItem('school', idx, 'subject', e.target.value)}
                        placeholder="বিষয়ের নাম"
                        className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                      <input
                        type="number"
                        value={sub.marks}
                        onChange={e => handleUpdateSyllabusItem('school', idx, 'marks', Number(e.target.value))}
                        placeholder="নম্বর"
                        className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSyllabusItem('school', idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={sub.details}
                      onChange={e => handleUpdateSyllabusItem('school', idx, 'details', e.target.value)}
                      placeholder="সিলেবাসের বিবরণ..."
                      className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-2xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Madrasa Subjects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-300 font-bangla">মাদ্রাসা শাখা (ইবতেদায়ী)</h4>
                <button
                  type="button"
                  onClick={() => handleAddSyllabusItem('madrasa')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bangla"
                >
                  <Plus className="w-3.5 h-3.5" /> নতুন বিষয়
                </button>
              </div>

              <div className="space-y-3">
                {config.nitimala.madrasaSubjects.map((sub, idx) => (
                  <div key={sub.id} className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sub.subject}
                        onChange={e => handleUpdateSyllabusItem('madrasa', idx, 'subject', e.target.value)}
                        placeholder="বিষয়ের নাম"
                        className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                      <input
                        type="number"
                        value={sub.marks}
                        onChange={e => handleUpdateSyllabusItem('madrasa', idx, 'marks', Number(e.target.value))}
                        placeholder="নম্বর"
                        className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-400 font-mono text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSyllabusItem('madrasa', idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={sub.details}
                      onChange={e => handleUpdateSyllabusItem('madrasa', idx, 'details', e.target.value)}
                      placeholder="সিলেবাসের বিবরণ..."
                      className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-2xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: Gallery Presentation & Notice Controls */}
      {activeTab === 'gallery_notices' && (
        <div className="space-y-6">
          {/* Gallery Presentation Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                <Grid className="w-5 h-5 text-cyan-400" />
                <span>গ্যালারি মিডিয়া প্রদর্শন ও লেআউট (Gallery Presentation)</span>
              </h3>
              <p className="text-xs text-slate-400 font-bangla">
                হোমপেজে গ্যালারির গ্রিড কলাম ও স্থিরচিত্র ক্যাপশন সেটিংস
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bangla">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">গ্রিড কলাম সংখ্যা</label>
                <select
                  value={features.galleryColumns || 3}
                  onChange={e => updateFeatures(f => ({ ...f, galleryColumns: Number(e.target.value) as any }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value={2}>২টি কলাম (বড় থাম্বনেইল)</option>
                  <option value={3}>৩টি কলাম (স্ট্যান্ডার্ড)</option>
                  <option value={4}>৪টি কলাম (কম্প্যাক্ট)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">হোমপেজে সর্বোচ্চ মিডিয়া সংখ্যা</label>
                <input
                  type="number"
                  min={2}
                  max={24}
                  value={features.galleryCountOnHome || 6}
                  onChange={e => updateFeatures(f => ({ ...f, galleryCountOnHome: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ছবিতে ক্যাপশন ও তারিখ প্রদর্শন</label>
                <select
                  value={features.galleryShowCaptions ? 'yes' : 'no'}
                  onChange={e => updateFeatures(f => ({ ...f, galleryShowCaptions: e.target.value === 'yes' }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="yes">হ্যাঁ (ক্যাপশন ও বিবরণ দেখাবে)</option>
                  <option value="no">না (শুধু ফটো গ্রিড)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notice Board Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-bangla flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>নোটিশ বোর্ড ও পিন সার্কুলার হাইলাইট</span>
              </h3>
              <p className="text-xs text-slate-400 font-bangla">
                নোটিশ ডিসপ্লে লিমিট ও পিন করা জরুরি নোটিশের স্পেশাল ব্যাজ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bangla">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">নোটিশ ব্যাজ লেবেল</label>
                <input
                  type="text"
                  value={features.noticeBadgeText || 'দাপ্তরিক সার্কুলার'}
                  onChange={e => updateFeatures(f => ({ ...f, noticeBadgeText: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">হোমপেজে সর্বোচ্চ নোটিশ সংখ্যা</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={features.noticeDisplayLimit || 4}
                  onChange={e => updateFeatures(f => ({ ...f, noticeDisplayLimit: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">পিন করা নোটিশে পালস হাইলাইট</label>
                <select
                  value={features.noticeHighlightPinned ? 'yes' : 'no'}
                  onChange={e => updateFeatures(f => ({ ...f, noticeHighlightPinned: e.target.value === 'yes' }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="yes">হ্যাঁ (অ্যানিমেটেড পালস হাইলাইট)</option>
                  <option value="no">না (স্বাভাবিক স্ট্যাটিক)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: Footer & Social Branding */}
      {activeTab === 'footer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-bangla">ফুটার ও সোশ্যাল ব্র্যান্ডিং</h3>
            <p className="text-xs text-slate-400 font-bangla">সংস্থার ফেইসবুক পেজ লিঙ্ক ও কপিরাইট টেক্সট</p>
          </div>

          <div className="space-y-4 text-xs font-bangla">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">অফিসিয়াল ফেইসবুক পেজ লিঙ্ক (URL)</label>
              <input
                type="text"
                value={config.footer.facebookUrl}
                onChange={e => setConfig(prev => ({ ...prev, footer: { ...prev.footer, facebookUrl: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ফেইসবুক বাটন লেবেল</label>
              <input
                type="text"
                value={config.footer.facebookName}
                onChange={e => setConfig(prev => ({ ...prev, footer: { ...prev.footer, facebookName: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">কপিরাইট নোটিশ টেক্সট</label>
              <input
                type="text"
                value={config.footer.copyrightText}
                onChange={e => setConfig(prev => ({ ...prev, footer: { ...prev.footer, copyrightText: e.target.value } }))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-2xl sticky bottom-4 z-30">
        <div className="text-xs text-slate-400 font-bangla">
          পরিবর্তনগুলো সেভ করার সাথে সাথে ক্লাউড ফায়ারবেসে স্টোর হবে।
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-xs font-bold font-bangla text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>সকল পরিবর্তন সেভ করুন</span>
        </button>
      </div>
    </div>
  );
};
