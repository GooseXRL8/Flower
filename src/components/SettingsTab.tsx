/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { Profile } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';

interface SettingsTabProps {
  profile: Profile;
  onProfileUpdated: (updated: Profile) => void;
}

export function SettingsTab({ profile, onProfileUpdated }: SettingsTabProps) {
  const [name1, setName1] = useState(profile.name1);
  const [name2, setName2] = useState(profile.name2);
  const [startDate, setStartDate] = useState(profile.start_date);
  const [customTitle, setCustomTitle] = useState(profile.custom_title || '');
  const [imageUrl, setImageUrl] = useState(profile.image_url || '');
  const [theme, setTheme] = useState(profile.theme);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const themeColors = {
    pink: {
      button: 'bg-rose-500 hover:bg-rose-600',
      ring: 'focus:ring-rose-200 focus:border-rose-400',
    },
    purple: {
      button: 'bg-purple-500 hover:bg-purple-600',
      ring: 'focus:ring-purple-200 focus:border-purple-400',
    },
    green: {
      button: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'focus:ring-emerald-200 focus:border-emerald-400',
    },
  }[theme || 'pink'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setSaving(true);

    const updatedProfile: Profile = {
      ...profile,
      name1: name1.trim(),
      name2: name2.trim(),
      start_date: startDate,
      custom_title: customTitle.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      theme,
    };

    try {
      const profileRef = doc(db, 'profiles', profile.id);
      await updateDoc(profileRef, {
        name1: updatedProfile.name1,
        name2: updatedProfile.name2,
        start_date: updatedProfile.start_date,
        custom_title: updatedProfile.custom_title || null,
        image_url: updatedProfile.image_url || null,
        theme: updatedProfile.theme,
      });

      onProfileUpdated(updatedProfile);
      
      // Trigger CSS change at HTML level
      const root = document.getElementById('root-romantic-container');
      if (root) {
        root.className = `min-h-screen theme-${theme} bg-gradient-to-br transition-all duration-500 pb-12 relative overflow-hidden`;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3050);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'profiles/' + profile.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-serif font-bold text-gray-800">Definições da Conta</h3>
        <p className="text-xs text-gray-400 mt-0.5">Customize suas informações de casal e alterne os tons visuais abaixo</p>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 text-xs font-semibold">
          ✨ Alterações salvas com sucesso! Sua história foi atualizada.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome da Pessoa 1</label>
            <input
              type="text"
              required
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring}`}
              placeholder="Ex: Pedro"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome da Pessoa 2</label>
            <input
              type="text"
              required
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring}`}
              placeholder="Ex: Sofia"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data de Início da História</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring}`}
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">Usado para calcular a quantidade exata de dias juntos.</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Título de Destaque</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring}`}
              placeholder="Ex: Nossa eternidade juntos"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL do Avatar / Foto do Casal</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring}`}
            placeholder="Ex: https://images.unsplash.com/your-pair-image..."
          />
        </div>

        {/* Integration of ThemeSwitcher subcomponent */}
        <div className="pt-2 border-t border-gray-100">
          <ThemeSwitcher currentTheme={theme} onThemeChange={(t) => setTheme(t)} />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            id="btn-save-settings"
            className={`text-white text-sm font-semibold py-2.5 px-6 rounded-xl cursor-pointer shadow-xs transition duration-200 disabled:opacity-50 ${themeColors.button}`}
          >
            {saving ? 'Criptografando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
