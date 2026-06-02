/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ImageUrlGuideProps {
  show: boolean;
  onToggle: () => void;
  themeTextColor: string;
}

export function ImageUrlGuide({ show, onToggle, themeTextColor }: ImageUrlGuideProps) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-white space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Ajuda de Links
        </span>
        <button
          type="button"
          onClick={onToggle}
          className={`text-[10px] font-bold underline cursor-pointer hover:opacity-85 ${themeTextColor}`}
        >
          {show ? 'Ocultar Dicas' : '❓ Como conseguir o link correto?'}
        </button>
      </div>
      {show && (
        <div className="text-[11px] text-gray-600 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
          <p className="font-bold text-gray-800">Guia Prático para Links de Imagens:</p>
          <div className="space-y-2 pl-1">
            <div>
              <p className="font-semibold text-gray-750">📌 Google Drive:</p>
              <p className="text-gray-500 font-normal leading-normal">No Drive, mude o compartilhamento para <strong>"Qualquer pessoa com o link" (Leitor)</strong>. Copie o link e cole. Nós convertemos para carregamento direto!</p>
            </div>
            <div>
              <p className="font-semibold text-gray-750">📌 Pinterest:</p>
              <p className="text-gray-500 font-normal leading-normal"><strong>Clique com o botão direito diretamente na imagem</strong> no Pinterest e escolha <strong>"Copiar endereço da imagem"</strong> (deve terminar em .jpg, .png ou similar).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-750">📌 Dropbox:</p>
              <p className="text-gray-500 font-normal leading-normal">Crie um link de compartilhamento público e simplesmente cole-o aqui.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-750">📌 Imagens/WhatsApp Web:</p>
              <p className="text-gray-500 font-normal leading-normal">Links diretos devem terminar em .jpg, .png, .webp. Links temporários do WhatsApp Web expiram rápido e devem ser evitados.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
