// =====================================================
// ESTADO DO USUÁRIO
// =====================================================

let usuarioAtual = null;
let usuarioId = null;


// =====================================================
// LOADING
// =====================================================

window.addEventListener("load", () => {
    const loadingScreen =
        document.querySelector("#loading-screen");

    setTimeout(() => {
        loadingScreen?.classList.add("esconder");
    }, 1500);
});


// =====================================================
// ELEMENTOS
// =====================================================

const nome = document.querySelector("#nome");
const email = document.querySelector("#email");
const senha = document.querySelector("#senha");

const formulario = document.querySelector("#formPerfil");
const mensagem = document.querySelector("#mensagemPerfil");

const botaoSair = document.querySelector("#sairConta");
const botaoVoltar = document.querySelector("#voltarDashboard");

const fotoPerfil = document.querySelector("#fotoPerfil");
const inputFoto = document.querySelector("#inputFoto");


// =====================================================
// BUSCAR USUÁRIO LOGADO
// =====================================================

async function carregarUsuario() {
    try {
        const resposta = await fetch("/me", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            window.location.href =
                "/login/login.html";

            return false;
        }

        const resultado =
            await resposta.json();

        usuarioAtual =
            resultado.usuario;

        usuarioId =
            usuarioAtual.id;

        nome.value =
            usuarioAtual.nome || "";

        email.value =
            usuarioAtual.email || "";

        carregarFotoSalva();

        return true;

    } catch (erro) {
        console.error(
            "Erro ao verificar sessão:",
            erro
        );

        window.location.href =
            "/login/login.html";

        return false;
    }
}


// =====================================================
// VOLTAR PARA DASHBOARD
// =====================================================

botaoVoltar.addEventListener("click", () => {
    window.location.href =
        "/Principal/principal.html";
});


// =====================================================
// EDITAR PERFIL
// =====================================================

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novoNome =
        nome.value.trim();

    const novoEmail =
        email.value.trim();

    const senhaAtual =
        senha.value.trim();

    if (!novoNome || !novoEmail) {
        mostrarErro(
            "Nome e e-mail são obrigatórios."
        );

        return;
    }

    if (!senhaAtual) {
        mostrarErro(
            "Digite sua senha para salvar as alterações."
        );

        return;
    }

    try {
        const resposta = await fetch(
            "/me",
            {
                method: "PUT",
                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: novoNome,
                    email: novoEmail,
                    senha: senhaAtual
                })
            }
        );

        const resultado =
            await resposta.json();

        if (resposta.status === 401) {
            if (
                resultado.erro ===
                "Senha incorreta."
            ) {
                mostrarErro(
                    resultado.erro
                );

                return;
            }

            window.location.href =
                "/login/login.html";

            return;
        }

        if (!resposta.ok) {
            mostrarErro(
                resultado.erro ||
                "Erro ao atualizar perfil."
            );

            return;
        }

        usuarioAtual =
            resultado.usuario;

        nome.value =
            usuarioAtual.nome;

        email.value =
            usuarioAtual.email;

        senha.value = "";

        mostrarSucesso(
            "Perfil atualizado com sucesso!"
        );

    } catch (erro) {
        console.error(erro);

        mostrarErro(
            "Erro ao conectar com o servidor."
        );
    }
});


// =====================================================
// SAIR DA CONTA
// =====================================================

botaoSair.addEventListener("click", async () => {
    const confirmarSaida =
        confirm("Deseja realmente sair da conta?");

    if (!confirmarSaida) {
        return;
    }

    try {
        await fetch("/logout", {
            method: "POST",
            credentials: "same-origin"
        });

    } catch (erro) {
        console.error(
            "Erro ao realizar logout:",
            erro
        );
    }

    // Remove apenas dados antigos de autenticação.
    // A foto continua salva localmente.
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("usuarioEmail");

    window.location.href =
        "/login/login.html";
});


// =====================================================
// MENSAGENS
// =====================================================

function mostrarErro(texto) {
    mensagem.textContent = texto;

    mensagem.classList.remove(
        "mensagem-sucesso"
    );

    mensagem.classList.add(
        "mensagem-erro"
    );
}


function mostrarSucesso(texto) {
    mensagem.textContent = texto;

    mensagem.classList.remove(
        "mensagem-erro"
    );

    mensagem.classList.add(
        "mensagem-sucesso"
    );
}


// =====================================================
// FOTO SALVA DO USUÁRIO
// =====================================================

function carregarFotoSalva() {
    if (!usuarioId) {
        return;
    }

    const fotoSalva =
        localStorage.getItem(
            `fotoPerfil_${usuarioId}`
        );

    if (fotoSalva) {
        fotoPerfil.src =
            fotoSalva;
    }
}


// =====================================================
// ESCOLHER NOVA FOTO
// =====================================================

inputFoto.addEventListener("change", () => {
    const arquivo =
        inputFoto.files[0];

    if (!arquivo) {
        return;
    }

    if (!arquivo.type.startsWith("image/")) {
        mostrarErro(
            "Selecione uma imagem válida."
        );

        return;
    }

    if (!usuarioId) {
        mostrarErro(
            "Não foi possível identificar o usuário."
        );

        return;
    }

    const leitor =
        new FileReader();

    leitor.onload = () => {
        const imagem =
            leitor.result;

        fotoPerfil.src =
            imagem;

        localStorage.setItem(
            `fotoPerfil_${usuarioId}`,
            imagem
        );

        mostrarSucesso(
            "Foto atualizada!"
        );
    };

    leitor.readAsDataURL(arquivo);
});


// =====================================================
// INICIALIZAÇÃO
// =====================================================

carregarUsuario();
