'use client';

interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
}

/**
 * Top banner that appears when the app is offline or syncing.
 * Renders nothing when online and idle.
 */
export default function OfflineBanner({
  isOnline,
  isSyncing,
  pendingChanges,
}: OfflineBannerProps) {
  if (isOnline && !isSyncing && pendingChanges === 0) return null;

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06L3.28 2.22ZM2.178 7.871A8.959 8.959 0 0 1 6.015 5.68l1.2 1.2A7.461 7.461 0 0 0 3.59 9.284a.75.75 0 0 1-1.412-.513l.001-.001ZM7.95 8.9a5.975 5.975 0 0 1 2.888-.87l1.262 1.262a4.476 4.476 0 0 0-2.735.922.75.75 0 0 1-1.052-.105l-.001-.001a.75.75 0 0 1 .105-1.052l-.467-.156ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
        <span>You are offline</span>
        {pendingChanges > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5">
            {pendingChanges} pending
          </span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center justify-center gap-2 bg-blue-500 px-4 py-1.5 text-xs font-medium text-white">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <span>Syncing changes...</span>
      </div>
    );
  }

  // Online but has pending changes (edge case: sync failed partially)
  if (pendingChanges > 0) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white">
        <span>{pendingChanges} change{pendingChanges > 1 ? 's' : ''} pending sync</span>
      </div>
    );
  }

  return null;
}
