import { formatarMoeda } from '../../utils/formatters'

interface BalanceCardProps {
  styles: Record<string, string>
  saldo: number
}

export function BalanceCard({ styles, saldo }: BalanceCardProps) {
  return (
    <div className={styles['saldo-box']}>
      <div className={styles['saldo-titulo']}>Saldo Atual</div>
      <div className={styles['saldo-valor']} id="valorSaldo">
        {formatarMoeda(saldo)}
      </div>
    </div>
  )
}
