import { excluirTransacao } from '../../api/transactions'
import { ApiError } from '../../api/client'

interface DeleteTransactionButtonProps {
  className?: string
  transactionId: number
  onDeleted: (id: number) => void
}

export function DeleteTransactionButton({ className, transactionId, onDeleted }: DeleteTransactionButtonProps) {
  async function aoClicar() {
    const confirmado = confirm('Tem certeza que deseja excluir esta transação?')

    if (!confirmado) {
      return
    }

    try {
      await excluirTransacao(transactionId)
      onDeleted(transactionId)
    } catch (erro) {
      console.error('Erro ao excluir transação:', erro)
      alert(erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.')
    }
  }

  return (
    <button
      type="button"
      className={className}
      aria-label="Excluir transação"
      onClick={aoClicar}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 7h16" strokeLinecap="round" />
        <path d="M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 11v6M14 11v6" strokeLinecap="round" />
      </svg>
    </button>
  )
}
