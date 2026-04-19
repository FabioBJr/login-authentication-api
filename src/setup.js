import pool from './database/index.js';

async function configuraBancoDados() {
    const criaTabelaUsuarios = `
        CREATE table IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const adicionaColunas = `
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
        ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP,
        ADD COLUMN IF NOT EXISTS username VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS image TEXT,
        ADD COLUMN IF NOT EXISTS access_count INT DEFAULT 0;
    `;

    const queries = [criaTabelaUsuarios, adicionaColunas];

    try {
        for (const query of queries) {
            await pool.query(query);
        }

        console.log('Banco de dados configurado com sucesso.');
    } catch (error) {
        console.error('Erro ao criar tabela de usuários:', error);
    } finally {
        await pool.end();
    }
}

configuraBancoDados();
