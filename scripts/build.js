#!/usr/bin/env node

/**
 * Script de build customizado para gerar CommonJS e ESM
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔨 Iniciando build da biblioteca CNJ Validate...\n')

try {
  // 1. Limpa diretório de saída
  console.log('1️⃣ Limpando diretório dist/')
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true })
  }
  fs.mkdirSync('dist', { recursive: true })

  // 2. Build CommonJS (com declarations)
  console.log('2️⃣ Compilando CommonJS...')
  execSync('tsc --project tsconfig.lib.json', { stdio: 'inherit' })

  // 3. Build ESM (em diretório temporário)
  console.log('3️⃣ Compilando ESM...')
  fs.mkdirSync('temp-esm', { recursive: true })

  // Cria tsconfig temporário para ESM
  const esmConfig = {
    extends: './tsconfig.lib.json',
    compilerOptions: {
      module: 'es2020',
      outDir: './temp-esm',
      declaration: false,
      declarationMap: false,
    },
  }
  fs.writeFileSync('tsconfig.temp.json', JSON.stringify(esmConfig, null, 2))

  execSync('tsc --project tsconfig.temp.json', { stdio: 'inherit' })

  // 4. Move e renomeia arquivo ESM
  console.log('4️⃣ Processando arquivo ESM...')
  if (fs.existsSync('temp-esm/index.js')) {
    fs.copyFileSync('temp-esm/index.js', 'dist/index.esm.js')
  }

  // Limpeza
  fs.rmSync('temp-esm', { recursive: true, force: true })
  fs.unlinkSync('tsconfig.temp.json')

  // 5. Cria package.json no dist para ajudar resolução de módulos
  console.log('5️⃣ Criando package.json auxiliar...')
  const distPackageJson = {
    type: 'commonjs',
  }
  fs.writeFileSync(
    'dist/package.json',
    JSON.stringify(distPackageJson, null, 2),
  )

  console.log('\n✅ Build concluído com sucesso!')
  console.log('📁 Arquivos gerados:')
  console.log('   • dist/index.js (CommonJS)')
  console.log('   • dist/index.esm.js (ESM)')
  console.log('   • dist/index.d.ts (TypeScript definitions)')
  console.log('   • dist/*.map (Source maps)')
} catch (error) {
  console.error('❌ Erro durante o build:', error.message)
  process.exit(1)
}
