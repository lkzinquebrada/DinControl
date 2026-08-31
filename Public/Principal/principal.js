let graficoMensal = null;
let graficoSaida = null;
let graficoInvestimento = null;
let timerResize = null;

let transacoesCache = [];
let transacoesCarregadas = false;

const MESES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

let usuarioAtual = null;
let usuarioId = null;

Chart.register(ChartDataLabels);


// =====================================================
// UTILITÁRIOS
// =====================================================

function tela1024() {
    return window.innerWidth >= 901 && window.innerWidth <= 1149;
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function calcularLimiteMaximo(valores) {
    const maiorValor = Math.max(...valores);

    if (maiorValor === 0) {
        return 5000;
    }

    const limite = Math.ceil(maiorValor / 1000) * 1000;

    return Math.max(limite, 1000);
}

function formatarEixoMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
    });
}


// =====================================================
// API
// =====================================================

async function buscarTransacoes() {
    const resposta = await fetch("/transactions", {
        credentials: "same-origin"
    });

    if (resposta.status === 401) {
        window.location.href = "/login/login.html";
        throw new Error("Sessão expirada");
    }

    if (!resposta.ok) {
        throw new Error("Erro ao buscar transações");
    }

    return resposta.json();
}

async function cadastrarTransacao(tipo, valor, categoria) {
    const resposta = await fetch("/transactions", {
        method: "POST",
        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            tipo,
            valor: Number(valor),
            categoria
        })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.erro || "Erro ao cadastrar transação"
        );
    }

    return resultado;
}


// =====================================================
// DOM
// =====================================================

const elementos = {
    nomeUsuario: null,
    fotoPerfilDashboard: null,
    botaoPerfil: null,

    botaoAdicionar: null,
    painelTransacao: null,
    valorEntrada: null,
    valorSaida: null,
    categoriaEntrada: null,
    categoriaSaida: null,
    confirmarTransacao: null,
    mensagemTransacao: null,

    valorSaldo: null,
    totalEntrada: null,
    totalSaida: null,
    totalInvestimento: null,
    indicadorSaldo: null,

    botaoMenu: null,
    menuPaginas: null
};

function mapearElementos() {
    elementos.nomeUsuario = document.querySelector("#nomeUsuario");
    elementos.fotoPerfilDashboard = document.querySelector("#fotoPerfilDashboard");
    elementos.botaoPerfil = document.querySelector(".botao-perfil");

    elementos.botaoAdicionar = document.querySelector("#abrirTransacao");
    elementos.painelTransacao = document.querySelector("#painelTransacao");
    elementos.valorEntrada = document.querySelector("#valorEntrada");
    elementos.valorSaida = document.querySelector("#valorSaida");
    elementos.categoriaEntrada = document.querySelector("#categoriaEntrada");
    elementos.categoriaSaida = document.querySelector("#categoriaSaida");
    elementos.confirmarTransacao = document.querySelector("#confirmarTransacao");
    elementos.mensagemTransacao = document.querySelector("#mensagemTransacao");

    elementos.valorSaldo = document.querySelector("#valorSaldo");
    elementos.totalEntrada = document.querySelector("#totalEntrada");
    elementos.totalSaida = document.querySelector("#totalSaida");
    elementos.totalInvestimento = document.querySelector("#totalInvestimento");
    elementos.indicadorSaldo = document.querySelector("#indicadorSaldo");

    elementos.botaoMenu = document.querySelector("#botaoMenu");
    elementos.menuPaginas = document.querySelector("#menuPaginas");
}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

window.addEventListener("load", () => {
    const loadingScreen = document.querySelector("#loading-screen");

    setTimeout(() => {
        loadingScreen?.classList.add("esconder");
    }, 1500);
});

document.addEventListener("DOMContentLoaded", async () => {
    mapearElementos();

    const autenticado =
        await carregarUsuario();

    if (!autenticado) {
        return;
    }

    configurarEventos();
    carregarDashboard();
});

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

        if (elementos.nomeUsuario) {
            elementos.nomeUsuario.textContent =
                usuarioAtual.nome;
        }

        const fotoSalva =
            localStorage.getItem(
                `fotoPerfil_${usuarioId}`
            );

        if (
            elementos.fotoPerfilDashboard &&
            fotoSalva
        ) {
            elementos.fotoPerfilDashboard.src =
                fotoSalva;
        }

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

function configurarEventos() {
    elementos.botaoPerfil?.addEventListener("click", () => {
        window.location.href = "/Perfil/perfil.html";
    });

    elementos.botaoAdicionar?.addEventListener("click", () => {
        elementos.painelTransacao?.classList.toggle("ativo");
    });

    elementos.confirmarTransacao?.addEventListener(
        "click",
        confirmarCadastroTransacao
    );

    configurarMenu();
}


// =====================================================
// TRANSAÇÕES
// =====================================================

function obterDadosFormularioTransacao() {
    return {
        entrada: elementos.valorEntrada?.value.trim() || "",
        saida: elementos.valorSaida?.value.trim() || "",
        categoriaEntrada: elementos.categoriaEntrada?.value || "",
        categoriaSaida: elementos.categoriaSaida?.value || ""
    };
}

function validarTransacao(dados) {
    const {
        entrada,
        saida,
        categoriaEntrada,
        categoriaSaida
    } = dados;

    if (!entrada && !saida) {
        return "Digite um valor de entrada ou saída.";
    }

    if (entrada && saida) {
        return "Preencha apenas entrada ou saída.";
    }

    if (entrada && Number(entrada) <= 0) {
        return "Digite um valor de entrada válido.";
    }

    if (saida && Number(saida) <= 0) {
        return "Digite um valor de saída válido.";
    }

    if (entrada && !categoriaEntrada) {
        return "Selecione uma categoria para a entrada.";
    }

    if (saida && !categoriaSaida) {
        return "Selecione uma categoria para a saída.";
    }

    return null;
}

function limparMensagemTransacao() {
    if (!elementos.mensagemTransacao) {
        return;
    }

    elementos.mensagemTransacao.classList.remove(
        "mensagem-erro",
        "mensagem-sucesso"
    );

    elementos.mensagemTransacao.textContent = "";
}

function mostrarErro(mensagem) {
    if (!elementos.mensagemTransacao) {
        return;
    }

    elementos.mensagemTransacao.textContent = mensagem;
    elementos.mensagemTransacao.classList.remove("mensagem-sucesso");
    elementos.mensagemTransacao.classList.add("mensagem-erro");
}

function mostrarSucesso(mensagem) {
    if (!elementos.mensagemTransacao) {
        return;
    }

    elementos.mensagemTransacao.textContent = mensagem;
    elementos.mensagemTransacao.classList.remove("mensagem-erro");
    elementos.mensagemTransacao.classList.add("mensagem-sucesso");
}

function limparFormularioTransacao() {
    elementos.valorEntrada.value = "";
    elementos.valorSaida.value = "";
    elementos.categoriaEntrada.value = "";
    elementos.categoriaSaida.value = "";
}

async function confirmarCadastroTransacao() {
    limparMensagemTransacao();

    const dados = obterDadosFormularioTransacao();
    const erroValidacao = validarTransacao(dados);

    if (erroValidacao) {
        mostrarErro(erroValidacao);
        return;
    }

    try {
        if (dados.entrada) {
            await cadastrarTransacao(
                "ENTRADA",
                dados.entrada,
                dados.categoriaEntrada
            );
        }

        if (dados.saida) {
            await cadastrarTransacao(
                "SAIDA",
                dados.saida,
                dados.categoriaSaida
            );
        }

        mostrarSucesso("Transação cadastrada com sucesso!");
        limparFormularioTransacao();

        await carregarDashboard();

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        mostrarErro("Erro ao cadastrar transação.");
    }
}


// =====================================================
// DASHBOARD
// =====================================================

async function carregarDashboard() {
    try {
        const transacoes = await buscarTransacoes();

        transacoesCache = transacoes;
        transacoesCarregadas = true;

        atualizarSaldo(transacoes);
        atualizarResumoEntradaSaida(transacoes);
        carregarGraficoMensal(transacoes);
        carregarGraficoSaida(transacoes);
        carregarGraficoInvestimento(transacoes);

    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
    }
}

function calcularTotais(transacoes) {
    let entradas = 0;
    let saidas = 0;
    let investimentos = 0;

    transacoes.forEach((transacao) => {
        const valor = Number(transacao.valor) || 0;

        if (transacao.tipo === "ENTRADA") {
            entradas += valor;
        }

        if (transacao.tipo === "SAIDA") {
            saidas += valor;
        }

        if (normalizarTexto(transacao.categoria) === "investimento") {
            investimentos += valor;
        }
    });

    return {
        entradas,
        saidas,
        investimentos
    };
}

function atualizarSaldo(transacoes) {
    const { entradas, saidas } = calcularTotais(transacoes);
    const saldo = entradas - saidas;

    if (elementos.valorSaldo) {
        elementos.valorSaldo.textContent = formatarMoeda(saldo);
    }
}

function atualizarResumoEntradaSaida(transacoes) {
    const {
        entradas,
        saidas,
        investimentos
    } = calcularTotais(transacoes);

    elementos.indicadorSaldo?.classList.toggle(
        "indicador-vermelho",
        saidas > entradas
    );

    if (elementos.totalEntrada) {
        elementos.totalEntrada.textContent = formatarMoeda(entradas);
    }

    if (elementos.totalSaida) {
        elementos.totalSaida.textContent = formatarMoeda(saidas);
    }

    if (elementos.totalInvestimento) {
        elementos.totalInvestimento.textContent = formatarMoeda(investimentos);
    }
}


// =====================================================
// DADOS DOS GRÁFICOS
// =====================================================

function obterMovimentacaoMensal(transacoes) {
    const entradas = Array(12).fill(0);
    const saidas = Array(12).fill(0);

    transacoes.forEach((transacao) => {
        if (!transacao.data) {
            return;
        }

        const data = new Date(transacao.data);

        if (isNaN(data.getTime())) {
            return;
        }

        const mes = data.getMonth();
        const valor = Number(transacao.valor) || 0;

        if (transacao.tipo === "ENTRADA") {
            entradas[mes] += valor;
        }

        if (transacao.tipo === "SAIDA") {
            saidas[mes] += valor;
        }
    });

    return { entradas, saidas };
}

function obterSaidasPorCategoria(transacoes) {
    const categorias = {
        Alimentacao: 0,
        Locomocao: 0,
        Investimento: 0,
        Lazer: 0,
        Educacao: 0,
        Outros: 0
    };

    transacoes.forEach((transacao) => {
        if (transacao.tipo !== "SAIDA") {
            return;
        }

        const valor = Number(transacao.valor) || 0;
        const categoria = normalizarTexto(
            transacao.categoria || "Outros"
        );

        switch (categoria) {
            case "alimentacao":
                categorias.Alimentacao += valor;
                break;

            case "locomocao":
                categorias.Locomocao += valor;
                break;

            case "investimento":
                categorias.Investimento += valor;
                break;

            case "lazer":
                categorias.Lazer += valor;
                break;

            case "educacao":
                categorias.Educacao += valor;
                break;

            default:
                categorias.Outros += valor;
        }
    });

    return categorias;
}

function obterInvestimentosMensais(transacoes) {
    const investimentos = Array(12).fill(0);

    transacoes.forEach((transacao) => {
        if (!transacao.data || !transacao.categoria) {
            return;
        }

        if (normalizarTexto(transacao.categoria) !== "investimento") {
            return;
        }

        const data = new Date(transacao.data);

        if (isNaN(data.getTime())) {
            return;
        }

        const valor = Number(transacao.valor);

        if (isNaN(valor)) {
            return;
        }

        investimentos[data.getMonth()] += valor;
    });

    return investimentos;
}


// =====================================================
// CONFIGURAÇÕES COMPARTILHADAS DOS GRÁFICOS
// =====================================================

function obterPaddingGrafico(compacto) {
    return {
        left: compacto ? 2 : 5,
        right: compacto ? 2 : 5,
        top: compacto ? 0 : 3,
        bottom: compacto ? 0 : 3
    };
}

function obterEixosGrafico(limiteMaximo, compacto) {
    return {
        x: {
            grid: {
                display: false
            },

            ticks: {
                color: "#ffffff",
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
                padding: compacto ? 2 : 5,

                font: {
                    size: compacto ? 7 : 10
                }
            }
        },

        y: {
            beginAtZero: true,
            max: limiteMaximo,

            grid: {
                color: "rgba(255,255,255,0.08)"
            },

            ticks: {
                color: "#ffffff",
                stepSize: limiteMaximo / 5,

                font: {
                    size: compacto ? 7 : 9
                },

                callback: formatarEixoMoeda
            }
        }
    };
}


// =====================================================
// GRÁFICO MENSAL
// =====================================================

function carregarGraficoMensal(transacoes) {
    const { entradas, saidas } = obterMovimentacaoMensal(transacoes);
    criarGraficoMensal(entradas, saidas);
}

function criarGraficoMensal(entradas, saidas) {
    const canvas = document.querySelector("#graficoMensal");

    if (!canvas) {
        return;
    }

    graficoMensal?.destroy();

    const compacto = tela1024();
    const limiteMaximo = calcularLimiteMaximo([
        ...entradas,
        ...saidas
    ]);

    graficoMensal = new Chart(canvas, {
        type: "bar",

        data: {
            labels: MESES,

            datasets: [
                {
                    label: "Saída",
                    data: saidas,
                    backgroundColor: "#ff4b45",
                    borderRadius: 2
                },
                {
                    label: "Entrada",
                    data: entradas,
                    backgroundColor: "#9abd43",
                    borderRadius: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 500
            },

            layout: {
                padding: obterPaddingGrafico(compacto)
            },

            plugins: {
                datalabels: {
                    display: false
                },

                legend: {
                    position: "top",
                    align: "end",

                    labels: {
                        color: "#ffffff",
                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: compacto ? 4 : 6,
                        boxHeight: compacto ? 4 : 6,
                        padding: compacto ? 5 : 8,

                        font: {
                            size: compacto ? 9 : 15
                        }
                    }
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            const valor = Number(context.raw);

                            return (
                                context.dataset.label +
                                ": " +
                                formatarMoeda(valor)
                            );
                        }
                    }
                }
            },

            scales: obterEixosGrafico(
                limiteMaximo,
                compacto
            )
        }
    });
}


// =====================================================
// GRÁFICO DE SAÍDA
// =====================================================

function carregarGraficoSaida(transacoes) {
    const categorias = obterSaidasPorCategoria(transacoes);
    criarGraficoSaida(categorias);
}

function criarGraficoSaida(categorias) {
    const canvas = document.querySelector("#graficoSaida");

    if (!canvas) {
        return;
    }

    graficoSaida?.destroy();

    const compacto = tela1024();

    const valores = [
        categorias.Alimentacao,
        categorias.Locomocao,
        categorias.Investimento,
        categorias.Lazer,
        categorias.Educacao,
        categorias.Outros
    ];

    graficoSaida = new Chart(canvas, {
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
                    data: valores,

                    backgroundColor: [
                        "#e51b17",
                        "#e7b700",
                        "#ef7d00",
                        "#65b900",
                        "#fd00a9",
                        "#633cff"
                    ],

                    borderWidth: 0
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            layout: {
                padding: {
                    left: compacto ? 3 : 5,
                    right: compacto ? 3 : 5,
                    top: compacto ? 3 : 5,
                    bottom: compacto ? 3 : 5
                }
            },

            plugins: {
                datalabels: {
                    color: "#ffffff",

                    font: {
                        size: compacto ? 8 : 10,
                        weight: "bold"
                    },

                    formatter(valor, context) {
                        const dados =
                            context.chart.data.datasets[0].data;

                        const total = dados.reduce(
                            (soma, numero) =>
                                soma + Number(numero),
                            0
                        );

                        if (valor === 0 || total === 0) {
                            return "";
                        }

                        const porcentagem =
                            (Number(valor) / total) * 100;

                        return porcentagem.toFixed(0) + "%";
                    }
                },

                legend: {
                    position: "right",
                    align: "center",

                    labels: {
                        color: "#ffffff",
                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: compacto ? 5 : 7,
                        boxHeight: compacto ? 5 : 7,
                        padding: compacto ? 5 : 11,

                        font: {
                            size: compacto ? 9 : 16
                        }
                    }
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            const valor = Number(context.raw);
                            const dados = context.dataset.data;

                            const total = dados.reduce(
                                (soma, numero) =>
                                    soma + Number(numero),
                                0
                            );

                            const porcentagem = total > 0
                                ? ((valor / total) * 100).toFixed(1)
                                : 0;

                            return (
                                context.label +
                                ": " +
                                formatarMoeda(valor) +
                                " (" +
                                porcentagem +
                                "%)"
                            );
                        }
                    }
                }
            }
        }
    });
}


// =====================================================
// GRÁFICO DE INVESTIMENTO
// =====================================================

function carregarGraficoInvestimento(transacoes) {
    const investimentos = obterInvestimentosMensais(transacoes);
    criarGraficoInvestimento(investimentos);
}

function criarGraficoInvestimento(investimentos) {
    const canvas = document.querySelector("#graficoInvestimento");

    if (!canvas) {
        return;
    }

    graficoInvestimento?.destroy();

    const compacto = tela1024();
    const limiteMaximo = calcularLimiteMaximo(investimentos);

    graficoInvestimento = new Chart(canvas, {
        type: "bar",

        data: {
            labels: MESES,

            datasets: [
                {
                    label: "Investimento",
                    data: investimentos,
                    backgroundColor: "#020074",
                    borderRadius: 2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 500
            },

            layout: {
                padding: obterPaddingGrafico(compacto)
            },

            plugins: {
                datalabels: {
                    display: false
                },

                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            return (
                                "Investimento: " +
                                formatarMoeda(context.raw)
                            );
                        }
                    }
                }
            },

            scales: obterEixosGrafico(
                limiteMaximo,
                compacto
            )
        }
    });
}


// =====================================================
// RESIZE
// =====================================================

window.addEventListener("resize", () => {
    clearTimeout(timerResize);

    timerResize = setTimeout(() => {
        if (!transacoesCarregadas) {
            carregarDashboard();
            return;
        }

        carregarGraficoMensal(transacoesCache);
        carregarGraficoSaida(transacoesCache);
        carregarGraficoInvestimento(transacoesCache);
    }, 250);
});


// =====================================================
// MENU DE NAVEGAÇÃO
// =====================================================

function configurarMenu() {
    if (!elementos.botaoMenu || !elementos.menuPaginas) {
        return;
    }

    elementos.botaoMenu.addEventListener("click", (event) => {
        event.stopPropagation();
        elementos.menuPaginas.classList.toggle("ativo");
    });

    elementos.menuPaginas.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        elementos.menuPaginas.classList.remove("ativo");
    });
}
