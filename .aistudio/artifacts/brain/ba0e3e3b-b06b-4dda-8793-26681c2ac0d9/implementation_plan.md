# Individual Student Application Flow, Dynamic Admit Card Schedule & Money Receipt PDF

Comprehensive plan to restore individual student applications, enforce institutional quota rules, provide instantaneous money receipt PDFs, dynamically control admit card release schedules, and maintain a flexible Admit Card visual editor.

## Confirmed User Decisions

> [!IMPORTANT]
> The following requirements have been directly confirmed by the user:
> 1. **Individual Student Form Restored**: Replace the institute-level batch entry with the clean 4-step individual applicant flow (Student & Guardian $\to$ Institution & Address $\to$ Photo & Optional Signature $\to$ bKash Agent Cash Out Payment).
> 2. **School Quota Verification**: Enforce a maximum limit of 7 candidates per institution. The form checks real-time slot occupancy and warns when an institution's 7-seat quota is exhausted.
> 3. **bKash Agent Cash Out Tracking**: Fee of ৳100 paid via Cash Out to Agent **`01797-267924`**. Students must submit their personal Cash Out mobile number (`paymentSenderMobile`) and bKash TrxID.
> 4. **Post-Submission Delivery**: Upon submission, the user receives an official **Payment Receipt PDF (টাকা জমার মানি রসিদ)** for instant download. The Admit Card is held until the pre-defined scheduled date/time with clear instructional messaging.
> 5. **Admit Card Specifications**: Bismillah removed from top; exactly 4 bottom signatures (Candidate, Controller, Secretary, President). Any signature not provided is rendered as an empty underline. All styling, typography, and signers are editable in the dashboard.
> 6. **Dynamic Date Management**: Admit Card release date/time is dynamically editable from the Admin Dashboard under Campaign / Exam settings.

---

## 1. Overview & Core Concept

- **What It Does**: 
  - Restores the natural student registration workflow where each applicant submits their own verified information, checks that their school has remaining slots under the 7-student cap, and pays ৳100 via bKash Cash Out to agent `01797-267924`.
  - Instantly issues an official computer-generated **Money Receipt PDF** with QR code and transaction hash upon submission.
  - Locks admit card downloads until the administrative release schedule is met, guiding applicants with a countdown and lookup instructions.
  - Provides administrators with a live Admit Card Editor and Campaign Scheduler to adjust fonts, signer details, and unlock timestamps.

---

## 2. User Experience & Visual Design

### 2.1 The 4-Step Application Wizard (`ApplicationWizard.tsx`)
```
┌────────────────────────────────────────────────────────────────────────┐
│                        অনলাইন আবেদন ও নিবন্ধন ফরম                     │
│               ফি: ১০০ টাকা · বিকাশ এজেন্ট ক্যাশ আউট: ০১৭৯৭-২৬৭৯২৪        │
├─────────────┬─────────────────┬──────────────────┬─────────────────────┤
│   ধাপ ১     │      ধাপ ২      │       ধাপ ৩      │        ধাপ ৪        │
│ শিক্ষার্থী ও   │  প্রতিষ্ঠান ও    │      ছবি ও       │     পরীক্ষার ফি ও    │
│ অভিভাবকের তথ্য │      ঠিকানা     │    স্বাক্ষর       │       পেমেন্ট       │
└─────────────┴─────────────────┴──────────────────┴─────────────────────┘
```

1. **ধাপ ১: শিক্ষার্থী ও অভিভাবক**:
   - শিক্ষার্থী নাম (বাংলা ও ইংরেজি ক্যাপিটাল), জন্ম তারিখ, লিঙ্গ (ছাত্র/ছাত্রী), পিতা ও মাতার নাম, অভিভাবকের মোবাইল নম্বর।
2. **ধাপ ২: প্রতিষ্ঠান ও ঠিকানা**:
   - শিক্ষাপ্রতিষ্ঠান ড্রপডাউন (বা কাস্টম নাম), ধরন (সরকারি প্রাথমিক / কিন্ডারগার্টেন / ইবতেদায়ী মাদ্রাসা), উপজেলা ও ইউনিয়ন।
   - **রিয়েল-টাইম কোটা ব্যাজ**: "এই প্রতিষ্ঠানে ৭টি কোটার মধ্যে Xটি বাকি আছে"। যদি ৭ জন ইতিমধ্যে নিবন্ধিত থাকে, তবে বন্ধুত্বপূর্ণ নোটিশ প্রদর্শন করবে।
3. **ধাপ ৩: ছবি ও স্বাক্ষর**:
   - পাসপোর্ট সাইজের ছবির আপলোড ও স্বয়ংক্রিয় কম্প্রেশন (বাধ্যতামূলক)।
   - **শিক্ষার্থীর স্বাক্ষর (ঐচ্ছিক)**: ছাত্র-ছাত্রী চাইলে স্বাক্ষর আপলোড করতে পারবে; আপলোড না করলে কোনো ত্রুটি দেখাবে না এবং প্রবেশপত্রে ফাঁকা দাগ প্রদর্শিত হবে।
4. **ধাপ ৪: পরীক্ষার ফি ও বিকাশ এজেন্ট পেমেন্ট**:
   - সুস্পষ্ট নির্দেশিকা: বিকাশ এজেন্ট নাম্বারে (০১৭৯৭-২৬৭৯২৪) ১০০/- টাকা ক্যাশ আউট করতে হবে।
   - ইনপুট: **যে নম্বর থেকে ক্যাশ আউট করা হয়েছে** (`paymentSenderMobile`), বিকাশ TrxID, এবং সত্যতা ঘোষণার চেকবক্স।

### 2.2 সফল আবেদন ও পোস্ট-সাবমিশন স্ক্রিন
```
┌────────────────────────────────────────────────────────────────────────┐
│                      ✓ আবেদন ও পেমেন্ট সফলভাবে সম্পন্ন!                 │
├────────────────────────────────────────────────────────────────────────┤
│ আবেদন নম্বর: ALIKH-2026-00101 · রোল নম্বর: ২৮২১ · TrxID: BKX889922      │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  টাকা জমার অফিসিয়াল মানি রসিদ (Money Receipt)                       │ │
│ │  ফি: ১০০ টাকা · পরিশোধ পদ্ধতি: বিকাশ এজেন্ট ক্যাশ আউট               │ │
│ │  [ 📥 মানি রসিদ ডাউনলোড করুন (PDF) ]  [ 🖨️ প্রিন্ট করুন ]           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  📅 প্রবেশপত্র সংগ্রহের সময়সূচি সংক্রান্ত নির্দেশনা               │ │
│ │  আগামী ১৪ নভেম্বর ২০২৬ সকাল ৯:০০ টা থেকে প্রবেশপত্র ডাউনলোড করা    │ │
│ │  যাবে। 'প্রবেশপত্র' মেনুতে গিয়ে আবেদন নম্বর অথবা মোবাইল নম্বর দিয়ে│ │
│ │  আপনার প্রবেশপত্র সংগ্রহ করতে পারবেন।                              │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Admit Card Specifications & Live Editor

### 3.1 Admit Card Layout (`AdmitCardView.tsx`)
- **শীর্ষভাগ**: বিসমিল্লাহ ডিফল্টভাবে সম্পূর্ণ বাদ।
- **সংস্থার তথ্য**: আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা, রেজিঃ ২৯৯, স্থাপিত ২০০০ইং, গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার।
- **পরীক্ষার্থীর তথ্য ও ছবি**: নাম, রোল, রেজিঃ/অ্যাপ নম্বর, প্রতিষ্ঠান, কেন্দ্র, পরীক্ষার তারিখ ও সময়।
- **৪টি অফিসিয়াল স্বাক্ষর (তলভাগ)**:
  1. **পরীক্ষার্থীর স্বাক্ষর**: ছাত্রের নিজস্ব স্বাক্ষর (যদি আপলোড করে থাকে) অথবা খালি আন্ডারলাইন।
  2. **পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর ও সিল**: অফিশিয়াল স্বাক্ষর বা সিল।
  3. **সাধারণ সম্পাদক / সদস্য সচিবের স্বাক্ষর**: মহাসচিব/সচিবের স্বাক্ষর।
  4. **সংস্থা সভাপতির স্বাক্ষর**: সভাপতির স্বাক্ষর।
  - *যদি কোনো স্বাক্ষর আপলোড করা না থাকে, তবে সেটি পরিষ্কার খালি স্বাক্ষর দাগ হিসেবে থাকবে। কোনো ভাঙা ছবি বা বিকল্প টেক্সট আসবে না।*

### 3.2 অ্যাডমিন অ্যাডমিট কার্ড এডিটর (`AdmitCardEditor.tsx`)
- অ্যাডমিন প্যানেলে লাইভ প্রিভিউ সহ ডিজাইন কাস্টমাইজার:
  - ফন্ট টাইপ (Hind Siliguri / Noto Sans / Serif), মার্জিন ও প্যাডিং স্কেলিং।
  - ৪টি স্বাক্ষরের পদবি (Titles), নাম (Names) এবং স্বাক্ষর ছবি আপলোড/রিমুভ।
  - পরীক্ষা সংক্রান্ত নিয়মাবলী/নির্দেশনা যুক্ত ও এডিট করার অপশন।
  - ক্যাম্পেইন সেকশনে `admitCardAvailableDate` রিয়েল-টাইমে পরিবর্তনযোগ্য।

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────┐       ┌────────────────────────┐
│  ApplicationWizard      │       │  AdminPortal           │
│  (4-Step Individual)    │       │  - AdmitCardEditor     │
│  - 7-quota verification │       │  - Campaign Schedule   │
└────────────┬────────────┘       └───────────┬────────────┘
             │                                │
             ▼                                ▼
┌──────────────────────────────────────────────────────────┐
│                 storage.ts (Local & Synced)              │
│  - applicants[] (paymentSenderMobile, schoolName, etc.)  │
│  - getSchoolApplicantCount(schoolName)                   │
│  - admitCardDesign (fonts, borders, 4 signatures)        │
│  - campaign.admitCardAvailableDate                       │
└────────────┬────────────────────────────────┬────────────┘
             │                                │
             ▼                                ▼
┌─────────────────────────┐       ┌────────────────────────┐
│   pdfGenerator.ts       │       │   AdmitCardView        │
│   - generateReceiptPDF  │       │   - Scheduled Gate     │
│   - generateAdmitPDF    │       │   - 4 Clean Signatures │
└─────────────────────────┘       └────────────────────────┘
```

### 4.1 Key Code Enhancements
1. **`src/services/storage.ts`**:
   - `getSchoolApplicantCount(schoolName: string): number`: Counts approved/registered students for a specific school to enforce the 7-student cap.
   - `getAdmitCardDesign()` & `saveAdmitCardDesign()`: Preserves optional signatures with empty states.
2. **`src/utils/pdfGenerator.ts`**:
   - `generateReceiptPDF({ applicant, receipt, settings, lang })`: Generates a crisp vector Money Receipt PDF with bKash Cash Out number, TrxID, amount ৳100, and verification seal.
   - `generateAdmitCardPDF`: Updated to cleanly render 4 bottom signatures without Bismillah, honoring empty candidate/official signatures gracefully.
3. **`src/components/ApplicationWizard.tsx`**:
   - Replaced batch institute entry with individual student 4-step wizard.
   - Enforces school 7-slot quota with real-time feedback.
   - Makes signature upload optional.
   - Post-submission screen downloads Money Receipt PDF and presents the Admit Card availability schedule.
4. **`src/components/PaymentReceiptView.tsx`**:
   - Updated to show sender mobile number and download receipt PDF immediately.

---

## 5. Verification Plan

- Run `lint_applet` to confirm zero TypeScript or linting issues.
- Run `compile_applet` to ensure successful production build.
- Test school quota count limit (max 7 per school).
- Verify bKash Cash Out agent number `01797-267924` and sender number persistence.
- Test PDF generation for both Money Receipt and Admit Card.
