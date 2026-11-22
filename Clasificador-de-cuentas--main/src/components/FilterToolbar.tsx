import React from 'react';
import {
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { ACCOUNT_GROUPS, ACCOUNT_SECTIONS, ACCOUNT_SUBSECTIONS } from '../data/classifier';
import {
  FilterStyle,
  LevelFilter,
  NatureFilter,
  SectionFilter,
  SubsectionFilter,
  ViewMode,
} from '../types/accounts';

interface FilterToolbarProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (val: string) => void;
  natureFilter: NatureFilter;
  onNatureChange: (nature: NatureFilter) => void;
  viewMode: ViewMode;
  filterStyle: FilterStyle;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalMatching: number;
  totalLoaded: number;
  deudoraCount: number;
  acreedoraCount: number;
  mixtaCount: number;
  sectionFilter: SectionFilter;
  onSectionChange: (section: SectionFilter) => void;
  sectionCounts: Record<string, number>;
  subsectionFilter: SubsectionFilter;
  onSubsectionChange: (subsection: SubsectionFilter) => void;
  subsectionCounts: Record<string, number>;
  groupFilter: string;
  onGroupChange: (groupId: string) => void;
  groupCounts: Record<string, number>;
  levelFilter: LevelFilter;
  onLevelChange: (level: LevelFilter) => void;
  levelCounts: Record<number, number>;
}

type DropdownKey = 'section' | 'subsection' | 'nature' | 'group' | 'level' | null;

const LEVEL_ITEMS: Array<{ value: LevelFilter; label: string; hint?: string }> = [
  { value: 'all', label: 'Todos los niveles' },
  { value: 1, label: 'Cuenta principal', hint: '3 dígitos' },
  { value: 2, label: 'Subcuenta', hint: '2do nivel' },
  { value: 3, label: 'Subcontrol', hint: '3er nivel' },
  { value: 4, label: 'Análisis / Esp.', hint: '4to nivel' },
];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchInputRef,
  query,
  onQueryChange,
  natureFilter,
  onNatureChange,
  viewMode,
  filterStyle,
  onExpandAll,
  onCollapseAll,
  hasActiveFilters,
  onResetFilters,
  totalMatching,
  totalLoaded,
  deudoraCount,
  acreedoraCount,
  mixtaCount,
  sectionFilter,
  onSectionChange,
  sectionCounts,
  subsectionFilter,
  onSubsectionChange,
  subsectionCounts,
  groupFilter,
  onGroupChange,
  groupCounts,
  levelFilter,
  onLevelChange,
  levelCounts,
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<DropdownKey>(null);
  const dropdownGroupRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!openDropdown) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        dropdownGroupRef.current &&
        !dropdownGroupRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  React.useEffect(() => {
    setOpenDropdown(null);
  }, [filterStyle]);

  const activeSectionObj =
    sectionFilter === 'all'
      ? null
      : ACCOUNT_SECTIONS.find((s) => s.id === sectionFilter) ?? null;
  const activeSubsections = React.useMemo(
    () =>
      sectionFilter === 'all'
        ? []
        : ACCOUNT_SUBSECTIONS.filter((sub) => sub.sectionId === sectionFilter),
    [sectionFilter]
  );
  const activeSubsectionObj =
    subsectionFilter === 'all'
      ? null
      : activeSubsections.find((sub) => sub.id === subsectionFilter) ?? null;
  const activeGroupObj =
    groupFilter === 'all'
      ? null
      : ACCOUNT_GROUPS.find((g) => g.id === groupFilter) ?? null;
  const activeLevelObj = LEVEL_ITEMS.find((l) => l.value === levelFilter) ?? LEVEL_ITEMS[0];

  const natureOptions = [
    { value: 'Todas' as const, label: 'Todas', count: totalLoaded },
    { value: 'Deudora' as const, label: 'Deudora', count: deudoraCount },
    { value: 'Acreedora' as const, label: 'Acreedora', count: acreedoraCount },
    { value: 'Mixta' as const, label: 'Mixta', count: mixtaCount },
  ];

  const toggleDropdown = (key: Exclude<DropdownKey, null>) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-4 print:hidden">
      {/* Main Search Input + Primary Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 dark:text-rose-200/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por código (ej. 135*0010, 241) o descripción (ej. efectivo, almacén, impuestos)..."
            aria-label="Buscar cuentas por código o descripción"
            className="w-full h-11 pl-10 pr-20 text-sm rounded-lg border border-slate-300 dark:border-[#7C2841] bg-white dark:bg-[#380A18] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-rose-200/60 focus:outline-none focus:border-blue-600 dark:focus:border-rose-300 focus:ring-2 focus:ring-blue-600/15 dark:focus:ring-rose-300/20 transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="p-1 rounded text-slate-400 dark:text-rose-100/80 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-slate-400 dark:text-rose-100/80 border border-slate-200 dark:border-[#7C2841] rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Nature Segmented Filter (shown directly in buttons mode) */}
        {filterStyle === 'buttons' && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div
              role="group"
              aria-label="Filtrar por naturaleza"
              className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#460E1F] border border-slate-200 dark:border-[#6B2137] rounded-lg max-w-full overflow-x-auto scrollbar-x-visible"
            >
              {natureOptions.map((opt) => {
                const active = natureFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onNatureChange(opt.value)}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-[#6D1A33] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="ml-1 sm:ml-1.5 font-mono text-[11px] tabular-nums opacity-75">
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filters Area: Buttons Mode vs Collapsible Lists Mode */}
      {filterStyle === 'buttons' ? (
        <div className="space-y-1.5">
          <div
            role="group"
            aria-label="Filtrar por clasificación principal"
            className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-x-visible"
          >
            <button
              type="button"
              onClick={() => onSectionChange('all')}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sectionFilter === 'all'
                  ? 'border-blue-600 dark:border-rose-300 bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                  : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
              }`}
            >
              <span>Todas las clases</span>
              <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-75">
                {totalLoaded}
              </span>
            </button>

            {ACCOUNT_SECTIONS.map((sec) => {
              const active = sectionFilter === sec.id;
              const count = sectionCounts[sec.id] ?? 0;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSectionChange(active ? 'all' : sec.id)}
                  title={
                    sec.subtitle
                      ? `${sec.title} (${sec.subtitle})`
                      : `${sec.title} · ${sec.rangeLabel}`
                  }
                  className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-blue-600 dark:border-rose-300 bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                      : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                  }`}
                >
                  <span>{sec.shortLabel}</span>
                  <span className="ml-1.5 font-mono text-[11px] tabular-nums opacity-75">
                    {sec.rangeLabel} · {count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeSectionObj?.subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-rose-100/80">
              <strong className="font-semibold text-slate-700 dark:text-white">
                {activeSectionObj.title}:
              </strong>{' '}
              {activeSectionObj.subtitle}
            </p>
          )}

          {activeSubsections.length > 0 && (
            <div
              role="group"
              aria-label={`Subtítulos de ${activeSectionObj?.title ?? ''}`}
              className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 scrollbar-x-visible"
            >
              <button
                type="button"
                onClick={() => onSubsectionChange('all')}
                className={`px-2 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  subsectionFilter === 'all'
                    ? 'border-slate-700 dark:border-rose-300 bg-slate-800 dark:bg-[#6D1A33] text-white font-semibold'
                    : 'border-slate-200 dark:border-[#6B2137] bg-slate-50 dark:bg-[#380A18] text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
                }`}
              >
                Todos los subgrupos
              </button>

              {activeSubsections.map((sub) => {
                const active = subsectionFilter === sub.id;
                const count = subsectionCounts[sub.id] ?? 0;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSubsectionChange(active ? 'all' : sub.id)}
                    className={`px-2 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'border-slate-700 dark:border-rose-300 bg-slate-800 dark:bg-[#6D1A33] text-white font-semibold'
                        : 'border-slate-200 dark:border-[#6B2137] bg-slate-50 dark:bg-[#380A18] text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
                    }`}
                  >
                    <span>{sub.title}</span>
                    <span className="ml-1.5 font-mono text-[10px] tabular-nums opacity-75">
                      {sub.rangeLabel} · {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div ref={dropdownGroupRef} className="space-y-2">
          <div
            className={`grid grid-cols-2 gap-2 ${
              activeSubsections.length > 0 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
            }`}
          >
            {/* Collapsible List 1: Clasificación principal */}
            <div className="relative col-span-2 sm:col-span-1">
              <button
                type="button"
                onClick={() => toggleDropdown('section')}
                aria-expanded={openDropdown === 'section'}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  sectionFilter !== 'all'
                    ? 'border-blue-600 dark:border-rose-300 bg-blue-50/70 dark:bg-[#6D1A33]'
                    : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-rose-200/80">
                    Clasificación
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                    {activeSectionObj
                      ? `${activeSectionObj.shortLabel} (${activeSectionObj.rangeLabel})`
                      : 'Todas las clases'}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0 transition-transform ${
                    openDropdown === 'section' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'section' && (
                <div
                  role="listbox"
                  aria-label="Lista de clasificaciones principales"
                  className="mt-1.5 absolute left-0 right-0 sm:min-w-[270px] z-30 rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#380A18] shadow-lg max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#5E1A2E]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSectionChange('all');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                      sectionFilter === 'all'
                        ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                        : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                    }`}
                  >
                    <span>Todas las clases</span>
                    <span className="font-mono text-[11px] tabular-nums opacity-75">
                      {totalLoaded}
                    </span>
                  </button>
                  {ACCOUNT_SECTIONS.map((sec) => {
                    const active = sectionFilter === sec.id;
                    const count = sectionCounts[sec.id] ?? 0;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          onSectionChange(sec.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                          active
                            ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate">{sec.shortLabel}</div>
                          <div className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-rose-100/75">
                            {sec.rangeLabel}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[11px] tabular-nums opacity-75">
                            {count}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-rose-200" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collapsible List 2 (conditional): Subgrupo */}
            {activeSubsections.length > 0 && (
              <div className="relative col-span-2 sm:col-span-1">
                <button
                  type="button"
                  onClick={() => toggleDropdown('subsection')}
                  aria-expanded={openDropdown === 'subsection'}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    subsectionFilter !== 'all'
                      ? 'border-blue-600 dark:border-rose-300 bg-blue-50/70 dark:bg-[#6D1A33]'
                      : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-rose-200/80">
                      Subgrupo
                    </div>
                    <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                      {activeSubsectionObj
                        ? `${activeSubsectionObj.title} (${activeSubsectionObj.rangeLabel})`
                        : 'Todos los subgrupos'}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0 transition-transform ${
                      openDropdown === 'subsection' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'subsection' && (
                  <div
                    role="listbox"
                    aria-label="Lista de subgrupos"
                    className="mt-1.5 absolute left-0 right-0 sm:min-w-[270px] z-30 rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#380A18] shadow-lg max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#5E1A2E]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSubsectionChange('all');
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                        subsectionFilter === 'all'
                          ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                          : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                      }`}
                    >
                      <span>Todos los subgrupos</span>
                    </button>
                    {activeSubsections.map((sub) => {
                      const active = subsectionFilter === sub.id;
                      const count = subsectionCounts[sub.id] ?? 0;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            onSubsectionChange(sub.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                            active
                              ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                              : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate">{sub.title}</div>
                            <div className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-rose-100/75">
                              {sub.rangeLabel}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono text-[11px] tabular-nums opacity-75">
                              {count}
                            </span>
                            {active && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-rose-200" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible List 3: Grupo de cuentas */}
            <div
              className={`relative col-span-2 ${
                activeSubsections.length > 0 ? 'sm:col-span-2 xl:col-span-1' : 'sm:col-span-1'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleDropdown('group')}
                aria-expanded={openDropdown === 'group'}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  groupFilter !== 'all'
                    ? 'border-blue-600 dark:border-rose-300 bg-blue-50/70 dark:bg-[#6D1A33]'
                    : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-rose-200/80">
                    Grupo contable
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                    {activeGroupObj
                      ? `${activeGroupObj.rangeLabel} · ${activeGroupObj.label}`
                      : 'Todos los grupos'}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0 transition-transform ${
                    openDropdown === 'group' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'group' && (
                <div
                  role="listbox"
                  aria-label="Lista de grupos de cuentas"
                  className="mt-1.5 absolute left-0 right-0 sm:min-w-[270px] z-30 rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#380A18] shadow-lg max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#5E1A2E]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onGroupChange('all');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                      groupFilter === 'all'
                        ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                        : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                    }`}
                  >
                    <span>Todos los grupos</span>
                    <span className="font-mono text-[11px] tabular-nums opacity-75">
                      {totalLoaded}
                    </span>
                  </button>
                  {ACCOUNT_GROUPS.map((grp) => {
                    const active = groupFilter === grp.id;
                    const count = groupCounts[grp.id] ?? 0;
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          onGroupChange(grp.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                          active
                            ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate">{grp.label}</div>
                          <div className="font-mono text-[10px] tabular-nums text-slate-400 dark:text-rose-100/75">
                            {grp.rangeLabel}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[11px] tabular-nums opacity-75">
                            {count}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-rose-200" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collapsible List 4: Naturaleza (al lado de Nivel jerárquico) */}
            <div className="relative col-span-1">
              <button
                type="button"
                onClick={() => toggleDropdown('nature')}
                aria-expanded={openDropdown === 'nature'}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  natureFilter !== 'Todas'
                    ? 'border-blue-600 dark:border-rose-300 bg-blue-50/70 dark:bg-[#6D1A33]'
                    : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-rose-200/80">
                    Naturaleza
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                    {natureFilter === 'Todas' ? 'Todas' : natureFilter}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0 transition-transform ${
                    openDropdown === 'nature' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'nature' && (
                <div
                  role="listbox"
                  aria-label="Lista de naturalezas"
                  className="mt-1.5 absolute left-0 min-w-[210px] sm:min-w-0 sm:right-0 z-30 rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#380A18] shadow-lg max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#5E1A2E]"
                >
                  {natureOptions.map((opt) => {
                    const active = natureFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onNatureChange(opt.value);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                          active
                            ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                        }`}
                      >
                        <span>{opt.value === 'Todas' ? 'Todas las naturalezas' : opt.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[11px] tabular-nums opacity-75">
                            {opt.count}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-rose-200" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collapsible List 5: Nivel jerárquico */}
            <div className="relative col-span-1">
              <button
                type="button"
                onClick={() => toggleDropdown('level')}
                aria-expanded={openDropdown === 'level'}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  levelFilter !== 'all'
                    ? 'border-blue-600 dark:border-rose-300 bg-blue-50/70 dark:bg-[#6D1A33]'
                    : 'border-slate-200 dark:border-[#6B2137] bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-rose-200/80">
                    Nivel jerárquico
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-white truncate">
                    {activeLevelObj.value === 'all' ? 'Todos' : activeLevelObj.label}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0 transition-transform ${
                    openDropdown === 'level' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'level' && (
                <div
                  role="listbox"
                  aria-label="Lista de niveles jerárquicos"
                  className="mt-1.5 absolute right-0 min-w-[215px] sm:left-0 sm:min-w-0 z-30 rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#380A18] shadow-lg max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#5E1A2E]"
                >
                  {LEVEL_ITEMS.map((opt) => {
                    const active = levelFilter === opt.value;
                    const count =
                      opt.value === 'all' ? totalLoaded : levelCounts[opt.value] ?? 0;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => {
                          onLevelChange(opt.value);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer ${
                          active
                            ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate">{opt.label}</div>
                          {opt.hint && (
                            <div className="text-[10px] text-slate-400 dark:text-rose-100/75">
                              {opt.hint}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[11px] tabular-nums opacity-75">
                            {count}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-rose-200" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {activeSectionObj?.subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-rose-100/80">
              <strong className="font-semibold text-slate-700 dark:text-white">
                {activeSectionObj.title}:
              </strong>{' '}
              {activeSectionObj.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Results Summary & Tree Controls (Clean unboxed metadata) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-rose-100/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums">
            <strong className="font-semibold text-slate-800 dark:text-white">
              {totalMatching}
            </strong>{' '}
            {totalMatching === 1 ? 'cuenta encontrada' : 'cuentas encontradas'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">de {totalLoaded} registradas</span>

          {hasActiveFilters && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-blue-700 dark:text-rose-200 hover:underline font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer filtros</span>
              </button>
            </>
          )}
        </div>

        {viewMode === 'tree' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExpandAll}
              className="inline-flex items-center gap-1 text-slate-600 dark:text-rose-100/85 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>Expandir todo</span>
            </button>
            <span aria-hidden="true" className="text-slate-300 dark:text-[#7C2841]">
              /
            </span>
            <button
              type="button"
              onClick={onCollapseAll}
              className="inline-flex items-center gap-1 text-slate-600 dark:text-rose-100/85 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronsDownUp className="w-3.5 h-3.5" />
              <span>Contraer todo</span>
            </button>
          </div>
        )}
      </div>

      <p className="md:hidden text-[11px] text-slate-400 dark:text-rose-100/75">
        Desliza horizontalmente para ver descripción completa, nivel y naturaleza; la cuenta queda fija a la izquierda.
      </p>
    </div>
  );
};
