'use client';

export type NavTab = 'map' | 'search' | 'route' | 'districts';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string }[] = [
  { id: 'map', label: 'Map' },
  { id: 'search', label: 'Search' },
  { id: 'route', label: 'Route' },
  { id: 'districts', label: 'Districts' },
];

/**
 * Fixed bottom navigation bar with 4 tabs: Map, Search, Route, Districts.
 * "Map" and "Search" toggle overlays on the home page.
 * "Route" and "Districts" navigate to their respective pages.
 */
export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-1 flex-col items-center gap-0.5 px-2 pb-safe pt-2 pb-2 text-[10px] font-medium transition-colors
                ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <TabIcon tab={tab.id} active={isActive} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ tab, active }: { tab: NavTab; active: boolean }) {
  const cls = `h-6 w-6 ${active ? 'text-blue-600' : 'text-gray-400'}`;

  switch (tab) {
    case 'map':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 0 1 1.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0 1 21.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 0 1-1.676 0l-4.994-2.497a.375.375 0 0 0-.336 0l-3.869 1.935A1.875 1.875 0 0 1 2.25 19.18V6.695c0-.71.401-1.36 1.037-1.677l4.875-2.437ZM9 6a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 9 6Zm6.75 3.75a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0V9.75Z" clipRule="evenodd" />
        </svg>
      );
    case 'search':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
        </svg>
      );
    case 'route':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 8.357l-.075.006c-.28.048-.298.287-.298.453v2.128a.75.75 0 0 1-1.5 0v-2.128c0-.794.597-1.591 1.454-1.726l.056-.009a3 3 0 0 0 .805-5.565 8.25 8.25 0 0 0-3.43-.07A.75.75 0 0 1 12 6a.75.75 0 0 1-.262-.072 8.21 8.21 0 0 0-5.476.144ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
        </svg>
      );
    case 'districts':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
        </svg>
      );
  }
}
