import { Segment } from '../types/segment'
import {
  SOURCE_UNIT_CONFIG,
  SourceUnit,
  SourceUnitType,
} from '../types/source-unit'

/**
 * Analisa e retorna informações sobre unidade de origem
 * @param sourceUnit Código da unidade de origem (4 dígitos)
 * @param segment Informações do segmento
 * @returns Informações da unidade de origem
 */
export function getSourceUnit(
  sourceUnit: string,
  segment: Segment,
): SourceUnit {
  // Casos especiais: competência originária
  if (isZeroSequence(sourceUnit)) {
    return {
      sourceUnitType: SourceUnitType.COURT_UNIT_SINGLE,
      sourceUnitNumber: sourceUnit,
    }
  }

  if (isFirstDigit9(sourceUnit)) {
    return {
      sourceUnitType: SourceUnitType.COURT_UNIT,
      sourceUnitNumber: sourceUnit,
    }
  }

  // Determina tipo baseado no segmento
  const unitType =
    SOURCE_UNIT_CONFIG[segment.number] || SourceUnitType.CIVIL_UNIT

  return {
    sourceUnitType: unitType,
    sourceUnitNumber: sourceUnit,
  }
}

/**
 * Verifica se o primeiro dígito da unidade de origem é 9
 * Indica competência originária da Turma Recursal
 */
function isFirstDigit9(sourceUnit: string): boolean {
  return sourceUnit[0] === '9'
}

/**
 * Verifica se a unidade de origem é uma sequência de zeros
 * Indica competência originária do Tribunal
 */
function isZeroSequence(sourceUnit: string): boolean {
  return sourceUnit === '0000'
}

/**
 * Valida código de unidade de origem
 * @param sourceUnit Código a ser validado
 * @returns true se válido
 */
export function isValidSourceUnit(sourceUnit: string): boolean {
  return /^\d{4}$/.test(sourceUnit)
}

/**
 * Obtém descrição do tipo de unidade por segmento
 * @param segmentNumber Número do segmento
 * @returns Descrição do tipo de unidade
 */
export function getSourceUnitTypeBySegment(
  segmentNumber: number,
): SourceUnitType {
  return SOURCE_UNIT_CONFIG[segmentNumber] || SourceUnitType.CIVIL_UNIT
}
