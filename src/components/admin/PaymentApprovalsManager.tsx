import React, { useState, useEffect } from 'react';
import { Applicant, PaymentReceipt, ExamSettings } from '../../types';
import { storage } from '../../services/storage';
import { convertToBengaliNumber } from '../../utils/validation';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Copy, 
  Check, 
  Phone, 
  Building2, 
  User, 
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Eye,
  FileCheck2
} from 'lucide-react';

interface PaymentApprovalsManagerProps {
  settings: ExamSettings;
  lang?: 'bn' | 'en';
}

export const PaymentApprovalsManager: React.FC<PaymentApprovalsManagerProps> = ({
  settings,
  lang = 'bn',
}) => {
  const [applicants, setApplicants] = useState<Applicant[]>(storage.getApplicants());
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(storage.getReceipts());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'unpaid'>('pending');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [selectedForReview, setSelectedForReview] = useState<Applicant | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAppNo, setRejectingAppNo] = useState<string | null>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setApplicants(storage.getApplicants());
      setReceipts(storage.getReceipts());
    });
    return unsub;
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleApprove = (applicationNo: string) => {
    const res = storage.approvePayment(applicationNo, 'প্রধান প্রশাসক');
    if (res.success) {
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleReject = () => {
    if (!rejectingAppNo) return;
    const res = storage.rejectPayment(rejectingAppNo, rejectionReason, 'প্রধান প্রশাসক');
    if (res.success) {
      setActionSuccessMsg(res.message);
      setShowRejectModal(false);
      setRejectingAppNo(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  // Group applicants by batch / payment submission so that batch submissions are reviewed together!
  const groupedSubmissions: {
    key: string;
    representative: Applicant;
    applicants: Applicant[];
    receipt?: PaymentReceipt;
    totalAmount: number;
    paymentSenderMobile: string;
    transactionId?: string;
    paymentStatus: string;
    isPending: boolean;
  }[] = [];

  const processedIds = new Set<string>();

  applicants.forEach(app => {
    if (processedIds.has(app.id)) return;

    // Find siblings submitted under same batch or same mobile+school+date
    const siblings = applicants.filter(other => {
      if (other.id === app.id) return true;
      if (app.batchSubmissionId && other.batchSubmissionId === app.batchSubmissionId) return true;
      if (
        app.paymentSenderMobile &&
        other.paymentSenderMobile === app.paymentSenderMobile &&
        other.schoolName === app.schoolName &&
        other.paymentDate === app.paymentDate
      ) {
        return true;
      }
      return false;
    });

    siblings.forEach(s => processedIds.add(s.id));

    const rec = receipts.find(r => r.applicationNo === app.applicationNo);
    const feeUnit = settings.feeAmount || 100;
    const isPending = siblings.some(s => s.paymentStatus === 'pending') || rec?.status === 'অপেক্ষমাণ';
    const isPaid = siblings.every(s => s.paymentStatus === 'paid') && rec?.status === 'সফল';

    groupedSubmissions.push({
      key: app.applicationNo,
      representative: app,
      applicants: siblings,
      receipt: rec,
      totalAmount: siblings.length * feeUnit,
      paymentSenderMobile: app.paymentSenderMobile || rec?.paymentSenderMobile || 'প্রদান করা হয়নি',
      transactionId: app.transactionId || rec?.transactionId,
      paymentStatus: isPaid ? 'paid' : isPending ? 'pending' : 'unpaid',
      isPending
    });
  });

  const filteredSubmissions = groupedSubmissions.filter(sub => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      sub.representative.applicationNo.toLowerCase().includes(q) ||
      sub.representative.schoolName.toLowerCase().includes(q) ||
      sub.paymentSenderMobile.includes(q) ||
      (sub.transactionId && sub.transactionId.toLowerCase().includes(q)) ||
      sub.applicants.some(a => a.nameBn.toLowerCase().includes(q) || a.nameEn.toLowerCase().includes(q));

    if (statusFilter === 'pending') return matchesSearch && sub.isPending;
    if (statusFilter === 'paid') return matchesSearch && sub.paymentStatus === 'paid';
    if (statusFilter === 'unpaid') return matchesSearch && sub.paymentStatus === 'unpaid';
    return matchesSearch;
  });

  const pendingCount = groupedSubmissions.filter(s => s.isPending).length;
  const totalApprovedCount = groupedSubmissions.filter(s => s.paymentStatus === 'paid').length;
  const totalFeeCollected = totalApprovedCount * (settings.feeAmount || 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#D2E3ED] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#00A3E0] text-xs font-bold mb-1">
            <CreditCard className="w-4 h-4 text-[#0284C7]" />
            <span>বিকাশ ক্যাশ আউট যাচাই ও পেমেন্ট অনুমোদন পোর্টাল</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#082942]">
            আবেদন ফি ও মানি রসিদ অনুমোদন প্যানেল
          </h2>
          <p className="text-xs text-[#516A7E]">
            পরীক্ষার্থী বা শিক্ষাপ্রতিষ্ঠানের জমাকৃত বিকাশ ক্যাশ আউট নম্বর যাচাই করে অনুমোদন দিন। অনুমোদনের সাথে সাথে মানি রসিদ ডাউনলোড পেজে উন্মুক্ত হবে।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <span className="text-3xs text-amber-800 uppercase font-bold block">অপেক্ষমাণ যাচাই</span>
            <span className="text-lg font-bold font-mono text-amber-700">
              {convertToBengaliNumber(pendingCount)} টি
            </span>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <span className="text-3xs text-emerald-800 uppercase font-bold block">অনুমোদিত পেমেন্ট</span>
            <span className="text-lg font-bold font-mono text-emerald-700">
              {convertToBengaliNumber(totalApprovedCount)} টি
            </span>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#D2E3ED] rounded-xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ক্যাশ আউট নম্বর, আবেদন নং, প্রতিষ্ঠান..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>অপেক্ষমাণ ({convertToBengaliNumber(pendingCount)})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              statusFilter === 'paid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>অনুমোদিত ({convertToBengaliNumber(totalApprovedCount)})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#07243B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>সকল ({convertToBengaliNumber(groupedSubmissions.length)})</span>
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white border border-[#D2E3ED] rounded-xl p-10 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">কোনো পেমেন্ট আবেদন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400">
              {statusFilter === 'pending'
                ? 'এই মুহূর্তে কোনো অপেক্ষমাণ পেমেন্ট নেই। সকল পেমেন্ট অনুমোদিত।'
                : 'প্রদত্ত ফিল্টারের সাথে কোনো রেকর্ড মেলেনি।'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub, idx) => {
            const isApproved = sub.paymentStatus === 'paid';
            const rep = sub.representative;

            return (
              <div
                key={sub.key}
                className={`bg-white border-2 rounded-xl p-5 transition shadow-xs space-y-4 ${
                  isApproved
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded bg-[#07243B] text-white font-bold flex items-center justify-center text-xs font-mono shrink-0">
                      {convertToBengaliNumber(idx + 1)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0284C7]">{rep.applicationNo}</span>
                        {sub.applicants.length > 1 && (
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-[#0284C7] font-bold text-3xs">
                            যৌথ আবেদন ({convertToBengaliNumber(sub.applicants.length)} জন)
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-3xs font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isApproved ? '✓ অনুমোদিত (Paid)' : '⏳ অপেক্ষমাণ (Pending)'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#072C4C] mt-0.5">{rep.schoolName}</h3>
                    </div>
                  </div>

                  {/* Cash Out & Amount Badge */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-lg text-right">
                      <span className="text-3xs text-pink-700 font-bold block uppercase">
                        ক্যাশ আউট প্রেরক নম্বর
                      </span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-mono font-bold text-xs text-[#072C4C]">
                          {sub.paymentSenderMobile}
                        </span>
                        {sub.paymentSenderMobile !== 'প্রদান করা হয়নি' && (
                          <button
                            type="button"
                            onClick={() => handleCopy(sub.paymentSenderMobile)}
                            className="p-1 hover:bg-pink-200 text-pink-800 transition cursor-pointer"
                            title="কপি করুন"
                          >
                            {copiedNumber === sub.paymentSenderMobile ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#07243B] text-white px-3.5 py-1.5 rounded-lg text-right shrink-0">
                      <span className="text-3xs text-sky-300 block uppercase">মোট ফি</span>
                      <span className="font-mono font-bold text-sm text-amber-300">
                        ৳{convertToBengaliNumber(sub.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Students list */}
                <div className="space-y-1.5">
                  <span className="text-3xs uppercase font-bold text-slate-500 tracking-wider block">
                    পরীক্ষার্থীদের বিবরণ:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {sub.applicants.map((cand, cIdx) => (
                      <div
                        key={cand.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5 text-xs"
                      >
                        <img
                          src={cand.photoUrl}
                          alt={cand.nameBn}
                          className="w-8 h-10 object-cover border border-slate-300 rounded shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#072C4C] truncate">{cand.nameBn}</h4>
                          <p className="text-2xs text-slate-500 truncate">পিতা: {cand.fatherName}</p>
                          <p className="text-2xs text-slate-500 font-mono">মোবাইল: {cand.mobile}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata & Actions row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-500">
                    <span>
                      তারিখ: <strong>{rep.paymentDate || rep.createdAt.split('T')[0]}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      TrxID: <strong className="font-mono text-[#0284C7]">{sub.transactionId || 'খালি / দেওয়া হয়নি'}</strong>
                    </span>
                    {sub.receipt?.approvedAt && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-700 font-semibold">
                          অনুমোদন: {sub.receipt.approvedAt} ({sub.receipt.approvedBy || 'অ্যাডমিন'})
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!isApproved ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingAppNo(rep.applicationNo);
                            setShowRejectModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          প্রত্যাখ্যান
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(rep.applicationNo)}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                          <span>অনুমোদন করুন (Approve)</span>
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>মানি রসিদ ডাউনলোডের জন্য উন্মুক্ত</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>পেমেন্ট প্রত্যাখ্যানের কারণ</span>
            </h3>
            <p className="text-xs text-slate-600">
              আবেদন নং: <strong className="font-mono">{rejectingAppNo}</strong> এর পেমেন্ট তথ্যে অসংগতি থাকলে কারণ লিখুন:
            </p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="যেমন: বিকাশ ক্যাশ আউট স্টেটমেন্টে এই নম্বর বা টাকার হিসাব পাওয়া যায়নি..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingAppNo(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                প্রত্যাখ্যান নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
