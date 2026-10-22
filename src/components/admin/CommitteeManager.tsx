import React, { useState } from 'react';
import { CommitteeMember, CommitteeTier } from '../../types';
import { storage } from '../../services/storage';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Award, 
  Save, 
  X,
  UserCheck
} from 'lucide-react';

export const CommitteeManager: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMember[]>(storage.getCommitteeMembers());
  const [selectedTerm, setSelectedTerm] = useState<string>('২০২৪-২০২৬ সেশন');
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const refreshList = () => {
    setMembers(storage.getCommitteeMembers());
  };

  const terms = Array.from(new Set(members.map(m => m.term)));
  if (!terms.includes('২০২৪-২০২৬ সেশন')) terms.unshift('২০২৪-২০২৬ সেশন');
  if (!terms.includes('সাবেক পরিষদ / আর্কাইভ')) terms.push('সাবেক পরিষদ / আর্কাইভ');

  const filteredMembers = members.filter(m => m.term === selectedTerm);

  const handleEdit = (member: CommitteeMember) => {
    setEditingMember({ ...member });
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    const newMember: CommitteeMember = {
      id: `member-${Date.now()}`,
      name: '',
      designation: '',
      tier: 'members',
      phone: '',
      rawPhone: '',
      order: members.length + 1,
      term: selectedTerm,
      isCurrent: selectedTerm.includes('২০২৪-২০২৬'),
      bio: ''
    };
    setEditingMember(newMember);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.name.trim() || !editingMember.designation.trim()) {
      alert('সদস্যের নাম ও পদবি দেওয়া আবশ্যক');
      return;
    }

    if (editingMember.phone) {
      editingMember.rawPhone = editingMember.phone.replace(/[\s-]/g, '');
    }

    storage.saveCommitteeMember(editingMember);
    refreshList();
    setEditingMember(null);
    setIsCreating(false);
    setSuccessMessage('কমিটি সদস্য সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই সদস্যকে পরিষদ তালিকা থেকে মুছে ফেলতে চান?')) {
      storage.deleteCommitteeMember(id);
      refreshList();
    }
  };

  const handleMoveOrder = (member: CommitteeMember, direction: 'up' | 'down') => {
    const currentOrder = member.order;
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    if (targetOrder < 1) return;

    const otherMember = members.find(m => m.order === targetOrder && m.term === member.term);
    if (otherMember) {
      otherMember.order = currentOrder;
      storage.saveCommitteeMember(otherMember);
    }
    member.order = targetOrder;
    storage.saveCommitteeMember(member);
    refreshList();
  };

  const getTierLabel = (tier: CommitteeTier) => {
    switch (tier) {
      case 'advisory': return '০১. উপদেষ্টা পরিষদ';
      case 'president': return '০২. সভাপতি';
      case 'vice_president': return '০২. সহ-সভাপতি';
      case 'general_sec': return '০৩. সাধারণ সম্পাদক';
      case 'asst_gen_sec': return '০৩. সহ সাধারণ সম্পাদক';
      case 'treasurer': return '০৪. অর্থ বিভাগ';
      case 'secretaries': return '০৫-১৫. বিভাগীয় সম্পাদক';
      case 'members': return '১৬. কার্যনির্বাহী সদস্য';
      default: return tier;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            সেকশন ১২: পরিচালনা পর্ষদ ও সাংগঠনিক নেতৃত্ব
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C]">
            পরিচালনা পর্ষদ ও কার্যনির্বাহী কমিটি ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            উপদেষ্টা পরিষদ, নির্বাহী কর্মকর্তা ও সম্পাদকদের পদবি, যোগাযোগ ও ক্রমবিন্যাস পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কর্মকর্তা/সদস্য যোগ করুন</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Session Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {terms.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTerm(t)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              selectedTerm === t
                ? 'bg-[#072C4C] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{t}</span>
            <span className="ml-1.5 text-2xs opacity-75">
              ({members.filter(m => m.term === t).length} জন)
            </span>
          </button>
        ))}
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5 text-center w-14">ক্রম</th>
                <th className="p-3.5">কর্মকর্তা / সদস্যের নাম</th>
                <th className="p-3.5">দায়িত্ব / পদবি</th>
                <th className="p-3.5">সাংগঠনিক স্তর (Tier)</th>
                <th className="p-3.5">যোগাযোগ নম্বর</th>
                <th className="p-3.5 text-center">সেশন</th>
                <th className="p-3.5 text-right w-28">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                    {m.order}
                  </td>
                  <td className="p-3.5 font-bold text-[#072C4C]">
                    {m.name}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0284C7] font-semibold border border-sky-100 text-2xs">
                      {m.designation}
                    </span>
                  </td>
                  <td className="p-3.5 text-2xs text-slate-500">
                    {getTierLabel(m.tier)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {m.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{m.phone}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">প্রযোজ্য নয়</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center text-2xs text-slate-500">
                    {m.term}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleMoveOrder(m, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                        title="উপরে নিন"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(m, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                        title="নিচে নিন"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(m)}
                        className="p-1 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    এই সেশনের জন্য কোনো সদস্যের তথ্য অন্তর্ভুক্ত নেই। নতুন সদস্য যুক্ত করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-bold font-serif-bn text-[#072C4C]">
                  {isCreating ? 'নতুন কর্মকর্তা/সদস্য যোগ করুন' : 'সদস্যের তথ্য সম্পাদনা'}
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  কর্মকর্তা / সদস্যের পূর্ণ নাম (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="যেমন: কামরুল ইসলাম"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    অফিসিয়াল পদবি <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingMember.designation}
                    onChange={e => setEditingMember({ ...editingMember, designation: e.target.value })}
                    placeholder="যেমন: সভাপতি / সাধারণ সম্পাদক"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    সাংগঠনিক বিভাগ (Tier)
                  </label>
                  <select
                    value={editingMember.tier}
                    onChange={e => setEditingMember({ ...editingMember, tier: e.target.value as CommitteeTier })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                  >
                    <option value="advisory">০১. উপদেষ্টা পরিষদ</option>
                    <option value="president">০২. সভাপতি</option>
                    <option value="vice_president">০২. সহ-সভাপতি</option>
                    <option value="general_sec">০৩. সাধারণ সম্পাদক</option>
                    <option value="asst_gen_sec">০৩. সহ সাধারণ সম্পাদক</option>
                    <option value="treasurer">০৪. অর্থ সম্পাদক ও সহ অর্থ সম্পাদক</option>
                    <option value="secretaries">০৫-১৫. অন্যান্য দায়িত্বপ্রাপ্ত সম্পাদক</option>
                    <option value="members">১৬. কার্যনির্বাহী সদস্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    অফিসিয়াল যোগাযোগ নম্বর (যদি থাকে)
                  </label>
                  <input
                    type="text"
                    value={editingMember.phone || ''}
                    onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    সেশন / কার্যকাল
                  </label>
                  <input
                    type="text"
                    value={editingMember.term}
                    onChange={e => setEditingMember({ ...editingMember, term: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  সংক্ষিপ্ত অনুমোদিত পরিচিতি / দায়িত্ব (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ''}
                  onChange={e => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="সংস্থার দায়িত্ব ও বিশেষ কাজের সংক্ষিপ্ত বিবরণ"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
