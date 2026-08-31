const express = require("express");
const pool = require("./database/db");
const dns = require("dns").promises;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const COOKIE_NAME = "dincontrol_token";
const TEMPO_TOKEN = "7d";
const TEMPO_COOKIE = 7 * 24 * 60 * 60 * 1000;


// =====================================================
// MIDDLEWARES
// =====================================================

app.use(express.json());
app.use(cookieParser());
app.use(
    express.static(
        path.join(__dirname, "..", "public")
    )
);


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function normalizarEmail(email) {
    return String(email)
        .trim()
        .toLowerCase();
}


async function validarEmail(email) {
    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
        return false;
    }

    const dominio =
        email.split("@")[1];

    if (!dominio) {
        return false;
    }

    try {
        const registrosMX =
            await dns.resolveMx(dominio);

        return registrosMX.length > 0;

    } catch (erro) {
        console.log(
            "Domínio de email inválido:",
            dominio
        );

        return false;
    }
}


function obterJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET não configurado no ambiente."
        );
    }

    return process.env.JWT_SECRET;
}


function opcoesCookie() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: TEMPO_COOKIE
    };
}


function opcoesLimparCookie() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    };
}


function criarToken(usuarioId) {
    return jwt.sign(
        {
            usuarioId: Number(usuarioId)
        },
        obterJwtSecret(),
        {
            expiresIn: TEMPO_TOKEN
        }
    );
}


function autenticarUsuario(req, res, next) {
    const token =
        req.cookies[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            erro: "Usuário não autenticado."
        });
    }

    try {
        const payload =
            jwt.verify(
                token,
                obterJwtSecret()
            );

        req.usuarioId =
            Number(payload.usuarioId);

        return next();

    } catch (erro) {
        res.clearCookie(
            COOKIE_NAME,
            opcoesLimparCookie()
        );

        return res.status(401).json({
            erro: "Sessão inválida ou expirada."
        });
    }
}


// =====================================================
// ROTA INICIAL
// =====================================================

app.get("/", (req, res) => {
    return res.redirect(
        "/login/login.html"
    );
});


// =====================================================
// CADASTRAR USUÁRIO
// =====================================================

app.post("/users", async (req, res) => {
    try {
        const {
            nome,
            email,
            senha
        } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro:
                    "Nome, email e senha são obrigatórios"
            });
        }

        if (!/^\d+$/.test(senha)) {
            return res.status(400).json({
                erro:
                    "A senha deve conter somente números."
            });
        }

        if (senha.length < 5) {
            return res.status(400).json({
                erro:
                    "A senha deve conter no mínimo 5 números."
            });
        }

        const numeros =
            senha.split("");

        const numerosUnicos =
            new Set(numeros);

        if (
            numerosUnicos.size !==
            numeros.length
        ) {
            return res.status(400).json({
                erro:
                    "A senha não pode conter números repetidos."
            });
        }

        const emailNormalizado =
            normalizarEmail(email);

        const emailValido =
            await validarEmail(
                emailNormalizado
            );

        if (!emailValido) {
            return res.status(400).json({
                erro:
                    "Digite um endereço de e-mail válido"
            });
        }

        const usuarioExistente =
            await pool.query(
                `
                SELECT id

                FROM Users

                WHERE LOWER(email) = $1
                `,
                [
                    emailNormalizado
                ]
            );

        if (
            usuarioExistente.rowCount > 0
        ) {
            return res.status(409).json({
                erro:
                    "Este e-mail já está cadastrado"
            });
        }

        const senhaHash =
            await bcrypt.hash(
                senha,
                12
            );

        const resultado =
            await pool.query(
                `
                INSERT INTO Users
                (
                    nome,
                    email,
                    senha
                )

                VALUES
                ($1, $2, $3)

                RETURNING
                    id,
                    nome,
                    email
                `,
                [
                    nome.trim(),
                    emailNormalizado,
                    senhaHash
                ]
            );

        return res.status(201).json({
            mensagem:
                "Usuário cadastrado com sucesso",

            usuario:
                resultado.rows[0]
        });

    } catch (error) {
        console.error(
            "Erro ao cadastrar usuário:",
            error
        );

        return res.status(500).json({
            erro:
                "Erro ao cadastrar usuário"
        });
    }
});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", async (req, res) => {
    try {
        const {
            email,
            senha
        } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro:
                    "Email e senha são obrigatórios"
            });
        }

        const emailNormalizado =
            normalizarEmail(email);

        const resultado =
            await pool.query(
                `
                SELECT
                    id,
                    nome,
                    email,
                    senha

                FROM Users

                WHERE LOWER(email) = $1
                `,
                [
                    emailNormalizado
                ]
            );

        if (
            resultado.rowCount === 0
        ) {
            return res.status(401).json({
                erro:
                    "E-mail ou senha incorretos"
            });
        }

        const usuario =
            resultado.rows[0];

        let senhaCorreta = false;

        const senhaJaCriptografada =
            String(usuario.senha)
                .startsWith("$2");

        if (senhaJaCriptografada) {
            senhaCorreta =
                await bcrypt.compare(
                    senha,
                    usuario.senha
                );

        } else {
            // Compatibilidade temporária
            // com contas antigas.
            senhaCorreta =
                usuario.senha === senha;

            if (senhaCorreta) {
                const senhaHash =
                    await bcrypt.hash(
                        senha,
                        12
                    );

                await pool.query(
                    `
                    UPDATE Users

                    SET senha = $1

                    WHERE id = $2
                    `,
                    [
                        senhaHash,
                        usuario.id
                    ]
                );
            }
        }

        if (!senhaCorreta) {
            return res.status(401).json({
                erro:
                    "E-mail ou senha incorretos"
            });
        }

        const token =
            criarToken(usuario.id);

        res.cookie(
            COOKIE_NAME,
            token,
            opcoesCookie()
        );

        return res.status(200).json({
            mensagem:
                "Login realizado com sucesso",

            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error(
            "Erro ao realizar login:",
            error
        );

        return res.status(500).json({
            erro:
                "Erro ao realizar login"
        });
    }
});


// =====================================================
// LOGOUT
// =====================================================

app.post("/logout", (req, res) => {
    res.clearCookie(
        COOKIE_NAME,
        opcoesLimparCookie()
    );

    return res.status(200).json({
        mensagem:
            "Logout realizado com sucesso."
    });
});


// =====================================================
// USUÁRIO LOGADO
// =====================================================

app.get(
    "/me",
    autenticarUsuario,
    async (req, res) => {
        try {
            const resultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        nome,
                        email

                    FROM Users

                    WHERE id = $1
                    `,
                    [
                        req.usuarioId
                    ]
                );

            if (
                resultado.rowCount === 0
            ) {
                res.clearCookie(
                    COOKIE_NAME,
                    opcoesLimparCookie()
                );

                return res.status(401).json({
                    erro:
                        "Usuário não encontrado."
                });
            }

            return res.status(200).json({
                usuario:
                    resultado.rows[0]
            });

        } catch (error) {
            console.error(
                "Erro ao buscar usuário logado:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao buscar usuário."
            });
        }
    }
);


// =====================================================
// ATUALIZAR USUÁRIO LOGADO
// =====================================================

app.put(
    "/me",
    autenticarUsuario,
    async (req, res) => {
        try {
            const {
                nome,
                email,
                senha
            } = req.body;

            if (
                !nome ||
                !email ||
                !senha
            ) {
                return res.status(400).json({
                    erro:
                        "Nome, email e senha são obrigatórios"
                });
            }

            const novoEmailNormalizado =
                normalizarEmail(email);

            const emailValido =
                await validarEmail(
                    novoEmailNormalizado
                );

            if (!emailValido) {
                return res.status(400).json({
                    erro:
                        "Digite um endereço de e-mail válido"
                });
            }

            const usuarioAtual =
                await pool.query(
                    `
                    SELECT
                        id,
                        senha

                    FROM Users

                    WHERE id = $1
                    `,
                    [
                        req.usuarioId
                    ]
                );

            if (
                usuarioAtual.rowCount === 0
            ) {
                return res.status(404).json({
                    erro:
                        "Usuário não encontrado"
                });
            }

            const senhaSalva =
                usuarioAtual.rows[0].senha;

            let senhaCorreta = false;

            if (
                String(senhaSalva)
                    .startsWith("$2")
            ) {
                senhaCorreta =
                    await bcrypt.compare(
                        senha,
                        senhaSalva
                    );
            } else {
                senhaCorreta =
                    senhaSalva === senha;
            }

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro:
                        "Senha incorreta."
                });
            }

            const emailExistente =
                await pool.query(
                    `
                    SELECT id

                    FROM Users

                    WHERE LOWER(email) = $1
                    AND id <> $2
                    `,
                    [
                        novoEmailNormalizado,
                        req.usuarioId
                    ]
                );

            if (
                emailExistente.rowCount > 0
            ) {
                return res.status(409).json({
                    erro:
                        "Este e-mail já está cadastrado"
                });
            }

            const resultado =
                await pool.query(
                    `
                    UPDATE Users

                    SET
                        nome = $1,
                        email = $2

                    WHERE id = $3

                    RETURNING
                        id,
                        nome,
                        email
                    `,
                    [
                        nome.trim(),
                        novoEmailNormalizado,
                        req.usuarioId
                    ]
                );

            return res.status(200).json({
                mensagem:
                    "Usuário atualizado com sucesso",

                usuario:
                    resultado.rows[0]
            });

        } catch (error) {
            console.error(
                "Erro ao atualizar usuário:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao atualizar usuário"
            });
        }
    }
);


// =====================================================
// TRANSAÇÕES
// =====================================================


// =====================================================
// BUSCAR TRANSAÇÕES DO USUÁRIO LOGADO
// =====================================================

app.get(
    "/transactions",
    autenticarUsuario,
    async (req, res) => {
        try {
            const resultado =
                await pool.query(
                    `
                    SELECT
                        id,
                        tipo,
                        valor,
                        categoria,
                        data,
                        user_id

                    FROM Transac

                    WHERE user_id = $1

                    ORDER BY data ASC
                    `,
                    [
                        req.usuarioId
                    ]
                );

            return res.status(200).json(
                resultado.rows
            );

        } catch (error) {
            console.error(
                "Erro ao buscar transações:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao buscar transações"
            });
        }
    }
);


// =====================================================
// CADASTRAR TRANSAÇÃO
// =====================================================

app.post(
    "/transactions",
    autenticarUsuario,
    async (req, res) => {
        try {
            const {
                tipo,
                valor,
                categoria
            } = req.body;

            if (
                !tipo ||
                valor === undefined ||
                !categoria
            ) {
                return res.status(400).json({
                    erro:
                        "Dados da transação incompletos"
                });
            }

            const resultado =
                await pool.query(
                    `
                    INSERT INTO Transac
                    (
                        tipo,
                        valor,
                        categoria,
                        user_id
                    )

                    VALUES
                    ($1, $2, $3, $4)

                    RETURNING
                        id,
                        tipo,
                        valor,
                        categoria,
                        data,
                        user_id
                    `,
                    [
                        tipo,
                        valor,
                        categoria,
                        req.usuarioId
                    ]
                );

            return res.status(201).json({
                mensagem:
                    "Transação cadastrada com sucesso",

                transacao:
                    resultado.rows[0]
            });

        } catch (error) {
            console.error(
                "Erro ao cadastrar transação:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao cadastrar transação"
            });
        }
    }
);


// =====================================================
// ATUALIZAR TRANSAÇÃO
// =====================================================

app.put(
    "/transactions/:id",
    autenticarUsuario,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

            const {
                tipo,
                valor,
                categoria
            } = req.body;

            if (
                !tipo ||
                valor === undefined ||
                !categoria
            ) {
                return res.status(400).json({
                    erro:
                        "Dados incompletos"
                });
            }

            const resultado =
                await pool.query(
                    `
                    UPDATE Transac

                    SET
                        tipo = $1,
                        valor = $2,
                        categoria = $3

                    WHERE id = $4
                    AND user_id = $5

                    RETURNING
                        id,
                        tipo,
                        valor,
                        categoria,
                        data,
                        user_id
                    `,
                    [
                        tipo,
                        valor,
                        categoria,
                        id,
                        req.usuarioId
                    ]
                );

            if (
                resultado.rowCount === 0
            ) {
                return res.status(404).json({
                    erro:
                        "Transação não encontrada"
                });
            }

            return res.status(200).json({
                mensagem:
                    "Transação atualizada com sucesso",

                transacao:
                    resultado.rows[0]
            });

        } catch (error) {
            console.error(
                "Erro ao atualizar transação:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao atualizar transação"
            });
        }
    }
);


// =====================================================
// EXCLUIR TRANSAÇÃO
// =====================================================

app.delete(
    "/transactions/:id",
    autenticarUsuario,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

            const resultado =
                await pool.query(
                    `
                    DELETE FROM Transac

                    WHERE id = $1
                    AND user_id = $2

                    RETURNING
                        id,
                        tipo,
                        valor,
                        categoria,
                        user_id
                    `,
                    [
                        id,
                        req.usuarioId
                    ]
                );

            if (
                resultado.rowCount === 0
            ) {
                return res.status(404).json({
                    erro:
                        "Transação não encontrada"
                });
            }

            return res.status(200).json({
                mensagem:
                    "Transação excluída com sucesso",

                transacao:
                    resultado.rows[0]
            });

        } catch (error) {
            console.error(
                "Erro ao excluir transação:",
                error
            );

            return res.status(500).json({
                erro:
                    "Erro ao excluir transação"
            });
        }
    }
);


// =====================================================
// RECUPERAÇÃO DE SENHA
// =====================================================


// =====================================================
// CONFIGURAÇÃO DO EMAIL
// =====================================================

const transporter =
    nodemailer.createTransport({
        service: "gmail",

        auth: {
            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASSWORD
        }
    });


// =====================================================
// ENVIAR CÓDIGO DE RECUPERAÇÃO
// =====================================================

app.post(
    "/forgot-password/send-code",
    async (req, res) => {
        try {
            const {
                email
            } = req.body;

            if (!email) {
                return res.status(400).json({
                    erro:
                        "Digite seu e-mail."
                });
            }

            const emailNormalizado =
                normalizarEmail(email);

            const resultadoUsuario =
                await pool.query(
                    `
                    SELECT
                        id,
                        nome,
                        email

                    FROM Users

                    WHERE LOWER(email) = $1
                    `,
                    [
                        emailNormalizado
                    ]
                );

            if (
                resultadoUsuario.rows.length === 0
            ) {
                return res.json({
                    sucesso: true,

                    mensagem:
                        "Se este e-mail estiver cadastrado, você receberá um código."
                });
            }

            const usuario =
                resultadoUsuario.rows[0];

            const codigo =
                crypto
                    .randomInt(
                        100000,
                        1000000
                    )
                    .toString();

            const codigoHash =
                crypto
                    .createHash("sha256")
                    .update(codigo)
                    .digest("hex");

            await pool.query(
                `
                DELETE FROM password_reset_codes

                WHERE user_id = $1
                `,
                [
                    usuario.id
                ]
            );

            await pool.query(
                `
                INSERT INTO password_reset_codes
                (
                    user_id,
                    codigo_hash,
                    expires_at
                )

                VALUES
                (
                    $1,
                    $2,
                    NOW() + INTERVAL '10 minutes'
                )
                `,
                [
                    usuario.id,
                    codigoHash
                ]
            );

            await transporter.sendMail({
                from:
                    `"DinControl" <${process.env.EMAIL_USER}>`,

                to:
                    usuario.email,

                subject:
                    "Código para redefinir sua senha - DinControl",

                html: `
                    <div
                        style="
                            font-family: Arial, sans-serif;
                            max-width: 500px;
                            margin: auto;
                            padding: 30px;
                        "
                    >
                        <h2 style="color: #0d6efd;">
                            DinControl
                        </h2>

                        <p>
                            Olá, ${usuario.nome}.
                        </p>

                        <p>
                            Recebemos uma solicitação
                            para redefinir sua senha.
                        </p>

                        <p>
                            Seu código de verificação é:
                        </p>

                        <div
                            style="
                                font-size: 32px;
                                font-weight: bold;
                                letter-spacing: 8px;
                                margin: 25px 0;
                                color: #0d6efd;
                            "
                        >
                            ${codigo}
                        </div>

                        <p>
                            Este código é válido por
                            <strong>10 minutos</strong>.
                        </p>

                        <p
                            style="
                                color: #777777;
                                font-size: 12px;
                            "
                        >
                            Se você não solicitou
                            a redefinição de senha,
                            ignore este e-mail.
                        </p>
                    </div>
                `
            });

            return res.status(200).json({
                sucesso: true,

                mensagem:
                    "Código enviado para o seu e-mail."
            });

        } catch (erro) {
            console.error(
                "Erro ao enviar código:",
                erro
            );

            return res.status(500).json({
                erro:
                    "Erro ao enviar código."
            });
        }
    }
);


// =====================================================
// VERIFICAR CÓDIGO
// =====================================================

app.post(
    "/forgot-password/verify-code",
    async (req, res) => {
        try {
            const {
                email,
                codigo
            } = req.body;

            if (!email || !codigo) {
                return res.status(400).json({
                    erro:
                        "Informe o e-mail e o código."
                });
            }

            const emailNormalizado =
                normalizarEmail(email);

            const resultadoUsuario =
                await pool.query(
                    `
                    SELECT id

                    FROM Users

                    WHERE LOWER(email) = $1
                    `,
                    [
                        emailNormalizado
                    ]
                );

            if (
                resultadoUsuario.rowCount === 0
            ) {
                return res.status(400).json({
                    erro:
                        "Código inválido ou expirado."
                });
            }

            const usuarioId =
                resultadoUsuario.rows[0].id;

            const codigoDigitado =
                String(codigo).trim();

            if (
                !/^\d{6}$/.test(
                    codigoDigitado
                )
            ) {
                return res.status(400).json({
                    erro:
                        "O código deve possuir 6 números."
                });
            }

            const codigoHash =
                crypto
                    .createHash("sha256")
                    .update(codigoDigitado)
                    .digest("hex");

            const resultadoCodigo =
                await pool.query(
                    `
                    SELECT id

                    FROM password_reset_codes

                    WHERE user_id = $1
                    AND codigo_hash = $2
                    AND expires_at > NOW()
                    AND verificado = FALSE

                    ORDER BY created_at DESC

                    LIMIT 1
                    `,
                    [
                        usuarioId,
                        codigoHash
                    ]
                );

            if (
                resultadoCodigo.rowCount === 0
            ) {
                return res.status(400).json({
                    erro:
                        "Código inválido ou expirado."
                });
            }

            const codigoId =
                resultadoCodigo.rows[0].id;

            const resetToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");

            const resetTokenHash =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");

            await pool.query(
                `
                UPDATE password_reset_codes

                SET
                    verificado = TRUE,
                    reset_token_hash = $1,
                    reset_expires_at =
                        NOW() + INTERVAL '10 minutes'

                WHERE id = $2
                `,
                [
                    resetTokenHash,
                    codigoId
                ]
            );

            return res.status(200).json({
                sucesso: true,

                mensagem:
                    "Código verificado com sucesso.",

                resetToken:
                    resetToken
            });

        } catch (erro) {
            console.error(
                "Erro ao verificar código:",
                erro
            );

            return res.status(500).json({
                erro:
                    "Erro ao verificar código."
            });
        }
    }
);


// =====================================================
// REDEFINIR SENHA
// =====================================================

app.post(
    "/forgot-password/reset-password",
    async (req, res) => {
        try {
            const {
                email,
                resetToken,
                novaSenha
            } = req.body;

            if (
                !email ||
                !resetToken ||
                !novaSenha
            ) {
                return res.status(400).json({
                    erro:
                        "Dados incompletos."
                });
            }

            if (!/^\d+$/.test(novaSenha)) {
                return res.status(400).json({
                    erro:
                        "A senha deve conter somente números."
                });
            }

            if (novaSenha.length < 5) {
                return res.status(400).json({
                    erro:
                        "A senha deve conter no mínimo 5 números."
                });
            }

            const numeros =
                novaSenha.split("");

            const numerosUnicos =
                new Set(numeros);

            if (
                numerosUnicos.size !==
                numeros.length
            ) {
                return res.status(400).json({
                    erro:
                        "A senha não pode conter números repetidos."
                });
            }

            const emailNormalizado =
                normalizarEmail(email);

            const resultadoUsuario =
                await pool.query(
                    `
                    SELECT id

                    FROM Users

                    WHERE LOWER(email) = $1
                    `,
                    [
                        emailNormalizado
                    ]
                );

            if (
                resultadoUsuario.rowCount === 0
            ) {
                return res.status(400).json({
                    erro:
                        "Solicitação inválida."
                });
            }

            const usuarioId =
                resultadoUsuario.rows[0].id;

            const tokenHash =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");

            const resultadoToken =
                await pool.query(
                    `
                    SELECT id

                    FROM password_reset_codes

                    WHERE user_id = $1
                    AND reset_token_hash = $2
                    AND reset_expires_at > NOW()
                    AND verificado = TRUE

                    ORDER BY created_at DESC

                    LIMIT 1
                    `,
                    [
                        usuarioId,
                        tokenHash
                    ]
                );

            if (
                resultadoToken.rowCount === 0
            ) {
                return res.status(400).json({
                    erro:
                        "Sua autorização expirou. Solicite um novo código."
                });
            }

            const novaSenhaHash =
                await bcrypt.hash(
                    novaSenha,
                    12
                );

            await pool.query(
                `
                UPDATE Users

                SET senha = $1

                WHERE id = $2
                `,
                [
                    novaSenhaHash,
                    usuarioId
                ]
            );

            await pool.query(
                `
                DELETE FROM password_reset_codes

                WHERE user_id = $1
                `,
                [
                    usuarioId
                ]
            );

            return res.status(200).json({
                sucesso: true,

                mensagem:
                    "Senha redefinida com sucesso."
            });

        } catch (erro) {
            console.error(
                "Erro ao redefinir senha:",
                erro
            );

            return res.status(500).json({
                erro:
                    "Erro ao redefinir senha."
            });
        }
    }
);


// =====================================================
// PORTA
// =====================================================

const PORT =
    process.env.PORT || 3000;


// =====================================================
// INICIA LOCALMENTE
// =====================================================

if (require.main === module) {
    app.listen(
        PORT,
        "0.0.0.0",
        () => {
            console.log(
                `Servidor rodando na porta ${PORT}`
            );
        }
    );
}


// =====================================================
// EXPORTA PARA VERCEL
// =====================================================

module.exports = app;
