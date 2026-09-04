import { useEffect, useState } from 'react'

function tela1024(): boolean {
  return window.innerWidth >= 901 && window.innerWidth <= 1149
}

/**
 * Mirrors the original vanilla-JS `tela1024()` + debounced resize
 * listener that decided whether charts render in their "compacto"
 * (1024x600 breakpoint) layout.
 */
export function useCompacto(): boolean {
  const [compacto, setCompacto] = useState(tela1024)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function aoRedimensionar() {
      clearTimeout(timer)
      timer = setTimeout(() => setCompacto(tela1024()), 250)
    }

    window.addEventListener('resize', aoRedimensionar)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', aoRedimensionar)
    }
  }, [])

  return compacto
}
