/**
 * Tipos de erros específicos para validação CNJ
 */
export enum CNJErrorType {
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_VERIFYING_DIGIT = 'INVALID_VERIFYING_DIGIT',
  INVALID_SEGMENT = 'INVALID_SEGMENT',
  INVALID_COURT = 'INVALID_COURT',
  INVALID_SOURCE_UNIT = 'INVALID_SOURCE_UNIT',
  INVALID_YEAR = 'INVALID_YEAR',
  DISTRICT_NOT_FOUND = 'DISTRICT_NOT_FOUND',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
}

/**
 * Classe de erro específica para validação CNJ
 */
export class CNJValidationError extends Error {
  public readonly type: CNJErrorType
  public readonly code: string
  public readonly details?: Record<string, any>

  constructor(
    type: CNJErrorType,
    message: string,
    code?: string,
    details?: Record<string, any>,
  ) {
    super(message)
    this.name = 'CNJValidationError'
    this.type = type
    this.code = code || type
    this.details = details
  }

  /**
   * Cria erro para formato inválido
   */
  static invalidFormat(received: string): CNJValidationError {
    return new CNJValidationError(
      CNJErrorType.INVALID_FORMAT,
      `Formato CNJ inválido: ${received}. Esperado: NNNNNNN-DD.AAAA.J.CT.0000 ou NNNNNNNDDAAAAJCT0000`,
      'INVALID_FORMAT',
      { received },
    )
  }

  /**
   * Cria erro para tamanho inválido
   */
  static invalidLength(
    received: string,
    expectedLength: number,
  ): CNJValidationError {
    return new CNJValidationError(
      CNJErrorType.INVALID_LENGTH,
      `Tamanho CNJ inválido: ${received.length}. Esperado: ${expectedLength} caracteres`,
      'INVALID_LENGTH',
      { received, receivedLength: received.length, expectedLength },
    )
  }

  /**
   * Cria erro para dígito verificador inválido
   */
  static invalidVerifyingDigit(
    received: string,
    expected: string,
  ): CNJValidationError {
    return new CNJValidationError(
      CNJErrorType.INVALID_VERIFYING_DIGIT,
      `Dígito verificador inválido. Recebido: ${received}, Esperado: ${expected}`,
      'INVALID_VERIFYING_DIGIT',
      { received, expected },
    )
  }

  /**
   * Cria erro para segmento inválido
   */
  static invalidSegment(segment: string): CNJValidationError {
    return new CNJValidationError(
      CNJErrorType.INVALID_SEGMENT,
      `Código de segmento inválido: ${segment}. Deve ser entre 1 e 9`,
      'INVALID_SEGMENT',
      { segment },
    )
  }

  /**
   * Cria erro para tribunal inválido
   */
  static invalidCourt(court: string, segment: number): CNJValidationError {
    return new CNJValidationError(
      CNJErrorType.INVALID_COURT,
      `Código de tribunal inválido: ${court} para segmento ${segment}`,
      'INVALID_COURT',
      { court, segment },
    )
  }

  /**
   * Cria erro para distrito não encontrado
   */
  static districtNotFound(key: string): CNJValidationError {
    return new CNJValidationError(
      CNJErrorType.DISTRICT_NOT_FOUND,
      `Distrito não encontrado para chave: ${key}`,
      'DISTRICT_NOT_FOUND',
      { key },
    )
  }
}
