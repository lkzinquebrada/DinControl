let graficoMensal = null;
let graficoSaida = null;
let graficoInvestimento = null;

Chart.register(ChartDataLabels);


// =========================
// USUÁRIO LOGADO
// =========================

const usuarioId =
    localStorage.getItem("usuarioId");

if (!usuarioId) {

    window.location.href =
        "/login/login.html";

}


document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // ELEMENTOS DO HTML
    // =========================

    const botaoAdicionar =
        document.querySelector("#abrirTransacao");

    const painelTransacao =
        document.querySelector("#painelTransacao");

    const valorEntrada =
        document.querySelector("#valorEntrada");

    const valorSaida =
        document.querySelector("#valorSaida");

    const categoriaEntrada =
        document.querySelector("#categoriaEntrada");

    const categoriaSaida =
        document.querySelector("#categoriaSaida");

    const confirmarTransacao =
        document.querySelector("#confirmarTransacao");

    const mensagemTransacao =
        document.querySelector("#mensagemTransacao");

    const valorSaldo =
        document.querySelector("#valorSaldo");


    // =========================
    // ABRIR / FECHAR PAINEL
    // =========================

    botaoAdicionar.addEventListener("click", () => {

        painelTransacao.classList.toggle("ativo");

    });


    // =========================
    // CADASTRAR TRANSAÇÃO
    // =========================

    async function cadastrarTransacao(
        tipo,
        valor,
        categoria
    ) {

        const resposta =
            await fetch("/transactions", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    tipo: tipo,

                    valor: Number(valor),

                    categoria: categoria,

                    // IMPORTANTE:
                    // salva qual usuário é dono
                    user_id: Number(usuarioId)

                })

            });


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                "Erro ao cadastrar transação"
            );

        }


        return resultado;

    }


    // =========================
    // BOTÃO CONFIRMAR
    // =========================

    confirmarTransacao.addEventListener(
        "click",
        async () => {

            const entrada =
                valorEntrada.value;

            const saida =
                valorSaida.value;

            const catEntrada =
                categoriaEntrada.value;

            const catSaida =
                categoriaSaida.value;


            mensagemTransacao.textContent = "";


            // Nenhum valor
            if (!entrada && !saida) {

                mensagemTransacao.textContent =
                    "Digite um valor de entrada ou saída.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

                return;
            }


            // Entrada e saída juntas
            if (entrada && saida) {

                mensagemTransacao.textContent =
                    "Preencha apenas entrada ou saída.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

                return;
            }


            // Entrada inválida
            if (
                entrada &&
                Number(entrada) <= 0
            ) {

                mensagemTransacao.textContent =
                    "Digite um valor de entrada válido.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

                return;
            }


            // Saída inválida
            if (
                saida &&
                Number(saida) <= 0
            ) {

                mensagemTransacao.textContent =
                    "Digite um valor de saída válido.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

                return;
            }


            // Entrada sem categoria
            if (
                entrada &&
                !catEntrada
            ) {

                mensagemTransacao.textContent =
                    "Selecione uma categoria para a entrada.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

                return;
            }


            // Saída sem categoria
            if (
                saida &&
                !catSaida
            ) {

                mensagemTransacao.textContent =
                    "Selecione uma categoria para a saída.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

                return;
            }


            try {

                // ENTRADA
                if (entrada) {

                    await cadastrarTransacao(
                        "ENTRADA",
                        entrada,
                        catEntrada
                    );

                }


                // SAÍDA
                if (saida) {

                    await cadastrarTransacao(
                        "SAIDA",
                        saida,
                        catSaida
                    );

                }


                mensagemTransacao.textContent =
                    "Transação cadastrada com sucesso!";

                mensagemTransacao.classList.remove(
                    "mensagem-erro"
                );

                mensagemTransacao.classList.add(
                    "mensagem-sucesso"
                );


                // Limpar campos
                valorEntrada.value = "";
                valorSaida.value = "";

                categoriaEntrada.value = "";
                categoriaSaida.value = "";


                // Atualizar dashboard
                await carregarSaldo();

                await carregarResumoEntradaSaida();

                await carregarGraficoMensal();

                await carregarGraficoSaida();

                await carregarGraficoInvestimento();


            } catch (erro) {

                console.error(
                    "Erro ao cadastrar:",
                    erro
                );


                mensagemTransacao.textContent =
                    "Erro ao cadastrar transação.";

                mensagemTransacao.classList.remove(
                    "mensagem-sucesso"
                );

                mensagemTransacao.classList.add(
                    "mensagem-erro"
                );

            }

        }
    );


    // =========================
    // CARREGAR SALDO
    // =========================

    async function carregarSaldo() {

        try {

            const resposta =
                await fetch(
                    `/transactions/${usuarioId}`
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao buscar transações"
                );

            }


            const transacoes =
                await resposta.json();


            let entradas = 0;
            let saidas = 0;


            transacoes.forEach(
                (transacao) => {

                    const valor =
                        Number(
                            transacao.valor
                        );


                    if (
                        transacao.tipo ===
                        "ENTRADA"
                    ) {

                        entradas += valor;

                    }


                    if (
                        transacao.tipo ===
                        "SAIDA"
                    ) {

                        saidas += valor;

                    }

                }
            );


            const saldo =
                entradas - saidas;


            valorSaldo.textContent =
                saldo.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );


        } catch (erro) {

            console.error(
                "Erro ao carregar saldo:",
                erro
            );

        }

    }


    // =========================
    // RESUMO ENTRADA / SAÍDA
    // =========================

    async function carregarResumoEntradaSaida() {

        try {

            const totalEntrada =
                document.querySelector(
                    "#totalEntrada"
                );

            const totalSaida =
                document.querySelector(
                    "#totalSaida"
                );

            const totalInvestimento =
                document.querySelector(
                    "#totalInvestimento"
                );

            const indicadorSaldo =
                document.querySelector(
                    "#indicadorSaldo"
                );


            const resposta =
                await fetch(
                    `/transactions/${usuarioId}`
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao buscar transações"
                );

            }


            const transacoes =
                await resposta.json();


            let entradas = 0;
            let saidas = 0;
            let investimentos = 0;


            transacoes.forEach(
                (transacao) => {

                    const valor =
                        Number(
                            transacao.valor
                        );


                    if (
                        transacao.tipo ===
                        "ENTRADA"
                    ) {

                        entradas += valor;

                    }


                    if (
                        transacao.tipo ===
                        "SAIDA"
                    ) {

                        saidas += valor;

                    }


                    if (
                        transacao.categoria &&
                        transacao.categoria
                            .toLowerCase() ===
                        "investimento"
                    ) {

                        investimentos += valor;

                    }

                }
            );


            // Bolinha vermelha se saída
            // for maior que entrada

            if (indicadorSaldo) {

                if (saidas > entradas) {

                    indicadorSaldo
                        .classList
                        .add(
                            "indicador-vermelho"
                        );

                } else {

                    indicadorSaldo
                        .classList
                        .remove(
                            "indicador-vermelho"
                        );

                }

            }


            if (totalEntrada) {

                totalEntrada.textContent =
                    entradas.toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL"
                        }
                    );

            }


            if (totalSaida) {

                totalSaida.textContent =
                    saidas.toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL"
                        }
                    );

            }


            if (totalInvestimento) {

                totalInvestimento.textContent =
                    investimentos.toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL"
                        }
                    );

            }


        } catch (erro) {

            console.error(
                "Erro ao carregar resumo:",
                erro
            );

        }

    }


    // =========================
    // CARREGAR DASHBOARD
    // =========================

    carregarSaldo();

    carregarResumoEntradaSaida();

    carregarGraficoMensal();

    carregarGraficoSaida();

    carregarGraficoInvestimento();

});

// ========================================
// GRÁFICO MENSAL
// ========================================

async function carregarGraficoMensal() {

    try {

        const resposta =
            await fetch(
                `/transactions/${usuarioId}`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar transações"
            );

        }


        const transacoes =
            await resposta.json();


        const entradas = [
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0
        ];


        const saidas = [
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0
        ];


        transacoes.forEach(
            (transacao) => {

                if (!transacao.data) {
                    return;
                }


                const data =
                    new Date(
                        transacao.data
                    );


                if (
                    isNaN(
                        data.getTime()
                    )
                ) {
                    return;
                }


                const mes =
                    data.getMonth();


                const valor =
                    Number(
                        transacao.valor
                    );


                if (
                    transacao.tipo ===
                    "ENTRADA"
                ) {

                    entradas[mes] += valor;

                }


                if (
                    transacao.tipo ===
                    "SAIDA"
                ) {

                    saidas[mes] += valor;

                }

            }
        );


        criarGraficoMensal(
            entradas,
            saidas
        );


    } catch (erro) {

        console.error(
            "Erro no gráfico mensal:",
            erro
        );

    }

}


function criarGraficoMensal(
    entradas,
    saidas
) {

    const canvas =
        document.querySelector(
            "#graficoMensal"
        );


    if (!canvas) {
        return;
    }


    if (graficoMensal) {

        graficoMensal.destroy();

    }


    const maiorValor =
        Math.max(
            ...entradas,
            ...saidas
        );


    let limiteMaximo;


    if (maiorValor === 0) {

        limiteMaximo = 5000;

    } else {

        limiteMaximo =
            Math.ceil(
                maiorValor / 1000
            ) * 1000;

    }


    if (limiteMaximo < 1000) {

        limiteMaximo = 1000;

    }


    graficoMensal =
        new Chart(
            canvas,
            {

                type: "bar",


                data: {

                    labels: [
                        "Jan",
                        "Fev",
                        "Mar",
                        "Abr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Ago",
                        "Set",
                        "Out",
                        "Nov",
                        "Dez"
                    ],


                    datasets: [

                        {
                            label: "Saída",

                            data: saidas,

                            backgroundColor:
                                "#ff4b45",

                            borderRadius: 2
                        },


                        {
                            label: "Entrada",

                            data: entradas,

                            backgroundColor:
                                "#9abd43",

                            borderRadius: 2
                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,


                    animation: {

                        duration: 500

                    },


                    plugins: {

                        // Não mostrar valores
                        // nas barras

                        datalabels: {

                            display: false

                        },


                        legend: {

                            position: "top",

                            align: "end",

                            labels: {

                                color:
                                    "#ffffff",

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                boxWidth: 6,

                                boxHeight: 6,

                                padding: 8,

                                font: {

                                    size: 15

                                }

                            }

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const valor =
                                            Number(
                                                context.raw
                                            );


                                        return (
                                            context
                                                .dataset
                                                .label +
                                            ": " +
                                            valor
                                                .toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style:
                                                            "currency",

                                                        currency:
                                                            "BRL"
                                                    }
                                                )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false

                            },


                            ticks: {

                                color:
                                    "#ffffff",

                                font: {

                                    size: 10

                                }

                            }

                        },


                        y: {

                            beginAtZero:
                                true,

                            max:
                                limiteMaximo,


                            grid: {

                                color:
                                    "rgba(255,255,255,0.08)"

                            },


                            ticks: {

                                color:
                                    "#ffffff",

                                stepSize:
                                    limiteMaximo /
                                    5,

                                font: {

                                    size: 9

                                },


                                callback:
                                    function (
                                        valor
                                    ) {

                                        return valor
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    style:
                                                        "currency",

                                                    currency:
                                                        "BRL",

                                                    maximumFractionDigits:
                                                        0
                                                }
                                            );

                                    }

                            }

                        }

                    }

                }

            }
        );

}

// ========================================
// GRÁFICO DE SAÍDA
// ========================================

async function carregarGraficoSaida() {

    try {

        const resposta =
            await fetch(
                `/transactions/${usuarioId}`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar transações"
            );

        }


        const transacoes =
            await resposta.json();


        const categorias = {

            Alimentacao: 0,

            Locomocao: 0,

            Investimento: 0,

            Lazer: 0,

            Educacao: 0,

            Outros: 0

        };


        transacoes.forEach(
            (transacao) => {

                // Somente SAÍDA
                if (
                    transacao.tipo !==
                    "SAIDA"
                ) {

                    return;

                }


                const valor =
                    Number(
                        transacao.valor
                    );


                const categoria =
                    (
                        transacao.categoria ||
                        "Outros"
                    )
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        )
                        .toLowerCase();


                if (
                    categoria ===
                    "alimentacao"
                ) {

                    categorias
                        .Alimentacao +=
                        valor;

                }

                else if (
                    categoria ===
                    "locomocao"
                ) {

                    categorias
                        .Locomocao +=
                        valor;

                }

                else if (
                    categoria ===
                    "investimento"
                ) {

                    categorias
                        .Investimento +=
                        valor;

                }

                else if (
                    categoria ===
                    "lazer"
                ) {

                    categorias
                        .Lazer += valor;

                }

                else if (
                    categoria ===
                    "educacao"
                ) {

                    categorias
                        .Educacao +=
                        valor;

                }

                else {

                    categorias
                        .Outros += valor;

                }

            }
        );


        criarGraficoSaida(
            categorias
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar gráfico de saída:",
            erro
        );

    }

}


function criarGraficoSaida(
    categorias
) {

    const canvas =
        document.querySelector(
            "#graficoSaida"
        );


    if (!canvas) {
        return;
    }


    if (graficoSaida) {

        graficoSaida.destroy();

    }


    const valores = [

        categorias.Alimentacao,

        categorias.Locomocao,

        categorias.Investimento,

        categorias.Lazer,

        categorias.Educacao,

        categorias.Outros

    ];


    graficoSaida =
        new Chart(
            canvas,
            {

                type: "pie",


                data: {

                    labels: [

                        "Alimentação",

                        "Locomoção",

                        "Investimento",

                        "Lazer",

                        "Educação",

                        "Outros"

                    ],


                    datasets: [

                        {

                            data:
                                valores,


                            backgroundColor: [

                                "#e51b17",

                                "#e7b700",

                                "#ef7d00",

                                "#65b900",

                                "#fd00a9",

                                "#633cff"

                            ],


                            borderWidth:
                                0

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        // PORCENTAGEM
                        datalabels: {

                            color:
                                "#ffffff",

                            font: {

                                size: 10,

                                weight:
                                    "bold"

                            },


                            formatter:
                                function (
                                    valor,
                                    context
                                ) {

                                    const dados =
                                        context
                                            .chart
                                            .data
                                            .datasets[0]
                                            .data;


                                    const total =
                                        dados.reduce(
                                            function (
                                                soma,
                                                numero
                                            ) {

                                                return (
                                                    soma +
                                                    Number(
                                                        numero
                                                    )
                                                );

                                            },
                                            0
                                        );


                                    if (
                                        valor === 0 ||
                                        total === 0
                                    ) {

                                        return "";

                                    }


                                    const porcentagem =
                                        (
                                            Number(
                                                valor
                                            ) /
                                            total
                                        ) * 100;


                                    return (
                                        porcentagem
                                            .toFixed(
                                                0
                                            ) +
                                        "%"
                                    );

                                }

                        },


                        legend: {

                            position:
                                "right",

                            labels: {

                                color:
                                    "#ffffff",

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                boxWidth:
                                    7,

                                boxHeight:
                                    7,

                                padding:
                                    11,

                                font: {

                                    size: 16

                                }

                            }

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const valor =
                                            Number(
                                                context.raw
                                            );


                                        const dados =
                                            context
                                                .dataset
                                                .data;


                                        const total =
                                            dados.reduce(
                                                (
                                                    soma,
                                                    numero
                                                ) =>
                                                    soma +
                                                    Number(
                                                        numero
                                                    ),
                                                0
                                            );


                                        const porcentagem =
                                            total > 0

                                                ? (
                                                    (
                                                        valor /
                                                        total
                                                    ) *
                                                    100
                                                ).toFixed(
                                                    1
                                                )

                                                : 0;


                                        return (
                                            context.label +
                                            ": " +
                                            valor
                                                .toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style:
                                                            "currency",

                                                        currency:
                                                            "BRL"
                                                    }
                                                ) +
                                            " (" +
                                            porcentagem +
                                            "%)"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}

// ========================================
// GRÁFICO DE INVESTIMENTO
// ========================================

async function carregarGraficoInvestimento() {

    try {

        const resposta =
            await fetch(
                `/transactions/${usuarioId}`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar transações"
            );

        }


        const transacoes =
            await resposta.json();


        const investimentos = [
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0
        ];


        transacoes.forEach(
            (transacao) => {

                if (!transacao.data) {
                    return;
                }


                if (!transacao.categoria) {
                    return;
                }


                const categoria =
                    transacao.categoria
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        )
                        .toLowerCase();


                if (
                    categoria !==
                    "investimento"
                ) {

                    return;

                }


                const data =
                    new Date(
                        transacao.data
                    );


                if (
                    isNaN(
                        data.getTime()
                    )
                ) {

                    return;

                }


                const mes =
                    data.getMonth();


                const valor =
                    Number(
                        transacao.valor
                    );


                if (isNaN(valor)) {
                    return;
                }


                investimentos[mes] +=
                    valor;

            }
        );


        criarGraficoInvestimento(
            investimentos
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar gráfico de investimento:",
            erro
        );

    }

}


function criarGraficoInvestimento(
    investimentos
) {

    const canvas =
        document.querySelector(
            "#graficoInvestimento"
        );


    if (!canvas) {
        return;
    }


    if (graficoInvestimento) {

        graficoInvestimento
            .destroy();

    }


    const maiorValor =
        Math.max(
            ...investimentos
        );


    let limiteMaximo;


    if (maiorValor === 0) {

        limiteMaximo = 5000;

    } else {

        limiteMaximo =
            Math.ceil(
                maiorValor /
                1000
            ) * 1000;

    }


    if (
        limiteMaximo <
        1000
    ) {

        limiteMaximo =
            1000;

    }


    graficoInvestimento =
        new Chart(
            canvas,
            {

                type: "bar",


                data: {

                    labels: [

                        "Jan",

                        "Fev",

                        "Mar",

                        "Abr",

                        "Mai",

                        "Jun",

                        "Jul",

                        "Ago",

                        "Set",

                        "Out",

                        "Nov",

                        "Dez"

                    ],


                    datasets: [

                        {

                            label:
                                "Investimento",

                            data:
                                investimentos,

                            backgroundColor:
                                "#020074",

                            borderRadius:
                                2

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            500

                    },


                    plugins: {

                        datalabels: {

                            display:
                                false

                        },


                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const valor =
                                            Number(
                                                context.raw
                                            );


                                        return (
                                            "Investimento: " +
                                            valor
                                                .toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style:
                                                            "currency",

                                                        currency:
                                                            "BRL"
                                                    }
                                                )
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false

                            },


                            ticks: {

                                color:
                                    "#ffffff",

                                font: {

                                    size:
                                        10

                                }

                            }

                        },


                        y: {

                            beginAtZero:
                                true,

                            max:
                                limiteMaximo,


                            grid: {

                                color:
                                    "rgba(255,255,255,0.08)"

                            },


                            ticks: {

                                color:
                                    "#ffffff",

                                stepSize:
                                    limiteMaximo /
                                    5,

                                font: {

                                    size:
                                        9

                                },


                                callback:
                                    function (
                                        valor
                                    ) {

                                        return valor
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    style:
                                                        "currency",

                                                    currency:
                                                        "BRL",

                                                    maximumFractionDigits:
                                                        0
                                                }
                                            );

                                    }

                            }

                        }

                    }

                }

            }
        );

}