import { useNavigate } from 'react-router-dom'

interface ProfileButtonProps {
  styles: Record<string, string>
  nome: string
  fotoSrc: string
  imgClassName?: string
}

export function ProfileButton({ styles, nome, fotoSrc, imgClassName }: ProfileButtonProps) {
  const navigate = useNavigate()

  return (
    <div className={styles['area-perfil']}>
      <span className={styles['nome-usuario']}>{nome}</span>

      <button
        type="button"
        className={styles['botao-perfil']}
        onClick={() => navigate('/perfil')}
      >
        <img src={fotoSrc} alt="Perfil" className={imgClassName} />
      </button>
    </div>
  )
}
