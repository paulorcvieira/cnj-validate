import {
  CourtType,
  MAX_COURT_BY_SEGMENT,
  OriginCourt,
  SpecialCourtCode,
} from '../types/court'
import { MilitaryCourtCodes } from '../types/district'
import { CNJValidationError } from '../types/errors'
import { Segment } from '../types/segment'

/**
 * Analisa e retorna informações sobre tribunal de origem
 * @param court Código do tribunal (2 dígitos)
 * @param segment Informações do segmento
 * @returns Informações do tribunal de origem
 */
export function getOriginCourt(court: string, segment: Segment): OriginCourt {
  switch (court) {
    case SpecialCourtCode.ORIGINAL:
      return parseCourt00(segment)

    case SpecialCourtCode.COUNCIL:
      return parseCourt90(segment)

    default:
      return parseCourtOther(segment, court)
  }
}

/**
 * Processa tribunal código 00 (processo originário)
 */
function parseCourt00(segment: Segment): OriginCourt {
  let originCourt: string

  switch (segment.number) {
    case 1:
    case 2:
    case 3:
      originCourt = `${segment.name} (${segment.short})`
      break
    case 5:
      originCourt = 'Tribunal Superior do Trabalho (TST)'
      break
    case 6:
      originCourt = 'Tribunal Superior Eleitoral (TSE)'
      break
    case 7:
    case 9:
      originCourt = 'Superior Tribunal Militar (STM)'
      break
    default:
      throw CNJValidationError.invalidCourt('00', segment.number)
  }

  return {
    originCourtType: CourtType.ORIGINAL_LAWSUIT,
    originCourtNumber: originCourt,
  }
}

/**
 * Processa tribunal código 90 (conselhos especiais)
 */
function parseCourt90(segment: Segment): OriginCourt {
  let originCourt: string

  switch (segment.number) {
    case 4:
      originCourt = 'Conselho da Justiça Federal'
      break
    case 5:
      originCourt = 'Conselho Superior da Justiça do Trabalho'
      break
    default:
      throw CNJValidationError.invalidCourt('90', segment.number)
  }

  return {
    originCourtType: CourtType.ORIGINAL_LAWSUIT,
    originCourtNumber: originCourt,
  }
}

/**
 * Processa outros códigos de tribunal
 */
function parseCourtOther(segment: Segment, court: string): OriginCourt {
  const courtNumber = parseInt(court, 10)

  if (isNaN(courtNumber)) {
    throw CNJValidationError.invalidCourt(court, segment.number)
  }

  // Validação específica para tribunais militares estaduais
  if (segment.number === 9) {
    return parseMilitaryCourt(courtNumber)
  }

  // Validação de limites por segmento
  if (!isCourtValid(segment, courtNumber)) {
    throw CNJValidationError.invalidCourt(court, segment.number)
  }

  const { courtType, courtNumber: courtNum } = getCourtTypeAndNumber(
    segment,
    courtNumber,
  )

  return {
    originCourtType: courtType,
    originCourtNumber: courtNum,
  }
}

/**
 * Processa tribunais militares estaduais
 */
function parseMilitaryCourt(courtCode: number): OriginCourt {
  let courtName: string

  switch (courtCode) {
    case MilitaryCourtCodes.MG:
      courtName = 'Minas Gerais - MG'
      break
    case MilitaryCourtCodes.RS:
      courtName = 'Rio Grande do Sul - RS'
      break
    case MilitaryCourtCodes.SP:
      courtName = 'São Paulo - SP'
      break
    default:
      throw CNJValidationError.invalidCourt(courtCode.toString(), 9)
  }

  return {
    originCourtType: CourtType.MARTIAL_COURT,
    originCourtNumber: courtName,
  }
}

/**
 * Determina tipo e número do tribunal baseado no segmento
 */
function getCourtTypeAndNumber(
  segment: Segment,
  courtNumber: number,
): { courtType: string; courtNumber: string } {
  switch (segment.number) {
    case 4:
    case 5:
      return {
        courtType: CourtType.REGION,
        courtNumber: courtNumber.toString(),
      }
    case 6:
    case 8:
      return {
        courtType: CourtType.ESTATE,
        courtNumber: courtNumber.toString(),
      }
    case 7:
      return {
        courtType: CourtType.JUDICIAL_CIRCUIT,
        courtNumber: courtNumber.toString(),
      }
    default:
      throw CNJValidationError.invalidCourt(
        courtNumber.toString(),
        segment.number,
      )
  }
}

/**
 * Valida se o número do tribunal é válido para o segmento
 */
function isCourtValid(segment: Segment, courtNumber: number): boolean {
  const maxCourt = MAX_COURT_BY_SEGMENT[segment.number]

  if (maxCourt === 0) {
    return true // Sem limite
  }

  return courtNumber >= 1 && courtNumber <= maxCourt
}

/**
 * Obtém limite máximo de tribunal para um segmento
 */
export function getMaxCourtBySegment(segmentNumber: number): number {
  return MAX_COURT_BY_SEGMENT[segmentNumber] || 0
}
