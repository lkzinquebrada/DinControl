import type { ChartOptions } from 'chart.js'
import { formatarEixoMoeda } from './formatters'

type CartesianScales = ChartOptions<'bar'>['scales']

export function calcularLimiteMaximo(valores: number[]): number {
  const maiorValor = Math.max(...valores)

  if (maiorValor === 0) {
    return 5000
  }

  const limite = Math.ceil(maiorValor / 1000) * 1000

  return Math.max(limite, 1000)
}

export function obterPaddingGrafico(compacto: boolean) {
  return {
    left: compacto ? 2 : 5,
    right: compacto ? 2 : 5,
    top: compacto ? 0 : 3,
    bottom: compacto ? 0 : 3,
  }
}

export function obterEixosGrafico(limiteMaximo: number, compacto: boolean): CartesianScales {
  return {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#ffffff',
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false,
        padding: compacto ? 2 : 5,
        font: {
          size: compacto ? 7 : 10,
        },
      },
    },
    y: {
      beginAtZero: true,
      max: limiteMaximo,
      grid: {
        color: 'rgba(255,255,255,0.08)',
      },
      ticks: {
        color: '#ffffff',
        stepSize: limiteMaximo / 5,
        font: {
          size: compacto ? 7 : 9,
        },
        callback: formatarEixoMoeda,
      },
    },
  }
}
