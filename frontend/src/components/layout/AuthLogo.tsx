import styles from './AuthBrand.module.css'

/** Logo used on every pre-authentication page (Login is the visual reference). */
export function AuthLogo() {
  return (
    <img src="/assets/Logo.png" alt="DinControl" className={styles['logo-dincontrol']} />
  )
}
