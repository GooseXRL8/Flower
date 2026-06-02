/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';

interface FloatingItem {
  id: number;
  x: number;
  size: number;
  type: 'heart' | 'rose' | 'sakura';
  duration: number;
  delay: number;
}

export function FlowerAnimation({ theme }: { theme: 'pink' | 'purple' | 'green' }) {
  // Gerar uma vez, sem estado reativo
  const items: FloatingItem[] = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 12,
      type: (['heart', 'rose', 'sakura'] as const)[Math.floor(Math.random() * 3)],
      duration: Math.random() * 8 + 6,
      delay: -(Math.random() * 14), // delay negativo para iniciar já em andamento
    })), []
  );

  const colorMap = {
    pink: {
      heart: 'rgba(251,113,133,0.25)',
      rose: 'rgba(244,63,94,0.18)',
      sakura: 'rgba(249,168,212,0.18)'
    },
    purple: {
      heart: 'rgba(167,139,250,0.25)',
      rose: 'rgba(217,70,239,0.18)',
      sakura: 'rgba(216,180,254,0.18)'
    },
    green: {
      heart: 'rgba(52,211,153,0.25)',
      rose: 'rgba(16,185,129,0.18)',
      sakura: 'rgba(110,231,183,0.18)'
    }
  }[theme];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: '-50px',
            width: `${item.size}px`,
            height: `${item.size}px`,
            animation: `romantic-fall ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`,
            opacity: 0.8,
          }}
        >
          {/* SVG inline correspondente */}
          <svg viewBox="0 0 24 24" fill={colorMap[item.type]} className="w-full h-full">
            {item.type === 'heart' ? (
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            ) : item.type === 'rose' ? (
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3-.18-5.41-2.31-5.91-5.18l8.91-5.14v.13c0 2.25-1.22 4.2-3 5.25v4.94zm2.18-6.19l-4.18-2.42V7.12c2.09.43 3.75 2.03 4.18 4.12v2.52zM12 4c4.41 0 8 3.59 8 8 0 1.34-.33 2.59-.92 3.7l-9.08-5.24V4.93C10.5 4.34 11.23 4 12 4z"/>
            ) : (
              <path d="M12 2c.5 1.5 1.5 2 2.5 2.5 1.5-.5 2-.5 3-1.5 0 1.5-.5 2-1 3 .5 1 .5 2 1.5 2.5-1.5 0-2-.5-3-1-.5 1.5-1.5 1.5-2.5 2.5-.5-1.5-1.5-1.5-2.5-2.5-1 1-1.5 1.5-3 1 1-1 1-2 1.5-2.5C7.5 7.5 7 7 6 6c1.5 0 2 .5 3 1.5C9.5 6 10.5 5.5 12 2z"/>
            )}
          </svg>
        </div>
      ))}
    </div>
  );
}
