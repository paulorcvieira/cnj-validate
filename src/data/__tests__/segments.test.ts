/**
 * Tests for segments data module
 */

import { getAllSegments, getSegment } from '../segments'

describe('Segments Data', () => {
  describe('getSegment', () => {
    test('should return segment for valid segment number', () => {
      const segment = getSegment('8')
      expect(segment).toBeTruthy()
      expect(segment?.number).toBe(8)
      expect(segment?.short).toBe('TJ')
      expect(segment?.name).toBeTruthy()
    })

    test('should return segment for all valid segments (1-9)', () => {
      for (let i = 1; i <= 9; i++) {
        const segment = getSegment(i.toString())
        expect(segment).toBeTruthy()
        expect(segment?.number).toBe(i)
        expect(segment?.short).toBeTruthy()
        expect(segment?.name).toBeTruthy()
      }
    })

    test('should return null for invalid segment', () => {
      expect(getSegment('0')).toBeNull()
      expect(getSegment('10')).toBeNull()
      expect(getSegment('invalid')).toBeNull()
      expect(getSegment('')).toBeNull()
    })

    test('should handle string and number inputs', () => {
      const segment1 = getSegment('8')
      const segment2 = getSegment(8)

      expect(segment1).toEqual(segment2)
    })
  })

  describe('getAllSegments', () => {
    test('should return all segments', () => {
      const segments = getAllSegments()
      expect(segments).toHaveLength(9)

      // Check that all segments 1-9 are present
      for (let i = 1; i <= 9; i++) {
        const segment = segments.find((s) => s.number === i)
        expect(segment).toBeTruthy()
      }
    })

    test('should return segments with correct structure', () => {
      const segments = getAllSegments()

      segments.forEach((segment) => {
        expect(segment).toHaveProperty('number')
        expect(segment).toHaveProperty('name')
        expect(segment).toHaveProperty('short')
        expect(typeof segment.number).toBe('number')
        expect(typeof segment.name).toBe('string')
        expect(typeof segment.short).toBe('string')
      })
    })

    test('should return segments sorted by number', () => {
      const segments = getAllSegments()

      for (let i = 0; i < segments.length - 1; i++) {
        expect(segments[i].number).toBeLessThan(segments[i + 1].number)
      }
    })
  })

  describe('Segment Data Integrity', () => {
    test('should have unique segment numbers', () => {
      const segments = getAllSegments()
      const numbers = segments.map((s) => s.number)
      const uniqueNumbers = [...new Set(numbers)]

      expect(numbers).toHaveLength(uniqueNumbers.length)
    })

    test('should have unique short names', () => {
      const segments = getAllSegments()
      const shorts = segments.map((s) => s.short)
      const uniqueShorts = [...new Set(shorts)]

      expect(shorts).toHaveLength(uniqueShorts.length)
    })

    test('should have non-empty names and shorts', () => {
      const segments = getAllSegments()

      segments.forEach((segment) => {
        expect(segment.name.trim()).toBeTruthy()
        expect(segment.short.trim()).toBeTruthy()
      })
    })

    test('should have reasonable short name lengths', () => {
      const segments = getAllSegments()

      segments.forEach((segment) => {
        expect(segment.short.length).toBeGreaterThan(1)
        expect(segment.short.length).toBeLessThan(10)
      })
    })
  })
})
