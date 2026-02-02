import pool from './config/database.js';

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

    try {
        console.log('Criando tabela de usuários...');

        await pool.query(criaTabelaUsuarios);

        console.log('Tabela "users" criada com sucesso.');
    } catch (error) {
        console.error('Erro ao criar tabela de usuários:', error);
    } finally {
        await pool.end();
    }
}

configuraBancoDados();
