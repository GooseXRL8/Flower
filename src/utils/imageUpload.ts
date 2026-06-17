/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabase';

/**
 * Upload an image file to Supabase Storage and return the public URL
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (e.g., 'memories', 'photos')
 * @param profileId - The profile ID for organizing uploads
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  bucket: string,
  profileId: string
): Promise<string> {
  if (!file) {
    throw new Error('Nenhum arquivo foi selecionado');
  }

  // Validate file type
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validMimeTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPEG, PNG, WebP ou GIF.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo de 5MB.');
  }

  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${profileId}/${timestamp}-${randomSuffix}.${extension}`;

    // Upload the file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
    }

    if (!data) {
      throw new Error('Resposta de upload inválida');
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Não foi possível gerar URL pública para a imagem');
    }

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Delete an image file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The file path to delete
 */
export async function deleteImageFromStorage(
  bucket: string,
  filePath: string
): Promise<void> {
  if (!filePath) {
    return;
  }

  try {
    // Extract the path from the public URL if needed
    let pathToDelete = filePath;
    if (filePath.includes('/storage/v1/object/public/')) {
      const parts = filePath.split('/storage/v1/object/public/');
      if (parts[1]) {
        const bucketAndPath = parts[1].split('/');
        pathToDelete = bucketAndPath.slice(1).join('/');
      }
    }

    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([pathToDelete]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Don't throw here as the image might already be deleted
    }
  } catch (error: any) {
    console.error('Image delete error:', error);
    // Silently fail for delete operations
  }
}

/**
 * Check if a URL is from Supabase Storage
 * @param url - The URL to check
 * @returns True if the URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co') || url.includes('storage/v1/object/public');
}
