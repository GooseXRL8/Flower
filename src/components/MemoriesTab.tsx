/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../utils/firebase';
import { Memory, Profile } from '../types';
import { SafeImage } from './SafeImage';
import { DEMO_MEMORIES } from '../data/demoData';
import { ConfirmModal } from './ConfirmModal';

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

  useEffect(() => {
    if (isDemo) {
      setMemories(DEMO_MEMORIES);
      setLoading(false);
      return;
    }

    const memoriesPath = 'memories';
    const q = query(
      collection(db, memoriesPath),
      where('profile_id', '==', profile.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Memory[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Memory);
        });
        // Sort by memory_date descending (most recent dates first)
        list.sort((a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime());
        setMemories(list);
        setLoading(false);
      },
      (err) => {
        console.error("List memories error:", err);
        setError("Não foi possível carregar as memórias (erro de permissão ou conexão).");
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
      await updateDoc(doc(db, 'memories', id), {
        is_favorite: !currentFav,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'memories/' + id);
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
    setIsFormOpen(true);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !memoryDate) return;

    const parsedTags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    if (editingMemoryId) {
      if (isDemo) {
        setMemories(memories.map((m) => m.id === editingMemoryId ? {
          ...m,
          title: title.trim(),
          description: description.trim(),
          memory_date: memoryDate,
          location: location.trim() || undefined,
          image_url: imageUrl.trim() || undefined,
          tags: parsedTags,
          is_favorite: isFavorite,
        } : m));
        setIsFormOpen(false);
        return;
      }

      // Edit mode
      const memoryRef = doc(db, 'memories', editingMemoryId);
      const changes: Partial<Memory> = {
        title: title.trim(),
        description: description.trim(),
        memory_date: memoryDate,
        location: location.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        tags: parsedTags,
        is_favorite: isFavorite,
      };

      try {
        await updateDoc(memoryRef, changes);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'memories/' + editingMemoryId);
      }
    } else {
      // Create mode
      const newMemoryId = 'mem_' + Math.random().toString(36).substring(2, 11);
      const newMemory: Memory = {
        id: newMemoryId,
        profile_id: profile.id,
        title: title.trim(),
        description: description.trim(),
        memory_date: memoryDate,
        location: location.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
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
        await setDoc(doc(db, 'memories', newMemoryId), newMemory);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'memories/' + newMemoryId);
      }
    }

    setIsFormOpen(false);
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(search.toLowerCase()));
    
    if (onlyFavorites) {
      return m.is_favorite && matchesSearch;
    }
    return matchesSearch;
  });

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
          className={`flex items-center gap-2 text-white font-medium text-sm py-2 px-4 rounded-xl cursor-pointer shadow-xs transition duration-200 ${themeColors.button}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Eternizar Momento</span>
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
            id="search-memory"
            placeholder="Procurar lembrança especial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100 transition"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          id="btn-filter-favorites"
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm transition cursor-pointer ${
            onlyFavorites
              ? `${themeColors.bg} ${themeColors.text} border-pink-200 font-medium`
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className={`w-4 h-4 ${onlyFavorites ? themeColors.fill : 'text-gray-400'}`} viewBox="0 0 24 24" fill={onlyFavorites ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>Mais Amados</span>
        </button>
      </div>

      {/* Form Dialog Alternative Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-xl border border-gray-150 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h4 className="text-base font-serif font-bold text-gray-800">
                {editingMemoryId ? 'Editar Lembrança' : 'Nova Lembrança Romântica'}
              </h4>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Título da Lembrança</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ${themeColors.ring}`}
                  placeholder="Ex: Jantar de 1 ano, Passeio de Barco..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">História / Detalhes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ${themeColors.ring} min-h-[90px] resize-none`}
                  placeholder="Escreva brevemente o que tornou esse dia tão memorável de recordar..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data do Momento</label>
                  <input
                    type="date"
                    required
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ${themeColors.ring}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Localização</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ${themeColors.ring}`}
                    placeholder="Ex: Praia de Copacabana"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">URL da Imagem</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ${themeColors.ring}`}
                  placeholder="Ex: https://images.unsplash.com/your-photo..."
                />
                <span className="text-[10px] text-gray-440 mt-0.5 block">Suba no Imgur, Cloudinary ou use imagens Unsplash para ilustrar.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 ${themeColors.ring}`}
                  placeholder="Ex: Viagem, Especial, Praia"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="form-favorite"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className={`w-4 h-4 text-rose-550 rounded-sm border-gray-300 focus:ring-rose-200 cursor-pointer ${themeColors.checkbox}`}
                />
                <label htmlFor="form-favorite" className="text-sm font-semibold text-gray-700 cursor-pointer flex items-center gap-1.5 select-none text-rose-500">
                  💝 Adicionar às Favoritas
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 text-sm border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl py-2 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-sm text-white rounded-xl py-2 font-semibold ${themeColors.button}`}
                >
                  Confirmar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center">
          <span className="text-4xl animate-bounce mb-3">🍃</span>
          <h4 className="text-base font-serif font-semibold text-gray-700">Nenhuma lembrança por aqui</h4>
          <p className="text-xs text-gray-400 max-w-xs mt-1">
            {search || onlyFavorites 
              ? 'Tente remover os filtros ou buscar por termos diferentes.'
              : 'Seu diário está em branco! Que tal registrar seu primeiro momento inesquecível agora?'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              id={`memory-card-${m.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition duration-300 group"
            >
              <div>
                {/* Image block */}
                {m.image_url ? (
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                    <SafeImage 
                      src={m.image_url} 
                      alt={m.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                      theme={profile.theme || 'pink'}
                      fallbackType="memory"
                    />
                    <button
                      onClick={() => handleToggleFavorite(m.id, m.is_favorite)}
                      className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white p-2 rounded-full shadow-xs cursor-pointer text-rose-500 transition"
                    >
                      <svg
                        className={`w-4 h-4 ${m.is_favorite ? 'fill-rose-550 text-rose-500' : 'text-gray-400'}`}
                        viewBox="0 0 24 24"
                        fill={m.is_favorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-400 font-mono">
                      {new Date(m.memory_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      onClick={() => handleToggleFavorite(m.id, m.is_favorite)}
                      className="text-rose-500 hover:scale-110 transition p-1"
                    >
                      <svg
                        className={`w-5 h-5 ${m.is_favorite ? 'fill-rose-550 text-rose-500' : 'text-gray-300'}`}
                        viewBox="0 0 24 24"
                        fill={m.is_favorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Text attributes */}
                {m.image_url && (
                  <span className="text-[11px] font-semibold text-gray-400 font-mono">
                    {new Date(m.memory_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                )}
                <h4 className="text-base font-serif font-bold text-gray-800 mt-1">{m.title}</h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed whitespace-pre-wrap">{m.description}</p>

                {/* Location badge */}
                {m.location && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-3 font-medium">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{m.location}</span>
                  </div>
                )}
              </div>

              {/* Actions footer of details card */}
              <div className="mt-5 pt-3 border-t border-gray-50 flex justify-between items-center">
                <div className="flex flex-wrap gap-1">
                  {m.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditForm(m)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition animate-none cursor-pointer"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition animate-none cursor-pointer"
                    title="Apagar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
            await deleteDoc(doc(db, 'memories', id));
            setError('');
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, 'memories/' + id);
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
