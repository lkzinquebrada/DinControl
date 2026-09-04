import type { Transaction } from '../types/transaction'
import { normalizarTexto } from './formatters'

export interface Totais {
  entradas: number
  saidas: number
  investimentos: number
}

export function calcularTotais(transacoes: Transaction[]): Totais {
  let entradas = 0
  let saidas = 0
  let investimentos = 0

  transacoes.forEach((transacao) => {
    const valor = Number(transacao.valor) || 0

    if (transacao.tipo === 'ENTRADA') {
      entradas += valor
    }

    if (transacao.tipo === 'SAIDA') {
      saidas += valor
    }

    if (normalizarTexto(transacao.categoria) === 'investimento') {
      investimentos += valor
    }
  })

  return { entradas, saidas, investimentos }
}
