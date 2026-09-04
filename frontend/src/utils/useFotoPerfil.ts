import { useEffect, useState } from 'react'

const FOTO_PADRAO = '/assets/perfil.png'

function chaveFoto(usuarioId: number | null): string | null {
  return usuarioId ? `fotoPerfil_${usuarioId}` : null
}

export function useFotoPerfil(usuarioId: number | null) {
  const [fotoSrc, setFotoSrc] = useState(FOTO_PADRAO)

  useEffect(() => {
    const chave = chaveFoto(usuarioId)

    if (!chave) {
      setFotoSrc(FOTO_PADRAO)
      return
    }

    const fotoSalva = localStorage.getItem(chave)
    setFotoSrc(fotoSalva || FOTO_PADRAO)
  }, [usuarioId])

  function salvarFoto(dataUrl: string) {
    const chave = chaveFoto(usuarioId)

    if (!chave) {
      return
    }

    localStorage.setItem(chave, dataUrl)
    setFotoSrc(dataUrl)
  }

  return { fotoSrc, salvarFoto }
}
