import pool from '../../database/index.js';

class User {
    async create(email, passwordHash, salt) {
        const query = `
            INSERT INTO users (email, password_hash, salt)
            VALUES ($1, $2, $3)
            RETURNING id, email;
        `;
        const values = [email, passwordHash, salt];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }

    async update(email, passwordHash, salt) {
        const query = `
            UPDATE users SET email = $1, password_hash = $2, salt = $3
            WHERE TRIM(email) = $1
            RETURNING id, email;
        `;
        const values = [email, passwordHash, salt];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }

    async delete(email) {
        const query = `
            DELETE FROM users WHERE TRIM(email) = $1;
        `;

        await pool.query(query, [email]);
    }

    async findUser(email) {
        const query = `
            SELECT id, email, password_hash, salt FROM users WHERE TRIM(email) = $1;
        `;

        const { rows } = await pool.query(query, [email]);

        return rows[0];
    }

    async salvaResetToken(id, token, dataExpiracao) {
        const query = `
            UPDATE users
            SET password_reset_token = $1,
                password_reset_expires = $2
            WHERE id = $3
        `;

        await pool.query(query, [token, dataExpiracao, id]);
    }

    async tokenExpired(token) {
        const query = `
            SELECT password_reset_expires FROM users WHERE TRIM(password_reset_token) = $1;
        `;

        const { rows } = await pool.query(query, [token]);

        return new Date() > rows[0].password_reset_expires;
    }

    async resetPassword(token, passwordHash, salt) {
        const query = `
                UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL, password_hash = $2, salt = $3
                WHERE TRIM(password_reset_token) = $1
                RETURNING id, email;
            `;
        const values = [token, passwordHash, salt];

        const { rows } = await pool.query(query, values);

        return rows[0];
    }
}

export default new User();
