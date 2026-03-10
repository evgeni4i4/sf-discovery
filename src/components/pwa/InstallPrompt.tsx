'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * The `beforeinstallprompt` event is a non-standard Chrome/Edge API.
 * We type the parts we need here since it is not in lib.dom.d.ts.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'sf-discovery-install-dismissed';

/**
 * A mobile-first banner that appears when the browser fires
 * `beforeinstallprompt`, offering the user a one-tap PWA install.
 *
 * - Dismissal is persisted in localStorage so it only shows once.
 * - Does not render when the app is already running in standalone mode.
 * - Gracefully does nothing on browsers that do not support the event.
 */
export default function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  // ---------------------------------------------------------------
  // Listen for beforeinstallprompt
  // ---------------------------------------------------------------
  useEffect(() => {
    // Already installed (standalone mode) — nothing to do
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // User previously dismissed — respect that
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return;

    const handler = (e: Event) => {
      // Prevent the mini-infobar (Chrome mobile)
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // ---------------------------------------------------------------
  // Install
  // ---------------------------------------------------------------
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;

    const { outcome } = await deferredPrompt.current.prompt();

    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    // Either way, the prompt can only be used once
    deferredPrompt.current = null;
  }, []);

  // ---------------------------------------------------------------
  // Dismiss
  // ---------------------------------------------------------------
  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    deferredPrompt.current = null;
    localStorage.setItem(DISMISSED_KEY, 'true');
  }, []);

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  if (!showBanner) return null;

  return (
    <div
      role="alert"
      className="
        fixed bottom-4 left-4 right-4 z-50
        flex items-center gap-3
        rounded-2xl bg-white/95 backdrop-blur
        px-4 py-3 shadow-lg border border-gray-200
        animate-[slideUp_0.3s_ease-out]
        sm:left-auto sm:right-4 sm:max-w-sm
      "
    >
      {/* App icon */}
      <div className="shrink-0 h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Install SF Discovery</p>
        <p className="text-xs text-gray-500 truncate">
          Add to home screen for the best experience
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors px-2 py-1"
          aria-label="Dismiss install prompt"
        >
          Later
        </button>
        <button
          type="button"
          onClick={handleInstall}
          className="
            rounded-lg bg-blue-600 px-3 py-1.5
            text-xs font-semibold text-white
            hover:bg-blue-700 active:bg-blue-800
            transition-colors
          "
        >
          Install
        </button>
      </div>
    </div>
  );
}
