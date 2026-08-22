async function buscarTransacoes() {
    try {
        const resposta = await fetch("/transactions");

        const transacoes = await resposta.json();

        console.log(transacoes);

    } catch (erro) {
        console.error("Erro ao buscar transações:", erro);
    }
}

buscarTransacoes();