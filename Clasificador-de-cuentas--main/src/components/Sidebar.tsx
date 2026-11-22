import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  ListFilter,
  Star,
  Table2,
  X,
} from 'lucide-react';
import {
  ACCOUNT_GROUPS,
  ACCOUNT_SECTIONS,
  COVERAGE_PAGES_LABEL,
  COVERAGE_RANGE_LABEL,
  LOADED_PARTS,
  TOTAL_EXPECTED_PARTS,
} from '../data/classifier';
import {
  AccountEntry,
  FilterStyle,
  LevelFilter,
  SectionFilter,
  ViewMode,
} from '../types/accounts';

interface SidebarProps {
  allAccounts: AccountEntry[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterStyle: FilterStyle;
  onFilterStyleChange: (style: FilterStyle) => void;
  sectionFilter: SectionFilter;
  onSelectSection: (sectionId: SectionFilter) => void;
  sectionCounts: Record<string, number>;
  groupFilter: string;
  onSelectGroup: (groupId: string) => void;
  levelFilter: LevelFilter;
  onSelectLevel: (level: LevelFilter) => void;
  favoriteAccounts: AccountEntry[];
  onQuickJumpFavorite: (code: string) => void;
  onToggleFavorite: (code: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const LEVEL_OPTIONS: Array<{ value: LevelFilter; label: string; hint: string }> = [
  { value: 'all', label: 'Todos los niveles', hint: 'Completo' },
  { value: 1, label: 'Cuenta principal', hint: '3 dígitos' },
  { value: 2, label: 'Subcuenta', hint: '2do nivel' },
  { value: 3, label: 'Subcontrol', hint: '3er nivel' },
  { value: 4, label: 'Análisis / Esp.', hint: '4to nivel' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  allAccounts,
  viewMode,
  onViewModeChange,
  filterStyle,
  onFilterStyleChange,
  sectionFilter,
  onSelectSection,
  sectionCounts,
  groupFilter,
  onSelectGroup,
  levelFilter,
  onSelectLevel,
  favoriteAccounts,
  onQuickJumpFavorite,
  onToggleFavorite,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [openLists, setOpenLists] = React.useState<{
    sections: boolean;
    groups: boolean;
    levels: boolean;
  }>({
    sections: false,
    groups: false,
    levels: false,
  });

  const toggleList = React.useCallback((key: 'sections' | 'groups' | 'levels') => {
    setOpenLists((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const groupCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const acc of allAccounts) {
      map.set(acc.groupId, (map.get(acc.groupId) ?? 0) + 1);
    }
    return map;
  }, [allAccounts]);

  const levelCounts = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const acc of allAccounts) {
      map.set(acc.level, (map.get(acc.level) ?? 0) + 1);
    }
    return map;
  }, [allAccounts]);

  const isCollapsible = filterStyle === 'collapsible';
  const showSectionsList = !isCollapsible || openLists.sections;
  const showGroupsList = !isCollapsible || openLists.groups;
  const showLevelsList = !isCollapsible || openLists.levels;

  const activeSectionLabel =
    sectionFilter === 'all'
      ? null
      : ACCOUNT_SECTIONS.find((s) => s.id === sectionFilter)?.shortLabel ?? null;
  const activeGroupLabel =
    groupFilter === 'all'
      ? null
      : ACCOUNT_GROUPS.find((g) => g.id === groupFilter)?.rangeLabel ?? null;
  const activeLevelLabel =
    levelFilter === 'all'
      ? null
      : LEVEL_OPTIONS.find((l) => l.value === levelFilter)?.label ?? null;

  const content = (
    <div className="flex flex-col gap-6 text-sm">
      {/* Modo de visualización */}
      <section aria-labelledby="sidebar-viewmode-title" className="space-y-4">
        <div>
          <h2
            id="sidebar-viewmode-title"
            className="text-xs font-semibold text-slate-500 dark:text-rose-100/80 tracking-tight mb-2"
          >
            Modo de visualización
          </h2>
          <div
            role="group"
            aria-label="Modo de visualización"
            className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#460E1F] border border-slate-200 dark:border-[#6B2137] rounded-lg"
          >
            <button
              type="button"
              onClick={() => {
                onViewModeChange('tree');
                onCloseMobile();
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-[#6D1A33] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Árbol</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onViewModeChange('table');
                onCloseMobile();
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#6D1A33] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>
        </div>

        {/* Vista de filtros */}
        <div>
          <h2
            id="sidebar-filterstyle-title"
            className="text-xs font-semibold text-slate-500 dark:text-rose-100/80 tracking-tight mb-2"
          >
            Estilo de filtros
          </h2>
          <div
            role="group"
            aria-labelledby="sidebar-filterstyle-title"
            className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#460E1F] border border-slate-200 dark:border-[#6B2137] rounded-lg"
          >
            <button
              type="button"
              onClick={() => onFilterStyleChange('buttons')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStyle === 'buttons'
                  ? 'bg-white dark:bg-[#6D1A33] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 shrink-0" />
              <span>Botones</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStyleChange('collapsible')}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterStyle === 'collapsible'
                  ? 'bg-white dark:bg-[#6D1A33] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-rose-100/75 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              <span>Listas plegables</span>
            </button>
          </div>
        </div>
      </section>

      <div className="h-px bg-slate-200 dark:bg-[#6B2137]" />

      {/* Clasificación Principal */}
      <section aria-labelledby="sidebar-sections-title">
        <div className="flex items-center justify-between mb-2">
          {isCollapsible ? (
            <button
              type="button"
              onClick={() => toggleList('sections')}
              aria-expanded={showSectionsList}
              className="flex-1 flex items-center justify-between gap-2 text-left py-1 rounded-md hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <div className="min-w-0">
                <h2
                  id="sidebar-sections-title"
                  className="text-xs font-semibold text-slate-600 dark:text-white tracking-tight"
                >
                  Clasificación principal
                </h2>
                {!showSectionsList && activeSectionLabel && (
                  <div className="text-[11px] text-blue-700 dark:text-rose-200 font-medium truncate">
                    {activeSectionLabel}
                  </div>
                )}
              </div>
              {showSectionsList ? (
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0" />
              )}
            </button>
          ) : (
            <h2
              id="sidebar-sections-title"
              className="text-xs font-semibold text-slate-500 dark:text-rose-100/80 tracking-tight"
            >
              Clasificación principal
            </h2>
          )}
          {!isCollapsible && sectionFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectSection('all')}
              className="text-xs text-blue-700 dark:text-rose-200 hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          )}
        </div>
        {showSectionsList && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                onSelectSection('all');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                sectionFilter === 'all'
                  ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-medium'
                  : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
              }`}
            >
              <span className="truncate">Todas las clasificaciones</span>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-rose-100/80 ml-2">
                {allAccounts.length}
              </span>
            </button>

            {ACCOUNT_SECTIONS.map((sec) => {
              const count = sectionCounts[sec.id] ?? 0;
              const active = sectionFilter === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    onSelectSection(active ? 'all' : sec.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-start justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-medium'
                      : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-rose-100/80">
                      {sec.rangeLabel}
                    </div>
                    <div className="text-[13px] font-semibold leading-snug">{sec.title}</div>
                    {sec.subtitle && (
                      <div className="text-[11px] text-slate-500 dark:text-rose-100/80 leading-tight mt-0.5">
                        {sec.subtitle}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-rose-100/80 shrink-0 pt-0.5">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-px bg-slate-200 dark:bg-[#6B2137]" />

      {/* Grupos Contables */}
      <section aria-labelledby="sidebar-groups-title">
        <div className="flex items-center justify-between mb-2">
          {isCollapsible ? (
            <button
              type="button"
              onClick={() => toggleList('groups')}
              aria-expanded={showGroupsList}
              className="flex-1 flex items-center justify-between gap-2 text-left py-1 rounded-md hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <div className="min-w-0">
                <h2
                  id="sidebar-groups-title"
                  className="text-xs font-semibold text-slate-600 dark:text-white tracking-tight"
                >
                  Grupos de cuentas
                </h2>
                {!showGroupsList && activeGroupLabel && (
                  <div className="text-[11px] font-mono text-blue-700 dark:text-rose-200 font-medium truncate">
                    {activeGroupLabel}
                  </div>
                )}
              </div>
              {showGroupsList ? (
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0" />
              )}
            </button>
          ) : (
            <h2
              id="sidebar-groups-title"
              className="text-xs font-semibold text-slate-500 dark:text-rose-100/80 tracking-tight"
            >
              Grupos de cuentas
            </h2>
          )}
          {!isCollapsible && groupFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectGroup('all')}
              className="text-xs text-blue-700 dark:text-rose-200 hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          )}
        </div>
        {showGroupsList && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                onSelectGroup('all');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                groupFilter === 'all'
                  ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-medium'
                  : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
              }`}
            >
              <span className="truncate">Todos los grupos</span>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-rose-100/80 ml-2">
                {allAccounts.length}
              </span>
            </button>

            {ACCOUNT_GROUPS.map((group) => {
              const count = groupCounts.get(group.id) ?? 0;
              const active = groupFilter === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    onSelectGroup(group.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-medium'
                      : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-rose-100/80">
                      {group.rangeLabel}
                    </div>
                    <div className="truncate text-[13px]">{group.label}</div>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-rose-100/80 shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-px bg-slate-200 dark:bg-[#6B2137]" />

      {/* Nivel Jerárquico */}
      <section aria-labelledby="sidebar-levels-title">
        <div className="flex items-center justify-between mb-2">
          {isCollapsible ? (
            <button
              type="button"
              onClick={() => toggleList('levels')}
              aria-expanded={showLevelsList}
              className="flex-1 flex items-center justify-between gap-2 text-left py-1 rounded-md hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <div className="min-w-0">
                <h2
                  id="sidebar-levels-title"
                  className="text-xs font-semibold text-slate-600 dark:text-white tracking-tight"
                >
                  Nivel jerárquico
                </h2>
                {!showLevelsList && activeLevelLabel && (
                  <div className="text-[11px] text-blue-700 dark:text-rose-200 font-medium truncate">
                    {activeLevelLabel}
                  </div>
                )}
              </div>
              {showLevelsList ? (
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-rose-200/80 shrink-0" />
              )}
            </button>
          ) : (
            <h2
              id="sidebar-levels-title"
              className="text-xs font-semibold text-slate-500 dark:text-rose-100/80 tracking-tight"
            >
              Nivel jerárquico
            </h2>
          )}
        </div>
        {showLevelsList && (
          <div className="flex flex-col gap-0.5">
            {LEVEL_OPTIONS.map((opt) => {
              const active = levelFilter === opt.value;
              const count =
                opt.value === 'all' ? allAccounts.length : levelCounts.get(opt.value) ?? 0;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onSelectLevel(opt.value);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50 dark:bg-[#6D1A33] text-blue-800 dark:text-white font-medium'
                      : 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#4E1022]'
                  }`}
                >
                  <span className="truncate text-[13px]">{opt.label}</span>
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-rose-100/80 ml-2">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-px bg-slate-200 dark:bg-[#6B2137]" />

      {/* Favoritas Rápidas */}
      <section aria-labelledby="sidebar-favorites-title">
        <div className="flex items-center justify-between mb-2.5">
          <h2
            id="sidebar-favorites-title"
            className="text-xs font-semibold text-slate-500 dark:text-rose-100/80 tracking-tight"
          >
            Acceso rápido · Favoritas
          </h2>
          <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-rose-100/80">
            {favoriteAccounts.length}
          </span>
        </div>

        {favoriteAccounts.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-rose-100/80 leading-relaxed px-1">
            Marca cualquier cuenta con la estrella para tenerla siempre a mano en este navegador.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
            {favoriteAccounts.map((fav) => (
              <li
                key={fav.code}
                className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#4E1022] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => {
                    onQuickJumpFavorite(fav.code);
                    onCloseMobile();
                  }}
                  className="min-w-0 flex-1 text-left cursor-pointer"
                >
                  <div className="font-mono text-xs font-medium tabular-nums text-blue-700 dark:text-rose-200 truncate">
                    {fav.code}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-white truncate">
                    {fav.description}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(fav.code)}
                  className="p-1 text-amber-500 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200 shrink-0 cursor-pointer"
                  aria-label={`Quitar ${fav.code} de favoritas`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="h-px bg-slate-200 dark:bg-[#6B2137]" />

      {/* Cobertura del Documento */}
      <section className="px-1 text-xs text-slate-500 dark:text-rose-100/80 space-y-1">
        <div className="font-medium text-slate-700 dark:text-white">
          MFP Cuba · Clasificador de cuentas
        </div>
        <div className="tabular-nums">
          Partes 1–{LOADED_PARTS.length} de {TOTAL_EXPECTED_PARTS} cargadas · Págs. {COVERAGE_PAGES_LABEL}
        </div>
        <div className="font-mono text-[11px] tabular-nums">
          Rango activo: {COVERAGE_RANGE_LABEL}
        </div>
      </section>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[272px] shrink-0 border-r border-slate-200 dark:border-[#6B2137] bg-slate-50/70 dark:bg-[#320815] p-5 print:hidden">
        <div className="sticky top-20">{content}</div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#320815] border-r border-slate-200 dark:border-[#6B2137] p-5 overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                Opciones y filtros
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-md text-slate-500 dark:text-rose-100/80 hover:bg-slate-100 dark:hover:bg-[#4E1022]"
                aria-label="Cerrar panel de opciones y filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
