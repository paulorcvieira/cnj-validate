/**
 * Testes básicos para CNJ Validate
 */

import { analyzeCNJ, formatCNJ, isValidCNJ, validateCNJ } from '../src/index'

describe('CNJ Validation Tests', () => {
  test('validates correct CNJ', () => {
    const result = validateCNJ('0001327-64.2018.8.26.0158')
    expect(result.isValid).toBe(true)
  })

  test('validates incorrect CNJ', () => {
    const result = validateCNJ('0001327-65.2018.8.26.0158')
    expect(result.isValid).toBe(false)
  })

  test('validates unformatted CNJ', () => {
    const result = validateCNJ('00013276420188260158')
    expect(result.isValid).toBe(true)
  })

  test('validates incorrect format', () => {
    const result = validateCNJ('invalid-cnj')
    expect(result.isValid).toBe(false)
  })
})

describe('CNJ Analysis Tests', () => {
  test('analyzes complete CNJ', () => {
    const analysis = analyzeCNJ('0001327-64.2018.8.26.0158')

    expect(analysis.validCNJ).toBe(true)
    expect(analysis.segmentShort).toBe('TJ')
    expect(analysis.detailed.protocolYear).toBe('2018')
    expect(analysis.detailed.lawsuitNumber).toBe('0001327')
  })

  test('handles invalid CNJ in analysis', () => {
    expect(() => {
      analyzeCNJ('invalid')
    }).toThrow()
  })
})

describe('CNJ Formatting Tests', () => {
  test('formats unformatted CNJ', () => {
    const formatted = formatCNJ('00013276420188260158')
    expect(formatted).toBe('0001327-64.2018.8.26.0158')
  })

  test('handles invalid length in formatting', () => {
    expect(() => {
      formatCNJ('123')
    }).toThrow()
  })
})

describe('Utility Functions Tests', () => {
  test('isValidCNJ returns boolean', () => {
    expect(isValidCNJ('0001327-64.2018.8.26.0158')).toBe(true)
    expect(isValidCNJ('invalid')).toBe(false)
  })
})
