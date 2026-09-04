import type { Transaction } from '../../types/transaction'
import { formatarCategoria } from '../../types/category'
import { formatarHorario, formatarMoeda, nomeTipo, normalizarTipo } from '../../utils/formatters'
import { DeleteTransactionButton } from './DeleteTransactionButton'

interface TransactionRowProps {
  styles: Record<string, string>
  transacao: Transaction
  onDeleted: (id: number) => void
}

export function TransactionRow({ styles, transacao, onDeleted }: TransactionRowProps) {
  const tipo = normalizarTipo(transacao.tipo)
  const entrada = tipo === 'entrada'
  const sinal = entrada ? '+' : '-'
  const classe = entrada ? styles.entrada : styles.saida

  return (
    <div className={styles['linha-historico']}>
      <span className={[styles['valor-transacao'], classe].join(' ')}>
        {sinal}
        {formatarMoeda(transacao.valor)}
      </span>

      <span>{nomeTipo(transacao.tipo)}</span>
      <span>{formatarCategoria(transacao.categoria)}</span>
      <span>{formatarHorario(transacao.data)}</span>

      <DeleteTransactionButton
        className={styles['botao-excluir-transacao']}
        transactionId={transacao.id}
        onDeleted={onDeleted}
      />
    </div>
  )
}
