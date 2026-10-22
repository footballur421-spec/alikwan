import React, { useState } from 'react';
import { GalleryItem, GalleryCategory, MediaType } from '../../types';
import { storage } from '../../services/storage';
import { fbUploadMediaFile } from '../../services/firebaseClient';
import { 
  Camera, 
  Video, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Film, 
  Calendar, 
  Tag, 
  Layers,
  Link,
  X,
  Play
} from 'lucide-react';
import { convertToBengaliNumber } from '../../utils/validation';

export const GalleryManager: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(() => storage.getGalleryItems());
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<MediaType>('photo');
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('welfare');
  const [eventDate, setEventDate] = useState('2026-10-20');
  const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(true);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const refreshList = () => {
    setItems(storage.getGalleryItems());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isThumb = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ text: 'ফাইলের আকার সর্বোচ্চ ৮ মেগাবাইট হতে পারবে।', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isThumb) {
        setThumbnailUrl(result);
      } else {
        setMediaUrl(result);
        setUploadPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const extractYoutubeId = (url: string): string | undefined => {
    if (!url) return undefined;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : undefined;
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setType('photo');
    setTitleBn('');
    setTitleEn('');
    setDescriptionBn('');
    setDescriptionEn('');
    setMediaUrl('');
    setThumbnailUrl('');
    setCategory('welfare');
    setEventDate('2026-10-20');
    setIsFeaturedOnHome(true);
    setUploadPreview(null);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setIsAdding(true);
    setType(item.type);
    setTitleBn(item.titleBn);
    setTitleEn(item.titleEn || '');
    setDescriptionBn(item.descriptionBn || '');
    setDescriptionEn(item.descriptionEn || '');
    setMediaUrl(item.mediaUrl);
    setThumbnailUrl(item.thumbnailUrl || '');
    setCategory(item.category);
    setEventDate(item.eventDate);
    setIsFeaturedOnHome(item.isFeaturedOnHome);
    setUploadPreview(item.mediaUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      setMessage({ text: 'অনুগ্রহ করে বাংলা শিরোনাম লিখুন।', type: 'error' });
      return;
    }
    if (!mediaUrl.trim() && !uploadPreview) {
      setMessage({ text: 'অনুগ্রহ করে ছবি/ভিডিও আপলোড করুন বা লিংক দিন।', type: 'error' });
      return;
    }

    let finalMediaUrl = uploadPreview || mediaUrl;

    // If a raw data URL was selected, upload it to persistent cloud/server storage
    if (finalMediaUrl.startsWith('data:')) {
      setMessage({ text: 'মিডিয়া ক্লাউড স্টোরেজে আপলোড হচ্ছে...', type: 'success' });
      const uploadRes = await fbUploadMediaFile(finalMediaUrl, titleBn, type === 'video' ? 'video/mp4' : 'image/jpeg');
      if (uploadRes.success && uploadRes.url) {
        finalMediaUrl = uploadRes.url;
      }
    }

    const ytId = type === 'video' ? extractYoutubeId(finalMediaUrl) : undefined;

    const categoryNames: Record<GalleryCategory, { bn: string; en: string }> = {
      welfare: { bn: 'সমাজসেবা ও মানবকল্যাণ', en: 'Social Welfare' },
      education: { bn: 'শিক্ষা সহায়তা', en: 'Education Support' },
      exam: { bn: 'বৃত্তি পরীক্ষা ও মেধা মূল্যায়ন', en: 'Merit Exam' },
      relief: { bn: 'ত্রাণ ও দুর্যোগ সহায়তা', en: 'Disaster Relief' },
      plantation: { bn: 'পরিবেশ ও বৃক্ষরোপণ', en: 'Tree Plantation' },
      meeting: { bn: 'প্রাতিষ্ঠানিক সভা ও কাউন্সিল', en: 'Council Meeting' },
      general: { bn: 'সাধারণ কার্যক্রম', en: 'General' },
    };

    const newItem: GalleryItem = {
      id: editingId || `gal-${Date.now()}`,
      titleBn: titleBn.trim(),
      titleEn: titleEn.trim() || titleBn.trim(),
      descriptionBn: descriptionBn.trim(),
      descriptionEn: descriptionEn.trim(),
      type,
      mediaUrl: finalMediaUrl,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      category,
      categoryLabelBn: categoryNames[category].bn,
      categoryLabelEn: categoryNames[category].en,
      eventDate,
      isFeaturedOnHome,
      uploadedAt: new Date().toISOString(),
      youtubeId: ytId
    };

    storage.saveGalleryItem(newItem);
    refreshList();
    setMessage({ 
      text: editingId ? 'গ্যালারি আইটেম সফলভাবে আপডেট করা হয়েছে।' : 'নতুন ছবি/ভিডিও সফলভাবে ক্লাউড গ্যালারিতে সংরক্ষিত হয়েছে।', 
      type: 'success' 
    });
    resetForm();
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ছবি/ভিডিও গ্যালারি থেকে মুছে ফেলতে চান?')) {
      storage.deleteGalleryItem(id);
      refreshList();
      setMessage({ text: 'আইটেমটি সফলভাবে মুছে ফেলা হয়েছে।', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleFeatured = (id: string) => {
    storage.toggleGalleryFeatured(id);
    refreshList();
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-2xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>হোমপেজ ও প্রাতিষ্ঠানিক আর্কাইভ</span>
          </div>
          <h2 className="text-xl font-bold font-serif-bn text-[#072C4C]">
            ছবি ও ভিডিও গ্যালারি ব্যবস্থাপনা (Gallery Management)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            সংস্থার বাস্তব কার্যক্রম, বৃত্তি পরীক্ষা, ত্রাণ বিতরণ ও অনুষ্ঠানসমূহের ছবি এবং ভিডিও আপলোড ও প্রদর্শন নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button
          onClick={() => {
            if (isAdding) resetForm();
            else {
              resetForm();
              setIsAdding(true);
            }
          }}
          className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'ফরম বন্ধ করুন' : 'নতুন ছবি বা ভিডিও আপলোড করুন'}</span>
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload & Edit Form Modal / Block */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#0284C7]/30 rounded-2xl p-6 sm:p-7 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              {type === 'video' ? <Video className="w-5 h-5 text-red-600" /> : <Camera className="w-5 h-5 text-[#0284C7]" />}
              <h3 className="text-base font-bold text-[#072C4C] font-serif-bn">
                {editingId ? 'ছবি/ভিডিও তথ্য সম্পাদনা' : 'নতুন ছবি বা ভিডিও আপলোড'}
              </h3>
            </div>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Media Type Switcher */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">মিডিয়ার ধরন নির্বাচন করুন:</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType('photo')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    type === 'photo' 
                      ? 'bg-sky-50 border-[#0284C7] text-[#0284C7] shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>স্থিরচিত্র (Photograph)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('video')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    type === 'video' 
                      ? 'bg-red-50 border-red-600 text-red-700 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>ভিডিও প্রতিবেদন (Video / Documentary)</span>
                </button>
              </div>
            </div>

            {/* Title Bn */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">শিরোনাম (বাংলা) *</label>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: বৃত্তি পরীক্ষা ও কৃতি শিক্ষার্থী সংবর্ধনা–২০২৫"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7]"
              />
            </div>

            {/* Title En */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Title (English)</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Merit Scholarship Examination & Awards 2025"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7] bg-white"
              >
                <option value="exam">বৃত্তি পরীক্ষা ও মেধা মূল্যায়ন</option>
                <option value="welfare">সমাজসেবা ও মানবকল্যাণ</option>
                <option value="relief">ত্রাণ ও দুর্যোগ সহায়তা</option>
                <option value="plantation">পরিবেশ ও বৃক্ষরোপণ</option>
                <option value="meeting">প্রাতিষ্ঠানিক সভা ও কাউন্সিল</option>
                <option value="general">সাধারণ কার্যক্রম</option>
              </select>
            </div>

            {/* Event Date */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">অনুষ্ঠানের তারিখ</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7]"
              />
            </div>

            {/* Media Upload / URL */}
            <div className="space-y-2 md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>{type === 'photo' ? 'ছবি আপলোড বা লিংক:' : 'ভিডিও লিংক বা ভিডিও ফাইল:'}</span>
                <span className="text-2xs text-slate-500 font-normal">ডিভাইস থেকে ফাইল নির্বাচন করুন বা সরাসরি লিংক পেস্ট করুন</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File picker */}
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0284C7] rounded-xl p-4 text-center cursor-pointer bg-white transition-colors">
                  <input
                    type="file"
                    accept={type === 'photo' ? 'image/*' : 'video/*'}
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                    id="media-file-input"
                  />
                  <label htmlFor="media-file-input" className="cursor-pointer block space-y-1.5">
                    <Upload className="w-6 h-6 text-[#0284C7] mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      {type === 'photo' ? 'ছবি ফাইল আপলোড করুন' : 'ভিডিও ফাইল আপলোড করুন'}
                    </span>
                    <span className="text-2xs text-slate-500 block">JPG, PNG, WebP বা MP4 (সর্বোচ্চ ৮ মেগাবাইট)</span>
                  </label>
                </div>

                {/* Direct URL input */}
                <div className="space-y-2">
                  <label className="text-2xs font-semibold text-slate-600 block">অথবা সরাসরি ওয়েব / YouTube লিংক:</label>
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        if (type === 'photo') setUploadPreview(e.target.value);
                      }}
                      placeholder={type === 'photo' ? 'https://example.com/photo.jpg' : 'https://www.youtube.com/watch?v=...'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7] text-xs"
                    />
                  </div>
                  {type === 'video' && (
                    <span className="text-2xs text-slate-500 block">
                      টিপস: ইউটিউব ভিডিও লিংক দিলে সরাসরি স্বয়ংক্রিয় প্লেয়ার যুক্ত হবে।
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Box */}
              {uploadPreview && (
                <div className="mt-3 p-2 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                  {type === 'photo' ? (
                    <img src={uploadPreview} alt="Preview" className="w-16 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-12 bg-black rounded flex items-center justify-center text-white">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  )}
                  <div className="text-2xs text-slate-600 truncate flex-1">
                    <span className="font-bold text-emerald-700 block">মিডিয়া সফলভাবে লোড হয়েছে</span>
                    <span className="truncate block font-mono">{mediaUrl.slice(0, 50) || 'ডিভাইস ফাইল'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Descriptions */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">সংক্ষিপ্ত বিবরণ (বাংলা)</label>
              <textarea
                rows={2}
                value={descriptionBn}
                onChange={(e) => setDescriptionBn(e.target.value)}
                placeholder="অনুষ্ঠানের বিবরণ ও প্রেক্ষাপট..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Description (English)</label>
              <textarea
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Brief description of the event..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0284C7]"
              />
            </div>

            {/* Featured toggle */}
            <div className="md:col-span-2 flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeaturedOnHome}
                onChange={(e) => setIsFeaturedOnHome(e.target.checked)}
                className="w-4 h-4 text-[#0284C7] rounded border-slate-300 focus:ring-[#0284C7]"
              />
              <label htmlFor="isFeatured" className="font-semibold text-slate-700 cursor-pointer">
                ওয়েবসাইটের মূল পাতায় (Homepage) এই ছবিটি/ভিডিওটি হাইলাইট হিসেবে প্রদর্শিত হবে
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold text-xs"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg shadow-xs font-bold text-xs cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingId ? 'পরিবর্তন সংরক্ষণ করুন' : 'গ্যালারিতে যুক্ত করুন'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterType === 'all' ? 'bg-[#072C4C] text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            সবগুলো ({items.length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'photo' ? 'bg-[#0284C7] text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>স্থিরচিত্র ({items.filter(i => i.type === 'photo').length})</span>
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'video' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>ভিডিও ({items.filter(i => i.type === 'video').length})</span>
          </button>
        </div>

        <span className="text-2xs text-slate-500 hidden sm:inline">
          মোট {convertToBengaliNumber(filteredItems.length)} টি মিডিয়া আইটেম সংরক্ষিত
        </span>
      </div>

      {/* Table / Grid of Items */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-2xs">
              <tr>
                <th className="py-3 px-4">মিডিয়া প্রিভিউ</th>
                <th className="py-3 px-4">শিরোনাম ও বিবরণ</th>
                <th className="py-3 px-4">ধরন ও ক্যাটাগরি</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4 text-center">হোমপেজে</th>
                <th className="py-3 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map((item) => {
                const isVideo = item.type === 'video';
                const displayImg = isVideo 
                  ? (item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : '/assets/aistudio/image_941bc104.png'))
                  : item.mediaUrl;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4 w-28">
                      <div className="relative w-20 h-14 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img
                          src={displayImg}
                          alt={item.titleBn}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/aistudio/image_17a38c97.png';
                          }}
                        />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[#072C4C] leading-snug">{item.titleBn}</h4>
                        {item.titleEn && <p className="text-2xs text-slate-500 font-mono truncate">{item.titleEn}</p>}
                        {item.descriptionBn && <p className="text-2xs text-slate-600 line-clamp-1">{item.descriptionBn}</p>}
                      </div>
                    </td>

                    {/* Category & Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold ${
                          isVideo ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {isVideo ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                          <span>{isVideo ? 'ভিডিও' : 'ছবি'}</span>
                        </span>
                        <span className="block text-2xs text-slate-500 font-medium">
                          {item.categoryLabelBn || item.category}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-2xs text-slate-600 font-mono">
                      {convertToBengaliNumber(item.eventDate)}
                    </td>

                    {/* Homepage status toggle */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold transition-all cursor-pointer ${
                          item.isFeaturedOnHome 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="হোমপেজে প্রদর্শন বদলাতে ক্লিক করুন"
                      >
                        {item.isFeaturedOnHome ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                        <span>{item.isFeaturedOnHome ? 'হোমে সক্রিয়' : 'লুকানো'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
