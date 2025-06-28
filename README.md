# 🏛️ cnj-validate

[![npm version](https://badge.fury.io/js/cnj-validate.svg)](https://badge.fury.io/js/cnj-validate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

> Biblioteca TypeScript para **validação e análise** de números de processos CNJ (Conselho Nacional de Justiça) do Brasil

## ⚡ Quick Start

```bash
npm install cnj-validate
```

```typescript
import { validateCNJ, analyzeCNJ } from 'cnj-validate'

// Validação simples
const isValid = validateCNJ('0001327-64.2018.8.26.0158').isValid // true

// Análise completa
const analysis = analyzeCNJ('0001327-64.2018.8.26.0158')
console.log(analysis.segmentName) // "Justiça dos Estados..."
console.log(analysis.detailed.district) // "São Paulo"
```

## 🔧 CLI Tool

```bash
# Instalar globalmente
npm install -g cnj-validate

# Processar arquivo CSV
cnj-process input.csv output.csv

# Ou usar npx (sem instalar)
npx cnj-validate@latest input.csv
```

## ✨ Características

- 🎯 **Validação precisa** segundo regras oficiais do CNJ
- 📊 **Análise detalhada** com informações jurisdicionais completas
- ⚡ **Alto desempenho** - 58.000+ CNJs/segundo
- 💾 **Zero dependências** - biblioteca leve (117kB)
- 🛡️ **Type-safe** - TypeScript nativo
- 🧪 **Confiável** - 366 testes automatizados
- 🌐 **Universal** - Node.js, browsers, qualquer framework
- 📦 **Moderno** - CommonJS + ESM exports

## 💻 Uso Básico

### Validação Simples

```typescript
import { validateCNJ, isValidCNJ } from 'cnj-validate'

// Validação completa
const result = validateCNJ('0001327-64.2018.8.26.0158')
console.log(result.isValid) // true

// Validação rápida (apenas boolean)
const isValid = isValidCNJ('0001327-64.2018.8.26.0158')
console.log(isValid) // true
```

### Análise Completa

```typescript
import { analyzeCNJ } from 'cnj-validate'

const analysis = analyzeCNJ('0001327-64.2018.8.26.0158')

console.log(analysis.segmentName) // "Justiça dos Estados e do Distrito Federal e Territórios"
console.log(analysis.detailed.district) // "São Paulo"
console.log(analysis.detailed.uf) // "SP"
```

### Formatação

```typescript
import { formatCNJ, normalizeCNJ } from 'cnj-validate'

// Formatar CNJ não formatado
const formatted = formatCNJ('00013276420188260158')
console.log(formatted) // "0001327-64.2018.8.26.0158"

// Remover formatação
const normalized = normalizeCNJ('0001327-64.2018.8.26.0158')
console.log(normalized) // "00013276420188260158"
```

### Processamento CSV

```typescript
import { processCSV, generateCSV } from 'cnj-validate'

// Processar arquivo CSV
const csvContent = `0001327-64.2018.8.26.0158
0001328-49.2018.8.26.0158`

const result = processCSV(csvContent)
console.log(result.validCount) // Número de CNJs válidos
console.log(result.invalidCount) // Número de CNJs inválidos

// Gerar CSV de análises
const analyses = [
  /* suas análises */
]
const csvOutput = generateCSV(analyses, true) // com cabeçalho
```

## 🔧 API Completa

### Funções Principais

| Função              | Descrição               | Retorno            |
| ------------------- | ----------------------- | ------------------ |
| `validateCNJ(cnj)`  | Valida um número CNJ    | `ValidationResult` |
| `analyzeCNJ(cnj)`   | Análise completa do CNJ | `AnalysisCNJ`      |
| `isValidCNJ(cnj)`   | Validação rápida        | `boolean`          |
| `formatCNJ(cnj)`    | Formatar CNJ            | `string`           |
| `decomposeCNJ(cnj)` | Decompor componentes    | `DecomposedCNJ`    |

### Processamento CSV

| Função                          | Descrição             | Retorno               |
| ------------------------------- | --------------------- | --------------------- |
| `processCSV(content, options)`  | Processar arquivo CSV | `CSVProcessingResult` |
| `generateCSV(analyses, header)` | Gerar CSV             | `string`              |
| `processCNJBatch(cnjs)`         | Processar lote        | `CSVProcessingResult` |

### Utilitários

| Função                   | Descrição              | Retorno        |
| ------------------------ | ---------------------- | -------------- |
| `getSegment(code)`       | Obter info do segmento | `Segment`      |
| `getDistrictInfo(key)`   | Obter info do distrito | `DistrictInfo` |
| `formatCNJWithMask(cnj)` | Aplicar máscara        | `string`       |

## 📁 Estrutura de Dados

### AnalysisCNJ

```typescript
interface AnalysisCNJ {
  receivedCNJ: string
  validCNJ: boolean
  segmentName: string
  segmentShort: string
  sourceUnitType: string
  sourceUnitNumber: string
  courtType: string
  courtNumber: string
  detailed: DecomposedCNJ
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean
  expectedDigit?: string
  receivedDigit?: string
  error?: string
}
```

## 🚀 Integração com Frameworks

### Next.js Server Actions

```typescript
'use server'

import { analyzeCNJ } from 'cnj-validate'

export async function validateCNJAction(cnj: string) {
  try {
    const analysis = analyzeCNJ(cnj)
    return { success: true, analysis }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Next.js API Routes

```typescript
// app/api/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateCNJ } from 'cnj-validate'

export async function POST(request: NextRequest) {
  const { cnj } = await request.json()

  const result = validateCNJ(cnj)

  return NextResponse.json(result)
}
```

### React Hooks (Opcional)

```typescript
'use client'

import { useState } from 'react'
import { validateCNJ, AnalysisCNJ } from 'cnj-validate'

export function useCNJValidation() {
  const [result, setResult] = useState<AnalysisCNJ | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = async (cnj: string) => {
    setLoading(true)
    try {
      const analysis = analyzeCNJ(cnj)
      setResult(analysis)
    } catch (error) {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, validate }
}
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar com coverage
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

## 📊 Performance

- **Validação simples**: ~0.1ms
- **Análise completa**: ~0.5ms
- **Processamento CSV (1000 linhas)**: ~500ms
- **Memory footprint**: <1MB

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🛠️ CLI Usage

Após instalação global, use o comando `cnj-process`:

```bash
# Sintaxe básica
cnj-process <arquivo-entrada> [arquivo-saida]

# Exemplos
cnj-process processes.csv                    # Gera processes_processed.csv
cnj-process input.csv output.csv            # Arquivo customizado

# Resultado
✅ Processamento concluído!
📊 Total: 1000 CNJs
✅ Válidos: 987 (98.7%)
⚡ Velocidade: 58,432 CNJs/segundo
💾 Arquivo: output.csv
```

## 📚 Exemplos Práticos

### Validação em Formulários

```typescript
import { validateCNJ } from 'cnj-validate'

function validateProcessForm(cnj: string) {
  const result = validateCNJ(cnj)

  if (!result.isValid) {
    return `CNJ inválido: ${result.error}`
  }

  return 'CNJ válido!'
}
```

### Processamento de Planilha

```typescript
import { processFile } from 'cnj-validate'
import path from 'path'

async function processSpreadsheet() {
  try {
    const result = await processFile(
      path.join(__dirname, 'processes.csv'),
      path.join(__dirname, 'validated_processes.csv'),
    )

    console.log(`✅ ${result.statistics.validCNJs} CNJs válidos processados`)
    return result.outputFile
  } catch (error) {
    console.error('Erro no processamento:', error.message)
  }
}
```

## 🤝 Contributing

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/paulorcvieira/cnj-validate/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/paulorcvieira/cnj-validate/discussions)
- 📧 **Email**: [Create Issue](https://github.com/paulorcvieira/cnj-validate/issues/new)

## 📄 License

[MIT](LICENSE) © CNJ Validate Team

---

Desenvolvido com ❤️ para a comunidade jurídica brasileira
