import React from 'react';
import { Applicant, AdmitCardDesign, ExamSettings } from '../types';
import { Logo } from './Logo';
import { toLangNumber, SupportedLang } from '../utils/i18n';

interface OfficialAdmitCardContentProps {
  applicant: Applicant;
  design: AdmitCardDesign;
  settings?: ExamSettings;
  lang?: SupportedLang;
  qrDataUrl?: string;
  isPrintView?: boolean;
}

export const OfficialAdmitCardContent: React.FC<OfficialAdmitCardContentProps> = ({
  applicant,
  design,
  settings,
  lang = 'bn',
  qrDataUrl,
  isPrintView = false,
}) => {
  const isMadrasa =
    applicant.schoolCategory === 'madrasa' ||
    applicant.className?.includes('ইবতেদায়ী') ||
    applicant.schoolName?.includes('মাদ্রাসা') ||
    applicant.schoolName?.toLowerCase().includes('madrasa');

  const branchBadge = isMadrasa
    ? 'ইবতেদায়ী মাদ্রাসা শাখা — বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড কারিকুলাম'
    : 'সাধারণ প্রাথমিক বিদ্যালয় শাখা — জাতীয় শিক্ষাক্রম (NCTB) কারিকুলাম';

  const rollStr = applicant.rollNumber || '2821';
  const appNoStr = applicant.applicationNo || 'ALIKH-2026-00101';
  const nameEnStr = (applicant.nameEn || applicant.nameBn || '').toUpperCase();
  const nameBnStr = applicant.nameBn || '';

  const activeBorderColor = design.borderColor || '#07243B';
  const activeBannerBg = design.bannerBgColor || '#07243B';

  return (
    <div
      id="admit-card-to-print"
      className="p-6 sm:p-8 bg-white relative text-slate-900 select-none overflow-hidden print-card"
      style={{
        width: '794px',
        maxWidth: '794px',
        minWidth: '794px',
        backgroundColor: '#FFFFFF',
        border: `2.5px solid ${activeBorderColor}`,
        boxSizing: 'border-box',
        margin: '0 auto',
        fontFamily: design.fontFamily === 'sans' ? 'var(--font-bn)' : 'Noto Serif Bengali, Tiro Bangla, serif'
      }}
    >
      {/* Inner Decorative Hairline Border */}
      <div className="absolute inset-2 border border-slate-300 pointer-events-none z-0" />

      {/* Top Registration and Est Header */}
      <div className="flex justify-between items-center text-[11px] font-bold text-[#7B1159] pb-1 px-1 relative z-10">
        <span>স্থাপিত: ০১/০১/২০০০ইং</span>
        <span>সরকারি রেজিস্ট্রেশন নম্বর: ২৯৯</span>
      </div>

      {/* 1. Official Letterhead Header (Matching authentic WhatsApp Image) */}
      <div className="relative overflow-hidden rounded-xl border-b-2 border-[#0099DA] bg-gradient-to-r from-sky-50/60 via-white to-pink-50/30 p-3.5 mb-2.5 z-10">
        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left Logo */}
          <div className="w-18 h-20 shrink-0 flex items-center justify-center p-1 bg-white rounded-xl shadow-2xs border border-sky-100">
            <Logo className="w-full h-full object-contain" />
          </div>

          {/* Center Titles */}
          <div className="flex-1 text-center space-y-1">
            {/* Top Exam Title in Bold Maroon / Magenta */}
            <h1 className="text-2xl font-extrabold font-serif-bn text-[#7B1159] tracking-tight leading-tight">
              {design.examTitleBn || 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা-২০২৬'}
            </h1>

            {/* Management Pill + Organization Name in Deep Navy */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-bold text-[#07243B]">
                ব্যবস্থাপনায়:
              </span>
              <span className="text-lg font-bold font-serif-bn text-[#0B3B60]">
                {design.orgNameBn || 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা'}
              </span>
            </div>

            {/* Subtitle Address in Maroon */}
            <p className="text-xs font-bold font-serif-bn text-[#7B1159]">
              {design.subHeaderBn || 'গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার ।'}
            </p>

            {/* Registration & Established in Magenta/Maroon */}
            <p className="text-[11px] font-bold font-serif-bn text-[#8B0068]">
              স্থাপিত: ০১/০১/২০০০ইং, রেজিঃ নং: ২৯৯
            </p>
          </div>

          {/* Right Verification Seal Box */}
          <div className="w-20 shrink-0 flex flex-col items-center justify-center text-center p-2 rounded-xl border border-dashed border-[#7B1159]/40 bg-pink-50/50">
            <span className="text-[9px] font-bold text-[#7B1159] uppercase tracking-wider block">রেজিঃ ২৯৯</span>
            <span className="text-[8px] text-slate-600 block mt-0.5">স্থাপিত ২০০০ইং</span>
            <span className="text-[7px] text-[#0284C7] font-bold block mt-0.5">বৃত্তি পরীক্ষা</span>
          </div>
        </div>
      </div>

      {/* 2. Admit Card Title Banner & Branch Badge */}
      <div className="text-center my-2 space-y-1 z-10 relative">
        <div
          className="py-1 px-4 rounded text-white text-sm font-bold font-serif-bn tracking-wide shadow-xs"
          style={{ backgroundColor: activeBannerBg }}
        >
          {design.examTitleBn || 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬'} — {design.bannerTitleBn || 'প্রবেশপত্র (E - ADMIT CARD)'}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border border-slate-300 bg-slate-100 text-[#07243B]">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>{branchBadge}</span>
        </div>
      </div>

      {/* 3. Barcode Strip */}
      {design.showBarcode !== false && (
        <div className="flex flex-col items-center justify-center my-1.5 select-none z-10 relative">
          <svg viewBox="0 0 280 30" className="h-6 w-56 max-w-full">
            {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1].map((w, idx) => (
              idx % 2 === 0 ? <rect key={idx} x={14 + idx * 4.3} y={2} width={w * 1.5} height={24} fill="#07243B" /> : null
            ))}
          </svg>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#07243B]">
            *{rollStr} - {appNoStr}*
          </span>
        </div>
      )}

      {/* 4. Comprehensive Particulars Grid Table */}
      <div className="border border-slate-700 rounded-lg overflow-hidden text-xs mt-2.5 relative z-10 shadow-2xs bg-white">
        <div className="grid grid-cols-4 divide-x divide-slate-300">
          {/* Left 3 Columns: Candidate Particulars */}
          <div className="col-span-3 divide-y divide-slate-300">
            {/* Row 1: Name En & Roll No */}
            <div className="grid grid-cols-2 divide-x divide-slate-300 bg-white">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Candidate's Name (English Capital):
                </span>
                <span className="font-mono font-bold text-xs text-[#07243B] block truncate">
                  {nameEnStr}
                </span>
              </div>
              <div className="p-2 bg-slate-50/70">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  পরীক্ষার রোল নম্বর (Roll No):
                </span>
                <span className="font-mono font-extrabold text-base text-[#07243B] block">
                  {toLangNumber(rollStr, lang)}
                </span>
              </div>
            </div>

            {/* Row 2: Name Bn & App No */}
            <div className="grid grid-cols-2 divide-x divide-slate-300 bg-white">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  পরীক্ষার্থীর নাম (বাংলায়):
                </span>
                <span className="font-bold text-xs text-[#07243B] block font-serif-bn">
                  {nameBnStr}
                </span>
              </div>
              <div className="p-2 bg-slate-50/70">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  আবেদন রেফারেন্স নম্বর (App No):
                </span>
                <span className="font-mono font-bold text-xs text-[#0272A6] block">
                  {appNoStr}
                </span>
              </div>
            </div>

            {/* Row 3: Parents Name */}
            <div className="grid grid-cols-2 divide-x divide-slate-300 bg-white">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  পিতার নাম:
                </span>
                <span className="font-bold text-xs text-[#07243B] block font-serif-bn">
                  {applicant.fatherName}
                </span>
              </div>
              <div className="p-2 bg-slate-50/70">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  মাতার নাম:
                </span>
                <span className="font-bold text-xs text-[#07243B] block font-serif-bn">
                  {applicant.motherName}
                </span>
              </div>
            </div>

            {/* Row 4: Institution & Class */}
            <div className="grid grid-cols-2 divide-x divide-slate-300 bg-white">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  শিক্ষাপ্রতিষ্ঠানের নাম:
                </span>
                <span className="font-bold text-xs text-[#07243B] block font-serif-bn truncate">
                  {applicant.schoolName}
                </span>
              </div>
              <div className="p-2 bg-slate-50/70">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  শ্রেণি ও শ্রেণি রোল নম্বর:
                </span>
                <span className="font-bold text-xs text-[#07243B] block">
                  {applicant.className} {applicant.rollNo ? `(রোল: ${toLangNumber(applicant.rollNo, lang)})` : ''}
                </span>
              </div>
            </div>

            {/* Row 5: Examination Center & Area */}
            <div className="grid grid-cols-2 divide-x divide-slate-300 bg-white">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  পরীক্ষার কেন্দ্র ও কেন্দ্র কোড:
                </span>
                <span className="font-bold text-xs text-[#0272A6] block font-serif-bn">
                  {applicant.examCenter || 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (কেন্দ্র কোড: ১০১)'}
                </span>
              </div>
              <div className="p-2 bg-slate-50/70">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  উপজেলা ও জেলা:
                </span>
                <span className="font-semibold text-xs text-[#07243B] block">
                  {applicant.upazila || 'বড়লেখা'}, {applicant.district || 'মৌলভীবাজার'}
                </span>
              </div>
            </div>

            {/* Row 6: Schedule & Timings */}
            <div className="grid grid-cols-3 divide-x divide-slate-300 bg-sky-50/40">
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  পরীক্ষার তারিখ:
                </span>
                <strong className="text-xs text-[#07243B] block">
                  ২২ নভেম্বর ২০২৬ইং (শনিবার)
                </strong>
              </div>
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  পরীক্ষার সময়:
                </span>
                <strong className="text-xs text-[#07243B] block">
                  {applicant.examTime || 'সকাল ১০:৩০ - ১২:৩০ ও দুপুর ০২:০০ - ০৪:০০'}
                </strong>
              </div>
              <div className="p-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  উপস্থিতির সময়:
                </span>
                <strong className="text-xs text-red-700 block">
                  {design.reportingTimeTextBn || 'সকাল ০৯:৩০ টা'}
                </strong>
              </div>
            </div>
          </div>

          {/* Right 1 Column: Photo & Candidate Signature Box */}
          <div className="col-span-1 flex flex-col items-center justify-between p-2.5 bg-slate-50 divide-y divide-slate-300">
            <div className="flex flex-col items-center pb-2 w-full">
              <div className="w-26 h-30 bg-white border-2 border-slate-700 rounded p-1 shadow-2xs flex items-center justify-center overflow-hidden">
                {applicant.photoUrl ? (
                  <img
                    src={applicant.photoUrl}
                    alt={applicant.nameBn}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover rounded-xs"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    ছবি
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-600 font-semibold mt-1">
                পরীক্ষার্থীর ছবি
              </span>
            </div>

            {/* Student Signature Below Photo (Dotted line / empty slot as requested) */}
            <div className="pt-2 w-full flex flex-col items-center">
              <div className="w-full h-12 bg-white border border-dashed border-slate-400 rounded flex flex-col items-center justify-end p-1">
                <div className="w-4/5 border-b-2 border-dotted border-slate-500 mb-1" />
              </div>
              <span className="text-[9px] text-slate-700 font-bold mt-1 text-center font-bangla">
                (পরীক্ষার্থীর স্বাক্ষর - খালি স্থান)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Authentic Niomaboli & Routine Box */}
      <div className="border border-slate-700 rounded-lg p-3 bg-white mt-2.5 relative z-10 overflow-hidden shadow-2xs">
        {/* Watermark Logo in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-6 pointer-events-none z-0">
          <Logo className="w-60 h-60 object-contain" />
        </div>

        <div className="relative z-10">
          {/* Centered Pill Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-300">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3.5 py-0.5 rounded-full border border-slate-700 bg-slate-50 text-[#07243B] font-bold text-xs font-serif-bn">
                নিয়মাবলী
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                (Rules & Examination Routine)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7B1159] text-white">
              {isMadrasa ? 'মাদ্রাসা বোর্ড পাঠ্যক্রম' : 'NCTB প্রাথমিক পাঠ্যক্রম'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 items-center">
            <div className="col-span-3 space-y-1.5">
              {/* 4 Official Clauses matching official circular */}
              <ol className="text-xs text-slate-800 space-y-1 font-serif-bn font-medium leading-tight">
                <li className="flex items-start gap-1">
                  <span className="font-bold text-[#07243B] shrink-0">০১।</span>
                  <span>পরীক্ষার্থীকে পরীক্ষা শুরুর ৩০ মিনিট আগে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="font-bold text-[#07243B] shrink-0">০২।</span>
                  <span>পরীক্ষা কেন্দ্রে অবশ্যই প্রবেশ পত্র সাথে নিয়ে আসতে হবে।</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="font-bold text-[#07243B] shrink-0">০৩।</span>
                  <span>পরীক্ষার্থীর সাথে মোবাইল, বই ও অন্য কোন কাগজ-পত্র রাখা যাবে না।</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="font-bold text-[#07243B] shrink-0">০৪।</span>
                  <span className="font-bold text-[#07243B]">পরীক্ষার সময়সূচি:</span>
                </li>
              </ol>

              {/* Routine Table matching official schedule */}
              <div className="border border-slate-700 rounded overflow-hidden text-center text-xs mt-1 shadow-2xs bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-700 text-[#07243B] font-serif-bn font-bold text-xs">
                      <th className="p-1 border-r border-slate-700 w-1/3">তারিখ</th>
                      <th className="p-1 border-r border-slate-700 w-1/3">বিষয়</th>
                      <th className="p-1 w-1/3">সময়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-xs font-serif-bn">
                    <tr>
                      <td rowSpan={2} className="p-1.5 border-r border-slate-700 align-middle bg-slate-50/70 font-bold text-[#07243B]">
                        ২২/১১/২০২৬ইং<br />
                        <span className="text-[10px] text-slate-600 font-normal">রোজ- শনিবার</span>
                      </td>
                      <td className="p-1 border-r border-slate-700 font-bold text-[#0B3B60]">
                        বাংলা, ইংরেজি
                      </td>
                      <td className="p-1 font-bold text-[#07243B]">
                        সকাল ১০:৩০ - ১২:৩০ ঘটিকা
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1 border-r border-slate-700 font-bold text-[#7B1159] bg-pink-50/30">
                        {isMadrasa ? 'গণিত এবং বিজ্ঞান, আরবি' : 'গণিত, বিজ্ঞান এবং বা.বি.প.'}
                      </td>
                      <td className="p-1 font-bold text-[#7B1159] bg-pink-50/30">
                        বিকাল ০২:০০ - ০৪:০০ ঘটিকা
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: QR Code verification box */}
            <div className="col-span-1 flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-300 text-center">
              <div className="w-18 h-18 bg-white rounded-lg p-1 border border-slate-300 flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full border border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-[8px] font-mono text-[#07243B] font-bold">
                    <span>[QR CODE]</span>
                    <span className="text-[6px] text-slate-500">VERIFIED</span>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-bold text-[#07243B] mt-1">
                স্ক্যান করে সত্যতা যাচাই
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {appNoStr}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Candidate Declaration Box */}
      <div className="border border-slate-700 rounded-lg p-2 mt-2 bg-white text-[10.5px] text-slate-700 leading-snug relative z-10">
        <strong className="text-[#07243B] font-bold block mb-0.5 font-serif-bn">
          ঘোষণা ও অঙ্গীকারনামা (Candidate Declaration):
        </strong>
        <p className="italic">
          "আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য ও নির্ভুল। আমি আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬ এর সকল নিয়ম-শৃঙ্খলা মেনে পরীক্ষা প্রদান করব।"
        </p>
      </div>

      {/* 7. Authority Signatures: Shovapoti & Secretary FIXED, Controller slot EMPTY */}
      <div className="grid grid-cols-3 gap-4 pt-4 mt-3 border-t border-slate-400 text-xs relative z-10">
        {/* 1. পরীক্ষা নিয়ন্ত্রক (EMPTY SLOT for manual physical seal & signature) */}
        <div className="text-center flex flex-col justify-end bg-slate-50/50 p-1.5 rounded-lg border border-dashed border-slate-300">
          <div className="h-10 flex items-center justify-center">
            <div className="border-b-2 border-dotted border-slate-400 w-28 mx-auto" />
          </div>
          <div className="border-t border-slate-700 pt-1 text-[#07243B] font-bold text-[11px] font-bangla">
            {design.controllerTitleBn || 'পরীক্ষা নিয়ন্ত্রক'}
          </div>
          <div className="text-[9px] text-slate-500 font-bangla">
            (স্বাক্ষর ও সিলের নির্ধারিত খালি স্থান)
          </div>
        </div>

        {/* 2. সাধারণ সম্পাদক / সদস্য সচিব (FIXED Authentic Signature) */}
        <div className="text-center flex flex-col justify-end bg-slate-50/50 p-1.5 rounded-lg border border-slate-200">
          <div className="h-10 flex items-center justify-center">
            <img
              src={design.secretarySignatureUrl || '/assets/signatures/secretary_sign.jpg'}
              alt="Secretary Sign"
              crossOrigin="anonymous"
              className="max-h-9 max-w-full object-contain"
            />
          </div>
          <div className="border-t border-slate-700 pt-1 text-[#07243B] font-bold text-[11px] font-bangla">
            {design.secretaryTitleBn || 'সাধারণ সম্পাদক / সদস্য সচিব'}
          </div>
          <div className="text-[9px] text-slate-600 font-semibold font-bangla">
            {design.secretaryName || 'মেহেরুল আমীন রিপন'} (স্থায়ী স্বাক্ষর)
          </div>
        </div>

        {/* 3. সংস্থা সভাপতি (FIXED Authentic Signature) */}
        <div className="text-center flex flex-col justify-end bg-slate-50/50 p-1.5 rounded-lg border border-slate-200">
          <div className="h-10 flex items-center justify-center">
            <img
              src={design.presidentSignatureUrl || '/assets/signatures/shovapoti_sign.jpg'}
              alt="President Sign"
              crossOrigin="anonymous"
              className="max-h-9 max-w-full object-contain"
            />
          </div>
          <div className="border-t border-slate-700 pt-1 text-[#07243B] font-bold text-[11px] font-bangla">
            {design.presidentTitleBn || 'সংস্থা সভাপতি'}
          </div>
          <div className="text-[9px] text-slate-600 font-semibold font-bangla">
            {design.presidentName || 'কামরুল হাছান'} (স্থায়ী স্বাক্ষর)
          </div>
        </div>
      </div>
    </div>
  );
};
