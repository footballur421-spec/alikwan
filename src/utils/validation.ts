export type SchoolCategory = 'primary' | 'kindergarten' | 'madrasa';
export type CampaignStatus = 'upcoming' | 'active' | 'closed' | 'archived';

export const CATEGORY_START_ROLLS: Record<SchoolCategory, number> = {
  primary: 2821,
  kindergarten: 3001,
  madrasa: 3201
};

export const MAX_STUDENTS_PER_SCHOOL = 7;

export function convertToBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '০';
  if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) return '০';
  const str = String(val).trim();
  if (!str || str === 'NaN' || str === 'null' || str === 'undefined') return '০';
  
  // If string already contains literal 'NaN', sanitize it
  const cleanStr = str.replace(/NaN/g, '০').replace(/null/g, '').replace(/undefined/g, '');
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return cleanStr.replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

export function convertBengaliToEnglishDigits(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val).replace(/NaN/g, '').replace(/null/g, '').replace(/undefined/g, '');
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, d => bnToEn[d] || d);
}

export function validateMobile(mobile: string): { isValid: boolean; error?: string } {
  if (!mobile || !mobile.trim()) {
    return { isValid: false, error: 'মোবাইল নম্বর দেওয়া বাধ্যতামূলক' };
  }
  const clean = mobile.replace(/[\s-]/g, '');
  // Standard Bangladesh mobile operator format: 013 to 019, followed by 8 digits
  const regex = /^01[3-9]\d{8}$/;
  if (!regex.test(clean)) {
    return { isValid: false, error: 'সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)' };
  }
  return { isValid: true };
}

export function validateDOB(dob: string): { isValid: boolean; error?: string } {
  if (!dob) {
    return { isValid: false, error: 'জন্মতারিখ নির্বাচন করা আবশ্যক' };
  }
  const birthDate = new Date(dob);
  const now = new Date();
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'অবৈধ জন্মতারিখ' };
  }
  if (birthDate >= now) {
    return { isValid: false, error: 'জন্মতারিখ ভবিষ্যতের হতে পারে না' };
  }
  // Age range for Class 5 (typically 9 to 13 years, allowing 8 to 15 years max)
  const ageYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (ageYears < 8 || ageYears > 15) {
    return { isValid: false, error: 'পঞ্চম শ্রেণির প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষার জন্য বয়স ৮ থেকে ১৫ বছরের মধ্যে হতে হবে' };
  }
  return { isValid: true };
}

export function generateApplicationNo(sequence: number): string {
  const pad = String(sequence).padStart(5, '0');
  return `ALIKH-2026-${pad}`;
}

export function generateAdmitCardNo(applicationNo: string): string {
  const suffix = applicationNo.replace(/[^0-9]/g, '').slice(-5);
  return `AC-2026-${suffix}`;
}

/**
 * সেকশন ৬: তিনটি স্বতন্ত্র ক্যাটাগরি ও তাদের রোল নম্বর বরাদ্দকরণ
 * ১. সরকারি প্রাথমিক বিদ্যালয় (primary) — প্রারম্ভিক রোল: ২৮২১
 * ২. কিন্ডারগার্টেন (kindergarten) — প্রারম্ভিক রোল: ৩০০১
 * ৩. ইবতেদায়ী / মাদ্রাসা (madrasa) — প্রারম্ভিক রোল: ৩২০১
 */
export function getCategoryStartRoll(category: SchoolCategory): number {
  return CATEGORY_START_ROLLS[category] || 2821;
}

export function allocateCategoryRoll(
  category: SchoolCategory,
  existingApplicants: Array<{ schoolCategory?: SchoolCategory; rollNumber?: string }>,
  customStartRoll?: number
): string {
  const baseRoll = customStartRoll ?? getCategoryStartRoll(category);

  // Find all numeric rolls currently assigned in this category
  const allocatedRolls = existingApplicants
    .filter(a => a.schoolCategory === category && a.rollNumber)
    .map(a => parseInt(a.rollNumber as string, 10))
    .filter(n => !isNaN(n) && n >= baseRoll);

  if (allocatedRolls.length === 0) {
    return String(baseRoll);
  }

  // Find max allocated roll and assign next sequential
  const maxRoll = Math.max(...allocatedRolls);
  return String(maxRoll + 1);
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'ইমেইল ঠিকানা প্রদান করা আবশ্যক' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'সঠিক ইমেইল ঠিকানা লিখুন (যেমন: student@example.com)' };
  }
  return { isValid: true };
}

export function generateVerificationToken(appNo: string): string {
  let hash = 0;
  for (let i = 0; i < appNo.length; i++) {
    hash = ((hash << 5) - hash) + appNo.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash).toString(36).toUpperCase();
  return `VRF-${positive}-${appNo.slice(-4)}`;
}

export function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * নীতিমালার আঞ্চলিক যোগ্যতা যাচাই:
 * ১. মৌলভীবাজার জেলার বড়লেখা উপজেলার শিক্ষাপ্রতিষ্ঠান
 * ২. সিলেট জেলার বিয়ানীবাজার উপজেলার লাউতা ইউনিয়ন পরিষদের আওতাধীন শিক্ষাপ্রতিষ্ঠান
 */
export function isAreaEligible(district?: string, upazila?: string, unionOrArea?: string): boolean {
  if (!district || !upazila) return false;
  const d = district.trim();
  const u = upazila.trim();

  if (d === 'মৌলভীবাজার' && (u === 'বড়লেখা' || u === 'বড়লেখা')) {
    return true;
  }

  if (d === 'সিলেট' && (u === 'বিয়ানীবাজার' || u === 'বিয়ানীবাজার')) {
    // বিয়ানীবাজারের ক্ষেত্রে শুধুমাত্র লাউতা ইউনিয়ন পরিষদের আওতাধীন প্রতিষ্ঠান যোগ্য
    if (!unionOrArea || unionOrArea.includes('লাউতা')) {
      return true;
    }
  }

  return false;
}

/**
 * সেকশন ৫: একটি শিক্ষাপ্রতিষ্ঠান থেকে সর্বোচ্চ ০৭ জন শিক্ষার্থীর কোটা পরীক্ষা
 */
export function checkSchoolQuota(
  schoolName: string,
  existingApplicants: Array<{ schoolName: string; id?: string; status?: string }>,
  currentApplicantId?: string
): { isAllowed: boolean; count: number; max: number; remaining: number; error?: string } {
  const cleanSchool = schoolName.trim().toLowerCase();
  if (!cleanSchool || cleanSchool === 'অন্যান্য (নিজে লিখুন)'.toLowerCase()) {
    return { isAllowed: true, count: 0, max: MAX_STUDENTS_PER_SCHOOL, remaining: MAX_STUDENTS_PER_SCHOOL };
  }

  // Count existing active applicants for this school (ignoring rejected ones and current applicant in edit mode)
  const count = existingApplicants.filter(a => {
    if (currentApplicantId && a.id === currentApplicantId) return false;
    if (a.status === 'rejected') return false;
    return a.schoolName.trim().toLowerCase() === cleanSchool;
  }).length;

  const remaining = Math.max(0, MAX_STUDENTS_PER_SCHOOL - count);

  if (count >= MAX_STUDENTS_PER_SCHOOL) {
    return {
      isAllowed: false,
      count,
      max: MAX_STUDENTS_PER_SCHOOL,
      remaining: 0,
      error: `এই শিক্ষাপ্রতিষ্ঠান (${schoolName}) থেকে ইতোমধ্যে সর্বোচ্চ ${convertToBengaliNumber(MAX_STUDENTS_PER_SCHOOL)} জন শিক্ষার্থীর কোটা পূর্ণ হয়ে গেছে। নীতিমালা অনুযায়ী একই প্রতিষ্ঠান থেকে ৭ জনের বেশি আবেদন গ্রহণ করা যাবে না।`
    };
  }

  return { isAllowed: true, count, max: MAX_STUDENTS_PER_SCHOOL, remaining };
}

/**
 * সেকশন ৩ ও ৪: বাংলাদেশ সময় (Asia/Dhaka) অনুযায়ী ক্যাম্পেইন স্ট্যাটাস ও আবেদন উইন্ডো হিসাব
 */
export function calculateCampaignStatus(
  campaign: { applicationStartDate: string; applicationEndDate: string; statusOverride?: CampaignStatus },
  currentDate?: Date
): {
  status: CampaignStatus;
  isOpenForApplication: boolean;
  messageBn: string;
} {
  if (campaign.statusOverride) {
    return {
      status: campaign.statusOverride,
      isOpenForApplication: campaign.statusOverride === 'active',
      messageBn: campaign.statusOverride === 'active' 
        ? 'অনলাইন আবেদন চলমান রয়েছে।' 
        : campaign.statusOverride === 'upcoming' 
        ? 'অনলাইন আবেদন শীঘ্রই শুরু হবে।' 
        : 'আবেদন প্রক্রিয়া সমাপ্ত হয়েছে।'
    };
  }

  const now = currentDate || new Date();
  
  // Format current date in YYYY-MM-DD
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (todayStr < campaign.applicationStartDate) {
    return {
      status: 'upcoming',
      isOpenForApplication: false,
      messageBn: `অনলাইন আবেদন এখনও শুরু হয়নি। আবেদন শুরুর তারিখ: ${convertToBengaliNumber(campaign.applicationStartDate)}।`
    };
  }

  if (todayStr > campaign.applicationEndDate) {
    return {
      status: 'closed',
      isOpenForApplication: false,
      messageBn: `অনলাইন আবেদনের সময়সীমা শেষ হয়েছে (${convertToBengaliNumber(campaign.applicationEndDate)})। নতুন আবেদন গ্রহণ বন্ধ রয়েছে।`
    };
  }

  return {
    status: 'active',
    isOpenForApplication: true,
    messageBn: `অনলাইন আবেদন কার্যক্রম চলমান রয়েছে। আবেদনের শেষ সময়: ${convertToBengaliNumber(campaign.applicationEndDate)}।`
  };
}

export function validateApplicantStep1(data: {
  nameBn?: string;
  nameEn?: string;
  dob?: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  mobile?: string;
}): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  if (!data.nameBn || data.nameBn.trim().length < 3) {
    errors.nameBn = 'শিক্ষার্থীর পূর্ণ নাম বাংলায় লিখুন (কমপক্ষে ৩ অক্ষর)';
  }
  if (!data.nameEn || data.nameEn.trim().length < 3) {
    errors.nameEn = 'শিক্ষার্থীর পূর্ণ নাম ইংরেজিতে লিখুন (কমপক্ষে ৩ অক্ষর)';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(data.nameEn.trim())) {
    errors.nameEn = 'ইংরেজি নামে কেবল ইংরেজি বর্ণমালা ও ডট ব্যবহার করুন';
  }
  
  const dobCheck = validateDOB(data.dob || '');
  if (!dobCheck.isValid) {
    errors.dob = dobCheck.error || 'সঠিক জন্মতারিখ দিন';
  }

  if (!data.fatherName || data.fatherName.trim().length < 3) {
    errors.fatherName = 'পিতা/অভিভাবকের নাম বাংলায় লিখুন';
  }
  if (!data.motherName || data.motherName.trim().length < 3) {
    errors.motherName = 'মাতার নাম বাংলায় লিখুন';
  }

  const mobileCheck = validateMobile(data.mobile || '');
  if (!mobileCheck.isValid) {
    errors.mobile = mobileCheck.error || 'সঠিক মোবাইল নম্বর লিখুন';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateApplicantStep2(
  data: {
    schoolName?: string;
    schoolCategory?: SchoolCategory;
    className?: string;
    rollNo?: string;
    division?: string;
    district?: string;
    upazila?: string;
    unionOrArea?: string;
    presentAddress?: string;
    permanentAddress?: string;
    headmasterApproved?: boolean;
  },
  existingApplicants?: Array<{ schoolName: string; id?: string; status?: string }>,
  currentApplicantId?: string
): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  if (!data.schoolName || !data.schoolName.trim() || data.schoolName === 'অন্যান্য (নিজে লিখুন)') {
    errors.schoolName = 'বিদ্যালয়/মাদ্রাসার নাম নির্বাচন বা উল্লেখ করুন';
  }

  if (!data.schoolCategory) {
    errors.schoolCategory = 'শিক্ষাপ্রতিষ্ঠানের ক্যাটাগরি নির্বাচন করুন (প্রাথমিক/কেজি/মাদ্রাসা)';
  }

  // Class 5 only validation (Requirement: শুধুমাত্র পঞ্চম শ্রেণির শিক্ষার্থীরা)
  if (!data.className || !data.className.trim()) {
    errors.className = 'শ্রেণি নির্বাচন করুন';
  } else if (!data.className.includes('পঞ্চম') && !data.className.includes('৫ম') && !data.className.includes('5')) {
    errors.className = 'নীতিমালা অনুযায়ী শুধুমাত্র পঞ্চম শ্রেণির (সাধারণ বা ইবতেদায়ী) শিক্ষার্থীরা এই পরীক্ষায় অংশ নিতে পারবে।';
  }

  if (!data.rollNo || !data.rollNo.trim()) {
    errors.rollNo = 'বিদ্যালয়ের শ্রেণি রোল নম্বর লিখুন';
  }

  if (!data.district) {
    errors.district = 'জেলা নির্বাচন করুন';
  }
  if (!data.upazila) {
    errors.upazila = 'উপজেলা নির্বাচন করুন';
  }

  // Institutional region eligibility validation
  if (data.district && data.upazila) {
    const isEligible = isAreaEligible(data.district, data.upazila, data.unionOrArea);
    if (!isEligible) {
      errors.upazila = 'নীতিমালা অনুযায়ী শুধুমাত্র বড়লেখা উপজেলা এবং বিয়ানীবাজার উপজেলার লাউতা ইউনিয়নের অন্তর্গত শিক্ষাপ্রতিষ্ঠান যোগ্য।';
    }
  }

  // Maximum 7 students per school limit check
  if (data.schoolName && existingApplicants) {
    const quota = checkSchoolQuota(data.schoolName, existingApplicants, currentApplicantId);
    if (!quota.isAllowed) {
      errors.schoolName = quota.error || 'এই বিদ্যালয় থেকে সর্বোচ্চ ৭ জনের কোটা পূর্ণ হয়ে গেছে।';
    }
  }

  // Headmaster approval declaration confirmation
  if (data.headmasterApproved === false || data.headmasterApproved === undefined) {
    errors.headmasterApproved = 'প্রধান শিক্ষকের অনুমতির বিষয়টি ঘোষণা বক্সে টিক দিয়ে নিশ্চিত করা আবশ্যক।';
  }

  if (!data.presentAddress || data.presentAddress.trim().length < 5) {
    errors.presentAddress = 'বর্তমান ঠিকানা বিস্তারিত লিখুন (গ্রাম, ডাকঘর ইত্যাদি)';
  }
  if (!data.permanentAddress || data.permanentAddress.trim().length < 5) {
    errors.permanentAddress = 'স্থায়ী ঠিকানা বিস্তারিত লিখুন';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
