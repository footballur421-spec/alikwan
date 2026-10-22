import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-12 h-14", 
  size,
  showText = false 
}) => {
  const sizeStyle = size 
    ? { 
        width: typeof size === 'number' ? `${size}px` : size, 
        height: typeof size === 'number' ? `${Math.round(size * 1.1)}px` : size 
      } 
    : undefined;

  const emblem = (
    <div 
      style={sizeStyle} 
      className={`relative inline-flex items-center justify-center shrink-0 aspect-[500/550] select-none ${size ? '' : className}`}
    >
      <img
        src="/assets/aistudio/logo_3b9b1213.png"
        alt="আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা (AEISS) অফিশিয়াল লোগো"
        className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
        loading="eager"
        decoding="async"
        onError={(e) => {
          // Fallback to /logo.png if path difference occurs
          const target = e.currentTarget;
          if (target.src.indexOf('/logo.png') === -1) {
            target.src = '/logo.png';
          }
        }}
      />
    </div>
  );

  if (!showText) {
    return emblem;
  }

  return (
    <div className="inline-flex items-center gap-3.5 select-none">
      {emblem}
      <div className="flex flex-col text-left">
        <span className="text-2xs font-bold tracking-wider text-[#0284C7] uppercase font-sans">
          শিক্ষা · ঐক্য · সমাজসেবা (AEISS)
        </span>
        <span className="font-serif-bn font-bold text-base sm:text-lg text-[#082942] leading-tight">
          আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা
        </span>
        <span className="text-xs text-slate-600 font-medium">
          রেজিস্ট্রেশন নং: ২৯৯ · স্থাপিত: ০১/০১/২০০০ ইং
        </span>
      </div>
    </div>
  );
};
