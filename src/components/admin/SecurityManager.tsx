import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  History,
  Check,
  AlertTriangle
} from 'lucide-react';

export const SecurityManager: React.FC = () => {
  const [bootstrapState, setBootstrapState] = useState(storage.getBootstrapState());
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState(bootstrapState.twoFactorEmail || 'admin@al-ikhwan-bd.org');
  const [requires2FA, setRequires2FA] = useState(bootstrapState.requires2FA);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword.length < 6) {
      setPwError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি!');
      return;
    }

    const result = storage.changeAdminPassword(currentPassword, newPassword);
    if (!result.success) {
      setPwError(result.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      return;
    }

    setPwSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে এই নতুন পাসওয়ার্ডটি ব্যবহার করুন।');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setBootstrapState(storage.getBootstrapState());
    setTimeout(() => setPwSuccess(''), 4000);
  };

  const handleUpdateRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccess('');
    const state = storage.getBootstrapState();
    state.twoFactorEmail = recoveryEmail;
    state.requires2FA = requires2FA;
    storage.saveBootstrapState(state);
    setBootstrapState(state);
    setEmailSuccess('রিকভারি ইমেইল ও ২-ফ্যাক্টর সেটিংস সংরক্ষিত হয়েছে!');
    setTimeout(() => setEmailSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            সেকশন ৯: সুরক্ষিত প্রাথমিক অ্যাক্সেস ও ক্রেডেনশিয়াল নীতি
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C]">
            প্রশাসনিক নিরাপত্তা ও অ্যাক্সেস নিয়ন্ত্রণ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            পাসওয়ার্ড পরিবর্তন ও অফিসিয়াল যোগাযোগ ইমেইল সেটিংস।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            bootstrapState.isInitialized
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{bootstrapState.isInitialized ? 'ব্যক্তিগত পাসওয়ার্ড সক্রিয়' : 'প্রাথমিক ডেমো মোড'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Key className="w-4 h-4 text-[#0284C7]" />
            <h3 className="text-sm font-bold text-[#072C4C]">
              প্রশাসনিক পাসওয়ার্ড পরিবর্তন করুন
            </h3>
          </div>

          {pwSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                বর্তমান পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="নতুন শক্তিশালী পাসওয়ার্ড দিন"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                নতুন পাসওয়ার্ড নিশ্চিতকরণ
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#072C4C] hover:bg-[#0284C7] text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </button>
          </form>
        </div>

        {/* Recovery Email & 2FA Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Mail className="w-4 h-4 text-[#0284C7]" />
            <h3 className="text-sm font-bold text-[#072C4C]">
              অ্যাকাউন্ট রিকভারি ও ২-ফ্যাক্টর সেটিংস
            </h3>
          </div>

          {emailSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{emailSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateRecovery} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                অফিসিয়াল রিকভারি ইমেইল
              </label>
              <input
                type="email"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                placeholder="admin@al-ikhwan-bd.org"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                required
              />
              <span className="text-2xs text-slate-500 mt-0.5 block">
                পাসওয়ার্ড ভুলে গেলে এই ঠিকানায় যাচাইকরণ কোড পাঠানো হবে।
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ইমেইল সেটিংস সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
