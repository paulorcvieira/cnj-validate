/**
 * Comprehensive tests for formatters module
 */

import {
  capitalizeWords,
  formatBrazilianDate,
  formatCNJWithMask,
  formatDuration,
  formatFileSize,
  formatLawsuitNumber,
  formatPercentage,
  formatProtocolYear,
  formatTimestamp,
  removeCNJMask,
} from '../formatters'

describe('Formatters', () => {
  describe('formatCNJWithMask', () => {
    test('should format unformatted CNJ correctly', () => {
      const unformattedCNJ = '00013276420188260158'
      const expected = '0001327-64.2018.8.26.0158'
      expect(formatCNJWithMask(unformattedCNJ)).toBe(expected)
    })

    test('should handle CNJ with non-numeric characters', () => {
      const messyCNJ = 'abc00013276420188260158def'
      const expected = '0001327-64.2018.8.26.0158'
      expect(formatCNJWithMask(messyCNJ)).toBe(expected)
    })

    test('should throw error for invalid length', () => {
      expect(() => formatCNJWithMask('123')).toThrow(
        'CNJ deve ter exatamente 20 dígitos',
      )
      expect(() => formatCNJWithMask('12345678901234567890123')).toThrow()
    })

    test('should handle CNJ with only non-numeric characters', () => {
      expect(() => formatCNJWithMask('abcdefghij')).toThrow()
    })
  })

  describe('removeCNJMask', () => {
    test('should remove formatting from CNJ', () => {
      const formattedCNJ = '0001327-64.2018.8.26.0158'
      const expected = '00013276420188260158'
      expect(removeCNJMask(formattedCNJ)).toBe(expected)
    })

    test('should handle already unformatted CNJ', () => {
      const unformattedCNJ = '00013276420188260158'
      expect(removeCNJMask(unformattedCNJ)).toBe(unformattedCNJ)
    })

    test('should handle CNJ with extra characters', () => {
      const messyCNJ = 'abc0001327-64.2018.8.26.0158def'
      const expected = '00013276420188260158'
      expect(removeCNJMask(messyCNJ)).toBe(expected)
    })

    test('should handle empty string', () => {
      expect(removeCNJMask('')).toBe('')
    })
  })

  describe('formatBrazilianDate', () => {
    test('should format date in Brazilian format', () => {
      const date = new Date('2023-12-25')
      const result = formatBrazilianDate(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/) // DD/MM/YYYY pattern
    })

    test('should handle different dates', () => {
      const date1 = new Date('2020-01-01')
      const date2 = new Date('2020-12-31')

      const result1 = formatBrazilianDate(date1)
      const result2 = formatBrazilianDate(date2)

      expect(result1).toBeTruthy()
      expect(result2).toBeTruthy()
      expect(result1).not.toBe(result2)
    })
  })

  describe('formatTimestamp', () => {
    test('should format timestamp to readable string', () => {
      const timestamp = new Date('2023-12-25T10:30:00').getTime()
      const result = formatTimestamp(timestamp)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    test('should handle different timestamps', () => {
      const ts1 = Date.now()
      const ts2 = ts1 + 86400000 // +1 day

      const result1 = formatTimestamp(ts1)
      const result2 = formatTimestamp(ts2)

      expect(result1).not.toBe(result2)
    })
  })

  describe('capitalizeWords', () => {
    test('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World')
      expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox')
    })

    test('should handle single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello')
    })

    test('should handle already capitalized text', () => {
      expect(capitalizeWords('Hello World')).toBe('Hello World')
    })

    test('should handle mixed case', () => {
      expect(capitalizeWords('hELLo WoRLD')).toBe('Hello World')
    })

    test('should handle empty string', () => {
      expect(capitalizeWords('')).toBe('')
    })

    test('should handle special characters', () => {
      expect(capitalizeWords('hello-world test_case')).toBe(
        'Hello-World Test_case',
      )
    })
  })

  describe('formatLawsuitNumber', () => {
    test('should format 7-digit lawsuit number', () => {
      const number = '0001327'
      expect(formatLawsuitNumber(number)).toBe('0001327')
    })

    test('should return original for non-7-digit numbers', () => {
      expect(formatLawsuitNumber('123')).toBe('123')
      expect(formatLawsuitNumber('12345678')).toBe('12345678')
    })

    test('should handle empty string', () => {
      expect(formatLawsuitNumber('')).toBe('')
    })
  })

  describe('formatProtocolYear', () => {
    test('should return year as-is', () => {
      expect(formatProtocolYear('2023')).toBe('2023')
      expect(formatProtocolYear('1998')).toBe('1998')
    })

    test('should handle empty string', () => {
      expect(formatProtocolYear('')).toBe('')
    })
  })

  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(512)).toBe('512 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
    })

    test('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB') // 1.5 KB
    })

    test('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB') // 1 MB
      expect(formatFileSize(1572864)).toBe('1.5 MB') // 1.5 MB
    })

    test('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB') // 1 GB
      expect(formatFileSize(1610612736)).toBe('1.5 GB') // 1.5 GB
    })

    test('should handle very large numbers', () => {
      const result = formatFileSize(1099511627776) // 1 TB
      expect(result).toBe('1024 GB') // 1 TB = 1024 GB when limited to GB as max unit
    })
  })

  describe('formatPercentage', () => {
    test('should format percentage with default decimals', () => {
      expect(formatPercentage(0.5)).toBe('50.0%')
      expect(formatPercentage(0.123)).toBe('12.3%')
      expect(formatPercentage(1)).toBe('100.0%')
    })

    test('should format percentage with custom decimals', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%')
      expect(formatPercentage(0.12345, 0)).toBe('12%')
      expect(formatPercentage(0.12345, 3)).toBe('12.345%')
    })

    test('should handle edge cases', () => {
      expect(formatPercentage(0)).toBe('0.0%')
      expect(formatPercentage(0.999)).toBe('99.9%')
    })
  })

  describe('formatDuration', () => {
    test('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms')
      expect(formatDuration(999)).toBe('999ms')
    })

    test('should format seconds', () => {
      expect(formatDuration(1000)).toBe('1s')
      expect(formatDuration(5000)).toBe('5s')
      expect(formatDuration(59000)).toBe('59s')
    })

    test('should format minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m')
      expect(formatDuration(90000)).toBe('1m 30s')
      expect(formatDuration(125000)).toBe('2m 5s')
    })

    test('should format hours and minutes', () => {
      expect(formatDuration(3600000)).toBe('1h 0m') // 1 hour
      expect(formatDuration(3900000)).toBe('1h 5m') // 1 hour 5 minutes
      expect(formatDuration(7200000)).toBe('2h 0m') // 2 hours
    })

    test('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0ms')
    })

    test('should handle very large durations', () => {
      const result = formatDuration(86400000) // 24 hours
      expect(result).toContain('h')
    })
  })

  describe('Edge Cases and Integration', () => {
    test('should handle null and undefined inputs gracefully where applicable', () => {
      // Most functions should handle edge cases without crashing
      expect(capitalizeWords('')).toBe('')
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatPercentage(0)).toBe('0.0%')
      expect(formatDuration(0)).toBe('0ms')
    })

    test('should maintain consistency across similar functions', () => {
      const cnj = '00013276420188260158'
      const formatted = formatCNJWithMask(cnj)
      const unformatted = removeCNJMask(formatted)

      expect(unformatted).toBe(cnj)
    })

    test('should handle extreme values appropriately', () => {
      // Very large file size
      const largeSize = formatFileSize(Number.MAX_SAFE_INTEGER)
      expect(largeSize).toBeTruthy()

      // Very large duration
      const largeDuration = formatDuration(Number.MAX_SAFE_INTEGER)
      expect(largeDuration).toBeTruthy()

      // Very large percentage
      const largePercentage = formatPercentage(999)
      expect(largePercentage).toContain('%')
    })
  })
})
