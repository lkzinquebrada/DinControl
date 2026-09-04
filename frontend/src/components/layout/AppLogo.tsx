import styles from './AppBrand.module.css'

/** Logo used on every authenticated page (Principal is the visual reference). */
export function AppLogo() {
  return (
    <img src="/assets/Logo.png" alt="DinControl" className={styles['logo-dincontrol']} />
  )
}
