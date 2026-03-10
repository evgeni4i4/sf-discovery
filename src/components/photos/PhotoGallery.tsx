'use client';

import { useState, useCallback } from 'react';
import { getThumbnailUrl, getFullUrl, deletePhotos } from '@/lib/photo-service';

interface PhotoGalleryProps {
  /** Array of full-size storage paths (e.g. "{spotId}/{timestamp}.jpg") */
  photoPaths: string[];
  /** Called after photos have been deleted so the parent can refresh its data */
  onPhotosDeleted?: (deletedPaths: string[]) => void;
  /** Allow deletion (hide delete buttons in read-only mode) */
  allowDelete?: boolean;
}

/**
 * PhotoGallery — responsive grid of spot photos.
 *
 * Displays thumbnail variants for performance. Tapping a photo opens the
 * full-size version in a lightbox overlay. Each photo has an optional delete
 * button that first asks for confirmation, then removes the photo from
 * Supabase Storage and notifies the parent.
 */
export default function PhotoGallery({
  photoPaths,
  onPhotosDeleted,
  allowDelete = false,
}: PhotoGalleryProps) {
  const [lightboxPath, setLightboxPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [confirmPath, setConfirmPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (path: string) => {
      setError(null);
      setDeletingPath(path);
      try {
        await deletePhotos([path]);
        onPhotosDeleted?.([path]);
        setConfirmPath(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete photo';
        setError(message);
      } finally {
        setDeletingPath(null);
      }
    },
    [onPhotosDeleted],
  );

  if (photoPaths.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        No photos yet
      </p>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {photoPaths.map((path) => {
          const thumbUrl = getThumbnailUrl(path);
          const isConfirming = confirmPath === path;
          const isDeleting = deletingPath === path;

          return (
            <div
              key={path}
              className="relative aspect-square rounded-lg overflow-hidden
                         bg-gray-100 group"
            >
              <button
                type="button"
                onClick={() => setLightboxPath(path)}
                className="w-full h-full"
                aria-label="View full-size photo"
              >
                <img
                  src={thumbUrl}
                  alt="Spot photo"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform
                             group-hover:scale-105"
                />
              </button>

              {/* Delete button */}
              {allowDelete && !isConfirming && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmPath(path);
                  }}
                  disabled={isDeleting}
                  className="absolute top-1 right-1 flex items-center justify-center
                             w-6 h-6 rounded-full bg-black/50 text-white text-xs
                             opacity-0 group-hover:opacity-100 sm:opacity-100
                             hover:bg-red-600 transition-all
                             disabled:opacity-50"
                  aria-label="Delete photo"
                >
                  &times;
                </button>
              )}

              {/* Delete confirmation overlay */}
              {isConfirming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center
                                gap-2 bg-black/60 p-2">
                  <p className="text-xs text-white text-center font-medium">
                    Delete this photo?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(path);
                      }}
                      disabled={isDeleting}
                      className="rounded px-3 py-1 text-xs font-medium bg-red-600
                                 text-white hover:bg-red-700 transition-colors
                                 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmPath(null);
                      }}
                      disabled={isDeleting}
                      className="rounded px-3 py-1 text-xs font-medium bg-white/90
                                 text-gray-800 hover:bg-white transition-colors
                                 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
      )}

      {/* Lightbox */}
      {lightboxPath && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/80 p-4"
          onClick={() => setLightboxPath(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size photo viewer"
        >
          <button
            type="button"
            onClick={() => setLightboxPath(null)}
            className="absolute top-4 right-4 flex items-center justify-center
                       w-10 h-10 rounded-full bg-black/50 text-white text-2xl
                       hover:bg-black/70 transition-colors z-10"
            aria-label="Close photo viewer"
          >
            &times;
          </button>
          <img
            src={getFullUrl(lightboxPath)}
            alt="Spot photo full size"
            className="max-w-full max-h-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
