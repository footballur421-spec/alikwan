import { 
  Applicant, 
  ApplicantStatus, 
  ExamSettings, 
  Notice, 
  AuditLog, 
  PaymentReceipt, 
  PaymentStatus, 
  OFFICIAL_CONTACTS, 
  Campaign, 
  RecognizedSchool, 
  SchoolCategory, 
  CategoryRollConfig, 
  INITIAL_CATEGORY_ROLL_CONFIGS, 
  CommitteeMember, 
  GalleryItem, 
  OfficialSignatures, 
  AdmitCardDesign,
  DEFAULT_ADMIT_CARD_DESIGN,
  WebsiteEditorConfig,
  WebsiteFeaturesConfig,
  DEFAULT_WEBSITE_EDITOR_CONFIG
} from '../types';
import { INITIAL_CAMPAIGNS, INITIAL_RECOGNIZED_SCHOOLS } from '../data/campaignsData';
import { INITIAL_COMMITTEE_MEMBERS } from '../data/committeeData';
import { INITIAL_GALLERY_ITEMS } from '../data/galleryData';
import { 
  generateApplicationNo, 
  generateAdmitCardNo, 
  allocateCategoryRoll, 
  convertToBengaliNumber, 
  convertBengaliToEnglishDigits, 
  checkSchoolQuota, 
  calculateCampaignStatus 
} from '../utils/validation';
import { 
  pushApplicantToSupabase, 
  updateRemoteApplicantStatus, 
  pushReceiptToSupabase, 
  pushAuditLogToSupabase, 
  fetchRemoteApplicants 
} from './supabaseClient';
import {
  fbFetchApplicants,
  fbSaveApplicant,
  fbDeleteApplicant,
  fbResetAllTestData,
  fbSaveReceipt,
  fbFetchReceipts,
  fbSaveAuditLog,
  fbSaveSetting,
  fbFetchSetting,
  fbListenSettings,
  fbSaveCampaign,
  fbFetchCampaigns,
  fbDeleteCampaign,
  fbSaveSchool,
  fbFetchSchools,
  fbDeleteSchool,
  fbSaveCommitteeMember,
  fbFetchCommittee,
  fbDeleteCommitteeMember,
  fbSaveGalleryItem,
  fbFetchGallery,
  fbDeleteGalleryItem,
  fbSaveNotice,
  fbFetchNotices,
  fbDeleteNotice,
  fbListenAllCollections,
  fbDeleteMediaFile
} from './firebaseClient';

const STORAGE_KEYS = {
  APPLICANTS: 'alikhwan_applicants_v4',
  SETTINGS: 'alikhwan_settings_v4',
  NOTICES: 'alikhwan_notices_v4',
  AUDIT_LOGS: 'alikhwan_audit_logs_v4',
  RECEIPTS: 'alikhwan_receipts_v4',
  ADMIN_AUTH: 'alikhwan_admin_session_v4',
  CAMPAIGNS: 'alikhwan_campaigns_v4',
  SCHOOLS: 'alikhwan_schools_v4',
  COMMITTEE: 'alikhwan_committee_v4',
  ROLL_CONFIGS: 'alikhwan_roll_configs_v4',
  BOOTSTRAP_STATE: 'alikhwan_bootstrap_v4',
  GALLERY: 'alikhwan_gallery_v4',
  SIGNATURES: 'alikhwan_official_signatures_v4',
  ADMIT_DESIGN: 'alikhwan_admit_card_design_v4',
  WEBSITE_EDITOR: 'alikhwan_website_editor_v4',
};

export const DEFAULT_SETTINGS: ExamSettings = {
  isApplicationOpen: true,
  startDate: '2026-10-25', // ২৫ অক্টোবর ২০২৬
  endDate: '2026-11-05',   // ০৫ নভেম্বর ২০২৬
  examDate: '2026-11-14',  // ১৪ নভেম্বর ২০২৬, শনিবার
  examTime: 'সকাল ১০:০০ টা - দুপুর ১২:০০ টা',
  admitCardAvailableDate: '2026-11-06T09:00', // প্রবেশপত্র উন্মুক্ত সময়
  examCenters: [
    'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (কেন্দ্র কোড: ১০১)',
    'বড়লেখা মডেল সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (কেন্দ্র কোড: ১০২)',
    'লাউতা সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র (বিয়ানীবাজার, কেন্দ্র কোড: ১০৩)'
  ],
  isFeeRequired: true,
  feeAmount: 100, // জনপ্রতি ১০০ টাকা
  contactPhones: OFFICIAL_CONTACTS,
  contactEmail: 'info@al-ikhwan-bd.org',
  syllabusSummary: 'পঞ্চম শ্রেণি সাধারণ ও ইবতেদায়ী পাঠ্যপুস্তকের আলোকে লিখিত পরীক্ষা অনুষ্ঠিত হবে।',
  admitInstructions: [
    'পরীক্ষার্থীরা ওয়েবসাইট থেকে প্রবেশপত্র ডাউনলোড ও প্রিন্ট করে অবশ্যই পরীক্ষাকেন্দ্রে সঙ্গে নিয়ে আসবে।',
    'পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে অবশ্যই নিজ নিজ পরীক্ষাকেন্দ্রে উপস্থিত হতে হবে।',
    'প্রবেশপত্রের মূল কপি সাথে আনা বাধ্যতামূলক। প্রবেশপত্র ব্যতীত কাউকে পরীক্ষায় অংশগ্রহণ করতে দেওয়া হবে না।',
    'কালো কালির বলপয়েন্ট কলম ব্যবহার করতে হবে। মোবাইল ফোন বা কোনো ডিজিটাল ডিভাইস সম্পূর্ণ নিষিদ্ধ।',
    'ভুল তথ্য বা অসংগতি প্রমাণিত হলে সংশ্লিষ্ট শিক্ষার্থীর আবেদন ও ফলাফল তাৎক্ষণিকভাবে বাতিল হতে পারে।'
  ],
  maxStudentsPerSchool: 7, // একটি প্রতিষ্ঠান থেকে সর্বোচ্চ ৭ জন
  categoryRollConfigs: INITIAL_CATEGORY_ROLL_CONFIGS
};

export const DEFAULT_OFFICIAL_SIGNATURES: OfficialSignatures = {
  controllerSignatureUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80">' +
    '<path d="M25,52 Q45,15 70,45 T120,38 Q150,18 180,48 T220,40" fill="none" stroke="#072C4C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M48,28 Q70,55 92,28" fill="none" stroke="#072C4C" stroke-width="2"/>' +
    '<path d="M30,62 L195,56" fill="none" stroke="#072C4C" stroke-width="1.8" stroke-dasharray="3,1"/>' +
    '<text x="65" y="74" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0284C7">পরীক্ষা নিয়ন্ত্রক / Controller</text>' +
    '</svg>'
  ),
  secretarySignatureUrl: '/assets/signatures/secretary_sign.jpg',
  presidentSignatureUrl: '/assets/signatures/shovapoti_sign.jpg',
  controllerSealUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">' +
    '<circle cx="80" cy="80" r="74" fill="none" stroke="#072C4C" stroke-width="3"/>' +
    '<circle cx="80" cy="80" r="66" fill="none" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="4,2"/>' +
    '<circle cx="80" cy="80" r="48" fill="none" stroke="#072C4C" stroke-width="1.5"/>' +
    '<text x="80" y="32" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#072C4C" text-anchor="middle">আল-ইখওয়ান সমাজ কল্যাণ সংস্থা</text>' +
    '<text x="80" y="72" font-family="sans-serif" font-size="11" font-weight="bold" fill="#072C4C" text-anchor="middle">বৃত্তি পরীক্ষা</text>' +
    '<text x="80" y="88" font-family="sans-serif" font-size="12" font-weight="bold" fill="#E52320" text-anchor="middle">২০২৬</text>' +
    '<text x="80" y="102" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0284C7" text-anchor="middle">রেজিঃ ২৯৯ · স্থাপিত ২০০০</text>' +
    '<text x="80" y="138" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#072C4C" text-anchor="middle">★ বড়লেখা, মৌলভীবাজার ★</text>' +
    '</svg>'
  )
};

DEFAULT_SETTINGS.officialSignatures = DEFAULT_OFFICIAL_SIGNATURES;

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n-1',
    title: 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬ এর অনলাইন আবেদন বিজ্ঞপ্তি',
    category: 'জরুরি',
    date: '২০২৬-০৮-০১',
    content: 'সকল শিক্ষার্থী, অভিভাবক ও প্রতিষ্ঠানপ্রধানদের অবগতির জন্য জানানো যাচ্ছে যে, আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা কর্তৃক পরিচালিত "আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬" এর অনলাইন আবেদন কার্যক্রম শুরু হয়েছে।\n\n• যোগ্যতা: শুধুমাত্র পঞ্চম শ্রেণির (সাধারণ/প্রাথমিক ও ইবতেদায়ী) শিক্ষার্থীরা অংশগ্রহণ করতে পারবে।\n• আওতাভুক্ত এলাকা: বড়লেখা উপজেলার অন্তর্গত সকল শিক্ষাপ্রতিষ্ঠান এবং বিয়ানীবাজার উপজেলার লাউতা ইউনিয়ন পরিষদের আওতাধীন শিক্ষাপ্রতিষ্ঠান।\n• প্রতিষ্ঠান কোটা: একটি শিক্ষাপ্রতিষ্ঠান থেকে প্রধান শিক্ষকের অনুমতিক্রমে সর্বোচ্চ ৭ (সাত) জন শিক্ষার্থী অংশগ্রহণ করতে পারবে।\n• আবেদন ফি: জনপ্রতি ১০০ (একশত) টাকা।\n• আবেদনের শেষ তারিখ: ০৫ নভেম্বর ২০২৬।\n• পরীক্ষার তারিখ: ১৪ নভেম্বর ২০২৬, শনিবার।',
    isPinned: true,
  },
  {
    id: 'n-2',
    title: 'পঞ্চম শ্রেণির বৃত্তি পরীক্ষা ২০২৬ এর পাঠ্যসূচি ও অংশগ্রহণ সংক্রান্ত নীতিমালা',
    category: 'সিলেবাস',
    date: '২০২৬-০৮-১০',
    content: '২০২৬ সালের বৃত্তি পরীক্ষা শুধুমাত্র ৫ম শ্রেণির শিক্ষার্থীদের জন্য নির্ধারিত। জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) এবং বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ডের ৫ম শ্রেণির পাঠ্যসূচির আলোকে পরীক্ষা অনুষ্ঠিত হবে। লিখিত পরীক্ষা অনুষ্ঠিত হবে ১৪ নভেম্বর ২০২৬, শনিবার।',
    isPinned: false,
  },
  {
    id: 'n-3',
    title: 'অনলাইন প্রবেশপত্র সংগ্রহ ও পরীক্ষার্থীদের জন্য পালনীয় নির্দেশাবলি',
    category: 'সাধারণ',
    date: '২০২৬-০৮-১৫',
    content: 'আবেদন যাচাই ও ১০০ টাকা ফি পরিশোধের পর পরীক্ষার্থীরা ওয়েবসাইট থেকে প্রবেশপত্র ডাউনলোড ও প্রিন্ট করে নিতে পারবেন। পরীক্ষার দিন প্রিন্টকৃত প্রবেশপত্র কেন্দ্রে সাথে আনা বাধ্যতামূলক। পরীক্ষাকেন্দ্রে ক্যালকুলেটর, মোবাইল ফোন বা যেকোনো প্রকার ইলেকট্রনিক ডিভাইস বহন সম্পূর্ণ নিষিদ্ধ।',
    isPinned: false,
  }
];

// Production state: No mock candidates or test admit cards
export const INITIAL_APPLICANTS: Applicant[] = [];

class StorageService {
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- APPLICANTS ---
  getApplicants(): Applicant[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICANTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify([]));
        return [];
      }
      const parsed: Applicant[] = JSON.parse(data);
      // Clean and purge any legacy test or sample applicants
      const cleaned = parsed.filter(a => {
        if (!a || !a.applicationNo) return false;
        if (a.applicationNo === 'ALIKH-2026-00101' || a.applicationNo === 'ALIKH-2026-00102') return false;
        if (a.applicationNo.startsWith('TEST-')) return false;
        if ((a as any).isTest) return false;
        return true;
      });
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  }

  getApplicantsByQuery(query: string): Applicant[] {
    const raw = (query || '').trim();
    if (!raw) return [];

    const engQuery = convertBengaliToEnglishDigits(raw);
    const upperQuery = engQuery.toUpperCase();
    const digitsOnly = engQuery.replace(/[^0-9]/g, '');
    const list = this.getApplicants();

    return list.filter(a => {
      const appNoUpper = (a.applicationNo || '').toUpperCase();
      const admitNoUpper = (a.admitCardNo || '').toUpperCase();
      const rollUpper = (a.rollNumber || '').toUpperCase();
      const mobDigits = (a.mobile || '').replace(/[^0-9]/g, '');
      const altMobDigits = (a.altMobile || '').replace(/[^0-9]/g, '');
      const trxUpper = (a.transactionId || '').toUpperCase();

      // Exact matches
      if (appNoUpper === upperQuery) return true;
      if (admitNoUpper === upperQuery) return true;
      if (rollUpper && rollUpper === upperQuery) return true;
      if (trxUpper && trxUpper === upperQuery) return true;

      // Phone match (clean 10-11 digits)
      if (digitsOnly.length >= 10) {
        if (mobDigits === digitsOnly || mobDigits.endsWith(digitsOnly) || digitsOnly.endsWith(mobDigits)) return true;
        if (altMobDigits === digitsOnly || altMobDigits.endsWith(digitsOnly)) return true;
      }

      // Check last 5 digits sequence (e.g. 00101 matching ALIKH-2026-00101 or AC-2026-00101)
      if (digitsOnly.length === 5) {
        if (appNoUpper.endsWith(digitsOnly) || admitNoUpper.endsWith(digitsOnly)) return true;
      }

      // TrxID contains
      if (upperQuery.length >= 4 && trxUpper.includes(upperQuery)) return true;

      return false;
    });
  }

  getApplicantByNo(applicationNoOrMobile: string, secondaryQuery?: string): Applicant | undefined {
    const list = this.getApplicants();
    const q1 = (applicationNoOrMobile || '').trim();
    const q2 = (secondaryQuery || '').trim();
    if (!q1 && !q2) return undefined;

    // Use primary query first
    const primaryMatches = this.getApplicantsByQuery(q1);
    if (primaryMatches.length > 0) return primaryMatches[0];

    // If secondary query provided (e.g. fallback)
    if (q2) {
      const secondaryMatches = this.getApplicantsByQuery(q2);
      if (secondaryMatches.length > 0) return secondaryMatches[0];
    }

    return undefined;
  }

  getSchoolQuotaStatus(schoolName: string): { count: number; remaining: number; isFull: boolean; max: number } {
    const list = this.getApplicants();
    const cleanTarget = (schoolName || '').trim().toLowerCase();
    const count = list.filter(a => (a.schoolName || '').trim().toLowerCase() === cleanTarget).length;
    const max = 7;
    return {
      count,
      remaining: Math.max(0, max - count),
      isFull: count >= max,
      max
    };
  }

  /**
   * সেকশন ৫: কনকারেন্সি ও কোটা যাচাই সহ আবেদন সংরক্ষণ
   */
  saveApplicant(applicant: Applicant): { success: boolean; error?: string } {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.id === applicant.id || a.applicationNo === applicant.applicationNo);

    // Enforce 7 students quota limit
    const quota = checkSchoolQuota(applicant.schoolName, list, applicant.id);
    if (!quota.isAllowed && index < 0) {
      return {
        success: false,
        error: quota.error || 'এই শিক্ষাপ্রতিষ্ঠান থেকে সর্বোচ্চ ৭ জনের কোটা পূর্ণ হয়ে গেছে।'
      };
    }

    const updatedApp = {
      ...applicant,
      updatedAt: new Date().toISOString(),
      createdAt: applicant.createdAt || new Date().toISOString()
    };

    if (index >= 0) {
      list[index] = updatedApp;
    } else {
      list.unshift(updatedApp);
    }
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));
    this.addAuditLog(
      'আবেদন জমা/আপডেট',
      applicant.applicationNo,
      `আবেদনকারী: ${applicant.nameBn}, স্কুল: ${applicant.schoolName}`
    );
    this.notify();

    // 1. Asynchronously push to Firebase Firestore
    fbSaveApplicant(updatedApp).catch(err => {
      console.warn('Firebase applicant save warning:', err);
    });

    // 2. Also keep Supabase & Backend API in sync
    pushApplicantToSupabase(updatedApp).catch(() => {});
    return { success: true };
  }

  /**
   * প্রতিষ্ঠান থেকে একাধিক পরীক্ষার্থীর ব্যাচ আবেদন সংরক্ষণ ও ফায়ারবেস ক্লাউড সিঙ্ক
   */
  saveApplicantsBatch(applicants: Applicant[]): { success: boolean; error?: string; savedApplicants?: Applicant[] } {
    if (!applicants || applicants.length === 0) {
      return { success: false, error: 'কোনো আবেদনকারী পাওয়া যায়নি।' };
    }

    const schoolName = applicants[0].schoolName;
    const list = this.getApplicants();
    const existingCount = list.filter(a => (a.schoolName || '').trim().toLowerCase() === (schoolName || '').trim().toLowerCase()).length;
    const max = 7;

    if (existingCount + applicants.length > max) {
      return {
        success: false,
        error: `এই শিক্ষাপ্রতিষ্ঠান থেকে ইতিমধ্যে ${existingCount} জন নিবন্ধিত আছেন। নতুন ${applicants.length} জন সহ মোট সংখ্যা সর্বোচ্চ ৭ জনের কোটা অতিক্রম করবে (বাকি আসন: ${Math.max(0, max - existingCount)}টি)।`
      };
    }

    const updatedBatch: Applicant[] = applicants.map(app => ({
      ...app,
      updatedAt: new Date().toISOString(),
      createdAt: app.createdAt || new Date().toISOString()
    }));

    // Prepend all applicants to localStorage
    list.unshift(...updatedBatch);
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));

    this.addAuditLog(
      'ব্যাচ আবেদন জমা',
      schoolName,
      `প্রতিষ্ঠান: ${schoolName}, মোট শিক্ষার্থী: ${applicants.length} জন`
    );
    this.notify();

    // Asynchronously push all to Firebase Cloud Firestore
    Promise.all(updatedBatch.map(app => fbSaveApplicant(app))).catch(err => {
      console.warn('Firebase batch applicant save warning:', err);
    });

    return { success: true, savedApplicants: updatedBatch };
  }

  deleteApplicant(idOrAppNo: string): boolean {
    const list = this.getApplicants();
    const target = list.find(a => a.id === idOrAppNo || a.applicationNo === idOrAppNo);
    const filtered = list.filter(a => a.id !== idOrAppNo && a.applicationNo !== idOrAppNo);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(filtered));
      this.addAuditLog('আবেদন মুছে ফেলা', idOrAppNo, 'আবেদনকারী রেকর্ড সফলভাবে অপসারিত');
      this.notify();

      // Delete from Firebase Firestore
      const targetNo = target ? target.applicationNo : idOrAppNo;
      fbDeleteApplicant(targetNo).catch(err => {
        console.warn('Firebase delete applicant error:', err);
      });

      return true;
    }
    return false;
  }

  /**
   * Reset every default test value & purge demo applicant records
   */
  async resetAllTestData(): Promise<{ count: number; success: boolean }> {
    // 1. Clear applicants from localStorage
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify([]));
    localStorage.setItem('alikhwan_test_data_cleared_v4', 'true');
    
    // 2. Clear receipts
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));

    // 3. Delete all documents in Firestore applicants collection
    const fbRes = await fbResetAllTestData();

    this.addAuditLog('ডেটাবেজ টেস্ট ডাটা রিসেট', 'DATABASE', 'সকল ডেমো/টেস্ট আবেদন মুছে ফেলে ডেটাবেজ শূন্য (০) থেকে শুরু করার জন্য প্রস্তুত করা হয়েছে');
    this.notify();
    return { count: fbRes.deletedCount, success: true };
  }

  /**
   * Sync applicants and all website customization with Firebase Cloud Firestore on boot or manual sync
   */
  async syncWithFirebase(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      // 1. Sync global settings, website config, admit design, and admin security from Firestore
      try {
        const [remoteWebsite, remoteAdmit, remoteSettings, remoteSecurity] = await Promise.all([
          fbFetchSetting<WebsiteEditorConfig>('website_config'),
          fbFetchSetting<AdmitCardDesign>('admit_design'),
          fbFetchSetting<ExamSettings>('exam_settings'),
          fbFetchSetting<{ passwordHash: string; pin: string }>('admin_security')
        ]);

        if (remoteWebsite) {
          localStorage.setItem(STORAGE_KEYS.WEBSITE_EDITOR, JSON.stringify({ ...DEFAULT_WEBSITE_EDITOR_CONFIG, ...remoteWebsite }));
        }
        if (remoteAdmit) {
          localStorage.setItem(STORAGE_KEYS.ADMIT_DESIGN, JSON.stringify({ ...DEFAULT_ADMIT_CARD_DESIGN, ...remoteAdmit }));
        }
        if (remoteSettings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...remoteSettings }));
        }
        if (remoteSecurity && remoteSecurity.passwordHash) {
          const bs = this.getBootstrapState();
          bs.passwordHash = remoteSecurity.passwordHash;
          this.saveBootstrapState(bs);
        }
      } catch (e) {
        console.warn('Firebase settings hydration warning:', e);
      }

      // 2. Fetch all domain collections from authoritative Firestore
      try {
        const [remoteNotices, remoteCampaigns, remoteSchools, remoteCommittee, remoteGallery, remoteApplicants, remoteReceipts] = await Promise.all([
          fbFetchNotices(),
          fbFetchCampaigns(),
          fbFetchSchools(),
          fbFetchCommittee(),
          fbFetchGallery(),
          fbFetchApplicants(),
          fbFetchReceipts()
        ]);

        if (remoteNotices && remoteNotices.length > 0) {
          localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(remoteNotices));
        }
        if (remoteCampaigns && remoteCampaigns.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(remoteCampaigns));
        }
        if (remoteSchools && remoteSchools.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(remoteSchools));
        }
        if (remoteCommittee && remoteCommittee.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(remoteCommittee));
        }
        if (remoteGallery && remoteGallery.length > 0) {
          localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(remoteGallery));
        }
        if (remoteApplicants && Array.isArray(remoteApplicants)) {
          localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(remoteApplicants));
        }
        if (remoteReceipts && Array.isArray(remoteReceipts)) {
          localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(remoteReceipts));
        }
      } catch (e) {
        console.warn('Firestore collections hydration warning:', e);
      }

      // 3. Attach authoritative real-time listeners across all collections
      fbListenAllCollections({
        onSettingsChange: (key, data) => {
          if (key === 'website_config') {
            localStorage.setItem(STORAGE_KEYS.WEBSITE_EDITOR, JSON.stringify({ ...DEFAULT_WEBSITE_EDITOR_CONFIG, ...data }));
            this.notify();
          } else if (key === 'admit_design') {
            localStorage.setItem(STORAGE_KEYS.ADMIT_DESIGN, JSON.stringify({ ...DEFAULT_ADMIT_CARD_DESIGN, ...data }));
            this.notify();
          } else if (key === 'exam_settings') {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...data }));
            this.notify();
          } else if (key === 'admin_security' && data && data.passwordHash) {
            const bs = this.getBootstrapState();
            bs.passwordHash = data.passwordHash;
            this.saveBootstrapState(bs);
          }
        },
        onNoticesChange: (notices) => {
          if (notices.length > 0) {
            localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
            this.notify();
          }
        },
        onCampaignsChange: (campaigns) => {
          if (campaigns.length > 0) {
            localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
            this.notify();
          }
        },
        onSchoolsChange: (schools) => {
          if (schools.length > 0) {
            localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
            this.notify();
          }
        },
        onCommitteeChange: (committee) => {
          if (committee.length > 0) {
            localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(committee));
            this.notify();
          }
        },
        onGalleryChange: (gallery) => {
          localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
          this.notify();
        },
        onApplicantsChange: (applicants) => {
          localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
          this.notify();
        }
      });

      this.notify();
      return { 
        success: true, 
        count: this.getApplicants().length, 
        message: 'ফায়ারবেস ক্লাউড ফায়ারস্টোর ডেটাবেজ সফলভাবে সংযুক্ত এবং রিয়েল-টাইম সিঙ্ক সক্রিয়।' 
      };
    } catch (err: any) {
      console.warn('Firebase sync warning:', err);
      return { success: false, count: 0, message: `ফায়ারবেস সিঙ্ক ত্রুটি: ${err.message}` };
    }
  }

  /**
   * সেকশন ৬: ক্যাটাগরিভিত্তিক রোল নম্বর স্বয়ংক্রিয় বরাদ্দ
   */
  allocateRollForApplicant(applicant: Applicant): string {
    const list = this.getApplicants();
    const category = applicant.schoolCategory || 'primary';
    const rollConfigs = this.getRollConfigs();
    const config = rollConfigs[category] || INITIAL_CATEGORY_ROLL_CONFIGS[category];
    return allocateCategoryRoll(category, list, config.initialRoll);
  }

  // --- OFFICIAL SIGNATURES & SEALS ---
  getOfficialSignatures(): OfficialSignatures {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIGNATURES);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_OFFICIAL_SIGNATURES, ...parsed };
      }
      const settings = this.getSettings();
      return { ...DEFAULT_OFFICIAL_SIGNATURES, ...(settings.officialSignatures || {}) };
    } catch {
      return DEFAULT_OFFICIAL_SIGNATURES;
    }
  }

  updateOfficialSignatures(signatures: OfficialSignatures): void {
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(signatures));
    const settings = this.getSettings();
    settings.officialSignatures = signatures;
    this.updateSettings(settings);
    this.addAuditLog('অফিসিয়াল স্বাক্ষর আপডেট', 'SIGNATURES', 'পরীক্ষা নিয়ন্ত্রক/সভাপতি স্বাক্ষর ও সিল হালনাগাদ');
    this.notify();
  }

  updateApplicantStatus(
    id: string,
    status: ApplicantStatus,
    adminNotes?: string,
    performedBy: string = 'অ্যাডমিন'
  ): boolean {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.id === id);
    if (index < 0) return false;

    const applicant = list[index];
    const settings = this.getSettings();
    applicant.status = status;
    if (adminNotes !== undefined) applicant.adminNotes = adminNotes;
    applicant.updatedAt = new Date().toISOString();

    // If approved and payment fulfilled or waived, issue admit card if not already
    if (status === 'approved' && (applicant.paymentStatus === 'paid' || !settings.isFeeRequired)) {
      applicant.admitCardIssued = true;
      if (!applicant.admitCardNo) {
        applicant.admitCardNo = generateAdmitCardNo(applicant.applicationNo);
      }
      if (!applicant.rollNumber) {
        applicant.rollNumber = this.allocateRollForApplicant(applicant);
      }
      if (!applicant.examCenter) {
        applicant.examCenter = settings.examCenters[0] || 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র';
      }
      applicant.examDate = settings.examDate;
      applicant.examTime = settings.examTime;
    }

    list[index] = applicant;
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));
    this.addAuditLog('স্ট্যাটাস পরিবর্তন', applicant.applicationNo, `নতুন স্ট্যাটাস: ${status}. মন্তব্য: ${adminNotes || 'নাই'}`, performedBy);
    this.notify();

    // Persist to Firebase Firestore
    fbSaveApplicant(applicant).catch(() => {});

    updateRemoteApplicantStatus(
      applicant.applicationNo,
      applicant.status,
      applicant.adminNotes,
      applicant.admitCardIssued,
      applicant.admitCardNo,
      applicant.rollNumber
    ).catch(() => {});

    return true;
  }

  updateApplicantPayment(
    id: string,
    paymentStatus: PaymentStatus,
    performedBy: string = 'অ্যাডমিন'
  ): boolean {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.id === id);
    if (index < 0) return false;

    const applicant = list[index];
    applicant.paymentStatus = paymentStatus;
    applicant.updatedAt = new Date().toISOString();

    const settings = this.getSettings();
    if (paymentStatus === 'paid' && applicant.status === 'approved') {
      applicant.admitCardIssued = true;
      if (!applicant.admitCardNo) {
        applicant.admitCardNo = generateAdmitCardNo(applicant.applicationNo);
      }
      if (!applicant.rollNumber) {
        applicant.rollNumber = this.allocateRollForApplicant(applicant);
      }
      if (!applicant.examCenter) {
        applicant.examCenter = settings.examCenters[0];
      }
      applicant.examDate = settings.examDate;
      applicant.examTime = settings.examTime;
    }

    list[index] = applicant;
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));
    this.addAuditLog('পেমেন্ট পরিবর্তন', applicant.applicationNo, `পেমেন্ট স্ট্যাটাস: ${paymentStatus}`, performedBy);
    this.notify();

    // Persist to Firebase Firestore
    fbSaveApplicant(applicant).catch(() => {});

    return true;
  }

  issueAdmitCard(id: string, performedBy: string = 'অ্যাডমিন'): boolean {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.id === id);
    if (index < 0) return false;

    const applicant = list[index];
    const settings = this.getSettings();
    applicant.status = 'approved';
    applicant.admitCardIssued = true;
    if (!applicant.admitCardNo) {
      applicant.admitCardNo = generateAdmitCardNo(applicant.applicationNo);
    }
    if (!applicant.rollNumber) {
      applicant.rollNumber = this.allocateRollForApplicant(applicant);
    }
    if (!applicant.examCenter) {
      applicant.examCenter = settings.examCenters[0];
    }
    applicant.examDate = settings.examDate;
    applicant.examTime = settings.examTime;
    applicant.updatedAt = new Date().toISOString();

    list[index] = applicant;
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));
    this.addAuditLog('প্রবেশপত্র মঞ্জুর', applicant.applicationNo, `রোল: ${applicant.rollNumber}, প্রবেশপত্র নং: ${applicant.admitCardNo}`, performedBy);
    this.notify();

    // Persist to Firebase Firestore
    fbSaveApplicant(applicant).catch(() => {});

    return true;
  }

  recordPayment(
    applicationNo: string,
    amount: number,
    paymentMethod: string,
    transactionId: string
  ): PaymentReceipt | null {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.applicationNo === applicationNo);
    if (index < 0) return null;

    const applicant = list[index];
    applicant.paymentStatus = 'paid';
    applicant.paymentMethod = paymentMethod;
    applicant.transactionId = transactionId;
    applicant.paymentDate = new Date().toISOString().split('T')[0];
    applicant.updatedAt = new Date().toISOString();

    const settings = this.getSettings();
    if (applicant.status === 'approved') {
      applicant.admitCardIssued = true;
      if (!applicant.admitCardNo) {
        applicant.admitCardNo = generateAdmitCardNo(applicant.applicationNo);
      }
      if (!applicant.rollNumber) {
        applicant.rollNumber = this.allocateRollForApplicant(applicant);
      }
      applicant.examCenter = applicant.examCenter || settings.examCenters[0];
      applicant.examDate = settings.examDate;
      applicant.examTime = settings.examTime;
    }

    list[index] = applicant;
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));

    const receipt: PaymentReceipt = {
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      applicationNo: applicant.applicationNo,
      applicantName: applicant.nameBn,
      schoolName: applicant.schoolName,
      className: applicant.className,
      amount,
      paymentMethod,
      transactionId,
      paidAt: new Date().toLocaleString('bn-BD'),
      status: 'সফল'
    };

    const receipts = this.getReceipts();
    receipts.unshift(receipt);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));

    this.addAuditLog('পেমেন্ট গ্রহণ', applicant.applicationNo, `পরিমাণ: ৳${amount}, মেথড: ${paymentMethod}, ট্রানজ্যাকশন: ${transactionId}`);
    this.notify();

    // Persist applicant and receipt to Firebase Firestore
    fbSaveApplicant(applicant).catch(() => {});
    fbSaveReceipt(receipt).catch(() => {});
    pushReceiptToSupabase(receipt).catch(() => {});
    return receipt;
  }

  getReceipts(): PaymentReceipt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getReceiptByAppNo(applicationNo: string): PaymentReceipt | undefined {
    return this.getReceipts().find(r => r.applicationNo === applicationNo);
  }

  recordPendingPayment(
    applicationNo: string,
    amount: number,
    paymentMethod: string,
    transactionId: string,
    paymentSenderMobile: string,
    studentCount: number = 1
  ): PaymentReceipt | null {
    const list = this.getApplicants();
    const index = list.findIndex(a => a.applicationNo === applicationNo);
    if (index < 0) return null;

    const applicant = list[index];
    applicant.paymentStatus = 'pending';
    applicant.status = 'under_review';
    applicant.paymentMethod = paymentMethod;
    applicant.transactionId = transactionId || 'ক্যাশ আউট (অপেক্ষমাণ)';
    applicant.paymentSenderMobile = paymentSenderMobile;
    applicant.paymentDate = new Date().toISOString().split('T')[0];
    applicant.updatedAt = new Date().toISOString();

    list[index] = applicant;
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));

    const receipt: PaymentReceipt = {
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      applicationNo: applicant.applicationNo,
      applicantName: applicant.nameBn,
      schoolName: applicant.schoolName,
      className: applicant.className,
      amount,
      paymentMethod,
      transactionId: transactionId || 'ক্যাশ আউট (যাচাইাধীন)',
      paymentSenderMobile,
      paidAt: new Date().toLocaleString('bn-BD'),
      status: 'অপেক্ষমাণ',
      studentCount
    };

    const receipts = this.getReceipts().filter(r => r.applicationNo !== applicationNo);
    receipts.unshift(receipt);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));

    this.addAuditLog(
      'পেমেন্ট দাখিল (অপেক্ষমাণ)',
      applicant.applicationNo,
      `ক্যাশ আউট নম্বর: ${paymentSenderMobile}, পরিমাণ: ৳${amount}, ট্রানজ্যাকশন: ${transactionId || 'দেওয়া হয়নি'}`
    );
    this.notify();

    // Persist applicant and pending receipt to Firebase Cloud Firestore
    fbSaveApplicant(applicant).catch(() => {});
    fbSaveReceipt(receipt).catch(() => {});

    return receipt;
  }

  approvePayment(
    applicationNo: string,
    adminName: string = 'প্রধান প্রশাসক'
  ): { success: boolean; message: string; approvedCount: number } {
    const list = this.getApplicants();
    const targetIdx = list.findIndex(a => a.applicationNo === applicationNo);
    if (targetIdx < 0) {
      return { success: false, message: 'আবেদন পাওয়া যায়নি।', approvedCount: 0 };
    }

    const target = list[targetIdx];
    const settings = this.getSettings();

    // Find all applicants belonging to the same batch submission or same sender+school if submitted together
    const matchingApplicants = list.filter(a => {
      if (a.applicationNo === applicationNo) return true;
      if (target.batchSubmissionId && a.batchSubmissionId === target.batchSubmissionId) return true;
      if (
        target.paymentSenderMobile &&
        a.paymentSenderMobile === target.paymentSenderMobile &&
        a.schoolName === target.schoolName &&
        a.paymentStatus === 'pending'
      ) {
        return true;
      }
      return false;
    });

    let approvedCount = 0;
    matchingApplicants.forEach(app => {
      const idx = list.findIndex(a => a.id === app.id);
      if (idx >= 0) {
        list[idx].paymentStatus = 'paid';
        list[idx].status = 'approved';
        list[idx].admitCardIssued = true;
        if (!list[idx].admitCardNo) {
          list[idx].admitCardNo = generateAdmitCardNo(list[idx].applicationNo);
        }
        if (!list[idx].rollNumber) {
          list[idx].rollNumber = this.allocateRollForApplicant(list[idx]);
        }
        if (!list[idx].examCenter) {
          list[idx].examCenter = settings.examCenters[0];
        }
        list[idx].examDate = settings.examDate;
        list[idx].examTime = settings.examTime;
        list[idx].updatedAt = new Date().toISOString();

        fbSaveApplicant(list[idx]).catch(() => {});
        approvedCount++;
      }
    });

    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));

    // Update Receipts
    const receipts = this.getReceipts();
    let receiptFound = false;
    receipts.forEach(r => {
      if (r.applicationNo === target.applicationNo || matchingApplicants.some(m => m.applicationNo === r.applicationNo)) {
        r.status = 'সফল';
        r.approvedAt = new Date().toLocaleString('bn-BD');
        r.approvedBy = adminName;
        fbSaveReceipt(r).catch(() => {});
        receiptFound = true;
      }
    });

    if (!receiptFound) {
      // Create approved receipt if one was not created earlier
      const newRec: PaymentReceipt = {
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        applicationNo: target.applicationNo,
        applicantName: target.nameBn,
        schoolName: target.schoolName,
        className: target.className,
        amount: matchingApplicants.length * (settings.feeAmount || 100),
        paymentMethod: target.paymentMethod || 'বিকাশ এজেন্ট ক্যাশ আউট',
        transactionId: target.transactionId || 'ক্যাশ আউট অনুমোদিত',
        paymentSenderMobile: target.paymentSenderMobile,
        paidAt: new Date().toLocaleString('bn-BD'),
        status: 'সফল',
        approvedAt: new Date().toLocaleString('bn-BD'),
        approvedBy: adminName,
        studentCount: matchingApplicants.length
      };
      receipts.unshift(newRec);
      fbSaveReceipt(newRec).catch(() => {});
    }

    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));

    this.addAuditLog(
      'পেমেন্ট অনুমোদন সম্পন্ন',
      target.applicationNo,
      `ক্যাশ আউট নম্বর: ${target.paymentSenderMobile || 'নাই'}, অনুমোদিত শিক্ষার্থী: ${approvedCount} জন`,
      adminName
    );
    this.notify();

    return {
      success: true,
      message: `${approvedCount} জন শিক্ষার্থীর ফি ও আবেদন সফলভাবে অনুমোদিত হয়েছে। এখন মানি রসিদ ও প্রবেশপত্র ডাউনলোডের জন্য উন্মুক্ত।`,
      approvedCount
    };
  }

  rejectPayment(
    applicationNo: string,
    reason?: string,
    adminName: string = 'প্রধান প্রশাসক'
  ): { success: boolean; message: string } {
    const list = this.getApplicants();
    const targetIdx = list.findIndex(a => a.applicationNo === applicationNo);
    if (targetIdx < 0) {
      return { success: false, message: 'আবেদন পাওয়া যায়নি।' };
    }

    const target = list[targetIdx];
    target.paymentStatus = 'unpaid';
    target.status = 'under_review';
    target.adminNotes = reason || 'পেমেন্ট তথ্যে অসংগতি পাওয়া গেছে।';
    target.updatedAt = new Date().toISOString();
    list[targetIdx] = target;
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(list));

    const receipts = this.getReceipts();
    receipts.forEach(r => {
      if (r.applicationNo === applicationNo) {
        r.status = 'ব্যর্থ';
        fbSaveReceipt(r).catch(() => {});
      }
    });
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));

    this.addAuditLog(
      'পেমেন্ট বাতিল/প্রত্যাখ্যান',
      target.applicationNo,
      `কারণ: ${reason || 'অসংগতি'}`,
      adminName
    );
    this.notify();
    fbSaveApplicant(target).catch(() => {});

    return { success: true, message: 'পেমেন্ট প্রত্যাখ্যান করা হয়েছে।' };
  }

  // --- SETTINGS ---
  getSettings(): ExamSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(data);
      if (!parsed.categoryRollConfigs) {
        parsed.categoryRollConfigs = INITIAL_CATEGORY_ROLL_CONFIGS;
      }
      if (!parsed.admitCardAvailableDate) {
        parsed.admitCardAvailableDate = DEFAULT_SETTINGS.admitCardAvailableDate || '2026-11-06T09:00';
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(settings: ExamSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.addAuditLog('সেটিংস পরিবর্তন', 'SYSTEM', 'পরীক্ষা ও আবেদন কনফিগারেশন আপডেট করা হয়েছে');
    this.notify();
    fbSaveSetting('exam_settings', settings).catch(() => {});
  }

  // --- ADMIT CARD DESIGN & CUSTOMIZATION ENGINE ---
  getAdmitCardDesign(): AdmitCardDesign {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIT_DESIGN);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ADMIT_DESIGN, JSON.stringify(DEFAULT_ADMIT_CARD_DESIGN));
        return DEFAULT_ADMIT_CARD_DESIGN;
      }
      const parsed: AdmitCardDesign = JSON.parse(data);
      // Ensure any newly added fields have defaults
      const merged: AdmitCardDesign = { ...DEFAULT_ADMIT_CARD_DESIGN, ...parsed };
      if (!merged.schoolInstructions || merged.schoolInstructions.length === 0) {
        merged.schoolInstructions = DEFAULT_ADMIT_CARD_DESIGN.schoolInstructions;
      }
      if (!merged.madrasaInstructions || merged.madrasaInstructions.length === 0) {
        merged.madrasaInstructions = DEFAULT_ADMIT_CARD_DESIGN.madrasaInstructions;
      }
      if (!merged.schoolInstructionsTitle) {
        merged.schoolInstructionsTitle = DEFAULT_ADMIT_CARD_DESIGN.schoolInstructionsTitle;
      }
      if (!merged.madrasaInstructionsTitle) {
        merged.madrasaInstructionsTitle = DEFAULT_ADMIT_CARD_DESIGN.madrasaInstructionsTitle;
      }
      // Guarantee authentic uploaded real signatures for Shovapoti & Secretary
      if (!merged.presidentSignatureUrl || merged.presidentSignatureUrl.startsWith('data:image/svg')) {
        merged.presidentSignatureUrl = '/assets/signatures/shovapoti_sign.jpg';
      }
      if (!merged.secretarySignatureUrl || merged.secretarySignatureUrl.startsWith('data:image/svg')) {
        merged.secretarySignatureUrl = '/assets/signatures/secretary_sign.jpg';
      }
      if (merged.watermarkEnabled === undefined) merged.watermarkEnabled = true;
      if (merged.showSeal === undefined) merged.showSeal = true;
      if (merged.showCandidateSignSlot === undefined) merged.showCandidateSignSlot = true;
      return merged;
    } catch {
      return DEFAULT_ADMIT_CARD_DESIGN;
    }
  }

  updateAdmitCardDesign(design: Partial<AdmitCardDesign>): AdmitCardDesign {
    const current = this.getAdmitCardDesign();
    const updated: AdmitCardDesign = { ...current, ...design };
    localStorage.setItem(STORAGE_KEYS.ADMIT_DESIGN, JSON.stringify(updated));
    this.addAuditLog('প্রবেশপত্র ডিজাইন পরিবর্তন', 'SYSTEM', 'প্রবেশপত্র টেমপ্লেট ও স্বাক্ষর আপডেট করা হয়েছে');
    this.notify();
    fbSaveSetting('admit_design', updated).catch(() => {});
    return updated;
  }

  resetAdmitCardDesign(): AdmitCardDesign {
    localStorage.setItem(STORAGE_KEYS.ADMIT_DESIGN, JSON.stringify(DEFAULT_ADMIT_CARD_DESIGN));
    this.addAuditLog('প্রবেশপত্র ডিজাইন রিসেট', 'SYSTEM', 'প্রবেশপত্র ডিজাইন ডিফল্ট অবস্থায় ফিরিয়ে নেওয়া হয়েছে');
    this.notify();
    fbSaveSetting('admit_design', DEFAULT_ADMIT_CARD_DESIGN).catch(() => {});
    return DEFAULT_ADMIT_CARD_DESIGN;
  }

  // --- WEBSITE VISUAL & CONTENT EDITOR ---
  getWebsiteEditorConfig(): WebsiteEditorConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEBSITE_EDITOR);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WEBSITE_EDITOR, JSON.stringify(DEFAULT_WEBSITE_EDITOR_CONFIG));
        return DEFAULT_WEBSITE_EDITOR_CONFIG;
      }
      const parsed: WebsiteEditorConfig = JSON.parse(data);
      // Deep merge with defaults so newly added nested fields aren't missing
      return {
        theme: { ...DEFAULT_WEBSITE_EDITOR_CONFIG.theme, ...(parsed.theme || {}) },
        icons: { ...DEFAULT_WEBSITE_EDITOR_CONFIG.icons, ...(parsed.icons || {}) },
        hero: { ...DEFAULT_WEBSITE_EDITOR_CONFIG.hero, ...(parsed.hero || {}) },
        nitimala: {
          ...DEFAULT_WEBSITE_EDITOR_CONFIG.nitimala,
          ...(parsed.nitimala || {}),
          officialRules: parsed.nitimala?.officialRules?.length ? parsed.nitimala.officialRules : DEFAULT_WEBSITE_EDITOR_CONFIG.nitimala.officialRules,
          schoolSubjects: parsed.nitimala?.schoolSubjects?.length ? parsed.nitimala.schoolSubjects : DEFAULT_WEBSITE_EDITOR_CONFIG.nitimala.schoolSubjects,
          madrasaSubjects: parsed.nitimala?.madrasaSubjects?.length ? parsed.nitimala.madrasaSubjects : DEFAULT_WEBSITE_EDITOR_CONFIG.nitimala.madrasaSubjects,
        },
        footer: { ...DEFAULT_WEBSITE_EDITOR_CONFIG.footer, ...(parsed.footer || {}) },
        features: {
          ...DEFAULT_WEBSITE_EDITOR_CONFIG.features!,
          ...(parsed.features || {}),
          tickerSpeed: parsed.features?.tickerSpeed || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.tickerSpeed,
          tickerEnabled: parsed.features?.tickerEnabled ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.tickerEnabled,
          tickerPrefix: parsed.features?.tickerPrefix || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.tickerPrefix,
          showCountdownTimer: parsed.features?.showCountdownTimer ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.showCountdownTimer,
          countdownTitle: parsed.features?.countdownTitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.countdownTitle,
          countdownTargetDate: parsed.features?.countdownTargetDate || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.countdownTargetDate,
          showFloatingHelpline: parsed.features?.showFloatingHelpline ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.showFloatingHelpline,
          floatingHelplineNumber: parsed.features?.floatingHelplineNumber || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.floatingHelplineNumber,
          floatingHelplineText: parsed.features?.floatingHelplineText || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.floatingHelplineText,
          floatingHelplinePosition: parsed.features?.floatingHelplinePosition || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.floatingHelplinePosition,
          showFaqSection: parsed.features?.showFaqSection ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.showFaqSection,
          faqsTitle: parsed.features?.faqsTitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.faqsTitle,
          statsCountersEnabled: parsed.features?.statsCountersEnabled ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.statsCountersEnabled,
          statsTitle: parsed.features?.statsTitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.statsTitle,
          awardsEnabled: parsed.features?.awardsEnabled ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.awardsEnabled,
          awardsTitle: parsed.features?.awardsTitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.awardsTitle,
          awardsSubtitle: parsed.features?.awardsSubtitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.awardsSubtitle,
          examCentersEnabled: parsed.features?.examCentersEnabled ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.examCentersEnabled,
          examCentersTitle: parsed.features?.examCentersTitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.examCentersTitle,
          galleryCountOnHome: parsed.features?.galleryCountOnHome ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.galleryCountOnHome,
          gallerySectionTitle: parsed.features?.gallerySectionTitle || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.gallerySectionTitle,
          galleryColumns: parsed.features?.galleryColumns ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.galleryColumns,
          galleryShowCaptions: parsed.features?.galleryShowCaptions ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.galleryShowCaptions,
          noticeDisplayLimit: parsed.features?.noticeDisplayLimit ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.noticeDisplayLimit,
          noticeBadgeText: parsed.features?.noticeBadgeText || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.noticeBadgeText,
          noticeHighlightPinned: parsed.features?.noticeHighlightPinned ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.noticeHighlightPinned,
          contactHelplinePhone: parsed.features?.contactHelplinePhone || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.contactHelplinePhone,
          contactEmailText: parsed.features?.contactEmailText || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.contactEmailText,
          emergencyBanner: {
            enabled: parsed.features?.emergencyBanner?.enabled ?? DEFAULT_WEBSITE_EDITOR_CONFIG.features!.emergencyBanner.enabled ?? false,
            message: parsed.features?.emergencyBanner?.message || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.emergencyBanner.message || '',
            type: parsed.features?.emergencyBanner?.type || DEFAULT_WEBSITE_EDITOR_CONFIG.features!.emergencyBanner.type || 'info',
            actionText: parsed.features?.emergencyBanner?.actionText,
            actionUrl: parsed.features?.emergencyBanner?.actionUrl
          },
          faqs: parsed.features?.faqs?.length ? parsed.features.faqs : (DEFAULT_WEBSITE_EDITOR_CONFIG.features!.faqs || []),
          stats: parsed.features?.stats?.length ? parsed.features.stats : (DEFAULT_WEBSITE_EDITOR_CONFIG.features!.stats || []),
          awards: parsed.features?.awards?.length ? parsed.features.awards : (DEFAULT_WEBSITE_EDITOR_CONFIG.features!.awards || []),
          examCenters: parsed.features?.examCenters?.length ? parsed.features.examCenters : (DEFAULT_WEBSITE_EDITOR_CONFIG.features!.examCenters || [])
        },
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    } catch {
      return DEFAULT_WEBSITE_EDITOR_CONFIG;
    }
  }

  updateWebsiteEditorConfig(config: Partial<WebsiteEditorConfig>): WebsiteEditorConfig {
    const current = this.getWebsiteEditorConfig();
    const curFeat = current.features || DEFAULT_WEBSITE_EDITOR_CONFIG.features!;
    const newFeat: Partial<WebsiteFeaturesConfig> = config.features || {};
    const updated: WebsiteEditorConfig = {
      ...current,
      ...config,
      theme: { ...current.theme, ...(config.theme || {}) },
      icons: { ...current.icons, ...(config.icons || {}) },
      hero: { ...current.hero, ...(config.hero || {}) },
      nitimala: {
        ...current.nitimala,
        ...(config.nitimala || {}),
        officialRules: config.nitimala?.officialRules || current.nitimala.officialRules,
        schoolSubjects: config.nitimala?.schoolSubjects || current.nitimala.schoolSubjects,
        madrasaSubjects: config.nitimala?.madrasaSubjects || current.nitimala.madrasaSubjects,
      },
      footer: { ...current.footer, ...(config.footer || {}) },
      features: {
        ...curFeat,
        ...newFeat,
        tickerSpeed: newFeat.tickerSpeed || curFeat.tickerSpeed,
        emergencyBanner: {
          enabled: newFeat.emergencyBanner?.enabled ?? curFeat.emergencyBanner.enabled,
          message: newFeat.emergencyBanner?.message ?? curFeat.emergencyBanner.message,
          type: newFeat.emergencyBanner?.type ?? curFeat.emergencyBanner.type,
          actionText: newFeat.emergencyBanner?.actionText ?? curFeat.emergencyBanner.actionText,
          actionUrl: newFeat.emergencyBanner?.actionUrl ?? curFeat.emergencyBanner.actionUrl
        },
        faqs: newFeat.faqs || curFeat.faqs || [],
        stats: newFeat.stats || curFeat.stats || [],
        awards: newFeat.awards || curFeat.awards || [],
        examCenters: newFeat.examCenters || curFeat.examCenters || []
      },
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.WEBSITE_EDITOR, JSON.stringify(updated));
    this.addAuditLog('ওয়েবসাইট এডিটর পরিবর্তন', 'SYSTEM', 'ওয়েবসাইট কনটেন্ট, কালার প্যালেট ও সিলেবাস আপডেট করা হয়েছে');
    this.notify();
    fbSaveSetting('website_config', updated).catch(() => {});
    return updated;
  }

  resetWebsiteEditorConfig(): WebsiteEditorConfig {
    localStorage.setItem(STORAGE_KEYS.WEBSITE_EDITOR, JSON.stringify(DEFAULT_WEBSITE_EDITOR_CONFIG));
    this.addAuditLog('ওয়েবসাইট এডিটর রিসেট', 'SYSTEM', 'ওয়েবসাইট ডিজাইন ও কনটেন্ট ডিফল্ট অবস্থায় ফিরিয়ে নেওয়া হয়েছে');
    this.notify();
    fbSaveSetting('website_config', DEFAULT_WEBSITE_EDITOR_CONFIG).catch(() => {});
    return DEFAULT_WEBSITE_EDITOR_CONFIG;
  }

  // --- DYNAMIC CAMPAIGNS (Section 3 & 4) ---
  getCampaigns(): Campaign[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
        return INITIAL_CAMPAIGNS;
      }
      const parsed: Campaign[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.getCampaigns().find(c => c.id === id || c.slug === id);
  }

  getFeaturedCampaign(): Campaign {
    const campaigns = this.getCampaigns();
    const featured = campaigns.find(c => c.isFeaturedOnHome);
    return featured || campaigns[0] || INITIAL_CAMPAIGNS[0];
  }

  saveCampaign(campaign: Campaign): void {
    let list = this.getCampaigns();
    if (campaign.isFeaturedOnHome) {
      list.forEach(c => {
        if (c.id !== campaign.id) {
          c.isFeaturedOnHome = false;
        }
      });
    }
    const idx = list.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      list[idx] = campaign;
      if (campaign.isFeaturedOnHome) {
        const [feat] = list.splice(idx, 1);
        list.unshift(feat);
      }
    } else {
      if (campaign.isFeaturedOnHome) {
        list.unshift(campaign);
      } else {
        list.push(campaign);
      }
    }
    if (!list.some(c => c.isFeaturedOnHome) && list.length > 0) {
      list[0].isFeaturedOnHome = true;
    }
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(list));
    this.addAuditLog('ক্যাম্পেইন আপডেট', campaign.id, `ক্যাম্পেইন: ${campaign.title}`);
    this.notify();
    fbSaveCampaign(campaign).catch(() => {});
  }

  // --- RECOGNIZED SCHOOLS & QUOTAS (Section 5) ---
  getRecognizedSchools(): RecognizedSchool[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_RECOGNIZED_SCHOOLS));
        return INITIAL_RECOGNIZED_SCHOOLS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_RECOGNIZED_SCHOOLS;
    }
  }

  saveRecognizedSchool(school: RecognizedSchool): void {
    const list = this.getRecognizedSchools();
    const idx = list.findIndex(s => s.id === school.id);
    if (idx >= 0) {
      list[idx] = school;
    } else {
      list.push(school);
    }
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(list));
    this.addAuditLog('প্রতিষ্ঠান আপডেট', school.id, `স্কুল: ${school.name}`);
    this.notify();
    fbSaveSchool(school).catch(() => {});
  }

  deleteRecognizedSchool(id: string): void {
    const list = this.getRecognizedSchools().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(list));
    this.addAuditLog('প্রতিষ্ঠান মুছে ফেলা', id, 'স্কুল তালিকা থেকে অপসারিত');
    this.notify();
    fbDeleteSchool(id).catch(() => {});
  }

  getSchoolRemainingSlots(schoolName: string): { total: number; filled: number; remaining: number } {
    const applicants = this.getApplicants();
    const quota = checkSchoolQuota(schoolName, applicants);
    return {
      total: quota.max,
      filled: quota.count,
      remaining: quota.remaining
    };
  }

  // --- ROLL CONFIGURATION (Section 6) ---
  getRollConfigs(): Record<SchoolCategory, CategoryRollConfig> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROLL_CONFIGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ROLL_CONFIGS, JSON.stringify(INITIAL_CATEGORY_ROLL_CONFIGS));
        return INITIAL_CATEGORY_ROLL_CONFIGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CATEGORY_ROLL_CONFIGS;
    }
  }

  saveRollConfigs(configs: Record<SchoolCategory, CategoryRollConfig>): void {
    localStorage.setItem(STORAGE_KEYS.ROLL_CONFIGS, JSON.stringify(configs));
    this.addAuditLog('রোল কনফিগারেশন আপডেট', 'SYSTEM', 'ক্যাটাগরি রোল নম্বর সীমা আপডেট করা হয়েছে');
    this.notify();
  }

  // --- COMMITTEE MEMBERS (Section 12) ---
  getCommitteeMembers(): CommitteeMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMITTEE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(INITIAL_COMMITTEE_MEMBERS));
        return INITIAL_COMMITTEE_MEMBERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COMMITTEE_MEMBERS;
    }
  }

  saveCommitteeMember(member: CommitteeMember): void {
    const list = this.getCommitteeMembers();
    const idx = list.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      list[idx] = member;
    } else {
      list.push(member);
    }
    // Sort by order
    list.sort((a, b) => a.order - b.order);
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(list));
    this.addAuditLog('কমিটি সদস্য আপডেট', member.id, `সদস্য: ${member.name}, পদবি: ${member.designation}`);
    this.notify();
    fbSaveCommitteeMember(member).catch(() => {});
  }

  deleteCommitteeMember(id: string): void {
    const list = this.getCommitteeMembers().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(list));
    this.addAuditLog('কমিটি সদস্য অপসারণ', id, 'কমিটি থেকে অপসারিত');
    this.notify();
    fbDeleteCommitteeMember(id).catch(() => {});
  }

  // --- GALLERY MEDIA (PHOTOS & VIDEOS) ---
  getGalleryItems(): GalleryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(INITIAL_GALLERY_ITEMS));
        return INITIAL_GALLERY_ITEMS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_GALLERY_ITEMS;
    } catch {
      return INITIAL_GALLERY_ITEMS;
    }
  }

  saveGalleryItem(item: GalleryItem): void {
    const list = this.getGalleryItems();
    const idx = list.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(list));
    this.addAuditLog('গ্যালারি মিডিয়া আপডেট', item.id, `শিরোনাম: ${item.titleBn}, ধরন: ${item.type}`);
    this.notify();
    fbSaveGalleryItem(item).catch((err) => console.warn('Firebase save gallery error:', err));
  }

  deleteGalleryItem(id: string): void {
    const list = this.getGalleryItems();
    const itemToDelete = list.find(g => g.id === id);
    const filtered = list.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(filtered));
    this.addAuditLog('গ্যালারি মিডিয়া অপসারণ', id, 'গ্যালারি আইটেম মুছে ফেলা হয়েছে');
    this.notify();

    // 1. Delete Firestore record
    fbDeleteGalleryItem(id).catch((err) => console.warn('Firebase delete gallery error:', err));

    // 2. Delete underlying physical file if uploaded to server
    if (itemToDelete?.mediaUrl) {
      fbDeleteMediaFile(itemToDelete.mediaUrl).catch(() => {});
    }
  }

  toggleGalleryFeatured(id: string): void {
    const list = this.getGalleryItems();
    const item = list.find(g => g.id === id);
    if (item) {
      item.isFeaturedOnHome = !item.isFeaturedOnHome;
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(list));
      this.notify();
      fbSaveGalleryItem(item).catch(() => {});
    }
  }

  // --- NOTICES ---
  getNotices(): Notice[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
        return INITIAL_NOTICES;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_NOTICES;
    } catch {
      return INITIAL_NOTICES;
    }
  }

  saveNotice(notice: Notice): void {
    const list = this.getNotices();
    const index = list.findIndex(n => n.id === notice.id);
    if (index >= 0) {
      list[index] = notice;
    } else {
      list.unshift(notice);
    }
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(list));
    this.addAuditLog('বিজ্ঞপ্তি প্রকাশ/আপডেট', notice.id, `শিরোনাম: ${notice.title}`);
    this.notify();
    fbSaveNotice(notice).catch(err => console.warn('Firebase save notice error:', err));
  }

  deleteNotice(id: string): void {
    const list = this.getNotices().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(list));
    this.addAuditLog('বিজ্ঞপ্তি মুছে ফেলা', id, 'বিজ্ঞপ্তি অপসারিত হয়েছে');
    this.notify();
    fbDeleteNotice(id).catch(err => console.warn('Firebase delete notice error:', err));
  }

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addAuditLog(action: string, targetId: string, details: string, performedBy: string = 'অ্যাডমিন'): void {
    const logs = this.getAuditLogs();
    const entry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      targetId,
      details,
      performedBy
    };
    logs.unshift(entry);
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));

    pushAuditLogToSupabase(entry).catch(() => {});
  }

  // --- ADMIN AUTH & BOOTSTRAP (Section 9) ---
  getBootstrapState(): { 
    isInitialized: boolean; 
    adminUsername: string; 
    passwordHash: string; 
    requires2FA: boolean; 
    twoFactorEmail?: string;
    resetCode?: string;
    resetCodeExpiry?: number;
    failedAttempts?: number;
    lockedUntil?: number;
  } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOTSTRAP_STATE);
      if (!data) {
        const initial = {
          isInitialized: true,
          adminUsername: 'admin',
          passwordHash: 'adminadmin123', // default administrative password
          requires2FA: false,
          twoFactorEmail: 'admin@al-ikhwan-bd.org',
          failedAttempts: 0,
        };
        localStorage.setItem(STORAGE_KEYS.BOOTSTRAP_STATE, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(data);
      if (!parsed.passwordHash || parsed.passwordHash === '123456' || parsed.passwordHash === 'alikhwan2026') {
        parsed.passwordHash = 'adminadmin123';
        localStorage.setItem(STORAGE_KEYS.BOOTSTRAP_STATE, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return {
        isInitialized: true,
        adminUsername: 'admin',
        passwordHash: 'adminadmin123',
        requires2FA: false
      };
    }
  }

  saveBootstrapState(state: any): void {
    localStorage.setItem(STORAGE_KEYS.BOOTSTRAP_STATE, JSON.stringify(state));
    this.notify();
    fbSaveSetting('admin_security', { passwordHash: state.passwordHash, isInitialized: state.isInitialized }).catch(() => {});
  }

  validateAdminLogin(password: string): { success: boolean; isFirstTime: boolean; error?: string } {
    const state = this.getBootstrapState();
    const now = Date.now();

    // Check rate-limit lock
    if (state.lockedUntil && state.lockedUntil > now) {
      const waitSec = Math.ceil((state.lockedUntil - now) / 1000);
      return {
        success: false,
        isFirstTime: false,
        error: `একাধিক ভুল চেষ্টার কারণে লগইন সাময়িকভাবে লক রয়েছে। অনুগ্রহ করে ${waitSec} সেকেন্ড পর চেষ্টা করুন।`
      };
    }

    const trimmed = (password || '').trim();
    // Default password is 'adminadmin123'. Once updated on dashboard, ONLY the new password is valid.
    const effectivePassword = state.passwordHash || 'adminadmin123';
    const isMatch = trimmed === effectivePassword;

    if (isMatch) {
      state.failedAttempts = 0;
      state.lockedUntil = undefined;
      this.saveBootstrapState(state);
      this.addAuditLog('প্রশাসনিক লগইন', 'AUTH', 'অনুমোদিত প্রশাসক সফলভাবে লগইন করেছেন');
      return { success: true, isFirstTime: false };
    }

    // Attempt count check
    const attempts = (state.failedAttempts || 0) + 1;
    state.failedAttempts = attempts;
    if (attempts >= 8) {
      state.lockedUntil = now + 45 * 1000; // 45 seconds lockout
      state.failedAttempts = 0;
      this.saveBootstrapState(state);
      this.addAuditLog('নিরাপত্তা লকআউট', 'AUTH', 'ব্যর্থ চেষ্টার কারণে লকআউট সক্রিয় হয়েছে');
      return {
        success: false,
        isFirstTime: false,
        error: 'ভুল পাসওয়ার্ড দেওয়ার কারণে অ্যাকাউন্টটি সাময়িকভাবে লক করা হয়েছে।'
      };
    }

    this.saveBootstrapState(state);
    return {
      success: false,
      isFirstTime: false,
      error: `পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন (ভুল প্রচেষ্টা: ${attempts}/৮)`
    };
  }

  completeBootstrapSetup(newPassword: string, recoveryEmail?: string, requires2FA?: boolean): void {
    const state = this.getBootstrapState();
    state.isInitialized = true;
    state.passwordHash = newPassword.trim();
    state.twoFactorEmail = recoveryEmail || 'admin@al-ikhwan-bd.org';
    state.requires2FA = false;
    state.failedAttempts = 0;
    state.lockedUntil = undefined;
    this.saveBootstrapState(state);
    this.addAuditLog('প্রাথমিক নিরাপত্তা সেটআপ সম্পন্ন', 'AUTH', 'অ্যাডমিন প্রাথমিক পাসওয়ার্ড সেটআপ সম্পন্ন করেছেন');
  }

  changeAdminPassword(oldPass: string, newPass: string): { success: boolean; error?: string } {
    const state = this.getBootstrapState();
    const currentPass = state.passwordHash || 'adminadmin123';
    if (currentPass !== oldPass.trim()) {
      return { success: false, error: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }
    state.passwordHash = newPass.trim();
    state.isInitialized = true;
    this.saveBootstrapState(state);
    this.addAuditLog('পাসওয়ার্ড পরিবর্তন', 'AUTH', 'অ্যাডমিন ড্যাশবোর্ড থেকে নিজস্ব পাসওয়ার্ড সফলভাবে পরিবর্তন করেছেন');
    return { success: true };
  }

  resetPasswordWithMasterKey(masterKeyOrPin: string, newPass: string): { success: boolean; error?: string } {
    const trimmed = masterKeyOrPin.trim();
    const validKeys = ['ALIKHWAN-RECOVERY-2026', 'adminadmin123'];
    if (!validKeys.includes(trimmed)) {
      return { success: false, error: 'মাস্টার রিকভারি কি (Master Security Key) অথবা প্রাথমিক পিন সঠিক নয়!' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }

    const state = this.getBootstrapState();
    state.passwordHash = newPass;
    state.failedAttempts = 0;
    state.lockedUntil = undefined;
    this.saveBootstrapState(state);
    this.addAuditLog('পাসওয়ার্ড পুনর্নির্ধারণ', 'AUTH', 'মাস্টার রিকভারি কি দিয়ে পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
    return { success: true };
  }

  resetPasswordWithCode(code: string, newPass: string): { success: boolean; error?: string } {
    const state = this.getBootstrapState();
    if (!state.resetCode || state.resetCode !== code.trim()) {
      return { success: false, error: 'ভুল ভেরিফিকেশন কোড!' };
    }
    if (!state.resetCodeExpiry || Date.now() > state.resetCodeExpiry) {
      return { success: false, error: 'ভেরিফিকেশন কোডের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার কোড চান।' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }

    state.passwordHash = newPass;
    state.resetCode = undefined;
    state.resetCodeExpiry = undefined;
    state.failedAttempts = 0;
    state.lockedUntil = undefined;
    this.saveBootstrapState(state);
    this.addAuditLog('পাসওয়ার্ড পুনর্নির্ধারণ', 'AUTH', 'ভেরিফিকেশন কোড দিয়ে পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
    return { success: true };
  }

  deleteCampaign(id: string): void {
    let list = this.getCampaigns().filter(c => c.id !== id);
    if (!list.some(c => c.isFeaturedOnHome) && list.length > 0) {
      list[0].isFeaturedOnHome = true;
    }
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(list));
    this.addAuditLog('ক্যাম্পেইন অপসারণ', id, 'ক্যাম্পেইন তালিকা থেকে অপসারিত');
    this.notify();
    fbDeleteCampaign(id).catch(err => console.warn('Firebase delete campaign error:', err));
  }

  // --- CSV EXPORT ---
  exportApplicantsCSV(applicants: Applicant[]): string {
    const headers = [
      'আবেদন নং',
      'রোল নং',
      'প্রবেশপত্র নং',
      'নাম (বাংলা)',
      'নাম (ইংরেজি)',
      'লিঙ্গ',
      'জন্ম তারিখ',
      'পিতার নাম',
      'মাতার নাম',
      'অভিভাবকের মোবাইল',
      'ক্যাশ আউট নম্বর (যেখান থেকে ফি এসেছে)',
      'ট্রানজ্যাকশন আইডি (TrxID)',
      'প্রধান শিক্ষকের মোবাইল (WhatsApp)',
      'বিদ্যালয়',
      'প্রতিষ্ঠানের ঠিকানা',
      'ক্যাটাগরি',
      'শ্রেণি',
      'উপজেলা',
      'স্ট্যাটাস',
      'পেমেন্ট স্ট্যাটাস',
      'তৈরির তারিখ'
    ];

    const categoryNames: Record<string, string> = {
      primary: 'সরকারি প্রাথমিক বিদ্যালয়',
      kindergarten: 'কিন্ডারগার্টেন',
      madrasa: 'ইবতেদায়ী / মাদ্রাসা'
    };

    const statusNames: Record<string, string> = {
      submitted: 'নতুন আবেদন',
      under_review: 'যাচাইাধীন',
      approved: 'অনুমোদিত',
      rejected: 'বাতিল'
    };

    const paymentStatusNames: Record<string, string> = {
      paid: 'পরিশোধিত',
      unpaid: 'অপরিশোধিত',
      waived: 'মওকুফ'
    };

    const escapeCSV = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = applicants.map(a => [
      escapeCSV(a.applicationNo),
      escapeCSV(a.rollNumber || '-'),
      escapeCSV(a.admitCardNo || '-'),
      escapeCSV(a.nameBn),
      escapeCSV(a.nameEn),
      escapeCSV(a.gender),
      escapeCSV(a.dob),
      escapeCSV(a.fatherName),
      escapeCSV(a.motherName),
      escapeCSV(a.mobile),
      escapeCSV(a.paymentSenderMobile || '-'),
      escapeCSV(a.transactionId || '-'),
      escapeCSV(a.headmasterMobile || '-'),
      escapeCSV(a.schoolName),
      escapeCSV(a.schoolAddress || '-'),
      escapeCSV(categoryNames[a.schoolCategory] || a.schoolCategory),
      escapeCSV(a.className),
      escapeCSV(a.upazila),
      escapeCSV(statusNames[a.status] || a.status),
      escapeCSV(paymentStatusNames[a.paymentStatus] || a.paymentStatus),
      escapeCSV(new Date(a.createdAt).toLocaleDateString('bn-BD'))
    ].join(','));

    // UTF-8 BOM for Excel Bengali character compatibility
    return '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  }

  // --- SUPABASE SYNC ---
  async syncWithSupabase(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const remote = await fetchRemoteApplicants();
      if (remote && remote.length > 0) {
        const local = this.getApplicants();
        const map = new Map<string, Applicant>();
        local.forEach(a => map.set(a.applicationNo, a));
        remote.forEach(r => map.set(r.applicationNo, r));
        const merged = Array.from(map.values());
        localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(merged));
        this.notify();
        return { success: true, count: remote.length, message: `${remote.length}টি রেকর্ড ক্লাউড ডেটাবেস থেকে সমন্বয় করা হয়েছে।` };
      }
      return { success: false, count: 0, message: 'Supabase-এ কোনো দূরবর্তী রেকর্ড পাওয়া যায়নি বা টেবিল প্রস্তুত নয়।' };
    } catch {
      return { success: false, count: 0, message: 'Supabase ক্লাউড ডেটাবেসের সাথে সিঙ্ক করা সম্ভব হয়নি।' };
    }
  }

  async pushAllLocalApplicantsToSupabase(): Promise<{ pushed: number; failed: number }> {
    const list = this.getApplicants();
    let pushed = 0;
    let failed = 0;
    for (const applicant of list) {
      try {
        const ok = await pushApplicantToSupabase(applicant);
        if (ok) pushed++;
        else failed++;
      } catch {
        failed++;
      }
    }
    return { pushed, failed };
  }

  /**
   * Section 7: Recover browser-only content and migrate seamlessly into authoritative Firestore
   */
  async recoverAndMigrateLocalDataToCloud(): Promise<{
    success: boolean;
    migrated: {
      settings: boolean;
      notices: number;
      campaigns: number;
      schools: number;
      committee: number;
      gallery: number;
      applicants: number;
    };
    message: string;
  }> {
    const stats = {
      settings: false,
      notices: 0,
      campaigns: 0,
      schools: 0,
      committee: 0,
      gallery: 0,
      applicants: 0
    };

    try {
      // 1. Settings, website editor, and admit card design
      const webConfig = this.getWebsiteEditorConfig();
      const examSettings = this.getSettings();
      const admitDesign = this.getAdmitCardDesign();
      const secState = this.getBootstrapState();

      await Promise.all([
        fbSaveSetting('website_config', webConfig),
        fbSaveSetting('exam_settings', examSettings),
        fbSaveSetting('admit_design', admitDesign),
        fbSaveSetting('admin_security', { passwordHash: secState.passwordHash, isInitialized: secState.isInitialized })
      ]);
      stats.settings = true;

      // 2. Notices
      const localNotices = this.getNotices();
      for (const n of localNotices) {
        const ok = await fbSaveNotice(n);
        if (ok) stats.notices++;
      }

      // 3. Campaigns
      const localCampaigns = this.getCampaigns();
      for (const c of localCampaigns) {
        const ok = await fbSaveCampaign(c);
        if (ok) stats.campaigns++;
      }

      // 4. Schools
      const localSchools = this.getRecognizedSchools();
      for (const s of localSchools) {
        const ok = await fbSaveSchool(s);
        if (ok) stats.schools++;
      }

      // 5. Committee
      const localCommittee = this.getCommitteeMembers();
      for (const m of localCommittee) {
        const ok = await fbSaveCommitteeMember(m);
        if (ok) stats.committee++;
      }

      // 6. Gallery
      const localGallery = this.getGalleryItems();
      for (const g of localGallery) {
        const ok = await fbSaveGalleryItem(g);
        if (ok) stats.gallery++;
      }

      // 7. Applicants
      const localApplicants = this.getApplicants();
      for (const a of localApplicants) {
        const ok = await fbSaveApplicant(a);
        if (ok) stats.applicants++;
      }

      this.addAuditLog('ক্লাউড মাইগ্রেশন সম্পন্ন', 'SYSTEM', `সকল লোকাল ডেটা ফায়ারবেসে মাইগ্রেট করা হয়েছে (বিজ্ঞপ্তি: ${stats.notices}, গ্যালারি: ${stats.gallery}, আবেদন: ${stats.applicants})`);
      this.notify();

      return {
        success: true,
        migrated: stats,
        message: `সকল লোকাল কনটেন্ট ও ডেটা সফলভাবে ক্লাউড ফায়ারস্টোরে মাইগ্রেট ও সংরক্ষিত হয়েছে!`
      };
    } catch (err: any) {
      return {
        success: false,
        migrated: stats,
        message: `মাইগ্রেশন ব্যর্থ: ${err.message}`
      };
    }
  }
}

export const storage = new StorageService();
