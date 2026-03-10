'use client';

interface EmptyStateProps {
  /** The icon rendered above the title. Pass an SVG or emoji string. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional CTA button. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Friendly empty state placeholder for lists with no data.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-sm text-gray-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
