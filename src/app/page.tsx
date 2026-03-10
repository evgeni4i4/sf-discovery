'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import MapView from '@/components/map/Map';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import BottomNav, { type NavTab } from '@/components/navigation/BottomNav';
import BottomSheet from '@/components/ui/BottomSheet';
import OfflineBanner from '@/components/ui/OfflineBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import EmptyState from '@/components/ui/EmptyState';

import { useSearch } from '@/hooks/useSearch';
import { useLocation } from '@/hooks/useLocation';
import { useDistricts } from '@/hooks/useDistricts';
import { useOffline } from '@/hooks/useOffline';

import { useState } from 'react';

export default function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}

function HomeContent() {
  const router = useRouter();

  // ------ Active tab state ------
  const [activeTab, setActiveTab] = useState<NavTab>('map');

  // ------ Hooks ------
  const { location: userLocation, startWatching } = useLocation();
  const {
    isOnline,
    isSyncing,
    pendingChanges,
  } = useOffline();

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading: searchLoading,
    error: searchError,
  } = useSearch({ userLocation });

  const {
    selectedDistrict,
  } = useDistricts({ spots: results });

  // Start watching user location on mount
  useEffect(() => {
    startWatching();
  }, [startWatching]);

  // ------ Map long-press -> create new spot ------
  const handleMapLongPress = useCallback(
    (coords: { lng: number; lat: number }) => {
      router.push(`/spots/new?lng=${coords.lng}&lat=${coords.lat}`);
    },
    [router],
  );

  // ------ Spot tap -> show popup (handled internally by MapView) ------
  const handleSpotTap = useCallback(() => {
    // The MapView component handles popup display internally.
    // This callback is used for additional side-effects if needed.
  }, []);

  // ------ Bottom sheet spot tap -> navigate to detail ------
  const handleBottomSheetSpotTap = useCallback(
    (spotId: string) => {
      router.push(`/spots/${spotId}`);
    },
    [router],
  );

  // ------ Tab navigation ------
  const handleTabChange = useCallback(
    (tab: NavTab) => {
      if (tab === 'route') {
        router.push('/route');
        return;
      }
      if (tab === 'districts') {
        router.push('/districts');
        return;
      }
      setActiveTab(tab);
    },
    [router],
  );

  // ------ Determine if map has loaded (first search completed) ------
  const isInitialLoad = searchLoading && results.length === 0 && query === '';

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-gray-100">
      {/* Offline / sync banner */}
      <div className="fixed top-0 inset-x-0 z-50">
        <OfflineBanner
          isOnline={isOnline}
          isSyncing={isSyncing}
          pendingChanges={pendingChanges}
        />
      </div>

      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapView
          spots={results}
          userLocation={userLocation}
          selectedDistrict={selectedDistrict}
          onMapLongPress={handleMapLongPress}
          onSpotTap={handleSpotTap}
        />
      </div>

      {/* Initial loading overlay */}
      {isInitialLoad && (
        <LoadingSpinner fullScreen message="Loading spots..." />
      )}

      {/* Search bar overlay (visible on Map tab) */}
      {activeTab === 'map' && (
        <div className="fixed top-0 inset-x-0 z-30 px-4 pt-3 pb-2 pointer-events-none">
          {/* Push down if offline banner is showing */}
          {(!isOnline || isSyncing || pendingChanges > 0) && (
            <div className="h-7" />
          )}
          <div className="pointer-events-auto max-w-lg mx-auto">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search spots..."
            />
          </div>
        </div>
      )}

      {/* Filter panel overlay (visible on Search tab) */}
      {activeTab === 'search' && (
        <div className="fixed top-0 inset-x-0 z-30 px-4 pt-3 space-y-2 pointer-events-none">
          {(!isOnline || isSyncing || pendingChanges > 0) && (
            <div className="h-7" />
          )}
          <div className="pointer-events-auto max-w-lg mx-auto space-y-2">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search spots..."
            />
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              hasLocation={userLocation !== null}
            />
          </div>
        </div>
      )}

      {/* Search error message */}
      {searchError && (
        <div className="fixed top-16 inset-x-0 z-30 flex justify-center px-4">
          {(!isOnline || isSyncing || pendingChanges > 0) && (
            <div className="h-7" />
          )}
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 shadow-sm max-w-lg w-full">
            {searchError}
          </div>
        </div>
      )}

      {/* Empty state overlay when no spots exist and not loading */}
      {!searchLoading && results.length === 0 && !searchError && query === '' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-gray-400"
                >
                  <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              }
              title="No spots yet"
              description="Long-press the map to add your first spot!"
            />
          </div>
        </div>
      )}

      {/* No search results overlay */}
      {!searchLoading && results.length === 0 && !searchError && query !== '' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <EmptyState
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-gray-400"
                >
                  <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5Z" />
                  <path d="m21 21-5.197-5.197" />
                </svg>
              }
              title="No results found"
              description={`No spots match "${query}". Try a different search or clear filters.`}
              actionLabel="Clear Search"
              onAction={() => {
                setQuery('');
                setFilters({});
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom sheet with spot list */}
      <BottomSheet
        spots={results}
        loading={searchLoading}
        onSpotTap={handleBottomSheetSpotTap}
      />

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
