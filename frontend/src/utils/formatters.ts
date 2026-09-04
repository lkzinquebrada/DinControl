export function formatarMoeda(valor: number | string): string {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatarEixoMoeda(valor: number | string): string {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

export function normalizarTexto(texto: string | null | undefined): string {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function normalizarTipo(tipo: string | null | undefined): string {
  return String(tipo || '').trim().toLowerCase()
}

export function nomeTipo(tipo: string): string {
  const tipoNormalizado = normalizarTipo(tipo)

  if (tipoNormalizado === 'entrada') {
    return 'Entrada'
  }

  if (tipoNormalizado === 'saida' || tipoNormalizado === 'saída') {
    return 'Saída'
  }

  return tipo
}

export function inicioDoDia(data: Date | string): Date {
  const novaData = new Date(data)
  novaData.setHours(0, 0, 0, 0)
  return novaData
}

export function tituloDaData(data: Date | string): string {
  const dataTransacao = inicioDoDia(data)
  const hoje = inicioDoDia(new Date())

  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  if (dataTransacao.getTime() === hoje.getTime()) {
    return 'Hoje'
  }

  if (dataTransacao.getTime() === ontem.getTime()) {
    return 'Ontem'
  }

  return dataTransacao.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function chaveData(data: Date | string): string {
  const d = new Date(data)

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export function formatarHorario(data: Date | string): string {
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
