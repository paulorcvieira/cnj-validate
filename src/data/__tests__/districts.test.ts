/**
 * Tests for districts data module
 */

import {
  generateDistrictKey,
  getDistrictInfo,
  getDistrictsBySegment,
  getDistrictsByUF,
  hasDistrict,
} from '../districts'

describe('Districts Data', () => {
  describe('generateDistrictKey', () => {
    test('should generate correct key format', () => {
      const key = generateDistrictKey('8', '26', '0158')
      expect(key).toBe('8.26.0158')
    })

    test('should handle different segments', () => {
      const keys = [
        generateDistrictKey('1', '01', '0001'),
        generateDistrictKey('4', '03', '0123'),
        generateDistrictKey('8', '26', '0158'),
      ]

      keys.forEach((key) => {
        expect(key).toMatch(/^\d+\.\d+\.\d+$/)
      })
    })

    test('should be consistent', () => {
      const key1 = generateDistrictKey('8', '26', '0158')
      const key2 = generateDistrictKey('8', '26', '0158')
      expect(key1).toBe(key2)
    })
  })

  describe('getDistrictInfo', () => {
    test('should return district info for valid key', () => {
      const key = generateDistrictKey('8', '26', '0158')
      const info = getDistrictInfo(key)

      expect(info).not.toBeNull()
      if (info) {
        expect(info).toHaveProperty('sourceUnit')
        expect(info).toHaveProperty('uf')
        expect(typeof info.sourceUnit).toBe('string')
        expect(typeof info.uf).toBe('string')
        expect(info.sourceUnit).toBe('São Paulo')
        expect(info.uf).toBe('SP')
      }
    })

    test('should return null for non-existent key', () => {
      const nonExistentKey = 'invalid-key'
      const info = getDistrictInfo(nonExistentKey)
      expect(info).toBeNull()
    })

    test('should handle various key formats', () => {
      const keys = ['not-a-valid-key', '', '8.26', '8.26.0158.extra']

      keys.forEach((key) => {
        const info = getDistrictInfo(key)
        // Should either return valid info or null, never throw
        if (info) {
          expect(info).toHaveProperty('sourceUnit')
          expect(info).toHaveProperty('uf')
        } else {
          expect(info).toBeNull()
        }
      })
    })
  })

  describe('getDistrictsByUF', () => {
    test('should return districts for SP state', () => {
      const spDistricts = getDistrictsByUF('SP')
      expect(Array.isArray(spDistricts)).toBe(true)
      expect(spDistricts.length).toBeGreaterThan(0)

      spDistricts.forEach((district) => {
        expect(district.uf).toBe('SP')
      })
    })

    test('should return empty array for non-existent UF', () => {
      const districts = getDistrictsByUF('XX')
      expect(Array.isArray(districts)).toBe(true)
      expect(districts.length).toBe(0)
    })

    test('should handle case insensitive UF', () => {
      const upperCase = getDistrictsByUF('SP')
      const lowerCase = getDistrictsByUF('sp')
      expect(upperCase).toEqual(lowerCase)
    })
  })

  describe('getDistrictsBySegment', () => {
    test('should return districts for segment 8 (State Court)', () => {
      const stateDistricts = getDistrictsBySegment('8')
      expect(Array.isArray(stateDistricts)).toBe(true)
      expect(stateDistricts.length).toBeGreaterThan(0)
    })

    test('should return districts for segment 5 (Labor Court)', () => {
      const laborDistricts = getDistrictsBySegment('5')
      expect(Array.isArray(laborDistricts)).toBe(true)
      expect(laborDistricts.length).toBeGreaterThan(0)
    })

    test('should return empty array for non-existent segment', () => {
      const districts = getDistrictsBySegment('99')
      expect(Array.isArray(districts)).toBe(true)
      expect(districts.length).toBe(0)
    })
  })

  describe('hasDistrict', () => {
    test('should return true for existing districts', () => {
      expect(hasDistrict('8.26.0158')).toBe(true)
      expect(hasDistrict('5.01.0000')).toBe(true)
    })

    test('should return false for non-existing districts', () => {
      expect(hasDistrict('invalid-key')).toBe(false)
      expect(hasDistrict('99.99.9999')).toBe(false)
    })

    test('should handle empty string', () => {
      expect(hasDistrict('')).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    test('should handle real-world examples', () => {
      // Test with São Paulo districts
      const spKeys = [
        generateDistrictKey('8', '26', '0158'), // Capital
        generateDistrictKey('8', '26', '0100'), // Aguaí
      ]

      spKeys.forEach((key) => {
        const info = getDistrictInfo(key)
        if (info) {
          expect(info.uf).toBe('SP')
          expect(info.district).toBe('São Paulo')
        }
      })
    })

    test('should validate district info structure', () => {
      // Test with keys that exist in our sample data
      const testKeys = [
        '8.26.0158', // São Paulo
        '8.19.0001', // Rio de Janeiro
        '5.01.0000', // Rio de Janeiro Labor Court
      ]

      testKeys.forEach((key) => {
        const info = getDistrictInfo(key)
        if (info) {
          expect(typeof info.sourceUnit).toBe('string')
          expect(typeof info.uf).toBe('string')
          expect(typeof info.district).toBe('string')
          expect(info.uf.length).toBe(2) // UF should be 2 characters
          expect(info.sourceUnit.length).toBeGreaterThan(0)
          expect(info.district.length).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('Data Validation', () => {
    test('should validate UF codes for existing districts', () => {
      const validUFs = [
        'AC',
        'AL',
        'AP',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MT',
        'MS',
        'MG',
        'PA',
        'PB',
        'PR',
        'PE',
        'PI',
        'RJ',
        'RN',
        'RS',
        'RO',
        'RR',
        'SC',
        'SP',
        'SE',
        'TO',
      ]

      // Test some sample keys that exist
      const sampleKeys = [
        '8.26.0158', // São Paulo
        '8.19.0001', // Rio de Janeiro
        '8.13.0024', // Minas Gerais
      ]

      sampleKeys.forEach((key) => {
        const info = getDistrictInfo(key)
        if (info && info.uf) {
          expect(validUFs).toContain(info.uf)
        }
      })
    })

    test('should have consistent key format validation', () => {
      const key = generateDistrictKey('8', '26', '0158')
      expect(key).toMatch(/^\d+\.\d+\.\d+$/)

      const parts = key.split('.')
      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('8')
      expect(parts[1]).toBe('26')
      expect(parts[2]).toBe('0158')
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed inputs gracefully', () => {
      expect(() => generateDistrictKey('', '', '')).not.toThrow()
      expect(() => getDistrictInfo('')).not.toThrow()
      expect(() => getDistrictsByUF('')).not.toThrow()
      expect(() => getDistrictsBySegment('')).not.toThrow()
      expect(() => hasDistrict('')).not.toThrow()
    })

    test('should handle edge cases', () => {
      const edgeCases = [
        generateDistrictKey('0', '00', '0000'),
        generateDistrictKey('9', '99', '9999'),
        generateDistrictKey('10', '100', '10000'), // Invalid but shouldn't crash
      ]

      edgeCases.forEach((key) => {
        expect(() => getDistrictInfo(key)).not.toThrow()
        expect(() => hasDistrict(key)).not.toThrow()
      })
    })

    test('should return consistent results', () => {
      const key = '8.26.0158'
      const info1 = getDistrictInfo(key)
      const info2 = getDistrictInfo(key)
      expect(info1).toEqual(info2)

      const exists1 = hasDistrict(key)
      const exists2 = hasDistrict(key)
      expect(exists1).toBe(exists2)
    })
  })
})
