export interface InstitutionInfo {
  name: string;
  englishName: string;
  shortName: string;
  motto: string;
  address: string;
  englishAddress?: string;
  regNo: string;
  estDate: string;
  examName: string;
  examYear: string;
  logoUrl: string;
  aboutText?: string;
  missionText?: string;
}

export const INSTITUTION: InstitutionInfo = {
  name: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা',
  englishName: 'Al-Ikhwan Islamic Social Welfare Organization',
  shortName: 'AEISS',
  motto: 'শিক্ষা · ঐক্য · সমাজসেবা',
  address: 'গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার',
  englishAddress: 'Gallasangon, Barlekha, Moulvibazar',
  regNo: '২৯৯',
  estDate: '০১/০১/২০০০ ইং',
  examName: 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬',
  examYear: '২০২৬',
  logoUrl: '/assets/aistudio/logo_3b9b1213.png',
  aboutText: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা ২০০০ সালে প্রতিষ্ঠিত একটি অরাজনৈতিক, সামাজিক, শিক্ষামূলক ও জনকল্যাণমুখী সংগঠন। সংস্থাটি মৌলভীবাজার জেলার বড়লেখা উপজেলা এবং পার্শ্ববর্তী অঞ্চলে গুণগত শিক্ষা বিস্তার, মেধাবিকাশ, সমাজসেবা ও আর্তমানবতার সেবায় নিবেদিতভাবে কাজ করে আসছে।',
  missionText: 'সুবিধাবঞ্চিত মেধাবী শিক্ষার্থীদের বৃত্তি ও শিক্ষা সহায়তা প্রদান, নৈতিক ও মানবিক গুণসম্পন্ন সমাজ গঠন, দুর্যোগে ত্রাণ ও পুনর্বাসন এবং যুবসমাজকে গঠনমূলক সমাজসেবায় উদ্বুদ্ধ করা আমাদের মূল লক্ষ্য।'
};

export type ApplicantStatus = 'submitted' | 'under_review' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid' | 'waived' | 'pending';
export type Gender = 'ছাত্র' | 'ছাত্রী';

// ৩টি স্বতন্ত্র শিক্ষাপ্রতিষ্ঠান ক্যাটাগরি
export type SchoolCategory = 'primary' | 'kindergarten' | 'madrasa';

export interface CategoryRollConfig {
  id: SchoolCategory;
  nameBn: string;
  initialRoll: number;
  currentSeq: number;
}

export const INITIAL_CATEGORY_ROLL_CONFIGS: Record<SchoolCategory, CategoryRollConfig> = {
  primary: {
    id: 'primary',
    nameBn: 'সরকারি প্রাথমিক বিদ্যালয়',
    initialRoll: 2821,
    currentSeq: 0
  },
  kindergarten: {
    id: 'kindergarten',
    nameBn: 'কিন্ডারগার্টেন',
    initialRoll: 3001,
    currentSeq: 0
  },
  madrasa: {
    id: 'madrasa',
    nameBn: 'ইবতেদায়ী / মাদ্রাসা',
    initialRoll: 3201,
    currentSeq: 0
  }
};

export interface RecognizedSchool {
  id: string;
  name: string;
  category: SchoolCategory;
  upazila: string;
  unionOrArea?: string;
  maxCapacity: number; // সর্বোচ্চ ৭ জন
}

export interface Applicant {
  id: string;
  applicationNo: string;
  nameBn: string;
  nameEn: string;
  dob: string;
  gender: Gender;
  fatherName: string;
  motherName: string;
  mobile: string;
  altMobile?: string;
  email?: string;
  schoolName: string;
  schoolId?: string;
  schoolCategory: SchoolCategory;
  className: string;
  rollNo: string;
  presentAddress: string;
  permanentAddress: string;
  division: string;
  district: string;
  upazila: string;
  unionOrArea?: string;
  photoUrl: string;
  signatureUrl?: string;
  declarationAccepted: boolean;
  headmasterApproved: boolean; // প্রধান শিক্ষকের অনুমতির নিশ্চিতকরণ
  pin?: string;
  mobileVerified?: boolean;
  otpVerifiedAt?: string;
  status: ApplicantStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paymentSenderMobile?: string; // যে নাম্বার থেকে ফি ক্যাশ আউট / প্রদান করা হয়েছে
  headmasterMobile?: string;     // প্রতিষ্ঠান প্রধানের (ওয়াটসঅ্যাপ) মোবাইল নম্বর
  schoolAddress?: string;        // প্রতিষ্ঠানের ঠিকানা
  participatingStudentsCount?: number; // প্রতিষ্ঠান থেকে মোট অংশগ্রহণকারী শিক্ষার্থী সংখ্যা
  paymentDate?: string;
  admitCardIssued: boolean;
  admitCardNo?: string;
  rollNumber?: string;
  examCenter?: string;
  examDate?: string;
  examTime?: string;
  instituteStudentIndex?: number;      // ব্যাচ আবেদনে শিক্ষার্থীর ক্রমিক (১-৭)
  batchSubmissionId?: string;          // প্রাতিষ্ঠানিক যৌথ আবেদনের আইডি
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  campaignId?: string;
}

export interface SignatureSlotConfig {
  id: 'examinee' | 'controller' | 'secretary' | 'president';
  titleBn: string;
  titleEn: string;
  subtitleBn?: string;
  subtitleEn?: string;
  signatureUrl?: string;
  enabled: boolean;
}

export interface AdmitCustomizerSettings {
  fontFamily: 'Hind Siliguri' | 'Noto Sans Bengali' | 'serif';
  fontSize: 'compact' | 'normal' | 'relaxed';
  cardBorderColor: string;
  cardBorderWidth: number;
  cardPadding: number;
  showBismillah: boolean;
  showWatermark: boolean;
  showQrCode: boolean;
  headerTitleBn?: string;
  instructionsTitle: string;
  instructions: string[];
  signatures: {
    examinee: SignatureSlotConfig;
    controller: SignatureSlotConfig;
    secretary: SignatureSlotConfig;
    president: SignatureSlotConfig;
  };
}

export interface OfficialSignatures {
  controllerSignatureUrl?: string; // পরীক্ষা নিয়ন্ত্রক
  presidentSignatureUrl?: string;  // সংস্থা সভাপতি
  secretarySignatureUrl?: string;  // সাধারণ সম্পাদক / সদস্য সচিব
  controllerSealUrl?: string;      // প্রাতিষ্ঠানিক সিল
}

export interface Notice {
  id: string;
  title: string;
  category: 'জরুরি' | 'সাধারণ' | 'ফলাফল' | 'সিলেবাস';
  date: string;
  content: string;
  isPinned: boolean;
  fileUrl?: string;
}

export interface ContactPerson {
  name: string;
  phone: string;
  rawPhone: string;
  designation?: string;
}

export const OFFICIAL_CONTACTS: ContactPerson[] = [
  {
    name: 'হামিদুর রহমান',
    phone: '01317 926888',
    rawPhone: '01317926888',
    designation: 'অর্থ সম্পাদক (ফি ও হিসাব)'
  },
  {
    name: 'কাওছার আহমদ',
    phone: '01726 886578',
    rawPhone: '01726886578',
    designation: 'প্রচার ও যোগাযোগ'
  },
  {
    name: 'মোঃ এমাদ উদ্দিন',
    phone: '01750 969712',
    rawPhone: '01750969712',
    designation: 'সহ সাধারণ সম্পাদক'
  }
];

export type CampaignStatus = 'upcoming' | 'active' | 'closed' | 'archived';

export interface CampaignDocument {
  id: string;
  title: string;
  fileUrl: string; // Base64 data URL or external URL
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  category: string;
  campaignType?: 'exam' | 'general' | 'donation' | 'training';
  shortDescription: string;
  fullDescription: string;
  displayStartDate: string;
  displayEndDate: string;
  applicationStartDate: string; // ২৫ অক্টোবর ২০২৬
  applicationEndDate: string;   // ০৫ নভেম্বর ২০২৬
  admitCardAvailableDate?: string; // অ্যাডমিট কার্ড ডাউনলোডের তারিখ ও সময় (যেমন: ২০২৬-১১-০৬)
  examDate: string;             // ১৪ নভেম্বর ২০২৬
  examTime: string;
  isFeeRequired: boolean;
  feeAmount: number;            // ১০০ টাকা
  isFeaturedOnHome: boolean;
  statusOverride?: CampaignStatus;
  rules: string[];
  eligibilitySummary: string;
  allowedRegions: string[];
  allowedClasses: string[];
  contacts: ContactPerson[];
  syllabusSummary?: string;
  examCenters?: string[];
  maxStudentsPerSchool: number;
  documents?: CampaignDocument[];
  highlights?: string[];        // কর্মসূচির আকর্ষণীয় পয়েন্ট ও হাইলাইটস
  bannerImageUrl?: string;    // কভার ফটো / ব্যানার ইমেজ
}

export interface ExamSettings {
  isApplicationOpen: boolean;
  startDate: string;
  endDate: string;
  examDate: string;
  examTime: string;
  admitCardAvailableDate?: string; // প্রবেশপত্র ডাউনলোডের উন্মুক্ত সময়সূচি
  examCenters: string[];
  isFeeRequired: boolean;
  feeAmount: number;
  contactPhones: ContactPerson[];
  contactEmail: string;
  syllabusSummary: string;
  admitInstructions: string[];
  maxStudentsPerSchool: number;
  categoryRollConfigs: Record<SchoolCategory, CategoryRollConfig>;
  officialSignatures?: OfficialSignatures;
  bkashAgentNumber?: string;
  admitCustomizer?: AdmitCustomizerSettings;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  targetId: string;
  details: string;
  performedBy: string;
}

export interface PaymentReceipt {
  receiptNo: string;
  applicationNo: string;
  applicantName: string;
  schoolName: string;
  className: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentSenderMobile?: string;
  paidAt: string;
  status: 'সফল' | 'অপেক্ষমাণ' | 'ব্যর্থ';
  approvedAt?: string;
  approvedBy?: string;
  studentCount?: number;
}

// সেকশন ১২: পরিচালনা পর্ষদ ও কার্যনির্বাহী কমিটি
export type CommitteeTier = 
  | 'advisory'       // ০১. উপদেষ্টা পরিষদ
  | 'president'      // ০২. সভাপতি
  | 'vice_president' // ০২. সহ-সভাপতি
  | 'general_sec'    // ০৩. সাধারণ সম্পাদক
  | 'asst_gen_sec'   // ০৩. সহ সাধারণ সম্পাদক
  | 'treasurer'      // ০৪. অর্থ সম্পাদক ও সহ অর্থ সম্পাদক
  | 'secretaries'    // ০৫-১৫. অন্যান্য দায়িত্বপ্রাপ্ত সম্পাদকবৃন্দ
  | 'members';       // ১৬. নির্বাহী সদস্যবৃন্দ

export interface CommitteeMember {
  id: string;
  slNo?: string;
  name: string;
  nameEn?: string;
  designation: string;
  designationEn?: string;
  tier: CommitteeTier;
  phone?: string;
  rawPhone?: string;
  order: number;
  term: string; // e.g. '২০২৪-২০২৬ সেশন'
  isCurrent: boolean;
  bio?: string;
  photoUrl?: string;
}

// গ্যালারি মিডিয়া (ছবি ও ভিডিও)
export type MediaType = 'photo' | 'video';
export type GalleryCategory = 'welfare' | 'education' | 'exam' | 'relief' | 'plantation' | 'meeting' | 'general';

export interface GalleryItem {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  type: MediaType;
  mediaUrl: string; // Image URL/base64 data URL or video URL/embed
  thumbnailUrl?: string; // Optional custom thumbnail for video
  category: GalleryCategory;
  categoryLabelBn?: string;
  categoryLabelEn?: string;
  eventDate: string; // e.g. '২০২৫-১২-১৫' or '15 Dec 2025'
  isFeaturedOnHome: boolean;
  uploadedAt: string;
  youtubeId?: string;
}

export type AdmitCardComponentId = 
  | 'header' 
  | 'banner' 
  | 'student_info' 
  | 'routine' 
  | 'instructions' 
  | 'declaration' 
  | 'signatures' 
  | 'qrcode';

export interface WebsiteThemeConfig {
  primaryColor: string;       // e.g. '#07243B'
  secondaryColor: string;     // e.g. '#0272A6'
  accentColor: string;        // e.g. '#7B1159'
  highlightColor: string;     // e.g. '#F59E0B'
  backgroundColor: string;    // e.g. '#F8FAFC'
  textColor: string;          // e.g. '#0F172A'
  cardBgColor: string;        // e.g. '#FFFFFF'
  fontFamily: 'serif' | 'sans';
  baseFontSize: 'compact' | 'normal' | 'relaxed';
  showAnnouncementBanner: boolean;
  announcementText: string;
}

export interface WebsiteIconsConfig {
  brandEmoji: string;         // e.g. '🕌'
  noticeEmoji: string;        // e.g. '📢'
  schoolEmoji: string;        // e.g. '🏫'
  madrasaEmoji: string;       // e.g. '📖'
  cashOutEmoji: string;       // e.g. '💳'
  admitEmoji: string;         // e.g. '🎫'
  receiptEmoji: string;       // e.g. '🧾'
  facebookEmoji: string;      // e.g. '🌐'
  phoneEmoji: string;         // e.g. '📞'
  locationEmoji: string;      // e.g. '📍'
  calendarEmoji: string;      // e.g. '📅'
  awardEmoji: string;         // e.g. '🏆'
}

export interface WebsiteHeroConfig {
  showBismillah: boolean;
  bismillahText: string;
  bismillahTranslation: string;
  badgeText: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  aboutParagraph: string;
  hallmark1Title: string;
  hallmark1Value: string;
  hallmark1Sub: string;
  hallmark2Title: string;
  hallmark2Value: string;
  hallmark2Sub: string;
  hallmark3Title: string;
  hallmark3Value: string;
  hallmark3Sub: string;
  programTag: string;
  programTitle: string;
  programSubtitle: string;
  examDateText: string;
  deadlineText: string;
  quotaText: string;
  feeText: string;
  bkashAgent: string;
  applyButtonText: string;
  admitButtonText: string;
  receiptButtonText: string;
}

export interface SyllabusItem {
  id: string;
  subject: string;
  marks: number;
  details: string;
}

export interface WebsiteNitimalaConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  officialRules: string[];
  schoolTitle: string;
  schoolSubtitle: string;
  schoolTotalMarks: number;
  schoolTimeText: string;
  schoolSubjects: SyllabusItem[];
  madrasaTitle: string;
  madrasaSubtitle: string;
  madrasaTotalMarks: number;
  madrasaTimeText: string;
  madrasaSubjects: SyllabusItem[];
  hallInstructions: string[];
}

export interface WebsiteFooterConfig {
  facebookUrl: string;
  facebookName: string;
  organizationSummary: string;
  disclaimerText: string;
  copyrightText: string;
}

export interface WebsiteFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface WebsiteEmergencyBanner {
  enabled: boolean;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  actionText?: string;
  actionUrl?: string;
}

export interface WebsiteStatItem {
  value: string;
  label: string;
  sub?: string;
}

export interface WebsiteAwardItem {
  title: string;
  amount: string;
  perks: string;
  badge: string;
  color: string;
}

export interface WebsiteExamCenterItem {
  name: string;
  code: string;
  address: string;
  instructions: string;
}

export interface WebsiteFeaturesConfig {
  tickerSpeed: 'slow' | 'normal' | 'fast';
  tickerEnabled: boolean;
  tickerPrefix: string;
  emergencyBanner: WebsiteEmergencyBanner;
  showCountdownTimer: boolean;
  countdownTitle: string;
  countdownTargetDate: string;
  showFloatingHelpline: boolean;
  floatingHelplineNumber: string;
  floatingHelplineText: string;
  floatingHelplinePosition: 'right' | 'left';
  showFaqSection: boolean;
  faqsTitle: string;
  faqs: WebsiteFaqItem[];
  statsCountersEnabled: boolean;
  statsTitle: string;
  stats: WebsiteStatItem[];
  awardsEnabled: boolean;
  awardsTitle: string;
  awardsSubtitle: string;
  awards: WebsiteAwardItem[];
  examCentersEnabled: boolean;
  examCentersTitle: string;
  examCenters: WebsiteExamCenterItem[];
  galleryCountOnHome: number;
  gallerySectionTitle: string;
  galleryColumns: 2 | 3 | 4;
  galleryShowCaptions: boolean;
  noticeDisplayLimit: number;
  noticeBadgeText: string;
  noticeHighlightPinned: boolean;
  contactHelplinePhone: string;
  contactEmailText: string;
  presetThemeId?: string;
}

export interface WebsiteEditorConfig {
  theme: WebsiteThemeConfig;
  icons: WebsiteIconsConfig;
  hero: WebsiteHeroConfig;
  nitimala: WebsiteNitimalaConfig;
  footer: WebsiteFooterConfig;
  features?: WebsiteFeaturesConfig;
  updatedAt: string;
}

export interface AdmitCardDesign {
  // Drag & drop / re-orderable blocks
  componentsOrder?: AdmitCardComponentId[];

  // Top Headers
  orgNameBn: string;
  orgNameEn: string;
  subHeaderBn: string;
  subHeaderEn: string;
  examTitleBn: string;
  examTitleEn: string;
  bannerTitleBn: string;
  bannerTitleEn: string;
  bannerBgColor: string;
  bannerTextColor: string;

  // Typography & Aesthetics
  fontFamily: 'serif' | 'sans';
  fontSize: 'compact' | 'normal' | 'spacious';
  themeColor: string;
  borderColor: string;
  showBarcode: boolean;
  showQrCode: boolean;
  showBismillah: boolean; // false without Bismillah

  // Candidate photo & signature position
  studentPhotoRight?: boolean;
  studentSignatureBelowPhotoEmpty?: boolean; // Empty slot below right photo

  // Exam Schedules
  reportingTimeTextBn: string;
  reportingTimeTextEn: string;
  gateClosingTimeTextBn: string;
  gateClosingTimeTextEn: string;

  // Declaration & Notice Box
  declarationStatementBn: string;
  declarationStatementEn: string;
  instructionsTitle?: string;
  instructions: string[];
  schoolInstructionsTitle?: string;
  schoolInstructions?: string[];
  madrasaInstructionsTitle?: string;
  madrasaInstructions?: string[];

  // 4 Bottom Signatures
  // 1. সাধারণ সম্পাদক (Secretary) - FIXED
  secretarySignFixed?: boolean;
  secretaryTitleBn: string;
  secretaryTitleEn: string;
  secretaryName: string;
  secretarySignatureUrl?: string;

  // 2. সভাপতি (President) - FIXED
  shovapotiSignFixed?: boolean;
  presidentTitleBn: string;
  presidentTitleEn: string;
  presidentName: string;
  presidentSignatureUrl?: string;

  // 3. পরীক্ষা নিয়ন্ত্রক (Controller of Examination) - EMPTY SLOT
  controllerSignEmptySlot?: boolean;
  controllerTitleBn: string;
  controllerTitleEn: string;
  controllerName: string;
  controllerSignatureUrl?: string;

  // 4. পরীক্ষার্থীর স্বাক্ষর (Candidate's Signature) - EMPTY SLOT
  candidateSignTitleBn: string;
  candidateSignTitleEn: string;

  // Official Seal
  officialSealUrl?: string;
  admitFooterNoteBn?: string;

  // --- 10+ FLEXIBLE PRO CONTROLS ---
  // 1. Watermark Customization
  watermarkEnabled?: boolean;
  watermarkType?: 'logo' | 'text';
  watermarkText?: string;
  watermarkOpacity?: number; // 0.05 to 0.30

  // 2. Border Architecture
  borderStyle?: 'solid' | 'double' | 'ornate' | 'minimal';
  innerBorderColor?: string;

  // 3. Photo & Badge Styling
  photoBorderStyle?: 'rounded' | 'square' | 'badge';

  // 4. Candidate Info Toggles
  showParentNames?: boolean;
  showDob?: boolean;
  showGender?: boolean;

  // 5. Exam Schedules & Venue Toggles
  showExamCenter?: boolean;
  showReportingTime?: boolean;

  // 6. Seal Adjustments
  showSeal?: boolean;
  sealSize?: number; // 80 - 140px
  sealRotation?: number; // -15 to +15 deg
  sealOpacity?: number; // 0.6 to 1.0

  // 7. Candidate Signature Box
  showCandidateSignSlot?: boolean;

  // 8. Instructions Typography & List Style
  instructionsFontSize?: 'small' | 'normal' | 'large';
  instructionsStyle?: 'numbered' | 'bulleted';

  // 9. Contact & Helpline on Card
  customHelplinePhone?: string;

  // 10. Header Layout Mode
  headerLayoutMode?: 'centered' | 'classic_letterhead' | 'modern_split';
}

export const DEFAULT_WEBSITE_EDITOR_CONFIG: WebsiteEditorConfig = {
  theme: {
    primaryColor: '#07243B',
    secondaryColor: '#0272A6',
    accentColor: '#7B1159',
    highlightColor: '#F59E0B',
    backgroundColor: '#F8FAFC',
    textColor: '#0F172A',
    cardBgColor: '#FFFFFF',
    fontFamily: 'serif',
    baseFontSize: 'normal',
    showAnnouncementBanner: true,
    announcementText: '★ আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা ২০২৬ — আগামী ১৪/১১/২০২৬ ইং রোজ শনিবার অনুষ্ঠিত হবে ★'
  },
  icons: {
    brandEmoji: '🕌',
    noticeEmoji: '📢',
    schoolEmoji: '🏫',
    madrasaEmoji: '📖',
    cashOutEmoji: '💳',
    admitEmoji: '🎫',
    receiptEmoji: '🧾',
    facebookEmoji: '🌐',
    phoneEmoji: '📞',
    locationEmoji: '📍',
    calendarEmoji: '📅',
    awardEmoji: '🏆'
  },
  hero: {
    showBismillah: true,
    bismillahText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    bismillahTranslation: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে',
    badgeText: 'শিক্ষা · ঐক্য · সমাজসেবা | ESTD 2000',
    titleBn: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা',
    titleEn: 'Al-Ikhwan Islamic Social Welfare Organization',
    subtitleBn: 'গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার · সমাজসেবা অধিদপ্তর রেজিঃ ২৯৯',
    aboutParagraph: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা ২০০০ সালে প্রতিষ্ঠিত একটি অরাজনৈতিক, সামাজিক, শিক্ষামূলক ও জনকল্যাণমুখী সংগঠন। সংস্থাটি মৌলভীবাজার জেলার বড়লেখা উপজেলা এবং পার্শ্ববর্তী অঞ্চলে গুণগত শিক্ষা বিস্তার, মেধাবিকাশ, সমাজসেবা ও আর্তমানবতার সেবায় নিবেদিতভাবে কাজ করে আসছে।',
    hallmark1Title: 'সরকারি নিবন্ধন',
    hallmark1Value: 'রেজিঃ নং ২৯৯',
    hallmark1Sub: 'সমাজসেবা অধিদপ্তর',
    hallmark2Title: 'প্রতিষ্ঠা সাল',
    hallmark2Value: '০১/০১/২০০০ ইং',
    hallmark2Sub: '২৬ বছরের গৌরবময় পথচলা',
    hallmark3Title: 'কার্যপরিধি',
    hallmark3Value: 'বড়লেখা ও লাউতা',
    hallmark3Sub: 'মৌলভীবাজার ও বিয়ানীবাজার',
    programTag: 'চলমান দাপ্তরিক কর্মসূচি',
    programTitle: 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরিক্ষা ২০২৬ইং',
    programSubtitle: 'বড়লেখা উপজেলা ও বিয়ানীবাজারের লাউতা ইউনিয়নের পঞ্চম শ্রেণির শিক্ষার্থীদের মেধা অন্বেষণ পরীক্ষা',
    examDateText: '১৪/১১/২০২৬ ইং রোজ শনিবার',
    deadlineText: '২৫ অক্টোবর ২০২৫/২০২৬',
    quotaText: 'সর্বোচ্চ ৭ জন ছাত্র-ছাত্রী',
    feeText: '৳১০০/- (বিকাশ ক্যাশ আউট)',
    bkashAgent: '০১৭৯৭-২৬৭৯২৪',
    applyButtonText: 'অনলাইন আবেদন করুন',
    admitButtonText: 'প্রবেশপত্র',
    receiptButtonText: 'টাকা জমার রসিদ'
  },
  nitimala: {
    sectionTitle: 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরিক্ষা ২০২৬ইং — নীতিমালা ও মানবন্টন',
    sectionSubtitle: 'আস্সালামু আলাইকুম ওয়ারাহমাতুল্লাহ — সকল অভিভাবক, শিক্ষক ও শিক্ষার্থীদের জন্য পালনীয় নির্দেশাবলি',
    officialRules: [
      '১। একটি প্রতিষ্ঠান থেকে সর্বোচ্চ ৭জন ছাত্র-ছাত্রী প্রধান শিক্ষকের অনুমতিক্রমে অংশগ্রহণ করতে পারবে।',
      '২। আবেদন পত্রের সকল কলাম অবশ্যই ধারাবাহিক ভাবে পূরণ করতে হবে এবং পাসপোর্ট সাইজ ছবি আপলোড করতে হবে।',
      '৩। সঠিক তথ্য দিয়ে আবেদনপত্র পূরণ করতে হবে, ভূল তথ্য বা কোন অসঙ্গতি পরিলক্ষিত হলে আবেদনপত্র বাতিল বলে গণ্য হবে।',
      '৪। আবেদন পত্র পূরণ করার পূর্বে জনপ্রতি ১০০/- (একশত টাকা) করে বিকাশ নাম্বারে পরীক্ষার ফি পরিশোধ করতে হবে। বিকাশ এজেন্ট নাম্বার (ক্যাশ আউট করুন) - ০১৭৯৭- ২৬৭৯২৪',
      '৫। ২৫ অক্টোবর এর ভিতরে অনলাইনে আবেদনপত্র পূরণ করতে হবে।',
      '৬। বড়লেখা উপজেলাধীন সকল শিক্ষাপ্রতিষ্ঠান এবং বিয়ানীবাজার উপজেলার লাউতা ইউনিয়নের আওতাধীন শিক্ষাপ্রতিষ্ঠান সমূহ অংশগ্রহণ করতে পারবে।',
      '৭। পরীক্ষার্থীর প্রবেশপত্র প্রধান শিক্ষকের ওয়াটস্আপ নাম্বারে প্রেরণ করা হবে। পরীক্ষার্থী প্রবেশপত্র প্রিন্ট করে পরীক্ষা কেন্দ্রে সাথে নিয়ে আসতে হবে।'
    ],
    schoolTitle: 'মান বন্টন দেখুন, স্কুল (সাধারণ প্রাথমিক বিদ্যালয় ও কিন্ডারগার্টেন শাখা)',
    schoolSubtitle: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) এর ৫ম শ্রেণির সিলেবাসের আলোকে লিখিত পরীক্ষা',
    schoolTotalMarks: 100,
    schoolTimeText: 'সকাল ১০:৩০ - ১২:৩০ ও দুপুর ০২:০০ - ০৪:০০',
    schoolSubjects: [
      { id: 'sc-1', subject: 'বাংলা', marks: 25, details: '৫ম শ্রেণির পাঠ্যবইয়ের গদ্য, পদ্য, ব্যাকরণ ও অনুচ্ছেদ লিখন।' },
      { id: 'sc-2', subject: 'ইংরেজি (English)', marks: 25, details: 'English for Today (Class 5), Vocabulary, Comprehension ও বাক্য গঠন।' },
      { id: 'sc-3', subject: 'গণিত', marks: 30, details: 'যোগ, বিয়োগ, গুণ, ভাগ, কথার অঙ্ক, ভগ্নাংশ ও জ্যামিতির মৌলিক ধারণা।' },
      { id: 'sc-4', subject: 'বিজ্ঞান ও বাংলাদেশ ও বিশ্বপরিচয়', marks: 20, details: 'প্রাথমিক বিজ্ঞান এবং বাংলাদেশ ও বিশ্বপরিচয়ের মৌলিক ধারণা।' }
    ],
    madrasaTitle: 'মান বন্টন দেখুন, মাদ্রাসা (ইবতেদায়ী শাখা)',
    madrasaSubtitle: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ডের ৫ম শ্রেণির পাঠ্যসূচির আলোকে নির্দিষ্ট লিখিত পরীক্ষা',
    madrasaTotalMarks: 100,
    madrasaTimeText: 'সকাল ১০:৩০ - ১২:৩০ ও দুপুর ০২:০০ - ০৪:০০',
    madrasaSubjects: [
      { id: 'md-1', subject: 'কুরআন মাজীদ ও আকাইদ-ফিকহ্ / ইসলামিয়াত', marks: 25, details: 'কুরআন তিলাওয়াত, তাজবিদ, মৌলিক আকাইদ ও ফিকহ্ এর মাসআলা।' },
      { id: 'md-2', subject: 'আরবি ও বাংলা', marks: 25, details: 'আল-লুগাতুল আরাবিয়্যাতুল ইত্তেসালিয়্যাহ ও ৫ম শ্রেণির বাংলা সাহিত্য।' },
      { id: 'md-3', subject: 'গণিত', marks: 30, details: 'পাটিগণিত, কথার অঙ্ক, ভগ্নাংশ ও জ্যামিতির প্রাথমিক ধারণা।' },
      { id: 'md-4', subject: 'ইংরেজি ও সাধারণ জ্ঞান', marks: 20, details: 'ইবতেদায়ী ইংরেজি এবং ইসলামী ও সমসাময়িক সাধারণ জ্ঞান।' }
    ],
    hallInstructions: [
      '১। পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে পরীক্ষার্থীকে নির্ধারিত পরীক্ষাকেন্দ্রে উপস্থিত হতে হবে।',
      '২। প্রবেশপত্রের মূল রঙিন কপি সঙ্গে রাখা বাধ্যতামূলক। প্রবেশপত্র ব্যতীত কাউকে পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।',
      '৩। প্রবেশপত্রে উল্লেখিত রোল নম্বর উত্তরপত্রের নির্দিষ্ট স্থানে নির্ভুলভাবে লিখতে হবে।',
      '৪। পরীক্ষা কক্ষে মোবাইল ফোন, বই-খাতা বা যেকোনো ডিজিটাল ডিভাইস সম্পূর্ণ নিষিদ্ধ।',
      '৫। কোনো প্রকার অসদুপায় অবলম্বন করলে পরীক্ষা তাৎক্ষণিকভাবে বাতিল বলে গণ্য হবে।'
    ]
  },
  footer: {
    facebookUrl: 'https://web.facebook.com/people/%E0%A6%86%E0%A6%B2-%E0%A6%87%E0%A6%96%E0%A6%93%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%A8-%E0%A6%87%E0%A6%B8%E0%A6%83%E0%A6%B8%E0%A6%83%E0%A6%95%E0%A6%83-%E0%A6%B8%E0%A6%82%E0%A6%B8%E0%A7%8D%E0%A6%A5%E0%A6%BE/100015332053937/#',
    facebookName: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা — ফেইসবুক পেজ',
    organizationSummary: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা একটি শিক্ষা ও জনকল্যাণমুখী সরকারি নিবন্ধিত সামাজিক প্রতিষ্ঠান। বড়লেখা ও সংলগ্ন এলাকার শিক্ষার্থীদের সুশিক্ষা ও মেধা বিকাশের লক্ষ্যে নিবেদিত।',
    disclaimerText: 'অনুমোদিত পরীক্ষা নিয়ন্ত্রক ও পরিচালনা পর্ষদ কর্তৃক সংরক্ষিত পোর্টাল।',
    copyrightText: '© ২০২৬ আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা। সর্বস্বত্ব সংরক্ষিত।'
  },
  features: {
    tickerSpeed: 'normal',
    tickerEnabled: true,
    tickerPrefix: 'দাপ্তরিক জরুরি বিজ্ঞপ্তি',
    emergencyBanner: {
      enabled: false,
      message: 'বৃত্তি পরীক্ষা ২০২৬ এর প্রবেশপত্র ও রোল নম্বর বরাদ্দ সম্পন্ন হয়েছে। সকল পরীক্ষার্থীকে ওয়েবসাইট থেকে কালার প্রিন্ট কপি সংগ্রহের অনুরোধ করা হচ্ছে।',
      type: 'info',
      actionText: 'প্রবেশপত্র দেখুন',
      actionUrl: '#admit'
    },
    showCountdownTimer: true,
    countdownTitle: 'বৃত্তি পরীক্ষা ২০২৬ শুরু হতে বাকি',
    countdownTargetDate: '2026-11-14T10:00:00',
    showFloatingHelpline: true,
    floatingHelplineNumber: '01750-969712',
    floatingHelplineText: 'জরুরি হেল্পলাইন ও হোয়াটসঅ্যাপ সহায়তা',
    floatingHelplinePosition: 'right',
    showFaqSection: true,
    faqsTitle: 'বৃত্তি পরীক্ষা সংক্রান্ত সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)',
    faqs: [
      {
        id: 'faq-1',
        question: 'কারা এই বৃত্তি পরীক্ষায় অংশগ্রহণ করতে পারবে?',
        answer: 'বড়লেখা উপজেলার অন্তর্গত সকল শিক্ষাপ্রতিষ্ঠান এবং বিয়ানীবাজার উপজেলার লাউতা ইউনিয়নের আওতাধীন সরকারি প্রাথমিক বিদ্যালয়, কিন্ডারগার্টেন ও ইবতেদায়ী মাদ্রাসার ৫ম শ্রেণির নিয়মিত শিক্ষার্থীরা অংশগ্রহণ করতে পারবে।'
      },
      {
        id: 'faq-2',
        question: 'একটি শিক্ষাপ্রতিষ্ঠান থেকে সর্বোচ্চ কতজন শিক্ষার্থী আবেদন করতে পারবে?',
        answer: 'প্রতিষ্ঠান প্রধানের অনুমতিক্রমে একটি প্রাথমিক বিদ্যালয় বা মাদ্রাসা থেকে সর্বোচ্চ ৭ (সাত) জন শিক্ষার্থী পরীক্ষায় অংশগ্রহণ করতে পারবে।'
      },
      {
        id: 'faq-3',
        question: 'পরীক্ষার ফি কত এবং কীভাবে পরিশোধ করতে হবে?',
        answer: 'জনপ্রতি পরীক্ষার ফি ১০০ (একশত) টাকা। বিকাশ এজেন্ট নম্বরে (০১৭৯৭-২৬৭৯২৪) ক্যাশ আউট করে যে নম্বর থেকে ক্যাশ আউট করা হয়েছে তা ফরমে প্রদান করতে হবে।'
      },
      {
        id: 'faq-4',
        question: 'অনলাইনে প্রবেশপত্র কখন পাওয়া যাবে?',
        answer: 'আবেদন যাচাই ও পেমেন্ট অনুমোদনের পর ওয়েবসাইট থেকে প্রবেশপত্র ডাউনলোড ও কালার প্রিন্ট করে নেওয়া যাবে। পরীক্ষার দিন মূল প্রবেশপত্র কেন্দ্রে আনা বাধ্যতামূলক।'
      }
    ],
    statsCountersEnabled: true,
    statsTitle: 'বৃত্তি পরীক্ষা ২০২৬ — এক নজরে পরিসংখ্যান',
    stats: [
      { value: '৭০০+', label: 'নিবন্ধিত মেধাবী শিক্ষার্থী', sub: 'প্রাথমিক ও ইবতেদায়ী শাখা' },
      { value: '৩টি', label: 'আধুনিক পরীক্ষা কেন্দ্র', sub: 'বড়লেখা ও বিয়ানীবাজার জোন' },
      { value: '১,৫০,০০০৳', label: 'মোট বৃত্তি ও পুরস্কার তহবিল', sub: 'নগদ অনুদান ও শিক্ষা উপকরণ' },
      { value: '১০০%', label: 'স্বচ্ছ ও নিরপেক্ষ মূল্যায়ন', sub: 'পরীক্ষা পরিষদ কর্তৃক পরিচালিত' }
    ],
    awardsEnabled: true,
    awardsTitle: 'মেধাবৃত্তি ও সম্মাননা পুরস্কারসমূহ',
    awardsSubtitle: 'কৃতি শিক্ষার্থীদের উচ্চশিক্ষায় অনুপ্রেরণা যোগাতে সংস্থার বিশেষ আর্থিক অনুদান ও সম্মাননা',
    awards: [
      { title: 'ট্যালেন্টপুল মেধা বৃত্তি', amount: '৳৫,০০০ (এককালীন)', perks: 'বিশেষ মেধা সনদ, মেডেল ও শিক্ষা সহায়ক সামগ্রী', badge: '১ম গ্রেড', color: 'bg-amber-500' },
      { title: 'সাধারণ গ্রেড মেধা বৃত্তি', amount: '৳৩,০০০ (এককালীন)', perks: 'মানপত্র, মেডেল ও ১ বছরের শিক্ষা সহায়তা', badge: '২য় গ্রেড', color: 'bg-sky-600' },
      { title: 'বিশেষ উৎসাহ পুরস্কার', amount: '৳১,৫০০ (এককালীন)', perks: 'প্রশংসাপত্র ও শিক্ষণ সামগ্রী কিট', badge: '৩য় গ্রেড', color: 'bg-emerald-600' },
      { title: 'অংশগ্রহণকারী সম্মাননা', amount: 'সকল পরীক্ষার্থী', perks: 'অংশগ্রহণ সনদ ও সংস্থার বার্ষিক স্মারক', badge: 'সম্মাননা', color: 'bg-indigo-600' }
    ],
    examCentersEnabled: true,
    examCentersTitle: 'নির্ধারিত পরীক্ষা কেন্দ্রসমূহ ও দিকনির্দেশনা',
    examCenters: [
      { name: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র', code: 'কেন্দ্র কোড: ১০১', address: 'গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার', instructions: 'রোল ০১ থেকে ২৫০ পর্যন্ত পরীক্ষার্থীদের জন্য নির্ধারিত।' },
      { name: 'বড়লেখা মডেল সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র', code: 'কেন্দ্র কোড: ১০২', address: 'পৌরসভা চত্বর, বড়লেখা সদর', instructions: 'রোল ২৫১ থেকে ৫০০ পর্যন্ত পরীক্ষার্থীদের জন্য নির্ধারিত।' },
      { name: 'লাউতা সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র', code: 'কেন্দ্র কোড: ১০৩', address: 'লাউতা ইউনিয়ন, বিয়ানীবাজার, সিলেট', instructions: 'লাউতা ইউনিয়ন জোনের সকল পরীক্ষার্থীর জন্য নির্ধারিত।' }
    ],
    galleryCountOnHome: 6,
    gallerySectionTitle: 'সংস্থার কার্যক্রম ও ঐতিহাসিক বৃত্তি পরীক্ষার স্থিরচিত্র',
    galleryColumns: 3,
    galleryShowCaptions: true,
    noticeDisplayLimit: 4,
    noticeBadgeText: 'অফিসিয়াল সার্কুলার',
    noticeHighlightPinned: true,
    contactHelplinePhone: '০১৭৫০-৯৬৯৭১২',
    contactEmailText: 'info@al-ikhwan-bd.org',
    presetThemeId: 'official_navy'
  },
  updatedAt: new Date().toISOString()
};

export const DEFAULT_ADMIT_CARD_DESIGN: AdmitCardDesign = {
  componentsOrder: ['header', 'banner', 'student_info', 'routine', 'instructions', 'declaration', 'signatures', 'qrcode'],
  orgNameBn: 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা',
  orgNameEn: 'AL-IKHWAN ISLAMIC SOCIAL WELFARE ORGANIZATION',
  subHeaderBn: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সমাজসেবা অধিদপ্তর কর্তৃক নিবন্ধিত (রেজিঃ নং ২৯৯/২০০০)',
  subHeaderEn: 'Regd. under Dept. of Social Services, Govt of Bangladesh (Reg. No: 299/2000) · Barlekha, Moulvibazar',
  examTitleBn: 'আল-ইখওয়ান প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা–২০২৬',
  examTitleEn: 'AL-IKHWAN PRIMARY & EBTEDAYEE SCHOLARSHIP EXAMINATION 2026',
  bannerTitleBn: 'E - ADMIT CARD',
  bannerTitleEn: 'E - ADMIT CARD',
  bannerBgColor: '#0070BA', // Authentic official blue banner matching attachment
  bannerTextColor: '#FFFFFF',

  fontFamily: 'serif',
  fontSize: 'normal',
  themeColor: '#0070BA',
  borderColor: '#072C4C',
  showBarcode: true,
  showQrCode: true,
  showBismillah: false, // NO Bismillah as explicitly instructed

  studentPhotoRight: true,
  studentSignatureBelowPhotoEmpty: true, // Empty slot below right photo

  reportingTimeTextBn: 'সকাল ০৯:৩০ টা (পরীক্ষা শুরুর ৩০ মিনিট পূর্বে)',
  reportingTimeTextEn: '09:30 AM (30 minutes before exam)',
  gateClosingTimeTextBn: 'সকাল ০৯:৪৫ টা (দেরিতে প্রবেশ সম্পূর্ণ নিষিদ্ধ)',
  gateClosingTimeTextEn: '09:45 AM (Strictly closed)',


  declarationStatementBn: 'আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য ও সঠিক। আমি একজন নিয়মিত শিক্ষার্থী হিসেবে পরীক্ষায় অংশগ্রহণ করছি এবং পরীক্ষা কেন্দ্রের সকল শৃঙ্খলা ও নির্দেশনা মেনে চলতে বাধ্য থাকব।',
  declarationStatementEn: 'I do hereby declare that all the information furnished above is true to the best of my knowledge and I will strictly abide by the rules of the examination.',

  instructionsTitle: 'পরীক্ষার্থীদের জন্য আবশ্যকীয় নিয়মাবলি:',
  instructions: [
    '১। পরীক্ষার্থীকে ওয়েবসাইট হতে রঙিন/স্পষ্ট প্রবেশপত্র প্রিন্ট করে পরীক্ষা কেন্দ্রে অবশ্যই সাথে নিয়ে আসতে হবে। প্রবেশপত্র ব্যতীত পরীক্ষা কক্ষে প্রবেশ নিষেধ।',
    '২। পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে (সকাল ০৯:৩০ টায়) নির্ধারিত পরীক্ষাকেন্দ্রে উপস্থিত হয়ে নিজ রোল অনুযায়ী আসন গ্রহণ করতে হবে।',
    '৩। কালো কালির বলপয়েন্ট কলম, পেন্সিল ও জ্যামিতি উপকরণ ব্যতীত অন্য কোনো কাগজ সাথে আনা যাবে না।',
    '৪। মোবাইল ফোন, স্মার্টওয়াচ বা যেকোনো ডিজিটাল ইলেকট্রনিক ডিভাইস পরীক্ষা কেন্দ্রে সম্পূর্ণ নিষিদ্ধ।'
  ],

  schoolInstructionsTitle: 'সাধারণ প্রাথমিক বিদ্যালয় ও কিন্ডারগার্টেন পরীক্ষার্থীদের নিয়মাবলি:',
  schoolInstructions: [
    '১। পরীক্ষার্থীকে ওয়েবসাইট হতে রঙিন বা স্পষ্ট প্রবেশপত্র প্রিন্ট করে পরীক্ষা কেন্দ্রে অবশ্যই সাথে নিয়ে আসতে হবে। প্রবেশপত্র ব্যতীত কাউকে পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।',
    '২। পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে (সকাল ০৯:৩০ টায়) নির্ধারিত কেন্দ্রে উপস্থিত হয়ে নিজ আসন গ্রহণ করতে হবে। পরীক্ষা শুরুর ১৫ মিনিট পূর্বে প্রধান ফটক বন্ধ হবে।',
    '৩। জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) এর ৫ম শ্রেণির সিলেবাসের আলোকে প্রণীত প্রশ্নপত্রের উত্তর প্রদান করতে হবে (বাংলা ২৫, ইংরেজি ২৫, গণিত ৩০, সাধারণ জ্ঞান/বিজ্ঞান ২০)।',
    '৪। উত্তরপত্রের কভারে রোল নম্বর, আবেদন নম্বর ও কেন্দ্র কোড সতর্কতার সাথে নির্ভুলভাবে লিখতে হবে। উত্তরপত্রে কোনো অপ্রয়োজনীয় দাগ দেওয়া বা ফ্লুইড ব্যবহার নিষিদ্ধ।',
    '৫। শুধুমাত্র কালো কালির বলপয়েন্ট কলম, পেন্সিল ও স্কেল ব্যবহারযোগ্য। ক্যালকুলেটর, মোবাইল ফোন বা যেকোনো ডিজিটাল ইলেকট্রনিক ডিভাইস পরীক্ষা কেন্দ্রে সম্পূর্ণ নিষিদ্ধ।',
    '৬। পরীক্ষা কক্ষে অসদুপায় অবলম্বন বা শৃঙ্খলা ভঙ্গ করলে সংশ্লিষ্ট পরীক্ষার্থীর পরীক্ষা অবিলম্বে বাতিল বলে গণ্য হবে।'
  ],

  madrasaInstructionsTitle: 'ইবতেদায়ী মাদ্রাসা শাখার পরীক্ষার্থীদের নিয়মাবলি:',
  madrasaInstructions: [
    '১। ইবতেদায়ী পরীক্ষার্থীদের ওয়েবসাইট হতে ডাউনলোডকৃত মূল প্রবেশপত্র অবশ্যই পরীক্ষা কেন্দ্রে সঙ্গে আনতে হবে। প্রবেশপত্র ব্যতিরেকে কোনো অবস্থাতেই পরীক্ষা কক্ষে আসন দেওয়া হবে না।',
    '২। পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে (সকাল ০৯:৩০ টায়) কেন্দ্রে উপস্থিত হয়ে নির্দিষ্ট রোল নম্বর অনুযায়ী আসন গ্রহণ করতে হবে। বিলম্বে আগত কাউকে কেন্দ্রে প্রবেশাধিকার দেওয়া হবে না।',
    '৩। বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ডের ইবতেদায়ী ৫ম শ্রেণির পাঠ্যসূচির আলোকে প্রণীত মাদ্রাসা শাখার নির্দিষ্ট প্রশ্নপত্রের উত্তর প্রদান করতে হবে।',
    '৪। উত্তরপত্রে পরীক্ষার্থীর রোল নম্বর ও অন্যান্য তথ্যাদি স্পষ্ট ও নির্ভুলভাবে লিখতে হবে। উত্তরপত্র পূরণে কালো বলপয়েন্ট কলম ব্যবহার আবশ্যক।',
    '৫। পরীক্ষা কক্ষে মোবাইল ফোন, স্মার্টওয়াচ, বই-খাতা বা যেকোনো ডিজিটাল ইলেকট্রনিক ডিভাইস সাথে রাখা সম্পূর্ণরূপে নিষিদ্ধ।',
    '৬। পরীক্ষা চলাকালীন কোনো প্রকার অসদুপায় বা শৃঙ্খলা পরিপন্থী কার্যকলাপ পরিলক্ষিত হলে সংশ্লিষ্ট পরীক্ষার্থীর পরীক্ষা তাৎক্ষণিক বাতিল হবে।'
  ],

  // 1. সাধারণ সম্পাদক - FIXED with authentic uploaded signature
  secretarySignFixed: true,
  secretaryTitleBn: 'সাধারণ সম্পাদক / সদস্য সচিব',
  secretaryTitleEn: 'General Secretary',
  secretaryName: 'মেহেরুল আমীন রিপন',
  secretarySignatureUrl: '/assets/signatures/secretary_sign.jpg',

  // 2. সভাপতি - FIXED with authentic uploaded signature
  shovapotiSignFixed: true,
  presidentTitleBn: 'সংস্থা সভাপতি',
  presidentTitleEn: 'President',
  presidentName: 'কামরুল হাছান',
  presidentSignatureUrl: '/assets/signatures/shovapoti_sign.jpg',

  // 3. পরীক্ষা নিয়ন্ত্রক - EMPTY SLOT (As requested: porikkha niyontrok slot empty)
  controllerSignEmptySlot: true,
  controllerTitleBn: 'পরীক্ষা নিয়ন্ত্রক',
  controllerTitleEn: 'Examination Controller',
  controllerName: 'বৃত্তি পরীক্ষা নিয়ন্ত্রণ পর্ষদ',
  controllerSignatureUrl: undefined, // Empty slot for manual signature/seal

  // 4. পরীক্ষার্থীর স্বাক্ষর - EMPTY SLOT (As requested: below student photo empty slot)
  candidateSignTitleBn: 'পরীক্ষার্থীর স্বাক্ষর',
  candidateSignTitleEn: 'Candidate Signature',

  officialSealUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">' +
    '<circle cx="60" cy="60" r="54" fill="none" stroke="#0070BA" stroke-width="2" stroke-dasharray="3,2"/>' +
    '<circle cx="60" cy="60" r="48" fill="none" stroke="#0070BA" stroke-width="1.5"/>' +
    '<text x="60" y="45" font-family="sans-serif" font-size="8" font-weight="bold" fill="#0070BA" text-anchor="middle">আল-ইখওয়ান সংস্থা</text>' +
    '<text x="60" y="60" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0070BA" text-anchor="middle">★ রেজিঃ ২৯৯ ★</text>' +
    '<text x="60" y="74" font-family="sans-serif" font-size="7" fill="#0070BA" text-anchor="middle">পরীক্ষা নিয়ন্ত্রণ সেল</text>' +
    '<text x="60" y="86" font-family="sans-serif" font-size="6" fill="#0070BA" text-anchor="middle">বড়লেখা, মৌলভীবাজার</text>' +
    '</svg>'
  ),
  admitFooterNoteBn: 'প্রবেশপত্রটি পরীক্ষা কক্ষে অবশ্যই পরিদর্শকের নিকট প্রদর্শন করতে হবে। কোনো কাটাকাটি বা অস্পষ্টতা গ্রহণযোগ্য নয়।',

  // 10+ Pro Controls defaults
  watermarkEnabled: true,
  watermarkType: 'logo',
  watermarkText: 'AL-IKHWAN 2026',
  watermarkOpacity: 0.08,
  borderStyle: 'double',
  innerBorderColor: '#0099DA',
  photoBorderStyle: 'badge',
  showParentNames: true,
  showDob: true,
  showGender: true,
  showExamCenter: true,
  showReportingTime: true,
  showSeal: true,
  sealSize: 105,
  sealRotation: -4,
  sealOpacity: 0.9,
  showCandidateSignSlot: true,
  instructionsFontSize: 'normal',
  instructionsStyle: 'numbered',
  customHelplinePhone: '০১৭৫০-৯৬৯৭১২',
  headerLayoutMode: 'classic_letterhead'
};
