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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Reset state if src changes
    setHasError(!src);
    setShowTooltip(false);
  }, [src]);

  if (hasError) {
    const gradientColors = {
      pink: 'from-pink-100 to-rose-200 text-rose-500',
      purple: 'from-purple-100 to-fuchsia-200 text-purple-500',
      green: 'from-emerald-100 to-teal-200 text-emerald-600',
    }[theme];

    const tooltipContent = (
      <div className="absolute inset-0 bg-slate-900/95 p-3 text-[10px] text-white flex flex-col justify-between overflow-y-auto leading-relaxed z-30 font-sans text-left">
        <div className="space-y-1">
          <p className="font-bold border-b border-white/20 pb-1 flex items-center justify-between text-rose-400">
            <span>Dicas do Link da Foto</span>
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-white hover:text-rose-400 font-bold px-1"
            >
              ✕
            </button>
          </p>
          <ul className="list-disc pl-3.5 space-y-1 text-gray-300">
            <li><strong>Google Drive</strong>: Mude as permissões do arquivo no Drive para <em>"Qualquer pessoa com o link pode ler" (Leitor Público)</em>.</li>
            <li><strong>Pinterest</strong>: Clique no Pinterest com o botão direito na imagem e escolha <em>"Copiar endereço da imagem"</em>. O link deve terminar em <code>.jpg</code>, <code>.png</code> ou similar.</li>
            <li><strong>Dropbox</strong>: Ajustamos links normais automaticamente, apenas certifique-se de que é público!</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(false);
          }}
          className="mt-2 w-full bg-white/10 hover:bg-white/20 py-1 rounded text-center text-[9px] font-bold uppercase tracking-wider"
        >
          Fechar
        </button>
      </div>
    );

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
          className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientColors} select-none relative ${className}`}
          style={{ width: '100%', height: '100%' }}
        >
          {showTooltip && tooltipContent}
          
          <div className="text-center p-3 flex flex-col items-center justify-center">
            <span className="text-3xl mb-1 filter drop-shadow-xs">📸</span>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-75">FlowerLove</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-700 w-5 h-5 rounded-full flex items-center justify-center shadow-md transition transform hover:scale-110 text-[10px] font-bold cursor-pointer z-20"
            title="Dicas de Link"
          >
            ?
          </button>
        </div>
      );
    }

    // Default 'memory' fallback
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientColors} select-none relative ${className}`}
        style={{ width: '100%', height: '100%' }}
      >
        {showTooltip && tooltipContent}

        <div className="text-center p-4 flex flex-col items-center justify-center">
          <span className="text-3xl mb-1 filter drop-shadow-xs">🌸</span>
          <span className="text-[10px] font-serif italic font-semibold opacity-75">Sua Memória Romântica</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-700 w-5 h-5 rounded-full flex items-center justify-center shadow-md transition transform hover:scale-110 text-[10px] font-bold cursor-pointer z-20"
          title="Dicas de Link"
        >
          ?
        </button>
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
