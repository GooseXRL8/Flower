/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      // Setup dynamic custom parameters if needed
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('Não foi possível obter dados do usuário autenticado no Google.');
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let loggedInUser: User;

      if (userDocSnap.exists()) {
        loggedInUser = userDocSnap.data() as User;
      } else {
        // If user email matches userEmail metadata, promote to admin dynamically!
        const isAdminUser = user.email === 'joaotitua@gmail.com';
        
        loggedInUser = {
          id: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'Parceiro(a)',
          is_admin: isAdminUser,
          assigned_profile_id: null,
          created_at: new Date().toISOString()
        };

        await setDoc(userDocRef, loggedInUser);
      }

      onLoginSuccess(loggedInUser);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('A janela de login foi fechada antes de concluir a autenticação.');
      } else {
        setError('Ocorreu um erro na autenticação Firebase: ' + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-gray-100 p-6 md:p-8 w-full max-w-md shadow-lg flex flex-col">
        
        {/* Visual Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-3xl animate-heart-beat mb-4 shadow-sm">
            🌸
          </div>
          <h1 className="text-2xl font-serif font-black text-gray-800">FlowerLove</h1>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
            Seu espaço romântico seguro na nuvem. Registre de forma sincronizada cada detalhe da sua história especial.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold mb-6 animate-pulse-soft">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            id="btn-google-login"
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-rose-300 disabled:to-pink-300 text-white font-semibold text-sm py-3 px-4 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.46 1.64l2.36-2.36C17.31 1.76 14.9 1 12.24 1A10 10 0 002.24 11a10 10 0 0010 10c5.36 0 10-3.86 10-10 0-.61-.06-1.21-.16-1.715H12.24z"/>
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>
        </div>

        {/* Informational security metadata footer */}
        <div className="mt-8 border-t border-gray-100 pt-5 text-center space-y-2">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center justify-center gap-1">
            <span>🔒</span> Conexão de Dados Protegida por Firestore
          </p>
          <p className="text-[10px] text-gray-300">
            Apenas você e quem você associar ao seu espaço terão acesso compartilhado às lembranças e fotos registradas.
          </p>
        </div>

      </div>
    </div>
  );
}
