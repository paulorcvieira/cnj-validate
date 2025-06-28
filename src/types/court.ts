/**
 * Representa um tribunal de origem
 */
export interface OriginCourt {
  /** Tipo do tribunal de origem */
  originCourtType: string
  /** Número/identificação do tribunal */
  originCourtNumber: string
}

/**
 * Tipos de tribunais de origem
 */
export enum CourtType {
  ORIGINAL_LAWSUIT = 'Processo Originário',
  MARTIAL_COURT = 'Tribunal Militar Estadual',
  REGION = 'região',
  ESTATE = 'unidade federativa',
  JUDICIAL_CIRCUIT = 'circunscrição judiciária',
}

/**
 * Códigos especiais de tribunais
 */
export enum SpecialCourtCode {
  ORIGINAL = '00', // Processo originário
  COUNCIL = '90', // Conselhos especiais
}

/**
 * Configuração máxima de tribunais por segmento
 */
export const MAX_COURT_BY_SEGMENT: Record<number, number> = {
  1: 0, // STF - Não tem limite (processo originário)
  2: 0, // CNJ - Não tem limite (processo originário)
  3: 0, // STJ - Não tem limite (processo originário)
  4: 5, // TRF - 5 regiões
  5: 24, // TRT - 24 regiões
  6: 27, // TRE - 27 unidades federativas
  7: 12, // STM - 12 circunscrições
  8: 27, // TJ - 27 unidades federativas
  9: 3, // TJM - 3 estados (MG, RS, SP)
}
