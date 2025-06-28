/**
 * Comprehensive tests for CNJ decomposer module
 */

import {
  decomposeCNJ,
  extractCourt,
  extractSegment,
  extractYear,
  isFromSegment,
  isFromYear,
  validateCNJComponents,
} from '../decomposer'

describe('CNJ Decomposer', () => {
  const validCNJFormatted = '0001327-64.2018.8.26.0158'
  const validCNJUnformatted = '00013276420188260158'

  describe('decomposeCNJ', () => {
    test('should decompose formatted CNJ correctly', () => {
      const result = decomposeCNJ(validCNJFormatted)

      expect(result.lawsuitNumber).toBe('0001327')
      expect(result.verifyingDigit).toBe('64')
      expect(result.protocolYear).toBe('2018')
      expect(result.segment).toBe('8')
      expect(result.court).toBe('26')
      expect(result.sourceUnit).toBe('0158')
      expect(result.lawsuitCNJFormat).toBe(validCNJFormatted)
      expect(result.argNumber).toBe('00013272018826015800')
    })

    test('should decompose unformatted CNJ correctly', () => {
      const result = decomposeCNJ(validCNJUnformatted)

      expect(result.lawsuitNumber).toBe('0001327')
      expect(result.verifyingDigit).toBe('64')
      expect(result.protocolYear).toBe('2018')
      expect(result.segment).toBe('8')
      expect(result.court).toBe('26')
      expect(result.sourceUnit).toBe('0158')
    })

    test('should throw error for invalid length', () => {
      expect(() => decomposeCNJ('123')).toThrow()
      expect(() => decomposeCNJ('12345678901234567890123456')).toThrow()
    })

    test('should throw error for malformed formatted CNJ', () => {
      expect(() => decomposeCNJ('0001327.64.2018.8.26.0158')).toThrow() // Missing hyphen
      expect(() => decomposeCNJ('0001327-64-2018.8.26.0158')).toThrow() // Wrong separator
      expect(() => decomposeCNJ('0001327-64.2018.8.26')).toThrow() // Missing parts
    })

    test('should generate correct argument number', () => {
      const result = decomposeCNJ(validCNJFormatted)
      const expected = '00013272018826015800' // lawsuit + year + segment + court + unit + "00"
      expect(result.argNumber).toBe(expected)
    })

    test('should include district and state information when available', () => {
      const result = decomposeCNJ(validCNJFormatted)
      // These might be empty if not in our sample data, but should be defined
      expect(result.district).toBeDefined()
      expect(result.uf).toBeDefined()
      expect(result.tj).toBeDefined()
    })
  })

  describe('validateCNJComponents', () => {
    const validComponents = {
      lawsuitNumber: '0001327',
      verifyingDigit: '64',
      protocolYear: '2018',
      segment: '8',
      court: '26',
      sourceUnit: '0158',
    }

    test('should validate correct components', () => {
      expect(() => validateCNJComponents(validComponents)).not.toThrow()
    })

    test('should reject invalid lawsuit number', () => {
      expect(() =>
        validateCNJComponents({ ...validComponents, lawsuitNumber: '123' }),
      ).toThrow('Número do processo deve ter 7 dígitos')

      expect(() =>
        validateCNJComponents({
          ...validComponents,
          lawsuitNumber: '12345678',
        }),
      ).toThrow('Número do processo deve ter 7 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, lawsuitNumber: 'abcdefg' }),
      ).toThrow('Número do processo deve ter 7 dígitos')
    })

    test('should reject invalid verifying digit', () => {
      expect(() =>
        validateCNJComponents({ ...validComponents, verifyingDigit: '1' }),
      ).toThrow('Dígito verificador deve ter 2 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, verifyingDigit: '123' }),
      ).toThrow('Dígito verificador deve ter 2 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, verifyingDigit: 'ab' }),
      ).toThrow('Dígito verificador deve ter 2 dígitos')
    })

    test('should reject invalid protocol year', () => {
      expect(() =>
        validateCNJComponents({ ...validComponents, protocolYear: '18' }),
      ).toThrow('Protocol year must have 4 digits')

      expect(() =>
        validateCNJComponents({ ...validComponents, protocolYear: '20188' }),
      ).toThrow('Protocol year must have 4 digits')

      expect(() =>
        validateCNJComponents({ ...validComponents, protocolYear: 'abcd' }),
      ).toThrow('Protocol year must have 4 digits')
    })

    test('should reject invalid segment', () => {
      expect(() =>
        validateCNJComponents({ ...validComponents, segment: '10' }),
      ).toThrow('Segmento deve ter 1 dígito')

      expect(() =>
        validateCNJComponents({ ...validComponents, segment: '' }),
      ).toThrow('Segmento deve ter 1 dígito')

      expect(() =>
        validateCNJComponents({ ...validComponents, segment: 'a' }),
      ).toThrow('Segmento deve ter 1 dígito')
    })

    test('should reject invalid court', () => {
      expect(() =>
        validateCNJComponents({ ...validComponents, court: '1' }),
      ).toThrow('Código do tribunal deve ter 2 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, court: '123' }),
      ).toThrow('Código do tribunal deve ter 2 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, court: 'ab' }),
      ).toThrow('Código do tribunal deve ter 2 dígitos')
    })

    test('should reject invalid source unit', () => {
      expect(() =>
        validateCNJComponents({ ...validComponents, sourceUnit: '123' }),
      ).toThrow('Código da unidade de origem deve ter 4 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, sourceUnit: '12345' }),
      ).toThrow('Código da unidade de origem deve ter 4 dígitos')

      expect(() =>
        validateCNJComponents({ ...validComponents, sourceUnit: 'abcd' }),
      ).toThrow('Código da unidade de origem deve ter 4 dígitos')
    })
  })

  describe('Extract Functions', () => {
    test('extractYear should return correct year', () => {
      expect(extractYear(validCNJFormatted)).toBe('2018')
      expect(extractYear(validCNJUnformatted)).toBe('2018')
    })

    test('extractYear should handle invalid CNJ', () => {
      expect(extractYear('invalid')).toBe('')
      expect(extractYear('')).toBe('')
    })

    test('extractSegment should return correct segment', () => {
      expect(extractSegment(validCNJFormatted)).toBe('8')
      expect(extractSegment(validCNJUnformatted)).toBe('8')
    })

    test('extractSegment should handle invalid CNJ', () => {
      expect(extractSegment('invalid')).toBe('')
      expect(extractSegment('')).toBe('')
    })

    test('extractCourt should return correct court', () => {
      expect(extractCourt(validCNJFormatted)).toBe('26')
      expect(extractCourt(validCNJUnformatted)).toBe('26')
    })

    test('extractCourt should handle invalid CNJ', () => {
      expect(extractCourt('invalid')).toBe('')
      expect(extractCourt('')).toBe('')
    })
  })

  describe('Utility Functions', () => {
    test('isFromYear should check year correctly', () => {
      expect(isFromYear(validCNJFormatted, '2018')).toBe(true)
      expect(isFromYear(validCNJFormatted, '2019')).toBe(false)
      expect(isFromYear('invalid', '2018')).toBe(false)
    })

    test('isFromSegment should check segment correctly', () => {
      expect(isFromSegment(validCNJFormatted, '8')).toBe(true)
      expect(isFromSegment(validCNJFormatted, '1')).toBe(false)
      expect(isFromSegment('invalid', '8')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    test('should handle CNJ with zeros', () => {
      const cnjWithZeros = '0000001-01.2020.1.01.0001'
      const result = decomposeCNJ(cnjWithZeros)
      expect(result.lawsuitNumber).toBe('0000001')
      expect(result.verifyingDigit).toBe('01')
    })

    test('should handle maximum length formatted CNJ', () => {
      const maxCNJ = '9999999-99.2099.9.99.9999'
      const result = decomposeCNJ(maxCNJ)
      expect(result.lawsuitNumber).toBe('9999999')
      expect(result.segment).toBe('9')
    })

    test('should generate TJ code based on segment', () => {
      const result = decomposeCNJ(validCNJFormatted)
      // Should have some TJ code generated
      expect(result.tj).toBeDefined()
      expect(typeof result.tj).toBe('string')
    })
  })
})
