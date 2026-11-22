import React from 'react';
import { Check, ChevronRight, Copy, Star, X } from 'lucide-react';
import { getAncestorChain, getLevelLabel } from '../data/classifier';
import { AccountEntry } from '../types/accounts';

interface AccountDetailStripProps {
  account: AccountEntry;
  allAccounts: AccountEntry[];
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onCopyText: (text: string, key: string) => void;
  copiedKey: string | null;
  onSelectAccount: (acc: AccountEntry) => void;
  onClose: () => void;
}

export const AccountDetailStrip: React.FC<AccountDetailStripProps> = ({
  account,
  allAccounts,
  isFavorite,
  onToggleFavorite,
  onCopyText,
  copiedKey,
  onSelectAccount,
  onClose,
}) => {
  const chain = React.useMemo(
    () => getAncestorChain(account, allAccounts),
    [account, allAccounts]
  );

  const codeCopied = copiedKey === `detail-code-${account.code}`;
  const fullCopied = copiedKey === `detail-full-${account.code}`;

  return (
    <section
      aria-label="Detalle de la cuenta seleccionada"
      className="border border-slate-200 dark:border-[#6B2137] rounded-xl bg-slate-50/90 dark:bg-[#380A18] p-4 sm:p-5 space-y-3 print:hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          {/* Hierarchy Breadcrumb */}
          <nav aria-label="Jerarquía de la cuenta" className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-rose-100/80">
            {chain.map((item, idx) => {
              const isLast = idx === chain.length - 1;
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-rose-200/70 shrink-0" />}
                  <button
                    type="button"
                    onClick={() => onSelectAccount(item)}
                    className={`font-mono tabular-nums truncate max-w-[260px] cursor-pointer ${
                      isLast
                        ? 'font-semibold text-blue-700 dark:text-white'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={`${item.code} — ${item.description}`}
                  >
                    {item.code}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              <span className="font-mono tabular-nums mr-2 text-blue-700 dark:text-rose-200">
                {account.code}
              </span>
              {account.description}
            </h3>
          </div>

          {/* Unboxed clean metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-rose-100/80">
            <span>Nivel: {getLevelLabel(account.level)}</span>
            <span aria-hidden="true">·</span>
            <span>
              Naturaleza:{' '}
              <strong
                translate="no"
                className={
                  account.nature === 'Deudora'
                    ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                    : account.nature === 'Mixta'
                      ? 'text-sky-700 dark:text-sky-200 font-medium'
                      : 'text-amber-700 dark:text-amber-200 font-medium'
                }
              >
                {account.nature}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Fuente: Parte {account.part}, Pág. {account.page}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 dark:text-rose-100/80 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#4E1022] transition-colors cursor-pointer"
          aria-label="Cerrar detalle de cuenta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onCopyText(account.code, `detail-code-${account.code}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#460E1F] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#591428] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {codeCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
              <span>Código copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar código</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            onCopyText(
              `${account.code} — ${account.description} (${account.nature})`,
              `detail-full-${account.code}`
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#460E1F] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#591428] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {fullCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
              <span>Detalle copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar código y descripción</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(account.code)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isFavorite
              ? 'border-amber-300 dark:border-amber-300/60 bg-amber-50 dark:bg-[#6D1A33] text-amber-800 dark:text-amber-200'
              : 'border-slate-200 dark:border-[#7C2841] bg-white dark:bg-[#460E1F] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#591428]'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          <span>{isFavorite ? 'En favoritas' : 'Agregar a favoritas'}</span>
        </button>
      </div>
    </section>
  );
};
