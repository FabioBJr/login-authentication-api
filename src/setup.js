import pool from './database/index.js';

async function configuraBancoDados() {
    const criaTabelaUsuarios = `
        CREATE table IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const adicionaColunas = `
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
        ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
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
