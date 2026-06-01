/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

interface FloatingItem {
  id: number;
  x: number; // percentage width
  size: number; // in pixels
  type: 'heart' | 'rose' | 'sakura';
  duration: number; // animation seconds
  delay: number; // animation delay
}

export function FlowerAnimation({ theme }: { theme: 'pink' | 'purple' | 'green' }) {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    // Generate 15 initial floating elements
    const initialItems: FloatingItem[] = Array.from({ length: 18 }).map((_, index) => createItem(index));
    setItems(initialItems);

    // Periodically replace items that have finished their animations
    const interval = setInterval(() => {
      setItems((prev) => {
        return prev.map((item) => {
          // 15% chance to regenerate each item per second
          if (Math.random() < 0.15) {
            return createItem(item.id);
          }
          return item;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const createItem = (id: number): FloatingItem => {
    const types: ('heart' | 'rose' | 'sakura')[] = ['heart', 'rose', 'sakura'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id,
      x: Math.random() * 100,
      size: Math.random() * 20 + 12, // 12px to 32px
      type,
      duration: Math.random() * 8 + 6, // 6s to 14s
      delay: Math.random() * -10, // negative delay so they start immediately at different positions
    };
  };

  const getItemVisual = (type: 'heart' | 'rose' | 'sakura', theme: 'pink' | 'purple' | 'green') => {
    if (type === 'heart') {
      const colors = {
        pink: 'text-rose-400/30',
        purple: 'text-purple-400/30',
        green: 'text-emerald-400/30',
      };
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${colors[theme]}`}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    } else if (type === 'rose') {
      const colors = {
        pink: 'text-pink-300/20',
        purple: 'text-fuchsia-300/20',
        green: 'text-teal-300/20',
      };
      // Simple rose SVG representation
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${colors[theme]}`}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3-.18-5.41-2.31-5.91-5.18l8.91-5.14v.13c0 2.25-1.22 4.2-3 5.25v4.94zm2.18-6.19l-4.18-2.42V7.12c2.09.43 3.75 2.03 4.18 4.12v2.52zM12 4c4.41 0 8 3.59 8 8 0 1.34-.33 2.59-.92 3.7l-9.08-5.24V4.93C10.5 4.34 11.23 4 12 4z" />
        </svg>
      );
    } else {
      const colors = {
        pink: 'text-rose-300/20',
        purple: 'text-purple-300/20',
        green: 'text-green-300/20',
      };
      // Sakura (cherry blossom flower draft) representation
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${colors[theme]}`}>
          <path d="M12 2c.5 1.5 1.5 2 2.5 2.5 1.5-.5 2-.5 3-1.5 0 1.5-.5 2-1 3 .5 1 .5 2 1.5 2.5-1.5 0-2-.5-3-1-.5 1.5-1.5 1.5-2.5 2.5-.5-1.5-1.5-1.5-2.5-2.5-1 1-1.5 1.5-3 1 1-1 1-2 1.5-2.5C7.5 7.5 7 7 6 6c1.5 0 2 .5 3 1.5C9.5 6 10.5 5.5 12 2z" />
        </svg>
      );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{
            left: `${item.x}%`,
            top: `-50px`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            animation: `romantic-fall ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`,
            opacity: 0.6,
          }}
        >
          {getItemVisual(item.type, theme)}
        </div>
      ))}
    </div>
  );
}
