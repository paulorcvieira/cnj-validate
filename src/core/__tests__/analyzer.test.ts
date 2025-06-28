/**
 * Comprehensive tests for CNJ analyzer module
 */

import {
  analyzeCNJ,
  analyzeCNJBatch,
  getBatchStatistics,
  isValidCNJComplete,
  writeCNJ,
} from '../analyzer'

describe('CNJ Analyzer', () => {
  const validCNJ = '0001327-64.2018.8.26.0158'
  const invalidCNJ = '0001327-65.2018.8.26.0158'
  const malformedCNJ = 'invalid-cnj'

  describe('analyzeCNJ', () => {
    test('should analyze valid CNJ completely', () => {
      const analysis = analyzeCNJ(validCNJ)

      expect(analysis.receivedCNJ).toBe(validCNJ)
      expect(analysis.validCNJ).toBe(true)
      expect(analysis.segmentName).toBeTruthy()
      expect(analysis.segmentShort).toBe('TJ')
      expect(analysis.sourceUnitType).toBeTruthy()
      expect(analysis.sourceUnitNumber).toBeTruthy()
      expect(analysis.courtType).toBeTruthy()
      expect(analysis.courtNumber).toBeTruthy()
      expect(analysis.detailed).toBeTruthy()
    })

    test('should have correct detailed information', () => {
      const analysis = analyzeCNJ(validCNJ)

      expect(analysis.detailed.lawsuitNumber).toBe('0001327')
      expect(analysis.detailed.verifyingDigit).toBe('64')
      expect(analysis.detailed.protocolYear).toBe('2018')
      expect(analysis.detailed.segment).toBe('8')
      expect(analysis.detailed.court).toBe('26')
      expect(analysis.detailed.sourceUnit).toBe('0158')
    })

    test('should analyze unformatted CNJ', () => {
      const analysis = analyzeCNJ('00013276420188260158')
      expect(analysis.validCNJ).toBe(true)
      expect(analysis.detailed.lawsuitNumber).toBe('0001327')
    })

    test('should throw error for malformed CNJ', () => {
      expect(() => analyzeCNJ(malformedCNJ)).toThrow()
    })

    test('should handle different segments', () => {
      // Test different segment types if we have valid examples
      const testCases = [
        { cnj: validCNJ, expectedSegment: '8', expectedShort: 'TJ' },
        // Add more test cases for different segments when available
      ]

      testCases.forEach(({ cnj, expectedSegment, expectedShort }) => {
        const analysis = analyzeCNJ(cnj)
        expect(analysis.detailed.segment).toBe(expectedSegment)
        expect(analysis.segmentShort).toBe(expectedShort)
      })
    })
  })

  describe('writeCNJ', () => {
    test('should generate descriptive text for CNJ', () => {
      const analysis = analyzeCNJ(validCNJ)
      const description = writeCNJ(analysis)

      expect(description).toContain('Processo número: 0001327')
      expect(description).toContain('no ano 2018')
      expect(description).toContain('TJ')
    })

    test('should throw error for invalid analysis', () => {
      const invalidAnalysis = {
        receivedCNJ: 'test',
        validCNJ: false,
        segmentName: 'Test',
        segmentShort: 'TST',
        sourceUnitType: 'Test',
        sourceUnitNumber: '0000',
        courtType: 'Test',
        courtNumber: '00',
        detailed: {
          lawsuitCNJFormat: '',
          lawsuitNumber: '', // This will cause the error
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
      }

      expect(() => writeCNJ(invalidAnalysis)).toThrow(
        'AnalysisCNJ não possui dados utilizáveis',
      )
    })
  })

  describe('analyzeCNJBatch', () => {
    test('should analyze multiple valid CNJs', () => {
      const cnjs = [validCNJ, validCNJ]
      const results = analyzeCNJBatch(cnjs)

      expect(results).toHaveLength(2)
      results.forEach((result) => {
        expect('validCNJ' in result).toBe(true)
        if ('validCNJ' in result) {
          expect(result.validCNJ).toBe(true)
        }
      })
    })

    test('should handle mix of valid and invalid CNJs', () => {
      const cnjs = [validCNJ, malformedCNJ, invalidCNJ]
      const results = analyzeCNJBatch(cnjs)

      expect(results).toHaveLength(3)

      // First should be valid
      expect('validCNJ' in results[0]).toBe(true)
      if ('validCNJ' in results[0]) {
        expect(results[0].validCNJ).toBe(true)
      }

      // Second should be error
      expect('error' in results[1]).toBe(true)
      if ('error' in results[1]) {
        expect(results[1].cnj).toBe(malformedCNJ)
      }

      // Third should be valid but with invalid digit
      expect('validCNJ' in results[2]).toBe(true)
      if ('validCNJ' in results[2]) {
        expect(results[2].validCNJ).toBe(false)
      }
    })

    test('should handle empty array', () => {
      const results = analyzeCNJBatch([])
      expect(results).toHaveLength(0)
    })
  })

  describe('isValidCNJComplete', () => {
    test('should return true for valid CNJ', () => {
      expect(isValidCNJComplete(validCNJ)).toBe(true)
    })

    test('should return false for invalid CNJ', () => {
      expect(isValidCNJComplete(invalidCNJ)).toBe(false)
      expect(isValidCNJComplete(malformedCNJ)).toBe(false)
    })
  })

  describe('getBatchStatistics', () => {
    test('should calculate statistics for mixed results', () => {
      const validAnalysis = analyzeCNJ(validCNJ)
      const invalidAnalysis = { ...validAnalysis, validCNJ: false }
      const errorResult = { error: 'Test error', cnj: 'test' }

      const results = [validAnalysis, invalidAnalysis, errorResult]
      const stats = getBatchStatistics(results)

      expect(stats.total).toBe(3)
      expect(stats.successful).toBe(2)
      expect(stats.errors).toBe(1)
      expect(stats.valid).toBe(1)
      expect(stats.invalid).toBe(1)
      expect(stats.successRate).toBeCloseTo(66.67, 1)
      expect(stats.validityRate).toBeCloseTo(33.33, 1)
    })

    test('should handle all valid results', () => {
      const validAnalysis = analyzeCNJ(validCNJ)
      const results = [validAnalysis, validAnalysis]
      const stats = getBatchStatistics(results)

      expect(stats.total).toBe(2)
      expect(stats.successful).toBe(2)
      expect(stats.errors).toBe(0)
      expect(stats.valid).toBe(2)
      expect(stats.invalid).toBe(0)
      expect(stats.successRate).toBe(100)
      expect(stats.validityRate).toBe(100)
    })

    test('should handle empty results', () => {
      const stats = getBatchStatistics([])
      expect(stats.total).toBe(0)
      expect(stats.successRate).toBe(0)
      expect(stats.validityRate).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    test('should handle CNJ from different years', () => {
      // Test with different years if we have examples
      const analysis = analyzeCNJ(validCNJ)
      expect(analysis.detailed.protocolYear).toMatch(/^\d{4}$/)
    })

    test('should handle CNJ from different courts', () => {
      // Test analysis consistency
      const analysis = analyzeCNJ(validCNJ)
      expect(analysis.detailed.court).toMatch(/^\d{2}$/)
    })
  })
})
