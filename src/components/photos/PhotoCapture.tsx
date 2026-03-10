'use client';

import { useRef, useState, useCallback } from 'react';
import { MAX_FILE_SIZE } from '@/lib/photo-service';

/** A file that has been selected locally but not yet uploaded. */
export interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface PhotoCaptureProps {
  /** Currently selected photos (for preview thumbnails) */
  photos: PendingPhoto[];
  /** Called when new photos are added */
  onPhotosAdded: (photos: PendingPhoto[]) => void;
  /** Called when a pending photo is removed */
  onPhotoRemoved: (id: string) => void;
  /** Maximum number of photos allowed */
  maxPhotos?: number;
  /** Disable interactions (e.g. while form is submitting) */
  disabled?: boolean;
}

let nextId = 0;

function generateId(): string {
  nextId += 1;
  return `pending-${Date.now()}-${nextId}`;
}

/**
 * PhotoCapture — camera / file-picker component with thumbnail preview strip.
 *
 * Supports:
 * - Native camera capture on mobile (`capture="environment"`)
 * - Multi-file selection from gallery / filesystem
 * - Live thumbnail previews of pending photos
 * - Per-photo remove button before upload
 * - File-size validation (rejects files larger than MAX_FILE_SIZE)
 */
export default function PhotoCapture({
  photos,
  onPhotosAdded,
  onPhotoRemoved,
  maxPhotos = 5,
  disabled = false,
}: PhotoCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const remaining = maxPhotos - photos.length;

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      setError(null);

      const filesToAdd = Array.from(fileList).slice(0, remaining);
      if (filesToAdd.length === 0) {
        setError(`Maximum of ${maxPhotos} photos reached.`);
        return;
      }

      const oversized = filesToAdd.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        setError(
          `${oversized.length} file(s) exceed the ${MAX_FILE_SIZE / 1024 / 1024} MB limit and were skipped.`,
        );
      }

      const validFiles = filesToAdd.filter((f) => f.size <= MAX_FILE_SIZE);
      if (validFiles.length === 0) return;

      const pending: PendingPhoto[] = validFiles.map((file) => ({
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      onPhotosAdded(pending);
    },
    [remaining, maxPhotos, onPhotosAdded],
  );

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          processFiles(e.target.files);
          e.target.value = '';
        }}
        disabled={disabled || remaining <= 0}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          processFiles(e.target.files);
          e.target.value = '';
        }}
        disabled={disabled || remaining <= 0}
      />

      {/* Thumbnail preview strip */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden
                         border border-gray-200 bg-gray-100"
            >
              <img
                src={photo.previewUrl}
                alt="Photo preview"
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(photo.previewUrl);
                    onPhotoRemoved(photo.id);
                  }}
                  className="absolute top-0.5 right-0.5 flex items-center justify-center
                             w-5 h-5 rounded-full bg-black/60 text-white text-xs
                             leading-none hover:bg-black/80 transition-colors"
                  aria-label="Remove photo"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {remaining > 0 && (
        <div className="flex gap-2">
          {/* Camera button — only useful on mobile but harmless on desktop */}
          <button
            type="button"
            onClick={handleCameraCapture}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg
                       border-2 border-dashed border-gray-300 py-3 text-sm
                       font-medium text-gray-500 hover:border-blue-400
                       hover:text-blue-600 active:bg-blue-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CameraIcon />
            <span>Camera</span>
          </button>

          {/* Gallery / file picker */}
          <button
            type="button"
            onClick={handleFileSelect}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg
                       border-2 border-dashed border-gray-300 py-3 text-sm
                       font-medium text-gray-500 hover:border-blue-400
                       hover:text-blue-600 active:bg-blue-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GalleryIcon />
            <span>Gallery</span>
          </button>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-gray-400 text-center">
        {photos.length} / {maxPhotos} photo{maxPhotos === 1 ? '' : 's'}
      </p>

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline SVG icons (avoid external dependency)
// ---------------------------------------------------------------------------

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
