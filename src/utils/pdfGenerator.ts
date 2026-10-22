// ==============================================================================
// Al-Ikhwan Islamic Social Welfare Organization — Official PDF Generation Engine
// Generates pixel-perfect, high-resolution, authentic Admit Card and Receipt PDFs
// ==============================================================================

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Applicant, ExamSettings, INSTITUTION, OfficialSignatures, AdmitCardDesign, PaymentReceipt } from '../types';
import { convertToBengaliNumber, generateVerificationToken } from './validation';
import { SupportedLang, toLangNumber } from './i18n';
import { storage } from '../services/storage';

/**
 * Safely converts an image URL (relative or remote) to a base64 Data URL.
 * This completely prevents HTML5 canvas tainting and SecurityErrors during html2canvas rendering.
 */
export async function urlToDataUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string || url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export interface GenerateAdmitCardPdfOptions {
  applicant: Applicant;
  settings: ExamSettings;
  officialSignatures?: OfficialSignatures;
  design?: AdmitCardDesign;
  lang?: SupportedLang;
}

/**
 * Renders the official Al-Ikhwan Admit Card and saves as high-res PDF.
 * Uses html2canvas on the exact DOM element with all images converted to base64
 * so the PDF layout is 100% IDENTICAL to what is shown on screen and in the editor.
 */
export async function generateAdmitCardPDF({
  applicant,
  settings,
  officialSignatures,
  design,
  lang = 'bn',
}: GenerateAdmitCardPdfOptions): Promise<{ success: boolean; error?: string; fileName?: string }> {
  try {
    const activeDesign: AdmitCardDesign = design || storage.getAdmitCardDesign();
    const safeAppNo = applicant.applicationNo.replace(/[^a-zA-Z0-9-]/g, '_');
    const fileName = `Al-Ikhwan_AdmitCard_${safeAppNo}.pdf`;

    if (typeof document === 'undefined') {
      throw new Error('PDF generation requires a browser DOM environment');
    }

    // Locate the on-screen admit card container
    let sourceElem = document.getElementById('admit-card-to-print');
    let isCreatedElement = false;
    let wrapperContainer: HTMLElement | null = null;

    if (!sourceElem) {
      // Create a temporary off-screen container matching the exact layout
      wrapperContainer = document.createElement('div');
      wrapperContainer.style.position = 'fixed';
      wrapperContainer.style.left = '-9999px';
      wrapperContainer.style.top = '0';
      wrapperContainer.style.width = '794px';
      wrapperContainer.style.zIndex = '-9999';
      wrapperContainer.style.backgroundColor = '#FFFFFF';
      document.body.appendChild(wrapperContainer);

      // We will clone or build the admit card innerHTML
      isCreatedElement = true;
    }

    const targetElem = sourceElem || wrapperContainer;
    if (!targetElem) throw new Error('Admit card container element not found');

    // Pre-convert all <img> sources inside targetElem to data URLs to guarantee untainted canvas
    const images = Array.from(targetElem.querySelectorAll('img'));
    const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

    await Promise.all(
      images.map(async (img) => {
        const currentSrc = img.src || img.getAttribute('src');
        if (currentSrc && !currentSrc.startsWith('data:')) {
          originalSrcs.push({ img, src: currentSrc });
          const dataUrl = await urlToDataUrl(currentSrc);
          if (dataUrl && dataUrl.startsWith('data:')) {
            img.src = dataUrl;
          }
        }
      })
    );

    // Render with html2canvas (scale 2.0 provides 300DPI print sharpness)
    const domCanvas = await html2canvas(targetElem, {
      scale: 2.0,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowWidth: 1200,
      imageTimeout: 15000,
    });

    // Restore original image sources
    originalSrcs.forEach(({ img, src }) => {
      try {
        img.src = src;
      } catch {}
    });

    if (isCreatedElement && wrapperContainer && wrapperContainer.parentNode) {
      wrapperContainer.parentNode.removeChild(wrapperContainer);
    }

    const imgData = domCanvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgHeight = (domCanvas.height * pageWidth) / domCanvas.width;

    // Center vertically if within page
    const yOffset = imgHeight < pageHeight ? Math.max(0, (pageHeight - imgHeight) / 6) : 0;
    pdf.addImage(imgData, 'JPEG', 0, yOffset, pageWidth, Math.min(imgHeight, pageHeight));
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (err: any) {
    console.error('Admit Card PDF Generation Error:', err);
    return { success: false, error: err.message || 'PDF Generation failed' };
  }
}

export interface GenerateReceiptPdfOptions {
  applicant: Applicant;
  receipt?: PaymentReceipt | null;
  settings?: ExamSettings;
  lang?: SupportedLang;
}

/**
 * Renders official Money Receipt PDF for Al-Ikhwan Exam Fee (NO Bismillah)
 */
export async function generateReceiptPDF({
  applicant,
  receipt,
  settings,
  lang = 'bn',
}: GenerateReceiptPdfOptions): Promise<{ success: boolean; error?: string; fileName?: string }> {
  try {
    const isEnglish = lang === 'en';
    const safeAppNo = applicant.applicationNo.replace(/[^a-zA-Z0-9-]/g, '_');
    const fileName = `Al-Ikhwan_MoneyReceipt_${safeAppNo}.pdf`;

    if (typeof document === 'undefined') {
      throw new Error('PDF generation requires a browser DOM environment');
    }

    const domElem = document.getElementById('payment-receipt-to-print');
    if (domElem) {
      // Pre-convert images inside receipt
      const images = Array.from(domElem.querySelectorAll('img'));
      const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

      await Promise.all(
        images.map(async (img) => {
          const currentSrc = img.src || img.getAttribute('src');
          if (currentSrc && !currentSrc.startsWith('data:')) {
            originalSrcs.push({ img, src: currentSrc });
            const dataUrl = await urlToDataUrl(currentSrc);
            if (dataUrl && dataUrl.startsWith('data:')) {
              img.src = dataUrl;
            }
          }
        })
      );

      const domCanvas = await html2canvas(domElem, {
        scale: 2.0,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      // Restore images
      originalSrcs.forEach(({ img, src }) => {
        try { img.src = src; } catch {}
      });

      const imgData = domCanvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (domCanvas.height * pageWidth) / domCanvas.width;
      const yOffset = imgHeight < pageHeight ? Math.max(0, (pageHeight - imgHeight) / 5) : 0;

      pdf.addImage(imgData, 'JPEG', 0, yOffset, pageWidth, Math.min(imgHeight, pageHeight));
      pdf.save(fileName);
      return { success: true, fileName };
    }

    // High-Resolution Vector Canvas Construction without Bismillah
    const canvas = document.createElement('canvas');
    const scale = 2;
    const width = 800 * scale;
    const height = 920 * scale;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.scale(scale, scale);

    // Archival White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 920);

    // Decorative Borders
    ctx.strokeStyle = '#072C4C';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, 20, 760, 880);

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 748, 868);

    // Top Sub-Header: Established & Registration (NO Bismillah)
    ctx.fillStyle = '#64748B';
    ctx.font = '12px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('স্থাপিত: ০১/০১/২০০০ ইং', 42, 48);
    ctx.textAlign = 'right';
    ctx.fillText('সরকারি রেজিঃ নং: ২৯৯', 758, 48);

    // Logo & Title
    const logoDataUrl = await urlToDataUrl(INSTITUTION.logoUrl || '/assets/aistudio/logo_3b9b1213.png');
    const logoImg = new Image();
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = logoDataUrl;
    });

    if (logoImg.width > 0) {
      ctx.drawImage(logoImg, 42, 60, 60, 60);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#072C4C';
    ctx.font = 'bold 22px "Hind Siliguri", "Noto Sans Bengali", serif';
    ctx.fillText(INSTITUTION.name, 400, 82);

    ctx.fillStyle = '#0284C7';
    ctx.font = '13px "Hind Siliguri", sans-serif';
    ctx.fillText(`${INSTITUTION.address} · প্রাথমিক ও ইবতেদায়ী বৃত্তি পরীক্ষা ২০২৬`, 400, 105);

    // Title Ribbon
    ctx.fillStyle = '#F0F9FF';
    ctx.fillRect(40, 130, 720, 42);
    ctx.strokeStyle = '#BAE6FD';
    ctx.strokeRect(40, 130, 720, 42);

    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.fillText('অফিসিয়াল পরীক্ষা ফি জমার মানি রসিদ (MONEY RECEIPT)', 400, 156);

    // Receipt Meta Bar
    const receiptNo = receipt?.receiptNo || `REC-${applicant.applicationNo}`;
    const pDate = applicant.paymentDate || new Date().toLocaleDateString('bn-BD');

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`রসিদ নম্বর: ${receiptNo}`, 45, 195);

    ctx.textAlign = 'right';
    ctx.fillText(`ইস্যুর তারিখ: ${convertToBengaliNumber(pDate)}`, 755, 195);

    // Divider
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 205);
    ctx.lineTo(760, 205);
    ctx.stroke();

    // Student & Fee Details Box
    let curY = 230;
    const drawRow = (label: string, value: string, isHighlight = false) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = isHighlight ? '#072C4C' : '#475569';
      ctx.font = isHighlight ? 'bold 13px "Hind Siliguri", sans-serif' : '13px "Hind Siliguri", sans-serif';
      ctx.fillText(label, 45, curY);

      ctx.fillStyle = isHighlight ? '#0284C7' : '#0F172A';
      ctx.font = isHighlight ? 'bold 13.5px "Hind Siliguri", sans-serif' : '13px "Hind Siliguri", sans-serif';
      ctx.fillText(value, 260, curY);

      curY += 28;
    };

    drawRow('আবেদন নম্বর (Application ID):', applicant.applicationNo, true);
    drawRow('রোল নম্বর (Roll Number):', applicant.rollNumber || 'যাচাই শেষে নির্ধারিত', true);
    drawRow('শিক্ষার্থীর নাম (Student Name):', `${applicant.nameBn} (${applicant.nameEn || ''})`);
    drawRow('পিতার নাম (Father\'s Name):', applicant.fatherName);
    drawRow('শিক্ষাপ্রতিষ্ঠান (Institution):', applicant.schoolName);
    drawRow('শ্রেণি (Class):', applicant.className);
    drawRow('পরিশোধিত ফি-র পরিমাণ:', '৳১০০/- (একশত টাকা মাত্র - পরিশোধিত)', true);
    drawRow('ফি পরিশোধের মাধ্যম:', applicant.paymentMethod || 'বিকাশ এজেন্ট ক্যাশ আউট (bKash Cash Out)');
    if (applicant.paymentSenderMobile) {
      drawRow('ক্যাশ আউট প্রেরক মোবাইল:', applicant.paymentSenderMobile);
    }
    drawRow('ট্রানজ্যাকশন আইডি (TxnID):', applicant.transactionId || 'ক্যাশ আউট সম্পন্ন');

    curY += 10;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(40, curY, 720, 65);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(40, curY, 720, 65);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('গুরুত্বপূর্ণ নির্দেশাবলি:', 55, curY + 22);

    ctx.fillStyle = '#475569';
    ctx.font = '11px "Hind Siliguri", sans-serif';
    ctx.fillText('১. আপনার আবেদন ও ১০০ টাকা ফি সফলভাবে সিস্টেমে রেকর্ড করা হয়েছে। এই মানি রসিদটি সংরক্ষণ করুন।', 55, curY + 44);

    // Signatures at bottom
    const sigY = 780;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, sigY);
    ctx.lineTo(220, sigY);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#072C4C';
    ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
    ctx.fillText('আবেদনকারী / অভিভাবক', 140, sigY + 18);

    ctx.beginPath();
    ctx.moveTo(580, sigY);
    ctx.lineTo(740, sigY);
    ctx.stroke();

    ctx.fillText('অর্থ সম্পাদক / হিসাব শাখা', 660, sigY + 18);
    ctx.fillStyle = '#64748B';
    ctx.font = '10.5px "Hind Siliguri", sans-serif';
    ctx.fillText('আল-ইখওয়ান সমাজ কল্যাণ সংস্থা', 660, sigY + 34);

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'JPEG', 0, 10, pdfWidth, pdfHeight - 20);
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (err: any) {
    console.error('Money Receipt PDF Generation failed:', err);
    return { success: false, error: err.message || 'Receipt PDF Generation failed' };
  }
}

export interface BatchReceiptPDFOptions {
  applicants: Applicant[];
  schoolName: string;
  totalAmount: number;
  paymentSenderMobile?: string;
  transactionId?: string;
  settings: ExamSettings;
  lang?: SupportedLang;
}

/**
 * Generate Batch Receipt PDF for multi-candidate school applications
 */
export async function generateBatchReceiptPDF(
  options: BatchReceiptPDFOptions
): Promise<{ success: boolean; fileName?: string; error?: string }> {
  try {
    const { applicants, schoolName, totalAmount, paymentSenderMobile, transactionId, settings } = options;
    const safeSchool = schoolName.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_').slice(0, 20);
    const fileName = `Al-Ikhwan_BatchReceipt_${safeSchool}_${Date.now().toString().slice(-4)}.pdf`;

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = 800 * scale;
    canvas.height = 1050 * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.scale(scale, scale);

    // Archival White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1050);

    // Double Borders
    ctx.strokeStyle = '#072C4C';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(20, 20, 760, 1010);

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 748, 998);

    // Top Header: Reg & Estd (NO Bismillah)
    ctx.fillStyle = '#64748B';
    ctx.font = '11px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('স্থাপিত: ০১/০১/২০০০ ইং', 40, 48);
    ctx.textAlign = 'right';
    ctx.fillText('সরকারি রেজিঃ নং: ২৯৯', 760, 48);

    // Institution Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#072C4C';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    ctx.fillText('আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা', 400, 78);

    ctx.fillStyle = '#475569';
    ctx.font = '12px "Hind Siliguri", sans-serif';
    ctx.fillText('গল্লাসাঙ্গন, বড়লেখা, মৌলভীবাজার · শিক্ষা · ঐক্য · সমাজসেবা', 400, 98);

    // Title Badge
    ctx.fillStyle = '#072C4C';
    ctx.fillRect(230, 115, 340, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
    ctx.fillText('প্রাতিষ্ঠানিক ব্যাচ মানি রসিদ (BATCH RECEIPT)', 400, 136);

    // School Summary Box
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(40, 160, 720, 85);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(40, 160, 720, 85);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#072C4C';
    ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
    ctx.fillText(`শিক্ষাপ্রতিষ্ঠান: ${schoolName}`, 55, 185);

    ctx.font = '12px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`মোট আবেদনকারী: ${applicants.length} জন`, 55, 208);
    ctx.fillText(`মোট ফি: ৳${convertToBengaliNumber(totalAmount)} (জনপ্রতি ৳${convertToBengaliNumber(settings.feeAmount || 100)})`, 55, 230);

    ctx.textAlign = 'right';
    ctx.fillText(`ক্যাশ আউট নম্বর: ${paymentSenderMobile || 'প্রদত্ত'}`, 745, 185);
    ctx.fillText(`ট্রানজ্যাকশন আইডি: ${transactionId || 'রেকর্ডকৃত'}`, 745, 208);
    ctx.fillText(`তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, 745, 230);

    // Table Header
    const tableY = 265;
    ctx.fillStyle = '#072C4C';
    ctx.fillRect(40, tableY, 720, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';

    ctx.fillText('ক্র.', 50, tableY + 18);
    ctx.fillText('আবেদন নং', 85, tableY + 18);
    ctx.fillText('শিক্ষার্থীর নাম (বাংলা ও ইংরেজি)', 210, tableY + 18);
    ctx.fillText('শ্রেণি ও শাখা', 470, tableY + 18);
    ctx.fillText('পিতার নাম', 580, tableY + 18);
    ctx.fillText('ফি', 715, tableY + 18);

    // Table Rows
    let currentY = tableY + 28;
    applicants.forEach((app, idx) => {
      const rowHeight = 36;
      ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      ctx.fillRect(40, currentY, 720, rowHeight);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(40, currentY, 720, rowHeight);

      ctx.fillStyle = '#072C4C';
      ctx.font = '11px "Hind Siliguri", sans-serif';
      ctx.fillText(convertToBengaliNumber(idx + 1), 50, currentY + 22);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#0284C7';
      ctx.fillText(app.applicationNo, 85, currentY + 22);

      ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#072C4C';
      ctx.fillText(app.nameBn, 210, currentY + 15);
      ctx.font = '9.5px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(app.nameEn || '', 210, currentY + 30);

      ctx.font = '11px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(app.className || 'পঞ্চম শ্রেণি', 470, currentY + 22);
      ctx.fillText(app.fatherName || '-', 580, currentY + 22);

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#16A34A';
      ctx.fillText(`৳${convertToBengaliNumber(settings.feeAmount || 100)}`, 715, currentY + 22);

      currentY += rowHeight;
    });

    // Verification Note
    const noteY = Math.max(currentY + 25, 850);
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(40, noteY, 720, 50);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(40, noteY, 720, 50);

    ctx.fillStyle = '#334155';
    ctx.font = '10.5px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• এটি কম্পিউটার প্রস্তুতকৃত অফিসিয়াল প্রাতিষ্ঠানিক পেমেন্ট রসিদ।', 55, noteY + 20);
    ctx.fillText('• অ্যাডমিন প্যানেলে ফি অনুমোদিত হওয়ার পর ওয়েবসাইট থেকে প্রবেশপত্র প্রিন্ট করা যাবে।', 55, noteY + 38);

    // Authority Signatures
    const sigY = 960;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(70, sigY);
    ctx.lineTo(230, sigY);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#072C4C';
    ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
    ctx.fillText('প্রধান শিক্ষক / প্রতিনিধি', 150, sigY + 18);

    ctx.beginPath();
    ctx.moveTo(570, sigY);
    ctx.lineTo(730, sigY);
    ctx.stroke();

    ctx.fillText('অর্থ সম্পাদক / পরীক্ষা পরিষদ', 650, sigY + 18);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "Hind Siliguri", sans-serif';
    ctx.fillText('আল-ইখওয়ান সমাজ কল্যাণ সংস্থা', 650, sigY + 32);

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'JPEG', 0, 8, pdfWidth, pdfHeight - 16);
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (err: any) {
    console.error('Batch Receipt PDF generation error:', err);
    return { success: false, error: err.message || 'Batch Receipt PDF failed' };
  }
}
