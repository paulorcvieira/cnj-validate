import { generateDistrictKey, getDistrictInfo } from '../data/districts'
import { getSegment } from '../data/segments'
import { DecomposedCNJ } from '../types/analysis'
import { CNJValidationError } from '../types/errors'

/**
 * Constante para composição do número de argumento
 */
const MATH_SUFFIX = '00'

/**
 * Decompõe um número CNJ em seus componentes individuais
 * @param cnj Número CNJ no formato NNNNNNN-DD.AAAA.J.CT.0000 ou NNNNNNNDDAAAAJCT0000
 * @returns Estrutura DecomposedCNJ com todos os componentes
 */
export function decomposeCNJ(cnj: string): DecomposedCNJ {
  // Valida o tamanho básico
  if (cnj.length > 25 || cnj.length < 20) {
    throw CNJValidationError.invalidLength(cnj, 20)
  }

  // Verifica se é formato com hífen (formatado)
  const isFormatted = cnj.includes('-')

  if (isFormatted) {
    return decomposeFormattedCNJ(cnj)
  } else {
    return decomposeUnformattedCNJ(cnj)
  }
}

/**
 * Decompõe CNJ formatado (NNNNNNN-DD.AAAA.J.CT.0000)
 */
function decomposeFormattedCNJ(cnj: string): DecomposedCNJ {
  const parts = cnj.split('-')

  if (parts.length !== 2) {
    throw CNJValidationError.invalidFormat(cnj)
  }

  const lawsuitNumber = parts[0]
  const remainingParts = parts[1].split('.')

  if (remainingParts.length !== 5) {
    throw CNJValidationError.invalidFormat(cnj)
  }

  const [verifyingDigit, protocolYear, segment, court, sourceUnit] =
    remainingParts

  return buildDecomposedCNJ({
    lawsuitNumber,
    verifyingDigit,
    protocolYear,
    segment,
    court,
    sourceUnit,
  })
}

/**
 * Decompõe CNJ não formatado (NNNNNNNDDAAAAJCT0000)
 */
function decomposeUnformattedCNJ(cnj: string): DecomposedCNJ {
  if (cnj.length !== 20) {
    throw CNJValidationError.invalidLength(cnj, 20)
  }

  const lawsuitNumber = cnj.substring(0, 7)
  const verifyingDigit = cnj.substring(7, 9)
  const protocolYear = cnj.substring(9, 13)
  const segment = cnj.substring(13, 14)
  const court = cnj.substring(14, 16)
  const sourceUnit = cnj.substring(16, 20)

  return buildDecomposedCNJ({
    lawsuitNumber,
    verifyingDigit,
    protocolYear,
    segment,
    court,
    sourceUnit,
  })
}

/**
 * Constrói a estrutura DecomposedCNJ com informações complementares
 */
function buildDecomposedCNJ(components: {
  lawsuitNumber: string
  verifyingDigit: string
  protocolYear: string
  segment: string
  court: string
  sourceUnit: string
}): DecomposedCNJ {
  const {
    lawsuitNumber,
    verifyingDigit,
    protocolYear,
    segment,
    court,
    sourceUnit,
  } = components

  // Gera número de argumento para validação
  const argNumber =
    lawsuitNumber + protocolYear + segment + court + sourceUnit + MATH_SUFFIX

  // Busca informações de distrito
  const districtKey = generateDistrictKey(segment, court, sourceUnit)
  const districtInfo = getDistrictInfo(districtKey)

  // Busca informações de segmento
  const segmentInfo = getSegment(segment)

  // Gera código do tribunal
  const tj = generateTJCode(segment, court, districtInfo?.uf || '', segmentInfo)

  // Formata CNJ completo
  const lawsuitCNJFormat = `${lawsuitNumber}-${verifyingDigit}.${protocolYear}.${segment}.${court}.${sourceUnit}`

  return {
    lawsuitCNJFormat,
    lawsuitNumber,
    verifyingDigit,
    protocolYear,
    segment,
    court,
    sourceUnit,
    argNumber,
    district: districtInfo?.sourceUnit || '',
    uf: districtInfo?.uf || '',
    tj,
  }
}

/**
 * Gera código do tribunal baseado no segmento e outros parâmetros
 */
function generateTJCode(
  segment: string,
  court: string,
  uf: string,
  segmentInfo: any,
): string {
  if (!segmentInfo) {
    return ''
  }

  const segmentNumber = segmentInfo.number

  // Para segmentos 1, 2, 3, 4, 7: usa número do tribunal
  if ([1, 2, 3, 4, 7].indexOf(segmentNumber) !== -1) {
    const courtNumber = parseInt(court, 10)
    if (isNaN(courtNumber)) {
      return ''
    }
    return segmentInfo.short + courtNumber.toString()
  }

  // Para outros segmentos: usa UF
  return segmentInfo.short + uf
}

/**
 * Valida componentes básicos de um CNJ
 */
export function validateCNJComponents(components: {
  lawsuitNumber: string
  verifyingDigit: string
  protocolYear: string
  segment: string
  court: string
  sourceUnit: string
}): void {
  const {
    lawsuitNumber,
    verifyingDigit,
    protocolYear,
    segment,
    court,
    sourceUnit,
  } = components

  // Valida número do processo (7 dígitos)
  if (!/^\d{7}$/.test(lawsuitNumber)) {
    throw new CNJValidationError(
      'INVALID_FORMAT' as any,
      'Número do processo deve ter 7 dígitos',
      'INVALID_LAWSUIT_NUMBER',
      { lawsuitNumber },
    )
  }

  // Valida dígito verificador (2 dígitos)
  if (!/^\d{2}$/.test(verifyingDigit)) {
    throw new CNJValidationError(
      'INVALID_FORMAT' as any,
      'Dígito verificador deve ter 2 dígitos',
      'INVALID_VERIFYING_DIGIT',
      { verifyingDigit },
    )
  }

  // Valida ano (4 dígitos, entre 1998 e ano atual + 1)
  if (!/^\d{4}$/.test(protocolYear)) {
    throw new CNJValidationError(
      'INVALID_FORMAT' as any,
      'Protocol year must have 4 digits',
      'INVALID_PROTOCOL_YEAR',
      { protocolYear },
    )
  }

  // Validate segment (1 digit)
  if (!/^\d{1}$/.test(segment)) {
    throw new CNJValidationError(
      'INVALID_FORMAT' as any,
      'Segmento deve ter 1 dígito',
      'INVALID_SEGMENT',
      { segment },
    )
  }

  // Valida tribunal (2 dígitos)
  if (!/^\d{2}$/.test(court)) {
    throw new CNJValidationError(
      'INVALID_FORMAT' as any,
      'Código do tribunal deve ter 2 dígitos',
      'INVALID_COURT',
      { court },
    )
  }

  // Valida unidade de origem (4 dígitos)
  if (!/^\d{4}$/.test(sourceUnit)) {
    throw new CNJValidationError(
      'INVALID_FORMAT' as any,
      'Código da unidade de origem deve ter 4 dígitos',
      'INVALID_SOURCE_UNIT',
      { sourceUnit },
    )
  }
}

/**
 * Extrai ano de um número CNJ
 * @param cnj Número CNJ
 * @returns Ano de protocolo
 */
export function extractYear(cnj: string): string {
  try {
    const decomposed = decomposeCNJ(cnj)
    return decomposed.protocolYear
  } catch {
    return ''
  }
}

/**
 * Extrai segmento de um número CNJ
 * @param cnj Número CNJ
 * @returns Código de segmento
 */
export function extractSegment(cnj: string): string {
  try {
    const decomposed = decomposeCNJ(cnj)
    return decomposed.segment
  } catch {
    return ''
  }
}

/**
 * Extrai tribunal de um número CNJ
 * @param cnj Número CNJ
 * @returns Código de tribunal
 */
export function extractCourt(cnj: string): string {
  try {
    const decomposed = decomposeCNJ(cnj)
    return decomposed.court
  } catch {
    return ''
  }
}

/**
 * Verifica se um CNJ é de um ano específico
 * @param cnj Número CNJ
 * @param year Ano a ser verificado
 * @returns true se for do ano especificado
 */
export function isFromYear(cnj: string, year: string): boolean {
  const cnjYear = extractYear(cnj)
  return cnjYear === year
}

/**
 * Verifica se um CNJ é de um segmento específico
 * @param cnj Número CNJ
 * @param segment Segmento a ser verificado
 * @returns true se for do segmento especificado
 */
export function isFromSegment(cnj: string, segment: string): boolean {
  const cnjSegment = extractSegment(cnj)
  return cnjSegment === segment
}
