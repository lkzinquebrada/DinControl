import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import styles from './CadastroPage.module.css'
import { cadastrarUsuario } from '../../api/auth'
import { ApiError } from '../../api/client'
import { validarSenha } from '../../utils/password'

export function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function aoEnviar(event: FormEvent) {
    event.preventDefault()

    const nomeTrim = nome.trim()
    const emailTrim = email.trim()
    const senhaTrim = senha.trim()

    if (!nomeTrim || !emailTrim || !senhaTrim) {
      setMensagem('Preencha todos os campos.')
      setSucesso(false)
      return
    }

    const erroSenha = validarSenha(senhaTrim)

    if (erroSenha) {
      setMensagem(erroSenha)
      setSucesso(false)
      return
    }

    try {
      await cadastrarUsuario({ nome: nomeTrim, email: emailTrim, senha: senhaTrim })

      setMensagem('Conta criada com sucesso!')
      setSucesso(true)
      setNome('')
      setEmail('')
      setSenha('')
    } catch (erro) {
      setSucesso(false)
      setMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
      )
    }
  }

  return (
    <div className={styles['conteudo-cadastro']}>
      <img
        src="/assets/Logo.png"
        alt="DinControl"
        className={styles['logo-dincontrol']}
      />

      <div className={styles.cadastro}>
        <h1 className={styles.titulo}>Crie sua conta</h1>
        <p className={styles.SubTitulo}>Comece a controlar suas finanças</p>

        <form id="formCadastro" className={styles.formCadastro} onSubmit={aoEnviar}>
          <label htmlFor="nome">Nome completo</label>

          <input
            type="text"
            id="nome"
            placeholder="Digite seu nome"
            required
            autoCorrect="off"
            spellCheck={false}
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />

          <label htmlFor="email">Email</label>

          <input
            type="email"
            id="email"
            placeholder="Digite seu email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="senha">Senha</label>

          <div className={styles.CampoSenha}>
            <input
              type={senhaVisivel ? 'text' : 'password'}
              id="senha"
              placeholder="Digite sua senha"
              required
              minLength={5}
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]+"
              value={senha}
              onChange={(event) => setSenha(event.target.value.replace(/\D/g, ''))}
            />

            <button
              type="button"
              id="toggleSenha"
              className={styles['botao-olho']}
              onClick={() => setSenhaVisivel((valor) => !valor)}
            >
              <img src="/assets/olho.png" alt="Mostrar senha" />
            </button>
          </div>

          <button type="submit">Criar conta</button>

          <p className={styles['login-link']}>
            Já possui uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>

        <p
          id="mensagem"
          className={styles.mensagem}
          style={{ color: sucesso ? '#159447' : '#e63946' }}
        >
          {mensagem}
        </p>
      </div>

      <img src="/assets/Coin.png" alt="Coin1" className={styles.Coin} />
    </div>
  )
}
