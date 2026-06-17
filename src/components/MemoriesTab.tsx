/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, safeParseTags, normalizeImageUrl, generateUUID } from '../utils/supabase';
import { uploadImageToStorage, deleteImageFromStorage, isSupabaseStorageUrl } from '../utils/imageUpload';
import { Memory, Profile } from '../types';
import { SafeImage } from './SafeImage';
import { DEMO_MEMORIES } from '../data/demoData';
import { ConfirmModal } from './ConfirmModal';
import { parseSupabaseError } from '../utils/errorMessages';
import { ImageUrlGuide } from './ImageUrlGuide';
import { LoadingSpinner } from './LoadingSpinner';

interface MemoriesTabProps {
  profile: Profile;
  isDemo?: boolean;
}

export function MemoriesTab({ profile, isDemo = false }: MemoriesTabProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Form states to create/edit memory
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewError(false);
  }, [imageUrl]);

  const themeColors = {
    pink: {
      text: 'text-rose-500',
      fill: 'fill-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-100 hover:border-rose-400',
      button: 'bg-rose-500 hover:bg-rose-600',
      ring: 'focus:ring-rose-200 focus:border-rose-400',
      checkbox: 'checked:bg-rose-500',
    },
    purple: {
      text: 'text-purple-500',
      fill: 'fill-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-100 hover:border-purple-400',
      button: 'bg-purple-500 hover:bg-purple-600',
      ring: 'focus:ring-purple-200 focus:border-purple-400',
      checkbox: 'checked:bg-purple-500',
    },
    green: {
      text: 'text-emerald-500',
      fill: 'fill-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100 hover:border-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      ring: 'focus:ring-emerald-200 focus:border-emerald-400',
      checkbox: 'checked:bg-emerald-600',
    },
  }[profile.theme || 'pink'];

  const loadMemories = async () => {
    if (isDemo) {
      setMemories(DEMO_MEMORIES);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('memories')
        .select('*')
        .eq('profile_id', profile.id);

      if (fetchErr) throw fetchErr;

      const list: Memory[] = (data || []).map((m: any) => ({
        ...m,
        tags: safeParseTags(m.tags)
      })) as Memory[];

      // Sort by memory_date descending (most recent dates first)
      list.sort((a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime());
      
      setMemories(list);
      setError('');
    } catch (err: any) {
      console.error("List memories error in Supabase:", err);
      setError(parseSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();

    if (isDemo) return;

    // Assinar mudanças em tempo real na tabela de memórias para ESC-03
    const channel = supabase
      .channel(`memories-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
          filter: `profile_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('[Realtime] Memória atualizada:', payload.eventType);
          loadMemories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, isDemo]);

  const handleDelete = (id: string) => {
    setMemoryToDelete(id);
  };

  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    if (isDemo) {
      setMemories(memories.map((m) => m.id === id ? { ...m, is_favorite: !currentFav } : m));
      return;
    }

    try {
      const { error: favErr } = await supabase
        .from('memories')
        .update({
          is_favorite: !currentFav,
        })
        .eq('id', id);

      if (favErr) throw favErr;

      await loadMemories();
    } catch (err: any) {
      console.error('Error toggling favorite memory in Supabase:', err);
      setError(parseSupabaseError(err));
    }
  };

  const handleOpenCreateForm = () => {
    setEditingMemoryId(null);
    setTitle('');
    setDescription('');
    setMemoryDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setImageUrl('');
    setTagsInput('');
    setIsFavorite(false);
    setPreviewError(false);
    setUploadingImage(false);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (memory: Memory) => {
    setEditingMemoryId(memory.id);
    setTitle(memory.title);
    setDescription(memory.description);
    setMemoryDate(memory.memory_date);
    setLocation(memory.location || '');
    setImageUrl(memory.image_url || '');
    setTagsInput(memory.tags.join(', '));
    setIsFavorite(memory.is_favorite);
    setPreviewError(false);
    setUploadingImage(false);
    setIsFormOpen(true);
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const url = await uploadImageToStorage(file, 'memories', profile.id);
      setImageUrl(url);
      setPreviewError(false);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !memoryDate) return;

    const parsedTags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const finalImageUrl = normalizeImageUrl(imageUrl);

    if (editingMemoryId) {
      if (isDemo) {
        setMemories(memories.map((m) => m.id === editingMemoryId ? {
          ...m,
          title: title.trim(),
          description: description.trim(),
          memory_date: memoryDate,
          location: location.trim() || undefined,
          image_url: finalImageUrl || undefined,
          tags: parsedTags,
          is_favorite: isFavorite,
        } : m));
        setIsFormOpen(false);
        return;
      }

      try {
        const { error: updateErr } = await supabase
          .from('memories')
          .update({
            title: title.trim(),
            description: description.trim(),
            memory_date: memoryDate,
            location: location.trim() || null,
            image_url: finalImageUrl || null,
            tags: parsedTags,
            is_favorite: isFavorite,
          })
          .eq('id', editingMemoryId);

        if (updateErr) throw updateErr;

        await loadMemories();
      } catch (err: any) {
        console.error('Error rewriting memory in Supabase:', err);
        setError(parseSupabaseError(err));
      }
    } else {
      // Create mode
      const newMemoryId = generateUUID();
      const newMemory: Memory = {
        id: newMemoryId,
        profile_id: profile.id,
        title: title.trim(),
        description: description.trim(),
        memory_date: memoryDate,
        location: location.trim() || undefined,
        image_url: finalImageUrl || undefined,
        tags: parsedTags,
        is_favorite: isFavorite,
        created_at: new Date().toISOString(),
      };

      if (isDemo) {
        setMemories([newMemory, ...memories]);
        setIsFormOpen(false);
        return;
      }

      try {
        const { error: insertErr } = await supabase
          .from('memories')
          .insert({
            id: newMemoryId,
            profile_id: profile.id,
            title: title.trim(),
            description: description.trim(),
            memory_date: memoryDate,
            location: location.trim() || null,
            image_url: finalImageUrl || null,
            tags: parsedTags,
            is_favorite: isFavorite,
            created_at: new Date().toISOString(),
          });

        if (insertErr) throw insertErr;

        await loadMemories();
      } catch (err: any) {
        console.error('Error inserting memories in Supabase:', err);
        setError(parseSupabaseError(err));
      }
    }

    setIsFormOpen(false);
  };

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        (m.location && m.location.toLowerCase().includes(search.toLowerCase()));
      
      if (onlyFavorites) {
        return m.is_favorite && matchesSearch;
      }
      return matchesSearch;
    });
  }, [memories, search, onlyFavorites]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with memory action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-xl font-serif font-bold text-gray-800">Baú de Memórias</h3>
          <p className="text-xs text-gray-400 mt-0.5">Celebre cada viagem, jantar romântico, ou momento simples juntos</p>
        </div>
        
        <button
          onClick={handleOpenCreateForm}
          id="btn-add-memory"
          className={`text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition duration-200 cursor-pointer ${themeColors.button}`}
        >
          ✨ Adicionar Lembrança
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold animate-pulse-soft">
          ⚠️ {error}
        </div>
      )}

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar por título, descrição ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ${themeColors.ring} bg-white/70 backdrop-blur-xs`}
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition duration-200 cursor-pointer ${
            onlyFavorites
              ? `${themeColors.bg} ${themeColors.text} ${themeColors.border}`
              : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
          }`}
        >
          <span>⭐</span>
          <span>Apenas Favoritos</span>
        </button>
      </div>

      {/* Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h4 className="text-lg font-serif font-bold text-gray-800">
                {editingMemoryId ? 'Editar Lembrança' : 'Nova Lembrança Romântica'}
              </h4>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título da Lembrança*</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nossa primeira viagem à praia juntos"
                  className={`w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descrição dos Detalhes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte o que tornou esse dia tão especial..."
                  rows={3}
                  className={`w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data do Evento*</label>
                  <input
                    type="date"
                    required
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    className={`w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Localização</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Rio de Janeiro"
                    className={`w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imagem da Lembrança</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className={`flex-1 text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-gray-200 transition duration-200 cursor-pointer ${
                      uploadingImage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `${themeColors.bg} ${themeColors.text} hover:border-gray-300`
                    }`}
                  >
                    {uploadingImage ? '📤 Enviando...' : '📸 Selecionar do Dispositivo'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageFileSelect}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="text-[10px] text-gray-500 text-center py-2 border-t border-b border-gray-100">
                  ou
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Cole um link (Google Drive, Dropbox, Imgur, Pinterest, etc.)"
                  className={`w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                />
              </div>

              {/* LIVE PREVIEW AND HELP BLOCK */}
              {imageUrl.trim() && (
                <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-white space-y-2.5 animate-fade-in text-left">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Compact Image sample frame */}
                    <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                      {!previewError ? (
                        <img
                          src={normalizeImageUrl(imageUrl)}
                          alt="Prévia em tempo real"
                          onError={() => {
                            console.warn('Real-time url load failure on memories live preview:', imageUrl);
                            setPreviewError(true);
                          }}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center p-1 flex flex-col items-center justify-center h-full w-full bg-rose-50 text-rose-500">
                          <span className="text-xl">⚠️</span>
                          <span className="text-[7px] font-mono leading-tight uppercase font-bold mt-0.5">Erro</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      {previewError ? (
                        <>
                          <p className="font-bold text-rose-600 flex items-center gap-1">
                            <span>❌</span> Não foi possível carregar a imagem.
                          </p>
                          <p className="text-[10px] text-gray-500 leading-normal">
                            Isso ocorre se o link não corresponder a uma imagem direta ou se for restrito. Clique no botão de dicas abaixo para saber como resolver!
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-emerald-600 flex items-center gap-1">
                            <span>✓</span> Imagem detectada e carregada!
                          </p>
                          <p className="text-[10px] text-gray-500 leading-normal">
                            O link inserido é válido e será exibido perfeitamente na sua lembrança se estiver compartilhado publicamente.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expandable Image Guide */}
                  <ImageUrlGuide
                    show={showGuide}
                    onToggle={() => setShowGuide(!showGuide)}
                    themeTextColor={themeColors.text}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tags / Palavras-chave (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="viagem, natal, primeiro_jantar"
                  className={`w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="form-fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className={`w-4 h-4 rounded-md text-rose-500 border-gray-300 focus:ring-rose-200 ${themeColors.checkbox} cursor-pointer`}
                />
                <label htmlFor="form-fav" className="text-xs font-semibold text-gray-600 cursor-pointer select-none">
                  Marcar esta lembrança como favorita ⭐
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-500 hover:bg-gray-50 border border-gray-200 text-xs font-semibold py-2 px-4 rounded-xl transition duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`text-white text-xs font-semibold py-2 px-5 rounded-xl shadow-xs transition duration-200 cursor-pointer ${themeColors.button}`}
                >
                  {editingMemoryId ? 'Salvar Edições' : 'Criar Registros'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size={24} color={themeColors.text} label="Carregando lembranças..." />
        </div>
      ) : (
        <>
          {filteredMemories.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center">
              <span className="text-4xl animate-pulse mb-3">📂</span>
              <h4 className="text-base font-serif font-semibold text-gray-700">Nenhuma Lembrança Encontrada</h4>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Sua busca não obteve resultados ou ainda não há lembranças salvas sob os filtros atuais!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMemories.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shrink-0 shadow-xs hover:shadow-md transition duration-300 flex flex-col md:flex-row gap-5 relative justify-between"
                >
                  {m.image_url && (
                    <div className="w-full md:w-40 h-40 md:h-auto rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <SafeImage
                        src={m.image_url}
                        alt={m.title}
                        className="w-full h-full object-cover"
                        theme={profile.theme || 'pink'}
                        fallbackType="memory"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-gray-100 text-gray-500 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                          📅 {new Date(m.memory_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>

                        {m.location && (
                          <span className="bg-gray-100 text-gray-500 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                            📍 {m.location}
                          </span>
                        )}

                        {m.is_favorite && (
                          <span className="bg-rose-50 text-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            ⭐ Favorito
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-serif font-black text-gray-800 leading-tight">
                        {m.title}
                      </h4>

                      <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {m.description}
                      </p>
                    </div>

                    {/* Tag rendering */}
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-lg font-mono uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons right block */}
                  <div className="flex md:flex-col gap-2 justify-end items-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                    <button
                      onClick={() => handleToggleFavorite(m.id, m.is_favorite)}
                      className={`p-2 rounded-xl border hover:bg-gray-50 transition cursor-pointer ${
                        m.is_favorite ? 'border-rose-200 text-rose-500 bg-rose-50/20' : 'border-gray-200 text-gray-400'
                      }`}
                      aria-label={m.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      title={m.is_favorite ? 'Desmarcar favorito' : 'Marcar favorito'}
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleOpenEditForm(m)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                      aria-label="Editar lembrança"
                      title="Editar Lembrança"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/20 transition cursor-pointer"
                      aria-label="Apagar lembrança"
                      title="Apagar Lembrança"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={memoryToDelete !== null}
        onClose={() => setMemoryToDelete(null)}
        onConfirm={async () => {
          if (!memoryToDelete) return;
          const id = memoryToDelete;
          if (isDemo) {
            setMemories(memories.filter((m) => m.id !== id));
            return;
          }
          try {
            const { error: delErr } = await supabase
              .from('memories')
              .delete()
              .eq('id', id);

            if (delErr) throw delErr;

            setError('');
            await loadMemories();
          } catch (err: any) {
            console.error('Delete memories Error in Supabase:', err);
            setError('Falha ao remover a lembrança do Supabase: ' + (err.message || String(err)));
          }
        }}
        title="Apagar Memória?"
        message="Tem certeza de que deseja excluir permanentemente esta lembrança especial de sua linha do tempo?"
        confirmText="Apagar"
        cancelText="Manter"
        theme={profile.theme || 'pink'}
      />
    </div>
  );
}
