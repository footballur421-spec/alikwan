import React, { useState, useEffect } from 'react';
import { GalleryItem, GalleryCategory, MediaType } from '../types';
import { storage } from '../services/storage';
import { 
  Camera, 
  Video, 
  Play, 
  X, 
  Calendar, 
  Maximize2, 
  Sparkles,
  Layers,
  Award,
  HeartHandshake
} from 'lucide-react';
import { convertToBengaliNumber } from '../utils/validation';

interface GallerySectionProps {
  isHomePageView?: boolean;
  setActiveTab?: (tab: any) => void;
  lang?: 'bn' | 'en';
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  isHomePageView = false,
  setActiveTab,
  lang = 'bn'
}) => {
  const isEnglish = lang === 'en';
  const [items, setItems] = useState<GalleryItem[]>(() => storage.getGalleryItems());
  const [webConfig, setWebConfig] = useState(() => storage.getWebsiteEditorConfig());
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video' | 'exam' | 'relief'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setItems(storage.getGalleryItems());
      setWebConfig(storage.getWebsiteEditorConfig());
    });
    return unsub;
  }, []);

  const filtered = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'photo' || activeFilter === 'video') {
      return item.type === activeFilter;
    }
    if (activeFilter === 'exam') {
      return item.category === 'exam' || item.category === 'education';
    }
    if (activeFilter === 'relief') {
      return item.category === 'relief' || item.category === 'welfare' || item.category === 'plantation';
    }
    return true;
  });

  const limit = isHomePageView ? (webConfig.features?.galleryCountOnHome || 6) : filtered.length;
  const displayedItems = filtered.slice(0, limit);

  const getYoutubeEmbedUrl = (item: GalleryItem) => {
    if (item.youtubeId) {
      return `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1`;
    }
    if (item.mediaUrl && item.mediaUrl.includes('youtube.com/watch?v=')) {
      const vid = item.mediaUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=1`;
    }
    return null;
  };

  // Dynamic grid spanning logic to create the exact mosaic/collage look in image (2).png
  const getItemSpanClass = (index: number, total: number) => {
    if (total <= 3) return 'col-span-1 aspect-[4/3]';
    const pattern = index % 10;
    switch (pattern) {
      case 0:
        return 'col-span-1 sm:col-span-2 aspect-[16/10]';
      case 1:
        return 'col-span-1 aspect-[4/3]';
      case 2:
        return 'col-span-1 aspect-[4/3]';
      case 3:
        return 'col-span-1 aspect-[3/4]';
      case 4:
        return 'col-span-1 sm:col-span-2 aspect-[16/10]';
      case 5:
        return 'col-span-1 aspect-[3/4]';
      case 6:
        return 'col-span-1 aspect-[4/3]';
      case 7:
        return 'col-span-1 sm:col-span-2 aspect-[16/10]';
      case 8:
        return 'col-span-1 aspect-[4/3]';
      case 9:
        return 'col-span-1 aspect-[4/3]';
      default:
        return 'col-span-1 aspect-[4/3]';
    }
  };

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      {/* 1. Header Bar with Maroon & Cyan accents matching attachment */}
      <div className="px-4 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7B1159]"></span>
            <h2 className="text-base sm:text-xl font-bold font-serif-bn text-[#07243B] tracking-tight">
              {isEnglish ? 'My Photo Gallery' : 'দাপ্তরিক ফটো ও ভিডিও গ্যালারি'}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7B1159]/10 text-[#7B1159] border border-[#7B1159]/20 font-mono">
              {displayedItems.length} {isEnglish ? 'Media' : 'আইটেম'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isEnglish 
              ? 'Official high-resolution photo and video documentary archive' 
              : 'আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থার ঐতিহাসিক কার্যক্রম, বৃত্তি পরীক্ষা ও সমাজসেবার অ্যালবাম'}
          </p>
        </div>

        {/* 2. Redesigned Professional Filter Buttons with Maroon/Cyan/Navy theme */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer text-xs flex items-center gap-1.5 active:scale-95 ${
              activeFilter === 'all'
                ? 'bg-[#7B1159] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'All' : 'সবগুলো'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('photo')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs active:scale-95 ${
              activeFilter === 'photo'
                ? 'bg-[#0099DA] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-inherit" />
            <span>{isEnglish ? 'Photos' : 'স্থিরচিত্র'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('video')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs active:scale-95 ${
              activeFilter === 'video'
                ? 'bg-[#D92D20] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-inherit" />
            <span>{isEnglish ? 'Videos' : 'ভিডিও'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('exam')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs active:scale-95 ${
              activeFilter === 'exam'
                ? 'bg-[#07243B] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-inherit" />
            <span>{isEnglish ? 'Scholarship' : 'বৃত্তি পরীক্ষা'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('relief')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs active:scale-95 ${
              activeFilter === 'relief'
                ? 'bg-[#0B3B60] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-inherit" />
            <span>{isEnglish ? 'Relief' : 'ত্রাণ ও সেবা'}</span>
          </button>
        </div>
      </div>

      {/* 3. The Seamless Photo & Video Grid as shown in image (2).png */}
      {displayedItems.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-slate-50">
          <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">
            {isEnglish ? 'No media found in this filter' : 'এই ক্যাটাগরিতে কোনো ছবি বা ভিডিও পাওয়া যায়নি'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isEnglish ? 'Please select another category or add new media.' : 'অন্যান্য ক্যাটাগরি নির্বাচন করুন বা নতুন মিডিয়া যোগ করুন।'}
          </p>
        </div>
      ) : (
        <div className="p-1 sm:p-1.5 bg-slate-100/80">
          <div className={`grid gap-1 sm:gap-1.5 ${
            webConfig.features?.galleryColumns === 2 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : webConfig.features?.galleryColumns === 4 
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-2 sm:grid-cols-3'
          }`}>
            {displayedItems.map((item, index) => {
              const isVideo = item.type === 'video';
              const displayImg = isVideo 
                ? (item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : '/assets/aistudio/image_941bc104.png'))
                : item.mediaUrl;
              const spanClass = getItemSpanClass(index, displayedItems.length);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative overflow-hidden bg-slate-900 cursor-pointer rounded-sm shadow-2xs ${spanClass}`}
                >
                  {/* Photo / Thumbnail Image with smooth scale animation */}
                  <img
                    src={displayImg}
                    alt={item.titleBn}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aistudio/image_17a38c97.png';
                    }}
                  />

                  {/* Dark Vignette Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Video Center Play Button */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-115 group-hover:bg-red-600">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Top Category Badge */}
                  <div className="absolute top-2 left-2 z-10 transition-transform duration-300 transform -translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-white ${
                      isVideo ? 'bg-red-600' : 'bg-[#7B1159]/90 backdrop-blur-xs'
                    }`}>
                      {isVideo ? (isEnglish ? 'Video' : 'ভিডিও') : (item.categoryLabelBn || 'স্থিরচিত্র')}
                    </span>
                  </div>

                  {/* Bottom Caption & Date sliding up on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 text-white z-10 transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <h3 className="text-xs sm:text-sm font-bold font-serif-bn line-clamp-2 leading-tight drop-shadow-sm">
                      {isEnglish ? (item.titleEn || item.titleBn) : item.titleBn}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-300 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-sky-400" />
                        <span>{convertToBengaliNumber(item.eventDate)}</span>
                      </span>
                      <span>·</span>
                      <span className="text-sky-300">
                        {isEnglish ? 'Click to view' : 'বড় করে দেখতে ক্লিক করুন'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Fullscreen Interactive Lightbox / Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#07243B] text-white flex items-center justify-between border-b border-[#0B3556]">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedItem.type === 'video' ? 'bg-red-600' : 'bg-[#7B1159]'
                }`}>
                  {selectedItem.type === 'video' ? 'ভিডিও প্রতিবেদন' : 'স্থিরচিত্র'}
                </span>
                <h3 className="text-xs sm:text-sm font-bold font-serif-bn truncate">
                  {isEnglish ? (selectedItem.titleEn || selectedItem.titleBn) : selectedItem.titleBn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Media Body */}
            <div className="bg-black flex items-center justify-center flex-1 min-h-[300px] max-h-[65vh] overflow-hidden">
              {selectedItem.type === 'video' ? (
                getYoutubeEmbedUrl(selectedItem) ? (
                  <iframe
                    src={getYoutubeEmbedUrl(selectedItem)!}
                    title={selectedItem.titleBn}
                    className="w-full h-full min-h-[350px] sm:min-h-[450px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedItem.mediaUrl}
                    controls
                    autoPlay
                    className="max-h-[65vh] max-w-full"
                  />
                )
              ) : (
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.titleBn}
                  className="max-h-[65vh] max-w-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer Description */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-700">
              <div className="space-y-0.5">
                <p className="font-serif-bn text-slate-800">
                  {isEnglish ? (selectedItem.descriptionEn || selectedItem.descriptionBn) : selectedItem.descriptionBn}
                </p>
                <span className="text-[11px] text-slate-500 font-mono">
                  তারিখ: {convertToBengaliNumber(selectedItem.eventDate)} · অ্যালবাম: {selectedItem.categoryLabelBn || selectedItem.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-[#07243B] hover:bg-[#0B3556] text-white rounded-lg text-xs font-bold transition cursor-pointer self-end sm:self-auto"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
