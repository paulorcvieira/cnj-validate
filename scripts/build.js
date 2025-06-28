#!/usr/bin/env node

/**
 * Build Script - CNJ Validate Library
 *
 * Generates dual-format distribution:
 * - CommonJS (dist/index.js)
 * - ES Modules (dist/index.mjs)
 * - TypeScript definitions (dist/index.d.ts)
 *
 * @version 1.0.0
 * @author CNJ Validate Team
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Build configuration
const BUILD_CONFIG = {
  distDir: 'dist',
  tsConfig: 'tsconfig.lib.json',
  outputs: {
    cjs: 'index.js',
    esm: 'index.mjs',
    types: 'index.d.ts',
  },
}

// Logging utilities
const log = {
  info: (msg) => console.log(`📋 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warning: (msg) => console.warn(`⚠️  ${msg}`),
  step: (step, msg) => console.log(`${step} ${msg}`),
}

/**
 * Clean the distribution directory
 */
function cleanDist() {
  log.step('1️⃣', 'Cleaning distribution directory...')

  if (fs.existsSync(BUILD_CONFIG.distDir)) {
    fs.rmSync(BUILD_CONFIG.distDir, { recursive: true, force: true })
    log.info(`Removed existing ${BUILD_CONFIG.distDir}/ directory`)
  }

  fs.mkdirSync(BUILD_CONFIG.distDir, { recursive: true })
  log.success('Distribution directory prepared')
}

/**
 * Compile TypeScript to CommonJS
 */
function compileCommonJS() {
  log.step('2️⃣', 'Compiling TypeScript to CommonJS...')

  try {
    execSync(`npx tsc --project ${BUILD_CONFIG.tsConfig}`, {
      stdio: 'inherit',
      encoding: 'utf8',
    })
    log.success('CommonJS compilation completed')
  } catch (error) {
    throw new Error(`TypeScript compilation failed: ${error.message}`)
  }
}

/**
 * Extract exports from the generated CommonJS file
 */
function extractExports() {
  const cjsPath = path.join(BUILD_CONFIG.distDir, BUILD_CONFIG.outputs.cjs)

  if (!fs.existsSync(cjsPath)) {
    throw new Error(`CommonJS file not found: ${cjsPath}`)
  }

  const cjsContent = fs.readFileSync(cjsPath, 'utf8')
  const exports = new Set()

  // Extract function exports
  const functionExports = cjsContent.match(/exports\.(\w+)\s*=/g)
  if (functionExports) {
    functionExports.forEach((match) => {
      const name = match.match(/exports\.(\w+)/)[1]
      exports.add(name)
    })
  }

  // Extract Object.defineProperty exports
  const propertyExports = cjsContent.match(
    /Object\.defineProperty\(exports,\s*"(\w+)"/g,
  )
  if (propertyExports) {
    propertyExports.forEach((match) => {
      const name = match.match(/"(\w+)"/)[1]
      exports.add(name)
    })
  }

  // Filter out internal exports that shouldn't be public
  const filteredExports = Array.from(exports).filter((name) => {
    return name !== '__esModule' && !name.startsWith('_')
  })

  return filteredExports.sort()
}

/**
 * Generate ES Modules wrapper
 */
function generateESMWrapper() {
  log.step('3️⃣', 'Generating ES Modules wrapper...')

  const exports = extractExports()

  if (exports.length === 0) {
    log.warning('No exports found in CommonJS file')
  } else {
    log.info(
      `Found ${exports.length} exports: ${exports.slice(0, 5).join(', ')}${
        exports.length > 5 ? '...' : ''
      }`,
    )
  }

  const esmWrapper = generateESMWrapperContent(exports)
  const esmPath = path.join(BUILD_CONFIG.distDir, BUILD_CONFIG.outputs.esm)

  fs.writeFileSync(esmPath, esmWrapper, 'utf8')
  log.success(`ES Modules wrapper created: ${BUILD_CONFIG.outputs.esm}`)
}

/**
 * Generate the content for ESM wrapper
 */
function generateESMWrapperContent(exports) {
  const header = `/**
 * ES Modules wrapper for cnj-validate
 * 
 * This file provides ES Modules compatibility by re-exporting
 * individual functions from the CommonJS module.
 * Compatible with both Node.js and browser environments.
 * 
 * Generated automatically by build script.
 */
`

  const namedExports =
    exports.length > 0
      ? `
// Import the default export from CommonJS module
import cjsModule from './index.js';

// Re-export all named exports individually  
${exports
  .map((exportName) => `export const ${exportName} = cjsModule.${exportName};`)
  .join('\n')}
`
      : '\n// No named exports found\n'

  const defaultExport = `
// Export default for compatibility
export default cjsModule;
`

  return header + namedExports + defaultExport
}

/**
 * Validate the build output
 */
function validateBuild() {
  log.step('4️⃣', 'Validating build output...')

  const requiredFiles = [
    BUILD_CONFIG.outputs.cjs,
    BUILD_CONFIG.outputs.esm,
    BUILD_CONFIG.outputs.types,
  ]

  const missingFiles = requiredFiles.filter((file) => {
    const filePath = path.join(BUILD_CONFIG.distDir, file)
    return !fs.existsSync(filePath)
  })

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`)
  }

  // Validate file sizes
  requiredFiles.forEach((file) => {
    const filePath = path.join(BUILD_CONFIG.distDir, file)
    const stats = fs.statSync(filePath)

    if (stats.size === 0) {
      throw new Error(`Generated file is empty: ${file}`)
    }

    log.info(`${file}: ${formatFileSize(stats.size)}`)
  })

  log.success('Build validation completed')
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Display build summary
 */
function displaySummary() {
  console.log('\n🎉 Build completed successfully!')
  console.log('\n📦 Generated files:')
  console.log(`   • ${BUILD_CONFIG.outputs.cjs} (CommonJS)`)
  console.log(`   • ${BUILD_CONFIG.outputs.esm} (ES Modules)`)
  console.log(`   • ${BUILD_CONFIG.outputs.types} (TypeScript definitions)`)
  console.log(`   • *.map (Source maps)`)

  console.log('\n🚀 Ready for distribution!')
  console.log('   📝 Test: npm test')
  console.log('   📋 Publish: npm publish')
}

/**
 * Main build process
 */
async function build() {
  const startTime = Date.now()

  try {
    console.log('🔨 CNJ Validate Library - Build Process\n')

    // Validate environment
    if (!fs.existsSync(BUILD_CONFIG.tsConfig)) {
      throw new Error(`TypeScript config not found: ${BUILD_CONFIG.tsConfig}`)
    }

    // Execute build steps
    cleanDist()
    compileCommonJS()
    generateESMWrapper()
    validateBuild()

    // Display results
    const duration = Date.now() - startTime
    displaySummary()
    console.log(`\n⏱️  Build completed in ${duration}ms`)
  } catch (error) {
    log.error(`Build failed: ${error.message}`)
    console.error('\n💡 Troubleshooting:')
    console.error('   • Check TypeScript configuration')
    console.error('   • Verify source files exist')
    console.error('   • Run: npm run type-check')
    process.exit(1)
  }
}

// Run build if this script is executed directly
if (require.main === module) {
  build()
}

module.exports = {
  build,
  BUILD_CONFIG,
}
