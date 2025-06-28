/**
 * Comprehensive tests for CSV processor module
 */

import {
  generateCSV,
  processCNJBatch,
  processCSV,
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

  // Note: processFile tests moved to file-processor.test.ts
  // processFile now requires Node.js filesystem and is not browser-safe
})
