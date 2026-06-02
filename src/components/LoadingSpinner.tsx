/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
  color?: string;
}

export function LoadingSpinner({
  label = 'Carregando...',
  size = 24,
  color = 'text-rose-500'
}: LoadingSpinnerProps) {
  return (
    <svg
      className={`animate-spin ${color}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
    >
      <title>{label}</title>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
