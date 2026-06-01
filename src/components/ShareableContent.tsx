/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Profile } from '../types';
import { calculateAnniversary, formatTimeSpan } from '../utils/timeFormatter';

interface ShareableContentProps {
  profile: Profile;
  onClose: () => void;
}

export function ShareableContent({ profile, onClose }: ShareableContentProps) {
  const [customMessage, setCustomMessage] = useState(
    `Hoje eu celebro cada segundo ao seu lado. Nosso amor já dura mais de ${calculateAnniversary(profile.start_date).totalDays} dias de puro carinho e cumplicidade! ❤️`
  );
  const [copied, setCopied] = useState(false);

  const anniversaryVal = calculateAnniversary(profile.start_date);
  const formattedSpan = formatTimeSpan(anniversaryVal);

  const shareTextFormatted = `✨ Nosso Amor em Números ✨\n\n👩‍❤️‍👨 ${profile.name1} & ${profile.name2}\n📅 Juntos há: ${formattedSpan}\n🎯 Total de dias: ${anniversaryVal.totalDays} dias incríveis!\n\n💬 "${customMessage}"\n\nCriado com carinho no FlowerLove 🌸`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareTextFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeColors = {
    pink: {
      accent: 'bg-rose-500 hover:bg-rose-600',
      text: 'text-rose-500',
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      solid: 'bg-rose-500',
    },
    purple: {
      accent: 'bg-purple-500 hover:bg-purple-600',
      text: 'text-purple-500',
      bg: 'bg-purple-50/50',
      border: 'border-purple-100',
      solid: 'bg-purple-500',
    },
    green: {
      accent: 'bg-emerald-600 hover:bg-emerald-700',
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
            <h3 className="text-lg font-serif font-bold text-gray-800">Compartilhar Nosso Amor</h3>
            <p className="text-xs text-gray-400">Gere um lindo cartão de celebração para redes sociais</p>
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
          <div id="polaroid-share-card" className="border border-gray-100 rounded-2xl bg-white p-5 shadow-md relative overflow-hidden flex flex-col items-center">
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
                Juntos há {anniversaryVal.totalDays} dias
              </p>
            </div>

            {/* Quote block */}
            <div className={`mt-4 p-4 rounded-xl ${themeColors.bg} border ${themeColors.border} text-center w-full max-w-sm`}>
              <p className="text-sm italic text-gray-650 font-medium">
                "{customMessage}"
              </p>
            </div>

            <div className="mt-5 text-[10px] text-gray-400 font-mono tracking-wider uppercase">
              FlowerLove.com • {new Date().getFullYear()}
            </div>
          </div>

          {/* Form customization */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mensagem Romântica Personalizada
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={200}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px] resize-none"
                placeholder="Escreva algo lindo sobre o amor de vocês..."
              />
              <span className="text-[11px] text-gray-400 text-right">
                {customMessage.length}/200 caracteres
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Texto para Copiar e Enviar
              </label>
              <div className="relative bg-gray-50 rounded-xl p-3 border border-gray-150 font-mono text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {shareTextFormatted}
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            onClick={copyToClipboard}
            className={`flex-1 flex items-center justify-center gap-2 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-xs transition duration-200 ${copied ? 'bg-emerald-500' : themeColors.accent}`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copiar Texto Completo</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              // Action simulator: lets couple print or save it
              window.print();
            }}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-medium text-sm py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 bg-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimir</span>
          </button>
        </div>

      </div>
    </div>
  );
}
