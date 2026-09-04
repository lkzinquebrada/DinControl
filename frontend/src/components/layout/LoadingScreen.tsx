import { useEffect, useState } from 'react'
import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
  /** Delay in ms before the "esconder" (hide) transition kicks in. */
  atraso?: number
  /**
   * Some original pages (Historico, Login) never had CSS for
   * #loading-screen/.loader, so the markup was inert there. Preserve
   * that by skipping the styled overlay when false.
   */
  estilizado?: boolean
}

export function LoadingScreen({ atraso = 1500, estilizado = true }: LoadingScreenProps) {
  const [escondido, setEscondido] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setEscondido(true), atraso)
    return () => clearTimeout(timer)
  }, [atraso])

  if (!estilizado) {
    return escondido ? null : <div id="loading-screen" />
  }

  const classeTela = [styles['loading-screen'], escondido && styles.esconder]
    .filter(Boolean)
    .join(' ')

  return (
    <div id="loading-screen" className={classeTela}>
      <div className={styles.loader}></div>
    </div>
  )
}
