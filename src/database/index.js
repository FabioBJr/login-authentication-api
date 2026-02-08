import config from '../config/database.js';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: config.port,
    max: 5,
});

pool.on('connect', () => {
    console.log('Pg conectado.');
});

pool.on('error', (err) => {
    console.error('Erro no pg', err);
});

export default pool;
