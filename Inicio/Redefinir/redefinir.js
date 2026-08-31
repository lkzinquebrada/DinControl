const emailInput = document.getElementById("email");
const codigoInput = document.getElementById("codigo");

const btnEnviarCodigo = document.getElementById("btnEnviarCodigo");
const btnVerificarCodigo = document.getElementById("btnVerificarCodigo");

const mensagem = document.getElementById("mensagem");


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexCodigo = /^\d{6}$/;


// =====================================================
// DEIXA O CAMPO CÓDIGO SOMENTE COM NÚMEROS
// =====================================================

codigoInput.addEventListener("input", () => {
    codigoInput.value = codigoInput.value
        .replace(/\D/g, "")
        .slice(0, 6);
});


// =====================================================
// ENVIAR CÓDIGO
// =====================================================

btnEnviarCodigo.addEventListener("click", async () => {
    const email = emailInput.value
        .trim()
        .toLowerCase();

    if (!email) {
        mostrarMensagem(
            "Digite seu e-mail.",
            "erro"
        );

        emailInput.focus();
        return;
    }

    if (!regexEmail.test(email)) {
        mostrarMensagem(
            "Digite um e-mail válido.",
            "erro"
        );

        emailInput.focus();
        return;
    }

    try {
        btnEnviarCodigo.disabled = true;
        btnEnviarCodigo.textContent = "Enviando...";

        mostrarMensagem(
            "Enviando código...",
            "normal"
        );

        const resposta = await fetch(
            "/forgot-password/send-code",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem(
                resultado.erro ||
                "Erro ao enviar código.",
                "erro"
            );

            return;
        }

        mostrarMensagem(
            resultado.mensagem ||
            "Código enviado para o seu e-mail.",
            "sucesso"
        );

        emailInput.readOnly = true;

        codigoInput.value = "";
        codigoInput.focus();

    } catch (erro) {
        console.error(
            "Erro ao enviar código:",
            erro
        );

        mostrarMensagem(
            "Erro ao conectar com o servidor.",
            "erro"
        );

    } finally {
        btnEnviarCodigo.disabled = false;
        btnEnviarCodigo.textContent = "Enviar Código";
    }
});


// =====================================================
// VERIFICAR CÓDIGO
// =====================================================

btnVerificarCodigo.addEventListener("click", async () => {
    const email = emailInput.value
        .trim()
        .toLowerCase();

    const codigo = codigoInput.value.trim();

    if (!email) {
        mostrarMensagem(
            "Digite seu e-mail.",
            "erro"
        );

        emailInput.focus();
        return;
    }

    if (!codigo) {
        mostrarMensagem(
            "Digite o código recebido no e-mail.",
            "erro"
        );

        codigoInput.focus();
        return;
    }

    if (!regexCodigo.test(codigo)) {
        mostrarMensagem(
            "O código deve possuir 6 números.",
            "erro"
        );

        codigoInput.focus();
        return;
    }

    try {
        btnVerificarCodigo.disabled = true;
        btnVerificarCodigo.textContent = "Verificando...";

        mostrarMensagem(
            "Verificando código...",
            "normal"
        );

        const resposta = await fetch(
            "/forgot-password/verify-code",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    codigo
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem(
                resultado.erro ||
                "Código inválido.",
                "erro"
            );

            codigoInput.focus();
            return;
        }

        console.log("CÓDIGO FOI VALIDADO!");

        mostrarMensagem(
            "Código verificado com sucesso!",
            "sucesso"
        );

        sessionStorage.setItem(
            "emailRecuperacao",
            email
        );

        sessionStorage.setItem(
            "resetToken",
            resultado.resetToken
        );

        window.location.href =
            "/RedefinirSenha/redefinirsenha.html";

    } catch (erro) {
        console.error(
            "Erro ao verificar código:",
            erro
        );

        mostrarMensagem(
            "Erro ao conectar com o servidor.",
            "erro"
        );

    } finally {
        btnVerificarCodigo.disabled = false;
        btnVerificarCodigo.textContent = "Verificar código";
    }
});


// =====================================================
// MOSTRAR MENSAGENS
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
