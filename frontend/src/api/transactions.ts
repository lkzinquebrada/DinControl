import { apiRequest } from './client'
import type { NewTransactionPayload, Transaction } from '../types/transaction'

export function buscarTransacoes() {
  return apiRequest<Transaction[]>('/transactions')
}

export function cadastrarTransacao(payload: NewTransactionPayload) {
  return apiRequest<{ mensagem: string; transacao: Transaction }>('/transactions', {
    method: 'POST',
    body: payload,
  })
}

export function excluirTransacao(id: number) {
  return apiRequest<{ mensagem: string; transacao: Transaction }>(
    `/transactions/${id}`,
    { method: 'DELETE' },
  )
}
