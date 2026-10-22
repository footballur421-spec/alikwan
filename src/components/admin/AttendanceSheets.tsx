import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Applicant, ExamSettings, INSTITUTION, SchoolCategory } from '../../types';
import { storage } from '../../services/storage';
import { convertToBengaliNumber } from '../../utils/validation';
import { formatLangDate, toLangNumber } from '../../utils/i18n';
import { 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  Users, 
  CheckCircle2, 
  FileCheck2, 
  Layers, 
  Sparkles,
  Search,
  Filter,
  Check,
  Award
} from 'lucide-react';
import { Logo } from '../Logo';

interface AttendanceSheetsProps {
  settings: ExamSettings;
  applicants: Applicant[];
  lang?: 'bn' | 'en';
}

type SheetMode = 'populated' | 'blank';

interface CategoryTabInfo {
  id: SchoolCategory;
  nameBn: string;
  shortName: string;
  badge: string;
  rollRange: string;
  color: string;
  icon: string;
}

const CATEGORIES: CategoryTabInfo[] = [
  {
    id: 'madrasa',
    nameBn: 'ইবতেদায়ী মাদ্রাসা শাখা',
    shortName: 'মাদ্রাসা শাখা',
    badge: 'মাদ্রাসা শিক্ষা বোর্ড কারিকুলাম',
    rollRange: 'রোল সিরিজ: ৩২০১+',
    color: '#047857', // Emerald
    icon: '🕌'
  },
  {
    id: 'kindergarten',
    nameBn: 'কিন্ডারগার্টেন স্কুল শাখা',
    shortName: 'কিন্ডারগার্টেন শাখা',
    badge: 'প্রাইভেট / কেজি কারিকুলাম',
    rollRange: 'রোল সিরিজ: ৩০০১+',
    color: '#0284C7', // Sky blue
    icon: '🏫'
  },
  {
    id: 'primary',
    nameBn: 'সরকারি প্রাথমিক বিদ্যালয় শাখা',
    shortName: 'প্রাথমিক বিদ্যালয় শাখা',
    badge: 'জাতীয় শিক্ষাক্রম (NCTB) কারিকুলাম',
    rollRange: 'রোল সিরিজ: ২৮২১+',
    color: '#D97706', // Amber
    icon: '🎒'
  }
];

export const AttendanceSheets: React.FC<AttendanceSheetsProps> = ({
  settings,
  applicants,
  lang = 'bn',
}) => {
  const [activeCategory, setActiveCategory] = useState<SchoolCategory>('madrasa');
  const [sheetMode, setSheetMode] = useState<SheetMode>('populated');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [blankRowsCount, setBlankRowsCount] = useState<number>(20);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('০১');

  const printRef = useRef<HTMLDivElement>(null);

  const activeCategoryInfo = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const featuredCampaign = storage.getFeaturedCampaign();

  // Filter students belonging to this category
  const categoryApplicants = applicants
    .filter(a => {
      // Category match
      const catMatch = a.schoolCategory === activeCategory;
      // Center match
      if (selectedCenter !== 'all' && a.examCenter) {
        return catMatch && a.examCenter.includes(selectedCenter);
      }
      return catMatch;
    })
    .sort((a, b) => {
      const rollA = parseInt(a.rollNumber || '0', 10);
      const rollB = parseInt(b.rollNumber || '0', 10);
      return rollA - rollB;
    });

  // Calculate stats
  const totalCount = categoryApplicants.length;

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // PDF Download Action
  const handleDownloadPDF = async (targetCategory?: SchoolCategory) => {
    const catToUse = targetCategory || activeCategory;
    const catInfo = CATEGORIES.find(c => c.id === catToUse) || CATEGORIES[0];

    setIsGeneratingPdf(true);
    setSuccessMessage('');

    try {
      const sheetElem = document.getElementById('printable-signature-sheet');
      if (!sheetElem) {
        throw new Error('শিট এলিমেন্ট পাওয়া যায়নি');
      }

      const canvas = await html2canvas(sheetElem, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight);
      } else {
        // Multi-page handling
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      const safeMode = sheetMode === 'blank' ? 'Blank_Empty' : 'Populated';
      const fileName = `Al-Ikhwan_SignatureSheet_${catInfo.id}_${safeMode}.pdf`;
      pdf.save(fileName);

      setSuccessMessage(`${catInfo.nameBn} এর উপস্থিতি ও স্বাক্ষর শিট PDF সফলভাবে ডাউনলোড হয়েছে!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('PDF তৈরি করতে সমস্যা হয়েছে: ' + (err.message || 'অজানা ত্রুটি'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download All 3 Sheets Sequentially
  const handleDownloadAllThree = async () => {
    setIsGeneratingPdf(true);
    setSuccessMessage('৩টি শাখার শিট প্রস্তুত হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');
    
    // Save current active category
    const originalCat = activeCategory;

    for (const cat of CATEGORIES) {
      setActiveCategory(cat.id);
      // Wait for state and DOM to re-render
      await new Promise(r => setTimeout(r, 600));
      await handleDownloadPDF(cat.id);
    }

    setActiveCategory(originalCat);
    setIsGeneratingPdf(false);
    setSuccessMessage('৩টি শাখার (মাদ্রাসা, কিন্ডারগার্টেন ও প্রাথমিক) স্বাক্ষর শিট সফলভাবে ডাউনলোড হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  // Generate blank placeholder rows
  const blankRows = Array.from({ length: blankRowsCount }, (_, i) => ({
    sl: i + 1,
    roll: '',
    appNo: '',
    name: '',
    school: '',
    classRoll: ''
  }));

  const examCenterText = selectedCenter !== 'all' 
    ? selectedCenter 
    : (settings.examCenters && settings.examCenters[0] ? settings.examCenters[0] : 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (১০১)');

  const examDateText = featuredCampaign?.examDate || settings.examDate || '১৪ নভেম্বর ২০২৬, রোজ শনিবার';
  const examTimeText = featuredCampaign?.examTime || settings.examTime || 'সকাল ১০:০০ টা - দুপুর ১২:০০ টা';

  return (
    <div className="space-y-6">
      {/* 1. Control Toolbar (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs no-print space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0272A6] uppercase tracking-wider mb-1">
              <FileCheck2 className="w-4 h-4 text-[#0272A6]" />
              <span>পরীক্ষা নিয়ন্ত্রণ ও উপস্থিতি যাচাইকরণ</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#07243B]">
              ক্যাটাগরি অনুযায়ী পরীক্ষার্থীদের স্বাক্ষর ও উপস্থিতি শিট (Attendance Sheet)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              মাদ্রাসা, কিন্ডারগার্টেন ও প্রাথমিক বিদ্যালয়ের জন্য ৩টি স্বতন্ত্র উপস্থিতি শিট প্রিন্ট ও PDF ডাউনলোড করুন
            </p>
          </div>

          {/* Action Download / Print Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#07243B] hover:bg-[#0B3556] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>A4 প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={() => handleDownloadPDF()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0272A6] hover:bg-[#065A82] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'প্রস্তুত হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadAllThree}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
              title="৩টি শাখার শিট একসাথে ডাউনলোড করুন"
            >
              <Layers className="w-4 h-4" />
              <span>৩টি শিট একত্রে</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 2. Three Category Selector Tabs */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            শাখা / ক্যাটাগরি নির্বাচন করুন (৩টি স্বতন্ত্র শিট):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => {
              const isSelected = activeCategory === cat.id;
              const count = applicants.filter(a => a.schoolCategory === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-[#07243B] bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{cat.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-sky-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cat.rollRange}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm font-bangla">{cat.nameBn}</h4>
                  <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-200/20">
                    <span className="text-[11px] opacity-80">{cat.badge}</span>
                    <span className="font-mono font-bold">
                      {convertToBengaliNumber(count)} জন
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Configuration Row: Mode (Empty vs Populated) + Center + Room */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Mode Switch: Populated vs Empty Blank Sheet */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              শিটের ধরন (Sheet Format):
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSheetMode('populated')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sheetMode === 'populated'
                    ? 'bg-white text-[#07243B] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ডাটাবেজ পূরণকৃত ({convertToBengaliNumber(totalCount)})
              </button>
              <button
                type="button"
                onClick={() => setSheetMode('blank')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sheetMode === 'blank'
                    ? 'bg-[#07243B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                খালি ব্ল্যাঙ্ক শিট (Empty)
              </button>
            </div>
          </div>

          {/* Exam Center Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              পরীক্ষা কেন্দ্র ফিল্টার:
            </label>
            <select
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:border-[#0272A6]"
            >
              <option value="all">সব কেন্দ্র (কেন্দ্র ফিল্টার নেই)</option>
              {settings.examCenters.map((center, idx) => (
                <option key={idx} value={center}>{center}</option>
              ))}
            </select>
          </div>

          {/* Room Number Input & Blank Rows if in Empty Mode */}
          <div>
            {sheetMode === 'blank' ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  খালি সারির সংখ্যা (Empty Rows):
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={blankRowsCount}
                    onChange={e => setBlankRowsCount(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                  >
                    <option value={15}>১৫ জন (১ পৃষ্ঠা)</option>
                    <option value={20}>২০ জন (১ পৃষ্ঠা মানসম্মত)</option>
                    <option value={25}>২৫ জন</option>
                    <option value={30}>৩০ জন (২ পৃষ্ঠা)</option>
                  </select>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    placeholder="কক্ষ নং"
                    title="কক্ষ নম্বর"
                    className="w-20 px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  কক্ষ নম্বর (Room No):
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  placeholder="যেমন: ০১ / হল রুম"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:border-[#0272A6]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. PRINTABLE / DOWNLOADABLE SIGNATURE SHEET (A4 Official Document Layout) */}
      <div 
        ref={printRef}
        id="printable-signature-sheet"
        className="bg-white rounded-2xl border-2 border-slate-800 p-6 sm:p-8 shadow-md relative overflow-hidden text-slate-900 font-sans print-sheet"
        style={{
          fontFamily: "'Hind Siliguri', 'Kalpurush', 'SolaimanLipi', sans-serif"
        }}
      >
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Organization Logo */}
            <div className="w-16 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center p-1 border border-slate-300 rounded-lg">
              <Logo className="w-full h-full object-contain" />
            </div>

            {/* Central Institutional Headings */}
            <div className="flex-1 text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-black font-serif-bn text-[#07243B] tracking-tight">
                {INSTITUTION.name}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {INSTITUTION.address} · স্থাপিত: ০১/০১/২০০০ ইং · সমাজসেবা অধিদপ্তর রেজিঃ {INSTITUTION.regNo}
              </p>
              
              <div className="pt-1">
                <span className="inline-block px-4 py-1 rounded-md bg-[#07243B] text-white font-bold text-xs sm:text-sm tracking-wide">
                  {INSTITUTION.examName}
                </span>
              </div>

              {/* Category Indicator Banner */}
              <div className="pt-1.5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  পরীক্ষার্থীদের উপস্থিতি ও স্বাক্ষর তালিকা (Attendance & Signature Sheet)
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold text-white" style={{ backgroundColor: activeCategoryInfo.color }}>
                  {activeCategoryInfo.nameBn} ({activeCategoryInfo.rollRange})
                </span>
              </div>
            </div>

            {/* Right Official Verification Box */}
            <div className="w-20 sm:w-24 shrink-0 text-center p-2 rounded-lg border border-dashed border-slate-400 bg-slate-50 text-[10px]">
              <span className="font-bold text-slate-800 block">কক্ষ নম্বর</span>
              <strong className="text-sm font-mono font-black text-[#07243B] block my-0.5">
                {roomNumber || '০১'}
              </strong>
              <span className="text-[9px] text-slate-500 block">হল পরিদর্শক</span>
            </div>
          </div>

          {/* Exam Details Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-300 text-xs">
            <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">পরীক্ষার তারিখ ও বার:</span>
              <strong className="text-slate-900">{examDateText}</strong>
            </div>

            <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">পরীক্ষার সময়:</span>
              <strong className="text-slate-900">{examTimeText}</strong>
            </div>

            <div className="p-1.5 bg-slate-50 rounded border border-slate-200 col-span-2">
              <span className="text-[10px] text-slate-500 block font-semibold">পরীক্ষা কেন্দ্র:</span>
              <strong className="text-slate-900 truncate block">{examCenterText}</strong>
            </div>
          </div>
        </div>

        {/* 3. The Main Attendance & Signature Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-100 text-slate-900 text-center border-b-2 border-slate-800 font-bold">
                <th className="border border-slate-800 py-2 px-1 w-8">ক্র.</th>
                <th className="border border-slate-800 py-2 px-2 w-20">রোল নম্বর</th>
                <th className="border border-slate-800 py-2 px-2 w-28">আবেদন নং</th>
                <th className="border border-slate-800 py-2 px-3 text-left">পরীক্ষার্থীর নাম</th>
                <th className="border border-slate-800 py-2 px-3 text-left">শিক্ষাপ্রতিষ্ঠানের নাম</th>
                <th className="border border-slate-800 py-2 px-2 w-24">১ম অধিবেশন স্বাক্ষর<br/><span className="text-[9px] font-normal">(বাংলা ও ইংরেজি)</span></th>
                <th className="border border-slate-800 py-2 px-2 w-24">২য় অধিবেশন স্বাক্ষর<br/><span className="text-[9px] font-normal">(গণিত ও বিজ্ঞান)</span></th>
                <th className="border border-slate-800 py-2 px-1.5 w-16">উপস্থিতি<br/><span className="text-[9px] font-normal">উ / অ</span></th>
                <th className="border border-slate-800 py-2 px-2 w-20">পরিদর্শকের স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-900">
              {sheetMode === 'populated' ? (
                categoryApplicants.length > 0 ? (
                  categoryApplicants.map((app, idx) => (
                    <tr key={app.id || idx} className="hover:bg-slate-50">
                      <td className="border border-slate-800 py-2.5 px-1 text-center font-mono font-bold">
                        {convertToBengaliNumber(idx + 1)}
                      </td>
                      <td className="border border-slate-800 py-2.5 px-2 text-center font-mono font-bold text-sm bg-slate-50/50">
                        {toLangNumber(app.rollNumber || '', 'bn')}
                      </td>
                      <td className="border border-slate-800 py-2.5 px-2 text-center font-mono text-[11px] text-slate-700">
                        {app.applicationNo}
                      </td>
                      <td className="border border-slate-800 py-2.5 px-3 text-left">
                        <strong className="block text-slate-900 font-serif-bn">{app.nameBn}</strong>
                        <span className="block text-[10px] text-slate-500 font-mono font-medium">{app.nameEn}</span>
                      </td>
                      <td className="border border-slate-800 py-2.5 px-3 text-left text-[11px]">
                        <span className="line-clamp-2">{app.schoolName}</span>
                        {app.rollNo && (
                          <span className="text-[10px] text-slate-500 block font-mono">
                            শ্রেণি রোল: {convertToBengaliNumber(app.rollNo)}
                          </span>
                        )}
                      </td>
                      {/* Session 1 Student Signature Slot */}
                      <td className="border border-slate-800 py-2.5 px-1 text-center align-bottom h-12">
                        <div className="w-full border-b border-dotted border-slate-400 mb-1"></div>
                      </td>
                      {/* Session 2 Student Signature Slot */}
                      <td className="border border-slate-800 py-2.5 px-1 text-center align-bottom h-12">
                        <div className="w-full border-b border-dotted border-slate-400 mb-1"></div>
                      </td>
                      {/* Attendance Checkboxes */}
                      <td className="border border-slate-800 py-2.5 px-1 text-center">
                        <div className="flex flex-col items-center justify-center gap-1 text-[9px] font-bold">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <span className="w-3.5 h-3.5 border border-slate-700 inline-block rounded-xs"></span>
                            <span>উ</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer text-red-700">
                            <span className="w-3.5 h-3.5 border border-slate-700 inline-block rounded-xs"></span>
                            <span>অ</span>
                          </label>
                        </div>
                      </td>
                      {/* Invigilator Sign */}
                      <td className="border border-slate-800 py-2.5 px-1 text-center align-bottom">
                        <div className="w-full border-b border-dotted border-slate-400 mb-1"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // If no registered students in this category yet
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 border border-slate-800">
                      <p className="font-bold text-sm text-slate-700">
                        এই ক্যাটাগরিতে ({activeCategoryInfo.nameBn}) এখনও কোনো আবেদনকারী নেই।
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        পরীক্ষার হলের জন্য সরাসরি খালি ব্ল্যাঙ্ক শিট প্রিন্ট করতে উপরের &quot;খালি ব্ল্যাঙ্ক শিট (Empty)&quot; বাটনটি নির্বাচন করুন।
                      </p>
                    </td>
                  </tr>
                )
              ) : (
                // Blank Sheet Template Rows for Physical Printout
                blankRows.map((row) => (
                  <tr key={row.sl} className="h-10">
                    <td className="border border-slate-800 py-2 px-1 text-center font-mono font-bold">
                      {convertToBengaliNumber(row.sl)}
                    </td>
                    <td className="border border-slate-800 py-2 px-2 text-center font-mono font-bold bg-slate-50/30">
                      {/* Blank roll space */}
                    </td>
                    <td className="border border-slate-800 py-2 px-2 text-center font-mono text-[11px]">
                      {/* Blank app no space */}
                    </td>
                    <td className="border border-slate-800 py-2 px-3 text-left">
                      {/* Blank student name */}
                    </td>
                    <td className="border border-slate-800 py-2 px-3 text-left">
                      {/* Blank school name */}
                    </td>
                    <td className="border border-slate-800 py-2 px-1 text-center align-bottom">
                      <div className="w-full border-b border-dotted border-slate-400 mb-1"></div>
                    </td>
                    <td className="border border-slate-800 py-2 px-1 text-center align-bottom">
                      <div className="w-full border-b border-dotted border-slate-400 mb-1"></div>
                    </td>
                    <td className="border border-slate-800 py-2 px-1 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 text-[9px] font-bold">
                        <span className="flex items-center gap-1">
                          <span className="w-3.5 h-3.5 border border-slate-700 inline-block rounded-xs"></span>
                          <span>উ</span>
                        </span>
                        <span className="flex items-center gap-1 text-red-700">
                          <span className="w-3.5 h-3.5 border border-slate-700 inline-block rounded-xs"></span>
                          <span>অ</span>
                        </span>
                      </div>
                    </td>
                    <td className="border border-slate-800 py-2 px-1 text-center align-bottom">
                      <div className="w-full border-b border-dotted border-slate-400 mb-1"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Bottom Official Certification & Signatures Box */}
        <div className="mt-6 pt-4 border-t-2 border-slate-800 text-xs">
          {/* Summary Counts Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-3 rounded-lg bg-slate-50 border border-slate-300 font-bangla font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">মোট পরীক্ষার্থী:</span>
              <span className="font-mono font-bold text-slate-900">
                {sheetMode === 'populated' ? convertToBengaliNumber(totalCount) : '___________'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800">
              <span>উপস্থিত পরীক্ষার্থী সংখ্যা:</span>
              <span className="font-mono font-bold underline decoration-dotted">___________ জন</span>
            </div>
            <div className="flex items-center gap-2 text-red-800">
              <span>অনুপস্থিত পরীক্ষার্থী সংখ্যা:</span>
              <span className="font-mono font-bold underline decoration-dotted">___________ জন</span>
            </div>
          </div>

          {/* Three Official Signature Slots */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-center text-slate-800">
            {/* 1. Invigilator */}
            <div className="flex flex-col items-center">
              <div className="w-4/5 border-b border-slate-700 mb-1.5"></div>
              <strong className="block text-slate-900 font-bold">কক্ষ পরিদর্শকের স্বাক্ষর ও তারিখ</strong>
              <span className="text-[10px] text-slate-500 font-serif-bn">নাম: ___________________________</span>
            </div>

            {/* 2. Hall Superintendent */}
            <div className="flex flex-col items-center">
              <div className="w-4/5 border-b border-slate-700 mb-1.5"></div>
              <strong className="block text-slate-900 font-bold">হল সুপার / কেন্দ্র সচিবের স্বাক্ষর</strong>
              <span className="text-[10px] text-slate-500 font-serif-bn">ও সিলমোহর</span>
            </div>

            {/* 3. Controller of Examinations */}
            <div className="flex flex-col items-center">
              <div className="w-4/5 border-b border-slate-700 mb-1.5"></div>
              <strong className="block text-slate-900 font-bold">পরীক্ষা নিয়ন্ত্রক</strong>
              <span className="text-[10px] text-slate-500 font-serif-bn">আল-ইখওয়ান বৃত্তি পরীক্ষা ২০২৬</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
