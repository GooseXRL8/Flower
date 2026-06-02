/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { User, Profile, Memory, ProfilePhoto } from '../types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export enum SupabaseOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
}

/**
 * Resilient parsing for memory tags, supporting JSONB arrays, text arrays, or serialized strings.
 */
export function safeParseTags(tags: any): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // If it's a comma-separated list of strings
      return tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * Helper to handle errors nicely with detailed logs
 */
export function handleSupabaseError(error: any, operation: SupabaseOperationType, table: string) {
  console.error(`[Supabase Error] Operation: ${operation}, Table: ${table}`, error);
  throw new Error(`Erro na operação ${operation} na tabela ${table}: ${error?.message || String(error)}`);
}

/**
 * Normalizes all kinds of image URLs (Google Drive, Dropbox, Imgur, base64 etc.)
 * into directly embeddable image elements.
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  // Bloquear protocolos perigosos para evitar XSS
  if (/^(javascript|vbscript|blob):/i.test(trimmed) || (trimmed.startsWith('data:') && !trimmed.startsWith('data:image/'))) {
    console.warn('[normalizeImageUrl] Protocolo bloqueado:', trimmed.slice(0, 30));
    return '';
  }

  // If it doesn't start with protocol and is not base64, prepend https://
  if (
    !trimmed.startsWith('http://') && 
    !trimmed.startsWith('https://') && 
    !trimmed.startsWith('data:image/')
  ) {
    trimmed = 'https://' + trimmed;
  }

  // Handle Google Drive web preview links
  // Pattern: https://drive.google.com/file/d/FILE_ID/view?usp=sharing or similar
  const gdRegex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const gdRegex2 = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  
  const gdMatch = trimmed.match(gdRegex1) || trimmed.match(gdRegex2);
  if (gdMatch && gdMatch[1]) {
    // Generate a direct link using the Google User Content endpoint (very fast and bypasses cors)
    return `https://lh3.googleusercontent.com/d/${gdMatch[1]}`;
  }

  // Handle Dropbox shares
  // E.g., https://www.dropbox.com/s/abcdefg/pic.jpg?dl=0
  if (trimmed.includes('dropbox.com')) {
    let dbUrl = trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    if (dbUrl.includes('?dl=')) {
      dbUrl = dbUrl.replace(/\?dl=\d+/, '?raw=1');
    } else if (!dbUrl.includes('?raw=1')) {
      dbUrl = dbUrl + (dbUrl.includes('?') ? '&raw=1' : '?raw=1');
    }
    return dbUrl;
  }

  // Handle Imgur relative album pages
  const imgurRegex = /imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]+)/;
  if (trimmed.includes('imgur.com') && !trimmed.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    const match = trimmed.match(imgurRegex);
    if (match && match[1]) {
      return `https://i.imgur.com/${match[1]}.jpg`;
    }
  }

  return trimmed;
}

/**
 * Generates a valid UUID v4 string.
 * This is fully compatible with both text and uuid typed columns in Supabase databases.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

