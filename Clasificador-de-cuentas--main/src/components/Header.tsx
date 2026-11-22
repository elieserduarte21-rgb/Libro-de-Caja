import React from 'react';
import { Moon, SlidersHorizontal, Sun } from 'lucide-react';
import { NavTab } from '../types/accounts';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  favoritesCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenMobileFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  theme,
  onToggleTheme,
  onOpenMobileFilters,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-[#6B2137] bg-white/95 dark:bg-[#2A0610]/95 backdrop-blur-sm print:hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-md border border-slate-200 dark:border-[#7C2841] text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022] transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 dark:focus-visible:outline-rose-300"
            aria-label="Abrir opciones y filtros"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('explorer');
            }}
            className="font-display text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap truncate"
          >
            Clasificador de Cuentas
          </a>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Navegación principal" className="flex items-center gap-3 sm:gap-6 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('explorer')}
            className={`relative py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600 dark:focus-visible:outline-rose-300 ${
              activeTab === 'explorer'
                ? 'text-blue-700 dark:text-white'
                : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explorador
            {activeTab === 'explorer' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-700 dark:bg-white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('favorites')}
            className={`relative py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600 dark:focus-visible:outline-rose-300 ${
              activeTab === 'favorites'
                ? 'text-blue-700 dark:text-white'
                : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Favoritas
            <span className="ml-1 font-mono text-[11px] sm:text-xs tabular-nums text-slate-500 dark:text-rose-100/80">
              ({favoritesCount})
            </span>
            {activeTab === 'favorites' && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-700 dark:bg-white" />
            )}
          </button>
        </nav>

        {/* Zone 3: Single primary action (Theme Switch) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#7C2841] bg-slate-50 dark:bg-[#380A18] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600 dark:focus-visible:outline-rose-300 cursor-pointer"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Modo oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
