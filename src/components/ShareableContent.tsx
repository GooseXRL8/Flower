/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Profile } from '../types';
import { calculateAnniversary, formatTimeSpan } from '../utils/timeFormatter';
import html2canvas from 'html2canvas';
import { useI18n } from '../utils/i18n';

interface ShareableContentProps {
  profile: Profile;
  onClose: () => void;
}

export function ShareableContent({ profile, onClose }: ShareableContentProps) {
  const { lang, t } = useI18n();
  const [customMessage, setCustomMessage] = useState(
    lang === 'en' 
      ? `Today I celebrate every second by your side. Our love has lasted more than ${calculateAnniversary(profile.start_date).totalDays} days of pure affection and complicity! ❤️`
      : lang === 'es'
      ? `Hoy celebro cada segundo a tu lado. ¡Nuestro amor ya dura más de ${calculateAnniversary(profile.start_date).totalDays} días de puro cariño y complicidad! ❤️`
      : `Hoje eu celebro cada segundo ao seu lado. Nosso amor já dura mais de ${calculateAnniversary(profile.start_date).totalDays} dias de puro carinho e cumplicidade! ❤️`
  );
  const [copied, setCopied] = useState(false);
  const [generatingPng, setGeneratingPng] = useState(false);

  const anniversaryVal = calculateAnniversary(profile.start_date);
  const formattedSpan = formatTimeSpan(anniversaryVal);

  const greetingTitle = lang === 'en' ? '✨ Our Love in Numbers ✨' : lang === 'es' ? '✨ Nuestro Amor en Números ✨' : '✨ Nosso Amor em Números ✨';
  const togetherLabel = lang === 'en' ? 'Together for:' : lang === 'es' ? 'Juntos desde hace:' : 'Juntos há:';
  const incredibleDaysLabel = lang === 'en' ? 'incredible days!' : lang === 'es' ? '¡días increíbles!' : 'dias incríveis!';
  const footerWatermark = lang === 'en' ? 'Created with love on FlowerLove 🌸' : lang === 'es' ? 'Creado con cariño en FlowerLove 🌸' : 'Criado com carinho no FlowerLove 🌸';

  const shareTextFormatted = `${greetingTitle}\n\n👩‍❤️‍👨 ${profile.name1} & ${profile.name2}\n📅 ${togetherLabel} ${formattedSpan}\n🎯 Total: ${anniversaryVal.totalDays} ${incredibleDaysLabel}\n\n💬 "${customMessage}"\n\n${footerWatermark}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareTextFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImagePng = async () => {
    const cardElement = document.getElementById('polaroid-share-card');
    if (!cardElement) return;

    try {
      setGeneratingPng(true);
      const canvas = await html2canvas(cardElement, {
        scale: 3, // Premium ultra-high definition resolution
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const tempLink = document.createElement('a');
      tempLink.href = dataUrl;
      tempLink.download = `flowerlove-card-${profile.name1}-e-${profile.name2}.png`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    } catch (error) {
      console.error('Error generating image from DOM card:', error);
      alert(lang === 'en' ? 'Failed to generate PNG image card. Please try copying the text instead.' : lang === 'es' ? 'Error al generar la tarjeta de imagen PNG. Por favor, intente copiar el texto.' : 'Falha ao baixar cartão em formato PNG. Mas não se preocupe, você ainda pode copiar o texto da história!');
    } finally {
      setGeneratingPng(false);
    }
  };

  const themeColors = {
    pink: {
      accent: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300',
      text: 'text-rose-500',
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      solid: 'bg-rose-500',
    },
    purple: {
      accent: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-300',
      text: 'text-purple-500',
      bg: 'bg-purple-50/50',
      border: 'border-purple-100',
      solid: 'bg-purple-500',
    },
    green: {
      accent: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-350',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      solid: 'bg-emerald-500',
    },
  }[profile.theme || 'pink'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-serif font-bold text-gray-800">{t('shareLove')}</h3>
            <p className="text-xs text-gray-400">{t('customizeCard')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-150 text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area with custom scrollbar */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Card Preview (styled like a gorgeous polaroid) */}
          <div id="polaroid-share-card" className="border border-gray-100 rounded-2xl bg-white p-6 shadow-md relative overflow-hidden flex flex-col items-center">
            {/* Romantic flower icon background indicator */}
            <div className="absolute right-2 top-2 text-rose-500/10 w-24 h-24 pointer-events-none">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* Profile Avatar simulation */}
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-200 border-4 border-white shadow-sm flex items-center justify-center mb-4 text-3xl overflow-hidden`}>
              {profile.image_url ? (
                <img src={profile.image_url} alt="Casal" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                '🌸'
              )}
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-xl font-serif font-bold text-gray-800">
                {profile.name1} & {profile.name2}
              </h4>
              <p className={`text-xs font-semibold uppercase tracking-wider ${themeColors.text}`}>
                {togetherLabel.replace(':', '')} {anniversaryVal.totalDays} {lang === 'en' ? 'days' : lang === 'es' ? 'días' : 'dias'}
              </p>
            </div>

            {/* Quote block */}
            <div className={`mt-4 p-4 rounded-xl ${themeColors.bg} border ${themeColors.border} text-center w-full max-w-sm`}>
              <p className="text-sm italic text-gray-650 font-medium whitespace-pre-wrap">
                "{customMessage}"
              </p>
            </div>

            <div className="mt-5 text-[10px] text-gray-400 font-mono tracking-wider uppercase">
              FlowerLove.com • {new Date().getFullYear()}
            </div>
          </div>

          {/* Form customization */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {t('customMessage')}
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={200}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px] resize-none"
                placeholder={lang === 'en' ? 'Write something beautiful about your journey...' : lang === 'es' ? 'Escribe algo hermoso sobre vuestro viaje...' : 'Escreva algo lindo sobre o amor de vocês...'}
              />
              <span className="text-[11px] text-gray-400 text-right">
                {customMessage.length}/200
              </span>
            </div>

            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-left">
                {t('romanticText')}
              </label>
              <div className="relative bg-gray-50 rounded-xl p-3 border border-gray-150 font-mono text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap text-left leading-relaxed">
                {shareTextFormatted}
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap sm:flex-nowrap gap-2.5">
          <button
            onClick={downloadImagePng}
            disabled={generatingPng}
            className={`flex-1 flex items-center justify-center gap-2 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition duration-200 cursor-pointer ${generatingPng ? 'bg-gray-400 cursor-not-allowed' : themeColors.accent}`}
          >
            {generatingPng ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{lang === 'en' ? 'Generating...' : lang === 'es' ? 'Generando...' : 'Gerando...'}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>{t('downloadPng')}</span>
              </>
            )}
          </button>

          <button
            onClick={copyToClipboard}
            className={`flex-1 flex items-center justify-center gap-2 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition duration-200 cursor-pointer ${copied ? 'bg-emerald-500' : themeColors.accent}`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{t('copiedText')}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m14.25 5h-2.25m-3-3h.008v.008H14.25V9.75zM15.75 14.25h.008v.008H15.75V14.25z" />
                </svg>
                <span>{t('copyText')}</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              window.print();
            }}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 bg-white cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.163.502M12 3a9.003 9.003 0 018.354 5.646l-.502.163h-.002l-.163-.502A9.003 9.003 0 0012 3zm0 18a9.003 9.003 0 01-8.354-5.646l.502-.163h.002l.163.502A9.003 9.003 0 0012 21z" />
            </svg>
            <span>{t('printBtn')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
