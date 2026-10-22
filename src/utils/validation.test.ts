import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMobile,
  validateDOB,
  generateApplicationNo,
  validateEmail,
  convertToBengaliNumber,
  validateApplicantStep1,
  validateApplicantStep2,
  isAreaEligible,
  checkSchoolQuota,
  allocateCategoryRoll,
  calculateCampaignStatus
} from './validation.ts';

test('validateMobile validates valid Bangladeshi mobile numbers', () => {
  assert.equal(validateMobile('01712345678').isValid, true);
  assert.equal(validateMobile('01899887766').isValid, true);
  assert.equal(validateMobile('01300000000').isValid, true);
  assert.equal(validateMobile('01955555555').isValid, true);
});

test('validateMobile rejects invalid numbers', () => {
  assert.equal(validateMobile('01212345678').isValid, false);
  assert.equal(validateMobile('0171234567').isValid, false);
  assert.equal(validateMobile('017123456789').isValid, false);
  assert.equal(validateMobile('').isValid, false);
});

test('validateDOB rejects future dates and out-of-range ages', () => {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  assert.equal(validateDOB(future.toISOString().split('T')[0]).isValid, false);

  const validDob = new Date();
  validDob.setFullYear(validDob.getFullYear() - 10);
  assert.equal(validateDOB(validDob.toISOString().split('T')[0]).isValid, true);

  const tooYoung = new Date();
  tooYoung.setFullYear(tooYoung.getFullYear() - 4);
  assert.equal(validateDOB(tooYoung.toISOString().split('T')[0]).isValid, false);
});

test('generateApplicationNo produces formatted ID', () => {
  assert.equal(generateApplicationNo(1), 'ALIKH-2026-00001');
  assert.equal(generateApplicationNo(142), 'ALIKH-2026-00142');
});

test('Category-specific roll numbers allocate starting at 2821, 3001, and 3201', () => {
  // 1. Primary starts at 2821
  const rollPri1 = allocateCategoryRoll('primary', []);
  assert.equal(rollPri1, '2821');

  // Next in primary
  const rollPri2 = allocateCategoryRoll('primary', [
    { schoolCategory: 'primary', rollNumber: '2821' }
  ]);
  assert.equal(rollPri2, '2822');

  // 2. Kindergarten starts at 3001
  const rollKg1 = allocateCategoryRoll('kindergarten', []);
  assert.equal(rollKg1, '3001');

  const rollKg2 = allocateCategoryRoll('kindergarten', [
    { schoolCategory: 'kindergarten', rollNumber: '3001' }
  ]);
  assert.equal(rollKg2, '3002');

  // 3. Madrasa starts at 3201
  const rollMad1 = allocateCategoryRoll('madrasa', []);
  assert.equal(rollMad1, '3201');

  const rollMad2 = allocateCategoryRoll('madrasa', [
    { schoolCategory: 'madrasa', rollNumber: '3201' },
    { schoolCategory: 'madrasa', rollNumber: '3202' }
  ]);
  assert.equal(rollMad2, '3203');
});

test('convertToBengaliNumber correctly maps digits', () => {
  assert.equal(convertToBengaliNumber(2026), '২০২৬');
  assert.equal(convertToBengaliNumber('01750969712'), '০১৭৫০৯৬৯৭১২');
  assert.equal(convertToBengaliNumber('2821'), '২৮২১');
});

test('validateApplicantStep1 catches missing mandatory fields', () => {
  const result = validateApplicantStep1({});
  assert.equal(result.isValid, false);
  assert.ok(result.errors.nameBn);
  assert.ok(result.errors.nameEn);
  assert.ok(result.errors.dob);
  assert.ok(result.errors.fatherName);
  assert.ok(result.errors.motherName);
  assert.ok(result.errors.mobile);
});

test('isAreaEligible accurately tests Barlekha and Lauta Union of Beanibazar', () => {
  assert.equal(isAreaEligible('মৌলভীবাজার', 'বড়লেখা'), true);
  assert.equal(isAreaEligible('মৌলভীবাজার', 'বড়লেখা'), true);
  assert.equal(isAreaEligible('সিলেট', 'বিয়ানীবাজার', 'লাউতা ইউনিয়ন'), true);
  assert.equal(isAreaEligible('সিলেট', 'বিয়ানীবাজার', 'লাউতা ইউনিয়ন'), true);
  // Ineligible areas
  assert.equal(isAreaEligible('মৌলভীবাজার', 'কুলাউড়া'), false);
  assert.equal(isAreaEligible('সিলেট', 'গোলাপগঞ্জ'), false);
  assert.equal(isAreaEligible('ঢাকা', 'ধানমন্ডি'), false);
});

test('checkSchoolQuota enforces maximum 7 applicants per institution', () => {
  const sampleList = [
    { schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'approved' },
    { schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'submitted' },
    { schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'approved' },
    { schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'approved' },
    { schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'approved' },
    { schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'submitted' },
  ];

  // 6th applicant -> allowed
  const canAdd7th = checkSchoolQuota('গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', sampleList);
  assert.equal(canAdd7th.isAllowed, true);
  assert.equal(canAdd7th.count, 6);
  assert.equal(canAdd7th.remaining, 1);

  // Add 7th applicant to list
  sampleList.push({ schoolName: 'গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', status: 'approved' });

  // 8th applicant -> MUST BE REJECTED
  const reject8th = checkSchoolQuota('গলাসাসন সরকারি প্রাথমিক বিদ্যালয়', sampleList);
  assert.equal(reject8th.isAllowed, false);
  assert.equal(reject8th.count, 7);
  assert.equal(reject8th.remaining, 0);
  assert.ok(reject8th.error?.includes('৭'));
});

test('calculateCampaignStatus accurately handles upcoming, active, and closed dates', () => {
  const campaign = {
    applicationStartDate: '2026-10-25',
    applicationEndDate: '2026-11-05'
  };

  // Test before opening: 2026-10-20 -> upcoming
  const upcoming = calculateCampaignStatus(campaign, new Date('2026-10-20T10:00:00Z'));
  assert.equal(upcoming.status, 'upcoming');
  assert.equal(upcoming.isOpenForApplication, false);

  // Test during active period: 2026-10-28 -> active
  const active = calculateCampaignStatus(campaign, new Date('2026-10-28T10:00:00Z'));
  assert.equal(active.status, 'active');
  assert.equal(active.isOpenForApplication, true);

  // Test after closing: 2026-11-06 -> closed
  const closed = calculateCampaignStatus(campaign, new Date('2026-11-06T10:00:00Z'));
  assert.equal(closed.status, 'closed');
  assert.equal(closed.isOpenForApplication, false);
});

test('validateEmail correctly accepts valid and rejects malformed email addresses', () => {
  assert.equal(validateEmail('test@example.com').isValid, true);
  assert.equal(validateEmail('student.guardian@school.edu.bd').isValid, true);
  assert.equal(validateEmail('invalid-email').isValid, false);
  assert.equal(validateEmail('').isValid, false);
});

