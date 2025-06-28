#!/usr/bin/env node

/**
 * CNJ Validate CLI - Processar arquivos CNJ
 *
 * Uso global: cnj-process <arquivo-entrada> [arquivo-saida]
 * Uso local:  node scripts/process-file.js <arquivo-entrada> [arquivo-saida]
 * Uso npx:   npx cnj-validate <arquivo-entrada> [arquivo-saida]
 */

const { processFile } = require('../dist/csv/processor.js')
const path = require('path')

async function main() {
  // Obter argumentos da linha de comando
  const args = process.argv.slice(2)

  // Verificar se é solicitação de ajuda
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    if (args.length === 0) {
      console.log('❌ Erro: Arquivo de entrada não fornecido\n')
    }

    console.log('🏛️ CNJ Validate - CLI Tool')
    console.log('')
    console.log('📖 Uso:')
    console.log('   cnj-process <arquivo-entrada> [arquivo-saida]')
    console.log('   npx cnj-validate <arquivo-entrada> [arquivo-saida]')
    console.log('')
    console.log('📋 Exemplos:')
    console.log('   cnj-process processes.csv')
    console.log('   cnj-process input.csv output.csv')
    console.log('   npx cnj-validate@latest data.csv')
    console.log('')
    console.log('ℹ️  Opções:')
    console.log('   -h, --help     Mostrar esta ajuda')
    console.log('')
    process.exit(args.length === 0 ? 1 : 0)
  }

  const inputFile = args[0]
  const outputFile = args[1] // Opcional

  console.log('🚀 Iniciando processamento de arquivo CNJ...\n')
  console.log(`📁 Arquivo de entrada: ${inputFile}`)

  try {
    const startTime = Date.now()

    // Processa o arquivo usando processor.ts
    const result = await processFile(inputFile, outputFile)

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // Exibe resultados
    console.log('\n✅ Processamento concluído com sucesso!')
    console.log('📊 Estatísticas:')
    console.log(`   • Total de CNJs: ${result.statistics.totalCNJs}`)
    console.log(`   • CNJs válidos: ${result.statistics.validCNJs}`)
    console.log(`   • CNJs inválidos: ${result.statistics.invalidCNJs}`)
    console.log(`   • Erros: ${result.statistics.errorCount}`)
    console.log(
      `   • Tempo de processamento: ${result.statistics.processingTime}ms`,
    )
    console.log(`   • Tempo total: ${totalTime}ms`)
    console.log(
      `   • Taxa de sucesso: ${(
        (result.statistics.validCNJs / result.statistics.totalCNJs) *
        100
      ).toFixed(1)}%`,
    )

    if (result.statistics.totalCNJs > 0) {
      console.log(
        `   • Velocidade: ${(
          result.statistics.totalCNJs /
          (result.statistics.processingTime / 1000)
        ).toFixed(2)} CNJs/segundo`,
      )
    }

    console.log(`\n💾 Arquivo de saída: ${result.outputFile}`)

    // Mostra erros se houver
    if (result.processingResult.errors.length > 0) {
      console.log('\n⚠️  Erros encontrados:')
      result.processingResult.errors.slice(0, 5).forEach((error) => {
        console.log(`   • Linha ${error.line}: ${error.cnj} - ${error.error}`)
      })

      if (result.processingResult.errors.length > 5) {
        console.log(
          `   • ... e mais ${result.processingResult.errors.length - 5} erros`,
        )
      }
    }
  } catch (error) {
    console.error('❌ Erro durante o processamento:', error.message)
    process.exit(1)
  }
}

// Executa apenas se chamado diretamente
if (require.main === module) {
  main()
}
