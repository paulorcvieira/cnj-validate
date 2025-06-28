/**
 * Estrutura principal de análise CNJ contendo todas as informações processadas
 *
 * @description
 * Interface completa que retorna análise detalhada de um número CNJ,
 * incluindo validação, decomposição e informações jurisdicionais.
 *
 * @example
 * ```typescript
 * import { analyzeCNJ, AnalysisCNJ } from 'cnj-validate'
 *
 * const analysis: AnalysisCNJ = analyzeCNJ('0001327-64.2018.8.26.0158')
 * console.log(analysis.segmentName) // "Justiça dos Estados..."
 * console.log(analysis.detailed.district) // "São Paulo"
 * ```
 */
export interface AnalysisCNJ {
  /** CNJ original recebido para análise */
  readonly receivedCNJ: string
  /** Indica se o CNJ possui dígito verificador válido */
  readonly validCNJ: boolean
  /** Nome completo do segmento do Poder Judiciário */
  readonly segmentName: string
  /** Nome curto/sigla do segmento */
  readonly segmentShort: string
  /** Tipo da unidade de origem (foro, vara, etc.) */
  readonly sourceUnitType: string
  /** Número da unidade de origem */
  readonly sourceUnitNumber: string
  /** Tipo do tribunal de origem */
  readonly courtType: string
  /** Número/código do tribunal de origem */
  readonly courtNumber: string
  /** Informações detalhadas decompostas do CNJ */
  readonly detailed: DecomposedCNJ
}

/**
 * CNJ decomosto em seus componentes individuais
 * Formato: [NNNNNNN]-[DD].[AAAA].[J].[CT].[0000]
 */
export interface DecomposedCNJ {
  /** CNJ no formato completo padronizado */
  lawsuitCNJFormat: string
  /** Número sequencial do processo (NNNNNNN) */
  lawsuitNumber: string
  /** Dígito verificador (DD) */
  verifyingDigit: string
  /** Ano de protocolo do processo (AAAA) */
  protocolYear: string
  /** Código do segmento do Poder Judiciário (J) */
  segment: string
  /** Código do tribunal (CT) */
  court: string
  /** Código da unidade de origem (0000) */
  sourceUnit: string
  /** Número de argumento para cálculo do dígito verificador */
  argNumber: string
  /** Nome do distrito/comarca onde o processo foi proposto */
  district: string
  /** Sigla da Unidade Federativa */
  uf: string
  /** Sigla do tribunal (TJ, STJ, TRF, etc.) */
  tj: string
}

/**
 * Resultado de validação simples
 *
 * @example
 * ```typescript
 * const result: ValidationResult = validateCNJ('0001327-64.2018.8.26.0158')
 * if (result.isValid) {
 *   console.log('CNJ válido!')
 * } else {
 *   console.log(`Erro: ${result.error}`)
 * }
 * ```
 */
export interface ValidationResult {
  /** Indica se o CNJ é válido */
  readonly isValid: boolean
  /** Dígito verificador esperado (quando calculável) */
  readonly expectedDigit?: string
  /** Dígito verificador recebido no CNJ */
  readonly receivedDigit?: string
  /** Mensagem de erro se inválido */
  readonly error?: string
  /** Código do erro (para tratamento programático) */
  readonly errorCode?: string
}

/**
 * Opções para processamento CSV
 *
 * @example
 * ```typescript
 * const options: CSVOptions = {
 *   separator: ';',
 *   includeHeader: true,
 *   encoding: 'utf8'
 * }
 * await processFile('input.csv', 'output.csv', options)
 * ```
 */
export interface CSVOptions {
  /** Separador de campos (padrão: ',') */
  readonly separator?: ',' | ';' | '\t' | '|'
  /** Inclui cabeçalho no arquivo de saída (padrão: true) */
  readonly includeHeader?: boolean
  /** Nome do arquivo de saída (opcional) */
  readonly outputFileName?: string
  /** Codificação do arquivo (padrão: 'utf8') */
  readonly encoding?: 'utf8' | 'latin1' | 'ascii'
}

/**
 * Erro encontrado durante processamento CSV
 */
export interface CSVProcessingError {
  /** Número da linha onde ocorreu o erro */
  readonly line: number
  /** CNJ que causou o erro */
  readonly cnj: string
  /** Descrição do erro */
  readonly error: string
  /** Tipo do erro (opcional) */
  readonly type?: string
}

/**
 * Estatísticas de processamento CSV
 */
export interface CSVStatistics {
  /** Total de registros processados */
  readonly totalProcessed: number
  /** Número de CNJs válidos */
  readonly validCount: number
  /** Número de CNJs inválidos */
  readonly invalidCount: number
  /** Tempo de processamento em milissegundos */
  readonly processingTimeMs: number
  /** Taxa de sucesso (0-1) */
  readonly successRate: number
  /** CNJs processados por segundo */
  readonly throughputPerSecond: number
}

/**
 * Resultado de processamento CSV (versão compatível)
 *
 * @example
 * ```typescript
 * const result: CSVProcessingResult = processCSV(content)
 * console.log(`Processados: ${result.totalProcessed}`)
 * console.log(`Válidos: ${result.validCount}`)
 * ```
 */
export interface CSVProcessingResult {
  /** Total de registros processados */
  readonly totalProcessed: number
  /** Número de CNJs válidos */
  readonly validCount: number
  /** Número de CNJs inválidos */
  readonly invalidCount: number
  /** Lista de erros encontrados */
  readonly errors: readonly CSVProcessingError[]
  /** Caminho do arquivo de saída gerado */
  readonly outputPath?: string
}

/**
 * Resultado avançado de processamento CSV com estatísticas detalhadas
 *
 * @example
 * ```typescript
 * const result: CSVProcessingResultAdvanced = await processFileAdvanced('data.csv')
 * console.log(`Taxa de sucesso: ${(result.statistics.successRate * 100).toFixed(1)}%`)
 * console.log(`Velocidade: ${result.statistics.throughputPerSecond} CNJs/segundo`)
 * ```
 */
export interface CSVProcessingResultAdvanced {
  /** Estatísticas detalhadas do processamento */
  readonly statistics: CSVStatistics
  /** Lista de erros encontrados */
  readonly errors: readonly CSVProcessingError[]
  /** Caminho do arquivo de saída gerado */
  readonly outputPath?: string
  /** Indica se o processamento foi bem-sucedido */
  readonly success: boolean
  /** Resultado base para compatibilidade */
  readonly base: CSVProcessingResult
}

/**
 * Formatos de entrada aceitos para CNJ
 */
export type CNJFormat =
  | 'formatted' // 0001327-64.2018.8.26.0158
  | 'unformatted' // 00013276420188260158
  | 'mixed' // Aceita ambos

/**
 * Tipo de retorno para funções que podem falhar
 *
 * @template T Tipo dos dados de sucesso
 * @template E Tipo do erro
 */
export type Result<T, E = Error> =
  | {
      readonly success: true
      readonly data: T
    }
  | {
      readonly success: false
      readonly error: E
    }

/**
 * Tipos utilitários para trabalhar com CNJs
 */
export namespace CNJTypes {
  /** String representando um CNJ válido */
  export type ValidCNJ = string & { readonly __brand: 'ValidCNJ' }

  /** String representando um CNJ formatado */
  export type FormattedCNJ = string & { readonly __brand: 'FormattedCNJ' }

  /** String representando um CNJ sem formatação */
  export type UnformattedCNJ = string & { readonly __brand: 'UnformattedCNJ' }

  /** Ano válido para protocolo (1998-atual) */
  export type ProtocolYear = number & { readonly __brand: 'ProtocolYear' }

  /** Código de segmento válido (1-9) */
  export type SegmentCode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

  /** Dígito verificador válido (00-99) */
  export type VerifyingDigit = string & { readonly __brand: 'VerifyingDigit' }
}

/**
 * Configurações de validação
 *
 * @example
 * ```typescript
 * const config: ValidationConfig = {
 *   strictMode: true,
 *   validateYear: true,
 *   minYear: 1998
 * }
 * ```
 */
export interface ValidationConfig {
  /** Modo estrito de validação */
  readonly strictMode?: boolean
  /** Permitir entrada formatada */
  readonly allowFormattedInput?: boolean
  /** Permitir entrada sem formatação */
  readonly allowUnformattedInput?: boolean
  /** Validar ano do protocolo */
  readonly validateYear?: boolean
  /** Ano mínimo aceito */
  readonly minYear?: number
  /** Ano máximo aceito */
  readonly maxYear?: number
}

/**
 * Resultado de análise em lote
 */
export interface BatchAnalysisResult {
  /** CNJs processados com sucesso */
  readonly successful: readonly AnalysisCNJ[]
  /** CNJs que falharam na análise */
  readonly failed: readonly {
    readonly cnj: string
    readonly error: string
    readonly index: number
  }[]
  /** Estatísticas do processamento */
  readonly statistics: {
    readonly total: number
    readonly successful: number
    readonly failed: number
    readonly successRate: number
  }
}
