const formulario = document.querySelector("#formLogin");

const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");

const botaoOlho = document.querySelector(".botao-olho");
const mensagem = document.querySelector("#mensagem");


// =====================================================
// LOGIN
// =====================================================

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim();

    try {
        const resposta = await fetch("/login", {
            method: "POST",
            credentials: "same-origin",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            // Remove dados antigos que eram usados
            // como autenticação no localStorage.
            localStorage.removeItem("usuarioId");
            localStorage.removeItem("usuarioNome");
            localStorage.removeItem("usuarioEmail");

            window.location.href =
                "/Principal/principal.html";

            return;
        }

        mensagem.textContent =
            resultado.erro ||
            "E-mail ou senha incorretos.";

    } catch (error) {
        console.error(error);

        mensagem.textContent =
            "Erro ao conectar com o servidor.";
    }
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
