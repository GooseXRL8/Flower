/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoveTheme } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  theme?: LoveTheme;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  theme = 'pink',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const themeColors = {
    pink: {
      button: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-200 text-white',
      border: 'border-rose-100',
      iconBg: 'bg-rose-50 text-rose-500',
    },
    purple: {
      button: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-200 text-white',
      border: 'border-purple-100',
      iconBg: 'bg-purple-50 text-purple-500',
    },
    green: {
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200 text-white',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  }[theme];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog content */}
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl relative z-10 space-y-4 animate-scale-in transform transition-all">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-2xl flex-shrink-0 ${themeColors.iconBg}`}>
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-serif font-bold text-gray-850 leading-tight">
              {title}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition shadow-xs focus:ring-2 cursor-pointer ${themeColors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
