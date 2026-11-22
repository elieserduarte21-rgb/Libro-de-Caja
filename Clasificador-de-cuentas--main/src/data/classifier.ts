import {
  AccountEntry,
  AccountGroup,
  AccountLevel,
  AccountSection,
  AccountSectionId,
  AccountSubsection,
  AccountTreeNode,
  LevelFilter,
  NatureFilter,
  RawAccountEntry,
  SectionFilter,
  SubsectionFilter,
} from '../types/accounts';
import { PART_1_ACCOUNTS } from './part1';
import { PART_2_ACCOUNTS } from './part2';
import { PART_3_ACCOUNTS } from './part3';
import { PART_4_ACCOUNTS } from './part4';

export const LOADED_PARTS: readonly number[] = [1, 2, 3, 4];
export const TOTAL_EXPECTED_PARTS = 4;
export const COVERAGE_PAGES_LABEL = '1–28';
export const COVERAGE_RANGE_LABEL = '101 — 999';

export const ACCOUNT_SECTIONS: AccountSection[] = [
  {
    id: 'activos',
    title: 'ACTIVOS',
    shortLabel: 'Activos',
    rangeLabel: '101 – 399',
    min: 101,
    max: 399,
  },
  {
    id: 'pasivos',
    title: 'PASIVOS',
    shortLabel: 'Pasivos',
    rangeLabel: '400 – 599',
    min: 400,
    max: 599,
  },
  {
    id: 'capital',
    title: 'CAPITAL CONTABLE',
    shortLabel: 'Capital Contable',
    subtitle: 'Entidades no estatales, sociedades mercantiles, entidades cooperativas y sector privado',
    rangeLabel: '600 – 699',
    min: 600,
    max: 699,
  },
  {
    id: 'gastos-produccion',
    title: 'GASTOS DE PRODUCCIÓN',
    shortLabel: 'Gastos de Producción',
    rangeLabel: '700 – 739',
    min: 700,
    max: 739,
  },
  {
    id: 'cuentas-nominales',
    title: 'CUENTAS NOMINALES',
    shortLabel: 'Cuentas Nominales',
    rangeLabel: '800 – 956',
    min: 800,
    max: 956,
  },
  {
    id: 'cuentas-cierre',
    title: 'CUENTAS DE CIERRE',
    shortLabel: 'Cuentas de Cierre',
    rangeLabel: '999',
    min: 999,
    max: 999,
  },
];

export const ACCOUNT_SUBSECTIONS: AccountSubsection[] = [
  {
    id: 'activos-circulantes',
    sectionId: 'activos',
    title: 'Activos Circulantes',
    rangeLabel: '101 – 211',
    min: 101,
    max: 211,
  },
  {
    id: 'activos-largo-plazo',
    sectionId: 'activos',
    title: 'Activos a Largo Plazo',
    rangeLabel: '215 – 234',
    min: 215,
    max: 234,
  },
  {
    id: 'activos-fijos',
    sectionId: 'activos',
    title: 'Activos Fijos',
    rangeLabel: '240 – 292',
    min: 240,
    max: 292,
  },
  {
    id: 'activos-diferidos',
    sectionId: 'activos',
    title: 'Activos Diferidos',
    rangeLabel: '300 – 312',
    min: 300,
    max: 312,
  },
  {
    id: 'otros-activos',
    sectionId: 'activos',
    title: 'Otros Activos',
    rangeLabel: '330 – 364',
    min: 330,
    max: 364,
  },
  {
    id: 'reguladoras-activos',
    sectionId: 'activos',
    title: 'Cuentas Reguladoras de Activos',
    rangeLabel: '365 – 399',
    min: 365,
    max: 399,
  },
  {
    id: 'pasivos-circulantes',
    sectionId: 'pasivos',
    title: 'Pasivos Circulantes',
    rangeLabel: '400 – 501',
    min: 400,
    max: 501,
  },
  {
    id: 'pasivos-largo-plazo',
    sectionId: 'pasivos',
    title: 'Pasivos a Largo Plazo',
    rangeLabel: '510 – 541',
    min: 510,
    max: 541,
  },
  {
    id: 'pasivos-diferidos',
    sectionId: 'pasivos',
    title: 'Pasivos Diferidos',
    rangeLabel: '545 – 549',
    min: 545,
    max: 549,
  },
  {
    id: 'otros-pasivos',
    sectionId: 'pasivos',
    title: 'Otros Pasivos',
    rangeLabel: '555 – 575',
    min: 555,
    max: 575,
  },
  {
    id: 'nominales-deudoras',
    sectionId: 'cuentas-nominales',
    title: 'Cuentas Nominales Deudoras',
    rangeLabel: '800 – 878',
    min: 800,
    max: 878,
  },
  {
    id: 'nominales-acreedoras',
    sectionId: 'cuentas-nominales',
    title: 'Cuentas Nominales Acreedoras',
    rangeLabel: '900 – 956',
    min: 900,
    max: 956,
  },
];

export const ACCOUNT_GROUPS: AccountGroup[] = [
  { id: '100-129', label: 'Efectivo e Inversiones Temp.', rangeLabel: '100 – 129', min: 100, max: 129, sectionId: 'activos' },
  { id: '130-169', label: 'Cuentas por Cobrar y Pagos', rangeLabel: '130 – 169', min: 130, max: 169, sectionId: 'activos' },
  { id: '170-209', label: 'Ingresos e Inventarios', rangeLabel: '170 – 209', min: 170, max: 209, sectionId: 'activos' },
  { id: '210-259', label: 'Largo Plazo y Activos Fijos', rangeLabel: '210 – 259', min: 210, max: 259, sectionId: 'activos' },
  { id: '260-299', label: 'Inversiones en Proceso y AFT', rangeLabel: '260 – 299', min: 260, max: 299, sectionId: 'activos' },
  { id: '300-359', label: 'Diferidos y Cobros Diversos', rangeLabel: '300 – 359', min: 300, max: 359, sectionId: 'activos' },
  { id: '360-399', label: 'Reguladoras y Depreciación', rangeLabel: '360 – 399', min: 360, max: 399, sectionId: 'activos' },
  { id: '400-449', label: 'Obligaciones y Cuentas por Pagar', rangeLabel: '400 – 449', min: 400, max: 449, sectionId: 'pasivos' },
  { id: '450-499', label: 'Nóminas, Préstamos y Prov.', rangeLabel: '450 – 499', min: 450, max: 499, sectionId: 'pasivos' },
  { id: '500-599', label: 'Pasivos Largo Plazo y Sobrantes', rangeLabel: '500 – 599', min: 500, max: 599, sectionId: 'pasivos' },
  { id: '600-699', label: 'Patrimonio, Capital y Reservas', rangeLabel: '600 – 699', min: 600, max: 699, sectionId: 'capital' },
  { id: '700-799', label: 'Producción en Proceso', rangeLabel: '700 – 739', min: 700, max: 799, sectionId: 'gastos-produccion' },
  { id: '800-899', label: 'Costos y Gastos', rangeLabel: '800 – 899', min: 800, max: 899, sectionId: 'cuentas-nominales' },
  { id: '900-999', label: 'Ingresos y Resultado', rangeLabel: '900 – 999', min: 900, max: 999, sectionId: 'cuentas-nominales' },
];

const TYPO_SEARCH_ALIASES: Record<string, string> = {
  luticantes: 'lubricantes',
  inventraios: 'inventarios',
  ineversiones: 'inversiones',
  alamacen: 'almacen',
  serctor: 'sector',
  denro: 'dentro',
  suminisrador: 'suministrador',
  invesionista: 'inversionista',
  deterceros: 'de terceros',
  producticvos: 'productivos',
  aquilar: 'alquilar',
  invercionista: 'inversionista',
  impeuesto: 'impuesto',
  efeciencia: 'eficiencia',
  utiliades: 'utilidades',
  intagibles: 'intangibles',
  presupiestaria: 'presupuestaria',
  prejuicios: 'perjuicios',
  financiamineto: 'financiamiento',
  amacenamiento: 'almacenamiento',
  gnral: 'general',
};

export function normalizeText(text: string): string {
  const base = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  let enriched = base;
  for (const [typo, correction] of Object.entries(TYPO_SEARCH_ALIASES)) {
    if (base.includes(typo)) {
      enriched += ` ${correction}`;
    }
  }
  return enriched;
}

export function getLevelLabel(level: AccountLevel): string {
  switch (level) {
    case 1:
      return 'Cuenta';
    case 2:
      return 'Subcuenta';
    case 3:
      return 'Subcontrol';
    case 4:
      return 'Análisis / Esp.';
  }
}

function resolveGroupId(rootCode: string): string {
  const num = parseInt(rootCode, 10);
  const found = ACCOUNT_GROUPS.find((g) => num >= g.min && num <= g.max);
  return found ? found.id : 'otros';
}

function resolveSectionId(rootCode: string): AccountSectionId {
  const num = parseInt(rootCode, 10);
  const found = ACCOUNT_SECTIONS.find((s) => num >= s.min && num <= s.max);
  return found ? found.id : 'cuentas-nominales';
}

function resolveSubsectionId(rootCode: string): string | null {
  const num = parseInt(rootCode, 10);
  const found = ACCOUNT_SUBSECTIONS.find((sub) => num >= sub.min && num <= sub.max);
  return found ? found.id : null;
}

function enrichAccounts(rawList: RawAccountEntry[]): AccountEntry[] {
  const seenCodes = new Set<string>();
  const preliminary = rawList.map((item) => {
    const cleanSegments = item.code
      .split('*')
      .map((seg) => seg.trim())
      .filter((seg) => seg.length > 0);

    const rawLevel = Math.min(4, Math.max(1, cleanSegments.length)) as AccountLevel;
    const rootCode = cleanSegments[0] ?? item.code;
    seenCodes.add(cleanSegments.join('*'));

    return {
      ...item,
      cleanSegments,
      level: rawLevel,
      rootCode,
    };
  });

  return preliminary.map((item, idx) => {
    let parentCode: string | null = null;
    if (item.cleanSegments.length > 1) {
      // Find nearest existing ancestor by trimming segments from the right
      for (let len = item.cleanSegments.length - 1; len >= 1; len--) {
        const candidate = item.cleanSegments.slice(0, len).join('*');
        if (seenCodes.has(candidate)) {
          parentCode = candidate;
          break;
        }
      }
      if (!parentCode) {
        parentCode = item.rootCode;
      }
    }

    const codeNormalized = item.code.replace(/\s+/g, '').toLowerCase();
    const cleanCodeNormalized = item.cleanSegments.join('*').toLowerCase();
    const spaceCodeNormalized = item.cleanSegments.join(' ').toLowerCase();
    const paddedVariant = cleanCodeNormalized.endsWith('*099')
      ? cleanCodeNormalized.replace(/\*099$/, '*0099')
      : '';
    let rangeSearchTokens = '';
    const rootSegment = item.cleanSegments[0] ?? '';
    const rangeMatch = /^(\d+)-(\d+)$/.exec(rootSegment);
    if (rangeMatch) {
      const startNum = parseInt(rangeMatch[1], 10);
      const endNum = parseInt(rangeMatch[2], 10);
      if (endNum >= startNum && endNum - startNum <= 20) {
        const subSuffix =
          item.cleanSegments.length > 1
            ? `*${item.cleanSegments.slice(1).join('*').toLowerCase()}`
            : '';
        const expanded: string[] = [];
        for (let n = startNum; n <= endNum; n++) {
          expanded.push(`${n}${subSuffix}`);
        }
        rangeSearchTokens = expanded.join(' ');
      }
    }
    const searchableText = [
      codeNormalized,
      cleanCodeNormalized,
      spaceCodeNormalized,
      paddedVariant,
      rangeSearchTokens,
      normalizeText(item.description),
      normalizeText(item.nature),
    ].join(' ');

    return {
      id: `${item.code}-${idx}`,
      code: item.code,
      description: item.description,
      nature: item.nature,
      part: item.part,
      page: item.page,
      segments: item.cleanSegments,
      level: item.level,
      rootCode: item.rootCode,
      parentCode,
      sectionId: resolveSectionId(item.rootCode),
      subsectionId: resolveSubsectionId(item.rootCode),
      groupId: resolveGroupId(item.rootCode),
      searchableText,
    };
  });
}

// Combine all 4 loaded parts of the classifier
const RAW_ACCOUNTS: RawAccountEntry[] = [
  ...PART_1_ACCOUNTS,
  ...PART_2_ACCOUNTS,
  ...PART_3_ACCOUNTS,
  ...PART_4_ACCOUNTS,
];

export const ALL_ACCOUNTS: AccountEntry[] = enrichAccounts(RAW_ACCOUNTS);

export interface FilterCriteria {
  query: string;
  nature: NatureFilter;
  level: LevelFilter;
  sectionId: SectionFilter;
  subsectionId: SubsectionFilter;
  groupId: string; // 'all' or AccountGroup['id']
  favoritesOnly: boolean;
  favoriteCodes: Set<string>;
}

export function matchesEntry(entry: AccountEntry, criteria: FilterCriteria): boolean {
  if (criteria.favoritesOnly && !criteria.favoriteCodes.has(entry.code)) {
    return false;
  }
  if (criteria.nature !== 'Todas' && entry.nature !== criteria.nature) {
    return false;
  }
  if (criteria.level !== 'all' && entry.level !== criteria.level) {
    return false;
  }
  if (criteria.sectionId !== 'all' && entry.sectionId !== criteria.sectionId) {
    return false;
  }
  if (criteria.subsectionId !== 'all' && entry.subsectionId !== criteria.subsectionId) {
    return false;
  }
  if (criteria.groupId !== 'all' && entry.groupId !== criteria.groupId) {
    return false;
  }

  const trimmed = criteria.query.trim();
  if (!trimmed) {
    return true;
  }

  const tokens = normalizeText(trimmed)
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return tokens.every((token) => entry.searchableText.includes(token));
}

export function buildFilteredTree(
  accounts: AccountEntry[],
  criteria: FilterCriteria
): {
  roots: AccountTreeNode[];
  directMatchCount: number;
  hasActiveFilter: boolean;
} {
  const hasActiveFilter =
    criteria.query.trim().length > 0 ||
    criteria.nature !== 'Todas' ||
    criteria.level !== 'all' ||
    criteria.sectionId !== 'all' ||
    criteria.subsectionId !== 'all' ||
    criteria.groupId !== 'all' ||
    criteria.favoritesOnly;

  const nodeMap = new Map<string, AccountTreeNode>();
  const directMatches = new Set<string>();

  for (const acc of accounts) {
    const isMatch = matchesEntry(acc, criteria);
    if (isMatch) {
      directMatches.add(acc.code);
    }
    const cleanKey = acc.segments.join('*');
    nodeMap.set(cleanKey, {
      ...acc,
      children: [],
      descendantCount: 0,
      matchesFilter: isMatch,
    });
  }

  const allRoots: AccountTreeNode[] = [];
  for (const acc of accounts) {
    const cleanKey = acc.segments.join('*');
    const node = nodeMap.get(cleanKey)!;
    if (acc.parentCode && nodeMap.has(acc.parentCode) && acc.parentCode !== cleanKey) {
      nodeMap.get(acc.parentCode)!.children.push(node);
    } else {
      allRoots.push(node);
    }
  }

  function pruneAndCount(node: AccountTreeNode): AccountTreeNode | null {
    const prunedChildren: AccountTreeNode[] = [];
    let descCount = 0;

    for (const child of node.children) {
      const result = pruneAndCount(child);
      if (result) {
        prunedChildren.push(result);
        descCount += 1 + result.descendantCount;
      }
    }

    if (!hasActiveFilter || node.matchesFilter || prunedChildren.length > 0) {
      return {
        ...node,
        children: prunedChildren,
        descendantCount: descCount,
      };
    }

    return null;
  }

  const roots = allRoots
    .map(pruneAndCount)
    .filter((n): n is AccountTreeNode => n !== null);

  return {
    roots,
    directMatchCount: directMatches.size,
    hasActiveFilter,
  };
}

export function getAncestorChain(account: AccountEntry, allAccounts: AccountEntry[]): AccountEntry[] {
  const byCleanCode = new Map<string, AccountEntry>();
  for (const acc of allAccounts) {
    byCleanCode.set(acc.segments.join('*'), acc);
  }

  const chain: AccountEntry[] = [];
  let current: AccountEntry | undefined = account;
  const visited = new Set<string>();

  while (current) {
    const key = current.segments.join('*');
    if (visited.has(key)) break;
    visited.add(key);
    chain.unshift(current);
    if (current.parentCode && byCleanCode.has(current.parentCode)) {
      current = byCleanCode.get(current.parentCode);
    } else {
      break;
    }
  }

  return chain;
}
