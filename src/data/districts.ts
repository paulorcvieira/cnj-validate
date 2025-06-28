import { DistrictInfo, DistrictMap } from '../types/district'
import districtsData from './districts.json'

/**
 * Base de dados completa de distritos/comarcas brasileiras
 * Convertida com 9.803 distritos
 * Cobrindo todos os 27 estados brasileiros
 */
export const DISTRICTS: DistrictMap = districtsData

/**
 * Busca informações de distrito por chave
 */
export function getDistrictInfo(key: string): DistrictInfo | null {
  return DISTRICTS[key] || null
}

/**
 * Gera chave de distrito no formato: segment.court.sourceUnit
 */
export function generateDistrictKey(
  segment: string,
  court: string,
  sourceUnit: string,
): string {
  return `${segment}.${court}.${sourceUnit}`
}

/**
 * Busca distritos por UF
 */
export function getDistrictsByUF(uf: string): DistrictInfo[] {
  return Object.keys(DISTRICTS)
    .map((key) => DISTRICTS[key])
    .filter((district) => district.uf === uf.toUpperCase())
}

/**
 * Busca distritos por segmento
 */
export function getDistrictsBySegment(segment: string): DistrictInfo[] {
  return Object.keys(DISTRICTS)
    .filter((key) => key.startsWith(`${segment}.`))
    .map((key) => DISTRICTS[key])
}

/**
 * Adiciona novo distrito à base (para extensão futura)
 */
export function addDistrict(key: string, district: DistrictInfo): void {
  DISTRICTS[key] = district
}

/**
 * Verifica se existe distrito para uma chave
 */
export function hasDistrict(key: string): boolean {
  return key in DISTRICTS
}

/**
 * Estatísticas da base de dados
 */
export function getDistrictsStats() {
  const keys = Object.keys(DISTRICTS)
  const ufs = new Set(Object.values(DISTRICTS).map((d) => d.uf))

  return {
    totalDistricts: keys.length,
    totalStates: ufs.size,
    states: Array.from(ufs).sort(),
    segmentCounts: keys.reduce((acc, key) => {
      const segment = key.split('.')[0]
      acc[segment] = (acc[segment] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}
