/**
 * Comprehensive tests for CNJ validator module
 */

import {
  calculateVerifyingDigit,
  detectCNJFormat,
  formatCNJ,
  isValidCNJ,
  normalizeCNJ,
  validateCNJ,
  validateCNJFormat,
} from '../validator'

describe('CNJ Validator', () => {
  const validCNJ = '0001327-64.2018.8.26.0158'
  const validCNJUnformatted = '00013276420188260158'
  const invalidCNJ = '0001327-65.2018.8.26.0158'

  describe('validateCNJ', () => {
    test('should validate correct formatted CNJ', () => {
      const result = validateCNJ(validCNJ)
      expect(result.isValid).toBe(true)
      expect(result.expectedDigit).toBe('64')
      expect(result.receivedDigit).toBe('64')
      expect(result.error).toBeUndefined()
    })

    test('should validate correct unformatted CNJ', () => {
      const result = validateCNJ(validCNJUnformatted)
      expect(result.isValid).toBe(true)
      expect(result.expectedDigit).toBe('64')
      expect(result.receivedDigit).toBe('64')
    })

    test('should reject invalid CNJ with wrong digit', () => {
      const result = validateCNJ(invalidCNJ)
      expect(result.isValid).toBe(false)
      expect(result.expectedDigit).toBe('64')
      expect(result.receivedDigit).toBe('65')
      expect(result.error).toContain('Dígito verificador inválido')
    })

    test('should handle malformed CNJ', () => {
      const result = validateCNJ('invalid-cnj')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    test('should handle empty CNJ', () => {
      const result = validateCNJ('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    test('should handle CNJ with invalid length', () => {
      const result = validateCNJ('123456789')
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateCNJFormat', () => {
    test('should validate correct format', () => {
      expect(validateCNJFormat(validCNJ)).toBe(true)
      expect(validateCNJFormat(validCNJUnformatted)).toBe(true)
    })

    test('should reject invalid format', () => {
      expect(validateCNJFormat('invalid')).toBe(false)
      expect(validateCNJFormat('')).toBe(false)
      expect(validateCNJFormat('123')).toBe(false)
    })
  })

  describe('calculateVerifyingDigit', () => {
    test('should calculate correct digit', () => {
      const argNumber = '00013272018826015800'
      const digit = calculateVerifyingDigit(argNumber)
      expect(digit).toBe('64')
    })

    test('should handle different argument numbers', () => {
      const testCases = [{ arg: '00013272018826015800', expected: '64' }]

      testCases.forEach(({ arg, expected }) => {
        expect(calculateVerifyingDigit(arg)).toBe(expected)
      })
    })

    test('should throw error for invalid argument', () => {
      expect(() => calculateVerifyingDigit('invalid')).toThrow()
    })
  })

  describe('isValidCNJ', () => {
    test('should return true for valid CNJ', () => {
      expect(isValidCNJ(validCNJ)).toBe(true)
      expect(isValidCNJ(validCNJUnformatted)).toBe(true)
    })

    test('should return false for invalid CNJ', () => {
      expect(isValidCNJ(invalidCNJ)).toBe(false)
      expect(isValidCNJ('invalid')).toBe(false)
      expect(isValidCNJ('')).toBe(false)
    })
  })

  describe('normalizeCNJ', () => {
    test('should remove non-numeric characters', () => {
      expect(normalizeCNJ(validCNJ)).toBe(validCNJUnformatted)
      expect(normalizeCNJ('0001327-64.2018.8.26.0158')).toBe(
        '00013276420188260158',
      )
      expect(normalizeCNJ('abc123def456')).toBe('123456')
    })

    test('should handle already normalized CNJ', () => {
      expect(normalizeCNJ(validCNJUnformatted)).toBe(validCNJUnformatted)
    })
  })

  describe('formatCNJ', () => {
    test('should format unformatted CNJ', () => {
      expect(formatCNJ(validCNJUnformatted)).toBe(validCNJ)
    })

    test('should throw error for invalid length', () => {
      expect(() => formatCNJ('123')).toThrow()
      expect(() => formatCNJ('12345678901234567890123')).toThrow()
    })

    test('should handle CNJ with non-numeric characters', () => {
      const messyCNJ = 'abc00013276420188260158def'
      expect(formatCNJ(messyCNJ)).toBe(validCNJ)
    })
  })

  describe('detectCNJFormat', () => {
    test('should detect formatted CNJ', () => {
      expect(detectCNJFormat(validCNJ)).toBe('formatted')
      expect(detectCNJFormat('1234567-89.2023.1.23.4567')).toBe('formatted')
    })

    test('should detect unformatted CNJ', () => {
      expect(detectCNJFormat(validCNJUnformatted)).toBe('unformatted')
      expect(detectCNJFormat('12345678901234567890')).toBe('unformatted')
    })

    test('should detect invalid CNJ', () => {
      expect(detectCNJFormat('123')).toBe('invalid')
      expect(detectCNJFormat('invalid')).toBe('invalid')
      expect(detectCNJFormat('')).toBe('invalid')
      expect(detectCNJFormat('1234567-89.2023.1.23')).toBe('invalid') // Missing parts
    })
  })

  describe('Edge Cases', () => {
    test('should handle CNJ with leading zeros', () => {
      const cnjWithZeros = '0000001-00.2020.1.01.0001'
      const result = validateCNJ(cnjWithZeros)
      expect(result.isValid).toBeDefined()
    })

    test('should handle maximum values', () => {
      // Test with high values that are still valid
      const maxValueCNJ = '9999999-99.2099.9.99.9999'
      const format = detectCNJFormat(maxValueCNJ)
      expect(format).toBe('formatted')
    })

    test('should handle minimum values', () => {
      const minValueCNJ = '0000001-01.1998.1.01.0001'
      const format = detectCNJFormat(minValueCNJ)
      expect(format).toBe('formatted')
    })
  })
})
