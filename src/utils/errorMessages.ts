/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function parseSupabaseError(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Erro desconhecido. Tente novamente.';
  const e = err as Record<string, any>;

  // Códigos PostgreSQL / Supabase comuns
  const errorMap: Record<string, string> = {
    '42501': 'Sem permissão para realizar esta ação. Verifique as configurações de acesso.',
    '23505': 'Este registro já existe. Verifique os dados inseridos.',
    '23503': 'Referência inválida. O registro relacionado não existe.',
    '42P01': 'Tabela não encontrada. Verifique se o banco foi configurado corretamente.',
    'PGRST301': 'Sessão expirada. Faça login novamente.',
    'PGRST116': 'Nenhum registro encontrado.',
  };

  if (e.code && errorMap[e.code]) return errorMap[e.code];
  if (e.message?.includes('row-level security')) return 'Acesso negado. Você não tem permissão para esta operação.';
  if (e.message?.includes('JWT')) return 'Sessão inválida. Faça login novamente.';
  if (e.message?.includes('network')) return 'Falha de conexão. Verifique sua internet.';

  return e.message || 'Ocorreu um erro inesperado. Tente novamente.';
}
