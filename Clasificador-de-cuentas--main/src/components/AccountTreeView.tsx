import React from 'react';
import { Check, ChevronDown, ChevronRight, Copy, Star } from 'lucide-react';
import { ACCOUNT_SECTIONS, ACCOUNT_SUBSECTIONS, getLevelLabel } from '../data/classifier';
import { AccountEntry, AccountSection, AccountSubsection, AccountTreeNode } from '../types/accounts';
import { HighlightText } from './HighlightText';

interface AccountTreeViewProps {
  roots: AccountTreeNode[];
  query: string;
  hasActiveFilter: boolean;
  expandedCodes: Set<string>;
  onToggleExpand: (code: string) => void;
  favoriteCodes: Set<string>;
  onToggleFavorite: (code: string) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  selectedAccount: AccountEntry | null;
  onSelectAccount: (account: AccountEntry) => void;
}

interface TreeRowProps {
  node: AccountTreeNode;
  depth: number;
  query: string;
  hasActiveFilter: boolean;
  expandedCodes: Set<string>;
  onToggleExpand: (code: string) => void;
  favoriteCodes: Set<string>;
  onToggleFavorite: (code: string) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  selectedAccount: AccountEntry | null;
  onSelectAccount: (account: AccountEntry) => void;
}

const TreeRow: React.FC<TreeRowProps> = ({
  node,
  depth,
  query,
  hasActiveFilter,
  expandedCodes,
  onToggleExpand,
  favoriteCodes,
  onToggleFavorite,
  copiedCode,
  onCopyCode,
  selectedAccount,
  onSelectAccount,
}) => {
  const hasChildren = node.children.length > 0;
  // Always keep accounts collapsed unless explicitly expanded by user request
  const isExpanded = expandedCodes.has(node.code);
  const isFavorite = favoriteCodes.has(node.code);
  const isCopied = copiedCode === node.code;
  const isSelected = selectedAccount?.code === node.code;
  const isParentOnlyContext = hasActiveFilter && !node.matchesFilter;

  const depthIndentClass =
    depth === 0
      ? 'pl-0'
      : depth === 1
        ? 'pl-2 sm:pl-4'
        : depth === 2
          ? 'pl-3.5 sm:pl-8'
          : 'pl-5 sm:pl-12';

  return (
    <>
      <div
        role="row"
        onClick={() => onSelectAccount(node)}
        className={`group flex items-center border-b border-slate-100 dark:border-[#5E1A2E] transition-colors cursor-pointer print:break-inside-avoid ${
          isSelected
            ? 'bg-blue-50 dark:bg-[#6D1A33]'
            : 'bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
        }`}
      >
        {/* Sticky Left Column: Hierarchy Chevron + Account Code */}
        <div
          className={`sticky left-0 z-10 w-[116px] sm:w-[196px] shrink-0 pl-1.5 pr-2 sm:px-4 py-2.5 flex items-center gap-1 sm:gap-1.5 border-r border-slate-200/80 dark:border-[#6B2137] lg:border-r-0 transition-colors print:static print:w-[136px] print:border-r-0 print:py-1.5 ${
            isSelected
              ? 'bg-blue-50 dark:bg-[#6D1A33]'
              : 'bg-white dark:bg-[#380A18] group-hover:bg-slate-50 dark:group-hover:bg-[#4E1022]'
          }`}
        >
          <div
            className={`flex items-center shrink-0 ${depthIndentClass} ${
              isParentOnlyContext ? 'opacity-65 print:opacity-100' : ''
            }`}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(node.code);
                }}
                aria-label={isExpanded ? `Contraer ${node.code}` : `Expandir ${node.code}`}
                aria-expanded={isExpanded}
                className="w-4 h-6 sm:w-5 sm:h-5 inline-flex items-center justify-center rounded text-slate-500 dark:text-rose-100/85 hover:bg-slate-200/70 dark:hover:bg-[#6D1A33] transition-colors cursor-pointer print:hidden"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4 h-6 sm:w-5 sm:h-5 inline-flex items-center justify-center text-slate-300 dark:text-rose-200/40 select-none print:hidden">
                ·
              </span>
            )}
          </div>

          <span
            className={`font-mono text-xs sm:text-[13px] leading-tight tabular-nums break-all sm:break-normal sm:truncate print:whitespace-normal print:overflow-visible ${
              isParentOnlyContext ? 'opacity-65 print:opacity-100' : ''
            } ${
              node.level === 1
                ? 'font-semibold text-slate-900 dark:text-white'
                : 'font-medium text-blue-700 dark:text-rose-200 print-code-sub'
            }`}
            title={node.code}
          >
            <HighlightText text={node.code} query={query} />
          </span>
        </div>

        {/* Scrollable Description */}
        <div
          className={`flex-1 min-w-[200px] print:min-w-0 px-3 sm:px-4 py-2.5 print:py-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${
            isParentOnlyContext ? 'opacity-65 print:opacity-100' : ''
          }`}
        >
          <span
            className={`text-sm print:text-xs leading-snug ${
              node.level === 1
                ? 'font-semibold text-slate-900 dark:text-white'
                : 'text-slate-700 dark:text-white'
            }`}
          >
            <HighlightText text={node.description} query={query} />
          </span>

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.code);
              }}
              aria-expanded={isExpanded}
              className="text-xs print:text-[11px] text-slate-500 dark:text-rose-100/80 hover:text-blue-700 dark:hover:text-white tabular-nums shrink-0 cursor-pointer transition-colors print-muted"
            >
              · {node.children.length} {node.children.length === 1 ? 'subcuenta' : 'subcuentas'}
            </button>
          )}
        </div>

        {/* Nivel (Always visible, including on mobile via horizontal scroll) */}
        <div
          className={`w-[106px] shrink-0 px-2.5 sm:px-3 py-2.5 print:py-1.5 text-right text-xs text-slate-500 dark:text-rose-100/80 whitespace-nowrap print-muted ${
            isParentOnlyContext ? 'opacity-65 print:opacity-100' : ''
          }`}
        >
          {getLevelLabel(node.level)}
        </div>

        {/* Naturaleza */}
        <div className={`w-[84px] shrink-0 px-2.5 sm:px-3 py-2.5 print:py-1.5 text-right whitespace-nowrap ${isParentOnlyContext ? 'opacity-65 print:opacity-100' : ''}`}>
          <span
            translate="no"
            className={`text-xs font-medium tabular-nums ${
              node.nature === 'Deudora'
                ? 'text-emerald-700 dark:text-emerald-300 print-nature-deudora'
                : node.nature === 'Mixta'
                  ? 'text-sky-700 dark:text-sky-200 print-nature-mixta'
                  : 'text-amber-700 dark:text-amber-200 print-nature-acreedora'
            }`}
          >
            {node.nature}
          </span>
        </div>

        {/* Acciones */}
        <div className="w-[74px] shrink-0 px-2 sm:px-4 py-2.5 flex items-center justify-end gap-1 print:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopyCode(node.code);
            }}
            title="Copiar código"
            aria-label={`Copiar código ${node.code}`}
            className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-colors cursor-pointer ${
              isCopied
                ? 'text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-500/20 font-medium'
                : 'text-slate-400 dark:text-rose-100/75 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#6D1A33]'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(node.code);
            }}
            title={isFavorite ? 'Quitar de favoritas' : 'Guardar en favoritas'}
            aria-label={
              isFavorite
                ? `Quitar ${node.code} de favoritas`
                : `Guardar ${node.code} en favoritas`
            }
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isFavorite
                ? 'text-amber-500 hover:text-amber-600 dark:text-amber-300'
                : 'text-slate-300 dark:text-rose-200/45 hover:text-amber-500 dark:hover:text-amber-300'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              query={query}
              hasActiveFilter={hasActiveFilter}
              expandedCodes={expandedCodes}
              onToggleExpand={onToggleExpand}
              favoriteCodes={favoriteCodes}
              onToggleFavorite={onToggleFavorite}
              copiedCode={copiedCode}
              onCopyCode={onCopyCode}
              selectedAccount={selectedAccount}
              onSelectAccount={onSelectAccount}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const AccountTreeView: React.FC<AccountTreeViewProps> = ({
  roots,
  query,
  hasActiveFilter,
  expandedCodes,
  onToggleExpand,
  favoriteCodes,
  onToggleFavorite,
  copiedCode,
  onCopyCode,
  selectedAccount,
  onSelectAccount,
}) => {
  const sectionById = React.useMemo(() => {
    const map = new Map<string, AccountSection>();
    for (const s of ACCOUNT_SECTIONS) {
      map.set(s.id, s);
    }
    return map;
  }, []);

  const subsectionById = React.useMemo(() => {
    const map = new Map<string, AccountSubsection>();
    for (const sub of ACCOUNT_SUBSECTIONS) {
      map.set(sub.id, sub);
    }
    return map;
  }, []);

  const groupedRoots = React.useMemo(() => {
    const groups: Array<{ section: AccountSection; nodes: AccountTreeNode[] }> = [];
    for (const root of roots) {
      const section = sectionById.get(root.sectionId);
      if (!section) continue;
      const last = groups[groups.length - 1];
      if (last && last.section.id === section.id) {
        last.nodes.push(root);
      } else {
        groups.push({ section, nodes: [root] });
      }
    }
    return groups;
  }, [roots, sectionById]);

  return (
    <div className="border border-slate-200 dark:border-[#6B2137] rounded-xl overflow-hidden bg-white dark:bg-[#380A18] print:border-slate-300 print:rounded-none print:overflow-visible">
      <div className="overflow-x-auto scrollbar-x-visible print:overflow-visible">
        <div
          role="table"
          aria-label="Árbol jerárquico del clasificador de cuentas"
          className="w-full min-w-[580px] sm:min-w-[692px] print:min-w-0 print:w-full"
        >
          {/* Column Header */}
          <div
            role="row"
            className="flex items-center bg-slate-50 dark:bg-[#460E1F] border-b border-slate-200 dark:border-[#6B2137] text-xs font-semibold text-slate-500 dark:text-rose-100/90 print-muted"
          >
            <div className="sticky left-0 z-10 w-[116px] sm:w-[196px] shrink-0 pl-1.5 pr-2 sm:px-4 py-2.5 flex items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-[#460E1F] border-r border-slate-200/80 dark:border-[#6B2137] lg:border-r-0 print:static print:w-[136px] print:border-r-0">
              <span className="w-4 sm:w-5 shrink-0 print:hidden" />
              <span>Código</span>
            </div>
            <div className="flex-1 min-w-[200px] print:min-w-0 px-3 sm:px-4 py-2.5">
              Descripción de la cuenta
            </div>
            <div className="w-[106px] shrink-0 px-2.5 sm:px-3 py-2.5 text-right">Nivel</div>
            <div className="w-[84px] shrink-0 px-2.5 sm:px-3 py-2.5 text-right">Naturaleza</div>
            <div className="w-[74px] shrink-0 px-2 sm:px-4 py-2.5 text-right print:hidden">Acciones</div>
          </div>

          {/* Rows grouped by major section title */}
          <div role="rowgroup">
            {groupedRoots.map(({ section, nodes }) => (
              <React.Fragment key={section.id}>
                <div
                  role="row"
                  className="print-section-row flex items-center bg-slate-100 dark:bg-[#521226] border-b border-slate-200 dark:border-[#7C2841] print:break-after-avoid"
                >
                  <div className="sticky left-0 z-10 w-[calc(100vw-28px)] sm:w-auto px-2.5 sm:px-4 py-2 bg-slate-100 dark:bg-[#521226] flex flex-wrap items-baseline gap-x-2 gap-y-0.5 print:static print:w-auto">
                    <span className="font-display text-xs sm:text-[13px] font-bold tracking-wide text-slate-900 dark:text-white">
                      {section.title}
                    </span>
                    <span className="font-mono text-[11px] font-medium tabular-nums text-blue-700 dark:text-rose-200 print-code-sub">
                      {section.rangeLabel}
                    </span>
                    {section.subtitle && (
                      <span className="text-[11px] text-slate-600 dark:text-rose-100/85 leading-snug print-muted">
                        ({section.subtitle})
                      </span>
                    )}
                  </div>
                </div>

                {nodes.map((root, nodeIdx) => {
                  const prevRoot = nodeIdx > 0 ? nodes[nodeIdx - 1] : null;
                  const subsection =
                    root.subsectionId && (!prevRoot || prevRoot.subsectionId !== root.subsectionId)
                      ? subsectionById.get(root.subsectionId)
                      : null;

                  return (
                    <React.Fragment key={root.id}>
                      {subsection && (
                        <div
                          role="row"
                          className="print-subsection-row flex items-center bg-slate-50 dark:bg-[#440D1E] border-b border-slate-200/90 dark:border-[#6B2137] print:break-after-avoid"
                        >
                          <div className="sticky left-0 z-10 w-[calc(100vw-28px)] sm:w-auto px-2.5 sm:px-4 py-1.5 bg-slate-50 dark:bg-[#440D1E] flex flex-wrap items-baseline gap-x-2 gap-y-0.5 print:static print:w-auto">
                            <span className="text-xs font-semibold text-slate-700 dark:text-white">
                              {subsection.title}
                            </span>
                            <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-rose-100/80 print-muted">
                              {subsection.rangeLabel}
                            </span>
                          </div>
                        </div>
                      )}
                      <TreeRow
                        node={root}
                        depth={0}
                        query={query}
                        hasActiveFilter={hasActiveFilter}
                        expandedCodes={expandedCodes}
                        onToggleExpand={onToggleExpand}
                        favoriteCodes={favoriteCodes}
                        onToggleFavorite={onToggleFavorite}
                        copiedCode={copiedCode}
                        onCopyCode={onCopyCode}
                        selectedAccount={selectedAccount}
                        onSelectAccount={onSelectAccount}
                      />
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
