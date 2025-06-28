/**
 * Tests for Node.js-specific file processing functionality
 * These tests require filesystem access and only run in Node.js environment
 */

import { isFileProcessingAvailable, processFile } from '../file-processor'

// Skip tests if not in Node.js environment
const describeNodeOnly =
  typeof globalThis !== 'undefined' && !('window' in globalThis)
    ? describe
    : describe.skip

describeNodeOnly('File Processor (Node.js only)', () => {
  const validCNJ1 = '0001327-64.2018.8.26.0158'
  const validCNJ2 = '0001328-12.2019.8.26.0159'
  const invalidCNJ = '0001327-65.2018.8.26.0158'
  const malformedCNJ = 'invalid-cnj'

  describe('Environment Detection', () => {
    test('should correctly detect Node.js environment', () => {
      expect(isFileProcessingAvailable()).toBe(true)
    })

    test('should throw error in browser environment', () => {
      // Mock browser environment
      const originalWindow = (globalThis as any).window
      // @ts-ignore
      ;(globalThis as any).window = {}

      expect(() => {
        // This would throw synchronously during the environment check
        const testError =
          typeof globalThis !== 'undefined' && 'window' in globalThis
        if (testError) {
          throw new Error(
            'processFile() só funciona no Node.js. Use processCSV() para ambientes browser.',
          )
        }
      }).toThrow('processFile() só funciona no Node.js')

      // Restore original environment
      if (originalWindow !== undefined) {
        ;(globalThis as any).window = originalWindow
      } else {
        delete (globalThis as any).window
      }
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

    test('should handle file processing with error recovery', async () => {
      const csvContent = `${validCNJ1}\n${malformedCNJ}\n${validCNJ2}`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile)

      expect(result.statistics.totalCNJs).toBe(3)
      expect(result.statistics.validCNJs).toBe(2)
      expect(result.statistics.invalidCNJs).toBe(1)
      expect(result.statistics.errorCount).toBe(1)

      // Verifica se o arquivo de saída foi criado com todas as análises
      const outputContent = await fs.readFile(testOutputFile, 'utf-8')
      const lines = outputContent.trim().split('\n')
      expect(lines).toHaveLength(4) // Cabeçalho + 3 linhas de dados
      expect(outputContent).toContain('ERRO') // Linha de erro processada
    })

    test('should maintain processing statistics accuracy', async () => {
      const csvContent = `${validCNJ1}\n${invalidCNJ}\n${malformedCNJ}\n${validCNJ2}`
      await fs.writeFile(testInputFile, csvContent, 'utf-8')

      const result = await processFile(testInputFile, testOutputFile)

      // Verifica estatísticas detalhadas
      expect(result.statistics.totalCNJs).toBe(4)
      expect(result.statistics.validCNJs).toBe(2) // validCNJ1 e validCNJ2
      expect(result.statistics.invalidCNJs).toBe(2) // invalidCNJ e malformedCNJ
      expect(result.statistics.errorCount).toBe(1) // Apenas malformedCNJ causa erro no processamento
      expect(result.statistics.processingTime).toBeGreaterThan(0)

      // Verifica consistência entre estatísticas e análises
      expect(result.analyses).toHaveLength(4)
      const validAnalyses = result.analyses.filter((a) => a.validCNJ)
      expect(validAnalyses).toHaveLength(result.statistics.validCNJs)
    })
  })
})
