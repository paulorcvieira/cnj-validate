/**
 * Utilitários para formatação de dados CNJ
 */

/**
 * Formata número CNJ com máscara
 * @param cnj CNJ sem formatação (20 dígitos)
 * @returns CNJ formatado NNNNNNN-DD.AAAA.J.CT.0000
 */
export function formatCNJWithMask(cnj: string): string {
  const clean = cnj.replace(/\D/g, '')

  if (clean.length !== 20) {
    throw new Error('CNJ deve ter exatamente 20 dígitos')
  }

  return `${clean.slice(0, 7)}-${clean.slice(7, 9)}.${clean.slice(
    9,
    13,
  )}.${clean.slice(13, 14)}.${clean.slice(14, 16)}.${clean.slice(16, 20)}`
}

/**
 * Remove formatação de um CNJ
 * @param cnj CNJ formatado ou não
 * @returns CNJ apenas com números
 */
export function removeCNJMask(cnj: string): string {
  return cnj.replace(/\D/g, '')
}

/**
 * Formata data no padrão brasileiro
 * @param date Data a ser formatada
 * @returns Data no formato DD/MM/AAAA
 */
export function formatBrazilianDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

/**
 * Formata timestamp para string legível
 * @param timestamp Timestamp em millisegundos
 * @returns String formatada
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR')
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param text Texto a ser formatado
 * @returns Texto com primeiras letras maiúsculas
 */
export function capitalizeWords(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Formata número de processo para exibição
 * @param lawsuitNumber Número do processo (7 dígitos)
 * @returns Número formatado
 */
export function formatLawsuitNumber(lawsuitNumber: string): string {
  if (lawsuitNumber.length !== 7) {
    return lawsuitNumber
  }

  return `${lawsuitNumber.slice(0, 7)}`
}

/**
 * Formata ano de protocolo
 * @param year Ano (4 dígitos)
 * @returns Ano formatado
 */
export function formatProtocolYear(year: string): string {
  return year
}

/**
 * Formata tamanho de arquivo em bytes para string legível
 * @param bytes Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  )

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Formata porcentagem
 * @param value Valor decimal (0-1)
 * @param decimals Número de casas decimais
 * @returns Porcentagem formatada
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Formata duração em millisegundos para string legível
 * @param ms Duração em millisegundos
 * @returns String formatada (ex: "2m 30s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}h ${remainingMinutes}m`
}
