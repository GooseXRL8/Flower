/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError, SupabaseOperationType, generateUUID } from '../utils/supabase';
import { User, Profile } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface AdminTabProps {
  currentUser: User;
}

export function AdminTab({ currentUser }: AdminTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration credentials states
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch all users
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*');
      if (userErr) throw userErr;

      // Fetch all profiles
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*');
      if (profileErr) throw profileErr;

      setUsers((userData || []) as User[]);
      setProfiles((profileData || []) as Profile[]);
      setError('');
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError('Falha ao carregar lista de usuários/perfis: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = (id: string, username: string) => {
    if (id === currentUser.id) {
      setError('Você não pode apagar sua própria conta de administrador!');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setUserToDelete({ id, username });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUser = newUsername.trim();
    const trimmedEmail = newUserEmail.trim();
    const trimmedPassword = newUserPassword.trim();

    if (!trimmedUser) {
      setError('Por favor, preencha o nome de usuário.');
      return;
    }

    if (!trimmedEmail) {
      setError('Por favor, preencha o e-mail.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    const matchedUser = users.find((u) => u.username.toLowerCase() === trimmedUser.toLowerCase());
    if (matchedUser) {
      setError('Este nome de usuário já está sendo utilizado.');
      return;
    }

    setLoading(true);

    try {
      let createdUserId = generateUUID();
      const pId = generateUUID();

      // Se o Supabase estiver configurado, criamos um usuário Auth de verdade! (BUG-01)
      const url = import.meta.env.VITE_SUPABASE_URL || '';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const isConfigured = !!(url && anonKey && !url.includes('placeholder-project') && !url.includes('SEU_PROJETO'));

      if (isConfigured) {
        // Criar cliente local temporário com persistSession false para não deslogar o administrador ativo
        const { createClient } = await import('@supabase/supabase-js');
        const tempSupabase = createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });

        const { data: authData, error: authErr } = await tempSupabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              full_name: trimmedUser,
            }
          }
        });

        if (authErr) throw authErr;
        if (!authData.user) {
          throw new Error('Não foi possível obter o usuário de autenticação retornado.');
        }

        createdUserId = authData.user.id;
      }

      const newProfile: Profile = {
        id: pId,
        name1: trimmedUser,
        name2: 'Amor de ' + trimmedUser,
        created_by: createdUserId,
        start_date: new Date().toISOString().split('T')[0],
        custom_title: `História de ${trimmedUser} & Amor`,
        theme: 'pink',
        created_at: new Date().toISOString()
      };

      const newUser: User = {
        id: createdUserId,
        username: trimmedUser,
        is_admin: newIsAdmin,
        assigned_profile_id: pId,
        created_at: new Date().toISOString(),
      };

      // Salvar perfil em public.profiles
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert(newProfile);
      if (profileErr) throw profileErr;

      // Salvar usuário em public.users
      const { error: userErr } = await supabase
        .from('users')
        .insert(newUser);
      if (userErr) throw userErr;

      setNewUsername('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewIsAdmin(false);
      setSuccess(`Usuário ${newUser.username} cadastrado com sucesso com conta de autenticação integrada!`);
      
      // Recarregar os dados do painel do admin
      await loadData();
      
      setTimeout(() => setSuccess(''), 4500);
    } catch (err: any) {
      console.error('Error manual account registration:', err);
      setError('Falha ao registrar usuário: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-serif font-bold text-gray-800">Painel do Administrador</h3>
        <p className="text-xs text-gray-400 mt-0.5">Visão geral das contas registradas e gerenciamento de perfis de casais no FlowerLove</p>
      </div>

      {error && <div className="bg-rose-50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs font-semibold">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 text-xs font-semibold">{success}</div>}

      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        /* Grid structure dividing User List & Quick register */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User list Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <span className="text-sm font-semibold text-gray-700 block">Usuários Cadastrados ({users.length})</span>
            
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="min-w-full text-xs text-left" id="admin-user-table">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">ID do Perfil</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800 flex items-center gap-2">
                        <span>👤</span>
                        <span>{u.username}</span>
                        {u.id === currentUser.id && (
                          <span className="bg-rose-50 text-rose-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">Você</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_admin ? (
                          <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Admin</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium">Casal</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-gray-400">
                        {u.assigned_profile_id || 'Nenhum'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={u.id === currentUser.id}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick custom register inside admin block */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <span className="text-sm font-semibold text-gray-700 block">Cadastrar Usuário Manual</span>
            
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Username / Nome do Par</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: julia"
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">E-mail do Casal</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Ex: julia@amor.com"
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Senha de Acesso</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="check-admin"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  className="w-3.5 h-3.5 text-rose-500 border-gray-300 focus:ring-rose-200 rounded-sm"
                />
                <label htmlFor="check-admin" className="text-xs font-semibold text-gray-600 select-none cursor-pointer font-serif">
                  Dar privilégios de Administrador
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2 rounded-xl transition shadow-xs cursor-pointer font-serif"
              >
                Criar Conta e Perfil
              </button>
            </form>
          </div>

        </div>
      )}

      <ConfirmModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={async () => {
          if (!userToDelete) return;
          const { id, username } = userToDelete;
          try {
            const { error: delErr } = await supabase
              .from('users')
              .delete()
              .eq('id', id);
            
            if (delErr) throw delErr;

            setSuccess(`Usuário "${username}" foi excluído com sucesso do Supabase.`);
            await loadData();
            setTimeout(() => setSuccess(''), 4000);
          } catch (err: any) {
            console.error('Failed to delete user:', err);
            setError('Falha ao apagar usuário: ' + (err.message || String(err)));
          }
        }}
        title="Excluir Usuário?"
        message={`Deseja mesmo remover permanentemente a conta de "${userToDelete?.username}" de sua base de dados? Esta ação não pode ser desfeita.`}
        confirmText="Confirmar Exclusão"
        cancelText="Manter"
        theme="pink"
      />
    </div>
  );
}
