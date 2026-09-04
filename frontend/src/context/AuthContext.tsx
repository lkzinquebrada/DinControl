import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { buscarUsuarioLogado, logout as logoutRequest } from '../api/auth'
import { ApiError } from '../api/client'
import type { User } from '../types/user'

interface AuthContextValue {
  usuario: User | null
  carregando: boolean
  autenticado: boolean
  definirUsuario: (usuario: User) => void
  recarregarUsuario: () => Promise<void>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [carregando, setCarregando] = useState(true)

  const recarregarUsuario = useCallback(async () => {
    try {
      const resultado = await buscarUsuarioLogado()
      setUsuario(resultado.usuario)
    } catch (erro) {
      setUsuario(null)

      if (!(erro instanceof ApiError)) {
        console.error('Erro ao verificar sessão:', erro)
      }
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    recarregarUsuario()
  }, [recarregarUsuario])

  const sair = useCallback(async () => {
    try {
      await logoutRequest()
    } catch (erro) {
      console.error('Erro ao realizar logout:', erro)
    }

    setUsuario(null)
  }, [])

  const value: AuthContextValue = {
    usuario,
    carregando,
    autenticado: usuario !== null,
    definirUsuario: setUsuario,
    recarregarUsuario,
    sair,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}
