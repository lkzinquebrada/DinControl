import { useEffect, useMemo, useState } from 'react'
import styles from './HistoricoPage.module.css'
import { LoadingScreen } from '../../components/layout/LoadingScreen'
import { NavMenu } from '../../components/layout/NavMenu'
import { ProfileButton } from '../../components/layout/ProfileButton'
import { HistoryFilters } from '../../components/transactions/HistoryFilters'
import type { HistoryFiltersValue } from '../../components/transactions/HistoryFilters'
import { TransactionHistory } from '../../components/transactions/TransactionHistory'
import { useAuth } from '../../context/AuthContext'
import { useFotoPerfil } from '../../utils/useFotoPerfil'
import { buscarTransacoes } from '../../api/transactions'
import { formatarMoeda, normalizarTipo } from '../../utils/formatters'
import type { Transaction } from '../../types/transaction'

export function HistoricoPage() {
  const { usuario } = useAuth()
  const { fotoSrc } = useFotoPerfil(usuario?.id ?? null)

  const [transacoes, setTransacoes] = useState<Transaction[]>([])
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const [filtros, setFiltros] = useState<HistoryFiltersValue>(() => ({
    tipo: 'todos',
    mes: String(new Date().getMonth()),
    categoria: 'todos',
  }))

  useEffect(() => {
    async function carregar() {
      try {
        const resultado = await buscarTransacoes()

        resultado.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
        )

        setTransacoes(resultado)
      } catch (erro) {
        console.error('Erro ao carregar histórico:', erro)
        setErroCarregamento(true)
      }
    }

    carregar()
  }, [])

  const categoriasDisponiveis = useMemo(() => {
    const categorias = [
      ...new Set(transacoes.map((transacao) => transacao.categoria).filter(Boolean)),
    ]

    categorias.sort()
    return categorias
  }, [transacoes])

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((transacao) => {
      const data = new Date(transacao.data)
      const tipoTransacao = normalizarTipo(transacao.tipo)

      if (filtros.tipo !== 'todos' && tipoTransacao !== filtros.tipo) {
        return false
      }

      if (filtros.mes !== 'todos' && data.getMonth() !== Number(filtros.mes)) {
        return false
      }

      if (filtros.categoria !== 'todos' && transacao.categoria !== filtros.categoria) {
        return false
      }

      return true
    })
  }, [transacoes, filtros])

  const resumo = useMemo(() => {
    let entrada = 0
    let saida = 0

    transacoesFiltradas.forEach((transacao) => {
      const valor = Number(transacao.valor)
      const tipo = normalizarTipo(transacao.tipo)

      if (tipo === 'entrada') {
        entrada += valor
      }

      if (tipo === 'saida' || tipo === 'saída') {
        saida += valor
      }
    })

    return { entrada, saida, saldo: entrada - saida }
  }, [transacoesFiltradas])

  function aoExcluir(id: number) {
    setTransacoes((estado) => estado.filter((transacao) => transacao.id !== id))
  }

  return (
    <>
      <LoadingScreen atraso={0} estilizado={false} />

      <div className={styles['pagina-historico']}>
        <img src="/assets/Logo.png" alt="DinControl" className={styles['logo-dincontrol']} />

        <ProfileButton
          styles={styles}
          nome={usuario?.nome ?? 'Usuário'}
          fotoSrc={fotoSrc}
        />

        <NavMenu styles={styles} paginaAtiva="historico" />

        <main className={styles['card-historico']}>
          <div className={styles['cabecalho-historico']}>
            <h1>HISTÓRICO</h1>

            <HistoryFilters
              styles={styles}
              valor={filtros}
              categoriasDisponiveis={categoriasDisponiveis}
              onChange={setFiltros}
            />
          </div>

          <div className={styles['resumo-historico']}>
            <div className={styles['resumo-box']}>
              <span className={styles['resumo-titulo']}>Entrada</span>
              <strong className={styles['valor-entrada']} id="resumoEntrada">
                {formatarMoeda(resumo.entrada)}
              </strong>
            </div>

            <div className={styles['resumo-box']}>
              <span className={styles['resumo-titulo']}>Saída</span>
              <strong className={styles['valor-saida']} id="resumoSaida">
                {formatarMoeda(resumo.saida)}
              </strong>
            </div>

            <div className={styles['resumo-box']}>
              <span className={styles['resumo-titulo']}>Saldo</span>
              <strong
                className={styles['valor-saldo']}
                id="resumoSaldo"
                style={{ color: resumo.saldo >= 0 ? '#00ff26' : '#ff0000' }}
              >
                {formatarMoeda(resumo.saldo)}
              </strong>
            </div>
          </div>

          <div className={styles['cabecalho-tabela']}>
            <span>Valor</span>
            <span>Tipo</span>
            <span>Categoria</span>
            <span>Horário</span>
          </div>

          {erroCarregamento ? (
            <div className={styles['sem-transacoes']}>Erro ao carregar o histórico.</div>
          ) : (
            <TransactionHistory styles={styles} transacoes={transacoesFiltradas} onDeleted={aoExcluir} />
          )}
        </main>
      </div>

      <img src="/assets/Coin.png" alt="Coin" className={styles.Coin} />
    </>
  )
}
