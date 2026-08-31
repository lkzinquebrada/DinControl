const { Pool } = require("pg");

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL,

    max: 3,

    connectionTimeoutMillis:
        5000,

    idleTimeoutMillis:
        10000
});

module.exports = pool;