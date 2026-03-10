'use client';

import { useState, useCallback, type FormEvent } from 'react';
import type { CreateSpotInput, SpotCategory } from '@/types';
import CategoryPicker from './CategoryPicker';
import PhotoCapture, { type PendingPhoto } from '@/components/photos/PhotoCapture';
import { uploadPhoto } from '@/lib/photo-service';

/** Values used to pre-fill the form in edit mode */
export interface SpotFormInitialValues {
  name: string;
  category: SpotCategory;
  rating?: number;
  notes?: string;
  visitDate?: string;
}

interface SpotFormProps {
  /** Pre-filled coordinates from the map long-press */
  initialCoords: { lng: number; lat: number };
  /** Called when the form is submitted with valid data */
  onSubmit: (input: CreateSpotInput) => Promise<void>;
  /** Called when the user cancels */
  onCancel: () => void;
  /** Disables the form while a submission is in-flight */
  submitting?: boolean;
  /** Optional initial values for edit mode */
  initialValues?: SpotFormInitialValues;
  /** Label for the submit button (defaults to "Save Spot") */
  submitLabel?: string;
}

export default function SpotForm({
  initialCoords,
  onSubmit,
  onCancel,
  submitting = false,
  initialValues,
  submitLabel,
}: SpotFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [category, setCategory] = useState<SpotCategory | null>(initialValues?.category ?? null);
  const [rating, setRating] = useState<number>(initialValues?.rating ?? 0);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [visitDate, setVisitDate] = useState(
    initialValues?.visitDate ?? new Date().toISOString().slice(0, 10),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const handlePhotosAdded = useCallback((newPhotos: PendingPhoto[]) => {
    setPendingPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const handlePhotoRemoved = useCallback((id: string) => {
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a spot name.');
      return;
    }
    if (!category) {
      setValidationError('Please pick a category.');
      return;
    }

    // Upload pending photos first
    const uploadedPaths: string[] = [];
    if (pendingPhotos.length > 0) {
      // We use a temporary spot id based on timestamp for storage organization.
      // The actual spot id is assigned by the backend, but photos are stored
      // under this temporary id which becomes the effective folder name.
      const tempSpotId = `spot-${Date.now()}`;
      setUploadProgress(`Uploading photos (0/${pendingPhotos.length})...`);

      for (let i = 0; i < pendingPhotos.length; i++) {
        setUploadProgress(
          `Uploading photos (${i + 1}/${pendingPhotos.length})...`,
        );
        try {
          const { fullPath } = await uploadPhoto(
            pendingPhotos[i].file,
            tempSpotId,
          );
          uploadedPaths.push(fullPath);
        } catch {
          // Skip failed uploads but continue with the rest
        }
      }
      setUploadProgress(null);
    }

    const input: CreateSpotInput = {
      name: name.trim(),
      location: initialCoords,
      category,
      rating: rating > 0 ? rating : undefined,
      notes: notes.trim() || undefined,
      visitDate: visitDate || undefined,
      photoUrls: uploadedPaths,
    };

    await onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* ---- Name ---- */}
      <div>
        <label htmlFor="spot-name" className="block text-sm font-semibold text-gray-700 mb-1">
          Spot Name
        </label>
        <input
          id="spot-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tartine Bakery"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base
                     placeholder:text-gray-400 focus:border-blue-500 focus:ring-1
                     focus:ring-blue-500 outline-none transition-colors"
          autoFocus
          disabled={submitting}
        />
      </div>

      {/* ---- Category ---- */}
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-2">
          Category
        </span>
        <CategoryPicker selected={category} onChange={setCategory} />
      </div>

      {/* ---- Rating ---- */}
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-1">
          Rating
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? 0 : star)}
              className="text-3xl transition-transform active:scale-110"
              aria-label={`${star} star${star === 1 ? '' : 's'}`}
              disabled={submitting}
            >
              <span className={star <= rating ? 'text-amber-400' : 'text-gray-300'}>
                &#9733;
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-0.5 text-xs text-gray-400">
            Tap the same star again to clear
          </p>
        )}
      </div>

      {/* ---- Visit Date ---- */}
      <div>
        <label htmlFor="visit-date" className="block text-sm font-semibold text-gray-700 mb-1">
          Visit Date
        </label>
        <input
          id="visit-date"
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                     outline-none transition-colors"
          disabled={submitting}
        />
      </div>

      {/* ---- Notes ---- */}
      <div>
        <label htmlFor="spot-notes" className="block text-sm font-semibold text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="spot-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What made this spot special?"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base
                     placeholder:text-gray-400 focus:border-blue-500 focus:ring-1
                     focus:ring-blue-500 outline-none transition-colors resize-none"
          disabled={submitting}
        />
      </div>

      {/* ---- Photos ---- */}
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-1">
          Photos
        </span>
        <PhotoCapture
          photos={pendingPhotos}
          onPhotosAdded={handlePhotosAdded}
          onPhotoRemoved={handlePhotoRemoved}
          maxPhotos={5}
          disabled={submitting}
        />
        {uploadProgress && (
          <p className="mt-2 text-xs text-blue-600 text-center animate-pulse">
            {uploadProgress}
          </p>
        )}
      </div>

      {/* ---- Coordinates (read-only) ---- */}
      <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
        Location: {initialCoords.lat.toFixed(6)}, {initialCoords.lng.toFixed(6)}
      </div>

      {/* ---- Validation error ---- */}
      {validationError && (
        <p className="text-sm text-red-600 -mt-2">{validationError}</p>
      )}

      {/* ---- Actions ---- */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium
                     text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors
                     disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white
                     hover:bg-blue-700 active:bg-blue-800 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : (submitLabel ?? 'Save Spot')}
        </button>
      </div>
    </form>
  );
}
