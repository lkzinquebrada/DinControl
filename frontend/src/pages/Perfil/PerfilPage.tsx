import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './PerfilPage.module.css'
import { LoadingScreen } from '../../components/layout/LoadingScreen'
import { AppLogo } from '../../components/layout/AppLogo'
import { AppCoin } from '../../components/layout/AppCoin'
import { useAuth } from '../../context/AuthContext'
import { useFotoPerfil } from '../../utils/useFotoPerfil'
import { atualizarUsuario } from '../../api/auth'
import { ApiError } from '../../api/client'

export function PerfilPage() {
  const navigate = useNavigate()
  const { usuario, definirUsuario, sair } = useAuth()
  const { fotoSrc, salvarFoto } = useFotoPerfil(usuario?.id ?? null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState<boolean | null>(null)

  const inputFotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '')
      setEmail(usuario.email || '')
    }
  }, [usuario])

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setErro(true)
  }

  function mostrarSucesso(texto: string) {
    setMensagem(texto)
    setErro(false)
  }

  async function aoSalvar(event: FormEvent) {
    event.preventDefault()

    const novoNome = nome.trim()
    const novoEmail = email.trim()
    const senhaAtual = senha.trim()

    if (!novoNome || !novoEmail) {
      mostrarErro('Nome e e-mail são obrigatórios.')
      return
    }

    if (!senhaAtual) {
      mostrarErro('Digite sua senha para salvar as alterações.')
      return
    }

    try {
      const resultado = await atualizarUsuario({
        nome: novoNome,
        email: novoEmail,
        senha: senhaAtual,
      })

      definirUsuario(resultado.usuario)
      setNome(resultado.usuario.nome)
      setEmail(resultado.usuario.email)
      setSenha('')

      mostrarSucesso('Perfil atualizado com sucesso!')
    } catch (erroRequisicao) {
      if (erroRequisicao instanceof ApiError && erroRequisicao.status === 401) {
        if (erroRequisicao.message === 'Senha incorreta.') {
          mostrarErro(erroRequisicao.message)
          return
        }

        navigate('/login')
        return
      }

      mostrarErro(
        erroRequisicao instanceof ApiError ? erroRequisicao.message : 'Erro ao atualizar perfil.',
      )
    }
  }

  async function aoSair() {
    const confirmarSaida = confirm('Deseja realmente sair da conta?')

    if (!confirmarSaida) {
      return
    }

    await sair()
    navigate('/login')
  }

  function aoEscolherFoto() {
    const arquivo = inputFotoRef.current?.files?.[0]

    if (!arquivo) {
      return
    }

    if (!arquivo.type.startsWith('image/')) {
      mostrarErro('Selecione uma imagem válida.')
      return
    }

    if (!usuario) {
      mostrarErro('Não foi possível identificar o usuário.')
      return
    }

    const leitor = new FileReader()

    leitor.onload = () => {
      const imagem = leitor.result as string
      salvarFoto(imagem)
      mostrarSucesso('Foto atualizada!')
    }

    leitor.readAsDataURL(arquivo)
  }

  return (
    <>
      <LoadingScreen />

      <div className={styles['pagina-perfil']}>
        <AppLogo />

        <button
          type="button"
          className={styles['botao-voltar']}
          id="voltarDashboard"
          aria-label="Voltar para o dashboard"
          onClick={() => navigate('/principal')}
        >
          ←
        </button>

        <main className={styles['card-perfil']}>
          <h1>Meu Perfil</h1>
          <div className={styles['linha-titulo']}></div>

          <div className={styles['foto-perfil']}>
            <img src={fotoSrc} alt="Foto de perfil" id="fotoPerfil" className={styles.fotoPerfil} />

            <label htmlFor="inputFoto" className={styles['botao-foto']}>
              Escolher foto
            </label>

            <input
              type="file"
              id="inputFoto"
              accept="image/png, image/jpeg, image/webp"
              hidden
              ref={inputFotoRef}
              onChange={aoEscolherFoto}
            />
          </div>

          <form id="formPerfil" className={styles.formPerfil} onSubmit={aoSalvar}>
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              autoComplete="name"
              required
              autoCorrect="off"
              spellCheck={false}
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />

            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label htmlFor="senha">Senha necessária para alteração</label>
            <input
              type="password"
              id="senha"
              placeholder="Digite sua senha"
              autoComplete="new-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />

            <button type="submit" className={styles['botao-salvar']}>
              SALVAR ALTERAÇÕES
            </button>
          </form>

          <p
            id="mensagemPerfil"
            className={[
              styles.mensagemPerfil,
              erro === true && styles['mensagem-erro'],
              erro === false && styles['mensagem-sucesso'],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {mensagem}
          </p>

          <button type="button" className={styles['botao-sair']} id="sairConta" onClick={aoSair}>
            SAIR DA CONTA
          </button>
        </main>

        <AppCoin />
      </div>
    </>
  )
}
