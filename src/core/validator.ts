import { ValidationResult } from '../types/analysis'
import { CNJValidationError } from '../types/errors'
import { decomposeCNJ } from './decomposer'

/**
 * Constantes para cálculo do dígito verificador
 */
const MOD = 97n
const SUB = 98n

/**
 * Valida um número CNJ completo
 * @param cnj Número CNJ no formato NNNNNNN-DD.AAAA.J.CT.0000 ou NNNNNNNDDAAAAJCT0000
 * @returns Resultado da validação
 */
export function validateCNJ(cnj: string): ValidationResult {
  try {
    const decomposed = decomposeCNJ(cnj)
    const expectedDigit = calculateVerifyingDigit(decomposed.argNumber)
    const isValid = decomposed.verifyingDigit === expectedDigit

    return {
      isValid,
      expectedDigit,
      receivedDigit: decomposed.verifyingDigit,
      error: isValid
        ? undefined
        : `Dígito verificador inválido. Esperado: ${expectedDigit}, Recebido: ${decomposed.verifyingDigit}`,
    }
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido na validação',
    }
  }
}

/**
 * Valida apenas se o formato do CNJ está correto (sem verificar dígito)
 * @param cnj Número CNJ a ser validado
 * @returns true se o formato está correto
 */
export function validateCNJFormat(cnj: string): boolean {
  try {
    decomposeCNJ(cnj)
    return true
  } catch {
    return false
  }
}

/**
 * Calcula o dígito verificador para um número CNJ
 * @param argNumber Número de argumento (NNNNNNNAAAAJCT0000 + "00")
 * @returns Dígito verificador de 2 dígitos
 */
export function calculateVerifyingDigit(argNumber: string): string {
  try {
    const number = BigInt(argNumber)
    const remainder = number % MOD
    const digit = SUB - remainder

    return digit.toString().padStart(2, '0')
  } catch {
    throw new CNJValidationError(
      'CALCULATION_ERROR' as any,
      'Erro no cálculo do dígito verificador',
      'CALC_ERROR',
      { argNumber },
    )
  }
}

/**
 * Verifica se um CNJ é válido de forma mais rápida (apenas booleano)
 * @param cnj Número CNJ a ser validado
 * @returns true se válido, false se inválido
 */
export function isValidCNJ(cnj: string): boolean {
  return validateCNJ(cnj).isValid
}

/**
 * Normaliza um número CNJ removendo caracteres não numéricos
 * @param cnj CNJ a ser normalizado
 * @returns CNJ apenas com números
 */
export function normalizeCNJ(cnj: string): string {
  return cnj.replace(/\D/g, '')
}

/**
 * Formata um número CNJ não formatado
 * @param cnj CNJ com 20 dígitos
 * @returns CNJ formatado (NNNNNNN-DD.AAAA.J.CT.0000)
 */
export function formatCNJ(cnj: string): string {
  const normalized = normalizeCNJ(cnj)

  if (normalized.length !== 20) {
    throw CNJValidationError.invalidLength(cnj, 20)
  }

  const lawsuit = normalized.substring(0, 7)
  const digit = normalized.substring(7, 9)
  const year = normalized.substring(9, 13)
  const segment = normalized.substring(13, 14)
  const court = normalized.substring(14, 16)
  const unit = normalized.substring(16, 20)

  return `${lawsuit}-${digit}.${year}.${segment}.${court}.${unit}`
}

/**
 * Detecta o formato de um CNJ
 * @param cnj CNJ a ser analisado
 * @returns 'formatted', 'unformatted' ou 'invalid'
 */
export function detectCNJFormat(
  cnj: string,
): 'formatted' | 'unformatted' | 'invalid' {
  const normalized = normalizeCNJ(cnj)

  if (normalized.length !== 20) {
    return 'invalid'
  }

  // Verifica se tem formatação (hífen e pontos)
  if (cnj.includes('-') && cnj.includes('.')) {
    return 'formatted'
  }

  // Se tem apenas números, é não formatado
  if (/^\d{20}$/.test(cnj)) {
    return 'unformatted'
  }

  return 'invalid'
}
