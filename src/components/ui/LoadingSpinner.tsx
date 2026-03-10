'use client';

interface LoadingSpinnerProps {
  /** Overlay the spinner on a full-screen container. Useful for map loading. */
  fullScreen?: boolean;
  /** Text displayed below the spinner. */
  message?: string;
  /** Size variant. */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

/**
 * Minimal loading spinner. Can be used inline or as a full-screen overlay.
 */
export default function LoadingSpinner({
  fullScreen = false,
  message,
  size = 'md',
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${sizeMap[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-gray-500">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
