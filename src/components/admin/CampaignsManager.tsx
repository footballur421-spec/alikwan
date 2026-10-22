import React, { useState, useEffect, useRef } from 'react';
import { Campaign, CampaignStatus, CampaignDocument } from '../../types';
import { storage } from '../../services/storage';
import { calculateCampaignStatus, convertToBengaliNumber } from '../../utils/validation';
import { 
  Award, 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X, 
  Star,
  FileText,
  Upload,
  Download,
  Check,
  Zap,
  Globe
} from 'lucide-react';

export const CampaignsManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storage.getCampaigns());
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New PDF upload state in modal
  const [newDocTitle, setNewDocTitle] = useState('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCampaigns(storage.getCampaigns());
    });
    return unsub;
  }, []);

  const refreshList = () => {
    setCampaigns(storage.getCampaigns());
  };

  const handleEdit = (camp: Campaign) => {
    setEditingCampaign({ 
      ...camp,
      rules: camp.rules || [],
      documents: camp.documents || [],
      examCenters: camp.examCenters || [],
      allowedClasses: camp.allowedClasses || [],
      allowedRegions: camp.allowedRegions || []
    });
    setIsCreating(false);
  };

  const applyTemplate = (type: 'exam' | 'relief' | 'education' | 'plantation' | 'general') => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newId = `camp-${Date.now()}`;

    if (type === 'exam') {
      const examCamp: Campaign = {
        id: newId,
        title: 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬',
        slug: `exam-${Date.now()}`,
        category: 'শিক্ষা ও বৃত্তি',
        campaignType: 'exam',
        shortDescription: 'পঞ্চম শ্রেণির মেধাবী শিক্ষার্থীদের মেধা বিকাশ ও উচ্চশিক্ষায় উদ্বুদ্ধকরণে বার্ষিক মেধা বৃত্তি পরীক্ষা।',
        fullDescription: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থার উদ্যোগে বার্ষিক প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা। নির্ধারিত অঞ্চলের প্রাথমিক বিদ্যালয়, কিন্ডারগার্টেন ও ইবতেদায়ী মাদ্রাসার ৫ম শ্রেণির নিয়মিত শিক্ষার্থীরা অংশগ্রহণ করতে পারবে।',
        displayStartDate: nowStr,
        displayEndDate: '2026-12-31',
        applicationStartDate: '2026-10-25',
        applicationEndDate: '2026-11-05',
        admitCardAvailableDate: '2026-11-06T09:00', // প্রবেশপত্র ডাউনলোডের উন্মুক্ত সময়
        examDate: '2026-11-14',
        examTime: 'সকাল ১০:০০ টা - দুপুর ১২:০০ টা',
        isFeeRequired: true,
        feeAmount: 100,
        isFeaturedOnHome: true,
        rules: [
          '১। একটি প্রতিষ্ঠান থেকে সর্বোচ্চ ০৭ জন ছাত্র-ছাত্রী প্রধান শিক্ষকের অনুমতিক্রমে অংশগ্রহণ করতে পারবে।',
          '২। পাসপোর্ট সাইজ ছবি ও শিক্ষার্থীর স্বাক্ষর আপলোড আবশ্যক।',
          '৩। নির্ধারিত তারিখ থেকে ওয়েবসাইট হতে রঙিন প্রবেশপত্র সংগ্রহ করতে হবে।'
        ],
        eligibilitySummary: 'পঞ্চম শ্রেণির নিয়মিত শিক্ষার্থীরা আবেদন করতে পারবে। প্রতিষ্ঠান প্রতি সর্বোচ্চ ৭ জন।',
        allowedRegions: ['মৌলভীবাজার জেলার বড়লেখা উপজেলা', 'বিয়ানীবাজারের লাউতা ইউনিয়ন'],
        allowedClasses: ['পঞ্চম শ্রেণি (সাধারণ)', 'পঞ্চম শ্রেণি (ইবতেদায়ী)'],
        contacts: storage.getSettings().contactPhones,
        maxStudentsPerSchool: 7,
        examCenters: [
          'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (১০১)',
          'বড়লেখা মডেল সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (১০২)',
          'লাউতা সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (১০৩)'
        ],
        documents: [
          {
            id: `doc-${Date.now()}`,
            title: 'বৃত্তি পরীক্ষা ২০২৬ এর অফিসিয়াল নীতিমালা (Nitimala.pdf)',
            fileName: 'Nitimala_2026.pdf',
            fileUrl: '/assets/Nitimala.pdf',
            uploadedAt: nowStr,
            fileSize: '১.২ MB'
          }
        ]
      };
      setEditingCampaign(examCamp);
    } else if (type === 'relief') {
      const reliefCamp: Campaign = {
        id: newId,
        title: 'শীতবস্ত্র ও জরুরি ত্রাণ বিতরণ কর্মসূচি–২০২৬',
        slug: `relief-${Date.now()}`,
        category: 'ত্রাণ ও পুনর্বাসন',
        campaignType: 'donation',
        shortDescription: 'অসহায়, শীতার্ত ও দুস্থ মানুষের মাঝে শীতবস্ত্র ও জরুরি খাদ্যসামগ্রী বিতরণ উদ্যোগ।',
        fullDescription: 'শীত মৌসুমে বড়লেখা ও হাওরাঞ্চলের দুস্থ পরিবার ও এতিম শিশুদের মাঝে কম্বল, শীতবস্ত্র এবং শুকনো খাবার পৌঁছে দেওয়ার মানবিক প্রয়াস।',
        displayStartDate: nowStr,
        displayEndDate: '2026-12-31',
        applicationStartDate: nowStr,
        applicationEndDate: '2026-12-25',
        admitCardAvailableDate: '',
        examDate: '',
        examTime: '',
        isFeeRequired: false,
        feeAmount: 0,
        isFeaturedOnHome: false,
        rules: [
          '১। স্থানীয় প্রতিনিধিদের মাধ্যমে প্রকৃত অসচ্ছলদের তালিকা প্রস্তুত করা হবে।',
          '২। স্বেচ্ছাসেবী টিম বাড়ি বাড়ি গিয়ে উপহারসামগ্রী পৌঁছে দেবে।'
        ],
        eligibilitySummary: 'হতদরিদ্র, বিধবা, এতিম ও অসচ্ছল পরিবারসমূহ।',
        allowedRegions: ['মৌলভীবাজার জেলা'],
        allowedClasses: [],
        contacts: storage.getSettings().contactPhones,
        maxStudentsPerSchool: 0,
        documents: []
      };
      setEditingCampaign(reliefCamp);
    } else if (type === 'plantation') {
      const plantCamp: Campaign = {
        id: newId,
        title: 'সবুজায়নে ফলজ ও বনজ বৃক্ষরোপণ কর্মসূচি–২০২৬',
        slug: `plantation-${Date.now()}`,
        category: 'পরিবেশ ও প্রকৃতি',
        campaignType: 'general',
        shortDescription: 'পরিবেশের ভারসাম্য রক্ষায় বিভিন্ন শিক্ষাপ্রতিষ্ঠান ও সামাজিক প্রাঙ্গণে বিনামূল্যে বৃক্ষরোপণ।',
        fullDescription: 'সবুজ সুন্দর বাংলাদেশ গড়ার অঙ্গীকার নিয়ে স্কুল, মাদ্রাসা ও উন্মুক্ত স্থানে ফলজ ও ওষধি গাছের চারা রোপণ ও বিতরণ উদ্যোগ।',
        displayStartDate: nowStr,
        displayEndDate: '2026-12-31',
        applicationStartDate: nowStr,
        applicationEndDate: '2026-11-30',
        admitCardAvailableDate: '',
        examDate: '',
        examTime: '',
        isFeeRequired: false,
        feeAmount: 0,
        isFeaturedOnHome: false,
        rules: ['১। গাছের যত্ন ও পরিচর্যা নিশ্চিত করতে হবে।'],
        eligibilitySummary: 'সকল শিক্ষাপ্রতিষ্ঠান ও ক্লাব সংগঠন।',
        allowedRegions: ['বড়লেখা ও পার্শ্ববর্তী অঞ্চল'],
        allowedClasses: [],
        contacts: storage.getSettings().contactPhones,
        maxStudentsPerSchool: 0,
        documents: []
      };
      setEditingCampaign(plantCamp);
    } else {
      // General Program
      const generalCamp: Campaign = {
        id: newId,
        title: 'নতুন সামাজিক ও সমাজকল্যাণ কর্মসূচি',
        slug: `program-${Date.now()}`,
        category: 'সমাজকল্যাণ',
        campaignType: 'general',
        shortDescription: 'সংস্থার উন্নয়নমূলক ও সামাজিক সচেতনতা বৃদ্ধির উদ্যোগ।',
        fullDescription: 'প্রতিষ্ঠানের লক্ষ্য বাস্তবায়নে সমাজের সর্বস্তরের মানুষকে একত্রিত করার জনকল্যাণমূলক উদ্যোগ।',
        displayStartDate: nowStr,
        displayEndDate: '2026-12-31',
        applicationStartDate: nowStr,
        applicationEndDate: '2026-12-15',
        admitCardAvailableDate: '',
        examDate: '',
        examTime: '',
        isFeeRequired: false,
        feeAmount: 0,
        isFeaturedOnHome: false,
        rules: ['১। শৃঙ্খলা ও নিয়মানুবর্তিতা মেনে অংশ নিতে হবে।'],
        eligibilitySummary: 'সকল আগ্রহী নাগরিক।',
        allowedRegions: ['সারাদেশ'],
        allowedClasses: [],
        contacts: storage.getSettings().contactPhones,
        maxStudentsPerSchool: 0,
        documents: []
      };
      setEditingCampaign(generalCamp);
    }
  };

  const handleCreateNew = () => {
    applyTemplate('exam');
    setIsCreating(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCampaign) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('শুধুমাত্র PDF ফাইল আপলোড করা যাবে');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('ফাইল সাইজ সর্বোচ্চ ১০ মেগাবাইটের মধ্যে হতে হবে');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const newDoc: CampaignDocument = {
        id: `doc-${Date.now()}`,
        title: newDocTitle.trim() || file.name,
        fileName: file.name,
        fileUrl: base64Url,
        fileSize: `${sizeMb} MB`,
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setEditingCampaign({
        ...editingCampaign,
        documents: [...(editingCampaign.documents || []), newDoc]
      });
      setNewDocTitle('');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      setSuccessMessage('PDF ফাইল সফলভাবে যুক্ত হয়েছে!');
      setTimeout(() => setSuccessMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId: string) => {
    if (!editingCampaign) return;
    setEditingCampaign({
      ...editingCampaign,
      documents: (editingCampaign.documents || []).filter(d => d.id !== docId)
    });
  };

  const handleSetAdmitDateToNow = () => {
    if (!editingCampaign) return;
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}T${hours}:${mins}`;

    setEditingCampaign({
      ...editingCampaign,
      admitCardAvailableDate: dateStr
    });
    setSuccessMessage('প্রবেশপত্র এখনই ডাউনলোডের জন্য উন্মুক্ত করা হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    if (!editingCampaign.title.trim()) {
      setErrorMessage('কর্মসূচির নাম প্রদান করা আবশ্যক');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    storage.saveCampaign(editingCampaign);
    refreshList();
    setEditingCampaign(null);
    setIsCreating(false);
    setSuccessMessage('কর্মসূচি সফলভাবে সংরক্ষিত হয়েছে এবং সাইটজুড়ে সক্রিয় হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    storage.deleteCampaign(deleteConfirmId);
    setDeleteConfirmId(null);
    refreshList();
    setSuccessMessage('কর্মসূচিটি সফলভাবে মুছে ফেলা হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            গতিশীল কর্মসূচি ও ক্যাম্পেইন ব্যবস্থাপনা
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C]">
            কর্মসূচি ও পরীক্ষা পরিচালনা (Dynamic CRUD)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            যে কোনো নতুন কর্মসূচি তৈরি করুন, প্রবেশপত্র প্রকাশের তারিখ নির্ধারণ করুন এবং অফিসিয়াল PDF ডকুমেন্টস যুক্ত করুন।
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কর্মসূচি তৈরি করুন</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid grid-cols-1 gap-4">
        {campaigns.map(camp => {
          const statusInfo = calculateCampaignStatus(camp);
          return (
            <div 
              key={camp.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-all relative ${
                camp.isFeaturedOnHome ? 'border-[#0284C7] ring-2 ring-[#0284C7]/20' : 'border-slate-200/90'
              }`}
            >
              {camp.isFeaturedOnHome && (
                <div className="absolute -top-3 right-5 bg-[#0284C7] text-white text-3xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  <span>হোমপেজ ও মেনুতে সক্রিয় প্রধান ক্যাম্পেইন</span>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {camp.category}
                    </span>
                    <span className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                      statusInfo.isOpenForApplication ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {statusInfo.messageBn}
                    </span>
                    {camp.isFeeRequired ? (
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        ফি: ৳{convertToBengaliNumber(camp.feeAmount)}
                      </span>
                    ) : (
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ফি মুক্ত
                      </span>
                    )}
                    {camp.documents && camp.documents.length > 0 && (
                      <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#0284C7]" />
                        <span>{convertToBengaliNumber(camp.documents.length)}টি PDF সংযুক্ত</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#072C4C] font-serif-bn">
                    {camp.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {camp.shortDescription || camp.fullDescription}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-2xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block font-medium">আবেদন সময়সীমা</span>
                      <strong className="text-slate-800">{camp.applicationStartDate} – {camp.applicationEndDate}</strong>
                    </div>
                    {camp.admitCardAvailableDate && (
                      <div>
                        <span className="text-slate-400 block font-medium">প্রবেশপত্র ডাউনলোডের তারিখ</span>
                        <strong className="text-[#0284C7] font-bold">{camp.admitCardAvailableDate}</strong>
                      </div>
                    )}
                    {camp.examDate && (
                      <div>
                        <span className="text-slate-400 block font-medium">পরীক্ষার তারিখ ও সময়</span>
                        <strong className="text-slate-800">{camp.examDate} ({camp.examTime})</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-col lg:items-end shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleEdit(camp)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>সম্পাদনা</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(camp.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition cursor-pointer border border-red-200/80"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>মুছে ফেলুন</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
                কর্মসূচি মুছে ফেলার নিশ্চিতকরণ
              </h3>
              <p className="text-xs text-slate-600">
                আপনি কি নিশ্চিত যে এই কর্মসূচিটি তালিকা থেকে সম্পূর্ণ অপসারণ করতে চান?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Create/Edit Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider block">
                  {isCreating ? 'নতুন কর্মসূচি তৈরি' : 'কর্মসূচি তথ্য সম্পাদনা'}
                </span>
                <h3 className="text-lg font-bold text-[#072C4C] font-serif-bn">
                  {editingCampaign.title || 'ক্যাম্পেইন বিবরণ'}
                </h3>
              </div>
              <button 
                onClick={() => setEditingCampaign(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector if Creating */}
            {isCreating && (
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                <span className="text-2xs font-bold text-[#072C4C] uppercase tracking-wide block">
                  দ্রুত টেমপ্লেট নির্বাচন করুন (Flexibility & Speed):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate('exam')}
                    className="p-2.5 rounded-xl bg-white border border-sky-300 hover:border-[#0284C7] text-left text-xs font-semibold text-[#072C4C] shadow-2xs hover:shadow-xs transition"
                  >
                    <span className="block text-2xs text-[#0284C7] font-bold">🎓 বৃত্তি পরীক্ষা</span>
                    <span className="text-3xs text-slate-500 font-normal">মেধাবৃত্তি ও প্রবেশপত্র</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate('relief')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] text-left text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition"
                  >
                    <span className="block text-2xs text-emerald-600 font-bold">🤝 ত্রাণ ও পুনর্বাসন</span>
                    <span className="text-3xs text-slate-500 font-normal">শীতবস্ত্র ও জরুরি খাদ্য</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate('plantation')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] text-left text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition"
                  >
                    <span className="block text-2xs text-emerald-700 font-bold">🌿 বৃক্ষরোপণ</span>
                    <span className="text-3xs text-slate-500 font-normal">সবুজ পরিবেশ কর্মসূচি</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate('general')}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284C7] text-left text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition"
                  >
                    <span className="block text-2xs text-purple-600 font-bold">🌟 সাধারণ কর্মসূচি</span>
                    <span className="text-3xs text-slate-500 font-normal">উন্নয়ন ও সমাজকল্যাণ</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800">
                    কর্মসূচির পূর্ণ নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCampaign.title}
                    onChange={e => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#0284C7]"
                    placeholder="যেমন: আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editingCampaign.category}
                    onChange={e => setEditingCampaign({ ...editingCampaign, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#0284C7]"
                    placeholder="যেমন: শিক্ষা ও বৃত্তি / সমাজসেবা"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">ক্যাম্পেইন ধরন</label>
                  <select
                    value={editingCampaign.campaignType || 'exam'}
                    onChange={e => setEditingCampaign({ ...editingCampaign, campaignType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#0284C7]"
                  >
                    <option value="exam">মেধাবৃত্তি পরীক্ষা (Exam with Admit Card)</option>
                    <option value="general">সাধারণ কর্মসূচি (General Program)</option>
                    <option value="donation">ত্রাণ ও সামাজিক অনুদান (Relief & Welfare)</option>
                    <option value="training">প্রশিক্ষণ ও কর্মশালা (Training)</option>
                  </select>
                </div>
              </div>

              {/* Application Timeline & Admit Card Date */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-2xs font-bold text-[#072C4C] uppercase tracking-wide block">
                  আবেদন ও প্রবেশপত্র ডাউনলোডের সময়সূচি:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">আবেদন শুরু</label>
                    <input
                      type="date"
                      value={editingCampaign.applicationStartDate}
                      onChange={e => setEditingCampaign({ ...editingCampaign, applicationStartDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">আবেদন শেষ</label>
                    <input
                      type="date"
                      value={editingCampaign.applicationEndDate}
                      onChange={e => setEditingCampaign({ ...editingCampaign, applicationEndDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#0284C7]">
                        প্রবেশপত্র ডাউনলোডের সময়
                      </label>
                      <button
                        type="button"
                        onClick={handleSetAdmitDateToNow}
                        className="text-3xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded cursor-pointer transition"
                        title="এখনই শিক্ষার্থীদের প্রবেশপত্র ডাউনলোড উন্মুক্ত করুন"
                      >
                        ⚡ এখনই উন্মুক্ত করুন
                      </button>
                    </div>
                    <input
                      type="datetime-local"
                      value={editingCampaign.admitCardAvailableDate || ''}
                      onChange={e => setEditingCampaign({ ...editingCampaign, admitCardAvailableDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#0284C7] bg-sky-50/50 text-xs font-semibold text-[#072C4C]"
                    />
                    <span className="text-3xs text-slate-500 block">
                      এই তারিখ ও সময়ের পূর্বে শিক্ষার্থীরা প্রবেশপত্র ডাউনলোড করতে পারবে না।
                    </span>
                  </div>
                </div>
              </div>

              {/* Exam Specific Details if Exam */}
              {editingCampaign.campaignType === 'exam' && (
                <div className="p-4 bg-sky-50/40 rounded-2xl border border-sky-200/70 space-y-3">
                  <span className="text-2xs font-bold text-[#072C4C] uppercase tracking-wide block">
                    পরীক্ষার তথ্য ও কেন্দ্রসমূহ:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">পরীক্ষার তারিখ</label>
                      <input
                        type="date"
                        value={editingCampaign.examDate}
                        onChange={e => setEditingCampaign({ ...editingCampaign, examDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">পরীক্ষার সময়</label>
                      <input
                        type="text"
                        value={editingCampaign.examTime}
                        onChange={e => setEditingCampaign({ ...editingCampaign, examTime: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                        placeholder="যেমন: সকাল ১০:০০ টা - দুপুর ১২:০০ টা"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-semibold text-slate-700">পরীক্ষা কেন্দ্র (কমা দিয়ে একাধিক)</label>
                      <input
                        type="text"
                        value={(editingCampaign.examCenters || []).join(', ')}
                        onChange={e => setEditingCampaign({ 
                          ...editingCampaign, 
                          examCenters: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                        })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                        placeholder="গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র, বড়লেখা মডেল প্রাথমিক বিদ্যালয় কেন্দ্র"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="feeReqCheck"
                    checked={editingCampaign.isFeeRequired}
                    onChange={e => setEditingCampaign({ ...editingCampaign, isFeeRequired: e.target.checked })}
                    className="w-4 h-4 text-[#0284C7] rounded cursor-pointer"
                  />
                  <label htmlFor="feeReqCheck" className="font-bold text-slate-800 cursor-pointer">
                    আবেদন বা অংশগ্রহণের জন্য ফি প্রযোজ্য
                  </label>
                </div>

                {editingCampaign.isFeeRequired && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">ফি এর পরিমাণ (টাকায়)</label>
                    <input
                      type="number"
                      min={0}
                      value={editingCampaign.feeAmount}
                      onChange={e => setEditingCampaign({ ...editingCampaign, feeAmount: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">সংক্ষিপ্ত বিবরণ (হোমপেজ ও কার্ডের জন্য)</label>
                <textarea
                  rows={2}
                  value={editingCampaign.shortDescription}
                  onChange={e => setEditingCampaign({ ...editingCampaign, shortDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#0284C7]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">পূর্ণ বিবরণ ও উদ্দেশ্য</label>
                <textarea
                  rows={3}
                  value={editingCampaign.fullDescription}
                  onChange={e => setEditingCampaign({ ...editingCampaign, fullDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#0284C7]"
                />
              </div>

              {/* PDF Documents Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-[#072C4C] uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>ক্যাম্পেইন সম্পর্কিত অফিসিয়াল PDF ডকুমেন্টস (নীতিমালা / নির্দেশিকা):</span>
                  </span>
                </div>

                {/* List of uploaded documents */}
                {editingCampaign.documents && editingCampaign.documents.length > 0 ? (
                  <div className="space-y-2">
                    {editingCampaign.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-[#0284C7] shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-800 block truncate">{doc.title}</span>
                            <span className="text-3xs text-slate-500 font-mono">
                              {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={doc.fileName}
                              className="p-1.5 text-slate-500 hover:text-[#0284C7] transition"
                              title="ডাউনলোড বা প্রদর্শন"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    কোনো PDF ডকুমেন্ট এখনও যুক্ত করা হয়নি। নিচে নতুন PDF ফাইল আপলোড করুন।
                  </p>
                )}

                {/* Upload New PDF */}
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="ডকুমেন্টের শিরোনাম (যেমন: প্রাতিষ্ঠানিক নীতিমালা–২০২৬)"
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={pdfInputRef}
                      accept="application/pdf,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdfUploadInput"
                    />
                    <label
                      htmlFor="pdfUploadInput"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>PDF ফাইল আপলোড</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Featured on Home Checkbox */}
              <div className="flex items-center gap-2 pt-2 p-3.5 bg-sky-50/70 rounded-xl border border-sky-100">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={editingCampaign.isFeaturedOnHome}
                  onChange={e => setEditingCampaign({ ...editingCampaign, isFeaturedOnHome: e.target.checked })}
                  className="w-4 h-4 text-[#0284C7] rounded cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="font-bold text-[#072C4C] cursor-pointer">
                  এই কর্মসূচিটি মূল নেভিগেশন ও হোমপেজে সক্রিয় প্রধান ক্যাম্পেইন হিসেবে নির্ধারণ করুন
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ ও সক্রিয় করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
