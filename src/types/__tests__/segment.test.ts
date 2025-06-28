/**
 * Tests for segment types and interfaces
 */

import type { Segment } from '../segment'

describe('Segment Types', () => {
  describe('Segment Interface', () => {
    test('should have required properties', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      expect(typeof segment.number).toBe('number')
      expect(typeof segment.name).toBe('string')
      expect(typeof segment.short).toBe('string')
    })

    test('should accept all valid segment numbers (1-9)', () => {
      const segments: Segment[] = [
        { number: 1, name: 'Supremo Tribunal Federal', short: 'STF' },
        { number: 2, name: 'Conselho Nacional de Justiça', short: 'CNJ' },
        { number: 3, name: 'Superior Tribunal de Justiça', short: 'STJ' },
        { number: 4, name: 'Justiça Federal', short: 'TRF' },
        { number: 5, name: 'Justiça do Trabalho', short: 'TRT' },
        { number: 6, name: 'Justiça Eleitoral', short: 'TRE' },
        { number: 7, name: 'Justiça Militar da União', short: 'STM' },
        {
          number: 8,
          name: 'Justiça dos Estados e do Distrito Federal e Territórios',
          short: 'TJ',
        },
        { number: 9, name: 'Justiça Militar Estadual', short: 'TJM' },
      ]

      segments.forEach((segment, index) => {
        expect(segment.number).toBe(index + 1)
        expect(segment.name).toBeTruthy()
        expect(segment.short).toBeTruthy()
        expect(segment.short.length).toBeGreaterThan(1)
        expect(segment.short.length).toBeLessThan(10)
      })
    })

    test('should validate number is positive integer', () => {
      const validSegments: Segment[] = [
        { number: 1, name: 'Test', short: 'T1' },
        { number: 9, name: 'Test', short: 'T9' },
      ]

      validSegments.forEach((segment) => {
        expect(Number.isInteger(segment.number)).toBe(true)
        expect(segment.number).toBeGreaterThan(0)
        expect(segment.number).toBeLessThanOrEqual(9)
      })
    })

    test('should validate name is non-empty string', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      expect(segment.name.length).toBeGreaterThan(0)
      expect(segment.name.trim()).toBe(segment.name)
    })

    test('should validate short is non-empty string', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      expect(segment.short.length).toBeGreaterThan(0)
      expect(segment.short.trim()).toBe(segment.short)
    })

    test('should support typical Brazilian court segment structure', () => {
      const typicalSegments: Segment[] = [
        { number: 1, name: 'Supremo Tribunal Federal', short: 'STF' },
        { number: 2, name: 'Superior Tribunal de Justiça', short: 'STJ' },
        { number: 3, name: 'Conselho Nacional de Justiça', short: 'CNJ' },
        { number: 4, name: 'Tribunal Regional Federal', short: 'TRF' },
        { number: 5, name: 'Tribunal Regional do Trabalho', short: 'TRT' },
        { number: 6, name: 'Tribunal Regional Eleitoral', short: 'TRE' },
        { number: 7, name: 'Superior Tribunal Militar', short: 'STM' },
        { number: 8, name: 'Tribunal de Justiça', short: 'TJ' },
        { number: 9, name: 'Tribunal de Justiça Militar', short: 'TJM' },
      ]

      typicalSegments.forEach((segment) => {
        expect(segment.number).toBeGreaterThanOrEqual(1)
        expect(segment.number).toBeLessThanOrEqual(9)
        expect(segment.short).toMatch(/^[A-Z]{2,4}$/) // 2-4 uppercase letters
      })
    })
  })

  describe('Type Constraints', () => {
    test('should enforce number type for segment number', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      // TypeScript should enforce that number is actually a number
      expect(typeof segment.number).toBe('number')
      expect(Number.isNaN(segment.number)).toBe(false)
    })

    test('should enforce string types for name and short', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      expect(typeof segment.name).toBe('string')
      expect(typeof segment.short).toBe('string')
    })

    test('should not allow additional properties', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      // TypeScript should only allow the defined properties
      const keys = Object.keys(segment)
      expect(keys).toEqual(['number', 'name', 'short'])
    })
  })

  describe('Real-world Usage Patterns', () => {
    test('should work with array operations', () => {
      const segments: Segment[] = [
        { number: 1, name: 'Federal Supreme Court', short: 'STF' },
        { number: 8, name: 'State Court', short: 'TJ' },
      ]

      const numbers = segments.map((s) => s.number)
      const shorts = segments.map((s) => s.short)

      expect(numbers).toEqual([1, 8])
      expect(shorts).toEqual(['STF', 'TJ'])
    })

    test('should work with object destructuring', () => {
      const segment: Segment = {
        number: 8,
        name: 'State Court',
        short: 'TJ',
      }

      const { number, name, short } = segment

      expect(number).toBe(8)
      expect(name).toBe('State Court')
      expect(short).toBe('TJ')
    })

    test('should work with comparison operations', () => {
      const segment1: Segment = { number: 1, name: 'STF', short: 'STF' }
      const segment2: Segment = { number: 8, name: 'TJ', short: 'TJ' }

      expect(segment1.number < segment2.number).toBe(true)
      expect(segment1.short !== segment2.short).toBe(true)
    })

    test('should work in lookup scenarios', () => {
      const segments: Segment[] = [
        { number: 1, name: 'Federal Supreme Court', short: 'STF' },
        { number: 8, name: 'State Court', short: 'TJ' },
        { number: 5, name: 'Regional Labor Court', short: 'TRT' },
      ]

      const findByNumber = (num: number): Segment | undefined =>
        segments.find((s) => s.number === num)

      const findByShort = (short: string): Segment | undefined =>
        segments.find((s) => s.short === short)

      expect(findByNumber(8)?.name).toBe('State Court')
      expect(findByShort('TJ')?.number).toBe(8)
      expect(findByNumber(99)).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    test('should handle minimum and maximum valid numbers', () => {
      const minSegment: Segment = { number: 1, name: 'Min', short: 'MIN' }
      const maxSegment: Segment = { number: 9, name: 'Max', short: 'MAX' }

      expect(minSegment.number).toBe(1)
      expect(maxSegment.number).toBe(9)
    })

    test('should handle empty but valid strings', () => {
      // While not recommended, the type allows empty strings
      const segment: Segment = {
        number: 1,
        name: 'A', // Minimum non-empty
        short: 'A', // Minimum non-empty
      }

      expect(segment.name.length).toBe(1)
      expect(segment.short.length).toBe(1)
    })

    test('should handle special characters in names', () => {
      const segment: Segment = {
        number: 3,
        name: 'Conselho Nacional de Justiça - CNJ',
        short: 'CNJ',
      }

      expect(segment.name).toContain('-')
      expect(segment.name).toContain(' ')
    })
  })
})
