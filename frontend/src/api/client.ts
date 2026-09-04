export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  const resposta = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  const temCorpo = resposta.status !== 204
  const resultado = temCorpo ? await resposta.json().catch(() => ({})) : {}

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      (resultado as { erro?: string }).erro || 'Erro ao conectar com o servidor.',
    )
  }

  return resultado as T
}
