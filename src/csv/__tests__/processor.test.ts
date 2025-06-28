/**
 * Comprehensive tests for CSV processor module
 */

import {
  generateCSV,
  processCNJBatch,
  processCSV,
  processFile,
  validateCSVFormat,
} from '../processor'

describe('CSV Processor', () => {
  const validCNJ1 = '0001327-64.2018.8.26.0158'
  const validCNJ2 = '0001328-12.2019.8.26.0159'
  const invalidCNJ = '0001327-65.2018.8.26.0158'
  const malformedCNJ = 'invalid-cnj'

  describe('processCSV', () => {
    test('should process CSV with valid CNJs', () => {
      const csvContent = `${validCNJ1}\n${validCNJ2}`
      const result = processCSV(csvContent)

      expect(result.totalProcessed).toBe(2)
      expect(result.validCount).toBe(2)
      expect(result.invalidCount).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle CSV with mixed valid and invalid CNJs', () => {
      const csvContent = `${validCNJ1}\n${invalidCNJ}\n${malformedCNJ}`
      const result = processCSV(csvContent)

      expect(result.totalProcessed).toBe(3)
      expect(result.validCount).toBe(1)
      expect(result.invalidCount).toBe(2)
      expect(result.errors).toHaveLength(1) // Only malformed CNJs cause errors, invalid ones are processed but marked invalid
    })

    test('should handle empty lines', () => {
      const csvContent = `${validCNJ1}\n\n${validCNJ2}`
      const result = processCSV(csvContent)

      expect(result.totalProcessed).toBe(2) // Empty lines should be filtered
      expect(result.validCount).toBe(2)
    })

    test('should handle custom separator', () => {
      const csvContent = `${validCNJ1};extra data\n${validCNJ2};more data`
      const result = processCSV(csvContent, { separator: ';' })

      expect(result.totalProcessed).toBe(2)
      expect(result.validCount).toBe(2)
    })

    test('should handle completely empty CSV', () => {
      const result = processCSV('')
      expect(result.totalProcessed).toBe(0)
      expect(result.validCount).toBe(0)
      expect(result.invalidCount).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle lines with missing CNJ', () => {
      const csvContent = `${validCNJ1}\n,missing_cnj\n${validCNJ2}`
      const result = processCSV(csvContent)

      expect(
        result.errors.some((e) => e.error.includes('não encontrado')),
      ).toBe(true)
    })
  })

  describe('generateCSV', () => {
    test('should generate CSV with header', () => {
      const mockAnalysis = {
        receivedCNJ: validCNJ1,
        validCNJ: true,
        segmentName: 'State Court',
        segmentShort: 'TJ',
        sourceUnitType: 'Civil Court',
        sourceUnitNumber: '0158',
        courtType: 'Estate',
        courtNumber: '26',
        detailed: {
          lawsuitCNJFormat: validCNJ1,
          lawsuitNumber: '0001327',
          verifyingDigit: '64',
          protocolYear: '2018',
          segment: '8',
          court: '26',
          sourceUnit: '0158',
          argNumber: '000132720188260158100',
          district: 'São Paulo',
          uf: 'SP',
          tj: 'TJ26',
        },
      }

      const csv = generateCSV([mockAnalysis], true)
      const lines = csv.split('\n')

      expect(lines[0]).toContain('CNJ_original')
      expect(lines[0]).toContain('CNJ_é_válido')
      expect(lines[1]).toContain(validCNJ1)
      expect(lines[1]).toContain('true')
    })

    test('should generate CSV without header', () => {
      const mockAnalysis = {
        receivedCNJ: validCNJ1,
        validCNJ: true,
        segmentName: 'State Court',
        segmentShort: 'TJ',
        sourceUnitType: 'Civil Court',
        sourceUnitNumber: '0158',
        courtType: 'Estate',
        courtNumber: '26',
        detailed: {
          lawsuitCNJFormat: validCNJ1,
          lawsuitNumber: '0001327',
          verifyingDigit: '64',
          protocolYear: '2018',
          segment: '8',
          court: '26',
          sourceUnit: '0158',
          argNumber: '000132720188260158100',
          district: 'São Paulo',
          uf: 'SP',
          tj: 'TJ26',
        },
      }

      const csv = generateCSV([mockAnalysis], false)
      const lines = csv.split('\n')

      expect(lines[0]).toContain(validCNJ1) // First line should be data, not header
      expect(lines[0]).not.toContain('CNJ_original')
    })

    test('should escape special characters', () => {
      const mockAnalysis = {
        receivedCNJ: validCNJ1,
        validCNJ: true,
        segmentName: 'Court, with comma',
        segmentShort: 'TJ',
        sourceUnitType: 'Civil "Court"',
        sourceUnitNumber: '0158',
        courtType: 'Estate',
        courtNumber: '26',
        detailed: {
          lawsuitCNJFormat: validCNJ1,
          lawsuitNumber: '0001327',
          verifyingDigit: '64',
          protocolYear: '2018',
          segment: '8',
          court: '26',
          sourceUnit: '0158',
          argNumber: '000132720188260158100',
          district: 'São Paulo',
          uf: 'SP',
          tj: 'TJ26',
        },
      }

      const csv = generateCSV([mockAnalysis], true)

      expect(csv).toContain('"Court, with comma"')
      expect(csv).toContain('"Civil ""Court"""')
    })

    test('should handle empty analysis array', () => {
      const csv = generateCSV([], true)
      const lines = csv.split('\n')

      expect(lines).toHaveLength(1) // Only header
      expect(lines[0]).toContain('CNJ_original')
    })
  })

  describe('processCNJBatch', () => {
    test('should process batch of valid CNJs', () => {
      const cnjs = [validCNJ1, validCNJ2]
      const result = processCNJBatch(cnjs)

      expect(result.totalProcessed).toBe(2)
      expect(result.validCount).toBe(2)
      expect(result.invalidCount).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle batch with invalid CNJs', () => {
      const cnjs = [validCNJ1, invalidCNJ, malformedCNJ]
      const result = processCNJBatch(cnjs)

      expect(result.totalProcessed).toBe(3)
      expect(result.validCount).toBe(1)
      expect(result.invalidCount).toBe(1) // invalidCNJ is analyzed but marked invalid
      expect(result.errors).toHaveLength(1) // Only malformedCNJ causes an error
    })

    test('should handle empty batch', () => {
      const result = processCNJBatch([])
      expect(result.totalProcessed).toBe(0)
      expect(result.validCount).toBe(0)
      expect(result.invalidCount).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    test('should trim whitespace from CNJs', () => {
      const cnjs = [`  ${validCNJ1}  `, `\t${validCNJ2}\t`]
      const result = processCNJBatch(cnjs)

      expect(result.totalProcessed).toBe(2)
      expect(result.validCount).toBe(2)
    })
  })

  describe('validateCSVFormat', () => {
    test('should validate correct CSV format', () => {
      const validCsv = `${validCNJ1}\n${validCNJ2}`
      expect(validateCSVFormat(validCsv)).toBe(true)
    })

    test('should validate CSV with custom separator', () => {
      const validCsv = `${validCNJ1};data\n${validCNJ2};more`
      expect(validateCSVFormat(validCsv, ';')).toBe(true)
    })

    test('should reject empty CSV', () => {
      expect(validateCSVFormat('')).toBe(false)
      expect(validateCSVFormat('   ')).toBe(false)
    })

    test('should reject CSV with empty fields', () => {
      const invalidCsv = ',\n,'
      expect(validateCSVFormat(invalidCsv)).toBe(false)
    })

    test('should handle CSV with only whitespace lines', () => {
      const csvWithWhitespace = '   \n\t\n   '
      expect(validateCSVFormat(csvWithWhitespace)).toBe(false)
    })

    test('should validate CSV with mixed content', () => {
      const validCsv = `${validCNJ1},extra\n${validCNJ2}`
      expect(validateCSVFormat(validCsv)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    test('should handle very large CSV files (simulated)', () => {
      const largeCsvContent = Array(1000).fill(validCNJ1).join('\n')
      const result = processCSV(largeCsvContent)

      expect(result.totalProcessed).toBe(1000)
      expect(result.validCount).toBe(1000)
    })

    test('should handle CSV with special characters in data', () => {
      const specialContent = `${validCNJ1},"special,data"\n${validCNJ2},"more""quotes"`
      const result = processCSV(specialContent)

      expect(result.totalProcessed).toBe(2)
      expect(result.validCount).toBe(2)
    })

    test('should maintain error line numbers correctly', () => {
      const csvContent = `${validCNJ1}\n${malformedCNJ}\n${validCNJ2}\n${malformedCNJ}`
      const result = processCSV(csvContent)

      expect(result.errors).toHaveLength(2)
      expect(result.errors[0].line).toBe(2)
      expect(result.errors[1].line).toBe(4)
    })

    test('should handle different line endings', () => {
      const csvWithDifferentEndings = `${validCNJ1}\r\n${validCNJ2}\r${invalidCNJ}`
      const result = processCSV(csvWithDifferentEndings)

      expect(result.totalProcessed).toBeGreaterThanOrEqual(2)
    })
  })

  describe('processFile', () => {
    const fs = require('fs/promises')
    const path = require('path')
    const os = require('os')

    let tempDir: string
    let testInputFile: string
    let testOutputFile: string

    beforeEach(async () => {
      // Cria diretório temporário para testes
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cnj-processor-test-'))
      testInputFile = path.join(tempDir, 'test-input.csv')
      testOutputFile = path.join(tempDir, 'test-output.csv')
    })

    afterEach(async () => {
      // Limpa arquivos temporários
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (error) {
        // Ignora erros de limpeza
      }
    })

    test('should process file with valid CNJs and generate output', async () => {
      const csvContent = `${validCNJ1}\n${validCNJ2}`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile)

      expect(result.inputFile).toBe(testInputFile)
      expect(result.outputFile).toBe(testOutputFile)
      expect(result.statistics.totalCNJs).toBe(2)
      expect(result.statistics.validCNJs).toBe(2)
      expect(result.statistics.invalidCNJs).toBe(0)
      expect(result.statistics.errorCount).toBe(0)
      expect(result.statistics.processingTime).toBeGreaterThan(0)

      // Verifica se o arquivo de saída foi criado
      const outputExists = await fs
        .access(testOutputFile)
        .then(() => true)
        .catch(() => false)
      expect(outputExists).toBe(true)

      // Verifica conteúdo do arquivo de saída
      const outputContent = await fs.readFile(testOutputFile, 'utf-8')
      expect(outputContent).toContain('CNJ_original')
      expect(outputContent).toContain(validCNJ1)
      expect(outputContent).toContain(validCNJ2)
    })

    test('should handle mixed valid and invalid CNJs', async () => {
      const csvContent = `${validCNJ1}\n${invalidCNJ}\n${malformedCNJ}`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile)

      expect(result.statistics.totalCNJs).toBe(3)
      expect(result.statistics.validCNJs).toBe(1)
      expect(result.statistics.invalidCNJs).toBe(2)
      expect(result.statistics.errorCount).toBe(1) // Apenas malformedCNJ causa erro

      // Verifica se análises foram geradas
      expect(result.analyses).toHaveLength(3)
      expect(result.analyses[0].validCNJ).toBe(true)
      expect(result.analyses[1].validCNJ).toBe(false)
      expect(result.analyses[2].validCNJ).toBe(false)
    })

    test('should auto-generate output filename when not provided', async () => {
      const csvContent = validCNJ1
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile)

      const expectedOutputFile = path.join(tempDir, 'test-input_processed.csv')
      expect(result.outputFile).toBe(expectedOutputFile)

      // Verifica se arquivo foi criado com nome correto
      const outputExists = await fs
        .access(expectedOutputFile)
        .then(() => true)
        .catch(() => false)
      expect(outputExists).toBe(true)
    })

    test('should handle custom separator option', async () => {
      const csvContent = `${validCNJ1};extra data\n${validCNJ2};more data`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile, {
        separator: ';',
      })

      expect(result.statistics.totalCNJs).toBe(2)
      expect(result.statistics.validCNJs).toBe(2)

      // Verifica se processou apenas os CNJs, ignorando dados extras
      expect(result.analyses[0].receivedCNJ).toBe(validCNJ1)
      expect(result.analyses[1].receivedCNJ).toBe(validCNJ2)
    })

    test('should handle empty file', async () => {
      await fs.writeFile(testInputFile, '', 'utf-8')

      const result = await processFile(testInputFile, testOutputFile)

      expect(result.statistics.totalCNJs).toBe(0)
      expect(result.statistics.validCNJs).toBe(0)
      expect(result.statistics.invalidCNJs).toBe(0)
      expect(result.statistics.errorCount).toBe(0)
      expect(result.analyses).toHaveLength(0)

      // Arquivo de saída deve existir mas só com cabeçalho
      const outputContent = await fs.readFile(testOutputFile, 'utf-8')
      const lines = outputContent.trim().split('\n')
      expect(lines).toHaveLength(1) // Apenas cabeçalho
      expect(lines[0]).toContain('CNJ_original')
    })

    test('should handle file not found error', async () => {
      const nonExistentFile = path.join(tempDir, 'non-existent.csv')

      await expect(
        processFile(nonExistentFile, testOutputFile),
      ).rejects.toThrow()
    })

    test('should handle file without header option', async () => {
      const csvContent = validCNJ1
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile, {
        includeHeader: false,
      })

      expect(result.statistics.totalCNJs).toBe(1)

      // Verifica se arquivo não tem cabeçalho
      const outputContent = await fs.readFile(testOutputFile, 'utf-8')
      expect(outputContent).not.toContain('CNJ_original')
      expect(outputContent).toContain(validCNJ1)
    })

    test('should process large number of CNJs efficiently', async () => {
      // Cria arquivo com muitos CNJs
      const cnjs = Array(100).fill(validCNJ1)
      const csvContent = cnjs.join('\n')
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile)

      expect(result.statistics.totalCNJs).toBe(100)
      expect(result.statistics.validCNJs).toBe(100)
      expect(result.analyses).toHaveLength(100)
      expect(result.statistics.processingTime).toBeLessThan(5000) // Menos de 5 segundos
    })

    test('should respect encoding option when reading and writing files', async () => {
      const csvContent = `${validCNJ1}\n${validCNJ2}`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      // Testa encoding padrão (utf-8)
      const resultDefault = await processFile(testInputFile, testOutputFile)
      expect(resultDefault.statistics.totalCNJs).toBe(2)

      // Testa encoding específico
      const customOutputFile = path.join(tempDir, 'test-output-utf8.csv')
      const resultUtf8 = await processFile(testInputFile, customOutputFile, {
        encoding: 'utf8',
      })
      expect(resultUtf8.statistics.totalCNJs).toBe(2)

      // Verifica se arquivo foi criado
      const outputExists = await fs
        .access(customOutputFile)
        .then(() => true)
        .catch(() => false)
      expect(outputExists).toBe(true)
    })

    test('should respect includeHeader option correctly', async () => {
      const csvContent = validCNJ1
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      // Testa com cabeçalho (padrão)
      const resultWithHeader = await processFile(
        testInputFile,
        testOutputFile,
        {
          includeHeader: true,
        },
      )

      const outputWithHeader = await fs.readFile(testOutputFile, 'utf-8')
      const linesWithHeader = outputWithHeader.trim().split('\n')
      expect(linesWithHeader).toHaveLength(2) // Cabeçalho + 1 linha de dados
      expect(linesWithHeader[0]).toContain('CNJ_original')

      // Testa sem cabeçalho
      const outputFileNoHeader = path.join(tempDir, 'test-output-no-header.csv')
      const resultNoHeader = await processFile(
        testInputFile,
        outputFileNoHeader,
        {
          includeHeader: false,
        },
      )

      const outputNoHeader = await fs.readFile(outputFileNoHeader, 'utf-8')
      const linesNoHeader = outputNoHeader.trim().split('\n')
      expect(linesNoHeader).toHaveLength(1) // Apenas 1 linha de dados
      expect(linesNoHeader[0]).not.toContain('CNJ_original')
      expect(linesNoHeader[0]).toContain(validCNJ1)
    })

    test('should pass separator option correctly to processCSV', async () => {
      // Cria arquivo com separador personalizado
      const csvContent = `${validCNJ1};extra data\n${validCNJ2};more data`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile, {
        separator: ';',
        includeHeader: true,
      })

      expect(result.statistics.totalCNJs).toBe(2)
      expect(result.statistics.validCNJs).toBe(2)

      // Verifica se processou apenas os CNJs (primeira coluna)
      expect(result.analyses[0].receivedCNJ).toBe(validCNJ1)
      expect(result.analyses[1].receivedCNJ).toBe(validCNJ2)

      // Verifica se o arquivo de saída usa vírgula como separador (padrão do generateCSV)
      const outputContent = await fs.readFile(testOutputFile, 'utf-8')
      expect(outputContent).toContain(',') // CSV de saída usa vírgula
      expect(outputContent).toContain(validCNJ1)
      expect(outputContent).toContain(validCNJ2)
    })

    test('should handle all options together', async () => {
      const csvContent = `${validCNJ1}|additional\n${validCNJ2}|data`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile, {
        separator: '|',
        includeHeader: false,
        encoding: 'utf8',
      })

      expect(result.statistics.totalCNJs).toBe(2)
      expect(result.statistics.validCNJs).toBe(2)

      // Verifica arquivo de saída sem cabeçalho
      const outputContent = await fs.readFile(testOutputFile, 'utf-8')
      const lines = outputContent.trim().split('\n')
      expect(lines).toHaveLength(2) // Apenas dados, sem cabeçalho
      expect(lines[0]).not.toContain('CNJ_original')
      expect(outputContent).toContain(validCNJ1)
      expect(outputContent).toContain(validCNJ2)
    })
  })
})
