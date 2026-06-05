/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

export const i18nTranslations = {
  pt: {
    appName: 'FlowerLove 👩‍❤️‍👨',
    togetherSince: 'Juntos há:',
    timeTab: 'Contador',
    memoriesTab: 'Memórias',
    polaroidTab: 'Polaroids',
    settingsTab: 'Ajustes',
    adminTab: 'Painel Admin',
    shareLove: 'Compartilhar',
    saveSuccess: 'Configurações atualizadas com sucesso!',
    photosLimit: 'Limite de 5 fotos por casal',
    photoWall: 'Mural de Retro-Polaroids',
    addMemory: 'Adicionar Lembrança',
    deleteMemory: 'Excluir Lembrança',
    welcomeBack: 'Que bom ter você de volta!',
    anniversaryWeddingSymbol: 'Símbolo Bodas',
    coupleProfile: 'Configure seu Perfil de Casal',
    invitePartner: 'Convidar Parceiro(a)',
    days: 'dias',
    years: 'anos',
    months: 'meses',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    customMessage: 'Mensagem Romântica',
    downloadPng: 'Baixar como Imagem (PNG)',
    romanticText: 'Texto Romântico para Copiar',
    printBtn: 'Imprimir',
    copyText: 'Copiar Texto Completo',
    copiedText: 'Copiado!',
    customizeCard: 'Personalize seu Cartão de Amor',
    limitExceeded: 'Infelizmente o limite de 5 fotos do casal já foi atingido.',
    invalidUrl: 'Por favor, insira uma URL de imagem válida (começando com http:// ou https://).'
  },
  en: {
    appName: 'FlowerLove 👩‍❤️‍👨',
    togetherSince: 'Together for:',
    timeTab: 'Counter',
    memoriesTab: 'Memories',
    polaroidTab: 'Polaroids',
    settingsTab: 'Settings',
    adminTab: 'Admin Panel',
    shareLove: 'Share Love',
    saveSuccess: 'Settings updated successfully!',
    photosLimit: 'Limit of 5 photos per couple',
    photoWall: 'Retro-Polaroid Wall',
    addMemory: 'Add Memory',
    deleteMemory: 'Delete Memory',
    welcomeBack: 'Wonderful to have you back!',
    anniversaryWeddingSymbol: 'Anniversary Symbol',
    coupleProfile: 'Configure Your Couple Profile',
    invitePartner: 'Invite Partner',
    days: 'days',
    years: 'years',
    months: 'months',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    customMessage: 'Romantic Message',
    downloadPng: 'Download as Image (PNG)',
    romanticText: 'Romantic Text to Copy',
    printBtn: 'Print',
    copyText: 'Copy Full Text',
    copiedText: 'Copied!',
    customizeCard: 'Customize Your Love Card',
    limitExceeded: 'Unfortunately, the limit of 5 couple photos has already been reached.',
    invalidUrl: 'Please insert a valid image URL (starting with http:// or https://).'
  },
  es: {
    appName: 'FlowerLove 👩‍❤️‍👨',
    togetherSince: 'Juntos desde hace:',
    timeTab: 'Contador',
    memoriesTab: 'Memorias',
    polaroidTab: 'Polaroids',
    settingsTab: 'Ajustes',
    adminTab: 'Panel Admin',
    shareLove: 'Compartir Amor',
    saveSuccess: '¡Ajustes actualizados con éxito!',
    photosLimit: 'Límite de 5 fotos por pareja',
    photoWall: 'Mural de Polaroids Retro',
    addMemory: 'Añadir Memoria',
    deleteMemory: 'Eliminar Memoria',
    welcomeBack: '¡Qué bueno tenerte de vuelta!',
    anniversaryWeddingSymbol: 'Símbolo de Bodas',
    coupleProfile: 'Configura tu Perfil de Pareja',
    invitePartner: 'Invitar Pareja',
    days: 'días',
    years: 'años',
    months: 'meses',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    customMessage: 'Mensaje Romántico',
    downloadPng: 'Descargar como Imagen (PNG)',
    romanticText: 'Texto Romántico para Copiar',
    printBtn: 'Imprimir',
    copyText: 'Copiar Texto Completo',
    copiedText: '¡Copiado!',
    customizeCard: 'Personaliza tu Tarjeta de Amor',
    limitExceeded: 'Lamentablemente, ya se ha alcanzado el límite de 5 fotos de pareja.',
    invalidUrl: 'Por favor, introduzca una URL de imagen válida (comenzando con http:// o https://).'
  }
};

export function getLanguage(): Language {
  const saved = localStorage.getItem('flowerlove_lang');
  if (saved === 'en' || saved === 'es' || saved === 'pt') {
    return saved;
  }
  return 'pt'; // default to Portuguese
}

export function setLanguage(lang: Language) {
  localStorage.setItem('flowerlove_lang', lang);
  window.dispatchEvent(new Event('flowerlove_lang_change'));
}

export function useI18n() {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleUpdate = () => {
      setLang(getLanguage());
    };
    window.addEventListener('flowerlove_lang_change', handleUpdate);
    return () => window.removeEventListener('flowerlove_lang_change', handleUpdate);
  }, []);

  const t = (key: keyof (typeof i18nTranslations)['pt']) => {
    return i18nTranslations[lang][key] || i18nTranslations['pt'][key] || String(key);
  };

  return { lang, setLang, t };
}
