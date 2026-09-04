import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { formatarMoeda } from '../../../utils/formatters'
import {
  obterCoresCategoriasSaida,
  obterSaidasPorCategoria,
  formatarRotuloCategoriaSaida,
} from '../../../utils/expenseCategories'
import { useCompacto } from '../../../utils/useCompacto'

interface ExpenseChartProps {
  transacoes: Transaction[]
}

export function ExpenseChart({ transacoes }: ExpenseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'pie'> | null>(null)
  const compacto = useCompacto()

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const categorias = obterSaidasPorCategoria(transacoes)
    const chaves: string[] = []
    const rotulos: string[] = []
    const valores: number[] = []

    categorias.forEach((valor, chave) => {
      chaves.push(chave)
      rotulos.push(formatarRotuloCategoriaSaida(chave))
      valores.push(valor)
    })

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: rotulos,
        datasets: [
          {
            data: valores,
            backgroundColor: obterCoresCategoriasSaida(chaves),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: compacto ? 3 : 5,
            right: compacto ? 3 : 5,
            top: compacto ? 3 : 5,
            bottom: compacto ? 3 : 5,
          },
        },
        plugins: {
          datalabels: {
            color: '#ffffff',
            font: { size: compacto ? 8 : 10, weight: 'bold' },
            formatter(valor, context) {
              const dados = context.chart.data.datasets[0].data as number[]
              const total = dados.reduce((soma, numero) => soma + Number(numero), 0)

              if (valor === 0 || total === 0) {
                return ''
              }

              const porcentagem = (Number(valor) / total) * 100
              return `${porcentagem.toFixed(0)}%`
            },
          },
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: compacto ? 5 : 7,
              boxHeight: compacto ? 5 : 7,
              padding: compacto ? 5 : 11,
              font: { size: compacto ? 9 : 10 },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const valor = Number(context.raw)
                const dados = context.dataset.data as number[]
                const total = dados.reduce((soma, numero) => soma + Number(numero), 0)
                const porcentagem = total > 0 ? ((valor / total) * 100).toFixed(1) : '0'

                return `${context.label}: ${formatarMoeda(valor)} (${porcentagem}%)`
              },
            },
          },
        },
      },
    }

    chartRef.current = new Chart(canvas, config)

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [transacoes, compacto])

  return <canvas id="graficoSaida" ref={canvasRef} />
}
