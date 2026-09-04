import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { MESES } from '../../../utils/constants'
import { formatarMoeda, normalizarTexto } from '../../../utils/formatters'
import { calcularLimiteMaximo, obterEixosGrafico, obterPaddingGrafico } from '../../../utils/chartOptions'
import { useCompacto } from '../../../utils/useCompacto'

function obterInvestimentosMensais(transacoes: Transaction[]): number[] {
  const investimentos = Array(12).fill(0)

  transacoes.forEach((transacao) => {
    if (!transacao.data || !transacao.categoria) {
      return
    }

    if (normalizarTexto(transacao.categoria) !== 'investimento') {
      return
    }

    const data = new Date(transacao.data)

    if (isNaN(data.getTime())) {
      return
    }

    const valor = Number(transacao.valor)

    if (isNaN(valor)) {
      return
    }

    investimentos[data.getMonth()] += valor
  })

  return investimentos
}

interface InvestmentChartProps {
  transacoes: Transaction[]
}

export function InvestmentChart({ transacoes }: InvestmentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)
  const compacto = useCompacto()

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const investimentos = obterInvestimentosMensais(transacoes)
    const limiteMaximo = calcularLimiteMaximo(investimentos)

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: MESES,
        datasets: [
          {
            label: 'Investimento',
            data: investimentos,
            backgroundColor: '#020074',
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        layout: { padding: obterPaddingGrafico(compacto) },
        plugins: {
          datalabels: { display: false },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                return `Investimento: ${formatarMoeda(Number(context.raw))}`
              },
            },
          },
        },
        scales: obterEixosGrafico(limiteMaximo, compacto),
      },
    }

    chartRef.current = new Chart(canvas, config)

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [transacoes, compacto])

  return <canvas id="graficoInvestimento" ref={canvasRef} />
}
