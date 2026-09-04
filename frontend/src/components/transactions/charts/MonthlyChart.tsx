import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { MESES } from '../../../utils/constants'
import { formatarMoeda } from '../../../utils/formatters'
import { calcularLimiteMaximo, obterEixosGrafico, obterPaddingGrafico } from '../../../utils/chartOptions'
import { useCompacto } from '../../../utils/useCompacto'

function obterMovimentacaoMensal(transacoes: Transaction[]) {
  const entradas = Array(12).fill(0)
  const saidas = Array(12).fill(0)

  transacoes.forEach((transacao) => {
    if (!transacao.data) {
      return
    }

    const data = new Date(transacao.data)

    if (isNaN(data.getTime())) {
      return
    }

    const mes = data.getMonth()
    const valor = Number(transacao.valor) || 0

    if (transacao.tipo === 'ENTRADA') {
      entradas[mes] += valor
    }

    if (transacao.tipo === 'SAIDA') {
      saidas[mes] += valor
    }
  })

  return { entradas, saidas }
}

interface MonthlyChartProps {
  transacoes: Transaction[]
}

export function MonthlyChart({ transacoes }: MonthlyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)
  const compacto = useCompacto()

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const { entradas, saidas } = obterMovimentacaoMensal(transacoes)
    const limiteMaximo = calcularLimiteMaximo([...entradas, ...saidas])

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: MESES,
        datasets: [
          { label: 'Saída', data: saidas, backgroundColor: '#ff4b45', borderRadius: 2 },
          { label: 'Entrada', data: entradas, backgroundColor: '#9abd43', borderRadius: 2 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        layout: { padding: obterPaddingGrafico(compacto) },
        plugins: {
          datalabels: { display: false },
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: compacto ? 4 : 6,
              boxHeight: compacto ? 4 : 6,
              padding: compacto ? 5 : 8,
              font: { size: compacto ? 9 : 15 },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const valor = Number(context.raw)
                return `${context.dataset.label}: ${formatarMoeda(valor)}`
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

  return (
    <canvas id="graficoMensal" ref={canvasRef} />
  )
}
