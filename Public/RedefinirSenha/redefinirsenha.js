// =====================================================
// ELEMENTOS
// =====================================================

const novaSenhaInput = document.getElementById("novaSenha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");

const btnRedefinirSenha = document.getElementById("btnRedefinirSenha");

const olhoNovaSenha = document.getElementById("olhoNovaSenha");
const olhoConfirmarSenha = document.getElementById("olhoConfirmarSenha");

const mensagem = document.getElementById("mensagem");


// =====================================================
// DADOS DA RECUPERAÇÃO
// =====================================================

const email = sessionStorage.getItem("emailRecuperacao");
const resetToken = sessionStorage.getItem("resetToken");


// =====================================================
// BLOQUEIA ACESSO DIRETO À PÁGINA
// =====================================================

if (!email || !resetToken) {
    window.location.href =
        "/Redefinir/redefinir.html";
}


// =====================================================
// PERMITE SOMENTE NÚMEROS
// =====================================================

function permitirSomenteNumeros(input) {
    input.value = input.value.replace(/\D/g, "");
}

novaSenhaInput.addEventListener("input", () => {
    permitirSomenteNumeros(novaSenhaInput);
});

confirmarSenhaInput.addEventListener("input", () => {
    permitirSomenteNumeros(confirmarSenhaInput);
});


// =====================================================
// BOTÃO REDEFINIR SENHA
// =====================================================

btnRedefinirSenha.addEventListener("click", async () => {
    const novaSenha = novaSenhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    if (!novaSenha || !confirmarSenha) {
        mostrarMensagem(
            "Preencha os dois campos.",
            "erro"
        );

        return;
    }

    if (!/^\d+$/.test(novaSenha)) {
        mostrarMensagem(
            "A senha deve conter somente números.",
            "erro"
        );

        novaSenhaInput.focus();
        return;
    }

    if (novaSenha.length < 5) {
        mostrarMensagem(
            "A senha deve conter no mínimo 5 números.",
            "erro"
        );

        novaSenhaInput.focus();
        return;
    }

    const numeros = novaSenha.split("");
    const numerosUnicos = new Set(numeros);

    if (numerosUnicos.size !== numeros.length) {
        mostrarMensagem(
            "A senha não pode conter números repetidos.",
            "erro"
        );

        novaSenhaInput.focus();
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarMensagem(
            "As senhas não são iguais.",
            "erro"
        );

        confirmarSenhaInput.focus();
        return;
    }

    try {
        btnRedefinirSenha.disabled = true;
        btnRedefinirSenha.textContent = "Redefinindo...";

        mostrarMensagem(
            "Alterando sua senha...",
            "normal"
        );

        const resposta = await fetch(
            "/forgot-password/reset-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    resetToken,
                    novaSenha
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem(
                resultado.erro ||
                "Erro ao redefinir senha.",
                "erro"
            );

            return;
        }

        mostrarMensagem(
            "Senha redefinida com sucesso!",
            "sucesso"
        );

        sessionStorage.removeItem("emailRecuperacao");
        sessionStorage.removeItem("resetToken");

        setTimeout(() => {
            window.location.href =
                "/login/login.html";
        }, 1500);

    } catch (erro) {
        console.error(
            "Erro ao redefinir senha:",
            erro
        );

        mostrarMensagem(
            "Erro ao conectar com o servidor.",
            "erro"
        );

    } finally {
        btnRedefinirSenha.disabled = false;
        btnRedefinirSenha.textContent =
            "Redefinir sua senha";
    }
});


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;

    if (tipo === "erro") {
        mensagem.style.color = "#e63946";
        return;
    }

    if (tipo === "sucesso") {
        mensagem.style.color = "#159447";
        return;
    }

    mensagem.style.color = "#555555";
}


// =====================================================
// MOSTRAR / ESCONDER SENHAS
// =====================================================

function alternarVisibilidadeSenha(input) {
    input.type =
        input.type === "password"
            ? "text"
            : "password";
}

olhoNovaSenha.addEventListener("click", () => {
    alternarVisibilidadeSenha(novaSenhaInput);
});

olhoConfirmarSenha.addEventListener("click", () => {
    alternarVisibilidadeSenha(confirmarSenhaInput);
});
