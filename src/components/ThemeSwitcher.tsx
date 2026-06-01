/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoveTheme } from '../types';

interface ThemeSwitcherProps {
  currentTheme: LoveTheme;
  onThemeChange: (theme: LoveTheme) => void;
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const themes: { id: LoveTheme; name: string; colorClass: string; bgClass: string; borderClass: string }[] = [
    {
      id: 'pink',
      name: 'Rosa Romântico',
      colorClass: 'bg-rose-500',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-400',
    },
    {
      id: 'purple',
      name: 'Violeta Cósmico',
      colorClass: 'bg-purple-500',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-400',
    },
    {
      id: 'green',
      name: 'Jardim Secreto',
      colorClass: 'bg-emerald-500',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-400',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Tema do Casal</span>
      <div className="flex gap-3">
        {themes.map((t) => {
          const isActive = currentTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              id={`theme-btn-${t.id}`}
              onClick={() => onThemeChange(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all shadow-sm ${
                isActive
                  ? `${t.borderClass} ${t.bgClass} font-medium text-gray-900 ring-2 ring-offset-2 ring-pink-300`
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${t.colorClass} inline-block`} />
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
