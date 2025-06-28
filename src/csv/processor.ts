import { analyzeCNJ } from '../core/analyzer'
import { AnalysisCNJ, CSVOptions, CSVProcessingResult } from '../types/analysis'

/**
 * Processa arquivo CSV com números CNJ
 * @param csvContent Conteúdo do arquivo CSV
 * @param options Opções de processamento
 * @returns Resultado do processamento
 */
export function processCSV(
  csvContent: string,
  options: CSVOptions = {},
): CSVProcessingResult {
  const { separator = ',' } = options

  const lines = csvContent.split('\n').filter((line) => line.trim())
  const results: AnalysisCNJ[] = []
  const errors: Array<{ line: number; cnj: string; error: string }> = []

  lines.forEach((line, index) => {
    const cnj = line.split(separator)[0]?.trim()

    if (!cnj) {
      errors.push({
        line: index + 1,
        cnj: line,
        error: 'Linha vazia ou CNJ não encontrado',
      })
      return
    }

    try {
      const analysis = analyzeCNJ(cnj)
      results.push(analysis)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'
      errors.push({
        line: index + 1,
        cnj,
        error: errorMessage,
      })

      // Adiciona resultado com erro para manter consistência
      results.push({
        receivedCNJ: cnj,
        validCNJ: false,
        segmentName: errorMessage,
        segmentShort: 'ERRO',
        sourceUnitType: errorMessage,
        sourceUnitNumber: '',
        courtType: errorMessage,
        courtNumber: '',
        detailed: {
          lawsuitCNJFormat: '',
          lawsuitNumber: '',
          verifyingDigit: '',
          protocolYear: '',
          segment: '',
          court: '',
          sourceUnit: '',
          argNumber: '',
          district: '',
          uf: '',
          tj: '',
        },
      })
    }
  })

  const validCount = results.filter((r) => r.validCNJ).length
  const invalidCount = results.length - validCount

  return {
    totalProcessed: lines.length,
    validCount,
    invalidCount,
    errors,
  }
}

/**
 * Gera conteúdo CSV a partir de análises CNJ
 * @param analyses Array de análises
 * @param includeHeader Se deve incluir cabeçalho
 * @returns Conteúdo CSV formatado
 */
export function generateCSV(
  analyses: AnalysisCNJ[],
  includeHeader: boolean = true,
): string {
  const headers = [
    'CNJ_original',
    'CNJ_é_válido',
    'Segmento',
    'Segmento_short',
    'Tipo_Unidade_Judiciária',
    'Número_Unidade_Judiciária',
    'Nome_Unidade_Judiciária',
    'Tipo_Região',
    'Número_Região',
    'Nome_Região',
    'Número_Processo',
    'Dígito_Verificador',
    'Ano_Protocolo',
    'Poder_Judiciário',
    'Região',
    'Unidade_Judiciária',
  ]

  const rows = analyses.map((analysis) => [
    analysis.receivedCNJ,
    analysis.validCNJ ? 'true' : 'false',
    analysis.segmentName,
    analysis.segmentShort,
    analysis.sourceUnitType,
    analysis.sourceUnitNumber,
    analysis.detailed.district,
    analysis.courtType,
    analysis.courtNumber,
    analysis.detailed.uf,
    analysis.detailed.lawsuitNumber,
    analysis.detailed.verifyingDigit,
    analysis.detailed.protocolYear,
    analysis.detailed.segment,
    analysis.detailed.court,
    analysis.detailed.sourceUnit,
  ])

  const lines: string[] = []

  if (includeHeader) {
    lines.push(headers.join(','))
  }

  rows.forEach((row) => {
    const escapedRow = row.map((cell) => {
      // Escapa células que contêm vírgulas ou aspas
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    })
    lines.push(escapedRow.join(','))
  })

  return lines.join('\n')
}

/**
 * Processa array de CNJs em lote
 * @param cnjs Array de números CNJ
 * @returns Resultado do processamento
 */
export function processCNJBatch(cnjs: string[]): CSVProcessingResult {
  const results: AnalysisCNJ[] = []
  const errors: Array<{ line: number; cnj: string; error: string }> = []

  cnjs.forEach((cnj, index) => {
    try {
      const analysis = analyzeCNJ(cnj.trim())
      results.push(analysis)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'
      errors.push({
        line: index + 1,
        cnj,
        error: errorMessage,
      })
    }
  })

  const validCount = results.filter((r) => r.validCNJ).length
  const invalidCount = results.length - validCount

  return {
    totalProcessed: cnjs.length,
    validCount,
    invalidCount,
    errors,
  }
}

/**
 * Valida formato de arquivo CSV
 * @param content Conteúdo do arquivo
 * @param separator Separador esperado
 * @returns true se válido
 */
export function validateCSVFormat(
  content: string,
  separator: string = ',',
): boolean {
  if (!content || content.trim().length === 0) {
    return false
  }

  const lines = content.split('\n').filter((line) => line.trim())

  if (lines.length === 0) {
    return false
  }

  // Verifica se todas as linhas têm pelo menos uma coluna
  return lines.every((line) => {
    const fields = line.split(separator)
    return fields.length > 0 && fields[0].trim().length > 0
  })
}
