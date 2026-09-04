import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'
import { LoadingScreen } from '../../components/layout/LoadingScreen'
import { AuthLogo } from '../../components/layout/AuthLogo'
import { AuthCoin } from '../../components/layout/AuthCoin'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { definirUsuario } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function aoEnviar(event: FormEvent) {
    event.preventDefault()
    setMensagem('')

    try {
      const resultado = await login({
        email: email.trim(),
        senha: senha.trim(),
      })

      definirUsuario(resultado.usuario)
      navigate('/principal')
    } catch (erro) {
      setMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
      )
    }
  }

  return (
    <>
      <LoadingScreen estilizado={false} />

      <div className={styles['conteudo-login']}>
        <AuthLogo />

        <div className={styles.login}>
          <h1 className={styles.T}>Seja Bem Vindo(a)</h1>
          <p className={styles.SBT}>Faça login para continuar</p>

          <form id="formLogin" className={styles.formLogin} onSubmit={aoEnviar}>
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Digite seu email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <div className={styles['linha-senha']}>
              <label htmlFor="senha">Senha</label>

              <div className={styles.Esqueci}>
                <Link to="/redefinir">Esqueceu sua senha?</Link>
              </div>
            </div>

            <div className={styles.CampoSenha}>
              <input
                type={senhaVisivel ? 'text' : 'password'}
                id="senha"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
              />

              <button
                type="button"
                className={styles['botao-olho']}
                onClick={() => setSenhaVisivel((valor) => !valor)}
              >
                <img src="/assets/olho.png" alt="Mostrar senha" />
              </button>
            </div>

            <button className={styles['botao-entrar']} type="submit">
              Entrar
            </button>

            <p className={styles['login-link']}>
              Não possui uma conta? <Link to="/cadastro">Cadastre-se</Link>
            </p>
          </form>

          <p id="mensagem" className={styles.mensagem}>
            {mensagem}
          </p>
        </div>
      </div>

      <AuthCoin />
    </>
  )
}
