import { apiRequest } from './client'
import type { LoginPayload, RegisterPayload, UpdateUserPayload, User } from '../types/user'

export function buscarUsuarioLogado() {
  return apiRequest<{ usuario: User }>('/me')
}

export function login(payload: LoginPayload) {
  return apiRequest<{ mensagem: string; usuario: User }>('/login', {
    method: 'POST',
    body: payload,
  })
}

export function logout() {
  return apiRequest<{ mensagem: string }>('/logout', { method: 'POST' })
}

export function cadastrarUsuario(payload: RegisterPayload) {
  return apiRequest<{ mensagem: string; usuario: User }>('/users', {
    method: 'POST',
    body: payload,
  })
}

export function atualizarUsuario(payload: UpdateUserPayload) {
  return apiRequest<{ mensagem: string; usuario: User }>('/me', {
    method: 'PUT',
    body: payload,
  })
}

export function enviarCodigoRecuperacao(email: string) {
  return apiRequest<{ sucesso: boolean; mensagem: string }>(
    '/forgot-password/send-code',
    { method: 'POST', body: { email } },
  )
}

export function verificarCodigoRecuperacao(email: string, codigo: string) {
  return apiRequest<{ sucesso: boolean; mensagem: string; resetToken: string }>(
    '/forgot-password/verify-code',
    { method: 'POST', body: { email, codigo } },
  )
}

export function redefinirSenha(
  email: string,
  resetToken: string,
  novaSenha: string,
) {
  return apiRequest<{ sucesso: boolean; mensagem: string }>(
    '/forgot-password/reset-password',
    { method: 'POST', body: { email, resetToken, novaSenha } },
  )
}
