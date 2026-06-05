/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Profile } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useI18n, Language, setLanguage } from '../utils/i18n';

interface SettingsTabProps {
  profile: Profile;
  onProfileUpdated: (updated: Profile) => void;
}

export function SettingsTab({ profile, onProfileUpdated }: SettingsTabProps) {
  const { lang, t } = useI18n();
  const [name1, setName1] = useState(profile.name1);
  const [name2, setName2] = useState(profile.name2);
  const [startDate, setStartDate] = useState(profile.start_date);
  const [customTitle, setCustomTitle] = useState(profile.custom_title || '');
  const [imageUrl, setImageUrl] = useState(profile.image_url || '');
  const [theme, setTheme] = useState(profile.theme);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const themeColors = {
    pink: {
      button: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-200 focus:border-rose-400',
      ring: 'focus:ring-rose-200 focus:border-rose-400',
    },
    purple: {
      button: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-200 focus:border-purple-400',
      ring: 'focus:ring-purple-200 focus:border-purple-400',
    },
    green: {
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200 focus:border-emerald-400',
      ring: 'focus:ring-emerald-200 focus:border-emerald-400',
    },
  }[theme || 'pink'];

  const validateUrl = (urlStr: string): boolean => {
    if (!urlStr.trim()) return true;
    try {
      const regex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      return regex.test(urlStr.trim());
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    if (!validateUrl(imageUrl)) {
      setError(t('invalidUrl'));
      return;
    }

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
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          name1: updatedProfile.name1,
          name2: updatedProfile.name2,
          start_date: updatedProfile.start_date,
          custom_title: updatedProfile.custom_title || null,
          image_url: updatedProfile.image_url || null,
          theme: updatedProfile.theme,
        })
        .eq('id', profile.id);

      if (updateErr) throw updateErr;

      onProfileUpdated(updatedProfile);
      
      const root = document.getElementById('root-romantic-container');
      if (root) {
        root.className = `min-h-screen theme-${theme} bg-gradient-to-br transition-all duration-500 pb-12 relative overflow-hidden`;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3050);
    } catch (err: any) {
      console.error('Failed to update settings in Supabase:', err);
      setError(
        lang === 'en' 
          ? 'Could not save settings on database: ' 
          : lang === 'es' 
          ? 'No se pudieron guardar los ajustes: ' 
          : 'Não foi possível salvar as configurações: ' + (err.message || String(err))
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLangChange = (selectedLang: Language) => {
    setLanguage(selectedLang);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-gray-800 text-left">
            {lang === 'en' ? 'Account Preferences' : lang === 'es' ? 'Preferencias de Cuenta' : 'Definições da Conta'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 text-left">
            {lang === 'en' 
              ? 'Customize your couple information and visual accents below' 
              : lang === 'es' 
              ? 'Personaliza la información de tu pareja y los acentos visuales abajo' 
              : 'Customize suas informações de casal e alterne os tons visuais abaixo'}
          </p>
        </div>

        {/* Dynamic Custom-designed Language Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => handleLangChange('pt')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${lang === 'pt' ? 'bg-white shadow-xs text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
          >
            🇧🇷 PT
          </button>
          <button
            type="button"
            onClick={() => handleLangChange('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${lang === 'en' ? 'bg-white shadow-xs text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
          >
            🇺🇸 EN
          </button>
          <button
            type="button"
            onClick={() => handleLangChange('es')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${lang === 'es' ? 'bg-white shadow-xs text-gray-800' : 'text-gray-500 hover:text-gray-800'}`}
          >
            🇪🇸 ES
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 text-xs font-semibold text-left">
          ✨ {t('saveSuccess')}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold text-left animate-pulse-soft">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {lang === 'en' ? 'Person 1 Name' : lang === 'es' ? 'Nombre de la Persona 1' : 'Nome da Pessoa 1'}
            </label>
            <input
              type="text"
              required
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
              placeholder="Ex: Pedro"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {lang === 'en' ? 'Person 2 Name' : lang === 'es' ? 'Nombre de la Persona 2' : 'Nome da Persona 2'}
            </label>
            <input
              type="text"
              required
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
              placeholder="Ex: Sofia"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {lang === 'en' ? 'History Start Date' : lang === 'es' ? 'Fecha de Inicio' : 'Data de Início da História'}
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {lang === 'en' 
                ? 'Used to calculate the exact amount of seconds together.' 
                : lang === 'es' 
                ? 'Se usa para calcular los segundos exactos juntos.' 
                : 'Usado para calcular a quantidade exata de dias juntos.'}
            </span>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {lang === 'en' ? 'Highlight Title' : lang === 'es' ? 'Título Destacado' : 'Título de Destaque'}
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
              placeholder="Ex: Nossa eternidade juntos"
            />
          </div>
        </div>

        <div className="space-y-1 text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {lang === 'en' ? 'Couple Portrait URL' : lang === 'es' ? 'URL de Foto de Pareja' : 'URL do Avatar / Foto do Casal'}
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
            placeholder="https://images.unsplash.com/..."
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
            {saving 
              ? (lang === 'en' ? 'Saving...' : lang === 'es' ? 'Guardando...' : 'Gravando...') 
              : (lang === 'en' ? 'Save Settings' : lang === 'es' ? 'Guardar Cambios' : 'Salvar Alterações')}
          </button>
        </div>
      </form>
    </div>
  );
}
