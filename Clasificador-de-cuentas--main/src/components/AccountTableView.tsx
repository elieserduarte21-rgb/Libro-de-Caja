import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Copy, Star } from 'lucide-react';
import { ACCOUNT_SECTIONS, ACCOUNT_SUBSECTIONS, getLevelLabel } from '../data/classifier';
import { AccountEntry, AccountSection, AccountSubsection, SortDirection, SortField } from '../types/accounts';
import { HighlightText } from './HighlightText';

interface AccountTableViewProps {
  accounts: AccountEntry[];
  query: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  favoriteCodes: Set<string>;
  onToggleFavorite: (code: string) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  selectedAccount: AccountEntry | null;
  onSelectAccount: (account: AccountEntry) => void;
  showSectionHeaders?: boolean;
}

export const AccountTableView: React.FC<AccountTableViewProps> = ({
  accounts,
  query,
  sortField,
  sortDirection,
  onSortChange,
  favoriteCodes,
  onToggleFavorite,
  copiedCode,
  onCopyCode,
  selectedAccount,
  onSelectAccount,
  showSectionHeaders = true,
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
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 dark:text-rose-200" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 dark:text-rose-200" />
    );
  };

  return (
    <div className="border border-slate-200 dark:border-[#6B2137] rounded-xl overflow-hidden bg-white dark:bg-[#380A18] print:border-slate-300 print:rounded-none print:overflow-visible">
      <div className="overflow-x-auto scrollbar-x-visible print:overflow-visible">
        <table className="w-full min-w-[560px] sm:min-w-[680px] print:min-w-0 print:w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#460E1F] border-b border-slate-200 dark:border-[#6B2137] text-xs font-semibold text-slate-500 dark:text-rose-100/90 print-muted">
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-[#460E1F] py-2.5 pl-2.5 pr-2 sm:px-4 whitespace-nowrap border-r border-slate-200/80 dark:border-[#6B2137] lg:border-r-0 w-[96px] sm:w-[152px] print:static print:w-[120px] print:border-r-0">
                <button
                  type="button"
                  onClick={() => onSortChange('code')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span>Código</span>
                  <span className="print:hidden">{renderSortIcon('code')}</span>
                </button>
              </th>
              <th className="py-2.5 px-3 sm:px-4 min-w-[200px] print:min-w-0">
                <button
                  type="button"
                  onClick={() => onSortChange('description')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span>Descripción</span>
                  <span className="print:hidden">{renderSortIcon('description')}</span>
                </button>
              </th>
              <th className="py-2.5 px-2.5 sm:px-4 text-right whitespace-nowrap w-[106px]">
                <button
                  type="button"
                  onClick={() => onSortChange('level')}
                  className="inline-flex items-center justify-end gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span>Nivel</span>
                  <span className="print:hidden">{renderSortIcon('level')}</span>
                </button>
              </th>
              <th className="py-2.5 px-2.5 sm:px-4 text-right whitespace-nowrap w-[84px]">
                <button
                  type="button"
                  onClick={() => onSortChange('nature')}
                  className="inline-flex items-center justify-end gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span>Naturaleza</span>
                  <span className="print:hidden">{renderSortIcon('nature')}</span>
                </button>
              </th>
              <th className="py-2.5 px-2 sm:px-4 text-right whitespace-nowrap w-[74px] print:hidden">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#5E1A2E] text-sm">
            {accounts.map((acc, index) => {
              const isFavorite = favoriteCodes.has(acc.code);
              const isCopied = copiedCode === acc.code;
              const isSelected = selectedAccount?.code === acc.code;
              const prevAcc = index > 0 ? accounts[index - 1] : null;
              const section =
                showSectionHeaders && (!prevAcc || prevAcc.sectionId !== acc.sectionId)
                  ? sectionById.get(acc.sectionId)
                  : null;
              const subsection =
                showSectionHeaders &&
                acc.subsectionId &&
                (!prevAcc || prevAcc.subsectionId !== acc.subsectionId)
                  ? subsectionById.get(acc.subsectionId)
                  : null;

              return (
                <React.Fragment key={acc.id}>
                  {section && (
                    <tr className="print-section-row bg-slate-100 dark:bg-[#521226] border-y border-slate-200 dark:border-[#7C2841] print:break-after-avoid">
                      <td colSpan={5} className="p-0">
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
                      </td>
                    </tr>
                  )}
                  {subsection && (
                    <tr className="print-subsection-row bg-slate-50 dark:bg-[#440D1E] border-b border-slate-200/90 dark:border-[#6B2137] print:break-after-avoid">
                      <td colSpan={5} className="p-0">
                        <div className="sticky left-0 z-10 w-[calc(100vw-28px)] sm:w-auto px-2.5 sm:px-4 py-1.5 bg-slate-50 dark:bg-[#440D1E] flex flex-wrap items-baseline gap-x-2 gap-y-0.5 print:static print:w-auto">
                          <span className="text-xs font-semibold text-slate-700 dark:text-white">
                            {subsection.title}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-rose-100/80 print-muted">
                            {subsection.rangeLabel}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr
                    onClick={() => onSelectAccount(acc)}
                    className={`group transition-colors cursor-pointer print:break-inside-avoid ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-[#6D1A33]'
                        : 'bg-white dark:bg-[#380A18] hover:bg-slate-50 dark:hover:bg-[#4E1022]'
                    }`}
                  >
                  <td
                    className={`sticky left-0 z-10 py-2.5 pl-2.5 pr-2 sm:px-4 font-mono text-xs sm:text-[13px] leading-tight tabular-nums break-all sm:break-normal sm:whitespace-nowrap border-r border-slate-200/80 dark:border-[#6B2137] lg:border-r-0 transition-colors print:static print:border-r-0 print:py-1.5 print:whitespace-normal ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-[#6D1A33]'
                        : 'bg-white dark:bg-[#380A18] group-hover:bg-slate-50 dark:group-hover:bg-[#4E1022]'
                    }`}
                  >
                    <span
                      className={
                        acc.level === 1
                          ? 'font-semibold text-slate-900 dark:text-white'
                          : 'font-medium text-blue-700 dark:text-rose-200 print-code-sub'
                      }
                    >
                      <HighlightText text={acc.code} query={query} />
                    </span>
                  </td>

                  <td className="py-2.5 px-3 sm:px-4 print:py-1.5 print:text-xs">
                    <span
                      className={
                        acc.level === 1
                          ? 'font-semibold text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-white'
                      }
                    >
                      <HighlightText text={acc.description} query={query} />
                    </span>
                  </td>

                  <td className="py-2.5 px-2.5 sm:px-4 text-right text-xs text-slate-500 dark:text-rose-100/80 whitespace-nowrap print:py-1.5 print-muted">
                    {getLevelLabel(acc.level)}
                  </td>

                  <td className="py-2.5 px-2.5 sm:px-4 text-right whitespace-nowrap print:py-1.5">
                    <span
                      translate="no"
                      className={`text-xs font-medium tabular-nums ${
                        acc.nature === 'Deudora'
                          ? 'text-emerald-700 dark:text-emerald-300 print-nature-deudora'
                          : acc.nature === 'Mixta'
                            ? 'text-sky-700 dark:text-sky-200 print-nature-mixta'
                            : 'text-amber-700 dark:text-amber-200 print-nature-acreedora'
                      }`}
                    >
                      {acc.nature}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 sm:px-4 text-right whitespace-nowrap print:hidden">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyCode(acc.code);
                        }}
                        title="Copiar código"
                        aria-label={`Copiar código ${acc.code}`}
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
                          onToggleFavorite(acc.code);
                        }}
                        title={isFavorite ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                        aria-label={
                          isFavorite
                            ? `Quitar ${acc.code} de favoritas`
                            : `Guardar ${acc.code} en favoritas`
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
                  </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
