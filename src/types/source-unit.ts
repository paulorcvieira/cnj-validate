/**
 * Representa uma unidade de origem do processo judicial
 */
export interface SourceUnit {
  /** Tipo da unidade de origem */
  sourceUnitType: string
  /** Número da unidade de origem */
  sourceUnitNumber: string
}

/**
 * Tipos de unidades de origem por segmento
 */
export enum SourceUnitType {
  JUSTICE_SECTION = 'subseção judiciária',
  LABOR_UNIT = 'vara do trabalho',
  ELECTORAL_UNIT = 'zona eleitoral',
  MILITARY_UNIT = 'auditoria militar',
  CIVIL_UNIT = 'foro',
  COURT_UNIT_SINGLE = 'competência originária do Tribunal',
  COURT_UNIT = 'competência originária da Turma Recursal',
}

/**
 * Configuração de tipos de unidade por segmento
 */
export const SOURCE_UNIT_CONFIG: Record<number, SourceUnitType> = {
  1: SourceUnitType.COURT_UNIT_SINGLE,
  2: SourceUnitType.COURT_UNIT_SINGLE,
  3: SourceUnitType.COURT_UNIT_SINGLE,
  4: SourceUnitType.JUSTICE_SECTION,
  5: SourceUnitType.LABOR_UNIT,
  6: SourceUnitType.ELECTORAL_UNIT,
  7: SourceUnitType.MILITARY_UNIT,
  8: SourceUnitType.CIVIL_UNIT,
  9: SourceUnitType.MILITARY_UNIT,
}
