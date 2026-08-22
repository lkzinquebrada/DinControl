const express = require("express");
const pool = require("./database/db");

const app = express();

app.use(express.json());

app.use(express.static("Inicio"));


// ========================================
// USUÁRIOS
// ========================================


// BUSCAR USUÁRIOS
app.get("/users", async (req, res) => {

    try {

        const resultado = await pool.query(
            "SELECT id, nome, email FROM Users"
        );

        res.status(200).json(resultado.rows);

    } catch (error) {

        console.error(
            "Erro ao buscar usuários:",
            error
        );

        res.status(500).json({
            erro: "Erro ao buscar usuários"
        });

    }

});


// CADASTRAR USUÁRIO
app.post("/users", async (req, res) => {

    try {

        const { nome, email, senha } = req.body;


        if (!nome || !email || !senha) {

            return res.status(400).json({
                erro: "Nome, email e senha são obrigatórios"
            });

        }


        const resultado = await pool.query(

            `
            INSERT INTO Users
            (nome, email, senha)

            VALUES ($1, $2, $3)

            RETURNING
                id,
                nome,
                email
            `,

            [
                nome,
                email,
                senha
            ]

        );


        res.status(201).json({

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


        res.status(500).json({
            erro: "Erro ao cadastrar usuário"
        });

    }

});


// ATUALIZAR USUÁRIO
app.put("/users/:emailAtual", async (req, res) => {

    try {

        const { emailAtual } = req.params;

        const {
            nome,
            email,
            senha
        } = req.body;


        if (!nome || !email || !senha) {

            return res.status(400).json({
                erro: "Nome, email e senha são obrigatórios"
            });

        }


        const resultado = await pool.query(

            `
            UPDATE Users

            SET
                nome = $1,
                email = $2,
                senha = $3

            WHERE email = $4

            RETURNING
                id,
                nome,
                email
            `,

            [
                nome,
                email,
                senha,
                emailAtual
            ]

        );


        if (resultado.rowCount === 0) {

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }


        res.status(200).json({

            mensagem:
                "Usuário atualizado com sucesso",

            usuario:
                resultado.rows[0]

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            erro: "Erro ao atualizar usuário"
        });

    }

});


// EXCLUIR USUÁRIO
app.delete("/users/:email", async (req, res) => {

    try {

        const { email } = req.params;


        const resultado = await pool.query(

            `
            DELETE FROM Users

            WHERE email = $1

            RETURNING
                id,
                nome,
                email
            `,

            [email]

        );


        if (resultado.rowCount === 0) {

            return res.status(404).json({
                erro: "Usuário não encontrado"
            });

        }


        res.status(200).json({

            mensagem:
                "Usuário excluído com sucesso",

            usuario:
                resultado.rows[0]

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            erro: "Erro ao excluir usuário"
        });

    }

});



// ========================================
// LOGIN
// ========================================

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;


        if (!email || !senha) {

            return res.status(400).json({
                erro: "Email e senha são obrigatórios"
            });

        }


        const resultado = await pool.query(

            `
            SELECT
                id,
                nome,
                email,
                senha

            FROM Users

            WHERE email = $1
            `,

            [email]

        );


        if (resultado.rowCount === 0) {

            return res.status(401).json({
                erro: "E-mail ou senha incorretos"
            });

        }


        const usuario =
            resultado.rows[0];


        if (usuario.senha !== senha) {

            return res.status(401).json({
                erro: "E-mail ou senha incorretos"
            });

        }


        res.status(200).json({

            mensagem:
                "Login realizado com sucesso",

            usuario: {

                id: usuario.id,

                nome: usuario.nome,

                email: usuario.email

            }

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            erro: "Erro ao realizar login"
        });

    }

});



// ========================================
// TRANSAÇÕES
// ========================================


// BUSCAR TRANSAÇÕES DE UM USUÁRIO
app.get(
    "/transactions/:userId",
    async (req, res) => {

        try {

            const { userId } =
                req.params;


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

                    [userId]

                );


            res.status(200).json(
                resultado.rows
            );


        } catch (error) {

            console.error(
                "Erro ao buscar transações:",
                error
            );


            res.status(500).json({
                erro: "Erro ao buscar transações"
            });

        }

    }
);


// CADASTRAR TRANSAÇÃO
app.post("/transactions", async (req, res) => {

    try {

        const {
            tipo,
            valor,
            categoria,
            user_id
        } = req.body;


        if (
            !tipo ||
            valor === undefined ||
            !categoria ||
            !user_id
        ) {

            return res.status(400).json({
                erro: "Dados da transação incompletos"
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
                    user_id
                ]

            );


        res.status(201).json({

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


        res.status(500).json({
            erro: "Erro ao cadastrar transação"
        });

    }

});


// ATUALIZAR TRANSAÇÃO
app.put("/transactions/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            tipo,
            valor,
            categoria,
            user_id
        } = req.body;


        if (
            !tipo ||
            valor === undefined ||
            !categoria ||
            !user_id
        ) {

            return res.status(400).json({
                erro: "Dados incompletos"
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
                    user_id
                ]

            );


        if (resultado.rowCount === 0) {

            return res.status(404).json({
                erro: "Transação não encontrada"
            });

        }


        res.status(200).json({

            mensagem:
                "Transação atualizada com sucesso",

            transacao:
                resultado.rows[0]

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            erro: "Erro ao atualizar transação"
        });

    }

});


// EXCLUIR TRANSAÇÃO
app.delete(
    "/transactions/:id/:userId",
    async (req, res) => {

        try {

            const {
                id,
                userId
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
                        userId
                    ]

                );


            if (resultado.rowCount === 0) {

                return res.status(404).json({
                    erro: "Transação não encontrada"
                });

            }


            res.status(200).json({

                mensagem:
                    "Transação excluída com sucesso",

                transacao:
                    resultado.rows[0]

            });


        } catch (error) {

            console.error(error);


            res.status(500).json({
                erro: "Erro ao excluir transação"
            });

        }

    }
);



// ========================================
// SERVIDOR
// ========================================

app.listen(3000, () => {

    console.log(
        "Servidor rodando na porta 3000"
    );

});