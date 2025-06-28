/**
 * CNJ Validate - Biblioteca TypeScript para validação e análise de números CNJ
 * Versão Next.js 15 compatível
 *
 * @description
 * Esta biblioteca fornece funcionalidades completas para:
 * - Validação de números CNJ
 * - Decomposição e análise detalhada
 * - Processamento em lote via CSV
 * - Formatação e utilitários
 *
 * @example
 * ```typescript
 * import { validateCNJ, analyzeCNJ } from 'cnj-validate';
 *
 * const result = validateCNJ('0001327-64.2018.8.26.0158');
 * console.log(result.isValid); // true
 *
 * const analysis = analyzeCNJ('0001327-64.2018.8.26.0158');
 * console.log(analysis.segmentName); // "Justiça dos Estados..."
 * ```
 */

import { analyzeCNJ } from './core/analyzer'
import { isValidCNJ } from './core/validator'

// Core functions - Funções principais
export {
  calculateVerifyingDigit,
  detectCNJFormat,
  formatCNJ,
  isValidCNJ,
  normalizeCNJ,
  validateCNJ,
  validateCNJFormat,
} from './core/validator'

export { decomposeCNJ, validateCNJComponents } from './core/decomposer'

export {
  analyzeCNJ,
  analyzeCNJBatch,
  getBatchStatistics,
  isValidCNJComplete,
  writeCNJ,
} from './core/analyzer'

export {
  getSourceUnit,
  getSourceUnitTypeBySegment,
  isValidSourceUnit,
} from './core/source-unit-analyzer'

export { getMaxCourtBySegment, getOriginCourt } from './core/court-analyzer'

// CSV Processing - Processamento CSV (Browser-safe)
export {
  generateCSV,
  processCNJBatch,
  processCSV,
  validateCSVFormat,
} from './csv/processor'

// Data functions - Funções de dados
export {
  getAllSegments,
  getSegment,
  isValidSegmentCode,
  SEGMENTS,
} from './data/segments'

export {
  addDistrict,
  DISTRICTS,
  generateDistrictKey,
  getDistrictInfo,
  getDistrictsBySegment,
  getDistrictsByUF,
  hasDistrict,
} from './data/districts'

// Utilities - Utilitários
export {
  capitalizeWords,
  formatBrazilianDate,
  formatCNJWithMask,
  formatDuration,
  formatFileSize,
  formatLawsuitNumber,
  formatPercentage,
  formatProtocolYear,
  formatTimestamp,
  removeCNJMask,
} from './utils/formatters'

// Types - Tipos TypeScript
export type {
  AnalysisCNJ,
  BatchAnalysisResult,
  CNJFormat,
  CSVOptions,
  CSVProcessingError,
  CSVProcessingResult,
  CSVProcessingResultAdvanced,
  CSVStatistics,
  DecomposedCNJ,
  Result,
  ValidationConfig,
  ValidationResult,
} from './types/analysis'

// Namespace with utility types
export { CNJTypes } from './types/analysis'

export type { Segment, SegmentCode } from './types/segment'

export type { SourceUnit, SourceUnitType } from './types/source-unit'

export type { CourtType, OriginCourt, SpecialCourtCode } from './types/court'

export type {
  BrazilianStates,
  DistrictInfo,
  DistrictKey,
  DistrictMap,
  MilitaryCourtCodes,
} from './types/district'

export { CNJErrorType, CNJValidationError } from './types/errors'

// Constants - Constantes
export { SEGMENT_NAMES, SEGMENT_SHORTS } from './types/segment'

export { SOURCE_UNIT_CONFIG } from './types/source-unit'

export { MAX_COURT_BY_SEGMENT } from './types/court'

/**
 * Versão da biblioteca
 */
export const VERSION = '1.0.0'

/**
 * Informações sobre a biblioteca
 */
export const LIBRARY_INFO = {
  name: 'CNJ Validate',
  version: VERSION,
  description: 'Validação e análise de números CNJ',
  author: 'Sua Equipe',
  license: 'MIT',
  repository: 'https://github.com/paulorcvieira/cnj-validate',
}

/**
 * Configurações padrão
 */
export const DEFAULT_CONFIG = {
  csv: {
    separator: ',',
    includeHeader: true,
    encoding: 'utf8' as const,
  },
  validation: {
    strictMode: true,
    allowFormattedInput: true,
    allowUnformattedInput: true,
  },
}

/**
 * Função de conveniência para validação rápida
 * @param cnj Número CNJ a ser validado
 * @returns true se válido, false se inválido
 */
export function isValid(cnj: string): boolean {
  return isValidCNJ(cnj)
}

/**
 * Função de conveniência para análise rápida
 * @param cnj Número CNJ a ser analisado
 * @returns Análise completa ou null se inválido
 */
export function analyze(
  cnj: string,
): import('./types/analysis').AnalysisCNJ | null {
  try {
    return analyzeCNJ(cnj)
  } catch {
    return null
  }
}
