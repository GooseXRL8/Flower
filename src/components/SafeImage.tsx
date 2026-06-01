import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null | any;
  alt?: string;
  className?: string;
  theme?: 'pink' | 'purple' | 'green' | any;
  fallbackType?: 'avatar' | 'polaroid' | 'memory';
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  theme = 'pink', 
  fallbackType = 'memory',
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state if src changes
    setHasError(!src);
  }, [src]);

  if (hasError) {
    const gradientColors = {
      pink: 'from-pink-100 to-rose-200 text-rose-500',
      purple: 'from-purple-100 to-fuchsia-200 text-purple-500',
      green: 'from-emerald-100 to-teal-200 text-emerald-600',
    }[theme];

    if (fallbackType === 'avatar') {
      return (
        <div 
          className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientColors} rounded-full select-none ${className}`}
          style={{ width: '100%', height: '100%' }}
        >
          <span className="text-3xl animate-pulse">👩‍❤️‍👨</span>
        </div>
      );
    }

    if (fallbackType === 'polaroid') {
      return (
        <div 
          className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientColors} select-none ${className}`}
          style={{ width: '100%', height: '100%' }}
        >
          <div className="text-center p-3 flex flex-col items-center justify-center">
            <span className="text-3xl mb-1 filter drop-shadow-xs">📸</span>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-75">FlowerLove</span>
          </div>
        </div>
      );
    }

    // Default 'memory' fallback
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientColors} select-none ${className}`}
        style={{ width: '100%', height: '100%' }}
      >
        <div className="text-center p-4 flex flex-col items-center justify-center">
          <span className="text-3xl mb-1 filter drop-shadow-xs">🌸</span>
          <span className="text-[10px] font-serif italic font-semibold opacity-75">Sua Memória Romântica</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.warn('SafeImage failed to load:', src);
        setHasError(true);
      }}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
