/**
 * Tests for analysis types and interfaces
 */

import type {
  AnalysisCNJ,
  CSVOptions,
  CSVProcessingResult,
  DecomposedCNJ,
  ValidationResult,
} from '../analysis'

describe('Analysis Types', () => {
  describe('ValidationResult', () => {
    test('should have required properties for valid result', () => {
      const validResult: ValidationResult = {
        isValid: true,
        expectedDigit: '64',
        receivedDigit: '64',
      }

      expect(validResult.isValid).toBe(true)
      expect(validResult.expectedDigit).toBe('64')
      expect(validResult.receivedDigit).toBe('64')
      expect(validResult.error).toBeUndefined()
    })

    test('should have required properties for invalid result', () => {
      const invalidResult: ValidationResult = {
        isValid: false,
        expectedDigit: '64',
        receivedDigit: '65',
        error: 'Invalid verifying digit',
      }

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.expectedDigit).toBe('64')
      expect(invalidResult.receivedDigit).toBe('65')
      expect(invalidResult.error).toBe('Invalid verifying digit')
    })

    test('should allow optional error property', () => {
      const result: ValidationResult = {
        isValid: true,
        expectedDigit: '64',
        receivedDigit: '64',
        // error is optional
      }

      expect('error' in result).toBe(false)
    })
  })

  describe('DecomposedCNJ', () => {
    test('should have all required properties', () => {
      const decomposed: DecomposedCNJ = {
        lawsuitCNJFormat: '0001327-64.2018.8.26.0158',
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
      }

      expect(decomposed.lawsuitCNJFormat).toBe('0001327-64.2018.8.26.0158')
      expect(decomposed.lawsuitNumber).toBe('0001327')
      expect(decomposed.verifyingDigit).toBe('64')
      expect(decomposed.protocolYear).toBe('2018')
      expect(decomposed.segment).toBe('8')
      expect(decomposed.court).toBe('26')
      expect(decomposed.sourceUnit).toBe('0158')
      expect(decomposed.argNumber).toBe('000132720188260158100')
      expect(decomposed.district).toBe('São Paulo')
      expect(decomposed.uf).toBe('SP')
      expect(decomposed.tj).toBe('TJ26')
    })

    test('should accept string values for all properties', () => {
      const decomposed: DecomposedCNJ = {
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
      }

      Object.values(decomposed).forEach((value) => {
        expect(typeof value).toBe('string')
      })
    })
  })

  describe('AnalysisCNJ', () => {
    test('should have all required properties', () => {
      const analysis: AnalysisCNJ = {
        receivedCNJ: '0001327-64.2018.8.26.0158',
        validCNJ: true,
        segmentName: 'State Court',
        segmentShort: 'TJ',
        sourceUnitType: 'Civil Court',
        sourceUnitNumber: '0158',
        courtType: 'Estate',
        courtNumber: '26',
        detailed: {
          lawsuitCNJFormat: '0001327-64.2018.8.26.0158',
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

      expect(typeof analysis.receivedCNJ).toBe('string')
      expect(typeof analysis.validCNJ).toBe('boolean')
      expect(typeof analysis.segmentName).toBe('string')
      expect(typeof analysis.segmentShort).toBe('string')
      expect(typeof analysis.sourceUnitType).toBe('string')
      expect(typeof analysis.sourceUnitNumber).toBe('string')
      expect(typeof analysis.courtType).toBe('string')
      expect(typeof analysis.courtNumber).toBe('string')
      expect(typeof analysis.detailed).toBe('object')
    })

    test('should contain valid DecomposedCNJ in detailed property', () => {
      const analysis: AnalysisCNJ = {
        receivedCNJ: '0001327-64.2018.8.26.0158',
        validCNJ: true,
        segmentName: 'State Court',
        segmentShort: 'TJ',
        sourceUnitType: 'Civil Court',
        sourceUnitNumber: '0158',
        courtType: 'Estate',
        courtNumber: '26',
        detailed: {
          lawsuitCNJFormat: '0001327-64.2018.8.26.0158',
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

      const detailed = analysis.detailed
      expect(detailed.lawsuitNumber).toBe('0001327')
      expect(detailed.segment).toBe('8')
      expect(detailed.court).toBe('26')
      expect(detailed.sourceUnit).toBe('0158')
    })
  })

  describe('CSVOptions', () => {
    test('should have optional properties with defaults', () => {
      const defaultOptions: CSVOptions = {}
      expect(defaultOptions.separator).toBeUndefined()
      expect(defaultOptions.includeHeader).toBeUndefined()
      expect(defaultOptions.encoding).toBeUndefined()
    })

    test('should accept custom values', () => {
      const customOptions: CSVOptions = {
        separator: ';',
        includeHeader: false,
        encoding: 'latin1',
      }

      expect(customOptions.separator).toBe(';')
      expect(customOptions.includeHeader).toBe(false)
      expect(customOptions.encoding).toBe('latin1')
    })

    test('should accept partial options', () => {
      const partialOptions: CSVOptions = {
        separator: ',',
      }

      expect(partialOptions.separator).toBe(',')
      expect(partialOptions.includeHeader).toBeUndefined()
      expect(partialOptions.encoding).toBeUndefined()
    })
  })

  describe('CSVProcessingResult', () => {
    test('should have all required properties', () => {
      const result: CSVProcessingResult = {
        totalProcessed: 10,
        validCount: 8,
        invalidCount: 2,
        errors: [
          { line: 5, cnj: 'invalid-cnj', error: 'Invalid format' },
          { line: 9, cnj: 'another-invalid', error: 'Invalid digit' },
        ],
      }

      expect(typeof result.totalProcessed).toBe('number')
      expect(typeof result.validCount).toBe('number')
      expect(typeof result.invalidCount).toBe('number')
      expect(Array.isArray(result.errors)).toBe(true)
    })

    test('should have properly typed error objects', () => {
      const result: CSVProcessingResult = {
        totalProcessed: 1,
        validCount: 0,
        invalidCount: 1,
        errors: [{ line: 1, cnj: 'test', error: 'Test error' }],
      }

      const error = result.errors[0]
      expect(typeof error.line).toBe('number')
      expect(typeof error.cnj).toBe('string')
      expect(typeof error.error).toBe('string')
    })

    test('should allow empty errors', () => {
      const result: CSVProcessingResult = {
        totalProcessed: 0,
        validCount: 0,
        invalidCount: 0,
        errors: [],
      }

      expect(result.errors).toHaveLength(0)
    })

    test('should support optional outputPath', () => {
      const result: CSVProcessingResult = {
        totalProcessed: 5,
        validCount: 5,
        invalidCount: 0,
        errors: [],
        outputPath: '/path/to/output.csv',
      }

      expect(result.outputPath).toBe('/path/to/output.csv')
    })
  })

  describe('Type Consistency', () => {
    test('should maintain type consistency between related interfaces', () => {
      const decomposed: DecomposedCNJ = {
        lawsuitCNJFormat: '0001327-64.2018.8.26.0158',
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
      }

      const analysis: AnalysisCNJ = {
        receivedCNJ: decomposed.lawsuitCNJFormat,
        validCNJ: true,
        segmentName: 'State Court',
        segmentShort: 'TJ',
        sourceUnitType: 'Civil Court',
        sourceUnitNumber: decomposed.sourceUnit,
        courtType: 'Estate',
        courtNumber: decomposed.court,
        detailed: decomposed,
      }

      expect(analysis.sourceUnitNumber).toBe(decomposed.sourceUnit)
      expect(analysis.courtNumber).toBe(decomposed.court)
      expect(analysis.receivedCNJ).toBe(decomposed.lawsuitCNJFormat)
    })

    test('should allow validation result in processing context', () => {
      const validation: ValidationResult = {
        isValid: false,
        expectedDigit: '64',
        receivedDigit: '65',
        error: 'Invalid digit',
      }

      const csvResult: CSVProcessingResult = {
        totalProcessed: 1,
        validCount: validation.isValid ? 1 : 0,
        invalidCount: validation.isValid ? 0 : 1,
        errors: validation.error
          ? [{ line: 1, cnj: 'test', error: validation.error }]
          : [],
      }

      expect(csvResult.validCount).toBe(0)
      expect(csvResult.invalidCount).toBe(1)
      expect(csvResult.errors).toHaveLength(1)
    })
  })
})
