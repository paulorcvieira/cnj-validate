import { analyzeCNJ } from '../core/analyzer'
import { AnalysisCNJ, CSVOptions } from '../types/analysis'
import { generateCSV, processCSV } from './processor'

/**
 * Processa arquivo CNJ e gera arquivo de saída
 *
 * ⚠️ ATENÇÃO: Esta função funciona apenas no Node.js (servidor)
 * Não pode ser usada em ambientes browser/frontend
 *
 * @param inputFilePath Caminho do arquivo de entrada
 * @param outputFilePath Caminho do arquivo de saída (opcional)
 * @param options Opções de processamento
 * @returns Resultado do processamento com estatísticas
 */
export async function processFile(
  inputFilePath: string,
  outputFilePath?: string,
  options: CSVOptions & { generateStats?: boolean } = {},
): Promise<{
  inputFile: string
  outputFile: string
  processingResult: ReturnType<typeof processCSV>
  analyses: AnalysisCNJ[]
  statistics: {
    totalCNJs: number
    validCNJs: number
    invalidCNJs: number
    errorCount: number
    processingTime: number
  }
}> {
  // Verificação de ambiente
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    throw new Error(
      'processFile() só funciona no Node.js. Use processCSV() para ambientes browser.',
    )
  }

  const fs = await import('fs/promises')
  const path = await import('path')

  // Extrai opções com valores padrão
  const { separator = ',', includeHeader = true, encoding = 'utf8' } = options

  // Usa performance.now() se disponível para maior precisão
  const startTime =
    typeof performance !== 'undefined' ? performance.now() : Date.now()

  // Lê o arquivo de entrada usando encoding especificado
  const fileContent = await fs.readFile(
    inputFilePath,
    encoding as BufferEncoding,
  )

  // Processa o conteúdo usando a função existente
  const processingResult = processCSV(fileContent, { separator })

  // Processa CNJs para gerar análises completas
  const lines = fileContent.split('\n').filter((line) => line.trim())
  const analyses: AnalysisCNJ[] = []

  lines.forEach((line) => {
    const cnj = line.split(separator)[0]?.trim()
    if (cnj) {
      try {
        const analysis = analyzeCNJ(cnj)
        analyses.push(analysis)
      } catch (error) {
        // Para CNJs com erro, cria análise básica
        analyses.push({
          receivedCNJ: cnj,
          validCNJ: false,
          segmentName: 'ERRO',
          segmentShort: 'ERRO',
          sourceUnitType: 'ERRO',
          sourceUnitNumber: '',
          courtType: 'ERRO',
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
    }
  })

  // Gera arquivo de saída
  const outputPath =
    outputFilePath ||
    path.join(
      path.dirname(inputFilePath),
      `${path.basename(
        inputFilePath,
        path.extname(inputFilePath),
      )}_processed.csv`,
    )

  const csvOutput = generateCSV(analyses, includeHeader)
  await fs.writeFile(outputPath, csvOutput, encoding as BufferEncoding)

  // Calcula tempo de processamento com a mesma medida usada no início
  const endTime =
    typeof performance !== 'undefined' ? performance.now() : Date.now()
  const processingTime = Math.max(1, Math.round(endTime - startTime)) // Garante mínimo de 1ms

  // Prepara estatísticas
  const statistics = {
    totalCNJs: processingResult.totalProcessed,
    validCNJs: processingResult.validCount,
    invalidCNJs: processingResult.invalidCount,
    errorCount: processingResult.errors.length,
    processingTime,
  }

  return {
    inputFile: inputFilePath,
    outputFile: outputPath,
    processingResult,
    analyses,
    statistics,
  }
}

/**
 * Verifica se a funcionalidade de arquivo está disponível
 * @returns true se funcionalidades de arquivo estão disponíveis (Node.js)
 */
export function isFileProcessingAvailable(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    !('window' in globalThis) &&
    typeof process !== 'undefined'
  )
}
