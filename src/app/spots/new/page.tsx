'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import SpotForm from '@/components/spots/SpotForm';
import type { CreateSpotInput } from '@/types';
import { useSpots } from '@/hooks/useSpots';

/**
 * Inner component that reads search params.
 * Wrapped in <Suspense> because useSearchParams() requires it in Next.js 15.
 */
function NewSpotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { createSpot } = useSpots();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lngParam = searchParams.get('lng');
  const latParam = searchParams.get('lat');

  const lng = lngParam ? parseFloat(lngParam) : null;
  const lat = latParam ? parseFloat(latParam) : null;

  // Guard: coordinates are required
  if (lng === null || lat === null || isNaN(lng) || isNaN(lat)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Missing Location</h1>
        <p className="text-sm text-gray-500 mb-6">
          Long-press on the map to drop a pin, then you will be taken here to save the spot.
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

  const handleSubmit = async (input: CreateSpotInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await createSpot(input);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">New Spot</h1>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-lg px-4 py-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <SpotForm
          initialCoords={{ lng, lat }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      </main>
    </div>
  );
}

export default function NewSpotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      }
    >
      <NewSpotContent />
    </Suspense>
  );
}
