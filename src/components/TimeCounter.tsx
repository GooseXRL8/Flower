/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnniversaryInfo, Profile } from '../types';
import { calculateAnniversary, formatTimeSpan, getWeddingAnniversarySymbol } from '../utils/timeFormatter';

interface TimeCounterProps {
  profile: Profile;
}

export function TimeCounter({ profile }: TimeCounterProps) {
  const [info, setInfo] = useState<AnniversaryInfo>(calculateAnniversary(profile.start_date));

  useEffect(() => {
    // Update every second for a fluid, live counters look!
    const timer = setInterval(() => {
      setInfo(calculateAnniversary(profile.start_date));
    }, 1000);

    return () => clearInterval(timer);
  }, [profile.start_date]);

  const weddingAnniversary = getWeddingAnniversarySymbol(info.years);
  
  // Calculate next wedding anniversary
  const nextYears = info.years + 1;
  const nextWeddingAnniversary = getWeddingAnniversarySymbol(nextYears);

  // Active theme borders/bg styles
  const themeColors = {
    pink: {
      text: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      badge: 'bg-rose-100 text-rose-700',
      gradient: 'from-rose-50 to-pink-50',
    },
    purple: {
      text: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      badge: 'bg-purple-100 text-purple-700',
      gradient: 'from-purple-50 to-indigo-50',
    },
    green: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-700',
      gradient: 'from-emerald-50 to-teal-50',
    },
  }[profile.theme || 'pink'];

  return (
    <div className={`rounded-3xl border ${themeColors.border} bg-white p-6 md:p-8 shadow-sm overflow-hidden relative`}>
      {/* Decorative backdrop glow */}
      <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-2xl opacity-40 bg-gradient-to-br ${themeColors.gradient}`} />
      
      <div className="relative text-center flex flex-col items-center">
        {/* Heart Beat Visual */}
        <div id="heartbeat-indicator" className={`w-14 h-14 rounded-full ${themeColors.bg} flex items-center justify-center animate-heart-beat mb-4`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${themeColors.text}`}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        <h2 className="text-xl md:text-2xl font-serif font-semibold text-gray-800 mb-1">
          {profile.custom_title || 'Nossa História de Amor'}
        </h2>
        
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Desde {new Date(profile.start_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Counter Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6 w-full">
          {[
            { label: 'Anos', value: info.years },
            { label: 'Meses', value: info.months },
            { label: 'Dias', value: info.days },
            { label: 'Horas', value: info.hours },
            { label: 'Minutos', value: info.minutes },
            { label: 'Segundos', value: info.seconds },
          ].map((item, index) => (
            <div 
              key={index} 
              id={`counter-box-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xs transition duration-200`}
            >
              <span className={`text-xl md:text-2xl font-bold font-mono tracking-tight text-gray-800`}>
                {item.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs text-gray-400 font-medium uppercase mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Total stats */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="text-sm font-medium text-gray-650">
            Tempo total: <span className="font-bold text-gray-800 font-mono">{info.totalDays}</span> {info.totalDays === 1 ? 'dia' : 'dias'} de muitos sorrisos!
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-serif ${themeColors.badge} font-semibold flex items-center gap-1.5`}>
            <span>{weddingAnniversary.symbol}</span>
            <span>{weddingAnniversary.name}</span>
          </span>
        </div>

        {/* Informative Progress card to next anniversary */}
        {info.years >= 0 && (
          <div className="w-full border-t border-gray-100 pt-5 text-left">
            <div className="flex justify-between items-center text-xs text-gray-505 mb-1.5">
              <span className="font-medium text-gray-500">Próximo Marco: {nextYears}º Ano</span>
              <span className={`font-semibold ${themeColors.text}`}>{nextWeddingAnniversary.name} {nextWeddingAnniversary.symbol}</span>
            </div>
            
            {/* Elegant tiny progressBar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${profile.theme === 'purple' ? 'from-purple-500 to-indigo-500' : profile.theme === 'green' ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-pink-500'} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(100, Math.max(5, (info.months / 12) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium text-right mt-1">
              Faltam apenas {12 - info.months} {12 - info.months === 1 ? 'mês' : 'meses'}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
