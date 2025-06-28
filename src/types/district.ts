/**
 * Informações sobre distrito/comarca onde o processo foi iniciado
 */
export interface DistrictInfo {
  /** Nome da unidade de origem (comarca, cidade, etc.) */
  sourceUnit: string
  /** Sigla da Unidade Federativa */
  uf: string
  /** Nome completo do distrito/estado */
  district: string
}

/**
 * Chave para busca de distrito no formato: segment.court.sourceUnit
 */
export type DistrictKey = string

/**
 * Mapa de distritos indexado por chave
 */
export type DistrictMap = Record<DistrictKey, DistrictInfo>

/**
 * Estados brasileiros com suas siglas
 */
export enum BrazilianStates {
  AC = 'Acre',
  AL = 'Alagoas',
  AP = 'Amapá',
  AM = 'Amazonas',
  BA = 'Bahia',
  CE = 'Ceará',
  DF = 'Distrito Federal',
  ES = 'Espírito Santo',
  GO = 'Goiás',
  MA = 'Maranhão',
  MT = 'Mato Grosso',
  MS = 'Mato Grosso do Sul',
  MG = 'Minas Gerais',
  PA = 'Pará',
  PB = 'Paraíba',
  PR = 'Paraná',
  PE = 'Pernambuco',
  PI = 'Piauí',
  RJ = 'Rio de Janeiro',
  RN = 'Rio Grande do Norte',
  RS = 'Rio Grande do Sul',
  RO = 'Rondônia',
  RR = 'Roraima',
  SC = 'Santa Catarina',
  SP = 'São Paulo',
  SE = 'Sergipe',
  TO = 'Tocantins',
}

/**
 * Códigos de tribunais militares estaduais
 */
export enum MilitaryCourtCodes {
  MG = 13, // Minas Gerais
  RS = 21, // Rio Grande do Sul
  SP = 26, // São Paulo
}
