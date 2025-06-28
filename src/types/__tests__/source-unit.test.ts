/**
 * Tests for source unit types and interfaces
 */

import type { SourceUnit } from '../source-unit'
import { SOURCE_UNIT_CONFIG, SourceUnitType } from '../source-unit'

describe('Source Unit Types', () => {
  describe('SourceUnit', () => {
    test('should have required properties', () => {
      const sourceUnit: SourceUnit = {
        sourceUnitType: 'foro',
        sourceUnitNumber: '0158',
      }

      expect(typeof sourceUnit.sourceUnitType).toBe('string')
      expect(typeof sourceUnit.sourceUnitNumber).toBe('string')
    })

    test('should accept various source unit types', () => {
      const sourceUnits: SourceUnit[] = [
        { sourceUnitType: 'foro', sourceUnitNumber: '0158' },
        { sourceUnitType: 'subseção judiciária', sourceUnitNumber: '5001' },
        { sourceUnitType: 'vara do trabalho', sourceUnitNumber: '0001' },
        { sourceUnitType: 'zona eleitoral', sourceUnitNumber: '0142' },
        { sourceUnitType: 'auditoria militar', sourceUnitNumber: '0001' },
      ]

      sourceUnits.forEach((unit) => {
        expect(unit.sourceUnitType).toBeTruthy()
        expect(unit.sourceUnitNumber).toBeTruthy()
        expect(unit.sourceUnitNumber).toMatch(/^\d+$|^[A-Z0-9]+$/) // Numeric or alphanumeric
      })
    })

    test('should handle different number formats', () => {
      const units: SourceUnit[] = [
        { sourceUnitType: 'foro', sourceUnitNumber: '0158' }, // Zero-padded
        { sourceUnitType: 'vara', sourceUnitNumber: '1' }, // Single digit
        { sourceUnitType: 'juizado', sourceUnitNumber: '5001' }, // Four digits
        { sourceUnitType: 'tribunal', sourceUnitNumber: 'STF' }, // Text code
      ]

      units.forEach((unit) => {
        expect(unit.sourceUnitNumber.length).toBeGreaterThan(0)
      })
    })
  })

  describe('SourceUnitType', () => {
    test('should have all expected source unit types', () => {
      const expectedTypes = [
        'JUSTICE_SECTION',
        'LABOR_UNIT',
        'ELECTORAL_UNIT',
        'MILITARY_UNIT',
        'CIVIL_UNIT',
        'COURT_UNIT_SINGLE',
        'COURT_UNIT',
      ]

      expectedTypes.forEach((type) => {
        expect(type in SourceUnitType).toBe(true)
      })
    })

    test('should have correct Portuguese descriptions', () => {
      expect(SourceUnitType.JUSTICE_SECTION).toBe('subseção judiciária')
      expect(SourceUnitType.LABOR_UNIT).toBe('vara do trabalho')
      expect(SourceUnitType.ELECTORAL_UNIT).toBe('zona eleitoral')
      expect(SourceUnitType.MILITARY_UNIT).toBe('auditoria militar')
      expect(SourceUnitType.CIVIL_UNIT).toBe('foro')
      expect(SourceUnitType.COURT_UNIT_SINGLE).toBe(
        'competência originária do Tribunal',
      )
      expect(SourceUnitType.COURT_UNIT).toBe(
        'competência originária da Turma Recursal',
      )
    })

    test('should have string values for all types', () => {
      Object.values(SourceUnitType).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    })

    test('should represent Brazilian judicial system structure', () => {
      const judicialTypes = [
        SourceUnitType.JUSTICE_SECTION, // Federal courts
        SourceUnitType.LABOR_UNIT, // Labor courts
        SourceUnitType.ELECTORAL_UNIT, // Electoral courts
        SourceUnitType.MILITARY_UNIT, // Military courts
        SourceUnitType.CIVIL_UNIT, // State courts
      ]

      judicialTypes.forEach((type) => {
        const hasJudicialKeyword =
          type.includes('judiciária') ||
          type.includes('vara') ||
          type.includes('zona') ||
          type.includes('auditoria') ||
          type.includes('foro') ||
          type.includes('competência')

        expect(hasJudicialKeyword).toBe(true)
      })
    })
  })

  describe('SOURCE_UNIT_CONFIG', () => {
    test('should have configuration for all segments (1-9)', () => {
      for (let segment = 1; segment <= 9; segment++) {
        expect(segment in SOURCE_UNIT_CONFIG).toBe(true)
        expect(typeof SOURCE_UNIT_CONFIG[segment]).toBe('string')
      }
    })

    test('should have correct segment mappings', () => {
      expect(SOURCE_UNIT_CONFIG[1]).toBe(SourceUnitType.COURT_UNIT_SINGLE) // STF
      expect(SOURCE_UNIT_CONFIG[2]).toBe(SourceUnitType.COURT_UNIT_SINGLE) // CNJ
      expect(SOURCE_UNIT_CONFIG[3]).toBe(SourceUnitType.COURT_UNIT_SINGLE) // STJ
      expect(SOURCE_UNIT_CONFIG[4]).toBe(SourceUnitType.JUSTICE_SECTION) // TRF
      expect(SOURCE_UNIT_CONFIG[5]).toBe(SourceUnitType.LABOR_UNIT) // TRT
      expect(SOURCE_UNIT_CONFIG[6]).toBe(SourceUnitType.ELECTORAL_UNIT) // TRE
      expect(SOURCE_UNIT_CONFIG[7]).toBe(SourceUnitType.MILITARY_UNIT) // STM
      expect(SOURCE_UNIT_CONFIG[8]).toBe(SourceUnitType.CIVIL_UNIT) // TJ
      expect(SOURCE_UNIT_CONFIG[9]).toBe(SourceUnitType.MILITARY_UNIT) // TJM
    })

    test('should reflect judicial hierarchy correctly', () => {
      // Superior courts (1-3) should have court unit single
      ;[1, 2, 3].forEach((segment) => {
        expect(SOURCE_UNIT_CONFIG[segment]).toBe(
          SourceUnitType.COURT_UNIT_SINGLE,
        )
      })

      // Specialized jurisdictions should have specific types
      expect(SOURCE_UNIT_CONFIG[4]).toBe(SourceUnitType.JUSTICE_SECTION) // Federal
      expect(SOURCE_UNIT_CONFIG[5]).toBe(SourceUnitType.LABOR_UNIT) // Labor
      expect(SOURCE_UNIT_CONFIG[6]).toBe(SourceUnitType.ELECTORAL_UNIT) // Electoral
      expect(SOURCE_UNIT_CONFIG[7]).toBe(SourceUnitType.MILITARY_UNIT) // Military Union
      expect(SOURCE_UNIT_CONFIG[8]).toBe(SourceUnitType.CIVIL_UNIT) // State
      expect(SOURCE_UNIT_CONFIG[9]).toBe(SourceUnitType.MILITARY_UNIT) // Military State
    })

    test('should have valid SourceUnitType values', () => {
      Object.values(SOURCE_UNIT_CONFIG).forEach((configValue) => {
        const isValidType = Object.values(SourceUnitType).includes(
          configValue as SourceUnitType,
        )
        expect(isValidType).toBe(true)
      })
    })
  })

  describe('Type Integration', () => {
    test('should work together in typical usage scenarios', () => {
      const getSourceUnitInfo = (
        segment: number,
        unitNumber: string,
      ): SourceUnit => {
        const unitType = SOURCE_UNIT_CONFIG[segment]
        return {
          sourceUnitType: unitType,
          sourceUnitNumber: unitNumber,
        }
      }

      const stateCourtUnit = getSourceUnitInfo(8, '0158')
      const federalUnit = getSourceUnitInfo(4, '5001')
      const laborUnit = getSourceUnitInfo(5, '0001')

      expect(stateCourtUnit.sourceUnitType).toBe(SourceUnitType.CIVIL_UNIT)
      expect(federalUnit.sourceUnitType).toBe(SourceUnitType.JUSTICE_SECTION)
      expect(laborUnit.sourceUnitType).toBe(SourceUnitType.LABOR_UNIT)
    })

    test('should validate segment/type consistency', () => {
      const validateSourceUnit = (
        segment: number,
        unit: SourceUnit,
      ): boolean => {
        const expectedType = SOURCE_UNIT_CONFIG[segment]
        return unit.sourceUnitType === expectedType
      }

      const validUnit: SourceUnit = {
        sourceUnitType: SourceUnitType.CIVIL_UNIT,
        sourceUnitNumber: '0158',
      }

      const invalidUnit: SourceUnit = {
        sourceUnitType: SourceUnitType.LABOR_UNIT,
        sourceUnitNumber: '0158',
      }

      expect(validateSourceUnit(8, validUnit)).toBe(true) // TJ with civil unit
      expect(validateSourceUnit(8, invalidUnit)).toBe(false) // TJ with labor unit
    })

    test('should support lookup operations', () => {
      const findSourceUnitType = (
        segment: number,
      ): SourceUnitType | undefined => {
        return SOURCE_UNIT_CONFIG[segment] as SourceUnitType
      }

      expect(findSourceUnitType(8)).toBe(SourceUnitType.CIVIL_UNIT)
      expect(findSourceUnitType(5)).toBe(SourceUnitType.LABOR_UNIT)
      expect(findSourceUnitType(10)).toBeUndefined() // Invalid segment
    })
  })

  describe('Real-world Usage Patterns', () => {
    test('should handle typical CNJ source unit scenarios', () => {
      const scenarios = [
        {
          segment: 8,
          unitNumber: '0158',
          expectedType: SourceUnitType.CIVIL_UNIT,
        },
        {
          segment: 4,
          unitNumber: '5001',
          expectedType: SourceUnitType.JUSTICE_SECTION,
        },
        {
          segment: 5,
          unitNumber: '0001',
          expectedType: SourceUnitType.LABOR_UNIT,
        },
        {
          segment: 6,
          unitNumber: '0142',
          expectedType: SourceUnitType.ELECTORAL_UNIT,
        },
        {
          segment: 7,
          unitNumber: '0001',
          expectedType: SourceUnitType.MILITARY_UNIT,
        },
      ]

      scenarios.forEach(({ segment, unitNumber, expectedType }) => {
        const sourceUnit: SourceUnit = {
          sourceUnitType: SOURCE_UNIT_CONFIG[segment],
          sourceUnitNumber: unitNumber,
        }

        expect(sourceUnit.sourceUnitType).toBe(expectedType)
        expect(sourceUnit.sourceUnitNumber).toBe(unitNumber)
      })
    })

    test('should work with array operations', () => {
      const sourceUnits: SourceUnit[] = [
        { sourceUnitType: SourceUnitType.CIVIL_UNIT, sourceUnitNumber: '0158' },
        { sourceUnitType: SourceUnitType.LABOR_UNIT, sourceUnitNumber: '0001' },
      ]

      const types = sourceUnits.map((unit) => unit.sourceUnitType)
      const numbers = sourceUnits.map((unit) => unit.sourceUnitNumber)

      expect(types).toEqual([
        SourceUnitType.CIVIL_UNIT,
        SourceUnitType.LABOR_UNIT,
      ])
      expect(numbers).toEqual(['0158', '0001'])
    })

    test('should support filtering operations', () => {
      const allUnits: SourceUnit[] = [
        { sourceUnitType: SourceUnitType.CIVIL_UNIT, sourceUnitNumber: '0158' },
        { sourceUnitType: SourceUnitType.LABOR_UNIT, sourceUnitNumber: '0001' },
        { sourceUnitType: SourceUnitType.CIVIL_UNIT, sourceUnitNumber: '0159' },
      ]

      const civilUnits = allUnits.filter(
        (unit) => unit.sourceUnitType === SourceUnitType.CIVIL_UNIT,
      )

      expect(civilUnits).toHaveLength(2)
      expect(civilUnits[0].sourceUnitNumber).toBe('0158')
      expect(civilUnits[1].sourceUnitNumber).toBe('0159')
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty source unit numbers', () => {
      const unit: SourceUnit = {
        sourceUnitType: SourceUnitType.CIVIL_UNIT,
        sourceUnitNumber: '',
      }

      expect(unit.sourceUnitNumber).toBe('')
      expect(unit.sourceUnitType).toBe(SourceUnitType.CIVIL_UNIT)
    })

    test('should handle very long source unit descriptions', () => {
      const unit: SourceUnit = {
        sourceUnitType:
          'Vara Especializada de Violência Doméstica e Familiar contra a Mulher',
        sourceUnitNumber: '0001',
      }

      expect(unit.sourceUnitType.length).toBeGreaterThan(20)
      expect(unit.sourceUnitNumber).toBe('0001')
    })

    test('should handle special source unit numbers', () => {
      const specialUnits: SourceUnit[] = [
        {
          sourceUnitType: SourceUnitType.COURT_UNIT_SINGLE,
          sourceUnitNumber: '0000',
        },
        { sourceUnitType: SourceUnitType.CIVIL_UNIT, sourceUnitNumber: '9999' },
        {
          sourceUnitType: SourceUnitType.JUSTICE_SECTION,
          sourceUnitNumber: 'STF',
        },
      ]

      specialUnits.forEach((unit) => {
        expect(unit.sourceUnitNumber).toBeTruthy()
        expect(typeof unit.sourceUnitNumber).toBe('string')
      })
    })

    test('should handle case sensitivity in type matching', () => {
      const type1 = SourceUnitType.CIVIL_UNIT
      const type2 = 'foro'

      expect(type1).toBe(type2)
      expect(type1.toLowerCase()).toBe(type2.toLowerCase())
    })
  })
})
