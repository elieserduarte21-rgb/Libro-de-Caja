export type AccountNature = 'Deudora' | 'Acreedora' | 'Mixta';

export type AccountLevel = 1 | 2 | 3 | 4;

export type AccountSectionId =
  | 'activos'
  | 'pasivos'
  | 'capital'
  | 'gastos-produccion'
  | 'cuentas-nominales'
  | 'cuentas-cierre';

export interface AccountSection {
  id: AccountSectionId;
  title: string;
  shortLabel: string;
  subtitle?: string;
  rangeLabel: string;
  min: number;
  max: number;
}

export interface AccountSubsection {
  id: string;
  sectionId: AccountSectionId;
  title: string;
  rangeLabel: string;
  min: number;
  max: number;
}

export interface RawAccountEntry {
  code: string;
  description: string;
  nature: AccountNature;
  part: 1 | 2 | 3 | 4;
  page: number;
}

export interface AccountEntry extends RawAccountEntry {
  id: string;
  /** Clean non-empty code segments split by '*' */
  segments: string[];
  /** 1 = Cuenta, 2 = Subcuenta, 3 = Subcontrol, 4 = Análisis / Específico */
  level: AccountLevel;
  /** 3-digit root account code, e.g. '101' */
  rootCode: string;
  /** Immediate parent code if present in hierarchy, else null */
  parentCode: string | null;
  /** Major accounting classification section key, e.g. 'activos' */
  sectionId: AccountSectionId;
  /** Subsection classification key within a section, e.g. 'activos-circulantes' */
  subsectionId: string | null;
  /** Accounting group range key, e.g. '100-129' */
  groupId: string;
  /** Precomputed accent-stripped lowercase searchable string */
  searchableText: string;
}

export interface AccountTreeNode extends AccountEntry {
  children: AccountTreeNode[];
  descendantCount: number;
  matchesFilter: boolean;
}

export interface AccountGroup {
  id: string;
  label: string;
  rangeLabel: string;
  min: number;
  max: number;
  sectionId: AccountSectionId;
}

export type NatureFilter = 'Todas' | AccountNature;
export type LevelFilter = 'all' | AccountLevel;
export type SectionFilter = 'all' | AccountSectionId;
export type SubsectionFilter = 'all' | string;
export type ViewMode = 'tree' | 'table';
export type FilterStyle = 'buttons' | 'collapsible';
export type NavTab = 'explorer' | 'favorites';
export type SortField = 'code' | 'description' | 'nature' | 'level';
export type SortDirection = 'asc' | 'desc';
