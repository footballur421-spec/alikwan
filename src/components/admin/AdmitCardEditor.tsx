import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { AdmitCardDesign, DEFAULT_ADMIT_CARD_DESIGN, Applicant, ExamSettings, OfficialSignatures } from '../../types';
import { SupportedLang } from '../../utils/i18n';
import { validateAndCompressImage } from '../../utils/imageCompressor';
import { generateAdmitCardPDF } from '../../utils/pdfGenerator';
import { OfficialAdmitCardContent } from '../OfficialAdmitCardContent';
import { 
  Palette, 
  Type, 
  ShieldCheck, 
  FileText, 
  Save, 
  RotateCcw, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Eye, 
  Sliders, 
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Clock,
  Stamp,
  SlidersHorizontal,
  Layers
} from 'lucide-react';

interface AdmitCardEditorProps {
  settings: ExamSettings;
  lang?: SupportedLang;
}

type CanvaTool = 'signatures' | 'header' | 'brand' | 'routine' | 'instructions' | 'layout';

export const AdmitCardEditor: React.FC<AdmitCardEditorProps> = ({ settings, lang = 'bn' }) => {
  const isEnglish = lang === 'en';
  const [design, setDesign] = useState<AdmitCardDesign>(() => storage.getAdmitCardDesign());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDownloadingTest, setIsDownloadingTest] = useState(false);
  
  // Editor State
  const [activeTool, setActiveTool] = useState<CanvaTool>('signatures');
  const [previewBranch, setPreviewBranch] = useState<'primary' | 'madrasa'>('primary');
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'school' | 'madrasa'>('school');

  // Sample primary school student for live preview
  const primaryStudent: Applicant = {
    id: 'sample-preview-primary',
    applicationNo: 'ALIKH-2026-00101',
    nameBn: 'মুহাম্মদ আব্দুল্লাহ আল মারুফ',
    nameEn: 'MUHAMMAD ABDULLAH AL MARUF',
    dob: '2015-04-12',
    gender: 'ছাত্র',
    fatherName: 'মাওলানা নজরুল ইসলাম',
    motherName: 'মোছাঃ ফাতেমা বেগম',
    mobile: '01712374656',
    schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়',
    schoolCategory: 'primary',
    className: 'পঞ্চম শ্রেণি (সাধারণ)',
    rollNo: '০১',
    presentAddress: 'গ্রাম: গলাসাসন, ডাকঘর: দাসেরবাজার, উপজেলা: বড়লেখা, জেলা: মৌলভীবাজার',
    permanentAddress: 'গ্রাম: গলাসাসন, ডাকঘর: দাসেরবাজার, উপজেলা: বড়লেখা, জেলা: মৌলভীবাজার',
    division: 'সিলেট',
    district: 'মৌলভীবাজার',
    upazila: 'বড়লেখা',
    photoUrl: '/assets/aistudio/image_9453218f.png',
    declarationAccepted: true,
    status: 'approved',
    paymentStatus: 'paid',
    transactionId: 'BKX778899A',
    paymentDate: '২০২৬-০৮-২০',
    admitCardIssued: true,
    admitCardNo: 'AC-2026-00101',
    rollNumber: '2821',
    examCenter: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (কেন্দ্র কোড: ১০১)',
    examDate: '২০২৬-১১-২২',
    examTime: 'সকাল ১০:৩০ - ১২:৩০ ও দুপুর ০২:০০ - ০৪:০০',
    createdAt: '2026-08-20T10:30:00.000Z',
    updatedAt: '2026-08-20T10:30:00.000Z',
    headmasterApproved: true
  };

  // Sample ebtedayee madrasah student for live preview
  const madrasaStudent: Applicant = {
    id: 'sample-preview-madrasa',
    applicationNo: 'ALIKH-2026-00205',
    nameBn: 'মুহাম্মদ তানভীর আহমেদ কাওছার',
    nameEn: 'MUHAMMAD TANVIR AHMED KAWSAR',
    dob: '2015-02-18',
    gender: 'ছাত্র',
    fatherName: 'মাওলানা আব্দুর রহমান',
    motherName: 'মোছাঃ রোকেয়া বেগম',
    mobile: '01726886578',
    schoolName: 'গল্লাসাঙ্গন ইবতেদায়ী মাদ্রাসা',
    schoolCategory: 'madrasa',
    className: 'পঞ্চম শ্রেণি (ইবতেদায়ী শাখা)',
    rollNo: '০৩',
    presentAddress: 'গ্রাম: গল্লাসাঙ্গন, ডাকঘর: দাসেরবাজার, উপজেলা: বড়লেখা, জেলা: মৌলভীবাজার',
    permanentAddress: 'গ্রাম: গল্লাসাঙ্গন, ডাকঘর: দাসেরবাজার, উপজেলা: বড়লেখা, জেলা: মৌলভীবাজার',
    division: 'সিলেট',
    district: 'মৌলভীবাজার',
    upazila: 'বড়লেখা',
    photoUrl: '/assets/aistudio/image_5fcd58ea.png',
    declarationAccepted: true,
    status: 'approved',
    paymentStatus: 'paid',
    transactionId: 'NAG882244B',
    paymentDate: '২০২৬-০৮-২১',
    admitCardIssued: true,
    admitCardNo: 'AC-2026-00205',
    rollNumber: '3105',
    examCenter: 'গল্লাসাঙ্গন উচ্চ বিদ্যালয় ও মাদ্রাসা কেন্দ্র (কেন্দ্র কোড: ১০২)',
    examDate: '২০২৬-১১-২২',
    examTime: 'সকাল ১০:৩০ - ১২:৩০ ও দুপুর ০২:০০ - ০৪:০০',
    createdAt: '2026-08-21T11:00:00.000Z',
    updatedAt: '2026-08-21T11:00:00.000Z',
    headmasterApproved: true
  };

  const previewStudent = previewBranch === 'primary' ? primaryStudent : madrasaStudent;

  const handleSignatureUpload = async (key: keyof AdmitCardDesign, file?: File) => {
    if (!file) return;
    setErrorMsg('');
    try {
      const res = await validateAndCompressImage(file, {
        maxSizeBytes: 200 * 1024,
        maxWidthOrHeight: 600,
        quality: 0.9,
      });
      if (res.success && res.dataUrl) {
        const updated = { ...design, [key]: res.dataUrl };
        setDesign(updated);
        // Also sync officialSignatures in storage
        const sigs = storage.getOfficialSignatures();
        if (key === 'secretarySignatureUrl') sigs.secretarySignatureUrl = res.dataUrl;
        if (key === 'presidentSignatureUrl') sigs.presidentSignatureUrl = res.dataUrl;
        if (key === 'controllerSignatureUrl') sigs.controllerSignatureUrl = res.dataUrl;
        if (key === 'officialSealUrl') sigs.controllerSealUrl = res.dataUrl;
        storage.updateOfficialSignatures(sigs);
      } else {
        setErrorMsg(res.error || 'স্বাক্ষরের ছবি প্রসেস করতে ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Image processing error');
    }
  };

  const handleSave = () => {
    try {
      const updated = { ...design, showBismillah: false };
      storage.updateAdmitCardDesign(updated);
      
      // Sync officialSignatures
      const sigs = storage.getOfficialSignatures();
      if (updated.secretarySignatureUrl) sigs.secretarySignatureUrl = updated.secretarySignatureUrl;
      if (updated.presidentSignatureUrl) sigs.presidentSignatureUrl = updated.presidentSignatureUrl;
      if (updated.controllerSignatureUrl) sigs.controllerSignatureUrl = updated.controllerSignatureUrl;
      if (updated.officialSealUrl) sigs.controllerSealUrl = updated.officialSealUrl;
      storage.updateOfficialSignatures(sigs);

      setDesign(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save admit card design');
    }
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি প্রবেশপত্র ডিজাইন ও অফিসিয়াল স্বাক্ষর ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
      const reset = storage.resetAdmitCardDesign();
      // Ensure authentic fixed signatures
      reset.secretarySignatureUrl = '/assets/signatures/secretary_sign.jpg';
      reset.presidentSignatureUrl = '/assets/signatures/shovapoti_sign.jpg';
      reset.showBismillah = false;
      storage.updateAdmitCardDesign(reset);
      setDesign(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleTestDownload = async () => {
    setIsDownloadingTest(true);
    setErrorMsg('');
    try {
      const res = await generateAdmitCardPDF({
        applicant: previewStudent,
        settings,
        design,
        lang
      });
      if (!res.success) {
        setErrorMsg(res.error || 'PDF generation failed');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error creating test PDF');
    } finally {
      setIsDownloadingTest(false);
    }
  };

  // School Instructions helpers
  const schoolRules = design.schoolInstructions || DEFAULT_ADMIT_CARD_DESIGN.schoolInstructions || [];
  const updateSchoolInstruction = (index: number, val: string) => {
    const list = [...schoolRules];
    list[index] = val;
    setDesign({ ...design, schoolInstructions: list });
  };
  const addSchoolInstruction = () => {
    setDesign({
      ...design,
      schoolInstructions: [...schoolRules, 'নতুন প্রাথমিক বিদ্যালয় পরীক্ষা সংক্রান্ত নির্দেশনা যোগ করুন...']
    });
  };
  const removeSchoolInstruction = (index: number) => {
    const list = schoolRules.filter((_, i) => i !== index);
    setDesign({ ...design, schoolInstructions: list });
  };

  // Madrasa Instructions helpers
  const madrasaRules = design.madrasaInstructions || DEFAULT_ADMIT_CARD_DESIGN.madrasaInstructions || [];
  const updateMadrasaInstruction = (index: number, val: string) => {
    const list = [...madrasaRules];
    list[index] = val;
    setDesign({ ...design, madrasaInstructions: list });
  };
  const addMadrasaInstruction = () => {
    setDesign({
      ...design,
      madrasaInstructions: [...madrasaRules, 'নতুন ইবতেদায়ী মাদ্রাসা পরীক্ষা সংক্রান্ত নির্দেশনা যোগ করুন...']
    });
  };
  const removeMadrasaInstruction = (index: number) => {
    const list = madrasaRules.filter((_, i) => i !== index);
    setDesign({ ...design, madrasaInstructions: list });
  };

  // Preset Colors
  const BRAND_PALETTES = [
    { name: 'অফিসিয়াল মেরুন ও নেভি', maroon: '#7B1159', cyan: '#0099DA', navy: '#07243B' },
    { name: 'ক্লাসিক রয়্যাল ব্লু', maroon: '#0B3B60', cyan: '#0088C2', navy: '#051827' },
    { name: 'গাঢ় এমারেল্ড গ্রিন', maroon: '#064E3B', cyan: '#059669', navy: '#022C22' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & ACTIONS TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <SlidersHorizontal className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white font-bangla">
                প্রবেশপত্র স্টুডিও ও অফিসিয়াল স্বাক্ষর
              </h2>
              <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono">
                Admit Card Studio Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bangla">
              প্রবেশপত্র ডিজাইন, পরীক্ষার রুটিন, ও সভাপতি/সম্পাদকের স্থায়ী স্বাক্ষর সরাসরি এডিট ও নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Branch Switcher for Live Testing */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setPreviewBranch('primary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-bangla transition-all cursor-pointer ${
                previewBranch === 'primary'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              প্রাথমিক (NCTB)
            </button>
            <button
              type="button"
              onClick={() => setPreviewBranch('madrasa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-bangla transition-all cursor-pointer ${
                previewBranch === 'madrasa'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ইবতেদায়ী (মাদ্রাসা)
            </button>
          </div>

          {/* Test PDF Download */}
          <button
            type="button"
            onClick={handleTestDownload}
            disabled={isDownloadingTest}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            title="স্ক্রিনে প্রদর্শিত হুবহু ডিজাইন টেস্ট PDF ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isDownloadingTest ? 'পিডিএফ তৈরি হচ্ছে...' : 'টেস্ট PDF ডাউনলোড'}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="ডিফল্ট রূপ ফিরিয়ে আনুন"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/30 active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ডিজাইন সেভ করুন</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bangla flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>প্রবেশপত্র ডিজাইন ও অফিসিয়াল স্বাক্ষর সফলভাবে ক্লাউড ফায়ারবেসে সেভ হয়েছে! পরীক্ষার্থী ও অ্যাডমিন উভয় স্থানেই একই ডিজাইন প্রদর্শিত হবে।</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs font-bangla flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. CANVA WORKSPACE: TOOLBAR + SIDEBAR + PASTEBOARD CANVAS */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* SIDEBAR TOOLBOX */}
        <aside className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-4 shrink-0">
          {/* Tool Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            {[
              { id: 'signatures', label: 'স্বাক্ষর ও সিল', icon: Stamp },
              { id: 'header', label: 'হেডার ও লোগো', icon: Type },
              { id: 'brand', label: 'কালার ও ফ্রেম', icon: Palette },
              { id: 'routine', label: 'রুটিন ও সময়সূচি', icon: Calendar },
              { id: 'instructions', label: 'নির্দেশাবলি', icon: FileText },
              { id: 'layout', label: 'লেআউট ও ফন্ট', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTool === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTool(tab.id as CanvaTool)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-2xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OFFICIAL SIGNATURES & SEALS (Directly Integrated) */}
          {activeTool === 'signatures' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-2xs font-bold text-cyan-400 uppercase tracking-wider block">
                  অফিসিয়াল স্বাক্ষরের প্রামাণ্যতা
                </span>
                <p className="text-3xs text-slate-400 leading-relaxed">
                  সভাপতি ও সাধারণ সম্পাদকের স্থায়ী স্বাক্ষর যুক্ত রয়েছে। পরীক্ষা নিয়ন্ত্রকের স্থানটি পরীক্ষা কেন্দ্রের জন্য খালি রাখা হয়েছে।
                </p>
              </div>

              {/* 1. Secretary Signature (FIXED) */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-xs">০১. সাধারণ সম্পাদক / সদস্য সচিব</strong>
                  <span className="text-3xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    স্থায়ী স্বাক্ষর (Fixed)
                  </span>
                </div>
                <div>
                  <label className="text-3xs text-slate-400 block mb-1">পদবি (Title):</label>
                  <input
                    type="text"
                    value={design.secretaryTitleBn || 'সাধারণ সম্পাদক / সদস্য সচিব'}
                    onChange={(e) => setDesign({ ...design, secretaryTitleBn: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-3xs text-slate-400 block mb-1">স্বাক্ষরকারীর নাম:</label>
                  <input
                    type="text"
                    value={design.secretaryName || 'মেহেরুল আমীন রিপন'}
                    onChange={(e) => setDesign({ ...design, secretaryName: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-20 h-10 bg-white rounded p-1 flex items-center justify-center border border-slate-700">
                    <img
                      src={design.secretarySignatureUrl || '/assets/signatures/secretary_sign.jpg'}
                      alt="Secretary Sign"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <label className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-2xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>নতুন স্বাক্ষর আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSignatureUpload('secretarySignatureUrl', e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* 2. President Signature (FIXED) */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-xs">০২. সংস্থা সভাপতি (Shovapoti)</strong>
                  <span className="text-3xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    স্থায়ী স্বাক্ষর (Fixed)
                  </span>
                </div>
                <div>
                  <label className="text-3xs text-slate-400 block mb-1">পদবি (Title):</label>
                  <input
                    type="text"
                    value={design.presidentTitleBn || 'সংস্থা সভাপতি'}
                    onChange={(e) => setDesign({ ...design, presidentTitleBn: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-3xs text-slate-400 block mb-1">স্বাক্ষরকারীর নাম:</label>
                  <input
                    type="text"
                    value={design.presidentName || 'কামরুল হাছান'}
                    onChange={(e) => setDesign({ ...design, presidentName: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-20 h-10 bg-white rounded p-1 flex items-center justify-center border border-slate-700">
                    <img
                      src={design.presidentSignatureUrl || '/assets/signatures/shovapoti_sign.jpg'}
                      alt="President Sign"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <label className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-2xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>নতুন স্বাক্ষর আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSignatureUpload('presidentSignatureUrl', e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Controller of Examination (Empty slot for manual physical sign/seal) */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-xs">০৩. পরীক্ষা নিয়ন্ত্রক</strong>
                  <span className="text-3xs text-amber-400 font-bold bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
                    খালি ডটেড স্লট (Empty Slot)
                  </span>
                </div>
                <p className="text-3xs text-slate-400 leading-relaxed">
                  পরীক্ষা কেন্দ্রের কক্ষে পরীক্ষকদের ম্যানুয়াল স্বাক্ষর ও সিলের জন্য এটি প্রবেশপত্রে ফাঁকা থাকবে।
                </p>
                <div>
                  <label className="text-3xs text-slate-400 block mb-1">পদবি (Title):</label>
                  <input
                    type="text"
                    value={design.controllerTitleBn || 'পরীক্ষা নিয়ন্ত্রক'}
                    onChange={(e) => setDesign({ ...design, controllerTitleBn: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEADER & TITLES */}
          {activeTool === 'header' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  শীর্ষ পরীক্ষার নাম (Bangla Exam Title):
                </label>
                <input
                  type="text"
                  value={design.examTitleBn || ''}
                  onChange={(e) => setDesign({ ...design, examTitleBn: e.target.value })}
                  placeholder="আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা-২০২৬"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  সংস্থার অফিসিয়াল নাম (Organization Name):
                </label>
                <input
                  type="text"
                  value={design.orgNameBn || ''}
                  onChange={(e) => setDesign({ ...design, orgNameBn: e.target.value })}
                  placeholder="আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  ঠিকানা ও পরিচিতি (Subtitle Address):
                </label>
                <input
                  type="text"
                  value={design.subHeaderBn || ''}
                  onChange={(e) => setDesign({ ...design, subHeaderBn: e.target.value })}
                  placeholder="গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার ।"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  ব্যানার টাইটেল (Banner Title):
                </label>
                <input
                  type="text"
                  value={design.bannerTitleBn || ''}
                  onChange={(e) => setDesign({ ...design, bannerTitleBn: e.target.value })}
                  placeholder="প্রবেশপত্র (E - ADMIT CARD)"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  উপস্থিতির সময় (Reporting Time):
                </label>
                <input
                  type="text"
                  value={design.reportingTimeTextBn || ''}
                  onChange={(e) => setDesign({ ...design, reportingTimeTextBn: e.target.value })}
                  placeholder="সকাল ০৯:৩০ টা"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BRAND & COLORS */}
          {activeTool === 'brand' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-2">
                  অফিসিয়াল কালার প্যালেট নির্বাচন
                </label>
                <div className="space-y-2">
                  {BRAND_PALETTES.map((pal, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDesign({ ...design, bannerBgColor: pal.navy, borderColor: pal.navy })}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="font-semibold text-white">{pal.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.maroon }} />
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.cyan }} />
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.navy }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1.5">
                  ব্যানার ব্যাকগ্রাউন্ড কালার
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.bannerBgColor || '#07243B'}
                    onChange={(e) => setDesign({ ...design, bannerBgColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.bannerBgColor || '#07243B'}
                    onChange={(e) => setDesign({ ...design, bannerBgColor: e.target.value })}
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1.5">
                  কার্ডের বর্ডার কালার
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.borderColor || '#07243B'}
                    onChange={(e) => setDesign({ ...design, borderColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.borderColor || '#07243B'}
                    onChange={(e) => setDesign({ ...design, borderColor: e.target.value })}
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROUTINE & SCHEDULE */}
          {activeTool === 'routine' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-2xs font-bold text-cyan-400">পরীক্ষার সময়সূচি ও রুটিন</span>
                <p className="text-3xs text-slate-400">
                  তারিখ: ২২ নভেম্বর ২০২৬ইং (রোজ শনিবার)<br />
                  ১ম অধিবেশন: সকাল ১০:৩০ - ১২:৩০ ঘটিকা<br />
                  ২য় অধিবেশন: বিকাল ০২:০০ - ০৪:০০ ঘটিকা
                </p>
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  প্রাথমিক বিদ্যালয় ২য় অধিবেশনের বিষয়:
                </label>
                <input
                  type="text"
                  defaultValue="গণিত, বিজ্ঞান এবং বা.বি.প."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1">
                  ইবতেদায়ী মাদ্রাসা ২য় অধিবেশনের বিষয়:
                </label>
                <input
                  type="text"
                  defaultValue="গণিত এবং বিজ্ঞান, আরবি"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 5: INSTRUCTIONS */}
          {activeTool === 'instructions' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveInstructionTab('school')}
                  className={`flex-1 py-1.5 rounded-lg text-2xs font-semibold ${
                    activeInstructionTab === 'school' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                  }`}
                >
                  প্রাথমিক নির্দেশাবলি
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInstructionTab('madrasa')}
                  className={`flex-1 py-1.5 rounded-lg text-2xs font-semibold ${
                    activeInstructionTab === 'madrasa' ? 'bg-pink-700 text-white' : 'text-slate-400'
                  }`}
                >
                  মাদ্রাসা নির্দেশাবলি
                </button>
              </div>

              {activeInstructionTab === 'school' ? (
                <div className="space-y-2">
                  {schoolRules.map((ins, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <textarea
                        rows={2}
                        value={ins}
                        onChange={(e) => updateSchoolInstruction(idx, e.target.value)}
                        className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeSchoolInstruction(idx)}
                        className="p-1 text-slate-400 hover:text-red-400 cursor-pointer mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSchoolInstruction}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-2xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন ধারা যোগ করুন</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {madrasaRules.map((ins, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <textarea
                        rows={2}
                        value={ins}
                        onChange={(e) => updateMadrasaInstruction(idx, e.target.value)}
                        className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeMadrasaInstruction(idx)}
                        className="p-1 text-slate-400 hover:text-red-400 cursor-pointer mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMadrasaInstruction}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded-lg text-2xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন ধারা যোগ করুন</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: LAYOUT & TYPOGRAPHY */}
          {activeTool === 'layout' && (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-3xs font-bold text-slate-400 block uppercase mb-1.5">
                  ফন্ট স্টাইল
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDesign({ ...design, fontFamily: 'serif' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      design.fontFamily === 'serif'
                        ? 'border-cyan-400 bg-cyan-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-serif text-xs">ক্লাসিক্যাল সেরিফ</span>
                    <span className="text-3xs text-slate-500">অফিসিয়াল রূপ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesign({ ...design, fontFamily: 'sans' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      design.fontFamily === 'sans'
                        ? 'border-cyan-400 bg-cyan-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-sans text-xs">হিন্দ শিলিগুড়ি</span>
                    <span className="text-3xs text-slate-500">আধুনিক Sans</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="block text-white text-xs">সত্যতা যাচাই QR কোড</strong>
                    <span className="text-3xs text-slate-400">ডিজিটাল ভেরিফিকেশন</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={design.showQrCode !== false}
                    onChange={(e) => setDesign({ ...design, showQrCode: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <strong className="block text-white text-xs">বারকোড স্ট্রিপ</strong>
                    <span className="text-3xs text-slate-400">রোল ও আবেদন নম্বর</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={design.showBarcode !== false}
                    onChange={(e) => setDesign({ ...design, showBarcode: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER VIEWPORT: PIXEL-PERFECT ADMIT CARD PREVIEW (Matches Downloaded PDF 100%) */}
        <main className="flex-1 w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-auto shadow-2xl flex flex-col items-center">
          {/* Zoom & View Controls */}
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-slate-300">
                লাইভ প্রিভিউ (টেস্ট PDF এবং প্রিন্ট হুবহু এক)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.65, Number((prev - 0.05).toFixed(2))))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-2xs text-cyan-400 font-bold min-w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(1.2, Number((prev + 0.05).toFixed(2))))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.92)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled Canvas Preview using the exact same component as the actual candidate view */}
          <div
            className="transition-transform duration-150 origin-top shadow-2xl rounded-sm my-2"
            style={{
              transform: `scale(${zoomLevel})`,
              width: '794px',
            }}
          >
            <OfficialAdmitCardContent
              applicant={previewStudent}
              design={design}
              settings={settings}
              lang={lang}
              isPrintView={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
