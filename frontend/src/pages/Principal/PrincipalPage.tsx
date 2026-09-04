import { useCallback, useEffect, useState } from 'react'
import styles from './PrincipalPage.module.css'
import { LoadingScreen } from '../../components/layout/LoadingScreen'
import { NavMenu } from '../../components/layout/NavMenu'
import { ProfileButton } from '../../components/layout/ProfileButton'
import { TransactionForm } from '../../components/transactions/TransactionForm'
import { BalanceCard } from '../../components/transactions/BalanceCard'
import { MonthlyChart } from '../../components/transactions/charts/MonthlyChart'
import { ExpenseChart } from '../../components/transactions/charts/ExpenseChart'
import { InvestmentChart } from '../../components/transactions/charts/InvestmentChart'
import { useAuth } from '../../context/AuthContext'
import { useFotoPerfil } from '../../utils/useFotoPerfil'
import { buscarTransacoes } from '../../api/transactions'
import { calcularTotais } from '../../utils/totals'
import { formatarMoeda } from '../../utils/formatters'
import type { Transaction } from '../../types/transaction'

export function PrincipalPage() {
  const { usuario } = useAuth()
  const { fotoSrc } = useFotoPerfil(usuario?.id ?? null)

  const [transacoes, setTransacoes] = useState<Transaction[]>([])

  const carregarDashboard = useCallback(async () => {
    try {
      const resultado = await buscarTransacoes()
      setTransacoes(resultado)
    } catch (erro) {
      console.error('Erro ao carregar dashboard:', erro)
    }
  }, [])

  useEffect(() => {
    carregarDashboard()
  }, [carregarDashboard])

  const { entradas, saidas, investimentos } = calcularTotais(transacoes)
  const saldo = entradas - saidas

  return (
    <>
      <LoadingScreen />

      <div className={styles['conteudo-principal']}>
        <header className={styles['topo-dashboard']}>
          <img src="/assets/Logo.png" alt="DinControl" className={styles['logo-dincontrol']} />

          <div className={styles['acoes-topo']}>
            <NavMenu styles={styles} paginaAtiva="principal" />

            <div className={styles['area-saldo']}>
              <TransactionForm styles={styles} onTransactionCreated={carregarDashboard} />
              <BalanceCard styles={styles} saldo={saldo} />
            </div>

            <ProfileButton
              styles={styles}
              nome={usuario?.nome ?? 'Usuário'}
              fotoSrc={fotoSrc}
              imgClassName={styles.perfil}
            />
          </div>
        </header>

        <main className={styles['dashboard-grid']}>
          <section className={styles['card-entrada-saida']}>
            <div className={styles['cabecalho-entrada-saida']}>
              <h2>ENTRADA/SAÍDA</h2>
              <span
                className={[styles['indicador-verde'], saidas > entradas && styles['indicador-vermelho']]
                  .filter(Boolean)
                  .join(' ')}
                id="indicadorSaldo"
              ></span>
            </div>

            <div className={styles['linha-card']}></div>

            <div className={styles['resumo-item']}>
              <strong>Entrada:</strong>
              <span id="totalEntrada">{formatarMoeda(entradas)}</span>
            </div>

            <div className={styles['resumo-item']}>
              <strong>Saída:</strong>
              <span id="totalSaida">{formatarMoeda(saidas)}</span>
            </div>

            <div className={styles['resumo-item']}>
              <strong>Investimento:</strong>
              <span id="totalInvestimento">{formatarMoeda(investimentos)}</span>
            </div>
          </section>

          <section className={styles['card-grafico-mensal']}>
            <h2>GRÁFICO MENSAL</h2>
            <div className={styles['linha-titulo']}></div>

            <div className={styles['grafico-mensal-container']}>
              <MonthlyChart transacoes={transacoes} />
            </div>
          </section>

          <section className={styles['card-grafico-saida']}>
            <h2>GRÁFICO DE SAÍDA</h2>
            <div className={styles['linha-grafico-saida']}></div>

            <div className={styles['grafico-saida-container']}>
              <ExpenseChart transacoes={transacoes} />
            </div>
          </section>

          <section className={styles['card-grafico-investimento']}>
            <h2>INVESTIMENTO</h2>
            <div className={styles['linha-grafico-investimento']}></div>

            <div className={styles['grafico-investimento-container']}>
              <InvestmentChart transacoes={transacoes} />
            </div>
          </section>
        </main>

        <img src="/assets/Coin.png" alt="Mascote DinControl" className={styles.Coin} />
      </div>
    </>
  )
}
