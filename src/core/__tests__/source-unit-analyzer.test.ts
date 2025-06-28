/**
 * Comprehensive tests for source unit analyzer module
 */

import { Segment } from '../../types/segment'
import { SourceUnitType } from '../../types/source-unit'
import {
  getSourceUnit,
  getSourceUnitTypeBySegment,
  isValidSourceUnit,
} from '../source-unit-analyzer'

describe('Source Unit Analyzer', () => {
  // Mock segment data for testing
  const mockSegments: { [key: number]: Segment } = {
    1: { number: 1, name: 'Federal Supreme Court', short: 'STF' },
    2: { number: 2, name: 'Superior Court of Justice', short: 'STJ' },
    3: { number: 3, name: 'National Council of Justice', short: 'CNJ' },
    4: { number: 4, name: 'Regional Federal Court', short: 'TRF' },
    5: { number: 5, name: 'Regional Labor Court', short: 'TRT' },
    6: { number: 6, name: 'Regional Electoral Court', short: 'TRE' },
    7: { number: 7, name: 'Superior Military Court', short: 'STM' },
    8: { number: 8, name: 'State Court', short: 'TJ' },
    9: { number: 9, name: 'State Military Court', short: 'TJM' },
  }

  describe('getSourceUnit', () => {
    test('should handle zero sequence (original jurisdiction)', () => {
      const result = getSourceUnit('0000', mockSegments[8])
      expect(result.sourceUnitType).toBe(SourceUnitType.COURT_UNIT_SINGLE)
      expect(result.sourceUnitNumber).toBe('0000')
    })

    test('should handle first digit 9 (appeal panel jurisdiction)', () => {
      const result = getSourceUnit('9001', mockSegments[8])
      expect(result.sourceUnitType).toBe(SourceUnitType.COURT_UNIT)
      expect(result.sourceUnitNumber).toBe('9001')
    })

    test('should handle regular source units for different segments', () => {
      const testCases = [
        { unit: '0158', segment: mockSegments[8] },
        { unit: '0001', segment: mockSegments[4] },
        { unit: '0123', segment: mockSegments[5] },
        { unit: '0456', segment: mockSegments[6] },
      ]

      testCases.forEach(({ unit, segment }) => {
        const result = getSourceUnit(unit, segment)
        expect(result.sourceUnitNumber).toBe(unit)
        expect(result.sourceUnitType).toBeTruthy()
        expect(typeof result.sourceUnitType).toBe('string')
      })
    })

    test('should return correct source unit type based on segment', () => {
      // Test different segments return appropriate unit types
      const segments = [1, 2, 3, 4, 5, 6, 7, 8, 9]

      segments.forEach((segmentNum) => {
        const result = getSourceUnit('0123', mockSegments[segmentNum])
        expect(result.sourceUnitType).toBeTruthy()
        // The type should be one of the defined source unit types
        expect(Object.values(SourceUnitType)).toContain(result.sourceUnitType)
      })
    })

    test('should handle edge case source units', () => {
      const edgeCases = [
        '0001', // Minimum non-zero
        '9999', // Maximum with 9 prefix
        '1000', // Typical court unit
        '8999', // High number without 9 prefix
      ]

      edgeCases.forEach((unit) => {
        const result = getSourceUnit(unit, mockSegments[8])
        expect(result.sourceUnitNumber).toBe(unit)
        expect(result.sourceUnitType).toBeTruthy()
      })
    })
  })

  describe('isValidSourceUnit', () => {
    test('should validate correct 4-digit source units', () => {
      const validUnits = ['0000', '0001', '0158', '9999', '1234']

      validUnits.forEach((unit) => {
        expect(isValidSourceUnit(unit)).toBe(true)
      })
    })

    test('should reject invalid source units', () => {
      const invalidUnits = [
        '', // Empty
        '123', // Too short
        '12345', // Too long
        'abcd', // Non-numeric
        '12ab', // Mixed
        ' 123', // With spaces
        '123 ', // With trailing space
      ]

      invalidUnits.forEach((unit) => {
        expect(isValidSourceUnit(unit)).toBe(false)
      })
    })
  })

  describe('getSourceUnitTypeBySegment', () => {
    test('should return valid source unit types for all segments', () => {
      const segments = [1, 2, 3, 4, 5, 6, 7, 8, 9]

      segments.forEach((segmentNum) => {
        const unitType = getSourceUnitTypeBySegment(segmentNum)
        expect(Object.values(SourceUnitType)).toContain(unitType)
      })
    })

    test('should return default type for unknown segments', () => {
      const unknownSegment = 99
      const unitType = getSourceUnitTypeBySegment(unknownSegment)
      expect(unitType).toBe(SourceUnitType.CIVIL_UNIT)
    })

    test('should be consistent with getSourceUnit results', () => {
      const segments = [1, 2, 3, 4, 5, 6, 7, 8, 9]

      segments.forEach((segmentNum) => {
        const directType = getSourceUnitTypeBySegment(segmentNum)
        const resultFromUnit = getSourceUnit('0123', mockSegments[segmentNum])

        // Should match for regular units (not special cases)
        expect(resultFromUnit.sourceUnitType).toBe(directType)
      })
    })
  })

  describe('Special Cases and Edge Conditions', () => {
    test('should handle all zero combinations', () => {
      // Only '0000' should be treated as special case
      const zeroVariants = ['0000', '0010', '0100', '1000']

      const result0000 = getSourceUnit(zeroVariants[0], mockSegments[8])
      expect(result0000.sourceUnitType).toBe(SourceUnitType.COURT_UNIT_SINGLE)

      // Other variants should be treated normally
      zeroVariants.slice(1).forEach((unit) => {
        const result = getSourceUnit(unit, mockSegments[8])
        expect(result.sourceUnitType).not.toBe(SourceUnitType.COURT_UNIT_SINGLE)
      })
    })

    test('should handle all 9xxx combinations', () => {
      const nineVariants = ['9000', '9001', '9100', '9999']

      nineVariants.forEach((unit) => {
        const result = getSourceUnit(unit, mockSegments[8])
        expect(result.sourceUnitType).toBe(SourceUnitType.COURT_UNIT)
        expect(result.sourceUnitNumber).toBe(unit)
      })
    })

    test('should maintain consistency across different segments', () => {
      const unit = '0158'
      const results = Object.values(mockSegments).map((segment) =>
        getSourceUnit(unit, segment),
      )

      // All should have the same source unit number
      results.forEach((result) => {
        expect(result.sourceUnitNumber).toBe(unit)
      })

      // Source unit types may differ by segment, but should all be valid
      results.forEach((result) => {
        expect(Object.values(SourceUnitType)).toContain(result.sourceUnitType)
      })
    })

    test('should handle boundary values correctly', () => {
      const boundaryTests = [
        {
          unit: '0000',
          expectsSpecial: true,
          specialType: SourceUnitType.COURT_UNIT_SINGLE,
        },
        { unit: '0001', expectsSpecial: false },
        { unit: '8999', expectsSpecial: false },
        {
          unit: '9000',
          expectsSpecial: true,
          specialType: SourceUnitType.COURT_UNIT,
        },
        {
          unit: '9999',
          expectsSpecial: true,
          specialType: SourceUnitType.COURT_UNIT,
        },
      ]

      boundaryTests.forEach(({ unit, expectsSpecial, specialType }) => {
        const result = getSourceUnit(unit, mockSegments[8])

        if (expectsSpecial && specialType) {
          expect(result.sourceUnitType).toBe(specialType)
        } else {
          // Should use segment-based configuration
          const expectedType = getSourceUnitTypeBySegment(8)
          expect(result.sourceUnitType).toBe(expectedType)
        }
      })
    })
  })
})
