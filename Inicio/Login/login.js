const campoSenha = document.querySelector("#senha");
const botaoOlho = document.querySelector("#toggleSenha");
const formulario = document.querySelector("#formLogin");

formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.querySelector("#email").value;
    const senha = document.querySelector("#senha").value;

    try {

        const resposta = await fetch("/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })

        });


        const resultado = await resposta.json();


        console.log("Status:", resposta.status);
        console.log("Resposta do servidor:", resultado);


        if (resposta.ok) {

            console.log(
                "LOGIN CORRETO - REDIRECIONANDO"
            );


            // =========================
            // SALVA O USUÁRIO LOGADO
            // =========================

            localStorage.setItem(
                "usuarioId",
                resultado.usuario.id
            );


            localStorage.setItem(
                "usuarioNome",
                resultado.usuario.nome
            );


            localStorage.setItem(
                "usuarioEmail",
                resultado.usuario.email
            );


            // =========================
            // REDIRECIONA
            // =========================

            window.location.href =
                "/Principal/principal.html";


        } else {

            console.log("LOGIN INCORRETO");

            document.querySelector(
                "#mensagem"
            ).textContent =
                resultado.erro;

        }


    } catch (error) {

        console.error(error);

        document.querySelector(
            "#mensagem"
        ).textContent =
            "Erro ao conectar com o servidor.";

    }

});


// =========================
// MOSTRAR / ESCONDER SENHA
// =========================

botaoOlho.addEventListener("click", () => {

    if (campoSenha.type === "password") {

        campoSenha.type = "text";

    } else {

        campoSenha.type = "password";

    }

});