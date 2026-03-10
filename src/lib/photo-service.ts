/**
 * PhotoService — handles photo upload, resize, URL generation, and deletion
 * using Supabase Storage.
 *
 * Photos are stored in the "spot-photos" bucket organised by spotId:
 *   {spotId}/{timestamp}.jpg        — full-size (max 1200px wide)
 *   {spotId}/thumb_{timestamp}.jpg  — thumbnail  (max 400px wide)
 */

import { supabase } from '@/lib/supabase';

const BUCKET = 'spot-photos';
const THUMB_MAX_WIDTH = 400;
const FULL_MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.8;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resize an image file on the client using an off-screen canvas.
 * Returns a JPEG Blob capped at `maxWidth` pixels wide while preserving
 * the aspect ratio.
 */
async function resizeImage(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas 2D context'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('canvas.toBlob returned null'));
          }
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = objectUrl;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Upload a photo for a spot.
 *
 * Creates two variants in Supabase Storage:
 *   - thumbnail  (max 400 px wide)
 *   - full-size  (max 1200 px wide)
 *
 * @returns The storage paths for both variants.
 */
export async function uploadPhoto(
  file: File,
  spotId: string,
): Promise<{ thumbPath: string; fullPath: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the ${MAX_FILE_SIZE / 1024 / 1024} MB limit`,
    );
  }

  const timestamp = Date.now();
  const baseName = `${timestamp}.jpg`;

  // Resize both variants in parallel
  const [thumbBlob, fullBlob] = await Promise.all([
    resizeImage(file, THUMB_MAX_WIDTH, JPEG_QUALITY),
    resizeImage(file, FULL_MAX_WIDTH, JPEG_QUALITY),
  ]);

  const thumbPath = `${spotId}/thumb_${baseName}`;
  const fullPath = `${spotId}/${baseName}`;

  // Upload both to Supabase Storage in parallel
  const [thumbResult, fullResult] = await Promise.all([
    supabase.storage.from(BUCKET).upload(thumbPath, thumbBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    }),
    supabase.storage.from(BUCKET).upload(fullPath, fullBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    }),
  ]);

  if (thumbResult.error) throw thumbResult.error;
  if (fullResult.error) throw fullResult.error;

  return { thumbPath, fullPath };
}

/**
 * Get the public URL for a storage path inside the spot-photos bucket.
 */
export function getPhotoUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Given the full-size path (`{spotId}/{timestamp}.jpg`), derive and return
 * the public URL for its thumbnail variant.
 */
export function getThumbnailUrl(fullPath: string): string {
  const parts = fullPath.split('/');
  const filename = parts.pop()!;
  const thumbPath = [...parts, `thumb_${filename}`].join('/');
  return getPhotoUrl(thumbPath);
}

/**
 * Return the public URL for the full-size variant.
 */
export function getFullUrl(fullPath: string): string {
  return getPhotoUrl(fullPath);
}

/**
 * Delete photos from Supabase Storage.
 *
 * Accepts an array of *full-size* paths. The corresponding thumbnail paths
 * are derived automatically and removed as well.
 */
export async function deletePhotos(photoPaths: string[]): Promise<void> {
  if (photoPaths.length === 0) return;

  // Build the complete list including thumbnail variants
  const allPaths: string[] = [];
  for (const path of photoPaths) {
    allPaths.push(path);
    const parts = path.split('/');
    const filename = parts.pop()!;
    allPaths.push([...parts, `thumb_${filename}`].join('/'));
  }

  const { error } = await supabase.storage.from(BUCKET).remove(allPaths);
  if (error) throw error;
}
