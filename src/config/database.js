import process from 'node:process';
import 'dotenv/config';

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    max: 5,
});

pool.on('connect', () => {
    console.log('Pg conectado.');
});

pool.on('error', (err) => {
    console.error('Erro no pg', err);
});

export default pool;
