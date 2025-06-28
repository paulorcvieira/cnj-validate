import { getSegment } from '../data/segments'
import { AnalysisCNJ } from '../types/analysis'
import { CNJValidationError } from '../types/errors'
import { getOriginCourt } from './court-analyzer'
import { decomposeCNJ } from './decomposer'
import { getSourceUnit } from './source-unit-analyzer'
import { validateCNJ } from './validator'

/**
 * Realiza análise completa de um número CNJ
 * @param cnj Número CNJ a ser analisado
 * @returns Estrutura AnalysisCNJ com todas as informações
 */
export function analyzeCNJ(cnj: string): AnalysisCNJ {
  try {
    // Decompõe o CNJ
    const decomposed = decomposeCNJ(cnj)

    // Valida o CNJ
    const validation = validateCNJ(cnj)

    // Obtém informações do segmento
    const segment = getSegment(decomposed.segment)
    if (!segment) {
      throw CNJValidationError.invalidSegment(decomposed.segment)
    }

    // Obtém informações da unidade de origem
    const sourceUnit = getSourceUnit(decomposed.sourceUnit, segment)

    // Obtém informações do tribunal de origem
    const originCourt = getOriginCourt(decomposed.court, segment)

    return {
      receivedCNJ: cnj,
      validCNJ: validation.isValid,
      segmentName: segment.name,
      segmentShort: segment.short,
      sourceUnitType: sourceUnit.sourceUnitType,
      sourceUnitNumber: sourceUnit.sourceUnitNumber,
      courtType: originCourt.originCourtType,
      courtNumber: originCourt.originCourtNumber,
      detailed: decomposed,
    }
  } catch (error) {
    if (error instanceof CNJValidationError) {
      throw error
    }
    throw new CNJValidationError(
      'CALCULATION_ERROR' as any,
      error instanceof Error ? error.message : 'Erro desconhecido na análise',
      'ANALYSIS_ERROR',
      { cnj },
    )
  }
}

/**
 * Gera descrição textual de um processo CNJ
 * @param analysis Análise CNJ completa
 * @returns Descrição formatada do processo
 */
export function writeCNJ(analysis: AnalysisCNJ): string {
  if (!analysis.detailed.lawsuitNumber) {
    throw new Error('AnalysisCNJ não possui dados utilizáveis')
  }

  const lawsuit = analysis.detailed.lawsuitNumber
  const year = analysis.detailed.protocolYear
  const segment1 = analysis.segmentName
  const segment2 = analysis.segmentShort
  const sourceU1 = analysis.sourceUnitType
  const ct1 = analysis.courtType

  // Determina o nome da unidade de origem
  const sourceU2 = analysis.detailed.district || analysis.sourceUnitNumber

  // Determina a identificação do tribunal
  const ct2 = analysis.detailed.uf || analysis.courtNumber

  // Determina a preposição baseada na unidade de origem
  const preposition = analysis.detailed.sourceUnit !== '8' ? 'o' : 'a'

  return `Processo número: ${lawsuit}, protocolado n${preposition} ${sourceU1} de ${sourceU2}, no ano ${year} | ${ct1}: ${ct2} | ${segment1} (${segment2})`
}

/**
 * Analisa múltiplos CNJs
 * @param cnjs Array de números CNJ
 * @returns Array de análises
 */
export function analyzeCNJBatch(
  cnjs: string[],
): Array<AnalysisCNJ | { error: string; cnj: string }> {
  return cnjs.map((cnj) => {
    try {
      return analyzeCNJ(cnj)
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        cnj,
      }
    }
  })
}

/**
 * Analisa CNJ e retorna apenas se é válido ou não
 * @param cnj Número CNJ a ser analisado
 * @returns true se válido, false se inválido
 */
export function isValidCNJComplete(cnj: string): boolean {
  try {
    const analysis = analyzeCNJ(cnj)
    return analysis.validCNJ
  } catch {
    return false
  }
}

/**
 * Obtém estatísticas de uma análise em lote
 * @param analyses Array de análises ou erros
 * @returns Estatísticas do processamento
 */
export function getBatchStatistics(
  analyses: Array<AnalysisCNJ | { error: string; cnj: string }>,
) {
  const total = analyses.length
  const errors = analyses.filter((item) => 'error' in item).length
  const valid = analyses.filter(
    (item) => 'validCNJ' in item && item.validCNJ,
  ).length
  const invalid = analyses.filter(
    (item) => 'validCNJ' in item && !item.validCNJ,
  ).length

  return {
    total,
    successful: total - errors,
    errors,
    valid,
    invalid,
    successRate: total > 0 ? ((total - errors) / total) * 100 : 0,
    validityRate: total > 0 ? (valid / total) * 100 : 0,
  }
}
