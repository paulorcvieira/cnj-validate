import {
  Segment,
  SEGMENT_NAMES,
  SEGMENT_SHORTS,
  SegmentCode,
} from '../types/segment'

/**
 * Mapeamento completo de segmentos do Poder Judiciário
 */
export const SEGMENTS: Record<number, Segment> = {
  [SegmentCode.STF]: {
    number: SegmentCode.STF,
    name: SEGMENT_NAMES[SegmentCode.STF],
    short: SEGMENT_SHORTS[SegmentCode.STF],
  },
  [SegmentCode.CNJ]: {
    number: SegmentCode.CNJ,
    name: SEGMENT_NAMES[SegmentCode.CNJ],
    short: SEGMENT_SHORTS[SegmentCode.CNJ],
  },
  [SegmentCode.STJ]: {
    number: SegmentCode.STJ,
    name: SEGMENT_NAMES[SegmentCode.STJ],
    short: SEGMENT_SHORTS[SegmentCode.STJ],
  },
  [SegmentCode.TRF]: {
    number: SegmentCode.TRF,
    name: SEGMENT_NAMES[SegmentCode.TRF],
    short: SEGMENT_SHORTS[SegmentCode.TRF],
  },
  [SegmentCode.TRT]: {
    number: SegmentCode.TRT,
    name: SEGMENT_NAMES[SegmentCode.TRT],
    short: SEGMENT_SHORTS[SegmentCode.TRT],
  },
  [SegmentCode.TRE]: {
    number: SegmentCode.TRE,
    name: SEGMENT_NAMES[SegmentCode.TRE],
    short: SEGMENT_SHORTS[SegmentCode.TRE],
  },
  [SegmentCode.STM]: {
    number: SegmentCode.STM,
    name: SEGMENT_NAMES[SegmentCode.STM],
    short: SEGMENT_SHORTS[SegmentCode.STM],
  },
  [SegmentCode.TJ]: {
    number: SegmentCode.TJ,
    name: SEGMENT_NAMES[SegmentCode.TJ],
    short: SEGMENT_SHORTS[SegmentCode.TJ],
  },
  [SegmentCode.TJM]: {
    number: SegmentCode.TJM,
    name: SEGMENT_NAMES[SegmentCode.TJM],
    short: SEGMENT_SHORTS[SegmentCode.TJM],
  },
}

/**
 * Obtém informações de um segmento pelo código
 */
export function getSegment(segmentCode: string | number): Segment | null {
  const code =
    typeof segmentCode === 'string' ? parseInt(segmentCode, 10) : segmentCode

  if (isNaN(code) || code < 1 || code > 9) {
    return null
  }

  return SEGMENTS[code] || null
}

/**
 * Valida se um código de segmento é válido
 */
export function isValidSegmentCode(code: string | number): boolean {
  const numCode = typeof code === 'string' ? parseInt(code, 10) : code
  return (
    !isNaN(numCode) &&
    numCode >= 1 &&
    numCode <= 9 &&
    SEGMENTS[numCode] !== undefined
  )
}

/**
 * Lista todos os segmentos disponíveis
 */
export function getAllSegments(): Segment[] {
  return Object.keys(SEGMENTS).map((key) => SEGMENTS[parseInt(key, 10)])
}
