export interface User {
  id: number
  nome: string
  email: string
}

export interface UpdateUserPayload {
  nome: string
  email: string
  senha: string
}

export interface RegisterPayload {
  nome: string
  email: string
  senha: string
}

export interface LoginPayload {
  email: string
  senha: string
}
