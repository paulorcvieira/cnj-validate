/**
 * Comprehensive tests for court analyzer module
 */

import { Segment } from '../../types/segment'
import { getMaxCourtBySegment, getOriginCourt } from '../court-analyzer'

describe('Court Analyzer', () => {
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

  describe('getOriginCourt', () => {
    test('should handle original lawsuit court code (00)', () => {
      const result = getOriginCourt('00', mockSegments[1])
      expect(result.originCourtType).toBe('Processo Originário')
      expect(result.originCourtNumber).toContain('STF')
    })

    test('should handle Superior Labor Court (00 + segment 5)', () => {
      const result = getOriginCourt('00', mockSegments[5])
      expect(result.originCourtType).toBe('Processo Originário')
      expect(result.originCourtNumber).toContain('TST')
    })

    test('should handle Superior Electoral Court (00 + segment 6)', () => {
      const result = getOriginCourt('00', mockSegments[6])
      expect(result.originCourtType).toBe('Processo Originário')
      expect(result.originCourtNumber).toContain('TSE')
    })

    test('should handle Superior Military Court (00 + segment 7)', () => {
      const result = getOriginCourt('00', mockSegments[7])
      expect(result.originCourtType).toBe('Processo Originário')
      expect(result.originCourtNumber).toContain('STM')
    })

    test('should handle council court code (90)', () => {
      const result = getOriginCourt('90', mockSegments[4])
      expect(result.originCourtType).toBe('Processo Originário')
      expect(result.originCourtNumber).toContain('Conselho da Justiça Federal')
    })

    test('should handle Superior Council of Labor Justice (90 + segment 5)', () => {
      const result = getOriginCourt('90', mockSegments[5])
      expect(result.originCourtType).toBe('Processo Originário')
      expect(result.originCourtNumber).toContain(
        'Conselho Superior da Justiça do Trabalho',
      )
    })

    test('should handle regular court numbers for segment 4 (TRF)', () => {
      const result = getOriginCourt('01', mockSegments[4])
      expect(result.originCourtType).toBe('região')
      expect(result.originCourtNumber).toBe('1')
    })

    test('should handle regular court numbers for segment 5 (TRT)', () => {
      const result = getOriginCourt('15', mockSegments[5])
      expect(result.originCourtType).toBe('região')
      expect(result.originCourtNumber).toBe('15')
    })

    test('should handle state courts (segment 6)', () => {
      const result = getOriginCourt('12', mockSegments[6])
      expect(result.originCourtType).toBe('unidade federativa')
      expect(result.originCourtNumber).toBe('12')
    })

    test('should handle state courts (segment 8)', () => {
      const result = getOriginCourt('26', mockSegments[8])
      expect(result.originCourtType).toBe('unidade federativa')
      expect(result.originCourtNumber).toBe('26')
    })

    test('should handle judicial circuit (segment 7)', () => {
      const result = getOriginCourt('03', mockSegments[7])
      expect(result.originCourtType).toBe('circunscrição judiciária')
      expect(result.originCourtNumber).toBe('3')
    })

    test('should handle military courts (segment 9)', () => {
      // Test with MG military court code
      const result = getOriginCourt('13', mockSegments[9]) // MG = 13
      expect(result.originCourtType).toBe('Tribunal Militar Estadual')
      expect(result.originCourtNumber).toContain('Minas Gerais')
    })

    test('should throw error for invalid court code (00) with unsupported segment', () => {
      expect(() => getOriginCourt('00', mockSegments[8])).toThrow()
    })

    test('should throw error for invalid court code (90) with unsupported segment', () => {
      expect(() => getOriginCourt('90', mockSegments[8])).toThrow()
    })

    test('should throw error for invalid military court code', () => {
      expect(() => getOriginCourt('99', mockSegments[9])).toThrow()
    })

    test('should throw error for non-numeric court code', () => {
      expect(() => getOriginCourt('AA', mockSegments[4])).toThrow()
    })
  })

  describe('getMaxCourtBySegment', () => {
    test('should return correct limits for known segments', () => {
      expect(getMaxCourtBySegment(4)).toBe(5) // TRF
      expect(getMaxCourtBySegment(5)).toBe(24) // TRT
      expect(getMaxCourtBySegment(8)).toBe(27) // TJ
    })

    test('should return 0 for unknown segments', () => {
      expect(getMaxCourtBySegment(10)).toBe(0)
      expect(getMaxCourtBySegment(-1)).toBe(0)
    })

    test('should handle all valid segment numbers', () => {
      for (let i = 1; i <= 9; i++) {
        const max = getMaxCourtBySegment(i)
        expect(typeof max).toBe('number')
        expect(max).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('Edge Cases', () => {
    test('should handle court validation limits', () => {
      // Test boundary conditions
      expect(() => getOriginCourt('-1', mockSegments[4])).toThrow()
      expect(() => getOriginCourt('100', mockSegments[4])).toThrow()
    })

    test('should handle military court edge cases', () => {
      const segment9 = mockSegments[9]
      const validCodes = ['13', '21', '26'] // MG, RS, SP

      validCodes.forEach((code) => {
        const result = getOriginCourt(code, segment9)
        expect(result.originCourtType).toBe('Tribunal Militar Estadual')
        expect(result.originCourtNumber).toBeTruthy()
      })
    })

    test('should maintain consistency in court type naming', () => {
      const segment4 = mockSegments[4]
      const segment5 = mockSegments[5]

      const results = [
        getOriginCourt('01', segment4),
        getOriginCourt('02', segment5),
      ]

      results.forEach((result) => {
        expect(result.originCourtType).toBe('região')
        expect(result.originCourtNumber).toMatch(/^\d+$/)
      })
    })
  })
})
