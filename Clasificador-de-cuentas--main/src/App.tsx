import React from 'react';
import { Printer, RotateCcw, Star } from 'lucide-react';
import { AccountDetailStrip } from './components/AccountDetailStrip';
import { AccountTableView } from './components/AccountTableView';
import { AccountTreeView } from './components/AccountTreeView';
import { FilterToolbar } from './components/FilterToolbar';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import {
  ACCOUNT_GROUPS,
  ACCOUNT_SECTIONS,
  ACCOUNT_SUBSECTIONS,
  ALL_ACCOUNTS,
  buildFilteredTree,
  getLevelLabel,
  matchesEntry,
} from './data/classifier';
import {
  AccountEntry,
  FilterStyle,
  LevelFilter,
  NatureFilter,
  NavTab,
  SectionFilter,
  SortDirection,
  SortField,
  SubsectionFilter,
  ViewMode,
} from './types/accounts';

const FAVORITES_STORAGE_KEY = 'clasificador_favorites_v1';
const THEME_STORAGE_KEY = 'clasificador_theme';
const VIEW_STORAGE_KEY = 'clasificador_view_mode';
const FILTER_STYLE_STORAGE_KEY = 'clasificador_filter_style';

interface ClasificadorCloudState {
  favorites?: string[];
  theme?: 'light' | 'dark';
  viewMode?: ViewMode;
  filterStyle?: FilterStyle;
}

declare global {
  interface Window {
    Nube?: {
      init: (opts: {
        modulo: string;
        datos: () => unknown;
        alRecibir?: (datos: ClasificadorCloudState) => void;
        alEstado?: (estado: string) => void;
      }) => void;
      guardar: () => void;
    };
  }
}

function readStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

function getInitialViewMode(): ViewMode {
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    return saved === 'table' ? 'table' : 'tree';
  } catch {
    return 'tree';
  }
}

function getInitialFilterStyle(): FilterStyle {
  try {
    const saved = localStorage.getItem(FILTER_STYLE_STORAGE_KEY);
    return saved === 'collapsible' ? 'collapsible' : 'buttons';
  } catch {
    return 'buttons';
  }
}

export default function App() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(getInitialTheme);
  const [activeTab, setActiveTab] = React.useState<NavTab>('explorer');
  const [viewMode, setViewMode] = React.useState<ViewMode>(getInitialViewMode);
  const [filterStyle, setFilterStyle] = React.useState<FilterStyle>(getInitialFilterStyle);
  const [query, setQuery] = React.useState('');
  const [natureFilter, setNatureFilter] = React.useState<NatureFilter>('Todas');
  const [levelFilter, setLevelFilter] = React.useState<LevelFilter>('all');
  const [sectionFilter, setSectionFilter] = React.useState<SectionFilter>('all');
  const [subsectionFilter, setSubsectionFilter] = React.useState<SubsectionFilter>('all');
  const [groupFilter, setGroupFilter] = React.useState<string>('all');
  const [sortField, setSortField] = React.useState<SortField>('code');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const [favoriteList, setFavoriteList] = React.useState<string[]>(readStoredFavorites);
  const [expandedCodes, setExpandedCodes] = React.useState<Set<string>>(() => new Set());
  const [selectedAccount, setSelectedAccount] = React.useState<AccountEntry | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const copyTimerRef = React.useRef<number | null>(null);
  const cloudStateRef = React.useRef<ClasificadorCloudState>({
    favorites: favoriteList,
    theme,
    viewMode,
    filterStyle,
  });

  React.useEffect(() => {
    cloudStateRef.current = {
      favorites: favoriteList,
      theme,
      viewMode,
      filterStyle,
    };
  }, [favoriteList, theme, viewMode, filterStyle]);

  React.useEffect(() => {
    if (!window.Nube) return;
    window.Nube.init({
      modulo: 'clasificador_cuentas',
      datos: () => cloudStateRef.current,
      alRecibir: (datos) => {
        if (!datos || typeof datos !== 'object') return;
        if (Array.isArray(datos.favorites)) {
          const validFavs = datos.favorites.filter((x): x is string => typeof x === 'string');
          setFavoriteList(validFavs);
          try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validFavs));
          } catch {
            // ignore
          }
        }
        if (datos.theme === 'light' || datos.theme === 'dark') {
          setTheme(datos.theme);
          document.documentElement.classList.toggle('dark', datos.theme === 'dark');
          try {
            localStorage.setItem(THEME_STORAGE_KEY, datos.theme);
          } catch {
            // ignore
          }
        }
        if (datos.viewMode === 'tree' || datos.viewMode === 'table') {
          setViewMode(datos.viewMode);
          try {
            localStorage.setItem(VIEW_STORAGE_KEY, datos.viewMode);
          } catch {
            // ignore
          }
        }
        if (datos.filterStyle === 'buttons' || datos.filterStyle === 'collapsible') {
          setFilterStyle(datos.filterStyle);
          try {
            localStorage.setItem(FILTER_STYLE_STORAGE_KEY, datos.filterStyle);
          } catch {
            // ignore
          }
        }
      },
    });
  }, []);

  const favoriteCodes = React.useMemo(() => new Set(favoriteList), [favoriteList]);

  // Sync theme to documentElement & localStorage
  const handleToggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      cloudStateRef.current = { ...cloudStateRef.current, theme: next };
      window.Nube?.guardar();
      return next;
    });
  }, []);

  const handleViewModeChange = React.useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    cloudStateRef.current = { ...cloudStateRef.current, viewMode: mode };
    window.Nube?.guardar();
  }, []);

  const handleFilterStyleChange = React.useCallback((style: FilterStyle) => {
    setFilterStyle(style);
    try {
      localStorage.setItem(FILTER_STYLE_STORAGE_KEY, style);
    } catch {
      // ignore
    }
    cloudStateRef.current = { ...cloudStateRef.current, filterStyle: style };
    window.Nube?.guardar();
  }, []);

  const handlePrint = React.useCallback(() => {
    window.print();
  }, []);

  const handleToggleFavorite = React.useCallback((code: string) => {
    setFavoriteList((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((c) => c !== code) : [...prev, code];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      cloudStateRef.current = { ...cloudStateRef.current, favorites: next };
      window.Nube?.guardar();
      return next;
    });
  }, []);

  const handleClearAllFavorites = React.useCallback(() => {
    setFavoriteList([]);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
    cloudStateRef.current = { ...cloudStateRef.current, favorites: [] };
    window.Nube?.guardar();
  }, []);

  const handleCopy = React.useCallback((text: string, key?: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    const targetKey = key ?? text;
    setCopiedKey(targetKey);
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  }, []);

  // Keyboard shortcuts: '/' focuses search, 'Escape' closes detail or clears search
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (isInput && query) {
          setQuery('');
        } else if (selectedAccount) {
          setSelectedAccount(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [query, selectedAccount]);

  const favoriteAccounts = React.useMemo(() => {
    return ALL_ACCOUNTS.filter((acc) => favoriteCodes.has(acc.code));
  }, [favoriteCodes]);

  const totals = React.useMemo(() => {
    let deudora = 0;
    let acreedora = 0;
    let mixta = 0;
    const sectionCounts: Record<string, number> = {};
    const subsectionCounts: Record<string, number> = {};
    const groupCounts: Record<string, number> = {};
    const levelCounts: Record<number, number> = {};
    for (const acc of ALL_ACCOUNTS) {
      if (acc.nature === 'Deudora') deudora++;
      else if (acc.nature === 'Acreedora') acreedora++;
      else mixta++;
      sectionCounts[acc.sectionId] = (sectionCounts[acc.sectionId] ?? 0) + 1;
      if (acc.subsectionId) {
        subsectionCounts[acc.subsectionId] = (subsectionCounts[acc.subsectionId] ?? 0) + 1;
      }
      groupCounts[acc.groupId] = (groupCounts[acc.groupId] ?? 0) + 1;
      levelCounts[acc.level] = (levelCounts[acc.level] ?? 0) + 1;
    }
    return {
      total: ALL_ACCOUNTS.length,
      deudora,
      acreedora,
      mixta,
      sectionCounts,
      subsectionCounts,
      groupCounts,
      levelCounts,
    };
  }, []);

  const criteria = React.useMemo(
    () => ({
      query,
      nature: natureFilter,
      level: levelFilter,
      sectionId: sectionFilter,
      subsectionId: subsectionFilter,
      groupId: groupFilter,
      favoritesOnly: activeTab === 'favorites',
      favoriteCodes,
    }),
    [
      query,
      natureFilter,
      levelFilter,
      sectionFilter,
      subsectionFilter,
      groupFilter,
      activeTab,
      favoriteCodes,
    ]
  );

  const treeResult = React.useMemo(
    () => buildFilteredTree(ALL_ACCOUNTS, criteria),
    [criteria]
  );

  const flatFilteredAccounts = React.useMemo(() => {
    const filtered = ALL_ACCOUNTS.filter((acc) => matchesEntry(acc, criteria));
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'code') {
        cmp = a.code.localeCompare(b.code, 'es', { numeric: true });
      } else if (sortField === 'description') {
        cmp = a.description.localeCompare(b.description, 'es');
      } else if (sortField === 'nature') {
        cmp = a.nature.localeCompare(b.nature, 'es');
      } else if (sortField === 'level') {
        cmp = a.level - b.level;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [criteria, sortField, sortDirection]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    natureFilter !== 'Todas' ||
    levelFilter !== 'all' ||
    sectionFilter !== 'all' ||
    subsectionFilter !== 'all' ||
    groupFilter !== 'all';

  const handleSelectSection = React.useCallback(
    (nextSection: SectionFilter) => {
      setSectionFilter(nextSection);
      setSubsectionFilter('all');
      setExpandedCodes(new Set());
      if (nextSection !== 'all' && groupFilter !== 'all') {
        const grp = ACCOUNT_GROUPS.find((g) => g.id === groupFilter);
        if (grp && grp.sectionId !== nextSection) {
          setGroupFilter('all');
        }
      }
    },
    [groupFilter]
  );

  const handleSelectSubsection = React.useCallback(
    (nextSubsection: SubsectionFilter) => {
      setSubsectionFilter(nextSubsection);
      setExpandedCodes(new Set());
      if (nextSubsection !== 'all') {
        const sub = ACCOUNT_SUBSECTIONS.find((s) => s.id === nextSubsection);
        if (sub) {
          setSectionFilter(sub.sectionId);
          if (groupFilter !== 'all') {
            const grp = ACCOUNT_GROUPS.find((g) => g.id === groupFilter);
            if (grp && grp.sectionId !== sub.sectionId) {
              setGroupFilter('all');
            }
          }
        }
      }
    },
    [groupFilter]
  );

  const handleSelectGroup = React.useCallback(
    (nextGroup: string) => {
      setGroupFilter(nextGroup);
      setSubsectionFilter('all');
      setExpandedCodes(new Set());
      if (nextGroup !== 'all' && sectionFilter !== 'all') {
        const grp = ACCOUNT_GROUPS.find((g) => g.id === nextGroup);
        if (grp && grp.sectionId !== sectionFilter) {
          setSectionFilter('all');
        }
      }
    },
    [sectionFilter]
  );

  const handleResetFilters = React.useCallback(() => {
    setQuery('');
    setNatureFilter('Todas');
    setLevelFilter('all');
    setSectionFilter('all');
    setSubsectionFilter('all');
    setGroupFilter('all');
    setExpandedCodes(new Set());
  }, []);

  const handleToggleExpand = React.useCallback((code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const handleExpandAll = React.useCallback(() => {
    const allExpandable = new Set<string>();
    const visit = (nodes: typeof treeResult.roots) => {
      for (const n of nodes) {
        if (n.children.length > 0) {
          allExpandable.add(n.code);
          visit(n.children);
        }
      }
    };
    visit(treeResult.roots);
    setExpandedCodes(allExpandable);
  }, [treeResult.roots]);

  const handleCollapseAll = React.useCallback(() => {
    setExpandedCodes(new Set());
  }, []);

  const handleSortChange = React.useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  const handleQuickJumpFavorite = React.useCallback((code: string) => {
    setActiveTab('explorer');
    setSectionFilter('all');
    setSubsectionFilter('all');
    setGroupFilter('all');
    setLevelFilter('all');
    setNatureFilter('Todas');
    setQuery(code);
    const found = ALL_ACCOUNTS.find((a) => a.code === code) ?? null;
    setSelectedAccount(found);
  }, []);

  const printFilterParts = React.useMemo(() => {
    const parts: string[] = [];
    if (sectionFilter !== 'all') {
      const sec = ACCOUNT_SECTIONS.find((s) => s.id === sectionFilter);
      if (sec) parts.push(`Clasificación: ${sec.title} (${sec.rangeLabel})`);
    }
    if (subsectionFilter !== 'all') {
      const sub = ACCOUNT_SUBSECTIONS.find((s) => s.id === subsectionFilter);
      if (sub) parts.push(`Subgrupo: ${sub.title} (${sub.rangeLabel})`);
    }
    if (groupFilter !== 'all') {
      const grp = ACCOUNT_GROUPS.find((g) => g.id === groupFilter);
      if (grp) parts.push(`Grupo: ${grp.rangeLabel} ${grp.label}`);
    }
    if (natureFilter !== 'Todas') {
      parts.push(`Naturaleza: ${natureFilter}`);
    }
    if (levelFilter !== 'all') {
      parts.push(`Nivel: ${getLevelLabel(levelFilter)}`);
    }
    if (query.trim()) {
      parts.push(`Búsqueda: "${query.trim()}"`);
    }
    return parts;
  }, [sectionFilter, subsectionFilter, groupFilter, natureFilter, levelFilter, query]);

  const currentMatchCount =
    viewMode === 'tree' ? treeResult.directMatchCount : flatFilteredAccounts.length;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white dark:bg-[#2A0610] text-slate-900 dark:text-white">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        favoritesCount={favoriteAccounts.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenMobileFilters={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex-1 max-w-[1440px] w-full mx-auto flex">
        <Sidebar
          allAccounts={ALL_ACCOUNTS}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          filterStyle={filterStyle}
          onFilterStyleChange={handleFilterStyleChange}
          sectionFilter={sectionFilter}
          onSelectSection={handleSelectSection}
          sectionCounts={totals.sectionCounts}
          groupFilter={groupFilter}
          onSelectGroup={handleSelectGroup}
          levelFilter={levelFilter}
          onSelectLevel={setLevelFilter}
          favoriteAccounts={favoriteAccounts}
          onQuickJumpFavorite={handleQuickJumpFavorite}
          onToggleFavorite={handleToggleFavorite}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 print:p-0 print:space-y-3">
          {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-[#6B2137] pb-4 sm:pb-5 print:border-slate-300 print:pb-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-rose-100/80 print-muted">
                <span>Ministerio de Finanzas y Precios de Cuba</span>
              </div>
              <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white print:text-lg">
                {activeTab === 'favorites'
                  ? 'Cuentas favoritas y frecuentes'
                  : 'Catálogo oficial de cuentas contables'}
              </h1>
              {/* Print-only summary of current view & active filters */}
              <div className="hidden print:block text-[11px] text-slate-600 pt-1 space-y-0.5 print-muted">
                <div className="tabular-nums">
                  Vista: {viewMode === 'tree' ? 'Árbol jerárquico' : 'Tabla'} ·{' '}
                  {currentMatchCount}{' '}
                  {currentMatchCount === 1 ? 'cuenta' : 'cuentas'} · Impreso el{' '}
                  {new Date().toLocaleDateString('es-ES')}
                </div>
                {printFilterParts.length > 0 && (
                  <div>Filtros aplicados: {printFilterParts.join(' · ')}</div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
              {activeTab === 'favorites' && favoriteAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFavorites}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-rose-100/80 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Limpiar todas las favoritas
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                disabled={flatFilteredAccounts.length === 0}
                title="Imprimir la vista actual del catálogo"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#380A18] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <FilterToolbar
            searchInputRef={searchInputRef}
            query={query}
            onQueryChange={setQuery}
            natureFilter={natureFilter}
            onNatureChange={setNatureFilter}
            viewMode={viewMode}
            filterStyle={filterStyle}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            totalMatching={currentMatchCount}
            totalLoaded={
              activeTab === 'favorites' ? favoriteAccounts.length : totals.total
            }
            deudoraCount={totals.deudora}
            acreedoraCount={totals.acreedora}
            mixtaCount={totals.mixta}
            sectionFilter={sectionFilter}
            onSectionChange={handleSelectSection}
            sectionCounts={totals.sectionCounts}
            subsectionFilter={subsectionFilter}
            onSubsectionChange={handleSelectSubsection}
            subsectionCounts={totals.subsectionCounts}
            groupFilter={groupFilter}
            onGroupChange={handleSelectGroup}
            groupCounts={totals.groupCounts}
            levelFilter={levelFilter}
            onLevelChange={setLevelFilter}
            levelCounts={totals.levelCounts}
          />

          {/* Selected Account Detail Strip */}
          {selectedAccount && (
            <AccountDetailStrip
              account={selectedAccount}
              allAccounts={ALL_ACCOUNTS}
              isFavorite={favoriteCodes.has(selectedAccount.code)}
              onToggleFavorite={handleToggleFavorite}
              onCopyText={handleCopy}
              copiedKey={copiedKey}
              onSelectAccount={setSelectedAccount}
              onClose={() => setSelectedAccount(null)}
            />
          )}

          {/* Main Content Viewport: Empty States vs Tree / Table */}
          {activeTab === 'favorites' && favoriteAccounts.length === 0 ? (
            <div className="border border-slate-200 dark:border-[#6B2137] rounded-xl bg-slate-50/50 dark:bg-[#380A18] p-10 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 dark:bg-[#521226] text-amber-600 dark:text-amber-300 mx-auto">
                <Star className="w-5 h-5" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Aún no tienes cuentas favoritas guardadas
              </h2>
              <p className="text-sm text-slate-500 dark:text-rose-100/80 max-w-md mx-auto">
                Haz clic en la estrella junto a cualquier cuenta o subcuenta en el explorador para guardarla en este navegador y consultarla rápidamente.
              </p>
              <div className="pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('explorer')}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-[#6D1A33] dark:hover:bg-[#82203E] dark:border dark:border-rose-300/40 text-white transition-colors cursor-pointer"
                >
                  Ir al explorador de cuentas
                </button>
              </div>
            </div>
          ) : flatFilteredAccounts.length === 0 ? (
            <div className="border border-slate-200 dark:border-[#6B2137] rounded-xl bg-slate-50/50 dark:bg-[#380A18] p-10 text-center space-y-3">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                No se encontraron cuentas con los criterios actuales
              </h2>
              <p className="text-sm text-slate-500 dark:text-rose-100/80 max-w-md mx-auto">
                Prueba buscando por otro fragmento de código (por ejemplo <span className="font-mono">109</span> o <span className="font-mono">241*100</span>), otra palabra clave o limpia los filtros activos.
              </p>
              {hasActiveFilters && (
                <div className="pt-2 print:hidden">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-[#6D1A33] dark:hover:bg-[#82203E] dark:border dark:border-rose-300/40 text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer filtros</span>
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'tree' ? (
            <AccountTreeView
              roots={treeResult.roots}
              query={query}
              hasActiveFilter={treeResult.hasActiveFilter}
              expandedCodes={expandedCodes}
              onToggleExpand={handleToggleExpand}
              favoriteCodes={favoriteCodes}
              onToggleFavorite={handleToggleFavorite}
              copiedCode={copiedKey}
              onCopyCode={(code) => handleCopy(code, code)}
              selectedAccount={selectedAccount}
              onSelectAccount={setSelectedAccount}
            />
          ) : (
            <AccountTableView
              accounts={flatFilteredAccounts}
              query={query}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              favoriteCodes={favoriteCodes}
              onToggleFavorite={handleToggleFavorite}
              copiedCode={copiedKey}
              onCopyCode={(code) => handleCopy(code, code)}
              selectedAccount={selectedAccount}
              onSelectAccount={setSelectedAccount}
              showSectionHeaders={sortField === 'code' && sortDirection === 'asc'}
            />
          )}
        </main>
      </div>
    </div>
  );
}
