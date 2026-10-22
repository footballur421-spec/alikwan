import React, { useState } from 'react';
import { Applicant, ExamSettings, Gender, SchoolCategory, PaymentReceipt } from '../types';
import { DEFAULT_SCHOOLS } from '../data/locations';
import { 
  generateApplicationNo,
  generateAdmitCardNo,
  convertToBengaliNumber,
  validateMobile,
  allocateCategoryRoll
} from '../utils/validation';
import { validateAndCompressImage } from '../utils/imageCompressor';
import { storage } from '../services/storage';
import { SupportedLang, formatLangDateTime } from '../utils/i18n';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  AlertCircle, 
  CreditCard, 
  User, 
  Check, 
  Copy, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Download, 
  Phone, 
  Clock, 
  Printer, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { generateReceiptPDF, generateBatchReceiptPDF } from '../utils/pdfGenerator';

interface CandidateData {
  nameBn: string;
  nameEn: string;
  dob: string;
  gender: Gender;
  fatherName: string;
  motherName: string;
  mobile: string;
  rollNo: string;
  photoUrl: string;
  signatureUrl: string;
  photoError?: string;
  signatureError?: string;
}

const createCandidate = (index: number): CandidateData => ({
  nameBn: '',
  nameEn: '',
  dob: '2015-05-15',
  gender: 'ছাত্র',
  fatherName: '',
  motherName: '',
  mobile: '',
  rollNo: String(index + 1),
  photoUrl: '',
  signatureUrl: '',
});

const getCandidateTitle = (index: number): string => {
  const titles = [
    '১ম পরিক্ষার্থীর তথ্য',
    '২য় পরিক্ষার্থীর তথ্য',
    '৩য় পরিক্ষার্থীর তথ্য',
    '৪র্থ পরিক্ষার্থীর তথ্য',
    '৫ম পরিক্ষার্থীর তথ্য',
    '৬ষ্ঠ পরিক্ষার্থীর তথ্য',
    '৭ম পরিক্ষার্থীর তথ্য'
  ];
  return titles[index] || `${convertToBengaliNumber(index + 1)}ম পরিক্ষার্থীর তথ্য`;
};

interface ApplicationWizardProps {
  settings: ExamSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onApplicationSuccess: (applicant: Applicant) => void;
  lang?: SupportedLang;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  settings,
  setActiveTab,
  onApplicationSuccess,
  lang = 'bn',
}) => {
  const featuredCampaign = storage.getFeaturedCampaign();
  const feeAmount = featuredCampaign?.isFeeRequired ? featuredCampaign.feeAmount : settings.feeAmount || 100;
  const bkashAgentNumber = '01797-267924';

  // Wizard Steps:
  // 1: শিক্ষাপ্রতিষ্ঠানের তথ্য ও পরীক্ষার্থী সংখ্যা (ALWAYS FIRST as requested)
  // 2: পরীক্ষার্থীদের তথ্য ও ছবি (১ম, ২য়, ৩য়... প্রতিটি পরীক্ষার্থী)
  // 3: ঠিকানা ও সারসংক্ষেপ
  // 4: ফি ও বিকাশ ক্যাশ আউট
  // 5: সফল নিবন্ধন ও মানি রসিদ
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeCandidateTab, setActiveCandidateTab] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  // --- Step 1: Institution (Always First!) ---
  const [schoolName, setSchoolName] = useState(DEFAULT_SCHOOLS[0] || '');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('বড়লেখা, মৌলভীবাজার');
  const [headmasterMobile, setHeadmasterMobile] = useState('');
  const [participatingCount, setParticipatingCount] = useState<number>(1);
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategory>('primary');
  const [className, setClassName] = useState('পঞ্চম শ্রেণি (সাধারণ)');
  const [division] = useState('সিলেট');
  const [district] = useState('মৌলভীবাজার');
  const [upazila, setUpazila] = useState('বড়লেখা');
  const [unionOrArea, setUnionOrArea] = useState('দাসেরবাজার ইউনিয়ন');
  const [headmasterApproved, setHeadmasterApproved] = useState(true);

  // --- Step 2: Candidates (১ম, ২য়... পরীক্ষার্থী) ---
  const [candidates, setCandidates] = useState<CandidateData[]>([createCandidate(0)]);

  // --- Step 3: Address & Verification ---
  const [presentAddress, setPresentAddress] = useState('বড়লেখা, মৌলভীবাজার');
  const [permanentAddress, setPermanentAddress] = useState('বড়লেখা, মৌলভীবাজার');

  // --- Step 4: Payment ---
  const [paymentSenderMobile, setPaymentSenderMobile] = useState('');
  const [trxIdInput, setTrxIdInput] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [copiedAgent, setCopiedAgent] = useState(false);

  // Form errors
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [candidateErrors, setCandidateErrors] = useState<Record<number, Record<string, string>>>({});
  const [errorList, setErrorList] = useState<string[]>([]);

  // Submission Results
  const [submittedApplicants, setSubmittedApplicants] = useState<Applicant[]>([]);
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceipt | null>(null);

  const finalSchoolName = (customSchoolName.trim() || schoolName).trim();
  const quotaStatus = storage.getSchoolQuotaStatus(finalSchoolName);
  const totalPayableFee = participatingCount * feeAmount;

  // Dynamically retrieved admit card available date
  const rawAvailableDate = featuredCampaign?.admitCardAvailableDate || settings.admitCardAvailableDate || '2026-11-06T09:00';

  // Handle participating student count changes (1 to 7)
  const handleStudentCountChange = (count: number) => {
    setParticipatingCount(count);
    setCandidates(prev => {
      const next: CandidateData[] = [];
      for (let i = 0; i < count; i++) {
        if (prev[i]) {
          next.push(prev[i]);
        } else {
          next.push(createCandidate(i));
        }
      }
      return next;
    });
    if (activeCandidateTab >= count) {
      setActiveCandidateTab(0);
    }
  };

  // Update candidate field
  const updateCandidate = (index: number, updates: Partial<CandidateData>) => {
    setCandidates(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Photo upload handler
  const handlePhotoUpload = async (index: number, file?: File) => {
    if (!file) return;
    updateCandidate(index, { photoError: '' });
    try {
      const res = await validateAndCompressImage(file, {
        maxSizeBytes: 300 * 1024,
        maxWidthOrHeight: 600,
        quality: 0.85
      });
      if (res.success && res.dataUrl) {
        updateCandidate(index, { photoUrl: res.dataUrl, photoError: '' });
      } else {
        updateCandidate(index, { photoError: res.error || 'ছবি আপলোডে সমস্যা হয়েছে' });
      }
    } catch {
      updateCandidate(index, { photoError: 'ছবি প্রসেসিং করতে ব্যর্থ হয়েছে' });
    }
  };

  // Optional signature upload handler
  const handleSignatureUpload = async (index: number, file?: File) => {
    if (!file) return;
    updateCandidate(index, { signatureError: '' });
    try {
      const res = await validateAndCompressImage(file, {
        maxSizeBytes: 200 * 1024,
        maxWidthOrHeight: 500,
        quality: 0.85
      });
      if (res.success && res.dataUrl) {
        updateCandidate(index, { signatureUrl: res.dataUrl, signatureError: '' });
      } else {
        updateCandidate(index, { signatureError: res.error || 'স্বাক্ষর আপলোডে সমস্যা হয়েছে' });
      }
    } catch {
      updateCandidate(index, { signatureError: 'স্বাক্ষর প্রসেসিং করতে ব্যর্থ হয়েছে' });
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};
    const candErrs: Record<number, Record<string, string>> = {};
    const list: string[] = [];

    // Step 1: Institution Validation (Always First)
    if (step === 1) {
      if (!finalSchoolName) {
        errs.schoolName = 'শিক্ষাপ্রতিষ্ঠানের নাম লিখুন বা নির্বাচন করুন';
        list.push(errs.schoolName);
      }

      const quota = storage.getSchoolQuotaStatus(finalSchoolName);
      if (quota.count + participatingCount > 7) {
        errs.quota = `এই শিক্ষাপ্রতিষ্ঠান থেকে ইতিমধ্যে ${quota.count} জন নিবন্ধিত আছেন। নতুন ${participatingCount} জন সহ কোটা (সর্বোচ্চ ৭ জন) অতিক্রম করবে। বাকি আসন: ${quota.remaining}টি।`;
        list.push(errs.quota);
      }

      if (headmasterMobile.trim()) {
        const vHead = validateMobile(headmasterMobile);
        if (!vHead.isValid) {
          errs.headmasterMobile = 'প্রধান শিক্ষকের সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)';
          list.push(errs.headmasterMobile);
        }
      }

      if (!headmasterApproved) {
        errs.headmasterApproved = 'প্রধান শিক্ষকের অনুমতির নিশ্চিতকরণে টিক দিন';
        list.push(errs.headmasterApproved);
      }
    }

    // Step 2: Candidates Validation
    if (step === 2) {
      candidates.forEach((cand, idx) => {
        const cErr: Record<string, string> = {};
        const title = getCandidateTitle(idx);

        if (!cand.nameBn.trim()) {
          cErr.nameBn = `${title}: শিক্ষার্থীর নাম আবশ্যক`;
          list.push(cErr.nameBn);
        }

        if (!cand.fatherName.trim()) {
          cErr.fatherName = `${title}: পিতার নাম আবশ্যক`;
          list.push(cErr.fatherName);
        }

        if (!cand.motherName.trim()) {
          cErr.motherName = `${title}: মাতার নাম আবশ্যক`;
          list.push(cErr.motherName);
        }

        const vMobile = validateMobile(cand.mobile);
        if (!vMobile.isValid) {
          cErr.mobile = `${title}: অভিভাবকের সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন`;
          list.push(cErr.mobile);
        }

        if (!cand.photoUrl) {
          cErr.photo = `${title}: শিক্ষার্থীর ছবি আপলোড করা আবশ্যক (Upload 1 supported file. Max 10 MB)`;
          list.push(cErr.photo);
        }

        if (Object.keys(cErr).length > 0) {
          candErrs[idx] = cErr;
        }
      });
    }

    // Step 3: Address Validation
    if (step === 3) {
      if (!presentAddress.trim()) {
        errs.presentAddress = 'বর্তমান ঠিকানা প্রদান করা আবশ্যক';
        list.push(errs.presentAddress);
      }
      if (!permanentAddress.trim()) {
        errs.permanentAddress = 'স্থায়ী ঠিকানা প্রদান করা আবশ্যক';
        list.push(errs.permanentAddress);
      }
    }

    // Step 4: Payment Validation (Cash Out sender mobile is mandatory, TrxID is optional)
    if (step === 4) {
      const vCash = validateMobile(paymentSenderMobile);
      if (!vCash.isValid) {
        errs.paymentSenderMobile = 'যে নাম্বার থেকে বিকাশ ক্যাশ আউট করা হয়েছে সেই ১১ সংখ্যার মোবাইল নম্বরটি লিখুন';
        list.push(errs.paymentSenderMobile);
      }
      // TrxID is completely optional as requested by user
      if (!declarationAccepted) {
        errs.declarationAccepted = 'তথ্য সত্যতার অঙ্গীকারে টিক চিহ্ন দিন';
        list.push(errs.declarationAccepted);
      }
    }

    setStepErrors(errs);
    setCandidateErrors(candErrs);
    setErrorList(list);
    return list.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Batch Application (Saved as pending approval so admin reviews before receipt is downloadable)
  const handleSubmitApplication = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    setErrorList([]);

    try {
      const existingApplicants = storage.getApplicants();
      let nextSeq = existingApplicants.length + 1;
      const finalTrxId = trxIdInput.trim() ? trxIdInput.trim().toUpperCase() : '';

      const newApplicants: Applicant[] = candidates.map((cand, idx) => {
        const appNo = generateApplicationNo(nextSeq + idx);
        const applicant: Applicant = {
          id: `app-${appNo}`,
          applicationNo: appNo,
          nameBn: cand.nameBn.trim(),
          nameEn: (cand.nameEn.trim() || cand.nameBn.trim()).toUpperCase(),
          dob: cand.dob || '2015-05-15',
          gender: cand.gender || 'ছাত্র',
          fatherName: cand.fatherName.trim(),
          motherName: cand.motherName.trim(),
          mobile: cand.mobile.trim(),
          schoolName: finalSchoolName,
          schoolAddress: schoolAddress.trim() || undefined,
          headmasterMobile: headmasterMobile.trim() || undefined,
          participatingStudentsCount: participatingCount,
          schoolCategory: schoolCategory,
          className: className,
          rollNo: cand.rollNo.trim() || String(idx + 1),
          division: division,
          district: district,
          upazila: upazila,
          unionOrArea: unionOrArea,
          presentAddress: presentAddress.trim(),
          permanentAddress: permanentAddress.trim(),
          paymentSenderMobile: paymentSenderMobile.trim(),
          photoUrl: cand.photoUrl || '/assets/aistudio/image_9453218f.png',
          signatureUrl: cand.signatureUrl || undefined, // undefined leaves it clean and empty!
          declarationAccepted: true,
          headmasterApproved: true,
          status: 'under_review',
          paymentStatus: 'pending',
          paymentMethod: 'বিকাশ এজেন্ট ক্যাশ আউট (bKash Cash Out)',
          transactionId: finalTrxId || undefined,
          paymentDate: new Date().toISOString().split('T')[0],
          admitCardIssued: false,
          examCenter: settings.examCenters[0] || 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (১০১)',
          examDate: featuredCampaign?.examDate || settings.examDate || '২০২৬-১১-১৪',
          examTime: featuredCampaign?.examTime || settings.examTime || 'সকাল ১০:০০ টা - দুপুর ১২:০০ টা',
          campaignId: featuredCampaign?.id,
          instituteStudentIndex: idx + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return applicant;
      });

      // Save to local storage & push directly to Firebase Cloud Firestore!
      const saveRes = storage.saveApplicantsBatch(newApplicants);
      if (!saveRes.success) {
        setErrorList([saveRes.error || 'আবেদন সংরক্ষণ ব্যর্থ হয়েছে।']);
        setIsSubmitting(false);
        return;
      }

      // Record pending money receipt in dashboard & Firestore for admin approval
      const receipt = storage.recordPendingPayment(
        newApplicants[0].applicationNo,
        totalPayableFee,
        'বিকাশ এজেন্ট ক্যাশ আউট',
        finalTrxId,
        paymentSenderMobile.trim(),
        newApplicants.length
      );

      setSubmittedApplicants(newApplicants);
      setCompletedReceipt(receipt || null);
      onApplicationSuccess(newApplicants[0]);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setErrorList([e.message || 'Submission error']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download Receipt (Batch or Single)
  const handleDownloadReceipt = async () => {
    if (submittedApplicants.length === 0) return;
    setIsDownloadingReceipt(true);
    try {
      if (submittedApplicants.length > 1) {
        await generateBatchReceiptPDF({
          applicants: submittedApplicants,
          schoolName: finalSchoolName,
          totalAmount: totalPayableFee,
          paymentSenderMobile,
          transactionId: trxIdInput.trim().toUpperCase(),
          settings,
          lang
        });
      } else {
        await generateReceiptPDF({
          applicant: submittedApplicants[0],
          receipt: completedReceipt,
          settings,
          lang
        });
      }
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAgent(true);
    setTimeout(() => setCopiedAgent(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#07243B] text-white p-6 sm:p-7 border border-[#0B3556] relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
              প্রাতিষ্ঠানিক ও ব্যক্তিগত অনলাইন নিবন্ধন পোর্টাল
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif-bn">
              {featuredCampaign?.title || 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা ২০২৬'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              সঠিক তথ্য দিয়ে আবেদন ফরমটি পূরণ করুন। একের অধিক পরীক্ষার্থী হলে শিক্ষাপ্রতিষ্ঠান এক ফরমেই সর্বোচ্চ ৭ জন শিক্ষার্থীর তথ্য পূরণ করতে পারবে।
            </p>
          </div>

          <div className="bg-[#0A2F4D] border border-[#144872] p-3 text-center shrink-0 min-w-[130px]">
            <span className="text-[10px] text-slate-300 block uppercase font-medium">নির্ধারিত ফি</span>
            <div className="text-2xl font-bold font-mono text-amber-300">৳{convertToBengaliNumber(totalPayableFee)}</div>
            <span className="text-[10px] text-slate-300">
              {participatingCount > 1 
                ? `${convertToBengaliNumber(participatingCount)} জন (জনপ্রতি ৳১০০)` 
                : 'জনপ্রতি একশত টাকা'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Steps (1 to 4) */}
      {currentStep <= 4 && (
        <div className="bg-white border border-slate-200 p-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: 1, label: '১. শিক্ষাপ্রতিষ্ঠান', icon: Building2 },
              { step: 2, label: '২. পরীক্ষার্থীদের তথ্য', icon: User },
              { step: 3, label: '৩. ঠিকানা ও যাচাই', icon: FileCheck2 },
              { step: 4, label: '৪. ফি ও পেমেন্ট', icon: CreditCard },
            ].map(s => {
              const Icon = s.icon;
              const isActive = currentStep === s.step;
              const isPast = currentStep > s.step;
              return (
                <div
                  key={s.step}
                  className={`flex flex-col items-center text-center p-2 transition ${
                    isActive
                      ? 'border-b-2 border-[#0272A6] text-[#07243B] font-bold bg-slate-50'
                      : isPast
                      ? 'text-emerald-800'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs mb-1 transition ${
                      isActive
                        ? 'bg-[#07243B] text-white'
                        : isPast
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : convertToBengaliNumber(s.step)}
                  </div>
                  <span className="text-[11px] leading-tight line-clamp-1">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Summary Banner */}
      {errorList.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-red-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>আবেদনপত্রে কিছু তথ্য সংশোধন করা প্রয়োজন:</span>
          </div>
          <ul className="text-2xs text-red-700 list-disc list-inside space-y-0.5">
            {errorList.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ===================================================================
          STEP 1: INSTITUTION FIRST (Always at First as requested)
         =================================================================== */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0284C7]" />
                <span>১. শিক্ষাপ্রতিষ্ঠানের তথ্য ও পরীক্ষার্থী সংখ্যা</span>
              </h2>
              <p className="text-2xs text-slate-500 mt-0.5">
                প্রতিষ্ঠান নির্বাচন করে মোট কতজন পরীক্ষার্থী অংশগ্রহণ করবে তা নির্ধারণ করুন।
              </p>
            </div>

            {/* Quota Badge */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 self-start ${
              quotaStatus.isFull 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <GraduationCap className="w-3.5 h-3.5" />
              <span>কোটা: ৭ জনের মধ্যে {convertToBengaliNumber(quotaStatus.count)} জন নিবন্ধিত</span>
              {!quotaStatus.isFull && (
                <span className="text-emerald-600 font-normal">({convertToBengaliNumber(quotaStatus.remaining)}টি বাকি)</span>
              )}
            </div>
          </div>

          {quotaStatus.isFull && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>সতর্কবার্তা: এই শিক্ষাপ্রতিষ্ঠান থেকে ইতিমধ্যে সর্বোচ্চ ৭ জন শিক্ষার্থী নিবন্ধিত হয়ে গেছে। নীতিমালার বাইরে অতিরিক্ত আবেদন গ্রহণযোগ্য নয়।</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* School Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                শিক্ষাপ্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
              </label>
              <select
                value={schoolName}
                onChange={e => {
                  setSchoolName(e.target.value);
                  if (e.target.value !== 'অন্যান্য (নিজে লিখুন)') {
                    setCustomSchoolName('');
                  }
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              >
                {DEFAULT_SCHOOLS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="অন্যান্য (নিজে লিখুন)">অন্যান্য (নিজে লিখুন)</option>
              </select>

              {schoolName === 'অন্যান্য (নিজে লিখুন)' && (
                <input
                  type="text"
                  placeholder="বিদ্যালয়/মাদ্রাসার পুরো নাম লিখুন"
                  value={customSchoolName}
                  onChange={e => setCustomSchoolName(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
                />
              )}
              {stepErrors.schoolName && <p className="text-3xs text-red-600 mt-1">{stepErrors.schoolName}</p>}
            </div>

            {/* School Address */}
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                প্রতিষ্ঠানের ঠিকানা <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: গ্রাম/এলাকা, ডাকঘর, উপজেলা, জেলা"
                value={schoolAddress}
                onChange={e => setSchoolAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              />
            </div>

            {/* Headmaster WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                প্রতিষ্ঠান প্রধানের (ওয়াটসঅ্যাপ) মোবাইল নম্বর
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={headmasterMobile}
                onChange={e => setHeadmasterMobile(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm font-mono bg-white focus:border-[#0284C7]"
              />
              <span className="text-3xs text-slate-500 block mt-0.5">
                প্রবেশপত্র ও সকল তথ্য প্রধান শিক্ষকের এই ওয়াটস্আপ নম্বরেও পাঠানো হবে।
              </span>
              {stepErrors.headmasterMobile && <p className="text-3xs text-red-600 mt-1">{stepErrors.headmasterMobile}</p>}
            </div>

            {/* Number of Candidates Selector (1 to 7) */}
            <div className="sm:col-span-2 p-4 bg-sky-50/60 border border-sky-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-[#072C4C]">
                  আপনার প্রতিষ্ঠান থেকে অংশগ্রহণকারী পরীক্ষার্থীর সংখ্যা কতজন? <span className="text-red-500">*</span>
                </label>
                <span className="text-2xs text-sky-800 font-semibold">
                  (প্রতিষ্ঠান থেকে সর্বোচ্চ ৭ জনের কোটা)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleStudentCountChange(num)}
                    className={`px-4 py-2.5 font-bold font-mono text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 border ${
                      participatingCount === num
                        ? 'bg-[#07243B] text-white border-[#07243B] shadow-sm ring-2 ring-sky-400'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span>{convertToBengaliNumber(num)} জন</span>
                    {num > 1 && <span className="text-3xs opacity-80">(ব্যাচ)</span>}
                  </button>
                ))}
              </div>
              <p className="text-3xs text-slate-600 mt-2">
                💡 {participatingCount > 1 
                  ? `আপনি ${convertToBengaliNumber(participatingCount)} জন পরীক্ষার্থী নির্বাচন করেছেন। পরবর্তী ধাপে ১ম থেকে ${convertToBengaliNumber(participatingCount)}ম পরীক্ষার্থীর তথ্য ধারাবাহিকভাবে পূরণ করতে হবে।`
                  : 'একক শিক্ষার্থীর জন্য ১ জন নির্বাচন করা হয়েছে।'}
              </p>
              {stepErrors.quota && <p className="text-3xs text-red-600 mt-1">{stepErrors.quota}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                প্রতিষ্ঠানের ধরন / ক্যাটাগরি <span className="text-red-500">*</span>
              </label>
              <select
                value={schoolCategory}
                onChange={e => setSchoolCategory(e.target.value as SchoolCategory)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              >
                <option value="primary">সরকারি প্রাথমিক বিদ্যালয় (রোল শুরু: ২৮২১)</option>
                <option value="kindergarten">কিন্ডারগার্টেন (কেজি) বিদ্যালয় (রোল শুরু: ৩০০১)</option>
                <option value="madrasa">ইবতেদায়ী মাদ্রাসা (রোল শুরু: ৩২০১)</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                শ্রেণি ও পাঠ্যক্রম <span className="text-red-500">*</span>
              </label>
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              >
                <option value="পঞ্চম শ্রেণি (সাধারণ)">পঞ্চম শ্রেণি (সাধারণ প্রাথমিক)</option>
                <option value="পঞ্চম শ্রেণি (ইবতেদায়ী)">পঞ্চম শ্রেণি (ইবতেদায়ী মাদ্রাসা)</option>
              </select>
            </div>

            {/* Upazila */}
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                উপজেলা ও এলাকা <span className="text-red-500">*</span>
              </label>
              <select
                value={upazila}
                onChange={e => {
                  setUpazila(e.target.value);
                  if (e.target.value === 'বিয়ানীবাজার') {
                    setUnionOrArea('লাউতা ইউনিয়ন');
                  } else {
                    setUnionOrArea('দাসেরবাজার ইউনিয়ন');
                  }
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              >
                <option value="বড়লেখা">বড়লেখা উপজেলা (সকল ইউনিয়ন ও পৌরসভা)</option>
                <option value="বিয়ানীবাজার">বিয়ানীবাজার উপজেলা (শুধুমাত্র লাউতা ইউনিয়ন)</option>
              </select>
            </div>

            {/* Union / Area */}
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                ইউনিয়ন / ওয়ার্ড <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={unionOrArea}
                onChange={e => setUnionOrArea(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              />
            </div>

            {/* Headmaster declaration */}
            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="headmasterCheck"
                checked={headmasterApproved}
                onChange={e => setHeadmasterApproved(e.target.checked)}
                className="mt-0.5 text-[#0284C7] focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="headmasterCheck" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                <strong>প্রধান শিক্ষকের সম্মতি:</strong> আমি নিশ্চিত করছি যে, সংশ্লিষ্ট প্রতিষ্ঠানের প্রধান শিক্ষক/মুহতামিমের অনুমতিক্রমে এই বৃত্তি পরীক্ষায় অংশগ্রহণ করা হচ্ছে।
              </label>
            </div>
            {stepErrors.headmasterApproved && <p className="text-3xs text-red-600 sm:col-span-2">{stepErrors.headmasterApproved}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={quotaStatus.isFull}
              className={`px-6 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                quotaStatus.isFull
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#07243B] hover:bg-[#0369A1] text-white active:scale-[0.98]'
              }`}
            >
              <span>পরবর্তী ধাপ: পরীক্ষার্থীদের তথ্য পূরণ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 2: CANDIDATES INFORMATION (১ম, ২য়... পরীক্ষার্থীর তথ্য)
         =================================================================== */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C] flex items-center gap-2">
                <User className="w-4 h-4 text-[#0284C7]" />
                <span>২. পরীক্ষার্থীদের তথ্য ও ছবি</span>
              </h2>
              <p className="text-2xs text-slate-500 mt-0.5">
                {finalSchoolName} থেকে মোট {convertToBengaliNumber(participatingCount)} জন পরীক্ষার্থীর তথ্য নিচে পূরণ করুন।
              </p>
            </div>

            {/* Quick Candidate Tab Selector for easy switching */}
            {participatingCount > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {candidates.map((cand, idx) => {
                  const isFilled = Boolean(cand.nameBn && cand.fatherName && cand.mobile && cand.photoUrl);
                  const isActive = activeCandidateTab === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCandidateTab(idx)}
                      className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                        isActive
                          ? 'bg-[#07243B] text-white border-[#07243B]'
                          : isFilled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isFilled && <Check className="w-3 h-3 text-emerald-600" />}
                      <span>{convertToBengaliNumber(idx + 1)}ম</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form for Each Candidate (Displayed in sequence: ১ম পরিক্ষার্থীর তথ্য, ২য় পরিক্ষার্থীর তথ্য...) */}
          <div className="space-y-8">
            {candidates.map((cand, idx) => {
              const candErr = candidateErrors[idx] || {};

              return (
                <div
                  key={idx}
                  id={`candidate-card-${idx}`}
                  className="border-2 border-[#0284C7]/60 rounded-xl p-5 sm:p-6 space-y-5 bg-white shadow-xs"
                >
                  {/* Candidate Header as requested: ১ম পরিক্ষার্থীর তথ্য / ২য় পরিক্ষার্থীর তথ্য */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-[#07243B] text-white font-bold flex items-center justify-center text-sm font-mono shadow-xs">
                        {convertToBengaliNumber(idx + 1)}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C]">
                          {getCandidateTitle(idx)}
                        </h3>
                        <span className="text-3xs text-slate-500 font-medium">
                          {finalSchoolName} · প্রার্থী ক্রমিক #{convertToBengaliNumber(idx + 1)}
                        </span>
                      </div>
                    </div>

                    {headmasterMobile && (
                      <button
                        type="button"
                        onClick={() => updateCandidate(idx, { mobile: headmasterMobile })}
                        className="text-2xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1 self-start cursor-pointer bg-sky-50 px-2.5 py-1 rounded border border-sky-200"
                      >
                        <Phone className="w-3 h-3 text-[#0284C7]" />
                        <span>প্রতিষ্ঠান প্রধানের মোবাইল ({headmasterMobile}) ব্যবহার করুন</span>
                      </button>
                    )}
                  </div>

                  {/* Core 5 Fields as requested */}
                  <div className="space-y-4">
                    {/* ১. নাম * */}
                    <div>
                      <label className="block text-xs font-bold text-[#072C4C] mb-1">
                        নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="শিক্ষার্থীর নাম লিখুন (যেমন: মোঃ আব্দুল্লাহ আল নোমান)"
                        value={cand.nameBn}
                        onChange={e => updateCandidate(idx, { nameBn: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white focus:border-[#0284C7] ${
                          candErr.nameBn ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                      {candErr.nameBn && <p className="text-3xs text-red-600 mt-1">{candErr.nameBn}</p>}
                    </div>

                    {/* ২. পিতার নাম * */}
                    <div>
                      <label className="block text-xs font-bold text-[#072C4C] mb-1">
                        পিতার নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="পিতার নাম লিখুন"
                        value={cand.fatherName}
                        onChange={e => updateCandidate(idx, { fatherName: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white focus:border-[#0284C7] ${
                          candErr.fatherName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                      {candErr.fatherName && <p className="text-3xs text-red-600 mt-1">{candErr.fatherName}</p>}
                    </div>

                    {/* ৩. মাতার নাম * */}
                    <div>
                      <label className="block text-xs font-bold text-[#072C4C] mb-1">
                        মাতার নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="মাতার নাম লিখুন"
                        value={cand.motherName}
                        onChange={e => updateCandidate(idx, { motherName: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white focus:border-[#0284C7] ${
                          candErr.motherName ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                      {candErr.motherName && <p className="text-3xs text-red-600 mt-1">{candErr.motherName}</p>}
                    </div>

                    {/* ৪. অভিবাবকের মোবাইল নাম্বার * */}
                    <div>
                      <label className="block text-xs font-bold text-[#072C4C] mb-1">
                        অভিবাবকের মোবাইল নাম্বার <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={cand.mobile}
                        onChange={e => updateCandidate(idx, { mobile: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-mono bg-white focus:border-[#0284C7] ${
                          candErr.mobile ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                        }`}
                      />
                      <span className="text-3xs text-slate-400 block mt-0.5">এই নম্বরে পরীক্ষা সংক্রান্ত তথ্য পাঠানো হবে।</span>
                      {candErr.mobile && <p className="text-3xs text-red-600 mt-1">{candErr.mobile}</p>}
                    </div>

                    {/* ৫. ছবি * (Upload 1 supported file. Max 10 MB.) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#072C4C]">
                          ছবি <span className="text-red-500">*</span>
                        </label>
                        <span className="text-2xs text-slate-500 font-mono font-semibold">
                          Upload 1 supported file. Max 10 MB.
                        </span>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#0284C7] transition bg-slate-50/50">
                        {cand.photoUrl ? (
                          <div className="flex items-center justify-center gap-4">
                            <img
                              src={cand.photoUrl}
                              alt="Student"
                              className="w-24 h-28 object-cover border border-slate-300 rounded-lg shadow-2xs"
                            />
                            <div className="space-y-2 text-left">
                              <span className="text-xs font-bold text-emerald-700 block">✓ ছবি আপলোড সম্পন্ন</span>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-2xs font-bold cursor-pointer transition rounded">
                                  পরিবর্তন
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handlePhotoUpload(idx, e.target.files?.[0])}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => updateCandidate(idx, { photoUrl: '' })}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 text-2xs font-bold hover:bg-red-100 cursor-pointer rounded"
                                >
                                  মুছুন
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="block cursor-pointer py-5 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center mx-auto">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#072C4C] block">ছবি আপলোড করুন (Add File)</span>
                            <span className="text-2xs text-slate-500 block font-mono">Upload 1 supported file. Max 10 MB.</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handlePhotoUpload(idx, e.target.files?.[0])}
                            />
                          </label>
                        )}
                      </div>
                      {cand.photoError && <p className="text-3xs text-red-600">{cand.photoError}</p>}
                      {candErr.photo && <p className="text-3xs text-red-600">{candErr.photo}</p>}
                    </div>

                    {/* Collapsible Section for Extra Optional Details */}
                    <details className="pt-2 text-xs border-t border-slate-100 group">
                      <summary className="font-semibold text-slate-600 hover:text-[#0284C7] cursor-pointer flex items-center gap-1.5 select-none py-1">
                        <span className="text-sky-600 font-bold group-open:rotate-90 transition-transform">▸</span>
                        <span>অতিরিক্ত তথ্য (ঐচ্ছিক: শ্রেণি রোল, ইংরেজি নাম, জন্ম তারিখ, লিঙ্গ ও স্বাক্ষর)</span>
                      </summary>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 pl-2">
                        {/* Student Name (English) */}
                        <div>
                          <label className="block text-2xs font-bold text-[#072C4C] mb-1">
                            Student Name (in English, Capital Letters)
                          </label>
                          <input
                            type="text"
                            placeholder="E.G. MD ABDULLAH AL NOMAN"
                            value={cand.nameEn}
                            onChange={e => updateCandidate(idx, { nameEn: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 rounded border border-slate-300 text-xs uppercase bg-white focus:border-[#0284C7]"
                          />
                        </div>

                        {/* শ্রেণি রোল নম্বর */}
                        <div>
                          <label className="block text-2xs font-bold text-[#072C4C] mb-1">
                            বিদ্যালয়ের শ্রেণি রোল নম্বর (ঐচ্ছিক)
                          </label>
                          <input
                            type="text"
                            placeholder={`যেমন: ${convertToBengaliNumber(idx + 1)}`}
                            value={cand.rollNo}
                            onChange={e => updateCandidate(idx, { rollNo: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 text-xs bg-white focus:border-[#0284C7]"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-2xs font-bold text-[#072C4C] mb-1">
                            জন্ম তারিখ
                          </label>
                          <input
                            type="date"
                            value={cand.dob}
                            onChange={e => updateCandidate(idx, { dob: e.target.value })}
                            className="w-full px-3 py-2 rounded border border-slate-300 text-xs bg-white focus:border-[#0284C7]"
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-2xs font-bold text-[#072C4C] mb-1">
                            লিঙ্গ
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['ছাত্র', 'ছাত্রী'] as Gender[]).map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => updateCandidate(idx, { gender: g })}
                                className={`py-1.5 px-3 text-xs font-bold rounded transition cursor-pointer border ${
                                  cand.gender === g
                                    ? 'bg-[#07243B] text-white border-[#07243B]'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Optional Signature */}
                        <div className="sm:col-span-2 space-y-1.5 pt-1">
                          <label className="block text-2xs font-bold text-[#072C4C]">
                            শিক্ষার্থীর স্বাক্ষর (ঐচ্ছিক — না দিলেও খালি দাগ থাকবে)
                          </label>
                          <div className="border border-dashed border-slate-200 rounded p-2.5 bg-slate-50/50">
                            {cand.signatureUrl ? (
                              <div className="flex items-center gap-3">
                                <img
                                  src={cand.signatureUrl}
                                  alt="Signature"
                                  className="h-10 max-w-[140px] object-contain border border-slate-200 bg-white p-1 rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateCandidate(idx, { signatureUrl: '' })}
                                  className="text-2xs text-red-600 underline cursor-pointer"
                                >
                                  মুছুন
                                </button>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-2xs font-semibold cursor-pointer rounded">
                                <Upload className="w-3 h-3" />
                                <span>স্বাক্ষর আপলোড (ঐচ্ছিক)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleSignatureUpload(idx, e.target.files?.[0])}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ: প্রতিষ্ঠান</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#07243B] hover:bg-[#0369A1] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>পরবর্তী ধাপ: ঠিকানা ও সারসংক্ষেপ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 3: ADDRESS & CANDIDATES REVIEW SUMMARY
         =================================================================== */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#0284C7]" />
              <span>৩. ঠিকানা ও পরীক্ষার্থীদের সারসংক্ষেপ পর্যালোচনা</span>
            </h2>
            <p className="text-2xs text-slate-500 mt-0.5">
              বর্তমান ও স্থায়ী ঠিকানা নিশ্চিত করুন এবং সকল পরীক্ষার্থীর তথ্য মিলিয়ে নিন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                বর্তমান ঠিকানা <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                value={presentAddress}
                onChange={e => setPresentAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              />
              {stepErrors.presentAddress && <p className="text-3xs text-red-600 mt-1">{stepErrors.presentAddress}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                স্থায়ী ঠিকানা <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                value={permanentAddress}
                onChange={e => setPermanentAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-xs sm:text-sm bg-white focus:border-[#0284C7]"
              />
              {stepErrors.permanentAddress && <p className="text-3xs text-red-600 mt-1">{stepErrors.permanentAddress}</p>}
            </div>
          </div>

          {/* Enrolled Students Summary Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#072C4C] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#0284C7]" />
              <span>নিবন্ধিত পরীক্ষার্থীদের তালিকা ({convertToBengaliNumber(candidates.length)} জন)</span>
            </h3>

            <div className="border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#07243B] text-white">
                    <th className="p-2.5 font-bold w-12 text-center">নং</th>
                    <th className="p-2.5 font-bold w-14 text-center">ছবি</th>
                    <th className="p-2.5 font-bold">নাম (বাংলা)</th>
                    <th className="p-2.5 font-bold">পিতার নাম</th>
                    <th className="p-2.5 font-bold">অভিভাবকের মোবাইল</th>
                    <th className="p-2.5 font-bold w-20 text-center">শ্রেণি রোল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {candidates.map((cand, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-bold font-mono">{convertToBengaliNumber(idx + 1)}</td>
                      <td className="p-2.5 text-center">
                        {cand.photoUrl ? (
                          <img
                            src={cand.photoUrl}
                            alt="Student"
                            className="w-8 h-9 object-cover border border-slate-200 mx-auto"
                          />
                        ) : (
                          <span className="text-3xs text-red-500">অনুপস্থিত</span>
                        )}
                      </td>
                      <td className="p-2.5 font-semibold text-[#072C4C]">{cand.nameBn || 'নাম দেওয়া হয়নি'}</td>
                      <td className="p-2.5 text-slate-600">{cand.fatherName || '---'}</td>
                      <td className="p-2.5 font-mono text-slate-700">{cand.mobile || '---'}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-[#0284C7]">{cand.rollNo || '---'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Fee Box */}
            <div className="p-4 bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#072C4C] block">সর্বমোট পরীক্ষার ফি হিসাব:</span>
                <span className="text-2xs text-slate-600">
                  {convertToBengaliNumber(candidates.length)} জন পরীক্ষার্থী × ৳{convertToBengaliNumber(feeAmount)} (জনপ্রতি একশত টাকা)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xs text-slate-500 block uppercase">সর্বমোট প্রদেয় টাকা</span>
                <span className="text-xl font-bold font-mono text-[#07243B]">৳{convertToBengaliNumber(totalPayableFee)}/-</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ: পরীক্ষার্থীদের তথ্য</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#07243B] hover:bg-[#0369A1] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>পরবর্তী ধাপ: ফি ও পেমেন্ট</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 4: BKASH AGENT CASH OUT PAYMENT (০১৭৯৭-২৬৭৯২৪)
         =================================================================== */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base sm:text-lg font-bold font-serif-bn text-[#072C4C] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0284C7]" />
              <span>৪. পরীক্ষার ফি ও বিকাশ ক্যাশ আউট</span>
            </h2>
            <p className="text-2xs text-slate-500 mt-0.5">
              আবেদন ফরম সাবমিট করার পূর্বে নির্ধারিত মোট ফি বিকাশ এজেন্ট নাম্বারে ক্যাশ আউট করুন।
            </p>
          </div>

          {/* bKash Cash Out Box */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 border-2 border-pink-300 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-200 pb-3">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-pink-700 block">
                  অফিসিয়াল বিকাশ এজেন্ট নাম্বার (ক্যাশ আউট করুন)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-[#072C4C] tracking-wide">
                    {bkashAgentNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('01797267924')}
                    className="p-1.5 bg-pink-200 hover:bg-pink-300 text-pink-900 transition cursor-pointer text-xs flex items-center gap-1"
                    title="কপি করুন"
                  >
                    {copiedAgent ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAgent ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white/90 p-3 border border-pink-200 text-right">
                <span className="text-3xs text-slate-500 block font-medium">সর্বমোট ফি</span>
                <span className="text-xl font-bold font-mono text-pink-700">৳{convertToBengaliNumber(totalPayableFee)}/-</span>
                <span className="text-3xs text-slate-500 block font-normal">
                  ({convertToBengaliNumber(candidates.length)} জন × ৳১০০)
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-2xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-pink-950">
                📌 কীভাবে ক্যাশ আউট করবেন:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                <li>আপনার বিকাশ অ্যাপ বা *২৪৭# ডায়াল করে <strong>Cash Out</strong> (ক্যাশ আউট) অপশনে যান।</li>
                <li>এজেন্ট নম্বর হিসেবে <strong>০১৭৯৭-২৬৭৯২৪</strong> লিখুন।</li>
                <li>টাকার পরিমাণ <strong>{totalPayableFee}</strong> টাকা লিখে বিকাশ পিন দিয়ে ক্যাশ আউট সম্পন্ন করুন।</li>
                <li>ক্যাশ আউট সম্পন্ন হওয়ার পর ফিরতি এসএমএস থেকে <strong>TrxID</strong> এবং <strong>যে নম্বর থেকে ক্যাশ আউট করেছেন</strong> তা নিচের বক্সে লিখুন।</li>
              </ol>
            </div>

            {/* Helpline Contacts */}
            <div className="pt-2 border-t border-pink-200/80 flex flex-wrap items-center justify-between gap-2 text-2xs text-slate-600">
              <span className="font-bold text-[#072C4C] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#0284C7]" />
                <span>প্রয়োজনে যোগাযোগ:</span>
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <a href="tel:01317926888" className="hover:text-[#0284C7] font-mono">হামিদুর রহমান: 01317-926888</a>
                <span>·</span>
                <a href="tel:01726886578" className="hover:text-[#0284C7] font-mono">কাওছার আহমদ: 01726-886578</a>
                <span>·</span>
                <a
                  href="https://web.facebook.com/profile.php?id=100015332053937"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0284C7] hover:underline flex items-center gap-0.5"
                >
                  <span>ফেসবুক আইডি</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Form Inputs for Cash Out Sender & TrxID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                যে নাম্বার থেকে ক্যাশ আউট করা হয়েছে <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={paymentSenderMobile}
                onChange={e => setPaymentSenderMobile(e.target.value)}
                className={`w-full px-3.5 py-2.5 border text-xs sm:text-sm font-mono bg-white focus:border-[#0284C7] ${
                  stepErrors.paymentSenderMobile ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              <span className="text-3xs text-slate-400 block mt-0.5">আপনার বা বিকাশ এজেন্টের ১১ সংখ্যার ব্যক্তিগত/প্রেরক নম্বর লিখুন।</span>
              {stepErrors.paymentSenderMobile && <p className="text-3xs text-red-600 mt-1">{stepErrors.paymentSenderMobile}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#072C4C] mb-1">
                বিকাশ ট্রানজ্যাকশন আইডি (TrxID) <span className="text-slate-400 font-normal text-3xs">(ঐচ্ছিক — না থাকলে খালি রাখুন)</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: BKX889922A (জানা থাকলে লিখুন)"
                value={trxIdInput}
                onChange={e => setTrxIdInput(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm uppercase font-mono bg-white focus:border-[#0284C7]"
              />
              <span className="text-3xs text-slate-400 block mt-0.5">ট্রানজ্যাকশন আইডি জানা থাকলে লিখুন, না দিলেও কোনো সমস্যা নেই। ক্যাশ আউট নম্বর মিলিয়ে অ্যাডমিন অনুমোদন করবে।</span>
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="declarationCheck"
                checked={declarationAccepted}
                onChange={e => setDeclarationAccepted(e.target.checked)}
                className="mt-0.5 text-[#0284C7] focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="declarationCheck" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                <strong>সত্যতার অঙ্গীকার:</strong> আমি অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য ও নির্ভুল। ভুল বা অসঙ্গতিপূর্ণ তথ্য প্রমাণিত হলে সংশ্লিষ্ট আবেদন বাতিল বলে গণ্য হবে।
              </label>
            </div>
            {stepErrors.declarationAccepted && <p className="text-3xs text-red-600 sm:col-span-2">{stepErrors.declarationAccepted}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ: ঠিকানা ও সারসংক্ষেপ</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
              className="px-7 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>আবেদন জমা ও ফায়ারবেস সিঙ্ক হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>
                    {candidates.length > 1
                      ? `মোট ${convertToBengaliNumber(candidates.length)} জনের আবেদন দাখিল করুন`
                      : 'আবেদন দাখিল সম্পন্ন করুন'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 5: SUCCESSFUL SUBMISSION — PENDING ADMIN APPROVAL FOR RECEIPT
         =================================================================== */}
      {currentStep === 5 && submittedApplicants.length > 0 && (
        <div className="bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          {/* Top Green Confirmation Banner */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bn text-[#072C4C]">
              আবেদন ও পেমেন্ট তথ্য সফলভাবে দাখিল হয়েছে!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা ২০২৬-এর জন্য {finalSchoolName} থেকে মোট {convertToBengaliNumber(submittedApplicants.length)} জন পরীক্ষার্থীর আবেদন এবং বিকাশ ক্যাশ আউট তথ্য ডাটাবেজে সংরক্ষিত হয়েছে।
            </p>
          </div>

          {/* Quick Identification Details for all applicants */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#072C4C]">
              দাখিলকৃত পরীক্ষার্থীদের তালিকা:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {submittedApplicants.map((app, i) => (
                <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.photoUrl}
                      alt={app.nameBn}
                      className="w-10 h-12 object-cover border border-slate-300 rounded shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#072C4C]">{app.nameBn}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-2xs text-slate-600 font-mono">
                        <span>আবেদন: <strong>{app.applicationNo}</strong></span>
                      </div>
                      <p className="text-3xs text-slate-500">পিতা: {app.fatherName}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-3xs font-bold rounded shrink-0">
                    ⏳ যাচাইাধীন
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Money Receipt Notice (NOT available right after; waiting for admin manual approval) */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/70 border-2 border-amber-300 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#072C4C]">
                    মানি রসিদ (Money Receipt) সংক্রান্ত নোটিশ
                  </h3>
                  <p className="text-2xs text-slate-500">
                    অ্যাডমিন প্যানেল থেকে বিকাশ ক্যাশ আউট স্টেটমেন্ট মিলিয়ে ম্যানুয়ালি অনুমোদন করা হবে।
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-2xs font-bold self-start border border-amber-300">
                ⏳ পেমেন্ট স্ট্যাটাস: অপেক্ষমাণ (Pending)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-lg border border-amber-200 text-xs">
              <div>
                <span className="text-slate-500 block text-3xs uppercase">শিক্ষাপ্রতিষ্ঠান</span>
                <strong className="text-[#072C4C] text-xs truncate block">{finalSchoolName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-3xs uppercase">ক্যাশ আউট প্রেরক নম্বর</span>
                <strong className="font-mono text-[#072C4C] text-xs font-bold">{paymentSenderMobile}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-3xs uppercase">বিকাশ TrxID</span>
                <strong className="font-mono text-[#0284C7] text-xs">{trxIdInput.trim() || 'প্রদান করা হয়নি'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-3xs uppercase">মোট জমাকৃত ফি</span>
                <strong className="font-mono text-amber-700 text-sm font-bold">৳{convertToBengaliNumber(totalPayableFee)}</strong>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-2xs text-amber-900 leading-relaxed">
              <strong>📌 গুরুত্বপূর্ণ তথ্য:</strong> সংস্থার দায়িত্বপ্রাপ্ত কর্মকর্তা অ্যাডমিন ড্যাশবোর্ড থেকে আপনার জমাকৃত ক্যাশ আউট নম্বরটি মিলিয়ে <strong>ম্যানুয়ালি অনুমোদন (Approve)</strong> প্রদান করার সাথে সাথে ওয়েবসাইটের <strong>'মানি রসিদ' (Money Receipt)</strong> সেকশনে স্বয়ংক্রিয়ভাবে ডাউনলোড ও প্রিন্টের জন্য অফিসিয়াল রসিদ উন্মুক্ত হয়ে যাবে।
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (submittedApplicants.length > 0) {
                    onApplicationSuccess(submittedApplicants[0]);
                  }
                  setActiveTab('receipt');
                }}
                className="w-full sm:w-auto flex-1 px-6 py-2.5 bg-[#07243B] hover:bg-[#0369A1] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] rounded-lg"
              >
                <CreditCard className="w-4 h-4 text-sky-300" />
                <span>মানি রসিদ সেকশনে স্ট্যাটাস চেক করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setParticipatingCount(1);
                  setCandidates([createCandidate(0)]);
                  setPaymentSenderMobile('');
                  setTrxIdInput('');
                  setSubmittedApplicants([]);
                  setCompletedReceipt(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer rounded-lg shadow-2xs"
              >
                নতুন আবেদন করুন
              </button>
            </div>
          </div>

          {/* Admit Card Schedule Notice */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0284C7] text-white flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#072C4C] font-serif-bn">
                  📅 প্রবেশপত্র সংগ্রহের সময়সূচি ও রোল নম্বর
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  পেমেন্ট অনুমোদনের পর পরীক্ষার প্রবেশপত্রটি আগামী <strong>{formatLangDateTime(rawAvailableDate, lang)}</strong> তারিখে স্বয়ংক্রিয়ভাবে উন্মুক্ত হবে।
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-3.5 border border-amber-200/80 text-2xs text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-800">
                📌 প্রবেশপত্র যেভাবে ডাউনলোড করবেন:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                <li>নির্ধারিত সময় থেকে ওয়েবসাইটের উপরের <strong>'প্রবেশপত্র'</strong> মেনুতে প্রবেশ করুন।</li>
                <li>শিক্ষার্থীর আবেদন নম্বর অথবা মোবাইল নম্বর লিখে সার্চ করে প্রবেশপত্র ডাউনলোড করুন।</li>
                <li>পরীক্ষার দিন প্রতিটি পরীক্ষার্থীর রঙিন প্রবেশপত্র সাথে আনা বাধ্যতামূলক।</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('admit')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>প্রবেশপত্র পেজে যান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setParticipatingCount(1);
                  setCandidates([createCandidate(0)]);
                  setPaymentSenderMobile('');
                  setTrxIdInput('');
                  setSubmittedApplicants([]);
                  setCompletedReceipt(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                নতুন আবেদন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
