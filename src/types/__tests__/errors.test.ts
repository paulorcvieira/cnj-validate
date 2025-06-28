/**
 * Tests for error types and classes
 */

import { CNJErrorType, CNJValidationError } from '../errors'

describe('Error Types', () => {
  describe('CNJErrorType', () => {
    test('should have all expected error types', () => {
      const expectedTypes = [
        'INVALID_FORMAT',
        'INVALID_LENGTH',
        'INVALID_VERIFYING_DIGIT',
        'INVALID_SEGMENT',
        'INVALID_COURT',
        'INVALID_SOURCE_UNIT',
        'INVALID_YEAR',
        'DISTRICT_NOT_FOUND',
        'CALCULATION_ERROR',
      ]

      expectedTypes.forEach((type) => {
        expect(type in CNJErrorType).toBe(true)
        expect(CNJErrorType[type as keyof typeof CNJErrorType]).toBe(type)
      })
    })

    test('should have string values for all error types', () => {
      Object.values(CNJErrorType).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    })

    test('should have consistent naming pattern', () => {
      Object.values(CNJErrorType).forEach((value) => {
        expect(value).toMatch(/^[A-Z_]+$/) // All uppercase with underscores
      })
    })
  })

  describe('CNJValidationError', () => {
    describe('Constructor', () => {
      test('should create error with required properties', () => {
        const error = new CNJValidationError(
          CNJErrorType.INVALID_FORMAT,
          'Test error message',
        )

        expect(error).toBeInstanceOf(Error)
        expect(error).toBeInstanceOf(CNJValidationError)
        expect(error.name).toBe('CNJValidationError')
        expect(error.type).toBe(CNJErrorType.INVALID_FORMAT)
        expect(error.message).toBe('Test error message')
        expect(error.code).toBe(CNJErrorType.INVALID_FORMAT)
      })

      test('should create error with custom code', () => {
        const error = new CNJValidationError(
          CNJErrorType.INVALID_SEGMENT,
          'Custom message',
          'CUSTOM_CODE',
        )

        expect(error.type).toBe(CNJErrorType.INVALID_SEGMENT)
        expect(error.code).toBe('CUSTOM_CODE')
        expect(error.message).toBe('Custom message')
      })

      test('should create error with details', () => {
        const details = { received: '123', expected: '456' }
        const error = new CNJValidationError(
          CNJErrorType.INVALID_VERIFYING_DIGIT,
          'Test message',
          'TEST_CODE',
          details,
        )

        expect(error.details).toEqual(details)
        expect(error.details?.received).toBe('123')
        expect(error.details?.expected).toBe('456')
      })

      test('should handle undefined details', () => {
        const error = new CNJValidationError(
          CNJErrorType.INVALID_FORMAT,
          'Test message',
        )

        expect(error.details).toBeUndefined()
      })
    })

    describe('Static Factory Methods', () => {
      describe('invalidFormat', () => {
        test('should create INVALID_FORMAT error', () => {
          const received = '123456789'
          const error = CNJValidationError.invalidFormat(received)

          expect(error.type).toBe(CNJErrorType.INVALID_FORMAT)
          expect(error.code).toBe('INVALID_FORMAT')
          expect(error.message).toContain('Formato CNJ inválido')
          expect(error.message).toContain(received)
          expect(error.details?.received).toBe(received)
        })

        test('should include expected format in message', () => {
          const error = CNJValidationError.invalidFormat('invalid')
          expect(error.message).toContain('NNNNNNN-DD.AAAA.J.CT.0000')
          expect(error.message).toContain('NNNNNNNDDAAAAJCT0000')
        })
      })

      describe('invalidLength', () => {
        test('should create INVALID_LENGTH error', () => {
          const received = '12345'
          const expectedLength = 20
          const error = CNJValidationError.invalidLength(
            received,
            expectedLength,
          )

          expect(error.type).toBe(CNJErrorType.INVALID_LENGTH)
          expect(error.code).toBe('INVALID_LENGTH')
          expect(error.message).toContain('Tamanho CNJ inválido')
          expect(error.message).toContain(received.length.toString())
          expect(error.message).toContain(expectedLength.toString())
          expect(error.details?.received).toBe(received)
          expect(error.details?.receivedLength).toBe(received.length)
          expect(error.details?.expectedLength).toBe(expectedLength)
        })

        test('should handle different length scenarios', () => {
          const shortError = CNJValidationError.invalidLength('123', 20)
          const longError = CNJValidationError.invalidLength('1'.repeat(25), 20)

          expect(shortError.details?.receivedLength).toBe(3)
          expect(longError.details?.receivedLength).toBe(25)
        })
      })

      describe('invalidVerifyingDigit', () => {
        test('should create INVALID_VERIFYING_DIGIT error', () => {
          const received = '12'
          const expected = '34'
          const error = CNJValidationError.invalidVerifyingDigit(
            received,
            expected,
          )

          expect(error.type).toBe(CNJErrorType.INVALID_VERIFYING_DIGIT)
          expect(error.code).toBe('INVALID_VERIFYING_DIGIT')
          expect(error.message).toContain('Dígito verificador inválido')
          expect(error.message).toContain(`Recebido: ${received}`)
          expect(error.message).toContain(`Esperado: ${expected}`)
          expect(error.details?.received).toBe(received)
          expect(error.details?.expected).toBe(expected)
        })

        test('should handle different digit formats', () => {
          const error1 = CNJValidationError.invalidVerifyingDigit('01', '99')
          const error2 = CNJValidationError.invalidVerifyingDigit('5', '10')

          expect(error1.details?.received).toBe('01')
          expect(error2.details?.expected).toBe('10')
        })
      })

      describe('invalidSegment', () => {
        test('should create INVALID_SEGMENT error', () => {
          const segment = '0'
          const error = CNJValidationError.invalidSegment(segment)

          expect(error.type).toBe(CNJErrorType.INVALID_SEGMENT)
          expect(error.code).toBe('INVALID_SEGMENT')
          expect(error.message).toContain('Código de segmento inválido')
          expect(error.message).toContain(segment)
          expect(error.message).toContain('Deve ser entre 1 e 9')
          expect(error.details?.segment).toBe(segment)
        })

        test('should handle various invalid segments', () => {
          const invalidSegments = ['0', '10', 'A', '']

          invalidSegments.forEach((segment) => {
            const error = CNJValidationError.invalidSegment(segment)
            expect(error.details?.segment).toBe(segment)
          })
        })
      })

      describe('invalidCourt', () => {
        test('should create INVALID_COURT error', () => {
          const court = '99'
          const segment = 8
          const error = CNJValidationError.invalidCourt(court, segment)

          expect(error.type).toBe(CNJErrorType.INVALID_COURT)
          expect(error.code).toBe('INVALID_COURT')
          expect(error.message).toContain('Código de tribunal inválido')
          expect(error.message).toContain(court)
          expect(error.message).toContain(`segmento ${segment}`)
          expect(error.details?.court).toBe(court)
          expect(error.details?.segment).toBe(segment)
        })

        test('should handle different court/segment combinations', () => {
          const combinations = [
            { court: '100', segment: 8 },
            { court: '0', segment: 1 },
            { court: 'XX', segment: 5 },
          ]

          combinations.forEach(({ court, segment }) => {
            const error = CNJValidationError.invalidCourt(court, segment)
            expect(error.details?.court).toBe(court)
            expect(error.details?.segment).toBe(segment)
          })
        })
      })

      describe('districtNotFound', () => {
        test('should create DISTRICT_NOT_FOUND error', () => {
          const key = '8.26.0158'
          const error = CNJValidationError.districtNotFound(key)

          expect(error.type).toBe(CNJErrorType.DISTRICT_NOT_FOUND)
          expect(error.code).toBe('DISTRICT_NOT_FOUND')
          expect(error.message).toContain('Distrito não encontrado')
          expect(error.message).toContain(key)
          expect(error.details?.key).toBe(key)
        })

        test('should handle various key formats', () => {
          const keys = [
            '8.26.0158',
            'segment.court.unit',
            'complex-key-format',
            '',
          ]

          keys.forEach((key) => {
            const error = CNJValidationError.districtNotFound(key)
            expect(error.details?.key).toBe(key)
          })
        })
      })
    })

    describe('Error Properties', () => {
      test('should be instanceof Error', () => {
        const error = new CNJValidationError(
          CNJErrorType.INVALID_FORMAT,
          'Test',
        )

        expect(error instanceof Error).toBe(true)
        expect(error instanceof CNJValidationError).toBe(true)
      })

      test('should have proper error name', () => {
        const error = new CNJValidationError(
          CNJErrorType.INVALID_FORMAT,
          'Test',
        )

        expect(error.name).toBe('CNJValidationError')
      })

      test('should have stack trace', () => {
        const error = new CNJValidationError(
          CNJErrorType.INVALID_FORMAT,
          'Test',
        )

        expect(error.stack).toBeDefined()
        expect(typeof error.stack).toBe('string')
      })

      test('should be serializable', () => {
        const error = CNJValidationError.invalidFormat('test')
        const serialized = JSON.stringify({
          name: error.name,
          message: error.message,
          type: error.type,
          code: error.code,
          details: error.details,
        })
        const parsed = JSON.parse(serialized)

        expect(parsed.name).toBe('CNJValidationError')
        expect(parsed.message).toBeDefined()
        expect(parsed.type).toBe(CNJErrorType.INVALID_FORMAT)
        expect(parsed.code).toBe('INVALID_FORMAT')
        expect(parsed.details).toBeDefined()
      })
    })

    describe('Error Handling Scenarios', () => {
      test('should work with try-catch blocks', () => {
        expect(() => {
          throw CNJValidationError.invalidFormat('invalid')
        }).toThrow(CNJValidationError)
      })

      test('should work with Promise rejections', async () => {
        const promise = Promise.reject(CNJValidationError.invalidSegment('0'))

        await expect(promise).rejects.toThrow(CNJValidationError)
        await expect(promise).rejects.toHaveProperty(
          'type',
          CNJErrorType.INVALID_SEGMENT,
        )
      })

      test('should allow error type checking', () => {
        const error = CNJValidationError.invalidVerifyingDigit('12', '34')

        const isValidationError = error instanceof CNJValidationError
        const isFormatError = error.type === CNJErrorType.INVALID_FORMAT
        const isDigitError = error.type === CNJErrorType.INVALID_VERIFYING_DIGIT

        expect(isValidationError).toBe(true)
        expect(isFormatError).toBe(false)
        expect(isDigitError).toBe(true)
      })
    })

    describe('Edge Cases', () => {
      test('should handle empty messages', () => {
        const error = new CNJValidationError(CNJErrorType.INVALID_FORMAT, '')

        expect(error.message).toBe('')
        expect(error.type).toBe(CNJErrorType.INVALID_FORMAT)
      })

      test('should handle very long messages', () => {
        const longMessage = 'A'.repeat(1000)
        const error = new CNJValidationError(
          CNJErrorType.INVALID_FORMAT,
          longMessage,
        )

        expect(error.message).toBe(longMessage)
        expect(error.message.length).toBe(1000)
      })

      test('should handle complex details objects', () => {
        const complexDetails = {
          nested: { value: 'test' },
          array: [1, 2, 3],
          boolean: true,
          number: 42,
        }

        const error = new CNJValidationError(
          CNJErrorType.CALCULATION_ERROR,
          'Complex error',
          'COMPLEX',
          complexDetails,
        )

        expect(error.details?.nested.value).toBe('test')
        expect(error.details?.array).toEqual([1, 2, 3])
        expect(error.details?.boolean).toBe(true)
        expect(error.details?.number).toBe(42)
      })
    })
  })
})
