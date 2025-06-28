/**
 * Tests for court types and interfaces
 */

import type { OriginCourt } from '../court'
import { CourtType, MAX_COURT_BY_SEGMENT, SpecialCourtCode } from '../court'

describe('Court Types', () => {
  describe('SpecialCourtCode', () => {
    test('should have correct constant values', () => {
      expect(SpecialCourtCode.ORIGINAL).toBe('00')
      expect(SpecialCourtCode.COUNCIL).toBe('90')
    })

    test('should only contain string values', () => {
      Object.values(SpecialCourtCode).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBe(2)
      })
    })
  })

  describe('CourtType', () => {
    test('should have all expected court types', () => {
      const expectedTypes = [
        CourtType.ORIGINAL_LAWSUIT,
        CourtType.ESTATE,
        CourtType.REGION,
        CourtType.JUDICIAL_CIRCUIT,
        CourtType.MARTIAL_COURT,
      ]

      expectedTypes.forEach((type) => {
        expect(typeof type).toBe('string')
        expect(type.length).toBeGreaterThan(0)
      })
    })

    test('should represent Brazilian court system structure', () => {
      const originalLawsuit: CourtType = CourtType.ORIGINAL_LAWSUIT
      const estate: CourtType = CourtType.ESTATE
      const region: CourtType = CourtType.REGION
      const judicialCircuit: CourtType = CourtType.JUDICIAL_CIRCUIT
      const martialCourt: CourtType = CourtType.MARTIAL_COURT

      expect(originalLawsuit).toBe('Processo Originário')
      expect(estate).toBe('unidade federativa')
      expect(region).toBe('região')
      expect(judicialCircuit).toBe('circunscrição judiciária')
      expect(martialCourt).toBe('Tribunal Militar Estadual')
    })
  })

  describe('OriginCourt', () => {
    test('should have required properties', () => {
      const court: OriginCourt = {
        originCourtType: 'unidade federativa',
        originCourtNumber: '26',
      }

      expect(typeof court.originCourtType).toBe('string')
      expect(typeof court.originCourtNumber).toBe('string')
    })

    test('should accept all valid court types', () => {
      const courts: OriginCourt[] = [
        {
          originCourtType: CourtType.ORIGINAL_LAWSUIT,
          originCourtNumber: 'STF',
        },
        { originCourtType: CourtType.ESTATE, originCourtNumber: '26' },
        { originCourtType: CourtType.REGION, originCourtNumber: '3' },
        { originCourtType: CourtType.JUDICIAL_CIRCUIT, originCourtNumber: '1' },
        { originCourtType: CourtType.MARTIAL_COURT, originCourtNumber: 'SP' },
      ]

      courts.forEach((court) => {
        expect(court.originCourtType).toBeTruthy()
        expect(court.originCourtNumber).toBeTruthy()
      })
    })

    test('should handle numeric and text court numbers', () => {
      const numericCourt: OriginCourt = {
        originCourtType: CourtType.ESTATE,
        originCourtNumber: '26',
      }

      const textCourt: OriginCourt = {
        originCourtType: CourtType.ORIGINAL_LAWSUIT,
        originCourtNumber: 'Federal Supreme Court',
      }

      expect(numericCourt.originCourtNumber).toMatch(/^\d+$/)
      expect(textCourt.originCourtNumber).toMatch(/^[A-Za-z\s]+/)
    })
  })

  describe('MAX_COURT_BY_SEGMENT', () => {
    test('should have numeric values for each segment', () => {
      Object.values(MAX_COURT_BY_SEGMENT).forEach((maxCourt) => {
        expect(typeof maxCourt).toBe('number')
        expect(maxCourt).toBeGreaterThanOrEqual(0)
      })
    })

    test('should have keys for all segments (1-9)', () => {
      for (let segment = 1; segment <= 9; segment++) {
        expect(segment in MAX_COURT_BY_SEGMENT).toBe(true)
      }
    })

    test('should have reasonable maximum values', () => {
      Object.entries(MAX_COURT_BY_SEGMENT).forEach(([segment, maxCourt]) => {
        expect(parseInt(segment, 10)).toBeGreaterThanOrEqual(1)
        expect(parseInt(segment, 10)).toBeLessThanOrEqual(9)
        expect(maxCourt).toBeLessThan(1000) // Reasonable upper bound
      })
    })

    test('should reflect Brazilian judicial structure', () => {
      // Segment 8 (State Courts) should typically have higher limits
      const stateCourtMax = MAX_COURT_BY_SEGMENT[8]
      const federalMax = MAX_COURT_BY_SEGMENT[1]

      if (stateCourtMax !== undefined && federalMax !== undefined) {
        expect(typeof stateCourtMax).toBe('number')
        expect(typeof federalMax).toBe('number')
        expect(stateCourtMax).toBe(27) // 27 unidades federativas
        expect(federalMax).toBe(0) // STF - Processo originário
      }
    })
  })

  describe('Type Integration', () => {
    test('should work together in typical usage', () => {
      const specialCourt: OriginCourt = {
        originCourtType: CourtType.ORIGINAL_LAWSUIT,
        originCourtNumber: 'STF',
      }

      const regularCourt: OriginCourt = {
        originCourtType: CourtType.ESTATE,
        originCourtNumber: '26',
      }

      expect(specialCourt.originCourtType).toBe(CourtType.ORIGINAL_LAWSUIT)
      expect(regularCourt.originCourtType).toBe(CourtType.ESTATE)
    })

    test('should support court validation scenarios', () => {
      const isSpecialCode = (code: string): boolean =>
        Object.values(SpecialCourtCode).includes(code as any)

      expect(isSpecialCode('00')).toBe(true)
      expect(isSpecialCode('90')).toBe(true)
      expect(isSpecialCode('26')).toBe(false)
    })

    test('should handle court number validation', () => {
      const validateCourtNumber = (
        courtNumber: string,
        segment: number,
      ): boolean => {
        const maxCourt = MAX_COURT_BY_SEGMENT[segment]
        if (maxCourt === undefined) return false

        const num = parseInt(courtNumber, 10)
        return !isNaN(num) && num >= 0 && num <= maxCourt
      }

      // Test with known limits
      expect(validateCourtNumber('26', 8)).toBe(true) // Valid state court
      expect(validateCourtNumber('invalid', 8)).toBe(false)
      expect(validateCourtNumber('100', 8)).toBe(false) // Exceeds limit
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty court numbers', () => {
      const court: OriginCourt = {
        originCourtType: CourtType.ESTATE,
        originCourtNumber: '',
      }

      expect(court.originCourtNumber).toBe('')
    })

    test('should handle very long court descriptions', () => {
      const court: OriginCourt = {
        originCourtType: CourtType.ORIGINAL_LAWSUIT,
        originCourtNumber:
          'Very Long Court Name That Describes The Full Institution',
      }

      expect(court.originCourtNumber.length).toBeGreaterThan(10)
    })

    test('should maintain type safety with const assertions', () => {
      const originalCode = SpecialCourtCode.ORIGINAL as const
      const councilCode = SpecialCourtCode.COUNCIL as const

      expect(originalCode).toBe('00')
      expect(councilCode).toBe('90')
    })

    test('should validate court type enum values', () => {
      expect(CourtType.ORIGINAL_LAWSUIT).toBe('Processo Originário')
      expect(CourtType.MARTIAL_COURT).toBe('Tribunal Militar Estadual')
      expect(CourtType.REGION).toBe('região')
      expect(CourtType.ESTATE).toBe('unidade federativa')
      expect(CourtType.JUDICIAL_CIRCUIT).toBe('circunscrição judiciária')
    })
  })
})
