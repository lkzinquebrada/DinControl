const formulario = document.querySelector("#formCadastro");

const campoSenha = document.querySelector("#senha");
const botaoOlho = document.querySelector("#toggleSenha");


// MOSTRAR / ESCONDER SENHA
botaoOlho.addEventListener("click", () => {

    if (campoSenha.type === "password") {
        campoSenha.type = "text";
    } else {
        campoSenha.type = "password";
    }

});


// CADASTRAR USUÁRIO
formulario.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nome = document.querySelector("#nome").value;
    const email = document.querySelector("#email").value;
    const senha = document.querySelector("#senha").value;

    try {

        const resposta = await fetch("/users", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });


        const resultado = await resposta.json();


        if (resposta.ok) {

            document.querySelector("#mensagem").textContent =
                "Conta criada com sucesso!";

            console.log(resultado);

        } else {

            document.querySelector("#mensagem").textContent =
                resultado.erro;
        }

    } catch (erro) {

        console.error(erro);

        document.querySelector("#mensagem").textContent =
            "Erro ao conectar com o servidor.";
    }

});