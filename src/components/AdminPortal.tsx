import React, { useState, useEffect } from 'react';
import { Applicant, ApplicantStatus, ExamSettings, Notice, AuditLog } from '../types';
import { storage } from '../services/storage';
import { convertToBengaliNumber } from '../utils/validation';
import { BANGLADESH_LOCATIONS, DEFAULT_CLASSES } from '../data/locations';
import { 
  Shield, 
  ShieldCheck,
  Lock, 
  LogOut, 
  Users, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Award, 
  Search, 
  Settings, 
  Bell, 
  History, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  AlertCircle,
  X,
  FileSpreadsheet,
  Eye,
  Database,
  Copy,
  RefreshCw,
  Check,
  ExternalLink,
  UploadCloud,
  Code2,
  Server,
  UserCheck,
  Building2,
  GraduationCap,
  Camera,
  Palette
} from 'lucide-react';
import { Logo } from './Logo';
import { CampaignsManager } from './admin/CampaignsManager';
import { CommitteeManager } from './admin/CommitteeManager';
import { SchoolsManager } from './admin/SchoolsManager';
import { RollsManager } from './admin/RollsManager';
import { SecurityManager } from './admin/SecurityManager';
import { GalleryManager } from './admin/GalleryManager';
import { AdmitCardEditor } from './admin/AdmitCardEditor';
import { DatabaseManager } from './admin/DatabaseManager';
import { WebsiteEditor } from './admin/WebsiteEditor';
import { AttendanceSheets } from './admin/AttendanceSheets';
import { PaymentApprovalsManager } from './admin/PaymentApprovalsManager';
import { ActiveTab } from './Navbar';
import { SupportedLang } from '../utils/i18n';

export type AdminTab = 
  | 'applicants' 
  | 'payment_approvals'
  | 'attendance_sheets'
  | 'website_editor'
  | 'campaigns' 
  | 'admit_editor'
  | 'committee' 
  | 'gallery'
  | 'schools' 
  | 'rolls' 
  | 'notices' 
  | 'settings' 
  | 'security'
  | 'database';

interface AdminPortalProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  settings: ExamSettings;
  onUpdateSettings: (settings: ExamSettings) => void;
  setActiveTab?: (tab: ActiveTab) => void;
  lang?: SupportedLang;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  settings,
  onUpdateSettings,
  setActiveTab,
  lang = 'bn',
}) => {
  // Login State
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [setupError, setSetupError] = useState('');
  // Admin active sub-view
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('applicants');

  // Applicants filter and search
  const [applicants, setApplicants] = useState<Applicant[]>(storage.getApplicants());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');



  // Detail Modal
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicantStatus>('approved');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Notice form
  const [notices, setNotices] = useState<Notice[]>(storage.getNotices());
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'জরুরি' | 'সাধারণ' | 'ফলাফল' | 'সিলেবাস'>('সাধারণ');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePinned, setNoticePinned] = useState(false);

  // Settings form
  const [localSettings, setLocalSettings] = useState<ExamSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storage.getAuditLogs());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setApplicants(storage.getApplicants());
      setNotices(storage.getNotices());
      setAuditLogs(storage.getAuditLogs());
    });
    return unsub;
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!pinInput.trim()) {
      setLoginError('অনুগ্রহ করে প্রশাসনিক পাসওয়ার্ড লিখুন।');
      return;
    }

    const authResult = storage.validateAdminLogin(pinInput.trim());
    if (authResult.success) {
      if (authResult.isFirstTime) {
        setShowBootstrapModal(true);
      } else {
        setIsAdminLoggedIn(true);
        setPinInput('');
      }
    } else {
      setLoginError(authResult.error || 'ভুল পিন বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক প্রশাসনিক ক্রেডেনশিয়াল দিন।');
    }
  };

  const handleCompleteBootstrap = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (newAdminPassword.length < 6) {
      setSetupError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setSetupError('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি!');
      return;
    }
    storage.completeBootstrapSetup(newAdminPassword);
    setShowBootstrapModal(false);
    setIsAdminLoggedIn(true);
    setPinInput('');
  };


  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    storage.addAuditLog('প্রশাসনিক লগআউট', 'SYSTEM', 'প্রশাসক প্রস্থান করেছেন');
  };

  // Status Update Action
  const handleUpdateApplicantStatus = (id: string) => {
    if (!selectedApplicant) return;
    storage.updateApplicantStatus(id, newStatus, adminNoteInput, 'প্রধান প্রশাসক');
    const updated = storage.getApplicantByNo(selectedApplicant.applicationNo);
    setSelectedApplicant(updated || null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = storage.exportApplicantsCSV(filteredApplicants);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alikhwan_applicants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSettings(localSettings);
    // Keep featured campaign in sync
    const featCamp = storage.getFeaturedCampaign();
    if (featCamp) {
      if (localSettings.admitCardAvailableDate) {
        featCamp.admitCardAvailableDate = localSettings.admitCardAvailableDate;
      }
      featCamp.examDate = localSettings.examDate;
      featCamp.examTime = localSettings.examTime;
      featCamp.feeAmount = localSettings.feeAmount;
      featCamp.isFeeRequired = localSettings.isFeeRequired;
      storage.saveCampaign(featCamp);
    }
    onUpdateSettings(localSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Notice save
  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    const notice: Notice = {
      id: editingNotice ? editingNotice.id : `notice-${Date.now()}`,
      title: noticeTitle,
      category: noticeCategory,
      date: new Date().toISOString().split('T')[0],
      content: noticeContent,
      isPinned: noticePinned,
    };

    storage.saveNotice(notice);
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticePinned(false);
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) {
      storage.deleteNotice(id);
    }
  };



  // Unique districts and schools for dynamic dropdown filtering (Requirement 7)
  const uniqueDistricts = Array.from(new Set(applicants.map(a => a.district).filter(Boolean)));
  const uniqueSchools = Array.from(new Set(applicants.map(a => a.schoolName).filter(Boolean)));

  // Filtering
  const filteredApplicants = applicants.filter(a => {
    const matchesSearch = !searchQuery.trim() ||
      a.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mobile.includes(searchQuery) ||
      (a.rollNumber && a.rollNumber.includes(searchQuery)) ||
      a.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesClass = classFilter === 'all' || a.className === classFilter;
    const matchesPayment = paymentFilter === 'all' || a.paymentStatus === paymentFilter;
    const matchesDistrict = districtFilter === 'all' || a.district === districtFilter;
    const matchesSchool = schoolFilter === 'all' || a.schoolName === schoolFilter;

    return matchesSearch && matchesStatus && matchesClass && matchesPayment && matchesDistrict && matchesSchool;
  });

  // Real Dashboard Stats from Database/State
  const totalApplicants = applicants.length;
  const approvedApplicants = applicants.filter(a => a.status === 'approved').length;
  const pendingApplicants = applicants.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const paidApplicants = applicants.filter(a => a.paymentStatus === 'paid').length;
  const pendingPaymentsCount = applicants.filter(a => a.paymentStatus === 'pending').length;
  const admitsIssued = applicants.filter(a => a.admitCardIssued).length;

  // LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-[#D2E3ED] p-6 sm:p-8 shadow-xs space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-14 h-16 drop-shadow-sm flex items-center justify-center">
              <Logo className="w-14 h-16" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-2xs uppercase tracking-wider text-[#00A3E0] font-bold block">
              আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা
            </span>
            <h1 className="text-xl font-bold font-serif-bn text-[#082942]">
              প্রশাসনিক নিয়ন্ত্রণকক্ষে প্রবেশ
            </h1>
            <p className="text-xs text-[#516A7E]">
              দায়িত্বপ্রাপ্ত পরীক্ষা নিয়ন্ত্রক ও কর্মকর্তাদের প্রবেশাধিকার
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#082942] mb-1">
                প্রশাসনিক সিকিউরিটি পিন / পাসওয়ার্ড
              </label>
              <input
                type="password"
                placeholder="সিকিউরিটি পিন বা পাসওয়ার্ড লিখুন"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D2E3ED] text-xs sm:text-sm bg-white focus:border-[#00A3E0]"
              />
            </div>

            {loginError && (
              <p className="text-[#E52320] text-xs bg-[#FEF2F2] p-2.5 rounded-lg border border-[#FCA5A5] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#E52320]" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs"
            >
              প্রবেশ করুন
            </button>
          </form>

          {/* Official Security Notice — No default credentials leaked */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-2xs text-slate-600 text-left flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              এই প্যানেলটি শুধুমাত্র আল-ইখওয়ান সমাজকল্যাণ সংস্থার অনুমোদিত পরীক্ষা নিয়ন্ত্রক ও পরিচালনা পর্ষদের জন্য সংরক্ষিত। পাসওয়ার্ড শুধুমাত্র ড্যাশবোর্ডে প্রবেশের পর সিকিউরিটি ট্যাব থেকে পরিবর্তন করা যাবে।
            </p>
          </div>
        </div>

        {/* First-Time Bootstrap Setup Modal (Section 9) */}
        {showBootstrapModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200">
              <div className="text-center space-y-1.5 pb-2 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-serif-bn text-[#072C4C]">
                  প্রথমবার লগইন — নিরাপত্তা সেটআপ
                </h3>
                <p className="text-xs text-slate-500">
                  নিরাপত্তার স্বার্থে প্রাথমিক পাসওয়ার্ড অকার্যকর করে আপনার নিজস্ব ব্যক্তিগত পাসওয়ার্ড নির্ধারণ করুন।
                </p>
              </div>

              {setupError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              <form onSubmit={handleCompleteBootstrap} className="space-y-3 text-xs text-left">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    নতুন ব্যক্তিগত পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={e => setNewAdminPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmAdminPassword}
                    onChange={e => setConfirmAdminPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBootstrapModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    সেটআপ সম্পন্ন করে ড্যাশবোর্ডে প্রবেশ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LOGGED-IN ADMIN DASHBOARD
  return (
    <div className="space-y-6">
      {/* Top Admin Action Bar */}
      <div className="bg-white border border-[#D2E3ED] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#00A3E0] text-xs font-bold mb-1">
            <Shield className="w-4 h-4 text-[#00A3E0]" />
            <span>প্রশাসনিক নিয়ন্ত্রণকক্ষ (Admin Console)</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-serif-bn text-[#082942]">
            বৃত্তি পরীক্ষা ২০২৬ — কেন্দ্রীয় পরিচালনা প্যানেল
          </h1>
          <p className="text-xs text-[#516A7E]">
            আবেদন যাচাই, প্রবেশপত্র অনুমোদন, নোটিশ প্রকাশ ও ডেটাবেস পর্যালোচনা
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('attendance_sheets')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
            title="মাদ্রাসা, কেজি ও প্রাথমিক বিদ্যালয়ের স্বাক্ষর শিট প্রিন্ট ও ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>স্বাক্ষর শিট (৩টি শাখা)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#082942] hover:bg-[#00A3E0] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#38BDF8]" />
            <span>Excel/CSV ডাউনলোড</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F0F7FB] text-[#516A7E] hover:text-[#082942] rounded-lg text-xs font-semibold border border-[#D2E3ED] transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Real Statistics from Database */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#D2E3ED] space-y-1 shadow-2xs">
          <span className="text-xs text-[#516A7E] font-medium block">মোট আবেদন</span>
          <span className="text-xl font-bold font-mono text-[#082942]">
            {convertToBengaliNumber(totalApplicants)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D2E3ED] space-y-1 shadow-2xs">
          <span className="text-xs text-[#516A7E] font-medium block">অনুমোদিত</span>
          <span className="text-xl font-bold font-mono text-[#00A3E0]">
            {convertToBengaliNumber(approvedApplicants)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D2E3ED] space-y-1 shadow-2xs">
          <span className="text-xs text-[#516A7E] font-medium block">যাচাইাধীন</span>
          <span className="text-xl font-bold font-mono text-[#F59E0B]">
            {convertToBengaliNumber(pendingApplicants)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D2E3ED] space-y-1 shadow-2xs">
          <span className="text-xs text-[#516A7E] font-medium block">ফি পরিশোধিত</span>
          <span className="text-xl font-bold font-mono text-[#00A3E0]">
            {convertToBengaliNumber(paidApplicants)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D2E3ED] space-y-1 col-span-2 sm:col-span-1 shadow-2xs">
          <span className="text-xs text-[#516A7E] font-medium block">প্রবেশপত্র প্রস্তুত</span>
          <span className="text-xl font-bold font-mono text-[#082942]">
            {convertToBengaliNumber(admitsIssued)}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap border-b border-[#D2E3ED] gap-1 text-xs font-bold bg-white/70 p-1.5 rounded-t-xl">
        <button
          onClick={() => setActiveAdminTab('applicants')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'applicants'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Applicants' : 'আবেদন তালিকা'} ({convertToBengaliNumber(filteredApplicants.length)})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('payment_approvals')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'payment_approvals'
              ? 'border-amber-500 text-amber-700 bg-amber-50'
              : 'border-transparent text-amber-800 hover:text-amber-950 bg-amber-50/40'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold">পেমেন্ট অনুমোদন (Approvals)</span>
          {pendingPaymentsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-3xs font-bold animate-pulse">
              {convertToBengaliNumber(pendingPaymentsCount)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('attendance_sheets')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'attendance_sheets'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
              : 'border-transparent text-emerald-700 hover:text-emerald-900 bg-emerald-50/40'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-bold">স্বাক্ষর ও উপস্থিতি শিট (Attendance)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('campaigns')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'campaigns'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span>কর্মসূচি ও ক্যাম্পেইন</span>
        </button>


        <button
          onClick={() => setActiveAdminTab('admit_editor')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'admit_editor'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span>{lang === 'en' ? 'Admit Card Editor' : 'প্রবেশপত্র এডিটর ও ডিজাইন'}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('website_editor')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'website_editor'
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
              : 'border-transparent text-emerald-700 hover:text-emerald-900 bg-emerald-50/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-bold">ওয়েবসাইট এডিটর (Shopify Style)</span>
        </button>



        <button
          onClick={() => setActiveAdminTab('committee')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'committee'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>পরিচালনা পর্ষদ</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('gallery')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'gallery'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>গ্যালারি মিডিয়া</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('schools')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'schools'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>স্বীকৃত প্রতিষ্ঠান ও কোটা</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('rolls')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'rolls'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>রোল কনফিগারেশন</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'settings'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>পরীক্ষা সেটিংস</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('notices')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'notices'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>নোটিশ ব্যবস্থাপনা</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('security')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'security'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>নিরাপত্তা ও পাসওয়ার্ড</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('database')}
          className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer rounded-t-lg ${
            activeAdminTab === 'database'
              ? 'border-[#00A3E0] text-[#00A3E0] bg-[#00A3E0]/5'
              : 'border-transparent text-[#516A7E] hover:text-[#082942]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'en' ? 'Database & Cloud' : 'ক্লাউড ডেটাবেজ ও টেস্ট রিসেট'}</span>
        </button>
      </div>

      {/* SUB-VIEW 1: APPLICANTS TABLE & FILTERS */}
      {activeAdminTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filters Bar with District & School Dropdowns */}
          <div className="bg-white p-4 rounded-xl border border-[#D2E3ED] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#516A7E]" />
              <input
                type="text"
                placeholder="নাম, আবেদন নং বা রোল..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D2E3ED] text-xs bg-white focus:border-[#00A3E0]"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D2E3ED] text-xs bg-white focus:border-[#00A3E0]"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="submitted">যাচাইাধীন (Submitted)</option>
                <option value="approved">অনুমোদিত (Approved)</option>
                <option value="rejected">বাতিল (Rejected)</option>
              </select>
            </div>

            <div>
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D2E3ED] text-xs bg-white focus:border-[#00A3E0]"
              >
                <option value="all">সব শ্রেণি</option>
                {DEFAULT_CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* District Filter (Requirement 7) */}
            <div>
              <select
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D2E3ED] text-xs bg-white focus:border-[#00A3E0]"
              >
                <option value="all">সব জেলা</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* School Filter (Requirement 7) */}
            <div>
              <select
                value={schoolFilter}
                onChange={e => setSchoolFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D2E3ED] text-xs bg-white focus:border-[#00A3E0] truncate"
              >
                <option value="all">সব বিদ্যালয় / মাদ্রাসা</option>
                {uniqueSchools.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D2E3ED] text-xs bg-white focus:border-[#00A3E0]"
              >
                <option value="all">সব পেমেন্ট স্ট্যাটাস</option>
                <option value="paid">পরিশোধিত (Paid)</option>
                <option value="unpaid">বাকি (Unpaid)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#D2E3ED] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#082942] text-white font-bold border-b border-[#051A2C]">
                    <th className="py-3 px-3.5">আবেদন নং</th>
                    <th className="py-3 px-3.5">শিক্ষার্থীর নাম</th>
                    <th className="py-3 px-3.5">শ্রেণি ও বিদ্যালয়</th>
                    <th className="py-3 px-3.5">মোবাইল</th>
                    <th className="py-3 px-3.5">অবস্থা</th>
                    <th className="py-3 px-3.5">পেমেন্ট</th>
                    <th className="py-3 px-3.5 text-center">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2E3ED] text-[#082942]">
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map(app => (
                      <tr key={app.id} className="hover:bg-[#F0F7FB] transition">
                        <td className="py-2.5 px-3.5 font-semibold text-[#082942]">
                          <div className="font-mono font-bold text-[#00A3E0]">{app.applicationNo}</div>
                          {app.rollNumber && (
                            <span className="text-2xs text-[#516A7E] block">
                              রোল: <span className="font-mono font-bold text-[#082942]">{app.rollNumber}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-[#082942]">{app.nameBn}</div>
                          <div className="text-2xs text-[#516A7E] font-mono">{app.nameEn}</div>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-[#082942]">{app.className}</div>
                          <div className="text-2xs text-[#516A7E] line-clamp-1">{app.schoolName}</div>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-[#082942]">{app.mobile}</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                            app.status === 'approved'
                              ? 'bg-[#E0F2FE] text-[#00A3E0] border border-[#BAE6FD]'
                              : app.status === 'rejected'
                              ? 'bg-[#FEF2F2] text-[#E52320] border border-[#FCA5A5]'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {app.status === 'approved' ? 'অনুমোদিত' : app.status === 'rejected' ? 'বাতিল' : 'যাচাইাধীন'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className={`text-2xs font-bold px-2 py-0.5 rounded ${app.paymentStatus === 'paid' ? 'bg-[#E0F2FE] text-[#00A3E0]' : 'bg-slate-100 text-[#516A7E]'}`}>
                            {app.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <button
                            onClick={() => {
                              setSelectedApplicant(app);
                              setNewStatus(app.status);
                              setAdminNoteInput(app.adminNotes || '');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#F0F7FB] text-[#00A3E0] border border-[#D2E3ED] rounded-lg text-2xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-[#00A3E0]" />
                            <span>বিস্তারিত</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#516A7E] text-xs">
                        কোনো আবেদন পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPLICANT DETAIL MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-[#041B2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#D2E3ED]">
            <div className="flex justify-between items-start border-b border-[#D2E3ED] pb-3">
              <div>
                <span className="text-2xs font-mono text-[#516A7E] uppercase">আবেদন বিস্তারিত</span>
                <h2 className="text-base font-bold text-[#082942] font-mono">
                  {selectedApplicant.applicationNo}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1 rounded-lg text-[#516A7E] hover:text-[#082942] hover:bg-[#F0F7FB] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-[#F4F7F5] p-4 rounded-xl border border-[#DDE5E0]">
              <img
                src={selectedApplicant.photoUrl}
                alt="শিক্ষার্থী"
                className="w-20 h-20 object-cover rounded-lg border-2 border-[#073B2C]"
              />
              <div className="space-y-1 text-center sm:text-left text-xs">
                <h3 className="font-bold text-base text-[#11231C] font-serif-bn">{selectedApplicant.nameBn}</h3>
                <p className="font-mono text-xs text-[#566961]">{selectedApplicant.nameEn}</p>
                <p className="font-bold text-[#073B2C]">{selectedApplicant.className} | শ্রেণি রোল: {selectedApplicant.rollNo}</p>
                <p className="text-[#566961]">{selectedApplicant.schoolName}</p>
                <div className="pt-1">
                  <span className="text-2xs font-semibold text-[#566961]">স্বাক্ষর:</span>
                  <img src={selectedApplicant.signatureUrl} alt="স্বাক্ষর" className="h-6 inline-block ml-2 border border-[#DDE5E0] bg-white p-0.5 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs text-[#11231C] bg-white p-3.5 border border-[#DDE5E0] rounded-xl">
              <div><span className="text-[#566961]">পিতার নাম:</span> <strong>{selectedApplicant.fatherName}</strong></div>
              <div><span className="text-[#566961]">মাতার নাম:</span> <strong>{selectedApplicant.motherName}</strong></div>
              <div><span className="text-[#566961]">মোবাইল:</span> <span className="font-mono text-[#073B2C] font-bold">{selectedApplicant.mobile}</span></div>
              <div><span className="text-[#566961]">জন্মতারিখ:</span> <span>{selectedApplicant.dob}</span></div>
              <div><span className="text-[#566961]">ঠিকানা:</span> <span>{selectedApplicant.presentAddress}</span></div>
              <div><span className="text-[#566961]">উপজেলা ও জেলা:</span> <span>{selectedApplicant.upazila}, {selectedApplicant.district}</span></div>
              <div><span className="text-[#566961]">আবেদনের তারিখ:</span> <span>{new Date(selectedApplicant.createdAt).toLocaleDateString('bn-BD')}</span></div>
              <div><span className="text-[#566961]">ফি-র অবস্থা:</span> <strong className="text-[#073B2C]">{selectedApplicant.paymentStatus === 'paid' ? 'পরিশোধিত' : selectedApplicant.paymentStatus === 'waived' ? 'মওকুফ' : 'অপরিশোধিত'}</strong></div>
            </div>

            {/* Payment & Admit Card Actions */}
            <div className="bg-[#F4F7F5] p-3.5 rounded-xl border border-[#DDE5E0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#566961] font-semibold">পেমেন্ট স্ট্যাটাস:</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextPay = selectedApplicant.paymentStatus === 'paid' ? 'unpaid' : 'paid';
                    storage.updateApplicantPayment(selectedApplicant.id, nextPay, 'প্রধান প্রশাসক');
                    const updated = storage.getApplicantByNo(selectedApplicant.applicationNo);
                    setSelectedApplicant(updated || null);
                  }}
                  className={`px-3 py-1 rounded-lg text-2xs font-bold border transition cursor-pointer ${
                    selectedApplicant.paymentStatus === 'paid'
                      ? 'bg-white text-[#073B2C] border-[#073B2C]/30 hover:bg-[#E6F4EF]'
                      : 'bg-[#073B2C] hover:bg-[#059669] text-white border-[#073B2C]'
                  }`}
                >
                  {selectedApplicant.paymentStatus === 'paid' ? 'চিহ্নিত: পরিশোধিত (ক্লিক করে বাতিল)' : 'পরিশোধিত হিসেবে চিহ্নিত করুন'}
                </button>
              </div>

              {!selectedApplicant.admitCardIssued && (
                <button
                  type="button"
                  onClick={() => {
                    storage.issueAdmitCard(selectedApplicant.id, 'প্রধান প্রশাসক');
                    const updated = storage.getApplicantByNo(selectedApplicant.applicationNo);
                    setSelectedApplicant(updated || null);
                  }}
                  className="px-3.5 py-1.5 bg-[#073B2C] hover:bg-[#059669] text-white rounded-lg text-2xs font-bold cursor-pointer transition shadow-xs"
                >
                  সরাসরি প্রবেশপত্র মঞ্জুর করুন
                </button>
              )}
            </div>

            {/* Action Box to Approve / Reject */}
            <div className="bg-white p-4 rounded-xl border border-[#DDE5E0] space-y-3">
              <h4 className="font-bold text-xs text-[#11231C]">প্রশাসনিক সিদ্ধান্ত ও স্ট্যাটাস পরিবর্তন:</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatus('approved')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    newStatus === 'approved' ? 'bg-[#073B2C] text-white border-[#073B2C] shadow-xs' : 'bg-[#F4F7F5] text-[#11231C] border-[#DDE5E0]'
                  }`}
                >
                  অনুমোদন (Approve)
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('under_review')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    newStatus === 'under_review' ? 'bg-[#C5A059] text-white border-[#C5A059] shadow-xs' : 'bg-[#F4F7F5] text-[#11231C] border-[#DDE5E0]'
                  }`}
                >
                  যাচাইাধীন (Review)
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('rejected')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    newStatus === 'rejected' ? 'bg-red-700 text-white border-red-700 shadow-xs' : 'bg-[#F4F7F5] text-[#11231C] border-[#DDE5E0]'
                  }`}
                >
                  বাতিল (Reject)
                </button>
              </div>

              <div>
                <label className="block text-2xs font-bold text-[#11231C] mb-1">
                  প্রশাসনিক মন্তব্য / পর্যালোচনার কারণ:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সকল তথ্য ও ছবি সঠিক পাওয়া গেছে।"
                  value={adminNoteInput}
                  onChange={e => setAdminNoteInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#DDE5E0] text-xs bg-white focus:border-[#073B2C]"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`আপনি কি নিশ্চিত যে আবেদনকারী ${selectedApplicant.nameBn} (${selectedApplicant.applicationNo}) এর আবেদনটি স্থায়ীভাবে মুছে ফেলতে চান?`)) {
                      storage.deleteApplicant(selectedApplicant.applicationNo);
                      setSelectedApplicant(null);
                      setApplicants(storage.getApplicants());
                    }
                  }}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg border border-red-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>আবেদন মুছে ফেলুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateApplicantStatus(selectedApplicant.id)}
                  className="px-6 py-2 bg-[#00A3E0] hover:bg-[#0284C7] text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
                >
                  সিদ্ধান্ত কার্যকর করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: SETTINGS */}
      {activeAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-[#DDE5E0] shadow-xs space-y-5 max-w-3xl">
          <div className="flex justify-between items-center border-b border-[#DDE5E0] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#11231C] font-serif-bn">
                পরীক্ষা ও আবেদন কনফিগারেশন
              </h2>
              <p className="text-xs text-[#566961]">
                আবেদনের সময়সূচি, ফি ও কেন্দ্রসমূহ নিয়ন্ত্রণ করুন
              </p>
            </div>
            {settingsSaved && (
              <span className="text-xs font-bold text-[#073B2C] bg-[#E6F4EF] px-3 py-1 rounded-full border border-[#059669]/30">
                ✓ সেটিংস সংরক্ষিত হয়েছে
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Toggle application open/close */}
            <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-[#F4F7F5] rounded-xl border border-[#DDE5E0]">
              <div>
                <strong className="block text-[#11231C]">অনলাইন আবেদন গ্রহণ চালু রাখুন</strong>
                <span className="text-[#566961]">বন্ধ করলে ওয়েবসাইটে আবেদন ফর্ম পূরণ করা যাবে না।</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.isApplicationOpen}
                onChange={e => setLocalSettings({ ...localSettings, isApplicationOpen: e.target.checked })}
                className="w-4 h-4 text-[#073B2C] rounded border-[#DDE5E0] cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">আবেদন শুরুর তারিখ</label>
              <input
                type="date"
                value={localSettings.startDate}
                onChange={e => setLocalSettings({ ...localSettings, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">আবেদন শেষের তারিখ</label>
              <input
                type="date"
                value={localSettings.endDate}
                onChange={e => setLocalSettings({ ...localSettings, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">পরীক্ষার নির্ধারিত তারিখ</label>
              <input
                type="date"
                value={localSettings.examDate}
                onChange={e => setLocalSettings({ ...localSettings, examDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">পরীক্ষার সময়</label>
              <input
                type="text"
                value={localSettings.examTime}
                onChange={e => setLocalSettings({ ...localSettings, examTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">
                প্রবেশপত্র ডাউনলোডের তারিখ ও সময় (Admit Card Download Date)
              </label>
              <input
                type="datetime-local"
                value={localSettings.admitCardAvailableDate || ''}
                onChange={e => setLocalSettings({ ...localSettings, admitCardAvailableDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C] font-mono text-xs"
              />
              <span className="text-3xs text-[#566961] block mt-1">
                নির্ধারিত তারিখে প্রবেশপত্র ডাউনলোডের লক স্বয়ংক্রিয়ভাবে খুলে যাবে।
              </span>
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">পরীক্ষার ফি আবশ্যক?</label>
              <select
                value={localSettings.isFeeRequired ? 'true' : 'false'}
                onChange={e => setLocalSettings({ ...localSettings, isFeeRequired: e.target.value === 'true' })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              >
                <option value="true">হ্যাঁ, ফি প্রযোজ্য</option>
                <option value="false">না, সম্পূর্ণ ফ্রি (মওকুফ)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#11231C] mb-1">ফি-র পরিমাণ (টাকা)</label>
              <input
                type="number"
                value={localSettings.feeAmount}
                onChange={e => setLocalSettings({ ...localSettings, feeAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#11231C] mb-1">প্রধান পরীক্ষাকেন্দ্রের নাম</label>
              <input
                type="text"
                value={localSettings.examCenters[0] || ''}
                onChange={e => setLocalSettings({ ...localSettings, examCenters: [e.target.value] })}
                className="w-full px-3 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#DDE5E0]">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#073B2C] hover:bg-[#059669] text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs"
            >
              সেটিংস আপডেট সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* SUB-VIEW 3: NOTICES MANAGEMENT */}
      {activeAdminTab === 'notices' && (
        <div className="space-y-5 max-w-4xl">
          <form onSubmit={handleSaveNotice} className="bg-white p-5 rounded-xl border border-[#DDE5E0] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#11231C] font-serif-bn border-b border-[#DDE5E0] pb-2">
              {editingNotice ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ প্রকাশ করুন'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#11231C] mb-1">নোটিশের শিরোনাম</label>
                <input
                  type="text"
                  placeholder="যেমন: প্রবেশপত্র ডাউনলোড সংক্রান্ত বিজ্ঞপ্তি"
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#11231C] mb-1">ক্যাটাগরি</label>
                <select
                  value={noticeCategory}
                  onChange={e => setNoticeCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
                >
                  <option value="জরুরি">জরুরি</option>
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="সিলেবাস">সিলেবাস</option>
                  <option value="ফলাফল">ফলাফল</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-[#11231C] mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={3}
                  placeholder="নোটিশের বিস্তারিত বক্তব্য লিখুন..."
                  value={noticeContent}
                  onChange={e => setNoticeContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#DDE5E0] bg-white focus:border-[#073B2C]"
                  required
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noticePinned"
                  checked={noticePinned}
                  onChange={e => setNoticePinned(e.target.checked)}
                  className="w-4 h-4 text-[#073B2C] rounded border-[#DDE5E0] cursor-pointer"
                />
                <label htmlFor="noticePinned" className="text-xs font-semibold text-[#11231C] cursor-pointer">
                  প্রধান নোটিশ হিসেবে পিন (Pin to Top) করে রাখুন
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DDE5E0]">
              {editingNotice && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNotice(null);
                    setNoticeTitle('');
                    setNoticeContent('');
                  }}
                  className="px-4 py-2 border border-[#DDE5E0] rounded-lg text-xs font-semibold text-[#566961] hover:bg-[#F4F7F5]"
                >
                  বাতিল
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-[#073B2C] hover:bg-[#059669] text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {editingNotice ? 'আপডেট সংরক্ষণ' : 'নোটিশ প্রকাশ করুন'}
              </button>
            </div>
          </form>

          {/* List of existing notices */}
          <div className="bg-white rounded-xl border border-[#DDE5E0] overflow-hidden divide-y divide-[#DDE5E0] shadow-xs">
            {notices.map(n => (
              <div key={n.id} className="p-4 flex justify-between items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2.5 py-0.5 rounded-full bg-[#E6F4EF] text-[#073B2C] border border-[#059669]/30 text-2xs">
                      {n.category}
                    </span>
                    <span className="text-2xs text-[#566961]">{convertToBengaliNumber(n.date)}</span>
                    {n.isPinned && <span className="text-2xs font-bold text-[#8F6E32] bg-[#FBF7EE] px-2 py-0.5 rounded border border-[#D4AF37]/30">📌 পিন করা</span>}
                  </div>
                  <h4 className="font-bold text-[#11231C] text-sm">{n.title}</h4>
                  <p className="text-[#566961] line-clamp-1">{n.content}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingNotice(n);
                      setNoticeTitle(n.title);
                      setNoticeCategory(n.category);
                      setNoticeContent(n.content);
                      setNoticePinned(n.isPinned);
                    }}
                    className="p-1.5 rounded-lg text-[#566961] hover:bg-[#F4F7F5] transition"
                    title="সম্পাদনা"
                  >
                    <Edit3 className="w-4 h-4 text-[#073B2C]" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* SUB-VIEW: PAYMENT APPROVALS MANAGER */}
      {activeAdminTab === 'payment_approvals' && (
        <PaymentApprovalsManager settings={localSettings} lang={lang} />
      )}

      {/* SUB-VIEW 6: CAMPAIGNS MANAGER */}
      {activeAdminTab === 'campaigns' && (
        <CampaignsManager />
      )}

      {/* SUB-VIEW 7: COMMITTEE MANAGER */}
      {activeAdminTab === 'committee' && (
        <CommitteeManager />
      )}

      {/* SUB-VIEW 7.1: GALLERY MANAGER */}
      {activeAdminTab === 'gallery' && (
        <GalleryManager />
      )}

      {/* SUB-VIEW 8: SCHOOLS MANAGER */}
      {activeAdminTab === 'schools' && (
        <SchoolsManager />
      )}

      {/* SUB-VIEW 9: ROLLS MANAGER */}
      {activeAdminTab === 'rolls' && (
        <RollsManager />
      )}

      {/* SUB-VIEW 10: SECURITY MANAGER */}
      {activeAdminTab === 'security' && (
        <SecurityManager />
      )}




      {/* SUB-VIEW 14: ADMIT CARD VISUAL EDITOR */}
      {activeAdminTab === 'admit_editor' && (
        <AdmitCardEditor settings={localSettings} lang={lang} />
      )}

      {/* SUB-VIEW: SHOPIFY-STYLE WEBSITE CONTENT & COLOR EDITOR */}
      {activeAdminTab === 'website_editor' && (
        <WebsiteEditor />
      )}

      {/* SUB-VIEW: CATEGORY-WISE ATTENDANCE & SIGNATURE SHEETS */}
      {activeAdminTab === 'attendance_sheets' && (
        <AttendanceSheets 
          settings={localSettings} 
          applicants={applicants} 
          lang={lang} 
        />
      )}

      {/* SUB-VIEW 15: DATABASE & CLOUD ACCESS */}
      {activeAdminTab === 'database' && (
        <DatabaseManager 
          lang={lang} 
          onDataReset={() => setApplicants(storage.getApplicants())} 
        />
      )}
    </div>
  );
};
