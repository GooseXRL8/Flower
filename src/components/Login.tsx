/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'google' | 'credentials'>('google');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  // Credentials states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const checkAndCreateUserRecord = async (authSecUser: any, customUsername?: string) => {
    try {
      const { data: existingUser, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', authSecUser.id)
        .maybeSingle();

      if (existingUser) {
        return existingUser as User;
      }

      // First time login - Bootstrap user document
      const isAdminUser = authSecUser.email === 'joaotitua@gmail.com';
      const emailPrefix = authSecUser.email ? authSecUser.email.split('@')[0] : 'Parceiro(a)';
      const displayName = customUsername || authSecUser.user_metadata?.full_name || authSecUser.user_metadata?.name || emailPrefix;

      const newUser: User = {
        id: authSecUser.id,
        username: displayName,
        is_admin: isAdminUser,
        assigned_profile_id: null,
        created_at: new Date().toISOString()
      };

      const { error: insertErr } = await supabase
        .from('users')
        .insert(newUser);

      if (insertErr) {
        console.error('Error inserting user to public:', insertErr);
        // Fallback or retry insert
      }
      
      return newUser;
    } catch (err) {
      console.error('Failed to bootstrap user record:', err);
      // Fallback
      return {
        id: authSecUser.id,
        username: customUsername || authSecUser.email?.split('@')[0] || 'Parceiro(a)',
        is_admin: authSecUser.email === 'joaotitua@gmail.com',
        assigned_profile_id: null,
        created_at: new Date().toISOString()
      };
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (oauthError) throw oauthError;
      
      // Since OAuth redirects the user, we let them redirect. 
      // Safe guard against instant return:
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro no login do Google: ' + (err.message || String(err)) + '\nDica: Se você estiver testando dentro do iFrame, use a opção "E-mail e Senha"!');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        // Register validation
        if (!username.trim()) {
          throw new Error('Por favor, informe seu nome de parceiro(a).');
        }
        if (password.length < 6) {
          throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        }

        // Register user
        const { data, error: registerErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username.trim(),
            }
          }
        });

        if (registerErr) throw registerErr;

        if (!data.user) {
          throw new Error('Erro ao criar usuário na base do Supabase.');
        }

        const newUser = await checkAndCreateUserRecord(data.user, username.trim());
        onLoginSuccess(newUser);
      } else {
        // Login
        const { data, error: loginErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginErr) throw loginErr;

        if (!data.user) {
          throw new Error('Não foi possível obter dados do e-mail inserido.');
        }

        const loggedInUser = await checkAndCreateUserRecord(data.user);
        onLoginSuccess(loggedInUser);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Código/Credenciais inválidos ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10 animate-fade-in animate-duration-300">
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-gray-100 p-6 md:p-8 w-full max-w-md shadow-lg flex flex-col">
        
        {/* Visual Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-3xl animate-heart-beat mb-3.5 shadow-xs">
            🌸
          </div>
          <h1 className="text-2xl font-serif font-black text-gray-800">FlowerLove</h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Seu espaço especial sincronizado com Supabase. Guarde cada detalhe da sua história.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold mb-5 whitespace-pre-line leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-gray-50 p-1.5 rounded-xl gap-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('google'); setError(''); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'google' ? 'bg-white shadow-xs text-rose-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Google OAuth
          </button>
          <button
            type="button"
            onClick={() => { setMode('credentials'); setError(''); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              mode === 'credentials' ? 'bg-white shadow-xs text-rose-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            E-mail / Senha
          </button>
        </div>

        {mode === 'google' ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              id="btn-google-login"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-rose-300 disabled:to-pink-300 text-white font-semibold text-sm py-3 px-4 rounded-xl transition duration-300 shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
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
            <p className="text-[10px] text-gray-400 text-center font-medium">
              Recomendado para uso fora da ferramenta de pré-visualização.
            </p>

            <div className="border border-rose-100 rounded-2xl p-3 bg-rose-50/30 space-y-2 mt-4 text-left">
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="w-full flex items-center justify-between text-xs font-bold text-rose-700 hover:text-rose-800 focus:outline-none cursor-pointer"
              >
                <span>💡 Guia de Ajuda: Erros com Login do Google</span>
                <span>{showSetupGuide ? '▲' : '▼'}</span>
              </button>
              
              {showSetupGuide && (
                <div className="text-[11px] text-gray-600 leading-relaxed space-y-3.5 pt-2.5 border-t border-rose-100/50 animate-fade-in font-sans">
                  
                  {/* Step 1: Solution for Unsupported provider: provider is not enabled */}
                  <div className="space-y-1">
                    <h5 className="font-bold text-rose-600 flex items-center gap-1">
                      <span>🛑</span> 1. Erro "provider is not enabled"
                    </h5>
                    <p className="text-gray-600">
                      Esse erro significa que o login com Google está <strong>desativado</strong> no painel de configurações do seu projeto Supabase. Para corrigir:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-gray-700">
                      <li>Acesse o <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-rose-500 font-bold hover:underline">Painel do Supabase</a> e selecione seu projeto.</li>
                      <li>Vá no menu esquerdo em <strong>Authentication</strong> e depois clique em <strong className="text-slate-800">Providers</strong> (Provedores).</li>
                      <li>Procure pela opção <strong className="text-slate-800">Google</strong> e clique nela para abrir/expandir.</li>
                      <li>Ative a chave seletora <strong>"Enable Google provider"</strong> (Habilitar provedor Google) para ficar ligada (verde/ativo).</li>
                      <li>Cole as suas credenciais obtidas no Google Cloud Console nos campos correspondentes (<strong>Google Client ID</strong> e <strong>Google Client Secret</strong>).</li>
                      <li>Selecione ou deixe desmarcado as outras opções padrão e clique no botão <strong className="text-slate-800 font-extrabold">Save</strong> (Salvar) no canto inferior.</li>
                    </ol>
                  </div>

                  {/* Step 2: Solution for Redirect loop or local host issue */}
                  <div className="space-y-1 pt-1.5 border-t border-gray-100">
                    <h5 className="font-bold text-rose-600 flex items-center gap-1">
                      <span>🔄</span> 2. Erro de Localhost ou Conexão Infinita
                    </h5>
                    <p className="text-gray-600">
                      O Supabase pode redirecionar para <code className="font-mono bg-white px-1 text-rose-500 rounded border border-gray-100 text-[10px]">localhost:3000</code>. Para ajustar o link de retorno:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-gray-700">
                      <li>Acesse de novo o Painel do Supabase e seu projeto.</li>
                      <li>No menu lateral, vá em <strong>Authentication</strong> &gt; <strong>URL Configuration</strong>.</li>
                      <li>No campo <strong>Site URL</strong>, altere para:
                        <div className="flex items-center gap-1 mt-1 font-mono bg-white p-1 rounded border border-gray-150 text-[10px] select-all overflow-x-auto">
                          {window.location.origin}
                        </div>
                      </li>
                      <li>Em <strong>Redirect URLs</strong> (Additional Redirect URLs), adicione estas duas linhas exatamente:
                        <div className="flex flex-col gap-1 mt-1 font-mono bg-white p-1 rounded border border-gray-150 text-[10px] select-all overflow-x-auto">
                          <span>{window.location.origin}/**</span>
                          <span>{window.location.origin.replace('-dev-', '-pre-')}/**</span>
                        </div>
                      </li>
                      <li>Clique em <strong>Save</strong> para aplicar as novas rotas.</li>
                    </ol>
                  </div>

                  <p className="text-[10px] text-gray-400 italic font-medium p-2 bg-white/50 rounded-lg border border-rose-50">
                    Dica: Se quiser usar o app agora mesmo de forma offline/local sem configurar isso, você pode clicar na aba <strong>E-mail / Senha</strong> acima e criar uma conta manual rápida!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs border border-gray-150 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-250 bg-gray-50/50"
                  placeholder="Seu nome ou apelido carinhoso"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-gray-150 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-250 bg-gray-50/50"
                placeholder="Ex e-mail: par@amor.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs border border-gray-150 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-250 bg-gray-50/50"
                placeholder="Mínimo de 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-rose-300 disabled:to-pink-300 text-white font-semibold text-xs py-3 rounded-xl transition duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>{isRegister ? 'Confirmar Cadastro' : 'Entrar na Conta'}</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-xs text-rose-500 hover:text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                {isRegister ? 'Já tenho um cadastro. Fazer Login!' : 'Ainda não tem cadastro? Crie um espaço!'}
              </button>
            </div>
          </form>
        )}

        {/* Informational security metadata footer */}
        <div className="mt-8 border-t border-gray-100 pt-5 text-center space-y-1.5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center justify-center gap-1">
            <span>🔌</span> Conexão de Dados Ativa via Supabase
          </p>
          <p className="text-[10px] text-gray-300">
            Segurança de dados e encriptação completa em suas fotos de casal.
          </p>
        </div>

      </div>
    </div>
  );
}
