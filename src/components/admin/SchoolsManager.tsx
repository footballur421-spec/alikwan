import React, { useState } from 'react';
import { RecognizedSchool, SchoolCategory } from '../../types';
import { storage } from '../../services/storage';
import { checkSchoolQuota, convertToBengaliNumber } from '../../utils/validation';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X,
  Users,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export const SchoolsManager: React.FC = () => {
  const [schools, setSchools] = useState<RecognizedSchool[]>(storage.getRecognizedSchools());
  const [applicants, setApplicants] = useState(storage.getApplicants());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('all');
  const [editingSchool, setEditingSchool] = useState<RecognizedSchool | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const refreshList = () => {
    setSchools(storage.getRecognizedSchools());
    setApplicants(storage.getApplicants());
  };

  const handleCreateNew = () => {
    const newSchool: RecognizedSchool = {
      id: `sch-${Date.now()}`,
      name: '',
      category: 'primary',
      upazila: 'বড়লেখা',
      unionOrArea: '',
      maxCapacity: 7 // সর্বোচ্চ ৭ জন
    };
    setEditingSchool(newSchool);
    setIsCreating(true);
  };

  const handleEdit = (school: RecognizedSchool) => {
    setEditingSchool({ ...school });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    if (!editingSchool.name.trim()) {
      alert('প্রতিষ্ঠানের নাম দেওয়া আবশ্যক');
      return;
    }

    // Force max capacity to 7 according to policy
    editingSchool.maxCapacity = 7;

    storage.saveRecognizedSchool(editingSchool);
    refreshList();
    setEditingSchool(null);
    setIsCreating(false);
    setSuccessMessage('শিক্ষাপ্রতিষ্ঠান সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    const registeredCount = applicants.filter(a => a.schoolName === name).length;
    if (registeredCount > 0) {
      if (!confirm(`এই প্রতিষ্ঠান (${name}) থেকে ইতোমধ্যে ${registeredCount} জন শিক্ষার্থীর আবেদন নিবন্ধিত রয়েছে! মুছে ফেললে তাদের আবেদন ক্ষতিগ্রস্ত হতে পারে। আপনি কি নিশ্চিত?`)) {
        return;
      }
    } else if (!confirm('আপনি কি এই প্রতিষ্ঠানটি তালিকা থেকে অপসারণ করতে চান?')) {
      return;
    }
    storage.deleteRecognizedSchool(id);
    refreshList();
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.unionOrArea && s.unionOrArea.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesUpazila = selectedUpazila === 'all' || s.upazila.includes(selectedUpazila);
    return matchesSearch && matchesCat && matchesUpazila;
  });

  const getCategoryBadge = (cat: SchoolCategory) => {
    switch (cat) {
      case 'primary':
        return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-2xs font-semibold">সরকারি প্রাথমিক</span>;
      case 'kindergarten':
        return <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-2xs font-semibold">কিন্ডারগার্টেন</span>;
      case 'madrasa':
        return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-semibold">ইবতেদায়ী মাদ্রাসা</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            সেকশন ৫: প্রতিষ্ঠান ও ৭ জন আবেদনকারী কোটা
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-bn text-[#072C4C]">
            স্বীকৃত শিক্ষাপ্রতিষ্ঠান ও কোটা নিয়ন্ত্রণ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রতিটি প্রতিষ্ঠান থেকে সর্বোচ্চ ৭ জন শিক্ষার্থীর কোটা কঠোরভাবে পর্যবেক্ষণ ও নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্রতিষ্ঠান যুক্ত করুন</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="প্রতিষ্ঠানের নাম বা এলাকা দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="primary">সরকারি প্রাথমিক বিদ্যালয়</option>
            <option value="kindergarten">কিন্ডারগার্টেন</option>
            <option value="madrasa">ইবতেদায়ী / মাদ্রাসা</option>
          </select>

          <select
            value={selectedUpazila}
            onChange={e => setSelectedUpazila(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700"
          >
            <option value="all">সকল এলাকা / উপজেলা</option>
            <option value="বড়লেখা">বড়লেখা উপজেলা</option>
            <option value="বিয়ানীবাজার">বিয়ানীবাজার (লাউতা ইউনিয়ন)</option>
          </select>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">প্রতিষ্ঠানের নাম</th>
                <th className="p-3.5">ক্যাটাগরি</th>
                <th className="p-3.5">উপজেলা ও ইউনিয়ন</th>
                <th className="p-3.5 text-center">গৃহীত আবেদন / কোটা</th>
                <th className="p-3.5 text-center">কোটা স্ট্যাটাস</th>
                <th className="p-3.5 text-right w-24">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredSchools.map(s => {
                const quota = checkSchoolQuota(s.name, applicants);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-[#072C4C]">
                      {s.name}
                    </td>
                    <td className="p-3.5">
                      {getCategoryBadge(s.category)}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{s.upazila}{s.unionOrArea ? ` (${s.unionOrArea})` : ''}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      <span className={quota.count >= 7 ? 'text-red-700' : quota.count > 0 ? 'text-[#0284C7]' : 'text-slate-500'}>
                        {convertToBengaliNumber(quota.count)} / {convertToBengaliNumber(7)} জন
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {quota.count >= 7 ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-2xs font-bold">
                          কোটা পূর্ণ (৭/৭)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-2xs font-semibold">
                          অবশিষ্ট: {convertToBengaliNumber(quota.remaining)} টি আসন
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    কোনো শিক্ষাপ্রতিষ্ঠান পাওয়া যায়নি। নতুন প্রতিষ্ঠান যুক্ত করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add School Modal */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-bold font-serif-bn text-[#072C4C]">
                  {isCreating ? 'নতুন শিক্ষাপ্রতিষ্ঠান অন্তর্ভুক্ত করুন' : 'প্রতিষ্ঠানের বিবরণ সম্পাদনা'}
                </h3>
              </div>
              <button
                onClick={() => setEditingSchool(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  বিদ্যালয় / মাদ্রাসার পূর্ণ নাম (বাংলা) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSchool.name}
                  onChange={e => setEditingSchool({ ...editingSchool, name: e.target.value })}
                  placeholder="যেমন: গলাসাসন সরকারি প্রাথমিক বিদ্যালয়"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  প্রতিষ্ঠান ক্যাটাগরি (রোল নম্বর সীমার জন্য) <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingSchool.category}
                  onChange={e => setEditingSchool({ ...editingSchool, category: e.target.value as SchoolCategory })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#0284C7]"
                >
                  <option value="primary">সরকারি প্রাথমিক বিদ্যালয় (রোল ক্রম: ২৮২১+)</option>
                  <option value="kindergarten">কিন্ডারগার্টেন (রোল ক্রম: ৩০০১+)</option>
                  <option value="madrasa">ইবতেদায়ী / মাদ্রাসা (রোল ক্রম: ৩২০১+)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    উপজেলা
                  </label>
                  <select
                    value={editingSchool.upazila}
                    onChange={e => setEditingSchool({ ...editingSchool, upazila: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="বড়লেখা">বড়লেখা (মৌলভীবাজার)</option>
                    <option value="বিয়ানীবাজার">বিয়ানীবাজার (সিলেট)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ইউনিয়ন / পৌরসভা
                  </label>
                  <input
                    type="text"
                    value={editingSchool.unionOrArea || ''}
                    onChange={e => setEditingSchool({ ...editingSchool, unionOrArea: e.target.value })}
                    placeholder="যেমন: লাউতা ইউনিয়ন / দাসেরবাজার"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 text-2xs text-slate-600">
                <strong>কোটা নীতি:</strong> নীতিমালা অনুযায়ী প্রতিটি শিক্ষাপ্রতিষ্ঠান থেকে সর্বোচ্চ ৭ (সাত) জন শিক্ষার্থী অংশগ্রহণ করতে পারবে।
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
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
