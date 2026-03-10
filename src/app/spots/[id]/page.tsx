'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Spot, CreateSpotInput, UpdateSpotInput } from '@/types';
import { DataStore } from '@/lib/datastore';
import SpotForm from '@/components/spots/SpotForm';
import type { SpotFormInitialValues } from '@/components/spots/SpotForm';
import { getCategoryConfig } from '@/lib/categories';

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------

function DeleteConfirmDialog({
  spotName,
  onConfirm,
  onCancel,
  deleting,
}: {
  spotName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">Delete Spot</h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{spotName}</span>?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium
                       text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors
                       disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white
                       hover:bg-red-700 active:bg-red-800 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spot Detail View (read-only)
// ---------------------------------------------------------------------------

function SpotDetail({
  spot,
  onEdit,
  onDelete,
}: {
  spot: Spot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = getCategoryConfig(spot.category);

  return (
    <div className="flex flex-col gap-5">
      {/* Name & Category */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl leading-none">{cat.icon}</span>
          <h2 className="text-xl font-bold text-gray-900">{spot.name}</h2>
        </div>
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      {/* Rating */}
      {spot.rating && spot.rating > 0 && (
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1">Rating</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${star <= spot.rating! ? 'text-amber-400' : 'text-gray-300'}`}
              >
                &#9733;
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Visit Date */}
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-1">Visit Date</span>
        <p className="text-sm text-gray-600">{spot.visitDate}</p>
      </div>

      {/* Notes */}
      {spot.notes && (
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1">Notes</span>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{spot.notes}</p>
        </div>
      )}

      {/* Location */}
      <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
        Location: {spot.location.lat.toFixed(6)}, {spot.location.lng.toFixed(6)}
        {spot.district && <> &middot; {spot.district}</>}
      </div>

      {/* Timestamps */}
      <div className="text-xs text-gray-400">
        <p>Created: {new Date(spot.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(spot.updatedAt).toLocaleString()}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 rounded-lg border border-red-300 py-2.5 text-sm font-medium
                     text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white
                     hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function SpotDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch spot on mount
  const fetchSpot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DataStore.getSpot(params.id);
      if (!data) {
        setError('Spot not found');
      } else {
        setSpot(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load spot';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchSpot();
  }, [fetchSpot]);

  // ------ Edit handlers ------

  const handleEditSubmit = async (input: CreateSpotInput) => {
    if (!spot) return;
    setSubmitting(true);
    setError(null);
    try {
      const updateInput: UpdateSpotInput = {
        name: input.name,
        category: input.category,
        rating: input.rating,
        notes: input.notes,
        visitDate: input.visitDate,
        photoUrls: input.photoUrls,
      };
      await DataStore.updateSpot(spot.id, updateInput);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update spot';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditing(false);
    setError(null);
  };

  // ------ Delete handlers ------

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!spot) return;
    setDeleting(true);
    setError(null);
    try {
      await DataStore.deleteSpot(spot.id);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete spot';
      setError(message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // ------ Loading state ------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-400">Loading spot...</p>
        </div>
      </div>
    );
  }

  // ------ Not found state ------
  if (!spot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Spot Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">
          {error ?? 'The spot you are looking for does not exist or has been deleted.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white
                     hover:bg-blue-700 transition-colors"
        >
          Back to Map
        </button>
      </div>
    );
  }

  // ------ Build initial values for edit mode ------
  const formInitialValues: SpotFormInitialValues = {
    name: spot.name,
    category: spot.category,
    rating: spot.rating,
    notes: spot.notes,
    visitDate: spot.visitDate,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (editing) {
              handleEditCancel();
            } else {
              router.push('/');
            }
          }}
          className="flex items-center justify-center rounded-lg p-1.5 -ml-1.5
                     text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {editing ? 'Edit Spot' : spot.name}
        </h1>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {editing ? (
          <SpotForm
            initialCoords={spot.location}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            submitting={submitting}
            initialValues={formInitialValues}
            submitLabel="Update Spot"
          />
        ) : (
          <SpotDetail
            spot={spot}
            onEdit={() => setEditing(true)}
            onDelete={handleDeleteClick}
          />
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          spotName={spot.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          deleting={deleting}
        />
      )}
    </div>
  );
}
