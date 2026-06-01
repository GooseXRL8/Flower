/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError, SupabaseOperationType, normalizeImageUrl, generateUUID } from '../utils/supabase';
import { ProfilePhoto, User, Profile } from '../types';
import { SafeImage } from './SafeImage';
import { DEMO_PHOTOS } from '../data/demoData';
import { ConfirmModal } from './ConfirmModal';

interface ProfilePhotosGalleryProps {
  user: User;
  profile: Profile;
  isDemo?: boolean;
}

export function ProfilePhotosGallery({ user, profile, isDemo = false }: ProfilePhotosGalleryProps) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [ownerName, setOwnerName] = useState(user.username);
  const [error, setError] = useState('');
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [inputUrl]);

  const limitNumber = 5;
  const theme = profile.theme || 'pink';

  const themeColors = {
    pink: {
      text: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      button: 'bg-rose-500 hover:bg-rose-600 border border-transparent',
      ring: 'focus:ring-rose-200 focus:border-rose-400',
    },
    purple: {
      text: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      button: 'bg-purple-500 hover:bg-purple-600 border border-transparent',
      ring: 'focus:ring-purple-200 focus:border-purple-400',
    },
    green: {
      text: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 border border-transparent',
      ring: 'focus:ring-emerald-200 focus:border-emerald-400',
    },
  }[theme];

  const loadPhotos = async () => {
    if (isDemo) {
      setPhotos(DEMO_PHOTOS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('photos')
        .select('*')
        .eq('profile_id', profile.id);

      if (fetchErr) throw fetchErr;

      const sortedList = (data || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) as ProfilePhoto[];

      setPhotos(sortedList);
      setError('');
    } catch (err: any) {
      console.error('List photos error from Supabase:', err);
      setError('Não foi possível carregar as fotos do mural (erro de conexão com o Supabase).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [profile.id, isDemo]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputUrl.trim()) return;

    if (photos.length >= limitNumber) {
      setError(`Limite de ${limitNumber} fotos atingido! Remova uma foto abaixo para poder registrar outra.`);
      return;
    }

    const finalPhotoUrl = normalizeImageUrl(inputUrl);
    const newPhotoId = generateUUID();
    const newPhoto: ProfilePhoto = {
      id: newPhotoId,
      user_id: user.id,
      profile_id: profile.id,
      owner_name: ownerName.trim() || user.username,
      url: finalPhotoUrl,
      created_at: new Date().toISOString(),
    };

    if (isDemo) {
      setPhotos([newPhoto, ...photos]);
      setInputUrl('');
      return;
    }

    try {
      const { error: insertErr } = await supabase
        .from('photos')
        .insert(newPhoto);

      if (insertErr) throw insertErr;

      setInputUrl('');
      await loadPhotos();
    } catch (err: any) {
      console.error('Error inserting photos in Supabase:', err);
      setError('Falha ao adicionar a foto no Supabase: ' + (err.message || String(err)));
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotoToDelete(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-serif font-bold text-gray-800">Mural de Polaroids</h3>
        <p className="text-xs text-gray-400 mt-0.5">Adicione os registros mais fofos do seu dia a dia (limite de até {limitNumber} polaroids)</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold animate-pulse-soft">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Upload/Add block (Only if photos count < strict 5) */}
          {photos.length < limitNumber ? (
            <form onSubmit={handleAddPhoto} className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl space-y-3.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Novidade para o Mural</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Quem registrou?</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    maxLength={20}
                    placeholder="Ex: Nome de quem tirou"
                    className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">URL do Registro</label>
                  <input
                    type="text"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Cole qualquer link (Drive, Dropbox, Imgur, etc.)"
                    className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 ${themeColors.ring} cursor-pointer`}
                  />
                </div>
              </div>

              {/* LIVE PREVIEW AND HELP BLOCK */}
              {inputUrl.trim() && (
                <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-white space-y-2.5 animate-fade-in text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visualização Prévia (Amostra)</span>
                    <button
                      type="button"
                      onClick={() => setShowGuide(!showGuide)}
                      className={`text-[10px] font-bold underline cursor-pointer hover:opacity-80 ${themeColors.text}`}
                    >
                      {showGuide ? 'Ocultar Dicas' : '❓ Como conseguir o link correto?'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Compact Image sample frame */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                      {!previewError ? (
                        <img
                          src={normalizeImageUrl(inputUrl)}
                          alt="Prévia em tempo real"
                          onError={() => {
                            console.warn('Real-time url load failure on live preview:', inputUrl);
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
                            Isso ocorre se o link não corresponder a uma imagem direta ou se for restrito. Clique no botão de dicas acima para saber como resolver!
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-emerald-600 flex items-center gap-1">
                            <span>✓</span> Imagem detectada e carregada!
                          </p>
                          <p className="text-[10px] text-gray-500 leading-normal">
                            O link inserido é válido e será exibido perfeitamente na sua galeria se estiver compartilhado publicamente.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expandable Image Guide */}
                  {showGuide && (
                    <div className="text-[11px] text-gray-600 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed font-sans">
                      <p className="font-bold text-gray-800">Guia Prático para Links de Imagens:</p>
                      
                      <div className="space-y-1.5 pl-1">
                        <div>
                          <p className="font-semibold text-gray-700">📌 Google Drive:</p>
                          <p className="text-gray-500">No Drive, mude o compartilhamento para <strong>"Qualquer pessoa com o link" (Leitor)</strong>. Copie esse link e cole. Nós o convertemos automaticamente!</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">📌 Pinterest:</p>
                          <p className="text-gray-500">Não copie o link da barra de endereços do navegador! Em vez disso, <strong>clique com o botão direito diretamente na imagem do Pinterest e selecione "Copiar endereço da imagem"</strong> (deve terminar em .jpg ou .png).</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">📌 Dropbox:</p>
                          <p className="text-gray-500">Basta copiar o link padrão do compartilhamento público que nós cuidamos do resto para você.</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">📌 Imagens da Internet ou WhatsApp Web:</p>
                          <p className="text-gray-500">Procure copiar o link direto terminando em extensões válidas (.jpg, .png, .webp). Links temporários do WhatsApp Web expirarão após algumas horas.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className={`text-white text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer shadow-xs transition duration-200 ${themeColors.button}`}
                >
                  Adicionar Polaroid ({photos.length}/{limitNumber})
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Mural Completo!</p>
                <p className="text-xs text-emerald-600 mt-0.5">Vocês alcançaram o limite máximo de {limitNumber} memórias fotográficas. Delete alguma das polaroids se quiser abrir espaço!</p>
              </div>
            </div>
          )}

          {/* Grid mural print */}
          {photos.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center">
              <span className="text-4xl animate-pulse mb-3">🖼️</span>
              <h4 className="text-base font-serif font-semibold text-gray-700">Mural Vazio</h4>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Coloque fotos românticas de vocês para preencher a galeria compartilhadora de carinho!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2 justify-items-center">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white p-3 pb-8 rounded-sm shadow-md border border-gray-150 rotate-[-1deg] hover:rotate-0 hover:scale-103 hover:shadow-lg transition-all duration-300 w-full max-w-[220px]"
                >
                  <div className="aspect-square w-full rounded-sm overflow-hidden mb-3.5 relative bg-gray-100 group">
                    <SafeImage
                      src={photo.url}
                      alt={`Memória de ${photo.owner_name}`}
                      className="w-full h-full object-cover animate-fade-in"
                      theme={theme}
                      fallbackType="polaroid"
                    />
                    
                    {/* Always visible responsive delete button at the top-right corner */}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-rose-500 p-1.5 rounded-full shadow-xs cursor-pointer transition transform hover:scale-110 active:scale-95 z-25"
                      title="Remover Polaroid"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Hand-written like text description */}
                  <div className="text-center font-serif text-sm font-semibold italic text-gray-700 tracking-wide truncate px-1">
                    Por {photo.owner_name}
                  </div>
                  <div className="text-center text-[9px] text-gray-400 font-mono uppercase mt-1">
                    {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={photoToDelete !== null}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={async () => {
          if (!photoToDelete) return;
          const id = photoToDelete;
          if (isDemo) {
            setPhotos(photos.filter((p) => p.id !== id));
            return;
          }
          try {
            const { error: delErr } = await supabase
              .from('photos')
              .delete()
              .eq('id', id);

            if (delErr) throw delErr;

            setError('');
            await loadPhotos();
          } catch (err: any) {
            console.error('Delete photo Error in Supabase:', err);
            setError('Não foi possível remover essa foto do Supabase: ' + (err.message || String(err)));
          }
        }}
        title="Excluir Polaroid?"
        message="Deseja mesmo remover permanentemente essa foto especial do mural?"
        confirmText="Excluir"
        cancelText="Manter"
        theme={theme}
      />
    </div>
  );
}
