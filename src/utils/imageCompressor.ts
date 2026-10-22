export interface CompressionResult {
  success: boolean;
  dataUrl: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  error?: string;
}

export interface ImageCompressorOptions {
  maxWidthOrHeight?: number;
  targetWidth?: number;
  targetHeight?: number;
  maxSizeBytes?: number;
  quality?: number;
}

export function validateAndCompressImage(
  file: File,
  optionsOrWidth?: number | ImageCompressorOptions,
  targetHeight?: number,
  maxSizeBytes?: number
): Promise<CompressionResult> {
  return new Promise((resolve) => {
    // Parse arguments
    let tWidth = 300;
    let tHeight = 300;
    let maxBytes = 100 * 1024;
    let initialQuality = 0.88;

    if (typeof optionsOrWidth === 'object' && optionsOrWidth !== null) {
      if (optionsOrWidth.maxWidthOrHeight) {
        tWidth = optionsOrWidth.maxWidthOrHeight;
        tHeight = optionsOrWidth.maxWidthOrHeight;
      }
      if (optionsOrWidth.targetWidth) tWidth = optionsOrWidth.targetWidth;
      if (optionsOrWidth.targetHeight) tHeight = optionsOrWidth.targetHeight;
      if (optionsOrWidth.maxSizeBytes) maxBytes = optionsOrWidth.maxSizeBytes;
      if (optionsOrWidth.quality) initialQuality = optionsOrWidth.quality;
    } else if (typeof optionsOrWidth === 'number') {
      tWidth = optionsOrWidth;
      if (typeof targetHeight === 'number') tHeight = targetHeight;
      if (typeof maxSizeBytes === 'number') maxBytes = maxSizeBytes;
    }

    // 0. File size validation (Max 10 MB as requested)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      return resolve({
        success: false,
        error: 'ফাইলের আকার ১০ মেগাবাইটের বেশি হতে পারবে না (File exceeds 10 MB limit)। অনুগ্রহ করে ১০ মেগাবাইট বা তার ছোট ছবি আপলোড করুন।',
        dataUrl: '',
        width: 0,
        height: 0,
        fileSizeBytes: file.size
      });
    }

    // 1. MIME type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return resolve({
        success: false,
        error: 'শুধুমাত্র JPG, JPEG বা PNG ফরম্যাটের ছবি আপলোড করা যাবে। (Only JPG, JPEG, or PNG formats are supported)',
        dataUrl: '',
        width: 0,
        height: 0,
        fileSizeBytes: 0
      });
    }

    const reader = new FileReader();
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'ফাইল পড়তে ত্রুটি হয়েছে। অনুগ্রহ করে অন্য ছবি নির্বাচন করুন।',
        dataUrl: '',
        width: 0,
        height: 0,
        fileSizeBytes: 0
      });
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        resolve({
          success: false,
          error: 'ছবির ফাইলটি ক্ষতিগ্রস্ত বা অবৈধ।',
          dataUrl: '',
          width: 0,
          height: 0,
          fileSizeBytes: 0
        });
      };

      img.onload = () => {
        try {
          // Determine final dimensions preserving aspect ratio or bounding box
          let renderWidth = tWidth;
          let renderHeight = tHeight;

          if (img.width > tWidth || img.height > tHeight) {
            const aspect = img.width / img.height;
            if (aspect > 1) {
              renderWidth = tWidth;
              renderHeight = Math.round(tWidth / aspect);
            } else {
              renderHeight = tHeight;
              renderWidth = Math.round(tHeight * aspect);
            }
          } else {
            renderWidth = img.width;
            renderHeight = img.height;
          }

          const canvas = document.createElement('canvas');
          canvas.width = renderWidth;
          canvas.height = renderHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve({
              success: false,
              error: 'ব্রাউজার ক্যানভাস নিষ্ক্রিয়।',
              dataUrl: '',
              width: 0,
              height: 0,
              fileSizeBytes: 0
            });
          }

          // Fill white background for transparent PNGs
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, renderWidth, renderHeight);
          ctx.drawImage(img, 0, 0, renderWidth, renderHeight);

          // Quality reduction loop
          let quality = initialQuality;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);

          let base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
          let byteSize = Math.floor(base64Length * 0.75);

          while (byteSize > maxBytes && quality > 0.35) {
            quality -= 0.12;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
            byteSize = Math.floor(base64Length * 0.75);
          }

          resolve({
            success: true,
            dataUrl,
            width: renderWidth,
            height: renderHeight,
            fileSizeBytes: byteSize,
          });
        } catch (err: any) {
          resolve({
            success: false,
            error: err.message || 'ছবির প্রক্রিয়াকরণে সমস্যা হয়েছে।',
            dataUrl: '',
            width: 0,
            height: 0,
            fileSizeBytes: 0
          });
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
