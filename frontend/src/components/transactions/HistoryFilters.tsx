import { formatarCategoria } from '../../types/category'

const MESES_FILTRO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export interface HistoryFiltersValue {
  tipo: string
  mes: string
  categoria: string
}

interface HistoryFiltersProps {
  styles: Record<string, string>
  valor: HistoryFiltersValue
  categoriasDisponiveis: string[]
  onChange: (valor: HistoryFiltersValue) => void
}

export function HistoryFilters({ styles, valor, categoriasDisponiveis, onChange }: HistoryFiltersProps) {
  return (
    <div className={styles.filtros}>
      <select
        id="filtroTipo"
        value={valor.tipo}
        onChange={(event) => onChange({ ...valor, tipo: event.target.value })}
      >
        <option value="todos">Tipo</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      <select
        id="filtroMes"
        value={valor.mes}
        onChange={(event) => onChange({ ...valor, mes: event.target.value })}
      >
        <option value="todos">Todos os meses</option>
        {MESES_FILTRO.map((mes, indice) => (
          <option key={mes} value={String(indice)}>
            {mes}
          </option>
        ))}
      </select>

      <select
        id="filtroCategoria"
        value={valor.categoria}
        onChange={(event) => onChange({ ...valor, categoria: event.target.value })}
      >
        <option value="todos">Categoria</option>
        {categoriasDisponiveis.map((categoria) => (
          <option key={categoria} value={categoria}>
            {formatarCategoria(categoria)}
          </option>
        ))}
      </select>
    </div>
  )
}
