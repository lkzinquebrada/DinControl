export type CategoriaEntrada = 'Salario' | 'Outros' | 'Personalizada'

export type CategoriaSaida =
  | 'Alimentacao'
  | 'Locomocao'
  | 'Lazer'
  | 'Educacao'
  | 'Investimento'
  | 'Outros'
  | 'Personalizada'

export const CATEGORIA_PERSONALIZADA = 'Personalizada' as const

export interface CategoryOption {
  value: string
  label: string
}

export const CATEGORIAS_ENTRADA: CategoryOption[] = [
  { value: 'Salario', label: 'Salário' },
  { value: 'Outros', label: 'Outros' },
  { value: CATEGORIA_PERSONALIZADA, label: 'Categoria personalizada' },
]

export const CATEGORIAS_SAIDA: CategoryOption[] = [
  { value: 'Alimentacao', label: 'Alimentação' },
  { value: 'Locomocao', label: 'Locomoção' },
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Educacao', label: 'Educação' },
  { value: 'Investimento', label: 'Investimento' },
  { value: 'Outros', label: 'Outros' },
  { value: CATEGORIA_PERSONALIZADA, label: 'Categoria personalizada' },
]

const ROTULOS_CATEGORIA: Record<string, string> = {
  Salario: 'Salário',
  Alimentacao: 'Alimentação',
  Locomocao: 'Locomoção',
  Educacao: 'Educação',
  Investimento: 'Investimento',
  Lazer: 'Lazer',
  Outros: 'Outros',
}

export function formatarCategoria(categoria: string | null | undefined): string {
  if (!categoria) {
    return 'Sem categoria'
  }

  return ROTULOS_CATEGORIA[categoria] || categoria
}
