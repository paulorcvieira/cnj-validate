/**
 * Testes de Compatibilidade de Módulos
 *
 * Verifica se a biblioteca funciona corretamente em ambientes CommonJS e ESM.
 * Este teste garante que o problema original de conflito de módulos foi resolvido:
 * "Specified module format (CommonJs) is not matching the module format of the source code (EcmaScript Modules)"
 */

import * as fs from 'fs'
import * as path from 'path'

describe('Module Compatibility Tests', () => {
  const testCNJ = '0001327-64.2018.8.26.0158'
  const invalidCNJ = '1234567890123456789012345'

  describe('CommonJS Import', () => {
    it('should import correctly via require()', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cjsModule = require('../dist/index.js')

      expect(cjsModule).toBeDefined()
      expect(typeof cjsModule.validateCNJ).toBe('function')
      expect(typeof cjsModule.analyzeCNJ).toBe('function')
      expect(typeof cjsModule.isValidCNJ).toBe('function')
      expect(typeof cjsModule.processFile).toBe('function')
    })

    it('should validate CNJ correctly via CommonJS', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { validateCNJ, isValidCNJ } = require('../dist/index.js')

      const result = validateCNJ(testCNJ)
      expect(result.isValid).toBe(true)
      expect(result.expectedDigit).toBeDefined()
      expect(result.receivedDigit).toBeDefined()

      expect(isValidCNJ(testCNJ)).toBe(true)
      expect(isValidCNJ(invalidCNJ)).toBe(false)
    })

    it('should export all expected functions via CommonJS', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cjsModule = require('../dist/index.js')

      // Core functions
      expect(typeof cjsModule.validateCNJ).toBe('function')
      expect(typeof cjsModule.analyzeCNJ).toBe('function')
      expect(typeof cjsModule.isValidCNJ).toBe('function')
      expect(typeof cjsModule.decomposeCNJ).toBe('function')
      expect(typeof cjsModule.formatCNJ).toBe('function')

      // CSV functions
      expect(typeof cjsModule.processFile).toBe('function')
      expect(typeof cjsModule.processCSV).toBe('function')
      expect(typeof cjsModule.generateCSV).toBe('function')

      // Constants
      expect(cjsModule.VERSION).toBeDefined()
      expect(cjsModule.LIBRARY_INFO).toBeDefined()
      expect(cjsModule.DEFAULT_CONFIG).toBeDefined()
      expect(cjsModule.SEGMENTS).toBeDefined()
    })
  })

  describe('ES Modules Compatibility', () => {
    it('should generate correct ESM wrapper file', () => {
      const esmPath = path.join(process.cwd(), 'dist', 'index.mjs')

      expect(fs.existsSync(esmPath)).toBe(true)

      const esmContent = fs.readFileSync(esmPath, 'utf8')
      expect(esmContent).toContain('import ')
      expect(esmContent).toContain('export ')
      expect(esmContent).toContain("import cjsModule from './index.js'")
      expect(esmContent).toContain('export default')
    })

    it('should have correct package.json configuration for ESM', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const packageJson = require('../package.json')

      expect(packageJson.module).toBe('dist/index.mjs')
      expect(packageJson.exports['.'].import).toBe('./dist/index.mjs')
      expect(packageJson.exports['.'].require).toBe('./dist/index.js')
    })

    it('should not have conflicting package.json in dist directory', () => {
      const distPackageJsonPath = path.join(
        process.cwd(),
        'dist',
        'package.json',
      )

      // Should not exist or should not have type: "commonjs"
      if (fs.existsSync(distPackageJsonPath)) {
        const distPackageJson = JSON.parse(
          fs.readFileSync(distPackageJsonPath, 'utf8'),
        )
        expect(distPackageJson.type).not.toBe('commonjs')
      }
    })

    it('should have ESM wrapper that re-exports CommonJS module', () => {
      const esmPath = path.join(process.cwd(), 'dist', 'index.mjs')
      const esmContent = fs.readFileSync(esmPath, 'utf8')

      // Check for the new wrapper pattern
      expect(esmContent).toContain("import cjsModule from './index.js'")
      expect(esmContent).toContain(
        'export const validateCNJ = cjsModule.validateCNJ',
      )
      expect(esmContent).toContain(
        'export const analyzeCNJ = cjsModule.analyzeCNJ',
      )
      expect(esmContent).toContain('export default cjsModule')
    })
  })

  describe('Package Configuration', () => {
    it('should have correct dual module configuration', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const packageJson = require('../package.json')

      expect(packageJson.main).toBe('dist/index.js')
      expect(packageJson.module).toBe('dist/index.mjs')
      expect(packageJson.types).toBe('dist/index.d.ts')

      expect(packageJson.exports).toBeDefined()
      expect(packageJson.exports['.']).toBeDefined()
      expect(packageJson.exports['.'].require).toBe('./dist/index.js')
      expect(packageJson.exports['.'].import).toBe('./dist/index.mjs')
      expect(packageJson.exports['.'].types).toBe('./dist/index.d.ts')
    })

    it('should have correct version updated', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const packageJson = require('../package.json')

      expect(packageJson.version).toBe('1.0.3')
    })
  })

  describe('Built Files Structure', () => {
    it('should have generated all required files', () => {
      const distPath = path.join(process.cwd(), 'dist')

      expect(fs.existsSync(path.join(distPath, 'index.js'))).toBe(true)
      expect(fs.existsSync(path.join(distPath, 'index.mjs'))).toBe(true)
      expect(fs.existsSync(path.join(distPath, 'index.d.ts'))).toBe(true)
    })

    it('should have correct module formats', () => {
      // Check that CommonJS file has require/module.exports
      const cjsContent = fs.readFileSync(
        path.join(process.cwd(), 'dist', 'index.js'),
        'utf8',
      )
      expect(cjsContent).toContain('require(')
      expect(cjsContent).toContain('exports.')
      expect(cjsContent).toContain('"use strict"')

      // Check that ESM file has import/export
      const esmContent = fs.readFileSync(
        path.join(process.cwd(), 'dist', 'index.mjs'),
        'utf8',
      )
      expect(esmContent).toContain('import ')
      expect(esmContent).toContain('export ')
      expect(esmContent).toContain("import cjsModule from './index.js'")
    })
  })

  describe('Functional Tests', () => {
    it('should maintain consistent validation results', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        validateCNJ,
        isValidCNJ,
        analyzeCNJ,
      } = require('../dist/index.js')

      // Test with known valid CNJ
      const validation = validateCNJ(testCNJ)
      const booleanCheck = isValidCNJ(testCNJ)
      const analysis = analyzeCNJ(testCNJ)

      expect(validation.isValid).toBe(true)
      expect(booleanCheck).toBe(true)
      expect(analysis).toBeDefined()
      expect(analysis.segmentName).toBeTruthy()
    })

    it('should handle CSV processing functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        processCSV,
        generateCSV,
        processCNJBatch,
      } = require('../dist/index.js')

      expect(typeof processCSV).toBe('function')
      expect(typeof generateCSV).toBe('function')
      expect(typeof processCNJBatch).toBe('function')

      // Test basic CSV processing
      const csvData = `${testCNJ}\n${invalidCNJ}`
      const result = processCSV(csvData)

      expect(result).toBeDefined()
      expect(result.totalProcessed).toBeGreaterThan(0)
      expect(result.validCount).toBeGreaterThanOrEqual(0)
      expect(result.invalidCount).toBeGreaterThanOrEqual(0)
    })

    it('should handle formatting functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        formatCNJ,
        formatCNJWithMask,
        removeCNJMask,
      } = require('../dist/index.js')

      const unformatted = '00013276420188260158'
      const formatted = '0001327-64.2018.8.26.0158'

      expect(formatCNJ(unformatted)).toBe(formatted)
      expect(formatCNJWithMask(unformatted)).toBe(formatted)
      expect(removeCNJMask(formatted)).toBe(unformatted)
    })

    it('should handle error cases consistently', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { validateCNJ, analyzeCNJ } = require('../dist/index.js')

      // Test invalid CNJ validation
      const invalidResult = validateCNJ(invalidCNJ)
      expect(invalidResult.isValid).toBe(false)

      // Test error throwing for analysis
      expect(() => analyzeCNJ(invalidCNJ)).toThrow()
    })
  })

  describe('Data Consistency', () => {
    it('should have consistent segment data', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        SEGMENTS,
        getSegment,
        getAllSegments,
      } = require('../dist/index.js')

      expect(SEGMENTS).toBeDefined()
      expect(typeof getSegment).toBe('function')
      expect(typeof getAllSegments).toBe('function')

      const allSegments = getAllSegments()
      expect(allSegments).toHaveLength(9)

      // Test segment 8 (most common)
      const segment8 = getSegment(8)
      expect(segment8).toBeDefined()
      expect(segment8?.name).toContain('Justiça')
    })

    it('should have consistent district data', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {
        DISTRICTS,
        getDistrictInfo,
        hasDistrict,
      } = require('../dist/index.js')

      expect(DISTRICTS).toBeDefined()
      expect(typeof getDistrictInfo).toBe('function')
      expect(typeof hasDistrict).toBe('function')

      // Test basic functionality
      const hasAnyDistrict =
        hasDistrict('1-1-AC') ||
        hasDistrict('8-26-SP') ||
        Object.keys(DISTRICTS).length > 0
      expect(hasAnyDistrict).toBe(true)
    })
  })
})
