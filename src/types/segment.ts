/**
 * Representa um segmento do Poder Judiciário brasileiro
 */
export interface Segment {
  /** Código numérico do segmento (1-9) */
  number: number
  /** Nome completo do segmento */
  name: string
  /** Sigla/nome curto do segmento */
  short: string
}

/**
 * Códigos válidos de segmentos do Poder Judiciário
 */
export enum SegmentCode {
  STF = 1, // Supremo Tribunal Federal
  CNJ = 2, // Conselho Nacional de Justiça
  STJ = 3, // Superior Tribunal de Justiça
  TRF = 4, // Justiça Federal
  TRT = 5, // Justiça do Trabalho
  TRE = 6, // Justiça Eleitoral
  STM = 7, // Justiça Militar da União
  TJ = 8, // Justiça dos Estados e DF
  TJM = 9, // Justiça Militar Estadual
}

/**
 * Nomes dos segmentos por extenso
 */
export const SEGMENT_NAMES: Record<SegmentCode, string> = {
  [SegmentCode.STF]: 'Supremo Tribunal Federal',
  [SegmentCode.CNJ]: 'Conselho Nacional de Justiça',
  [SegmentCode.STJ]: 'Superior Tribunal de Justiça',
  [SegmentCode.TRF]: 'Justiça Federal',
  [SegmentCode.TRT]: 'Justiça do Trabalho',
  [SegmentCode.TRE]: 'Justiça Eleitoral',
  [SegmentCode.STM]: 'Justiça Militar da União',
  [SegmentCode.TJ]: 'Justiça dos Estados e do Distrito Federal e Territórios',
  [SegmentCode.TJM]: 'Justiça Militar Estadual',
}

/**
 * Siglas dos segmentos
 */
export const SEGMENT_SHORTS: Record<SegmentCode, string> = {
  [SegmentCode.STF]: 'STF',
  [SegmentCode.CNJ]: 'CNJ',
  [SegmentCode.STJ]: 'STJ',
  [SegmentCode.TRF]: 'TRF',
  [SegmentCode.TRT]: 'TRT',
  [SegmentCode.TRE]: 'TRE',
  [SegmentCode.STM]: 'STM',
  [SegmentCode.TJ]: 'TJ',
  [SegmentCode.TJM]: 'TJM',
}
