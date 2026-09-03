// =====================================================
// USUÁRIO
// =====================================================

let usuarioAtual = null;
let usuarioId = null;


// =====================================================
// ELEMENTOS
// =====================================================

const nomeUsuario = document.getElementById("nomeUsuario");
const fotoPerfilHistorico = document.getElementById("fotoPerfilHistorico");

const listaTransacoes = document.getElementById("listaTransacoes");
const semTransacoes = document.getElementById("semTransacoes");

const resumoEntrada = document.getElementById("resumoEntrada");
const resumoSaida = document.getElementById("resumoSaida");
const resumoSaldo = document.getElementById("resumoSaldo");

const filtroTipo = document.getElementById("filtroTipo");
const filtroMes = document.getElementById("filtroMes");
const filtroCategoria = document.getElementById("filtroCategoria");

const botaoMenu = document.getElementById("botaoMenu");
const menuPaginas = document.getElementById("menuPaginas");
const botaoPerfil = document.getElementById("botaoPerfil");


// =====================================================
// ESTADO
// =====================================================

let transacoes = [];


// =====================================================
// USUÁRIO / PERFIL
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

        nomeUsuario.textContent =
            usuarioAtual.nome;

        const fotoSalva =
            localStorage.getItem(
                `fotoPerfil_${usuarioId}`
            );

        if (fotoSalva) {
            fotoPerfilHistorico.src =
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

botaoPerfil.addEventListener("click", () => {
    window.location.href =
        "/Perfil/perfil.html";
});


// =====================================================
// MENU
// =====================================================

botaoMenu.addEventListener("click", (event) => {
    event.stopPropagation();

    menuPaginas.classList.toggle("ativo");
});

menuPaginas.addEventListener("click", (event) => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    menuPaginas.classList.remove("ativo");
});


// =====================================================
// FORMATAÇÃO
// =====================================================

function formatarDinheiro(valor) {
    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

function normalizarTipo(tipo) {
    return String(tipo || "")
        .trim()
        .toLowerCase();
}

function nomeTipo(tipo) {
    const tipoNormalizado = normalizarTipo(tipo);

    if (tipoNormalizado === "entrada") {
        return "Entrada";
    }

    if (
        tipoNormalizado === "saida" ||
        tipoNormalizado === "saída"
    ) {
        return "Saída";
    }

    return tipo;
}

function formatarCategoria(categoria) {
    const categorias = {
        Salario: "Salário",
        Alimentacao: "Alimentação",
        Locomocao: "Locomoção",
        Educacao: "Educação",
        Investimento: "Investimento",
        Lazer: "Lazer",
        Outros: "Outros"
    };

    return categorias[categoria]
        || categoria
        || "Sem categoria";
}


// =====================================================
// DATA E HORÁRIO
// =====================================================

function converterData(data) {
    return new Date(data);
}

function inicioDoDia(data) {
    const novaData = new Date(data);

    novaData.setHours(
        0,
        0,
        0,
        0
    );

    return novaData;
}

function tituloDaData(data) {
    const dataTransacao = inicioDoDia(data);
    const hoje = inicioDoDia(new Date());

    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (
        dataTransacao.getTime() ===
        hoje.getTime()
    ) {
        return "Hoje";
    }

    if (
        dataTransacao.getTime() ===
        ontem.getTime()
    ) {
        return "Ontem";
    }

    return dataTransacao.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function chaveData(data) {
    const d = new Date(data);

    return [
        d.getFullYear(),

        String(
            d.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");
}

function formatarHorario(data) {
    return new Date(data).toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =====================================================
// BUSCAR TRANSAÇÕES
// =====================================================

async function carregarTransacoes() {
    try {
        const resposta = await fetch(
            "/transactions",
            {
                credentials: "same-origin"
            }
        );

        if (resposta.status === 401) {
            window.location.href =
                "/login/login.html";

            return;
        }

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar transações"
            );
        }

        transacoes = await resposta.json();

        transacoes.sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        );

        montarCategorias();
        selecionarMesAtual();
        aplicarFiltros();

    } catch (erro) {
        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        listaTransacoes.innerHTML = "";

        semTransacoes.style.display =
            "block";

        semTransacoes.textContent =
            "Erro ao carregar o histórico.";
    }
}


// =====================================================
// FILTROS
// =====================================================

function selecionarMesAtual() {
    const mesAtual = new Date().getMonth();

    filtroMes.value = String(mesAtual);
}

function montarCategorias() {
    const categoriaSelecionada =
        filtroCategoria.value || "todos";

    const categorias = [
        ...new Set(
            transacoes
                .map(
                    transacao =>
                        transacao.categoria
                )
                .filter(Boolean)
        )
    ];

    categorias.sort();

    filtroCategoria.innerHTML = `
        <option value="todos">
            Categoria
        </option>
    `;

    categorias.forEach(categoria => {
        const option =
            document.createElement("option");

        option.value = categoria;

        option.textContent =
            formatarCategoria(categoria);

        filtroCategoria.appendChild(option);
    });

    if (categorias.includes(categoriaSelecionada)) {
        filtroCategoria.value = categoriaSelecionada;
    }
}

function aplicarFiltros() {
    const tipo = filtroTipo.value;
    const mes = filtroMes.value;
    const categoria = filtroCategoria.value;

    const filtradas = transacoes.filter(
        transacao => {
            const data = converterData(
                transacao.data
            );

            const tipoTransacao =
                normalizarTipo(
                    transacao.tipo
                );

            if (
                tipo !== "todos" &&
                tipoTransacao !== tipo
            ) {
                return false;
            }

            if (
                mes !== "todos" &&
                data.getMonth() !== Number(mes)
            ) {
                return false;
            }

            if (
                categoria !== "todos" &&
                transacao.categoria !== categoria
            ) {
                return false;
            }

            return true;
        }
    );

    atualizarResumo(filtradas);
    renderizarHistorico(filtradas);
}


// =====================================================
// RESUMO
// =====================================================

function atualizarResumo(transacoesFiltradas) {
    let entrada = 0;
    let saida = 0;

    transacoesFiltradas.forEach(transacao => {
        const valor = Number(transacao.valor);
        const tipo = normalizarTipo(
            transacao.tipo
        );

        if (tipo === "entrada") {
            entrada += valor;
        }

        if (
            tipo === "saida" ||
            tipo === "saída"
        ) {
            saida += valor;
        }
    });

    const saldo = entrada - saida;

    resumoEntrada.textContent =
        formatarDinheiro(entrada);

    resumoSaida.textContent =
        formatarDinheiro(saida);

    resumoSaldo.textContent =
        formatarDinheiro(saldo);

    resumoSaldo.style.color =
        saldo >= 0
            ? "#00ff26"
            : "#ff0000";
}


// =====================================================
// RENDERIZAR HISTÓRICO
// =====================================================

function renderizarHistorico(transacoesFiltradas) {
    listaTransacoes.innerHTML = "";

    if (transacoesFiltradas.length === 0) {
        semTransacoes.style.display =
            "block";

        return;
    }

    semTransacoes.style.display =
        "none";

    const grupos = {};

    transacoesFiltradas.forEach(transacao => {
        const chave = chaveData(
            transacao.data
        );

        if (!grupos[chave]) {
            grupos[chave] = [];
        }

        grupos[chave].push(transacao);
    });

    Object.keys(grupos)
        .sort()
        .reverse()
        .forEach(chave => {
            const grupo =
                document.createElement("div");

            grupo.className = "grupo-data";

            const primeira = grupos[chave][0];

            const titulo =
                document.createElement("div");

            titulo.className = "titulo-data";

            titulo.textContent =
                tituloDaData(
                    primeira.data
                );

            grupo.appendChild(titulo);

            grupos[chave]
                .sort(
                    (a, b) =>
                        new Date(b.data) -
                        new Date(a.data)
                )
                .forEach(transacao => {
                    grupo.appendChild(
                        criarLinha(transacao)
                    );
                });

            listaTransacoes.appendChild(grupo);
        });
}


// =====================================================
// CRIAR LINHA
// =====================================================

function criarLinha(transacao) {
    const linha =
        document.createElement("div");

    linha.className = "linha-historico";

    const tipo = normalizarTipo(
        transacao.tipo
    );

    const entrada = tipo === "entrada";

    const sinal = entrada
        ? "+"
        : "-";

    const classe = entrada
        ? "entrada"
        : "saida";

    linha.innerHTML = `
        <span
            class="
                valor-transacao
                ${classe}
            "
        >
            ${sinal}${formatarDinheiro(
                transacao.valor
            )}
        </span>

        <span>
            ${nomeTipo(
                transacao.tipo
            )}
        </span>

        <span>
            ${formatarCategoria(
                transacao.categoria
            )}
        </span>

        <span>
            ${formatarHorario(
                transacao.data
            )}
        </span>
    `;

    linha.appendChild(
        criarBotaoExcluir(transacao)
    );

    return linha;
}


// =====================================================
// EXCLUIR TRANSAÇÃO
// =====================================================

function criarBotaoExcluir(transacao) {
    const botao =
        document.createElement("button");

    botao.type = "button";
    botao.className = "botao-excluir-transacao";
    botao.setAttribute(
        "aria-label",
        "Excluir transação"
    );

    botao.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7h16" stroke-linecap="round" />
            <path d="M9 7V4h6v3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 11v6M14 11v6" stroke-linecap="round" />
        </svg>
    `;

    botao.addEventListener("click", (event) => {
        event.stopPropagation();
        excluirTransacao(transacao.id);
    });

    return botao;
}

async function excluirTransacao(id) {
    const confirmado = confirm(
        "Tem certeza que deseja excluir esta transação?"
    );

    if (!confirmado) {
        return;
    }

    try {
        const resposta = await fetch(
            `/transactions/${id}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );

        if (resposta.status === 401) {
            window.location.href =
                "/login/login.html";

            return;
        }

        const resultado =
            await resposta.json();

        if (!resposta.ok) {
            alert(
                resultado.erro ||
                "Erro ao excluir transação."
            );

            return;
        }

        transacoes = transacoes.filter(
            (transacao) =>
                transacao.id !== id
        );

        montarCategorias();
        aplicarFiltros();

    } catch (erro) {
        console.error(
            "Erro ao excluir transação:",
            erro
        );

        alert(
            "Erro ao conectar com o servidor."
        );
    }
}


// =====================================================
// EVENTOS DOS FILTROS
// =====================================================

filtroTipo.addEventListener(
    "change",
    aplicarFiltros
);

filtroMes.addEventListener(
    "change",
    aplicarFiltros
);

filtroCategoria.addEventListener(
    "change",
    aplicarFiltros
);


// =====================================================
// LOADING
// =====================================================

window.addEventListener("load", () => {
    const loading =
        document.getElementById(
            "loading-screen"
        );

    if (loading) {
        loading.style.display = "none";
    }
});


// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function inicializarHistorico() {
    const autenticado =
        await carregarUsuario();

    if (!autenticado) {
        return;
    }

    await carregarTransacoes();
}

inicializarHistorico();
