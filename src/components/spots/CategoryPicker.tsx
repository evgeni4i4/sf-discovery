'use client';

import { CATEGORIES, type CategoryConfig } from '@/lib/categories';
import type { SpotCategory } from '@/types';

interface CategoryPickerProps {
  selected: SpotCategory | null;
  onChange: (category: SpotCategory) => void;
}

export default function CategoryPicker({ selected, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {CATEGORIES.map((cat: CategoryConfig) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`
              flex flex-col items-center justify-center gap-1
              rounded-xl p-2 text-center transition-all
              ${isSelected
                ? 'ring-2 ring-offset-1 bg-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100'
              }
            `}
            style={isSelected ? { '--tw-ring-color': cat.color } as React.CSSProperties : undefined}
            aria-pressed={isSelected}
            aria-label={cat.label}
          >
            <span className="text-2xl leading-none">{cat.icon}</span>
            <span
              className={`text-[11px] leading-tight font-medium ${
                isSelected ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
