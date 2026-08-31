// =====================================================
// ELEMENTOS
// =====================================================

const formulario =
    document.querySelector("#formCadastro");

const campoNome =
    document.querySelector("#nome");

const campoEmail =
    document.querySelector("#email");

const campoSenha =
    document.querySelector("#senha");

const botaoOlho =
    document.querySelector("#toggleSenha");

const mensagem =
    document.querySelector("#mensagem");


// =====================================================
// PERMITE APENAS NÚMEROS NA SENHA
// =====================================================

campoSenha.addEventListener("input", () => {

    campoSenha.value =
        campoSenha.value.replace(/\D/g, "");

});


// =====================================================
// MOSTRAR / ESCONDER SENHA
// =====================================================

botaoOlho.addEventListener("click", () => {

    campoSenha.type =
        campoSenha.type === "password"
            ? "text"
            : "password";

});


// =====================================================
// MOSTRAR MENSAGEM
// =====================================================

function mostrarMensagem(texto, sucesso = false) {

    mensagem.textContent = texto;

    mensagem.style.color =
        sucesso
            ? "#159447"
            : "#e63946";

}


// =====================================================
// VALIDAR SENHA
// =====================================================

function validarSenha(senha) {

    // Apenas números
    if (!/^\d+$/.test(senha)) {

        mostrarMensagem(
            "A senha deve conter somente números."
        );

        return false;

    }


    // Mínimo de 5 números
    if (senha.length < 5) {

        mostrarMensagem(
            "A senha deve conter no mínimo 5 números."
        );

        return false;

    }


    // Não permite números repetidos
    const numeros =
        senha.split("");

    const numerosUnicos =
        new Set(numeros);


    if (
        numerosUnicos.size !==
        numeros.length
    ) {

        mostrarMensagem(
            "A senha não pode conter números repetidos."
        );

        return false;

    }


    return true;

}


// =====================================================
// CADASTRAR USUÁRIO
// =====================================================

formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const nome =
            campoNome.value.trim();

        const email =
            campoEmail.value.trim();

        const senha =
            campoSenha.value.trim();


        // =============================================
        // CAMPOS OBRIGATÓRIOS
        // =============================================

        if (
            !nome ||
            !email ||
            !senha
        ) {

            mostrarMensagem(
                "Preencha todos os campos."
            );

            return;

        }


        // =============================================
        // VALIDAR SENHA
        // =============================================

        if (!validarSenha(senha)) {

            return;

        }


        try {

            const resposta =
                await fetch(
                    "/users",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                nome,
                                email,
                                senha
                            })
                    }
                );


            const resultado =
                await resposta.json();


            // =========================================
            // SUCESSO
            // =========================================

            if (resposta.ok) {

                mostrarMensagem(
                    "Conta criada com sucesso!",
                    true
                );


                console.log(resultado);


                // Limpa formulário
                formulario.reset();


                return;

            }


            // =========================================
            // ERRO DO SERVIDOR
            // =========================================

            mostrarMensagem(
                resultado.erro ||
                "Erro ao criar conta."
            );


        } catch (erro) {

            console.error(
                "Erro ao cadastrar usuário:",
                erro
            );


            mostrarMensagem(
                "Erro ao conectar com o servidor."
            );

        }

    }
);