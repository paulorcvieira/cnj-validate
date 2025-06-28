/**
 * Comprehensive CNJ Validation Tests
 * This file contains tests for all modules in one place while we organize individual module tests
 */

import {
  analyzeCNJ,
  formatCNJWithMask,
  isValidCNJ,
  removeCNJMask,
  validateCNJ,
} from '../src/index'

describe('CNJ Validation Library - Comprehensive Tests', () => {
  const validCNJ = '0001327-64.2018.8.26.0158'
  const validCNJUnformatted = '00013276420188260158'
  const invalidCNJ = '0001327-65.2018.8.26.0158'

  describe('Core Validation Functions', () => {
    test('validateCNJ should validate correct CNJ', () => {
      const result = validateCNJ(validCNJ)
      expect(result.isValid).toBe(true)
      expect(result.expectedDigit).toBe('64')
      expect(result.receivedDigit).toBe('64')
    })

    test('validateCNJ should reject invalid CNJ', () => {
      const result = validateCNJ(invalidCNJ)
      expect(result.isValid).toBe(false)
      expect(result.expectedDigit).toBe('64')
      expect(result.receivedDigit).toBe('65')
    })

    test('isValidCNJ should work as boolean function', () => {
      expect(isValidCNJ(validCNJ)).toBe(true)
      expect(isValidCNJ(invalidCNJ)).toBe(false)
      expect(isValidCNJ('invalid')).toBe(false)
    })
  })

  describe('CNJ Analysis', () => {
    test('analyzeCNJ should provide complete analysis', () => {
      const analysis = analyzeCNJ(validCNJ)

      expect(analysis.receivedCNJ).toBe(validCNJ)
      expect(analysis.validCNJ).toBe(true)
      expect(analysis.segmentName).toBeTruthy()
      expect(analysis.segmentShort).toBe('TJ')
      expect(analysis.detailed.lawsuitNumber).toBe('0001327')
      expect(analysis.detailed.verifyingDigit).toBe('64')
      expect(analysis.detailed.protocolYear).toBe('2018')
      expect(analysis.detailed.segment).toBe('8')
      expect(analysis.detailed.court).toBe('26')
      expect(analysis.detailed.sourceUnit).toBe('0158')
    })

    test('analyzeCNJ should handle invalid CNJ gracefully', () => {
      const analysis = analyzeCNJ(invalidCNJ)
      expect(analysis.validCNJ).toBe(false)
      expect(analysis.receivedCNJ).toBe(invalidCNJ)
    })
  })

  describe('Formatting Functions', () => {
    test('formatCNJWithMask should format unformatted CNJ', () => {
      expect(formatCNJWithMask(validCNJUnformatted)).toBe(validCNJ)
    })

    test('removeCNJMask should remove formatting', () => {
      expect(removeCNJMask(validCNJ)).toBe(validCNJUnformatted)
    })

    test('formatting should be reversible', () => {
      const formatted = formatCNJWithMask(validCNJUnformatted)
      const unformatted = removeCNJMask(formatted)
      expect(unformatted).toBe(validCNJUnformatted)
    })

    test('formatCNJWithMask should throw error for invalid length', () => {
      expect(() => formatCNJWithMask('123')).toThrow()
      expect(() => formatCNJWithMask('12345678901234567890123')).toThrow()
    })
  })

  describe('Edge Cases', () => {
    test('should handle CNJ with all zeros', () => {
      const cnjWithZeros = '0000001-01.2020.1.01.0001'
      const result = validateCNJ(cnjWithZeros)
      expect(result.isValid).toBeDefined()
      expect(typeof result.isValid).toBe('boolean')
    })

    test('should handle unformatted CNJ validation', () => {
      const result = validateCNJ(validCNJUnformatted)
      expect(result.isValid).toBe(true)
    })

    test('should handle malformed CNJ', () => {
      const result = validateCNJ('invalid-cnj')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeTruthy()
    })

    test('should handle empty CNJ', () => {
      const result = validateCNJ('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('Different Segments', () => {
    test('should handle different court segments', () => {
      // Test with the sample we have (segment 8 - TJ)
      const analysis = analyzeCNJ(validCNJ)
      expect(analysis.detailed.segment).toBe('8')
      expect(analysis.segmentShort).toBe('TJ')
    })

    test('should maintain consistency in analysis', () => {
      const analysis1 = analyzeCNJ(validCNJ)
      const analysis2 = analyzeCNJ(validCNJ)

      expect(analysis1).toEqual(analysis2)
    })
  })

  describe('Year Validation', () => {
    test('should handle different years', () => {
      const analysis = analyzeCNJ(validCNJ)
      expect(analysis.detailed.protocolYear).toBe('2018')
      expect(analysis.detailed.protocolYear).toMatch(/^\d{4}$/)
    })
  })

  describe('Court and Source Unit Analysis', () => {
    test('should analyze court information', () => {
      const analysis = analyzeCNJ(validCNJ)
      expect(analysis.detailed.court).toBe('26')
      expect(analysis.courtType).toBeTruthy()
      expect(analysis.courtNumber).toBeTruthy()
    })

    test('should analyze source unit information', () => {
      const analysis = analyzeCNJ(validCNJ)
      expect(analysis.detailed.sourceUnit).toBe('0158')
      expect(analysis.sourceUnitType).toBeTruthy()
      expect(analysis.sourceUnitNumber).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    test('should not throw errors for invalid inputs', () => {
      expect(() => validateCNJ('invalid')).not.toThrow()
      expect(() => isValidCNJ('invalid')).not.toThrow()
      expect(() => removeCNJMask('invalid')).not.toThrow()
    })

    test('should provide meaningful error messages', () => {
      const result = validateCNJ(invalidCNJ)
      expect(result.error).toContain('Dígito verificador inválido')
    })
  })

  describe('Performance Tests', () => {
    test('should handle multiple validations efficiently', () => {
      const start = Date.now()

      for (let i = 0; i < 100; i++) {
        validateCNJ(validCNJ)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // Should complete in less than 1 second
    })

    test('should handle multiple analyses efficiently', () => {
      const start = Date.now()

      for (let i = 0; i < 50; i++) {
        analyzeCNJ(validCNJ)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(2000) // Should complete in less than 2 seconds
    })
  })
})
