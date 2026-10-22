import React, { useState } from 'react';
import { INSTITUTION, Applicant, ExamSettings, PaymentReceipt, OFFICIAL_CONTACTS } from '../types';
import { storage } from '../services/storage';
import { convertToBengaliNumber } from '../utils/validation';
import { SupportedLang, toLangNumber, formatLangDate } from '../utils/i18n';
import { 
  CreditCard, 
  Printer, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2,
  Phone,
  FileCheck2,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { Logo } from './Logo';
import { generateReceiptPDF } from '../utils/pdfGenerator';

interface PaymentReceiptViewProps {
  selectedApplicant: Applicant | null;
  settings: ExamSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectApplicant: (applicant: Applicant) => void;
  lang?: SupportedLang;
}

export const PaymentReceiptView: React.FC<PaymentReceiptViewProps> = ({
  selectedApplicant,
  settings,
  setActiveTab,
  onSelectApplicant,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [appNoInput, setAppNoInput] = useState(selectedApplicant?.applicationNo || '');
  const [applicant, setApplicant] = useState<Applicant | null>(selectedApplicant);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Cash'>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxIdInput, setTrxIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(
    selectedApplicant?.applicationNo ? storage.getReceiptByAppNo(selectedApplicant.applicationNo) || null : null
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!appNoInput.trim()) {
      setErrorMsg(isEnglish ? 'Please enter Application ID' : 'আবেদন নম্বর লিখুন');
      return;
    }
    const found = storage.getApplicantByNo(appNoInput);
    if (!found) {
      setErrorMsg(isEnglish ? 'Application not found. Please enter a valid Application ID.' : 'আবেদনটি পাওয়া যায়নি। সঠিক আবেদন নম্বর লিখুন।');
      setApplicant(null);
    } else {
      setApplicant(found);
      onSelectApplicant(found);
      const existingReceipt = storage.getReceiptByAppNo(found.applicationNo);
      setReceipt(existingReceipt || null);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (paymentMethod !== 'Cash' && (!senderNumber || senderNumber.length < 11)) {
      setErrorMsg(isEnglish ? 'Please enter a valid 11-digit sender mobile number' : 'অনুগ্রহ করে যে নম্বর থেকে ক্যাশ আউট করেছেন সেই ১১ সংখ্যার মোবাইল নম্বর লিখুন');
      return;
    }

    setIsProcessing(true);

    try {
      const finalTxnId = trxIdInput.trim() ? trxIdInput.trim().toUpperCase() : 'ক্যাশ আউট (অপেক্ষমাণ)';
      
      const newReceipt = storage.recordPendingPayment(
        applicant.applicationNo,
        settings.feeAmount,
        paymentMethod === 'Cash' ? (isEnglish ? 'Cash via Head Teacher' : 'প্রধান শিক্ষকের মাধ্যমে নগদ') : `বিকাশ এজেন্ট ক্যাশ আউট (${senderNumber})`,
        finalTxnId,
        senderNumber.trim()
      );

      if (newReceipt) {
        setReceipt(newReceipt);
        const updated = storage.getApplicantByNo(applicant.applicationNo);
        if (updated) {
          setApplicant(updated);
          onSelectApplicant(updated);
        }
        setSuccessMsg(isEnglish ? 'Payment details submitted successfully! It is now pending admin approval.' : 'পেমেন্ট তথ্য সফলভাবে দাখিল হয়েছে! অ্যাডমিন প্যানেল থেকে ক্যাশ আউট নম্বর যাচাই করে অনুমোদন করার পর মানি রসিদ ডাউনলোডের জন্য উন্মুক্ত হবে।');
      }
    } catch {
      setErrorMsg(isEnglish ? 'Failed to record payment. Please try again.' : 'পেমেন্ট সংরক্ষণে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 no-print">
        <div className="text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
          {isEnglish ? 'Examination Fee & Receipts' : 'অফিসিয়াল হিসাব ও মানি রসিদ'}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif-bn text-[#072C4C]">
          {isEnglish ? 'Examination Fee Submission & Official Money Receipt' : 'পরীক্ষা ফি পরিশোধ ও মানি রসিদ'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {isEnglish
            ? `Submit transaction details for examination fee (BDT ${settings.feeAmount}) or download official stamped money receipt.`
            : `বৃত্তি পরীক্ষার নির্ধারিত ফি (৳${convertToBengaliNumber(settings.feeAmount)}) পরিশোধ সংক্রান্ত তথ্য দাখিল করুন অথবা পরিশোধিত রসিদ ডাউনলোড করুন`}
        </p>
      </div>

      {/* Application Lookup */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs no-print space-y-3">
        <label className="block text-xs font-bold text-[#072C4C]">
          {isEnglish ? 'Application ID / Candidate Roll No' : 'আবেদন নম্বর / রোল নম্বর লিখুন'}
        </label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="ALIKH-2026-00101"
            value={appNoInput}
            onChange={e => setAppNoInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm uppercase bg-white focus:border-[#0284C7] font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#072C4C] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>{isEnglish ? 'Search Record' : 'আবেদন খুঁজুন'}</span>
          </button>
        </form>

        {errorMsg && (
          <p className="text-red-600 text-xs flex items-center gap-1 pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </p>
        )}

        {successMsg && (
          <p className="text-emerald-700 text-xs flex items-center gap-1 pt-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </p>
        )}
      </div>

      {/* PAYMENT FORM, PENDING CARD, OR MONEY RECEIPT */}
      {applicant && (
        (applicant.paymentStatus === 'paid' && (receipt?.status === 'সফল' || !receipt)) ? (
          /* FORMAL MONEY RECEIPT */
          <div id="payment-receipt-to-print" className="print-card bg-white rounded-2xl border-4 border-[#072C4C] p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
            {/* Inner Red Certificate Accent Line */}
            <div className="absolute inset-1.5 border border-[#DC2626] rounded-xl pointer-events-none" />

            <div className="border-b-2 border-[#072C4C] pb-4 text-center space-y-2 relative z-10">
              <span className="text-2xs text-slate-500 block pt-1">
                {isEnglish
                  ? `Govt. Reg. No: ${INSTITUTION.regNo} | Established: ${INSTITUTION.estDate}`
                  : `রেজিস্ট্রেশন নম্বর: ${INSTITUTION.regNo} | স্থাপিত: ${INSTITUTION.estDate}`}
              </span>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <div className="w-12 h-14 sm:w-14 sm:h-16 shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-lg">
                  <Logo className="w-full h-full" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-bn text-[#072C4C]">
                    {isEnglish ? INSTITUTION.englishName : INSTITUTION.name}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {isEnglish ? 'Gallasangon, Barlekha, Moulvibazar' : INSTITUTION.address}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block px-5 py-1.5 rounded-full bg-[#072C4C] text-white text-xs font-bold tracking-wide shadow-xs border border-sky-400/40">
                  {isEnglish ? 'OFFICIAL MONEY RECEIPT' : 'মানি রসিদ (OFFICIAL MONEY RECEIPT)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-sky-50/60 p-4 rounded-xl border border-sky-200/70 relative z-10">
              <div>
                <span className="text-slate-500 block">{isEnglish ? 'Receipt No:' : 'রসিদ নম্বর:'}</span>
                <strong className="font-mono text-[#072C4C] font-bold text-sm">{receipt?.receiptNo || 'REC-2026-001'}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">{isEnglish ? 'Date Paid:' : 'পরিশোধের সময়:'}</span>
                <span className="text-[#072C4C] font-medium font-mono">{receipt?.paidAt || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isEnglish ? 'Application ID:' : 'আবেদন নম্বর:'}</span>
                <strong className="font-mono text-[#0284C7] font-bold">{applicant.applicationNo}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">{isEnglish ? 'Transaction ID (TrxID):' : 'ট্রানজ্যাকশন আইডি (TxnID):'}</span>
                <span className="font-mono font-bold text-[#0284C7]">{applicant.transactionId || receipt?.transactionId || 'TXN-RECORDED'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs relative z-10">
              <div className="p-3 bg-[#072C4C] text-white font-bold">
                {isEnglish ? 'Candidate & Examination Details' : 'শিক্ষার্থী ও পরীক্ষার বিবরণ'}
              </div>
              <div className="p-4 space-y-2 divide-y divide-slate-100 bg-white">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{isEnglish ? 'Candidate Name:' : 'শিক্ষার্থীর নাম:'}</span>
                  <span className="font-bold text-[#072C4C]">{isEnglish ? (applicant.nameEn || applicant.nameBn) : applicant.nameBn}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{isEnglish ? 'Institution:' : 'বিদ্যালয় / মাদ্রাসা:'}</span>
                  <span className="font-semibold text-[#072C4C]">{applicant.schoolName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{isEnglish ? 'Class:' : 'শ্রেণি:'}</span>
                  <span className="font-semibold text-[#072C4C]">{applicant.className}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{isEnglish ? 'Payment Mode:' : 'পরিশোধের মাধ্যম:'}</span>
                  <span className="font-bold text-[#072C4C]">{applicant.paymentMethod || 'bKash'}</span>
                </div>
                {applicant.paymentSenderMobile && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isEnglish ? 'Sender Mobile (Cash Out):' : 'ক্যাশ আউট প্রেরক নম্বর:'}</span>
                    <span className="font-mono font-bold text-[#072C4C]">{applicant.paymentSenderMobile}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm font-bold bg-emerald-50 px-3.5 rounded-lg mt-1 border border-emerald-200">
                  <span className="text-emerald-900">{isEnglish ? 'Fee Amount Paid:' : 'পরিশোধিত ফি-র পরিমাণ:'}</span>
                  <span className="text-emerald-900 font-mono text-base font-bold">
                    {isEnglish ? `BDT ${receipt?.amount || settings.feeAmount} (Confirmed)` : `৳${convertToBengaliNumber(receipt?.amount || settings.feeAmount)} (পরিশোধিত)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end pt-5 border-t border-dashed border-slate-200 text-xs relative z-10">
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-2xs border border-emerald-300">
                  ✓ {isEnglish ? 'Fee Payment Confirmed' : 'ফি পরিশোধ নিশ্চিত'}
                </span>
                <p className="text-2xs text-slate-500">{isEnglish ? 'Official Automated Money Receipt' : 'আল-ইখওয়ান অনলাইন স্বয়ংক্রিয় মানি রসিদ'}</p>
              </div>

              <div className="text-right">
                <div className="font-serif-bn font-bold text-[#072C4C] text-xs">
                  {isEnglish ? INSTITUTION.englishName : INSTITUTION.name}
                </div>
                <p className="text-2xs text-slate-500 border-t border-slate-300 pt-1 mt-1">
                  {isEnglish ? 'Treasurer / Examination Council' : 'অর্থ সম্পাদক / পরীক্ষা পরিষদ'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 no-print relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    setIsDownloadingPdf(true);
                    try {
                      await generateReceiptPDF({
                        applicant,
                        receipt,
                        settings,
                        lang
                      });
                    } finally {
                      setIsDownloadingPdf(false);
                    }
                  }}
                  disabled={isDownloadingPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#072C4C] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-sky-300" />
                  <span>{isDownloadingPdf ? (isEnglish ? 'Generating...' : 'তৈরি হচ্ছে...') : (isEnglish ? 'Download Receipt PDF' : 'মানি রসিদ PDF ডাউনলোড')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-[#0284C7]" />
                  <span>{isEnglish ? 'Print' : 'প্রিন্ট'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onSelectApplicant(applicant);
                  setActiveTab('admit');
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <span>{isEnglish ? 'View Admit Schedule' : 'প্রবেশপত্র সময়সূচি দেখুন'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ) : (applicant.paymentStatus === 'pending' || receipt?.status === 'অপেক্ষমাণ') ? (
          /* PENDING APPROVAL CARD */
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
            <div className="text-center space-y-2 border-b border-amber-200 pb-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-7 h-7" />
              </div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                ⏳ {isEnglish ? 'Payment Verification Pending' : 'পেমেন্ট যাচাই ও অনুমোদন প্রক্রিয়াধীন'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C]">
                {isEnglish ? 'Payment Received & Awaiting Admin Approval' : 'পেমেন্ট তথ্য সংস্থায় জমা রয়েছে (অ্যাডমিন অনুমোদনের অপেক্ষায়)'}
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                {isEnglish
                  ? `Your bKash Cash Out number (${applicant.paymentSenderMobile || receipt?.paymentSenderMobile || 'Submitted'}) has been recorded. Once the admin manually verifies and approves the payment in the dashboard, your official stamped money receipt and admit card will be automatically available for download here.`
                  : `আপনার জমাকৃত বিকাশ ক্যাশ আউট নম্বরটি (${applicant.paymentSenderMobile || receipt?.paymentSenderMobile || 'দাখিলকৃত'}) সংস্থায় রেকর্ড করা হয়েছে। অ্যাডমিন প্যানেল থেকে দায়িত্বপ্রাপ্ত কর্মকর্তা ক্যাশ আউট স্টেটমেন্ট মিলিয়ে অনুমোদন দেওয়ার সাথে সাথে এখানে অফিসিয়াল মানি রসিদ ও প্রবেশপত্র স্বয়ংক্রিয়ভাবে ডাউনলোডের জন্য প্রস্তুত হয়ে যাবে।`}
              </p>
            </div>

            {/* Submission Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs">
              <div>
                <span className="text-slate-500 block">{isEnglish ? 'Application ID:' : 'আবেদন নম্বর:'}</span>
                <strong className="font-mono text-[#0284C7] font-bold text-xs sm:text-sm">{applicant.applicationNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">{isEnglish ? 'Candidate Name:' : 'শিক্ষার্থীর নাম:'}</span>
                <strong className="text-[#072C4C] font-bold truncate block">{applicant.nameBn}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">{isEnglish ? 'Cash Out Sender:' : 'ক্যাশ আউট প্রেরক:'}</span>
                <strong className="font-mono text-[#072C4C] font-bold">{applicant.paymentSenderMobile || receipt?.paymentSenderMobile || 'রেকর্ডকৃত'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">{isEnglish ? 'Fee Amount:' : 'নির্ধারিত ফি:'}</span>
                <strong className="font-mono text-amber-800 font-bold text-sm">৳{convertToBengaliNumber(receipt?.amount || settings.feeAmount)}</strong>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span>মানি রসিদ কখন পাওয়া যাবে?</span>
              </div>
              <p className="text-2xs text-slate-600 leading-relaxed">
                আল-ইখওয়ান পরীক্ষা পরিষদ নিয়মিত বিরতিতে বিকাশ ক্যাশ আউট স্টেটমেন্ট পরীক্ষা করে আবেদনগুলো অনুমোদন করে থাকে। সাধারণত কয়েক ঘণ্টার মধ্যে অনুমোদন সম্পন্ন হয়। অনুমোদন সম্পন্ন হলে এই পেজেই স্বয়ংক্রিয়ভাবে মানি রসিদ PDF ডাউনলোড বাটন দৃশ্যমান হবে।
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const updated = storage.getApplicantByNo(applicant.applicationNo);
                  if (updated) {
                    setApplicant(updated);
                    onSelectApplicant(updated);
                    setReceipt(storage.getReceiptByAppNo(applicant.applicationNo) || null);
                  }
                }}
                className="px-5 py-2.5 bg-[#072C4C] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>স্ট্যাটাস রিফ্রেশ করুন (Reload Status)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admit')}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                প্রবেশপত্র পেজ দেখুন
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT SUBMISSION FORM */
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
                  {isEnglish ? 'Submit Examination Fee Details' : 'পরীক্ষা ফি পরিশোধ সংক্রান্ত তথ্য'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEnglish ? 'Candidate:' : 'শিক্ষার্থী:'} <strong>{applicant.nameBn}</strong> ({applicant.className})
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">{isEnglish ? 'Prescribed Fee' : 'নির্ধারিত ফি'}</span>
                <span className="text-2xl font-bold text-[#072C4C] font-mono">
                  {isEnglish ? `BDT ${settings.feeAmount}` : `৳${convertToBengaliNumber(settings.feeAmount)}`}
                </span>
              </div>
            </div>

            {/* Official Mobile Banking Accounts */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Phone className="w-4 h-4 text-[#0284C7]" />
                <span>{isEnglish ? 'Official Fee Collection Mobile Numbers:' : 'সংস্থার দাপ্তরিক ফি গ্রহণকারী নম্বরসমূহ:'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-pink-700 block">bKash (Send Money):</span>
                  <span className="font-mono font-bold text-[#072C4C] text-xs">01750-969712</span>
                  <span className="text-slate-400 block mt-0.5">মুহিবুর রহমান (সদস্য সচিব)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-orange-700 block">Nagad (Send Money):</span>
                  <span className="font-mono font-bold text-[#072C4C] text-xs">01750-969712</span>
                  <span className="text-slate-400 block mt-0.5">আল-ইখওয়ান হিসাব</span>
                </div>
              </div>
              <p className="text-2xs text-slate-500 leading-relaxed">
                {isEnglish
                  ? 'Send BDT 100 with candidate application ID in reference, then enter the Sender Phone and TrxID below.'
                  : 'রেফারেন্সে প্রার্থীর আবেদন নম্বর লিখে ১০০ টাকা পাঠিয়ে প্রেরক নম্বর ও TrxID নিচে লিখুন।'}
              </p>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#072C4C]">
                  {isEnglish ? 'Select Payment Mode:' : 'পেমেন্ট মেথড নির্বাচন করুন:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'bKash', label: 'বিকাশ (bKash)' },
                    { id: 'Nagad', label: 'নগদ (Nagad)' },
                    { id: 'Rocket', label: 'রকেট (Rocket)' },
                    { id: 'Cash', label: isEnglish ? 'Cash via School' : 'স্কুলে নগদ জমা' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-[#0284C7] bg-[#0284C7] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'Cash' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender Number */}
                  <div>
                    <label className="block text-xs font-bold text-[#072C4C] mb-1">
                      {isEnglish ? 'Sender Mobile Number (11 digits)' : 'যে নম্বর থেকে ফি পাঠিয়েছেন (১১ ডিজিট)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={senderNumber}
                      onChange={e => setSenderNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono bg-white focus:border-[#0284C7]"
                    />
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-xs font-bold text-[#072C4C] mb-1">
                      {isEnglish ? 'Transaction ID (bKash/Nagad TrxID)' : 'ট্রানজ্যাকশন আইডি (বিকাশ/নগদ TrxID)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="9A4K8L9M2"
                      value={trxIdInput}
                      onChange={e => setTrxIdInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono uppercase bg-white focus:border-[#0284C7]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800">
                  <p className="font-bold">{isEnglish ? 'Cash Payment at School:' : 'প্রতিষ্ঠানপ্রধানের মাধ্যমে নগদ পরিশোধ:'}</p>
                  <p className="mt-1 leading-relaxed">
                    {isEnglish
                      ? 'Confirm that BDT 100 has been handed over to the Head Teacher along with the application copy. The Examination Committee reconciles cash with the school roster.'
                      : 'আবেদনপত্রের কপিসহ নির্ধারিত ১০০ টাকা প্রতিষ্ঠানপ্রধানের নিকট জমা প্রদান করেছেন মর্মে নিশ্চিত করে দাখিল করুন।'}
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <span>{isEnglish ? 'Recording transaction...' : 'পেমেন্ট যাচাই ও সম্পন্ন হচ্ছে...'}</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>{isEnglish ? `Record Payment of BDT ${settings.feeAmount}` : `৳${convertToBengaliNumber(settings.feeAmount)} ফি দাখিল নিশ্চিত করুন`}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )
      )}
    </div>
  );
};
