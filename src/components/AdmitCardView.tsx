import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { INSTITUTION, Applicant, ExamSettings, Campaign, AdmitCardDesign } from '../types';
import { storage } from '../services/storage';
import { convertToBengaliNumber, generateVerificationToken } from '../utils/validation';
import { generateAdmitCardPDF } from '../utils/pdfGenerator';
import { SupportedLang, toLangNumber, formatLangDate, formatLangDateTime } from '../utils/i18n';
import { 
  Printer, 
  Search, 
  AlertCircle, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Calendar,
  Clock,
  Copy,
  Check,
  CreditCard,
  FileText,
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { Logo } from './Logo';
import { OfficialAdmitCardContent } from './OfficialAdmitCardContent';

interface AdmitCardViewProps {
  selectedApplicant: Applicant | null;
  settings: ExamSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectApplicant: (applicant: Applicant) => void;
  lang?: SupportedLang;
}

export const AdmitCardView: React.FC<AdmitCardViewProps> = ({
  selectedApplicant,
  settings,
  setActiveTab,
  onSelectApplicant,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [searchInput, setSearchInput] = useState(selectedApplicant?.applicationNo || selectedApplicant?.mobile || '');
  const [applicant, setApplicant] = useState<Applicant | null>(selectedApplicant);
  const [matchingApplicants, setMatchingApplicants] = useState<Applicant[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState('');
  const [copiedAppNo, setCopiedAppNo] = useState(false);
  const [copiedTrxId, setCopiedTrxId] = useState(false);
  const [design, setDesign] = useState<AdmitCardDesign>(() => storage.getAdmitCardDesign());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setDesign(storage.getAdmitCardDesign());
    });
    return unsub;
  }, []);

  const officialSignatures = storage.getOfficialSignatures();
  const featuredCampaign = storage.getFeaturedCampaign();

  // Find candidate's campaign
  const applicantCampaign: Campaign | undefined = applicant?.campaignId 
    ? storage.getCampaignById(applicant.campaignId) 
    : featuredCampaign;

  // Determine Admit Card Available Date & Time
  const rawAvailableDate = applicantCampaign?.admitCardAvailableDate || featuredCampaign?.admitCardAvailableDate || settings.admitCardAvailableDate || '2026-11-06T09:00';
  
  // Check if admit card is currently unlocked for download
  const isDownloadUnlocked = () => {
    if (applicant?.admitCardIssued) return true;
    if (!rawAvailableDate) return true;
    try {
      const releaseTime = new Date(rawAvailableDate).getTime();
      return Date.now() >= releaseTime;
    } catch {
      return true;
    }
  };

  const unlocked = isDownloadUnlocked();

  const formattedReleaseDateText = () => {
    return formatLangDateTime(rawAvailableDate, lang);
  };

  useEffect(() => {
    if (selectedApplicant) {
      setApplicant(selectedApplicant);
      setSearchInput(selectedApplicant.applicationNo);
    }
  }, [selectedApplicant]);

  useEffect(() => {
    if (applicant) {
      const vrfToken = generateVerificationToken(applicant.applicationNo);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const verifyUrl = `${baseUrl}?verifyToken=${vrfToken}&appNo=${applicant.applicationNo}`;

      QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#072C4C',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [applicant]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setMatchingApplicants([]);

    const query = searchInput.trim();
    if (!query) {
      setSearchError(isEnglish ? 'Please enter Application Number or Mobile Number' : 'অনুগ্রহ করে আবেদন নম্বর অথবা সচল মোবাইল নম্বর লিখুন');
      return;
    }

    const matches = storage.getApplicantsByQuery(query);
    if (!matches || matches.length === 0) {
      setSearchError(
        isEnglish
          ? 'No applicant found. Please verify your Application Number (e.g. ALIKH-2026-00101) or 11-digit Mobile Number.'
          : 'কোনো আবেদনকারী পাওয়া যায়নি। আপনার আবেদন নম্বর (যেমন: ALIKH-2026-00101) অথবা ১১-সংখ্যার মোবাইল নম্বর সঠিক কিনা যাচাই করুন।'
      );
      setApplicant(null);
    } else if (matches.length === 1) {
      setApplicant(matches[0]);
      onSelectApplicant(matches[0]);
    } else {
      // Multiple students registered under the same parent mobile number
      setMatchingApplicants(matches);
      setApplicant(matches[0]);
      onSelectApplicant(matches[0]);
    }
  };

  const handleDownloadPDF = async () => {
    if (!applicant) return;
    setIsGeneratingPdf(true);
    setPdfSuccessMessage('');
    try {
      const res = await generateAdmitCardPDF({
        applicant,
        settings,
        officialSignatures,
        design,
        lang
      });
      if (res.success) {
        setPdfSuccessMessage(
          isEnglish
            ? `PDF successfully generated and downloaded: ${res.fileName}`
            : `অফিসিয়াল প্রবেশপত্র সফলভাবে ডাউনলোড হয়েছে: ${res.fileName}`
        );
        setTimeout(() => setPdfSuccessMessage(''), 5000);
      } else {
        setSearchError(res.error || 'Failed to generate PDF');
      }
    } catch (e: any) {
      setSearchError(e.message || 'Error creating PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyText = (val: string, type: 'appNo' | 'trxId') => {
    navigator.clipboard.writeText(val);
    if (type === 'appNo') {
      setCopiedAppNo(true);
      setTimeout(() => setCopiedAppNo(false), 2000);
    } else {
      setCopiedTrxId(true);
      setTimeout(() => setCopiedTrxId(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header Bar - Hidden during Print */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs no-print space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
              {isEnglish ? 'Digital Admit Card Portal' : 'ডিজিটাল প্রবেশপত্র পোর্টাল'}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#072C4C] font-serif-bn">
              {isEnglish ? 'Download Official Admit Card' : 'প্রবেশপত্র (Admit Card) অনুসন্ধান ও ডাউনলোড'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEnglish
                ? 'Enter Application Number (ALIKH-2026-...) or registered Mobile Number. No PIN required.'
                : 'আপনার আবেদন নম্বর (ALIKH-2026-...) অথবা অভিভাবকের মোবাইল নম্বর দিয়ে সহজেই প্রবেশপত্র সংগ্রহ করুন। কোনো গোপন পিনের প্রয়োজন নেই।'}
            </p>
          </div>

          {applicant && unlocked && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#072C4C] hover:bg-[#041B2D] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-60"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{isGeneratingPdf ? (isEnglish ? 'Generating PDF...' : 'পিডিএফ তৈরি হচ্ছে...') : (isEnglish ? 'Download PDF' : 'PDF ডাউনলোড')}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>{isEnglish ? 'Print' : 'প্রিন্ট'}</span>
              </button>
            </div>
          )}
        </div>

        {pdfSuccessMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </div>
        )}

        {/* Simplified Search Form (NO PIN FIELD) */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-[#072C4C] mb-1">
              {isEnglish ? 'Application Number or Mobile Number' : 'আবেদন নম্বর অথবা অভিভাবকের মোবাইল নম্বর'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={isEnglish ? 'e.g. ALIKH-2026-00101 or 017XXXXXXXX' : 'যেমন: ALIKH-2026-00101 অথবা 017XXXXXXXX'}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm uppercase bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-sky-500/20 font-mono"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              <span>{isEnglish ? 'Search Admit Card' : 'প্রবেশপত্র খুঁজুন'}</span>
            </button>
          </div>
        </form>


        {searchError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Multiple Matches Picker (Parent with 2 children under same phone number) */}
        {matchingApplicants.length > 1 && (
          <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-2">
            <span className="text-2xs font-bold text-[#072C4C] block uppercase tracking-wide">
              {isEnglish 
                ? `Multiple candidates found (${matchingApplicants.length}). Select student:` 
                : `এই নম্বরে ${convertToBengaliNumber(matchingApplicants.length)} জন পরীক্ষার্থীর তথ্য পাওয়া গেছে। শিক্ষার্থী নির্বাচন করুন:`}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchingApplicants.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setApplicant(m);
                    onSelectApplicant(m);
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer ${
                    applicant?.id === m.id
                      ? 'bg-white border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-xs'
                      : 'bg-white/70 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-[#072C4C]">{m.nameBn}</div>
                  <div className="text-2xs text-slate-500 font-mono">
                    {m.applicationNo} · {m.schoolName}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {applicant ? (
        !unlocked ? (
          /* ===================================================================
              BIG PROMINENT TEXT: ADMIT CARD IS SCHEDULED (NOT YET UNLOCKED)
             =================================================================== */
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-9 shadow-md space-y-6 no-print">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                {isEnglish ? 'Scheduled Release' : 'নির্ধারিত তারিখে প্রকাশের অপেক্ষায়'}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#072C4C] leading-snug">
                {isEnglish ? 'Admit Card Download Scheduled' : 'প্রবেশপত্র ডাউনলোডের সময়সূচি'}
              </h2>

              {/* Big Text Box showing Available Time */}
              <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-1.5 text-center">
                <span className="text-2xs sm:text-xs text-slate-600 block uppercase font-bold tracking-wider">
                  {isEnglish ? 'Admit Card Available From:' : 'প্রবেশপত্র ডাউনলোডের নির্ধারিত তারিখ ও সময়:'}
                </span>
                <div className="text-xl sm:text-2xl font-bold text-[#072C4C] font-serif-bn">
                  {formattedReleaseDateText()}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                {isEnglish
                  ? `Your application (${applicant.applicationNo}) is confirmed and verified. Admit cards will be unlocked for download on the scheduled date using your Application Number or registered Mobile Number.`
                  : `আপনার আবেদনটি (${applicant.applicationNo}) সফলভাবে নিশ্চিত ও অনুমোদিত রয়েছে। নির্ধারিত তারিখ ও সময় পৌঁছানোর পর আপনার আবেদন নম্বর অথবা মোবাইল নম্বর দিয়ে প্রবেশপত্র সরাসরি ডাউনলোড করতে পারবেন।`}
              </p>
            </div>

            {/* Candidate Summary Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 max-w-2xl mx-auto space-y-3">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                {isEnglish ? 'Registered Candidate Summary' : 'নিবন্ধিত শিক্ষার্থীর তথ্য সারসংক্ষেপ:'}
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="text-3xs text-slate-400 block font-medium">শিক্ষার্থীর নাম</span>
                  <strong className="text-xs text-[#072C4C] block">{applicant.nameBn}</strong>
                  <span className="text-3xs text-slate-500 font-mono uppercase">{applicant.nameEn}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="text-3xs text-slate-400 block font-medium">বিদ্যালয় ও শ্রেণি</span>
                  <strong className="text-xs text-[#072C4C] block truncate">{applicant.schoolName}</strong>
                  <span className="text-3xs text-slate-500">{applicant.className}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="text-3xs text-slate-400 block font-medium">আবেদন নম্বর (App No)</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-mono font-bold text-[#072C4C]">{applicant.applicationNo}</strong>
                    <button
                      type="button"
                      onClick={() => copyText(applicant.applicationNo, 'appNo')}
                      className="p-1 text-slate-400 hover:text-[#0284C7] cursor-pointer"
                      title="কপি করুন"
                    >
                      {copiedAppNo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                  <span className="text-3xs text-slate-400 block font-medium">পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID)</span>
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-mono font-bold text-[#0284C7] truncate">{applicant.transactionId || 'CASH-PAYMENT'}</strong>
                    {applicant.transactionId && (
                      <button
                        type="button"
                        onClick={() => copyText(applicant.transactionId || '', 'trxId')}
                        className="p-1 text-slate-400 hover:text-[#0284C7] cursor-pointer"
                        title="কপি করুন"
                      >
                        {copiedTrxId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Download Money Receipt while waiting */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('receipt')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#072C4C] hover:bg-[#041B2D] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4" />
                <span>টাকা জমার অনলাইন রসিদ প্রিন্ট করুন</span>
              </button>

              <a
                href="/assets/Nitimala.pdf"
                target="_blank"
                rel="noreferrer"
                download="Nitimala_2026.pdf"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#0284C7]" />
                <span>অফিসিয়াল নীতিমালা দেখুন (Nitimala.pdf)</span>
              </a>
            </div>
          </div>
        ) : (
          /* ===================================================================
              UNLOCKED: OFFICIAL ADMIT CARD DISPLAY & DOWNLOAD
             =================================================================== */
          <div className="overflow-x-auto flex justify-center py-2">
            <OfficialAdmitCardContent
              applicant={applicant}
              design={design}
              settings={settings}
              lang={lang}
              qrDataUrl={qrDataUrl}
              isPrintView={true}
            />
          </div>
        )
      ) : (
        /* Empty Search Prompt State */
        <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center space-y-3 no-print shadow-xs">
          <Award className="w-10 h-10 text-[#00A3E0] mx-auto stroke-1" />
          <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
            {isEnglish ? 'Enter Application or Mobile Number' : 'প্রবেশপত্র দেখতে আবেদন নম্বর বা মোবাইল নম্বর লিখুন'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isEnglish
              ? 'Enter your Application ID (e.g., ALIKH-2026-00101) or Guardian Mobile Number in the box above and click Search.'
              : 'উপরে অনুসন্ধান বক্সে আপনার আবেদন নম্বর (যেমন: ALIKH-2026-00101) অথবা অভিভাবকের মোবাইল নম্বর লিখে খুঁজুন বোতামে চাপ দিন।'}
          </p>
        </div>
      )}
    </div>
  );
};
