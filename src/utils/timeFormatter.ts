/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnniversaryInfo } from '../types';

export function calculateAnniversary(startDateStr: string): AnniversaryInfo {
  const startDate = new Date(startDateStr + 'T00:00:00');
  const now = new Date();
  
  let differenceMs = now.getTime() - startDate.getTime();
  if (differenceMs < 0) {
    differenceMs = 0;
  }

  const totalDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

  // Advanced calculation for exact years, months, days
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    // Borrow days from previous month
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  // Adjust if start date is in the future
  if (startDate.getTime() > now.getTime()) {
    years = 0;
    months = 0;
    days = 0;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays
  };
}

export function formatTimeSpan(info: AnniversaryInfo): string {
  const activeParts: string[] = [];
  if (info.years > 0) activeParts.push(`${info.years} ${info.years === 1 ? 'ano' : 'anos'}`);
  if (info.months > 0) activeParts.push(`${info.months} ${info.months === 1 ? 'mês' : 'meses'}`);
  if (info.days > 0) activeParts.push(`${info.days} ${info.days === 1 ? 'dia' : 'dias'}`);
  
  if (activeParts.length === 0) return 'Começa hoje! ❤️';
  
  if (activeParts.length === 1) return activeParts[0];
  if (activeParts.length === 2) return `${activeParts[0]} e ${activeParts[1]}`;
  return `${activeParts.slice(0, -1).join(', ')} e ${activeParts[activeParts.length - 1]}`;
}

export function getWeddingAnniversarySymbol(years: number): { name: string; symbol: string } {
  const symbols: { [key: number]: { name: string; symbol: string } } = {
    1: { name: 'Bodas de Papel', symbol: '📄' },
    2: { name: 'Bodas de Algodão', symbol: '☁️' },
    3: { name: 'Bodas de Trigo ou Couro', symbol: '🌾' },
    4: { name: 'Bodas de Flores e Frutas ou Cera', symbol: '🌸' },
    5: { name: 'Bodas de Madeira ou Ferro', symbol: '🪵' },
    6: { name: 'Bodas de Perfume ou Plumas', symbol: '🪶' },
    7: { name: 'Bodas de Lã ou Latão', symbol: '🧶' },
    8: { name: 'Bodas de Amora ou Bronze', symbol: '🍓' },
    9: { name: 'Bodas de Cerâmica ou Vime', symbol: '🍯' },
    10: { name: 'Bodas de Estanho ou Zinco', symbol: '🥫' },
    15: { name: 'Bodas de Cristal', symbol: '🔮' },
    20: { name: 'Bodas de Porcelana', symbol: '☕' },
    25: { name: 'Bodas de Prata', symbol: '🥈' },
    30: { name: 'Bodas de Pérola', symbol: '🦪' },
    40: { name: 'Bodas de Esmeralda', symbol: '💚' },
    50: { name: 'Bodas de Ouro', symbol: '👑' },
  };

  return symbols[years] || { name: 'Tempo Juntos 💖', symbol: '💝' };
}
